-- ============================================================
-- Migration: Server-Side Filtering (Phase 4A / 4B)
-- Date: 2026-07-30
--
-- Creates the filter_products RPC.
-- Filters are applied entirely in PostgreSQL.
-- The RPC returns JSONB to avoid SETOF issues with CASE-based
-- dynamic ORDER BY. The service layer maps the result.
-- ============================================================

CREATE OR REPLACE FUNCTION public.filter_products(
  p_category TEXT DEFAULT 'All',
  p_filters JSONB DEFAULT '{}'::jsonb,
  p_price_max NUMERIC DEFAULT NULL,
  p_sort TEXT DEFAULT 'newest',
  p_limit INT DEFAULT 20,
  p_offset INT DEFAULT 0
)
RETURNS JSONB AS $$
DECLARE
  v_result JSONB;
BEGIN
  SELECT COALESCE(jsonb_agg(row_data), '[]'::jsonb) INTO v_result
  FROM (
    SELECT to_jsonb(p.*) AS row_data
    FROM products p
    WHERE p.is_active = true
      AND (p_category = 'All' OR p.category = p_category)
      AND (
        p_price_max IS NULL
        OR (p.price * (1.0 - COALESCE(p.discount_percent, 0) / 100.0)) <= p_price_max
      )
      AND (
        -- No filters passed → return all
        p_filters IS NULL OR p_filters = '{}'::jsonb
        OR (
          -- Brand check (product-level)
          (
            NOT (p_filters ? 'Brand')
            OR p.brand IN (SELECT jsonb_array_elements_text(p_filters->'Brand'))
          )
          AND
          -- Dynamic EAV attribute check (variant-level)
          (
            -- Skip if no non-Brand filters
            NOT EXISTS (SELECT 1 FROM jsonb_object_keys(p_filters - 'Brand'))
            OR EXISTS (
              SELECT 1
              FROM product_variants v
              WHERE v.product_id = p.id
                AND v.is_active = true
                AND (
                  -- Count how many filter keys match this variant
                  SELECT COUNT(*)
                  FROM jsonb_each(p_filters - 'Brand') AS f(key, val)
                  WHERE EXISTS (
                    SELECT 1
                    FROM variant_attribute_values vav
                    JOIN attributes a  ON a.id = vav.attribute_id
                    JOIN attribute_values av ON av.id = vav.attribute_value_id
                    WHERE vav.variant_id = v.id
                      AND a.name = f.key
                      AND av.value IN (SELECT jsonb_array_elements_text(f.val))
                  )
                ) = (SELECT COUNT(*) FROM jsonb_object_keys(p_filters - 'Brand'))
            )
          )
        )
      )
    ORDER BY
      CASE p_sort
        WHEN 'price-asc'      THEN p.price * (1.0 - COALESCE(p.discount_percent, 0) / 100.0)
        WHEN 'price-desc'     THEN -(p.price * (1.0 - COALESCE(p.discount_percent, 0) / 100.0))
        WHEN 'highest-rated'  THEN -COALESCE(p.rating, 0)
        WHEN 'best-selling'   THEN -COALESCE(p.rating, 0)
        ELSE NULL
      END ASC NULLS LAST,
      p.created_at DESC
    LIMIT p_limit
    OFFSET p_offset
  ) q;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER;

-- Allow unauthenticated (storefront) and authenticated (admin preview) access
GRANT EXECUTE ON FUNCTION public.filter_products(TEXT, JSONB, NUMERIC, TEXT, INT, INT)
  TO anon, authenticated;

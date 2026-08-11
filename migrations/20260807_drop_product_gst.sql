-- ============================================================
-- Migration: Drop product gst_rate and update dependent RPCs
-- Date: 2026-08-07
-- ============================================================

-- ─── Step 1: Replace filter_products_v2 — remove gst_rate ───────────────
CREATE OR REPLACE FUNCTION public.filter_products_v2(
  p_search           TEXT    DEFAULT NULL,
  p_category         TEXT    DEFAULT 'All',
  p_filters          JSONB   DEFAULT '{}'::jsonb,
  p_price_max        NUMERIC DEFAULT NULL,
  p_sort             TEXT    DEFAULT 'relevance',
  p_limit            INT     DEFAULT 20,
  p_offset           INT     DEFAULT 0,
  p_subcategory_name TEXT    DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
DECLARE
  v_start_ms  BIGINT;
  v_result    JSONB;
  v_tsquery   tsquery;
BEGIN
  v_start_ms := (EXTRACT(EPOCH FROM clock_timestamp()) * 1000)::BIGINT;

  IF p_search IS NOT NULL AND trim(p_search) <> '' THEN
    BEGIN
      v_tsquery := plainto_tsquery('english', p_search);
    EXCEPTION WHEN others THEN
      v_tsquery := NULL;
    END;
  END IF;

  WITH
  matched_products AS (
    SELECT
      p.id,
      p.name,
      p.brand,
      p.category,
      p.description,
      p.price,
      p.discount_percent,
      p.rating,
      p.review_count,
      p.images,
      p.color,
      p.size,
      p.sku,
      p.tags,
      p.created_at,
      p.hsn_code,
      p.is_active,
      p.updated_at,
      p.nav_node_id,
      CASE
        WHEN v_tsquery IS NOT NULL THEN ts_rank(p.search_vector, v_tsquery)
        ELSE 0.0
      END AS _rank
    FROM public.products p
    WHERE
      p.is_active = true
      AND (
        v_tsquery IS NULL
        OR p.search_vector @@ v_tsquery
      )
      AND (p_category = 'All' OR p.category = p_category)
      AND (
        p_price_max IS NULL
        OR (p.price * (1.0 - COALESCE(p.discount_percent, 0) / 100.0)) <= p_price_max
      )
      AND (
        NOT (p_filters ? 'Brand')
        OR p.brand IN (SELECT jsonb_array_elements_text(p_filters->'Brand'))
      )
      AND (
        NOT EXISTS (SELECT 1 FROM jsonb_object_keys(p_filters - 'Brand'))
        OR EXISTS (
          SELECT 1
          FROM public.product_variants v
          WHERE v.product_id = p.id
            AND v.is_active = true
            AND (
              (
                SELECT COUNT(*)
                FROM jsonb_each(p_filters - 'Brand') AS f(key, val)
                WHERE EXISTS (
                  SELECT 1
                  FROM public.variant_attribute_values vav
                  JOIN public.attributes  a  ON a.id  = vav.attribute_id
                  JOIN public.attribute_values av ON av.id = vav.attribute_value_id
                  WHERE vav.variant_id = v.id
                    AND a.name  = f.key
                    AND av.value IN (SELECT jsonb_array_elements_text(f.val))
                )
              ) = (SELECT COUNT(*) FROM jsonb_object_keys(p_filters - 'Brand'))
            )
        )
      )
  ),
  total_count AS (
    SELECT COUNT(*)::INT AS cnt FROM matched_products
  ),
  facet_data AS (
    SELECT
      jsonb_object_agg(attr_name, vals) AS facets
    FROM (
      SELECT
        a.name AS attr_name,
        jsonb_agg(DISTINCT av.value ORDER BY av.value) AS vals
      FROM matched_products mp
      JOIN public.product_variants      v   ON v.product_id   = mp.id AND v.is_active = true
      JOIN public.variant_attribute_values vav ON vav.variant_id = v.id
      JOIN public.attributes             a   ON a.id           = vav.attribute_id
      JOIN public.attribute_values       av  ON av.id          = vav.attribute_value_id
      GROUP BY a.name
      UNION ALL
      SELECT
        'Brand' AS attr_name,
        jsonb_agg(DISTINCT brand ORDER BY brand) AS vals
      FROM matched_products
      WHERE brand IS NOT NULL AND brand <> ''
    ) sub
  ),
  paginated AS (
    SELECT
      mp.id, mp.name, mp.brand, mp.category, mp.description, mp.price,
      mp.discount_percent, mp.rating, mp.review_count, mp.images, mp.color,
      mp.size, mp.sku, mp.tags, mp.created_at, mp.hsn_code,
      mp.is_active, mp.updated_at, mp.nav_node_id, mp._rank
    FROM matched_products mp
    ORDER BY
      CASE p_sort
        WHEN 'relevance'    THEN -mp._rank
        WHEN 'price-asc'    THEN mp.price * (1.0 - COALESCE(mp.discount_percent, 0) / 100.0)
        WHEN 'price-desc'   THEN -(mp.price * (1.0 - COALESCE(mp.discount_percent, 0) / 100.0))
        WHEN 'highest-rated' THEN -COALESCE(mp.rating, 0)
        WHEN 'best-selling' THEN -COALESCE(mp.rating, 0)
        ELSE NULL
      END ASC NULLS LAST,
      mp.created_at DESC
    LIMIT  p_limit
    OFFSET p_offset
  )
  SELECT jsonb_build_object(
    'products',    COALESCE((SELECT jsonb_agg(to_jsonb(p.*) - '_rank') FROM paginated p), '[]'::jsonb),
    'facets',      COALESCE((SELECT facets FROM facet_data), '{}'::jsonb),
    'totalCount',  (SELECT cnt FROM total_count),
    'hasNextPage', (p_offset + p_limit) < (SELECT cnt FROM total_count),
    'executionTimeMs', (EXTRACT(EPOCH FROM clock_timestamp()) * 1000)::BIGINT - v_start_ms
  ) INTO v_result;

  RETURN v_result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.filter_products_v2(TEXT, TEXT, JSONB, NUMERIC, TEXT, INT, INT, TEXT)
  TO anon, authenticated;


-- ─── Step 2: Drop gst_rate from products ───────────────
ALTER TABLE public.products DROP COLUMN IF EXISTS gst_rate;

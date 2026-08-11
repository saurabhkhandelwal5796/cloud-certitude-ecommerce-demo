-- ============================================================
-- Migration: Subcategory Filters (Phase 7B)
-- Date: 2026-07-30
--
-- 1. Updates filter_products (V1) and filter_products_v2 to
--    accept p_subcategory_name TEXT DEFAULT NULL.
-- 2. Uses ILIKE REPLACE() to map URL slugs to DB names.
-- 3. Creates an index on products(subcategory_id) for speed.
-- ============================================================

-- ─── 1. Subcategory Index ────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_products_subcategory ON public.products(subcategory_id);

-- ─── 2. Update filter_products (V1) ──────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.filter_products(
  p_category         TEXT    DEFAULT 'All',
  p_filters          JSONB   DEFAULT '{}'::jsonb,
  p_price_max        NUMERIC DEFAULT NULL,
  p_sort             TEXT    DEFAULT 'newest',
  p_limit            INT     DEFAULT 20,
  p_offset           INT     DEFAULT 0,
  p_subcategory_name TEXT    DEFAULT NULL
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
        p_subcategory_name IS NULL 
        OR p.subcategory_id IN (
           SELECT id FROM subcategories 
           WHERE name ILIKE REPLACE(p_subcategory_name, '-', ' ')
        )
      )
      AND (
        p_price_max IS NULL
        OR (p.price * (1.0 - COALESCE(p.discount_percent, 0) / 100.0)) <= p_price_max
      )
      AND (
        p_filters IS NULL OR p_filters = '{}'::jsonb
        OR (
          (
            NOT (p_filters ? 'Brand')
            OR p.brand IN (SELECT jsonb_array_elements_text(p_filters->'Brand'))
          )
          AND
          (
            NOT EXISTS (SELECT 1 FROM jsonb_object_keys(p_filters - 'Brand'))
            OR EXISTS (
              SELECT 1
              FROM product_variants v
              WHERE v.product_id = p.id
                AND v.is_active = true
                AND (
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

-- ─── 3. Update filter_products_v2 (V2) ───────────────────────────────────────
CREATE OR REPLACE FUNCTION public.filter_products_v2(
  p_search           TEXT    DEFAULT NULL,
  p_category         TEXT    DEFAULT 'All',
  p_filters          JSONB   DEFAULT '{}'::jsonb,
  p_price_max        NUMERIC DEFAULT NULL,
  p_sort             TEXT    DEFAULT 'newest',
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
  v_end_ms    BIGINT;
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
      p.subcategory_id,
      p.gst_rate,
      p.hsn_code,
      p.is_active,
      p.updated_at,
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
        p_subcategory_name IS NULL 
        OR p.subcategory_id IN (
           SELECT id FROM subcategories 
           WHERE name ILIKE REPLACE(p_subcategory_name, '-', ' ')
        )
      )
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
      mp.id,
      mp.name,
      mp.brand,
      mp.category,
      mp.description,
      mp.price,
      mp.discount_percent,
      mp.rating,
      mp.review_count,
      mp.images,
      mp.color,
      mp.size,
      mp.sku,
      mp.tags,
      mp.created_at,
      mp.subcategory_id,
      mp.gst_rate,
      mp.hsn_code,
      mp.is_active,
      mp.updated_at,
      mp._rank
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

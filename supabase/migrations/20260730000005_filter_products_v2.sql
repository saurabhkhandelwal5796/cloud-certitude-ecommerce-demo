-- ============================================================
-- Migration: filter_products_v2 — Unified Search + Facets RPC
-- Date: 2026-07-30
--
-- This migration:
--   1. Adds a search_vector STORED generated column to products.
--   2. Creates a GIN index on search_vector.
--   3. Creates the filter_products_v2 RPC that returns products,
--      facets, totalCount, hasNextPage, and executionTimeMs in a
--      SINGLE database query using CTEs.
--
-- DOES NOT TOUCH:
--   - filter_products (v1)
--   - checkout_order_atomic
--   - restore_inventory_atomic
--   - Any existing RLS policies
-- ============================================================


-- ─── Step 1: Add search_vector generated column ──────────────────────────────
--
-- Weights:
--   A (highest): name, brand, sku
--   B (medium):  category
--   C (lower):   description
--
-- We use STORED so the vector is computed once at write-time, not
-- at every query. This is what makes GIN index scans fast.

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS search_vector tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('english', COALESCE(name,        '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(brand,       '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(sku,         '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(category,    '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(description, '')), 'C')
  ) STORED;


-- ─── Step 2: GIN index on search_vector ──────────────────────────────────────
--
-- Allows O(log N) full-text searches instead of sequential scans.
-- Required for 100k-product scale.

CREATE INDEX IF NOT EXISTS idx_products_search_vector
  ON public.products USING GIN (search_vector);


-- ─── Step 3: filter_products_v2 RPC ──────────────────────────────────────────
--
-- Single CTE pipeline:
--   matched_products  → filter by text + category + price + brand + EAV
--   total_count       → COUNT of matched_products (no pagination)
--   facet_data        → aggregate EAV attribute facets from matched_products
--   paginated         → LIMIT/OFFSET + sort from matched_products
--
-- Returns JSONB: { products, facets, totalCount, hasNextPage, executionTimeMs }

CREATE OR REPLACE FUNCTION public.filter_products_v2(
  p_search    TEXT    DEFAULT NULL,
  p_category  TEXT    DEFAULT 'All',
  p_filters   JSONB   DEFAULT '{}'::jsonb,
  p_price_max NUMERIC DEFAULT NULL,
  p_sort      TEXT    DEFAULT 'newest',
  p_limit     INT     DEFAULT 20,
  p_offset    INT     DEFAULT 0
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
  -- Record start time for executionTimeMs
  v_start_ms := (EXTRACT(EPOCH FROM clock_timestamp()) * 1000)::BIGINT;

  -- Pre-parse the tsquery once (cheaper than re-parsing per-row inside CTE)
  IF p_search IS NOT NULL AND trim(p_search) <> '' THEN
    BEGIN
      v_tsquery := plainto_tsquery('english', p_search);
    EXCEPTION WHEN others THEN
      v_tsquery := NULL;
    END;
  END IF;

  WITH
  -- ── CTE 1: matched_products ───────────────────────────────────────────────
  -- Applies ALL filters. No pagination yet — we need the full set for
  -- COUNT and facets.
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
      -- Relevance score: used when p_sort = 'relevance'
      CASE
        WHEN v_tsquery IS NOT NULL THEN ts_rank(p.search_vector, v_tsquery)
        ELSE 0.0
      END AS _rank
    FROM public.products p
    WHERE
      -- 1. Only active products
      p.is_active = true

      -- 2. Full-text search (GIN index scan)
      AND (
        v_tsquery IS NULL
        OR p.search_vector @@ v_tsquery
      )

      -- 3. Category filter
      AND (p_category = 'All' OR p.category = p_category)

      -- 4. Price filter (effective price after discount)
      AND (
        p_price_max IS NULL
        OR (p.price * (1.0 - COALESCE(p.discount_percent, 0) / 100.0)) <= p_price_max
      )

      -- 5. Brand filter (product-level, JSONB array)
      AND (
        NOT (p_filters ? 'Brand')
        OR p.brand IN (SELECT jsonb_array_elements_text(p_filters->'Brand'))
      )

      -- 6. Dynamic EAV attribute filters (variant-level intersection)
      AND (
        -- No non-Brand filters → skip EAV check entirely
        NOT EXISTS (SELECT 1 FROM jsonb_object_keys(p_filters - 'Brand'))
        OR EXISTS (
          SELECT 1
          FROM public.product_variants v
          WHERE v.product_id = p.id
            AND v.is_active = true
            AND (
              -- This variant satisfies ALL attribute filter keys
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

  -- ── CTE 2: total_count ────────────────────────────────────────────────────
  total_count AS (
    SELECT COUNT(*)::INT AS cnt FROM matched_products
  ),

  -- ── CTE 3: facet_data ─────────────────────────────────────────────────────
  -- Aggregates EAV attribute values from ALL matched products (not just current page).
  -- Builds a JSONB object: { "Color": ["Blue","Black"], "Fit": ["Slim"], "Brand": [...] }
  facet_data AS (
    SELECT
      jsonb_object_agg(attr_name, vals) AS facets
    FROM (
      -- Dynamic EAV facets (variant-level)
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

      -- Brand pseudo-facet (product-level)
      SELECT
        'Brand' AS attr_name,
        jsonb_agg(DISTINCT brand ORDER BY brand) AS vals
      FROM matched_products
      WHERE brand IS NOT NULL AND brand <> ''
    ) sub
  ),

  -- ── CTE 4: paginated ──────────────────────────────────────────────────────
  -- Applies LIMIT / OFFSET and sort. Operates on matched_products rows only.
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

  -- ── Final SELECT: assemble output ─────────────────────────────────────────
  SELECT jsonb_build_object(
    'products',    COALESCE((SELECT jsonb_agg(to_jsonb(p.*) - '_rank') FROM paginated p), '[]'::jsonb),
    'facets',      COALESCE((SELECT facets FROM facet_data), '{}'::jsonb),
    'totalCount',  (SELECT cnt FROM total_count),
    'hasNextPage', (p_offset + p_limit) < (SELECT cnt FROM total_count)
  )
  INTO v_result;

  -- Append execution time
  v_end_ms := (EXTRACT(EPOCH FROM clock_timestamp()) * 1000)::BIGINT;
  v_result := v_result || jsonb_build_object('executionTimeMs', v_end_ms - v_start_ms);

  RETURN v_result;
END;
$$;

-- ─── Step 4: Grants ───────────────────────────────────────────────────────────
-- Anon (storefront) and authenticated (logged-in user + admin preview) can call this.

GRANT EXECUTE ON FUNCTION public.filter_products_v2(TEXT, TEXT, JSONB, NUMERIC, TEXT, INT, INT)
  TO anon, authenticated;

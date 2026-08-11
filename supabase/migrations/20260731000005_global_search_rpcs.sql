-- ============================================================
-- Migration: Phase 17 - Global Product Search
-- Date: 2026-07-31
--
-- 1. Updates search_vector on products to include description
-- 2. Creates get_search_suggestions RPC for Navbar typeahead
-- 3. Creates global_product_search RPC for Search Results page
-- ============================================================

-- 1. Ensure search_vector includes all required fields
CREATE OR REPLACE FUNCTION public.update_product_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector = 
    setweight(to_tsvector('english', coalesce(NEW.name, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(NEW.brand, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(NEW.sku, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(NEW.description, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_products_search_vector ON public.products;
CREATE TRIGGER trg_products_search_vector
BEFORE INSERT OR UPDATE ON public.products
FOR EACH ROW EXECUTE FUNCTION public.update_product_search_vector();

-- Update existing records to populate the new vector
UPDATE public.products SET id = id;

-- Add GIN index if missing
CREATE INDEX IF NOT EXISTS idx_products_search_vector ON public.products USING GIN (search_vector);


-- 2. get_search_suggestions for Navbar Typeahead
-- Returns up to 10 matching products for autocomplete
CREATE OR REPLACE FUNCTION public.get_search_suggestions(p_query TEXT)
RETURNS JSONB LANGUAGE plpgsql SECURITY INVOKER AS $$
DECLARE
  v_products JSONB;
  v_tsquery tsquery;
BEGIN
  IF p_query IS NULL OR length(trim(p_query)) = 0 THEN
    RETURN '[]'::jsonb;
  END IF;

  -- Create a tsquery that supports prefix matching (e.g. "nik" matches "nike")
  v_tsquery := websearch_to_tsquery('english', trim(p_query) || ':*');

  SELECT COALESCE(jsonb_agg(row_data), '[]'::jsonb) INTO v_products
  FROM (
    SELECT 
      p.id,
      p.name,
      p.brand,
      p.price,
      p.images[1] as image_url,
      p.nav_node_id,
      n.name as category_name
    FROM public.products p
    LEFT JOIN public.navigation_nodes n ON n.id = p.nav_node_id
    WHERE p.is_active = true
      AND p.search_vector @@ v_tsquery
    ORDER BY ts_rank(p.search_vector, v_tsquery) DESC, p.created_at DESC
    LIMIT 10
  ) row_data;

  RETURN v_products;
END;
$$;


-- 3. global_product_search for Search Results Page
-- Similar to filter_products_by_node, but uses FTS and dynamic global facets
CREATE OR REPLACE FUNCTION public.global_product_search(
  p_query        TEXT,
  p_filters      JSONB    DEFAULT '{}'::jsonb,
  p_price_max    NUMERIC  DEFAULT NULL,
  p_sort         TEXT     DEFAULT 'relevance',
  p_limit        INT      DEFAULT 20,
  p_offset       INT      DEFAULT 0
)
RETURNS JSONB LANGUAGE plpgsql SECURITY INVOKER AS $$
DECLARE
  v_products JSONB;
  v_facets JSONB;
  v_total    BIGINT;
  v_tsquery tsquery;
BEGIN
  IF p_query IS NULL OR length(trim(p_query)) = 0 THEN
    RETURN jsonb_build_object(
      'metadata', jsonb_build_object('product_count', 0, 'has_children', false),
      'facets', '{}'::jsonb,
      'products', '[]'::jsonb,
      'totalCount', 0,
      'hasNextPage', false
    );
  END IF;

  v_tsquery := websearch_to_tsquery('english', trim(p_query) || ':*');

  -- Step A: Compute Total Count for pagination
  SELECT COUNT(DISTINCT p.id) INTO v_total
  FROM public.products p
  WHERE p.is_active = true
    AND p.search_vector @@ v_tsquery
    AND (p_price_max IS NULL OR p.price <= p_price_max)
    AND (
      p_filters = '{}'::jsonb OR p_filters IS NULL
      OR (
        (
          NOT (p_filters ? 'Category')
          OR p.nav_node_id IN (
            SELECT id FROM public.navigation_nodes 
            WHERE name IN (SELECT jsonb_array_elements_text(p_filters->'Category'))
          )
        )
        AND
        (
          NOT (p_filters ? 'Brand')
          OR p.brand IN (SELECT jsonb_array_elements_text(p_filters->'Brand'))
        )
        AND
        (
          NOT EXISTS (SELECT 1 FROM jsonb_object_keys(p_filters - 'Brand' - 'Category'))
          OR EXISTS (
            SELECT 1 FROM public.product_variants v
            WHERE v.product_id = p.id AND v.is_active = true
              AND (
                SELECT COUNT(*)
                FROM jsonb_each(p_filters - 'Brand' - 'Category') AS f(key, val)
                WHERE EXISTS (
                  SELECT 1
                  FROM public.variant_attribute_values vav
                  JOIN public.attributes a  ON a.id = vav.attribute_id
                  JOIN public.attribute_values av ON av.id = vav.attribute_value_id
                  WHERE vav.variant_id = v.id
                    AND a.name = f.key
                    AND av.value IN (SELECT jsonb_array_elements_text(f.val))
                )
              ) = (SELECT COUNT(*) FROM jsonb_object_keys(p_filters - 'Brand' - 'Category'))
          )
        )
      )
    );

  -- Step B: Fetch Paginated Products
  SELECT COALESCE(jsonb_agg(row_data), '[]'::jsonb) INTO v_products
  FROM (
    SELECT
      to_jsonb(p.*) AS row_data,
      p.price       AS _price,
      p.created_at  AS _created_at,
      p.rating      AS _rating,
      ts_rank(p.search_vector, v_tsquery) AS _rank
    FROM public.products p
    WHERE p.is_active = true
      AND p.search_vector @@ v_tsquery
      AND (p_price_max IS NULL OR p.price <= p_price_max)
      AND (
        p_filters = '{}'::jsonb OR p_filters IS NULL
        OR (
          (
            NOT (p_filters ? 'Category')
            OR p.nav_node_id IN (
              SELECT id FROM public.navigation_nodes 
              WHERE name IN (SELECT jsonb_array_elements_text(p_filters->'Category'))
            )
          )
          AND (
            NOT (p_filters ? 'Brand')
            OR p.brand IN (SELECT jsonb_array_elements_text(p_filters->'Brand'))
          )
          AND (
            NOT EXISTS (SELECT 1 FROM jsonb_object_keys(p_filters - 'Brand' - 'Category'))
            OR EXISTS (
              SELECT 1 FROM public.product_variants v
              WHERE v.product_id = p.id AND v.is_active = true
                AND (
                  SELECT COUNT(*)
                  FROM jsonb_each(p_filters - 'Brand' - 'Category') AS f(key, val)
                  WHERE EXISTS (
                    SELECT 1
                    FROM public.variant_attribute_values vav
                    JOIN public.attributes a  ON a.id = vav.attribute_id
                    JOIN public.attribute_values av ON av.id = vav.attribute_value_id
                    WHERE vav.variant_id = v.id
                      AND a.name = f.key
                      AND av.value IN (SELECT jsonb_array_elements_text(f.val))
                  )
                ) = (SELECT COUNT(*) FROM jsonb_object_keys(p_filters - 'Brand' - 'Category'))
            )
          )
        )
      )
    ORDER BY
      CASE p_sort WHEN 'price-asc'     THEN p.price                END ASC,
      CASE p_sort WHEN 'price-desc'    THEN p.price                END DESC,
      CASE p_sort WHEN 'highest-rated' THEN p.rating               END DESC NULLS LAST,
      CASE p_sort WHEN 'best-selling'  THEN p.rating               END DESC NULLS LAST,
      CASE p_sort WHEN 'newest'        THEN p.created_at           END DESC NULLS LAST,
      CASE p_sort WHEN 'relevance'     THEN ts_rank(p.search_vector, v_tsquery) END DESC NULLS LAST,
      p.created_at DESC
    LIMIT p_limit OFFSET p_offset
  ) sub;


  -- Step C: Compute Global Facets based on search matches (UNFILTERED by p_filters)
  SELECT COALESCE(
    jsonb_object_agg(
      grp_data.attr_name,
      jsonb_build_object(
        'display_type',          grp_data.display_type,
        'sort_order',            grp_data.grp_sort,
        'allow_search',          grp_data.allow_search,
        'max_visible',           grp_data.max_visible,
        'is_collapsed_default',  grp_data.is_collapsed_default,
        'values',                grp_data.values_array
      )
      ORDER BY grp_data.grp_sort
    ),
    '{}'::jsonb
  ) INTO v_facets
  FROM (
    -- Normal Attributes (Top 5 groups by frequency to avoid massive lists)
    SELECT
      agg_table.attr_name,
      agg_table.display_type,
      agg_table.grp_sort,
      agg_table.allow_search,
      agg_table.max_visible,
      agg_table.is_collapsed_default,
      jsonb_agg(
        jsonb_build_object('value', agg_table.val, 'hex_color', agg_table.hex, 'count', agg_table.cnt)
        ORDER BY agg_table.val_sort, agg_table.val
      ) AS values_array
    FROM (
      SELECT
        ag.name                     AS attr_name,
        ag.display_type             AS display_type,
        ag.id::text                 AS grp_sort,
        ag.allow_search             AS allow_search,
        ag.max_visible              AS max_visible,
        ag.is_collapsed_default     AS is_collapsed_default,
        av.value                    AS val,
        av.hex_color                AS hex,
        av.sort_order               AS val_sort,
        COUNT(DISTINCT p.id)        AS cnt
      FROM public.products p
      JOIN public.product_variants v           ON v.product_id = p.id AND v.is_active = true
      JOIN public.variant_attribute_values vav ON vav.variant_id = v.id
      JOIN public.attributes a                 ON a.id = vav.attribute_id
      JOIN public.attribute_values av          ON av.id = vav.attribute_value_id
      JOIN public.attribute_groups ag          ON ag.id = a.group_id
      WHERE p.is_active = true
        AND p.search_vector @@ v_tsquery
      GROUP BY 
        ag.name, ag.display_type, ag.id, ag.allow_search, ag.max_visible, ag.is_collapsed_default,
        av.value, av.hex_color, av.sort_order
    ) agg_table
    GROUP BY 
      agg_table.attr_name, agg_table.display_type, agg_table.grp_sort, agg_table.allow_search, agg_table.max_visible, agg_table.is_collapsed_default

    UNION ALL

    -- Brand pseudo-facet
    SELECT
      agg_table.attr_name,
      agg_table.display_type,
      agg_table.grp_sort,
      agg_table.allow_search,
      agg_table.max_visible,
      agg_table.is_collapsed_default,
      jsonb_agg(
        jsonb_build_object('value', agg_table.val, 'hex_color', NULL, 'count', agg_table.cnt)
        ORDER BY agg_table.val
      ) AS values_array
    FROM (
      SELECT
        'Brand'          AS attr_name,
        'multi-select'   AS display_type,
        '999'            AS grp_sort,
        true             AS allow_search,
        6                AS max_visible,
        false            AS is_collapsed_default,
        p.brand          AS val,
        COUNT(p.id)      AS cnt
      FROM public.products p
      WHERE p.is_active = true
        AND p.search_vector @@ v_tsquery
        AND p.brand IS NOT NULL
        AND p.brand <> ''
      GROUP BY p.brand
    ) agg_table
    GROUP BY 1, 2, 3, 4, 5, 6

    UNION ALL

    -- Category pseudo-facet
    SELECT
      agg_table.attr_name,
      agg_table.display_type,
      agg_table.grp_sort,
      agg_table.allow_search,
      agg_table.max_visible,
      agg_table.is_collapsed_default,
      jsonb_agg(
        jsonb_build_object('value', agg_table.val, 'hex_color', NULL, 'count', agg_table.cnt)
        ORDER BY agg_table.cnt DESC
      ) AS values_array
    FROM (
      SELECT
        'Category'       AS attr_name,
        'list'           AS display_type,
        '-1'             AS grp_sort,
        false            AS allow_search,
        10               AS max_visible,
        false            AS is_collapsed_default,
        cn.name          AS val,
        COUNT(DISTINCT p.id) as cnt
      FROM public.products p
      JOIN public.navigation_nodes cn ON cn.id = p.nav_node_id
      WHERE p.is_active = true
        AND p.search_vector @@ v_tsquery
        AND cn.is_active = true
      GROUP BY cn.name
    ) agg_table
    GROUP BY 1, 2, 3, 4, 5, 6
  ) grp_data;


  RETURN jsonb_build_object(
    'metadata', jsonb_build_object(
      'product_count', COALESCE(v_total, 0),
      'has_children',  false -- irrelevant for global search
    ),
    'facets', COALESCE(v_facets, '{}'::jsonb),
    'products', v_products,
    'totalCount', COALESCE(v_total, 0),
    'hasNextPage', (p_offset + p_limit) < v_total
  );
END;
$$;

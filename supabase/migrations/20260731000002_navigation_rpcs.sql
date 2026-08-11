-- ============================================================
-- Migration: Navigation RPCs
-- Date: 2026-07-31
--
-- 1. get_node_facets(p_nav_node_id UUID)
--    Returns rich facet metadata with counts, display type,
--    hex colors, and sort order for the filter sidebar.
--
-- 2. filter_products_by_node(p_nav_node_id, ...)
--    Filters products scoped to a navigation node.
--    Returns { products, totalCount, hasNextPage }.
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- 1. get_node_facets
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.get_node_facets(p_nav_node_id UUID)
RETURNS JSONB LANGUAGE plpgsql SECURITY INVOKER AS $$
DECLARE
  v_result JSONB;
BEGIN
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
  ) INTO v_result
  FROM (
    -- EAV attribute facets (linked via navigation_attribute_groups)
    SELECT
      ag.name                     AS attr_name,
      ag.display_type             AS display_type,
      nag.sort_order              AS grp_sort,
      ag.allow_search             AS allow_search,
      ag.max_visible              AS max_visible,
      ag.is_collapsed_default     AS is_collapsed_default,
      jsonb_agg(
        jsonb_build_object(
          'value',     av.value,
          'hex_color', av.hex_color,
          'count',     COUNT(DISTINCT p.id)
        )
        ORDER BY av.sort_order, av.value
      ) AS values_array
    FROM public.products p
    JOIN public.product_variants v           ON v.product_id = p.id AND v.is_active = true
    JOIN public.variant_attribute_values vav ON vav.variant_id = v.id
    JOIN public.attributes a                 ON a.id = vav.attribute_id
    JOIN public.attribute_values av          ON av.id = vav.attribute_value_id
    JOIN public.attribute_groups ag          ON ag.id = a.group_id
    JOIN public.navigation_attribute_groups nag
      ON nag.nav_node_id = p_nav_node_id
     AND nag.attribute_group_id = ag.id
     AND nag.is_active = true
    WHERE p.nav_node_id = p_nav_node_id
      AND p.is_active = true
    GROUP BY ag.name, ag.display_type, nag.sort_order, ag.allow_search, ag.max_visible, ag.is_collapsed_default

    UNION ALL

    -- Brand pseudo-facet (always included from products.brand)
    SELECT
      'Brand'          AS attr_name,
      'multi-select'   AS display_type,
      999              AS grp_sort,
      true             AS allow_search,
      6                AS max_visible,
      false            AS is_collapsed_default,
      jsonb_agg(
        jsonb_build_object('value', p.brand, 'hex_color', NULL, 'count', COUNT(p.id))
        ORDER BY p.brand
      ) AS values_array
    FROM public.products p
    WHERE p.nav_node_id = p_nav_node_id
      AND p.is_active = true
      AND p.brand IS NOT NULL
      AND p.brand <> ''
    GROUP BY 1, 2, 3, 4, 5, 6
  ) grp_data;

  RETURN COALESCE(v_result, '{}'::jsonb);
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_node_facets(UUID) TO anon, authenticated;


-- ────────────────────────────────────────────────────────────
-- 2. filter_products_by_node
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.filter_products_by_node(
  p_nav_node_id  UUID,
  p_filters      JSONB    DEFAULT '{}'::jsonb,
  p_price_max    NUMERIC  DEFAULT NULL,
  p_sort         TEXT     DEFAULT 'newest',
  p_limit        INT      DEFAULT 20,
  p_offset       INT      DEFAULT 0
)
RETURNS JSONB LANGUAGE plpgsql SECURITY INVOKER AS $$
DECLARE
  v_products JSONB;
  v_total    BIGINT;
BEGIN
  -- Count total matching products
  SELECT COUNT(DISTINCT p.id) INTO v_total
  FROM public.products p
  WHERE p.nav_node_id = p_nav_node_id
    AND p.is_active = true
    AND (p_price_max IS NULL OR p.price <= p_price_max)
    AND (
      p_filters = '{}'::jsonb OR p_filters IS NULL
      OR (
        -- Brand filter (product-level column)
        (
          NOT (p_filters ? 'Brand')
          OR p.brand IN (SELECT jsonb_array_elements_text(p_filters->'Brand'))
        )
        AND
        -- EAV attribute filters (variant-level)
        (
          NOT EXISTS (SELECT 1 FROM jsonb_object_keys(p_filters - 'Brand'))
          OR EXISTS (
            SELECT 1 FROM public.product_variants v
            WHERE v.product_id = p.id AND v.is_active = true
              AND (
                SELECT COUNT(*)
                FROM jsonb_each(p_filters - 'Brand') AS f(key, val)
                WHERE EXISTS (
                  SELECT 1
                  FROM public.variant_attribute_values vav
                  JOIN public.attributes a  ON a.id = vav.attribute_id
                  JOIN public.attribute_values av ON av.id = vav.attribute_value_id
                  WHERE vav.variant_id = v.id
                    AND a.name = f.key
                    AND av.value IN (SELECT jsonb_array_elements_text(f.val))
                )
              ) = (SELECT COUNT(*) FROM jsonb_object_keys(p_filters - 'Brand'))
          )
        )
      )
    );

  -- Fetch paginated product rows
  SELECT COALESCE(jsonb_agg(row_data), '[]'::jsonb) INTO v_products
  FROM (
    SELECT
      to_jsonb(p.*) AS row_data,
      p.price       AS _price,
      p.created_at  AS _created_at,
      p.rating      AS _rating
    FROM public.products p
    WHERE p.nav_node_id = p_nav_node_id
      AND p.is_active = true
      AND (p_price_max IS NULL OR p.price <= p_price_max)
      AND (
        p_filters = '{}'::jsonb OR p_filters IS NULL
        OR (
          (
            NOT (p_filters ? 'Brand')
            OR p.brand IN (SELECT jsonb_array_elements_text(p_filters->'Brand'))
          )
          AND (
            NOT EXISTS (SELECT 1 FROM jsonb_object_keys(p_filters - 'Brand'))
            OR EXISTS (
              SELECT 1 FROM public.product_variants v
              WHERE v.product_id = p.id AND v.is_active = true
                AND (
                  SELECT COUNT(*)
                  FROM jsonb_each(p_filters - 'Brand') AS f(key, val)
                  WHERE EXISTS (
                    SELECT 1
                    FROM public.variant_attribute_values vav
                    JOIN public.attributes a  ON a.id = vav.attribute_id
                    JOIN public.attribute_values av ON av.id = vav.attribute_value_id
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
      CASE p_sort WHEN 'price-asc'     THEN p.price                END ASC,
      CASE p_sort WHEN 'price-desc'    THEN p.price                END DESC,
      CASE p_sort WHEN 'highest-rated' THEN p.rating               END DESC NULLS LAST,
      CASE p_sort WHEN 'best-selling'  THEN p.rating               END DESC NULLS LAST,
      CASE p_sort WHEN 'newest'        THEN p.created_at           END DESC NULLS LAST,
      p.created_at DESC
    LIMIT p_limit OFFSET p_offset
  ) sub;

  RETURN jsonb_build_object(
    'products',    v_products,
    'totalCount',  v_total,
    'hasNextPage', (p_offset + p_limit) < v_total
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.filter_products_by_node(UUID, JSONB, NUMERIC, TEXT, INT, INT)
  TO anon, authenticated;

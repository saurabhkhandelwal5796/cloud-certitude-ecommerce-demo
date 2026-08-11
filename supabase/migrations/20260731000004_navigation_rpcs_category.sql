-- ============================================================
-- Migration: Recursive Navigation RPCs - Category Facet Enhancement
-- Date: 2026-07-31
--
-- 1. get_node_facets: Includes metadata (product_count, has_children) and Category facet
-- 2. filter_products_by_node: Supports filtering by Category
-- ============================================================

CREATE OR REPLACE FUNCTION public.get_node_facets(p_nav_node_id UUID)
RETURNS JSONB LANGUAGE plpgsql SECURITY INVOKER AS $$
DECLARE
  v_facets JSONB;
  v_total_count BIGINT;
  v_has_children BOOLEAN;
BEGIN
  -- 1. Compute total product count for the current node (all descendants)
  SELECT COUNT(DISTINCT p.id) INTO v_total_count
  FROM public.products p
  WHERE p.nav_node_id IN (
    WITH RECURSIVE descendants AS (
      SELECT id FROM public.navigation_nodes WHERE id = p_nav_node_id
      UNION
      SELECT n.id FROM public.navigation_nodes n
      INNER JOIN descendants d ON n.parent_id = d.id
    )
    SELECT id FROM descendants
  )
  AND p.is_active = true;

  -- 2. Check if node has children
  SELECT EXISTS(
    SELECT 1 FROM public.navigation_nodes WHERE parent_id = p_nav_node_id AND is_active = true
  ) INTO v_has_children;

  -- 3. Build facets JSONB
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
    -- Normal Attributes
    SELECT
      agg_table.attr_name,
      agg_table.display_type,
      agg_table.grp_sort,
      agg_table.allow_search,
      agg_table.max_visible,
      agg_table.is_collapsed_default,
      jsonb_agg(
        jsonb_build_object(
          'value',     agg_table.val,
          'hex_color', agg_table.hex,
          'count',     agg_table.cnt
        )
        ORDER BY agg_table.val_sort, agg_table.val
      ) AS values_array
    FROM (
      SELECT
        ag.name                     AS attr_name,
        ag.display_type             AS display_type,
        nag.sort_order              AS grp_sort,
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
      JOIN public.navigation_attribute_groups nag
        ON nag.nav_node_id = p_nav_node_id
       AND nag.attribute_group_id = ag.id
       AND nag.is_active = true
      WHERE p.nav_node_id IN (
        WITH RECURSIVE descendants AS (
          SELECT id FROM public.navigation_nodes WHERE id = p_nav_node_id
          UNION
          SELECT n.id FROM public.navigation_nodes n
          INNER JOIN descendants d ON n.parent_id = d.id
        )
        SELECT id FROM descendants
      )
        AND p.is_active = true
      GROUP BY 
        ag.name, ag.display_type, nag.sort_order, ag.allow_search, ag.max_visible, ag.is_collapsed_default,
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
        999              AS grp_sort,
        true             AS allow_search,
        6                AS max_visible,
        false            AS is_collapsed_default,
        p.brand          AS val,
        COUNT(p.id)      AS cnt
      FROM public.products p
      WHERE p.nav_node_id IN (
        WITH RECURSIVE descendants AS (
          SELECT id FROM public.navigation_nodes WHERE id = p_nav_node_id
          UNION
          SELECT n.id FROM public.navigation_nodes n
          INNER JOIN descendants d ON n.parent_id = d.id
        )
        SELECT id FROM descendants
      )
        AND p.is_active = true
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
        ORDER BY agg_table.val_sort, agg_table.val
      ) AS values_array
    FROM (
      SELECT
        'Category'       AS attr_name,
        'list'           AS display_type,
        -1               AS grp_sort,
        false            AS allow_search,
        10               AS max_visible,
        false            AS is_collapsed_default,
        cn.name          AS val,
        cn.sort_order    AS val_sort,
        COUNT(DISTINCT p.id) as cnt
      FROM public.navigation_nodes cn
      JOIN public.navigation_nodes dn 
        ON dn.id = cn.id OR dn.full_path LIKE cn.full_path || '/%'
      JOIN public.products p 
        ON p.nav_node_id = dn.id AND p.is_active = true
      WHERE cn.parent_id = p_nav_node_id
        AND cn.is_active = true
      GROUP BY cn.id, cn.name, cn.sort_order
      HAVING COUNT(DISTINCT p.id) > 0
    ) agg_table
    GROUP BY 1, 2, 3, 4, 5, 6
  ) grp_data;

  RETURN jsonb_build_object(
    'metadata', jsonb_build_object(
      'product_count', COALESCE(v_total_count, 0),
      'has_children',  v_has_children
    ),
    'facets', COALESCE(v_facets, '{}'::jsonb)
  );
END;
$$;


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
  SELECT COUNT(DISTINCT p.id) INTO v_total
  FROM public.products p
  WHERE p.nav_node_id IN (
      WITH RECURSIVE descendants AS (
        SELECT id FROM public.navigation_nodes WHERE id = p_nav_node_id
        UNION
        SELECT n.id FROM public.navigation_nodes n
        INNER JOIN descendants d ON n.parent_id = d.id
      )
      SELECT id FROM descendants
    )
    AND p.is_active = true
    AND (p_price_max IS NULL OR p.price <= p_price_max)
    AND (
      p_filters = '{}'::jsonb OR p_filters IS NULL
      OR (
        (
          NOT (p_filters ? 'Category')
          OR p.nav_node_id IN (
            SELECT dn.id
            FROM public.navigation_nodes cn
            JOIN public.navigation_nodes dn
              ON dn.id = cn.id OR dn.full_path LIKE cn.full_path || '/%'
            WHERE cn.parent_id = p_nav_node_id
              AND cn.name IN (SELECT jsonb_array_elements_text(p_filters->'Category'))
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

  SELECT COALESCE(jsonb_agg(row_data), '[]'::jsonb) INTO v_products
  FROM (
    SELECT
      to_jsonb(p.*) AS row_data,
      p.price       AS _price,
      p.created_at  AS _created_at,
      p.rating      AS _rating
    FROM public.products p
    WHERE p.nav_node_id IN (
        WITH RECURSIVE descendants AS (
          SELECT id FROM public.navigation_nodes WHERE id = p_nav_node_id
          UNION
          SELECT n.id FROM public.navigation_nodes n
          INNER JOIN descendants d ON n.parent_id = d.id
        )
        SELECT id FROM descendants
      )
      AND p.is_active = true
      AND (p_price_max IS NULL OR p.price <= p_price_max)
      AND (
        p_filters = '{}'::jsonb OR p_filters IS NULL
        OR (
          (
            NOT (p_filters ? 'Category')
            OR p.nav_node_id IN (
              SELECT dn.id
              FROM public.navigation_nodes cn
              JOIN public.navigation_nodes dn
                ON dn.id = cn.id OR dn.full_path LIKE cn.full_path || '/%'
              WHERE cn.parent_id = p_nav_node_id
                AND cn.name IN (SELECT jsonb_array_elements_text(p_filters->'Category'))
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

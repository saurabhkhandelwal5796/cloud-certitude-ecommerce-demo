-- ============================================================
-- Migration: Fix Storefront RPC Visibility & Pricing
-- Date: 2026-08-05
--
-- Replaces products.price with variant-derived pricing and
-- enforces that products without active variants are not visible.
-- ============================================================

-- 1. get_search_suggestions
CREATE OR REPLACE FUNCTION public.get_search_suggestions(p_query TEXT)
RETURNS JSONB LANGUAGE plpgsql SECURITY INVOKER AS $$
DECLARE
  v_products JSONB;
  v_tsquery tsquery;
BEGIN
  IF p_query IS NULL OR length(trim(p_query)) = 0 THEN
    RETURN '[]'::jsonb;
  END IF;

  v_tsquery := websearch_to_tsquery('english', trim(p_query) || ':*');

  SELECT COALESCE(jsonb_agg(row_data), '[]'::jsonb) INTO v_products
  FROM (
    SELECT 
      p.id,
      p.name,
      p.brand,
      (SELECT MIN(COALESCE(v.discounted_price, v.price)) FROM public.product_variants v WHERE v.product_id = p.id AND v.is_active = true) as price,
      p.images[1] as image_url,
      p.nav_node_id,
      n.name as category_name
    FROM public.products p
    LEFT JOIN public.navigation_nodes n ON n.id = p.nav_node_id
    WHERE p.is_active = true
      AND EXISTS (
        SELECT 1 FROM public.product_variants v
        WHERE v.product_id = p.id AND v.is_active = true
      )
      AND p.search_vector @@ v_tsquery
    ORDER BY ts_rank(p.search_vector, v_tsquery) DESC, p.created_at DESC
    LIMIT 10
  ) row_data;

  RETURN v_products;
END;
$$;


-- 2. global_product_search
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

  SELECT COUNT(DISTINCT p.id) INTO v_total
  FROM public.products p
  WHERE p.is_active = true
    AND EXISTS (
      SELECT 1 FROM public.product_variants v
      WHERE v.product_id = p.id AND v.is_active = true
    )
    AND p.search_vector @@ v_tsquery
    AND (p_price_max IS NULL OR (SELECT MIN(COALESCE(v.discounted_price, v.price)) FROM public.product_variants v WHERE v.product_id = p.id AND v.is_active = true) <= p_price_max)
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

  SELECT COALESCE(jsonb_agg(row_data), '[]'::jsonb) INTO v_products
  FROM (
    SELECT
      to_jsonb(p.*) || jsonb_build_object('price', (SELECT MIN(COALESCE(v.discounted_price, v.price)) FROM public.product_variants v WHERE v.product_id = p.id AND v.is_active = true)) AS row_data,
      (SELECT MIN(COALESCE(v.discounted_price, v.price)) FROM public.product_variants v WHERE v.product_id = p.id AND v.is_active = true) AS _price,
      p.created_at  AS _created_at,
      p.rating      AS _rating,
      ts_rank(p.search_vector, v_tsquery) AS _rank
    FROM public.products p
    WHERE p.is_active = true
      AND EXISTS (
        SELECT 1 FROM public.product_variants v
        WHERE v.product_id = p.id AND v.is_active = true
      )
      AND p.search_vector @@ v_tsquery
      AND (p_price_max IS NULL OR (SELECT MIN(COALESCE(v.discounted_price, v.price)) FROM public.product_variants v WHERE v.product_id = p.id AND v.is_active = true) <= p_price_max)
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
      CASE p_sort WHEN 'price-asc'     THEN (SELECT MIN(COALESCE(v.discounted_price, v.price)) FROM public.product_variants v WHERE v.product_id = p.id AND v.is_active = true)                END ASC,
      CASE p_sort WHEN 'price-desc'    THEN (SELECT MIN(COALESCE(v.discounted_price, v.price)) FROM public.product_variants v WHERE v.product_id = p.id AND v.is_active = true)                END DESC,
      CASE p_sort WHEN 'highest-rated' THEN p.rating               END DESC NULLS LAST,
      CASE p_sort WHEN 'best-selling'  THEN p.rating               END DESC NULLS LAST,
      CASE p_sort WHEN 'newest'        THEN p.created_at           END DESC NULLS LAST,
      CASE p_sort WHEN 'relevance'     THEN ts_rank(p.search_vector, v_tsquery) END DESC NULLS LAST,
      p.created_at DESC
    LIMIT p_limit OFFSET p_offset
  ) sub;

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
        AND EXISTS (
          SELECT 1 FROM public.product_variants pv
          WHERE pv.product_id = p.id AND pv.is_active = true
        )
        AND p.search_vector @@ v_tsquery
        AND ag.id IN (
          SELECT sub_ag.id
          FROM public.products sub_p
          JOIN public.product_variants sub_v           ON sub_v.product_id = sub_p.id AND sub_v.is_active = true
          JOIN public.variant_attribute_values sub_vav ON sub_vav.variant_id = sub_v.id
          JOIN public.attributes sub_a                 ON sub_a.id = sub_vav.attribute_id
          JOIN public.attribute_groups sub_ag          ON sub_ag.id = sub_a.group_id
          WHERE sub_p.is_active = true
            AND sub_p.search_vector @@ v_tsquery
          GROUP BY sub_ag.id
          ORDER BY COUNT(DISTINCT sub_p.id) DESC
          LIMIT 5
        )
      GROUP BY 
        ag.name, ag.display_type, ag.id::text, ag.allow_search, ag.max_visible, ag.is_collapsed_default,
        av.value, av.hex_color, av.sort_order
    ) agg_table
    GROUP BY 
      agg_table.attr_name, agg_table.display_type, agg_table.grp_sort, agg_table.allow_search, agg_table.max_visible, agg_table.is_collapsed_default
  ) final_aggs;

  RETURN jsonb_build_object(
    'metadata', jsonb_build_object('product_count', v_total, 'has_children', false),
    'facets', v_facets,
    'products', v_products,
    'totalCount', v_total,
    'hasNextPage', (p_offset + p_limit) < v_total
  );
END;
$$;


-- 3. filter_products_by_node
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
    AND EXISTS (
      SELECT 1 FROM public.product_variants v
      WHERE v.product_id = p.id AND v.is_active = true
    )
    AND (p_price_max IS NULL OR (SELECT MIN(COALESCE(v.discounted_price, v.price)) FROM public.product_variants v WHERE v.product_id = p.id AND v.is_active = true) <= p_price_max)
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
              AND dn.name IN (SELECT jsonb_array_elements_text(p_filters->'Category'))
          )
        )
        AND (
          NOT (p_filters ? 'Brand')
          OR p.brand IN (SELECT jsonb_array_elements_text(p_filters->'Brand'))
        )
        AND (
          NOT (p_filters ? 'Rating')
          OR (
            p.rating >= (
              SELECT MIN(val::numeric) 
              FROM jsonb_array_elements_text(p_filters->'Rating') AS val
            )
          )
        )
        AND (
          NOT (p_filters ? 'Discount')
          OR (
            p.discount_percent >= (
              SELECT MIN(REPLACE(val, '% and above', '')::numeric)
              FROM jsonb_array_elements_text(p_filters->'Discount') AS val
            )
          )
        )
        AND (
          NOT EXISTS (SELECT 1 FROM jsonb_object_keys(p_filters - 'Brand' - 'Category' - 'Rating' - 'Discount'))
          OR EXISTS (
            SELECT 1 FROM public.product_variants v
            WHERE v.product_id = p.id AND v.is_active = true
              AND (
                SELECT COUNT(*)
                FROM jsonb_each(p_filters - 'Brand' - 'Category' - 'Rating' - 'Discount') AS f(key, val)
                WHERE EXISTS (
                  SELECT 1
                  FROM public.variant_attribute_values vav
                  JOIN public.attributes a  ON a.id = vav.attribute_id
                  JOIN public.attribute_values av ON av.id = vav.attribute_value_id
                  WHERE vav.variant_id = v.id
                    AND a.name = f.key
                    AND av.value IN (SELECT jsonb_array_elements_text(f.val))
                )
              ) = (SELECT COUNT(*) FROM jsonb_object_keys(p_filters - 'Brand' - 'Category' - 'Rating' - 'Discount'))
          )
        )
      )
    );

  SELECT COALESCE(jsonb_agg(row_data), '[]'::jsonb) INTO v_products
  FROM (
    SELECT
      to_jsonb(p.*) || jsonb_build_object('price', (SELECT MIN(COALESCE(v.discounted_price, v.price)) FROM public.product_variants v WHERE v.product_id = p.id AND v.is_active = true)) AS row_data,
      (SELECT MIN(COALESCE(v.discounted_price, v.price)) FROM public.product_variants v WHERE v.product_id = p.id AND v.is_active = true) AS _price,
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
      AND EXISTS (
        SELECT 1 FROM public.product_variants v
        WHERE v.product_id = p.id AND v.is_active = true
      )
      AND (p_price_max IS NULL OR (SELECT MIN(COALESCE(v.discounted_price, v.price)) FROM public.product_variants v WHERE v.product_id = p.id AND v.is_active = true) <= p_price_max)
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
                AND dn.name IN (SELECT jsonb_array_elements_text(p_filters->'Category'))
            )
          )
          AND (
            NOT (p_filters ? 'Brand')
            OR p.brand IN (SELECT jsonb_array_elements_text(p_filters->'Brand'))
          )
          AND (
            NOT (p_filters ? 'Rating')
            OR (
              p.rating >= (
                SELECT MIN(val::numeric) 
                FROM jsonb_array_elements_text(p_filters->'Rating') AS val
              )
            )
          )
          AND (
            NOT (p_filters ? 'Discount')
            OR (
              p.discount_percent >= (
                SELECT MIN(REPLACE(val, '% and above', '')::numeric)
                FROM jsonb_array_elements_text(p_filters->'Discount') AS val
              )
            )
          )
          AND (
            NOT EXISTS (SELECT 1 FROM jsonb_object_keys(p_filters - 'Brand' - 'Category' - 'Rating' - 'Discount'))
            OR EXISTS (
              SELECT 1 FROM public.product_variants v
              WHERE v.product_id = p.id AND v.is_active = true
                AND (
                  SELECT COUNT(*)
                  FROM jsonb_each(p_filters - 'Brand' - 'Category' - 'Rating' - 'Discount') AS f(key, val)
                  WHERE EXISTS (
                    SELECT 1
                    FROM public.variant_attribute_values vav
                    JOIN public.attributes a  ON a.id = vav.attribute_id
                    JOIN public.attribute_values av ON av.id = vav.attribute_value_id
                    WHERE vav.variant_id = v.id
                      AND a.name = f.key
                      AND av.value IN (SELECT jsonb_array_elements_text(f.val))
                  )
                ) = (SELECT COUNT(*) FROM jsonb_object_keys(p_filters - 'Brand' - 'Category' - 'Rating' - 'Discount'))
            )
          )
        )
      )
    ORDER BY
      CASE p_sort WHEN 'price-asc'     THEN (SELECT MIN(COALESCE(v.discounted_price, v.price)) FROM public.product_variants v WHERE v.product_id = p.id AND v.is_active = true)                END ASC,
      CASE p_sort WHEN 'price-desc'    THEN (SELECT MIN(COALESCE(v.discounted_price, v.price)) FROM public.product_variants v WHERE v.product_id = p.id AND v.is_active = true)                END DESC,
      CASE p_sort WHEN 'highest-rated' THEN p.rating               END DESC NULLS LAST,
      CASE p_sort WHEN 'newest'        THEN p.created_at           END DESC NULLS LAST,
      p.created_at DESC
    LIMIT p_limit OFFSET p_offset
  ) sub;

  RETURN jsonb_build_object(
    'products', v_products,
    'totalCount', v_total,
    'hasNextPage', (p_offset + p_limit) < v_total
  );
END;
$$;


-- 4. get_node_facets
CREATE OR REPLACE FUNCTION public.get_node_facets(p_nav_node_id UUID)
RETURNS JSONB LANGUAGE plpgsql SECURITY INVOKER AS $$
DECLARE
  v_facets JSONB;
  v_total_count BIGINT;
  v_has_children BOOLEAN;
BEGIN
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
  AND p.is_active = true
  AND EXISTS (
    SELECT 1 FROM public.product_variants v
    WHERE v.product_id = p.id AND v.is_active = true
  );

  SELECT EXISTS(
    SELECT 1 FROM public.navigation_nodes WHERE parent_id = p_nav_node_id AND is_active = true
  ) INTO v_has_children;

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
        AND EXISTS (
          SELECT 1 FROM public.product_variants pv
          WHERE pv.product_id = p.id AND pv.is_active = true
        )
      GROUP BY 
        ag.name, ag.display_type, nag.sort_order, ag.allow_search, ag.max_visible, ag.is_collapsed_default,
        av.value, av.hex_color, av.sort_order
    ) agg_table
    GROUP BY 
      agg_table.attr_name, agg_table.display_type, agg_table.grp_sort, agg_table.allow_search, agg_table.max_visible, agg_table.is_collapsed_default

    UNION ALL

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
        AND EXISTS (
          SELECT 1 FROM public.product_variants v
          WHERE v.product_id = p.id AND v.is_active = true
        )
        AND p.brand IS NOT NULL
        AND p.brand <> ''
      GROUP BY p.brand
    ) agg_table
    GROUP BY 1, 2, 3, 4, 5, 6

    UNION ALL

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
        AND EXISTS (
          SELECT 1 FROM public.product_variants v
          WHERE v.product_id = p.id AND v.is_active = true
        )
      GROUP BY cn.id, cn.name, cn.sort_order
      HAVING COUNT(DISTINCT p.id) > 0
    ) agg_table
    GROUP BY 1, 2, 3, 4, 5, 6

    UNION ALL

    SELECT
      agg_table.attr_name,
      agg_table.display_type,
      agg_table.grp_sort,
      agg_table.allow_search,
      agg_table.max_visible,
      agg_table.is_collapsed_default,
      jsonb_agg(
        jsonb_build_object('value', agg_table.val, 'hex_color', NULL, 'count', agg_table.cnt)
        ORDER BY agg_table.min_rating DESC
      ) AS values_array
    FROM (
      SELECT
        'Rating'         AS attr_name,
        'multi-select'   AS display_type,
        998              AS grp_sort,
        false            AS allow_search,
        5                AS max_visible,
        false            AS is_collapsed_default,
        bucket.val       AS val,
        bucket.min_rating AS min_rating,
        COUNT(p.id)      AS cnt
      FROM public.products p
      CROSS JOIN (
        VALUES ('4★ & above', 4), ('3★ & above', 3), ('2★ & above', 2)
      ) AS bucket(val, min_rating)
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
        AND EXISTS (
          SELECT 1 FROM public.product_variants v
          WHERE v.product_id = p.id AND v.is_active = true
        )
        AND COALESCE(p.rating, 0) >= bucket.min_rating
      GROUP BY bucket.val, bucket.min_rating
      HAVING COUNT(p.id) > 0
    ) agg_table
    GROUP BY 1, 2, 3, 4, 5, 6

    UNION ALL

    SELECT
      agg_table.attr_name,
      agg_table.display_type,
      agg_table.grp_sort,
      agg_table.allow_search,
      agg_table.max_visible,
      agg_table.is_collapsed_default,
      jsonb_agg(
        jsonb_build_object('value', agg_table.val, 'hex_color', NULL, 'count', agg_table.cnt)
        ORDER BY agg_table.min_discount DESC
      ) AS values_array
    FROM (
      SELECT
        'Discount'       AS attr_name,
        'multi-select'   AS display_type,
        997              AS grp_sort,
        false            AS allow_search,
        5                AS max_visible,
        false            AS is_collapsed_default,
        bucket.val       AS val,
        bucket.min_discount AS min_discount,
        COUNT(p.id)      AS cnt
      FROM public.products p
      CROSS JOIN (
        VALUES ('70% or more', 70), ('50% or more', 50), ('25% or more', 25), ('10% or more', 10)
      ) AS bucket(val, min_discount)
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
        AND EXISTS (
          SELECT 1 FROM public.product_variants v
          WHERE v.product_id = p.id AND v.is_active = true
        )
        AND COALESCE(p.discount_percent, 0) >= bucket.min_discount
      GROUP BY bucket.val, bucket.min_discount
      HAVING COUNT(p.id) > 0
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

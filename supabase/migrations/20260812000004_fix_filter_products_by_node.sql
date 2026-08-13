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
    INNER JOIN LATERAL (
      SELECT v.price, CASE WHEN v.price > 0 AND v.discounted_price IS NOT NULL AND v.discounted_price < v.price THEN ROUND(((v.price - v.discounted_price) / v.price) * 100) ELSE 0 END AS discount_percent, v.images, v.gst_rate
      FROM public.product_variants v
      WHERE v.product_id = p.id AND v.is_active = true
      ORDER BY v.is_primary DESC, v.created_at ASC
      LIMIT 1
    ) pv ON true
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
    AND (p_price_max IS NULL OR (SELECT MIN(COALESCE(v.discounted_price, v.price)) FROM public.product_variants v 
WHERE v.product_id = p.id AND v.is_active = true) <= p_price_max)
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
            COALESCE(pv.discount_percent, 0) >= (
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
      to_jsonb(p.*) || jsonb_build_object('price', (SELECT MIN(COALESCE(v.discounted_price, v.price)) FROM 
public.product_variants v WHERE v.product_id = p.id AND v.is_active = true)) AS row_data,
      (SELECT MIN(COALESCE(v.discounted_price, v.price)) FROM public.product_variants v WHERE v.product_id = p.id 
AND v.is_active = true) AS _price,
      p.created_at  AS _created_at,
      p.rating      AS _rating
    FROM public.products p
    INNER JOIN LATERAL (
      SELECT v.price, CASE WHEN v.price > 0 AND v.discounted_price IS NOT NULL AND v.discounted_price < v.price THEN ROUND(((v.price - v.discounted_price) / v.price) * 100) ELSE 0 END AS discount_percent, v.images, v.gst_rate
      FROM public.product_variants v
      WHERE v.product_id = p.id AND v.is_active = true
      ORDER BY v.is_primary DESC, v.created_at ASC
      LIMIT 1
    ) pv ON true
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
      AND (p_price_max IS NULL OR (SELECT MIN(COALESCE(v.discounted_price, v.price)) FROM public.product_variants v 
WHERE v.product_id = p.id AND v.is_active = true) <= p_price_max)
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
              COALESCE(pv.discount_percent, 0) >= (
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
      CASE WHEN p_sort = 'price_asc'  THEN (SELECT MIN(COALESCE(v.discounted_price, v.price)) FROM public.product_variants v WHERE v.product_id = p.id AND v.is_active = true) END ASC NULLS LAST,
      CASE WHEN p_sort = 'price_desc' THEN (SELECT MIN(COALESCE(v.discounted_price, v.price)) FROM public.product_variants v WHERE v.product_id = p.id AND v.is_active = true) END DESC NULLS LAST,
      CASE WHEN p_sort = 'newest'     THEN p.created_at END DESC NULLS LAST,
      CASE WHEN p_sort = 'rating'     THEN p.rating END DESC NULLS LAST,
      p.id
    LIMIT p_limit
    OFFSET p_offset
  ) AS sorted_products;

  RETURN jsonb_build_object(
    'metadata', jsonb_build_object('product_count', v_total, 'has_children', false),
    'facets', '{}'::jsonb,
    'products', COALESCE(v_products, '[]'::jsonb),
    'totalCount', COALESCE(v_total, 0),
    'hasNextPage', (p_offset + p_limit) < COALESCE(v_total, 0)
  );
END;
$$;

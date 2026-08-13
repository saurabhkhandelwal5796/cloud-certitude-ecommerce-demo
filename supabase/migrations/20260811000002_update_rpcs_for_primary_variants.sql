-- Migration: 20260811000002_update_rpcs_for_primary_variants
-- Purpose: Enforce that storefront product lists use the primary variant's price, discount, and images.
--          Exclude products that have 0 active variants.

CREATE OR REPLACE FUNCTION public.filter_products(
  p_category         TEXT    DEFAULT 'All',
  p_filters          JSONB   DEFAULT '{}'::jsonb,
  p_price_max        NUMERIC DEFAULT NULL,
  p_sort             TEXT    DEFAULT 'newest',
  p_limit            INT     DEFAULT 20,
  p_offset           INT     DEFAULT 0,
  p_subcategory_name TEXT    DEFAULT NULL   -- kept for API compat, now a no-op
)
RETURNS JSONB AS $$
DECLARE
  v_result JSONB;
BEGIN
  SELECT COALESCE(jsonb_agg(row_data), '[]'::jsonb) INTO v_result
  FROM (
    SELECT to_jsonb(p.*) || jsonb_build_object(
        'price', pv.price,
        'discount_percent', pv.discount_percent,
        'images', pv.images,
        'gst_rate', pv.gst_rate
      ) AS row_data
    FROM public.products p
    INNER JOIN LATERAL (
      SELECT v.price, v.discount_percent, v.images, v.gst_rate
      FROM public.product_variants v
      WHERE v.product_id = p.id AND v.is_active = true
      ORDER BY v.is_primary DESC, v.created_at ASC
      LIMIT 1
    ) pv ON true
    WHERE p.is_active = true
      AND (p_category = 'All' OR p.category = p_category)
      AND (
        p_price_max IS NULL
        OR (pv.price * (1.0 - COALESCE(pv.discount_percent, 0) / 100.0)) <= p_price_max
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
        WHEN 'price-asc'      THEN pv.price * (1.0 - COALESCE(pv.discount_percent, 0) / 100.0)
        WHEN 'price-desc'     THEN -(pv.price * (1.0 - COALESCE(pv.discount_percent, 0) / 100.0))
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

GRANT EXECUTE ON FUNCTION public.filter_products(TEXT, JSONB, NUMERIC, TEXT, INT, INT, TEXT)
  TO anon, authenticated;


-- ─── Step 3: Replace filter_products_v2 — remove subcategories subquery ───────
CREATE OR REPLACE FUNCTION public.filter_products_v2(
  p_search           TEXT    DEFAULT NULL,
  p_category         TEXT    DEFAULT 'All',
  p_filters          JSONB   DEFAULT '{}'::jsonb,
  p_price_max        NUMERIC DEFAULT NULL,
  p_sort             TEXT    DEFAULT 'newest',
  p_limit            INT     DEFAULT 20,
  p_offset           INT     DEFAULT 0,
  p_subcategory_name TEXT    DEFAULT NULL   -- kept for API compat, now a no-op
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
      pv.price,
      pv.discount_percent,
      p.rating,
      p.review_count,
      pv.images,
      p.color,
      p.size,
      p.sku,
      p.tags,
      p.created_at,
      pv.gst_rate,
      p.hsn_code,
      p.is_active,
      p.updated_at,
      p.nav_node_id,
      CASE
        WHEN v_tsquery IS NOT NULL THEN ts_rank(p.search_vector, v_tsquery)
        ELSE 0.0
      END AS _rank
    FROM public.products p
    INNER JOIN LATERAL (
      SELECT v.price, v.discount_percent, v.images, v.gst_rate
      FROM public.product_variants v
      WHERE v.product_id = p.id AND v.is_active = true
      ORDER BY v.is_primary DESC, v.created_at ASC
      LIMIT 1
    ) pv ON true
    WHERE
      p.is_active = true
      AND (
        v_tsquery IS NULL
        OR p.search_vector @@ v_tsquery
      )
      AND (p_category = 'All' OR p.category = p_category)
      AND (
        p_price_max IS NULL
        OR (pv.price * (1.0 - COALESCE(pv.discount_percent, 0) / 100.0)) <= p_price_max
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
      mp.size, mp.sku, mp.tags, mp.created_at, mp.gst_rate, mp.hsn_code,
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

CREATE OR REPLACE FUNCTION public.filter_products_v2(
  p_search           TEXT    DEFAULT NULL,
  p_category         TEXT    DEFAULT 'All',
  p_filters          JSONB   DEFAULT '{}'::jsonb,
  p_price_max        NUMERIC DEFAULT NULL,
  p_sort             TEXT    DEFAULT 'newest',
  p_limit            INT     DEFAULT 20,
  p_offset           INT     DEFAULT 0,
  p_subcategory_name TEXT    DEFAULT NULL   -- kept for API compat, now a no-op
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
      pv.price,
      pv.discount_percent,
      p.rating,
      p.review_count,
      pv.images,
      p.color,
      p.size,
      p.sku,
      p.tags,
      p.created_at,
      pv.gst_rate,
      p.hsn_code,
      p.is_active,
      p.updated_at,
      p.nav_node_id,
      CASE
        WHEN v_tsquery IS NOT NULL THEN ts_rank(p.search_vector, v_tsquery)
        ELSE 0.0
      END AS _rank
    FROM public.products p
    INNER JOIN LATERAL (
      SELECT v.price, v.discount_percent, v.images, v.gst_rate
      FROM public.product_variants v
      WHERE v.product_id = p.id AND v.is_active = true
      ORDER BY v.is_primary DESC, v.created_at ASC
      LIMIT 1
    ) pv ON true
    WHERE
      p.is_active = true
      AND (
        v_tsquery IS NULL
        OR p.search_vector @@ v_tsquery
      )
      AND (p_category = 'All' OR p.category = p_category)
      AND (
        p_price_max IS NULL
        OR (pv.price * (1.0 - COALESCE(pv.discount_percent, 0) / 100.0)) <= p_price_max
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
      mp.size, mp.sku, mp.tags, mp.created_at, mp.gst_rate, mp.hsn_code,
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
      SELECT v.price, v.discount_percent, v.images, v.gst_rate
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
    INNER JOIN LATERAL (
      SELECT v.price, v.discount_percent, v.images, v.gst_rate
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
    INNER JOIN LATERAL (
      SELECT v.price, v.discount_percent, v.images, v.gst_rate
      FROM public.product_variants v
      WHERE v.product_id = p.id AND v.is_active = true
      ORDER BY v.is_primary DESC, v.created_at ASC
      LIMIT 1
    ) pv ON true
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
          NOT (p_filters ? 'Rating')
          OR EXISTS (
            SELECT 1 FROM jsonb_array_elements_text(p_filters->'Rating') r_val
            WHERE (r_val = '4★ & above' AND COALESCE(p.rating, 0) >= 4)
               OR (r_val = '3★ & above' AND COALESCE(p.rating, 0) >= 3)
               OR (r_val = '2★ & above' AND COALESCE(p.rating, 0) >= 2)
          )
        )
        AND
        (
          NOT (p_filters ? 'Discount')
          OR EXISTS (
            SELECT 1 FROM jsonb_array_elements_text(p_filters->'Discount') d_val
            WHERE (d_val = '70% or more' AND COALESCE(pv.discount_percent, 0) >= 70)
               OR (d_val = '50% or more' AND COALESCE(pv.discount_percent, 0) >= 50)
               OR (d_val = '25% or more' AND COALESCE(pv.discount_percent, 0) >= 25)
               OR (d_val = '10% or more' AND COALESCE(pv.discount_percent, 0) >= 10)
          )
        )
        AND
        (
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
    INNER JOIN LATERAL (
      SELECT v.price, v.discount_percent, v.images, v.gst_rate
      FROM public.product_variants v
      WHERE v.product_id = p.id AND v.is_active = true
      ORDER BY v.is_primary DESC, v.created_at ASC
      LIMIT 1
    ) pv ON true
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
            NOT (p_filters ? 'Rating')
            OR EXISTS (
              SELECT 1 FROM jsonb_array_elements_text(p_filters->'Rating') r_val
              WHERE (r_val = '4★ & above' AND COALESCE(p.rating, 0) >= 4)
                 OR (r_val = '3★ & above' AND COALESCE(p.rating, 0) >= 3)
                 OR (r_val = '2★ & above' AND COALESCE(p.rating, 0) >= 2)
            )
          )
          AND
          (
            NOT (p_filters ? 'Discount')
            OR EXISTS (
              SELECT 1 FROM jsonb_array_elements_text(p_filters->'Discount') d_val
              WHERE (d_val = '70% or more' AND COALESCE(pv.discount_percent, 0) >= 70)
                 OR (d_val = '50% or more' AND COALESCE(pv.discount_percent, 0) >= 50)
                 OR (d_val = '25% or more' AND COALESCE(pv.discount_percent, 0) >= 25)
                 OR (d_val = '10% or more' AND COALESCE(pv.discount_percent, 0) >= 10)
            )
          )
          AND
          (
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
    -- Normal Attributes
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
        ag.name, ag.display_type, ag.id::text, ag.allow_search, ag.max_visible, ag.is_collapsed_default,
        av.value, av.hex_color, av.sort_order
    ) agg_table
    GROUP BY 1, 2, 3, 4, 5, 6

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
        'zz-brand'       AS grp_sort,
        true             AS allow_search,
        6                AS max_visible,
        false            AS is_collapsed_default,
        p.brand          AS val,
        COUNT(p.id)      AS cnt
      FROM public.products p
    INNER JOIN LATERAL (
      SELECT v.price, v.discount_percent, v.images, v.gst_rate
      FROM public.product_variants v
      WHERE v.product_id = p.id AND v.is_active = true
      ORDER BY v.is_primary DESC, v.created_at ASC
      LIMIT 1
    ) pv ON true
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
        ORDER BY agg_table.val_sort, agg_table.val
      ) AS values_array
    FROM (
      SELECT
        'Category'       AS attr_name,
        'list'           AS display_type,
        '00-category'    AS grp_sort,
        false            AS allow_search,
        10               AS max_visible,
        false            AS is_collapsed_default,
        cn.name          AS val,
        cn.sort_order    AS val_sort,
        COUNT(p.id)      AS cnt
      FROM public.products p
      JOIN public.navigation_nodes cn ON cn.id = p.nav_node_id
      WHERE p.is_active = true
        AND p.search_vector @@ v_tsquery
      GROUP BY cn.id, cn.name, cn.sort_order
    ) agg_table
    GROUP BY 1, 2, 3, 4, 5, 6

    UNION ALL

    -- Rating pseudo-facet
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
        'zy-rating'      AS grp_sort,
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
      WHERE p.is_active = true
        AND p.search_vector @@ v_tsquery
        AND COALESCE(p.rating, 0) >= bucket.min_rating
      GROUP BY bucket.val, bucket.min_rating
      HAVING COUNT(p.id) > 0
    ) agg_table
    GROUP BY 1, 2, 3, 4, 5, 6

    UNION ALL

    -- Discount pseudo-facet
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
        'zx-discount'    AS grp_sort,
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
      WHERE p.is_active = true
        AND p.search_vector @@ v_tsquery
        AND COALESCE(pv.discount_percent, 0) >= bucket.min_discount
      GROUP BY bucket.val, bucket.min_discount
      HAVING COUNT(p.id) > 0
    ) agg_table
    GROUP BY 1, 2, 3, 4, 5, 6

  ) grp_data;

  RETURN jsonb_build_object(
    'metadata', jsonb_build_object('product_count', v_total, 'has_children', false),
    'facets', COALESCE(v_facets, '{}'::jsonb),
    'products', COALESCE(v_products, '[]'::jsonb),
    'totalCount', COALESCE(v_total, 0),
    'hasNextPage', (p_offset + p_limit) < COALESCE(v_total, 0)
  );
END;
$$;


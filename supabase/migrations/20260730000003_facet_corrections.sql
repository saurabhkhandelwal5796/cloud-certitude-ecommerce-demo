-- ============================================================
-- Migration: Facet Corrections (Phase 3.1)
-- Date: 2026-07-30
--
-- 1. Treat products.brand as a pseudo attribute.
-- 2. Remove "AND v.quantity > 0" to keep Qty=0 variants visible.
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- 1. get_category_facets
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.get_category_facets(p_category TEXT)
RETURNS JSONB AS $$
DECLARE
  v_result JSONB;
BEGIN
  SELECT COALESCE(
    jsonb_object_agg(attr_name, values_array ORDER BY attr_name),
    '{}'::jsonb
  ) INTO v_result
  FROM (
    SELECT
      a.name AS attr_name,
      jsonb_agg(DISTINCT av.value ORDER BY av.value) AS values_array
    FROM products p
    JOIN product_variants v       ON v.product_id = p.id
    JOIN variant_attribute_values vav ON vav.variant_id = v.id
    JOIN attributes a             ON a.id = vav.attribute_id
    JOIN attribute_values av      ON av.id = vav.attribute_value_id
    WHERE (p_category = 'All' OR p.category = p_category)
      AND p.is_active = true
      AND v.is_active = true
    GROUP BY a.name

    UNION ALL

    SELECT
      'Brand' AS attr_name,
      jsonb_agg(DISTINCT p.brand ORDER BY p.brand) AS values_array
    FROM products p
    WHERE (p_category = 'All' OR p.category = p_category)
      AND p.is_active = true
      AND p.brand IS NOT NULL
      AND p.brand <> ''
      AND EXISTS (
        SELECT 1 FROM product_variants v WHERE v.product_id = p.id AND v.is_active = true
      )
  ) final;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER;


-- ────────────────────────────────────────────────────────────
-- 2. get_subcategory_facets
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.get_subcategory_facets(p_subcategory_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_result JSONB;
BEGIN
  SELECT COALESCE(
    jsonb_object_agg(attr_name, values_array ORDER BY attr_name),
    '{}'::jsonb
  ) INTO v_result
  FROM (
    SELECT
      a.name AS attr_name,
      jsonb_agg(DISTINCT av.value ORDER BY av.value) AS values_array
    FROM products p
    JOIN product_variants v           ON v.product_id = p.id
    JOIN variant_attribute_values vav ON vav.variant_id = v.id
    JOIN attributes a                 ON a.id = vav.attribute_id
    JOIN attribute_values av          ON av.id = vav.attribute_value_id
    -- Only include attributes whose group is linked to this subcategory
    JOIN subcategory_attribute_groups sag
      ON sag.subcategory_id = p_subcategory_id
      AND sag.attribute_group_id = a.group_id
    WHERE p.subcategory_id = p_subcategory_id
      AND p.is_active = true
      AND v.is_active = true
    GROUP BY a.name

    UNION ALL

    SELECT
      'Brand' AS attr_name,
      jsonb_agg(DISTINCT p.brand ORDER BY p.brand) AS values_array
    FROM products p
    WHERE p.subcategory_id = p_subcategory_id
      AND p.is_active = true
      AND p.brand IS NOT NULL
      AND p.brand <> ''
      AND EXISTS (
        SELECT 1 FROM product_variants v WHERE v.product_id = p.id AND v.is_active = true
      )
  ) final;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER;


-- ────────────────────────────────────────────────────────────
-- 3. get_search_facets
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.get_search_facets(p_product_ids UUID[])
RETURNS JSONB AS $$
DECLARE
  v_result JSONB;
BEGIN
  -- Early exit for empty array to avoid a full table scan
  IF p_product_ids IS NULL OR array_length(p_product_ids, 1) IS NULL THEN
    RETURN '{}'::jsonb;
  END IF;

  SELECT COALESCE(
    jsonb_object_agg(attr_name, values_array ORDER BY attr_name),
    '{}'::jsonb
  ) INTO v_result
  FROM (
    SELECT
      a.name AS attr_name,
      jsonb_agg(DISTINCT av.value ORDER BY av.value) AS values_array
    FROM products p
    JOIN product_variants v           ON v.product_id = p.id
    JOIN variant_attribute_values vav ON vav.variant_id = v.id
    JOIN attributes a                 ON a.id = vav.attribute_id
    JOIN attribute_values av          ON av.id = vav.attribute_value_id
    WHERE p.id = ANY(p_product_ids)
      AND p.is_active = true
      AND v.is_active = true
    GROUP BY a.name

    UNION ALL

    SELECT
      'Brand' AS attr_name,
      jsonb_agg(DISTINCT p.brand ORDER BY p.brand) AS values_array
    FROM products p
    WHERE p.id = ANY(p_product_ids)
      AND p.is_active = true
      AND p.brand IS NOT NULL
      AND p.brand <> ''
      AND EXISTS (
        SELECT 1 FROM product_variants v WHERE v.product_id = p.id AND v.is_active = true
      )
  ) final;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER;

-- Re-apply grants just in case
GRANT EXECUTE ON FUNCTION public.get_category_facets(TEXT)     TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_subcategory_facets(UUID)  TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_search_facets(UUID[])     TO anon, authenticated;

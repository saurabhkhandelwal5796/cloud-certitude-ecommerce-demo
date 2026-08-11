-- ============================================================
-- Migration: Create get_category_facets RPC for Dynamic Filters
-- Date: 2026-07-28
-- Description: Creates an RPC to aggregate available attributes and 
-- their values for a given category based only on active, in-stock products.
-- ============================================================

CREATE OR REPLACE FUNCTION get_category_facets(p_category TEXT)
RETURNS JSONB AS $$
DECLARE
  v_result JSONB;
BEGIN
  SELECT COALESCE(jsonb_agg(
    jsonb_build_object(
      'attributeName', attr_name,
      'type', 'multi-select',
      'values', values_array
    )
  ), '[]'::jsonb) INTO v_result
  FROM (
    SELECT
      a.name AS attr_name,
      jsonb_agg(
        jsonb_build_object(
          'id', av.id,
          'label', av.value,
          'count', v_count
        )
      ) AS values_array
    FROM (
      SELECT
        vav.attribute_id,
        vav.attribute_value_id,
        COUNT(DISTINCT v.id) AS v_count
      FROM products p
      JOIN product_variants v ON v.product_id = p.id
      JOIN variant_attribute_values vav ON vav.variant_id = v.id
      WHERE (p_category = 'All' OR p.category = p_category)
        AND p.is_active = true
        AND v.is_active = true
        AND v.quantity > 0
      GROUP BY vav.attribute_id, vav.attribute_value_id
    ) agg
    JOIN attributes a ON a.id = agg.attribute_id
    JOIN attribute_values av ON av.id = agg.attribute_value_id
    GROUP BY a.name
  ) final;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER;

-- Grant execution to public and authenticated so storefront can fetch filters
GRANT EXECUTE ON FUNCTION get_category_facets(TEXT) TO PUBLIC;
GRANT EXECUTE ON FUNCTION get_category_facets(TEXT) TO authenticated;

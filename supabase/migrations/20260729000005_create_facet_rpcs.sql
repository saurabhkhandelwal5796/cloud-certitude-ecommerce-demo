-- ============================================================
-- Migration: Dynamic Facets RPCs
-- Date: 2026-07-29
--
-- 1. Creates subcategory_attribute_groups junction table
--    (links a subcategory to 1+ attribute groups)
-- 2. Replaces the old get_category_facets RPC with a new version
--    that is subcategory-aware and consistent with this schema.
-- 3. Creates get_subcategory_facets(p_subcategory_id UUID)
-- 4. Creates get_search_facets(p_product_ids UUID[])
-- ============================================================


-- ────────────────────────────────────────────────────────────
-- 1. subcategory_attribute_groups junction table
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.subcategory_attribute_groups (
  subcategory_id     UUID NOT NULL REFERENCES public.subcategories(id) ON DELETE CASCADE,
  attribute_group_id UUID NOT NULL REFERENCES public.attribute_groups(id) ON DELETE CASCADE,
  sort_order         INT  NOT NULL DEFAULT 0,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),

  PRIMARY KEY (subcategory_id, attribute_group_id)
);

CREATE INDEX IF NOT EXISTS idx_sag_subcategory_id
  ON public.subcategory_attribute_groups (subcategory_id);

CREATE INDEX IF NOT EXISTS idx_sag_attribute_group_id
  ON public.subcategory_attribute_groups (attribute_group_id);

-- Enable RLS (admin only for writes, public read)
ALTER TABLE public.subcategory_attribute_groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read subcategory_attribute_groups"
  ON public.subcategory_attribute_groups FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "Admin insert subcategory_attribute_groups"
  ON public.subcategory_attribute_groups FOR INSERT
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admin delete subcategory_attribute_groups"
  ON public.subcategory_attribute_groups FOR DELETE
  USING (public.is_admin(auth.uid()));


-- ────────────────────────────────────────────────────────────
-- 2. get_category_facets (replace existing RPC)
--
--    Generates facets for a top-level category page (/men, /women).
--    Returns all attribute values that appear on at least one
--    active, in-stock product in the category.
--    When p_category = 'All', returns facets for the entire catalogue.
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION get_category_facets(p_category TEXT)
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
      AND v.quantity > 0
    GROUP BY a.name
  ) final;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER;

GRANT EXECUTE ON FUNCTION get_category_facets(TEXT) TO PUBLIC;
GRANT EXECUTE ON FUNCTION get_category_facets(TEXT) TO authenticated;


-- ────────────────────────────────────────────────────────────
-- 3. get_subcategory_facets
--
--    Generates facets for a subcategory page (e.g. /men/jeans).
--    Only returns attribute groups that are explicitly linked to the
--    subcategory via subcategory_attribute_groups.
--    Intersects with active, in-stock products in that subcategory.
--    This ensures Men -> Jeans never shows "Half Sleeve".
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION get_subcategory_facets(p_subcategory_id UUID)
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
      AND v.quantity > 0
    GROUP BY a.name
  ) final;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER;

GRANT EXECUTE ON FUNCTION get_subcategory_facets(UUID) TO PUBLIC;
GRANT EXECUTE ON FUNCTION get_subcategory_facets(UUID) TO authenticated;


-- ────────────────────────────────────────────────────────────
-- 4. get_search_facets
--
--    Generates facets for a text-search result set.
--    Accepts an array of product IDs returned from the search query.
--    Returns only attribute values that appear on those specific products.
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION get_search_facets(p_product_ids UUID[])
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
      AND v.quantity > 0
    GROUP BY a.name
  ) final;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER;

GRANT EXECUTE ON FUNCTION get_search_facets(UUID[]) TO PUBLIC;
GRANT EXECUTE ON FUNCTION get_search_facets(UUID[]) TO authenticated;

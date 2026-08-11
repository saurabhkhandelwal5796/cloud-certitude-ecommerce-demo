-- =============================================================
-- Migration: Product-Level Attribute Selection Store
-- Date: 2026-08-05
--
-- Creates product_selected_attribute_values — a clean junction
-- table that records which attribute values an admin has ticked
-- for a product BEFORE any variants are generated.
--
-- This replaces the legacy compatibility shim in setProductAttributes()
-- that auto-created a "-BASE" product_variant (price: 0) solely to
-- have a variant_id anchor for variant_attribute_values.
--
-- Architecture:
--   products  →  product_selected_attribute_values  ←  attribute_values
--
-- This table has NO relationship to product_variants.
-- It stores catalog-level attribute intent, not variant instances.
-- =============================================================

-- 1. Create the table
CREATE TABLE IF NOT EXISTS public.product_selected_attribute_values (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id       TEXT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  attribute_value_id UUID NOT NULL REFERENCES public.attribute_values(id) ON DELETE CASCADE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT uq_product_attr_value UNIQUE (product_id, attribute_value_id)
);

-- 2. Enable RLS
ALTER TABLE public.product_selected_attribute_values ENABLE ROW LEVEL SECURITY;

-- 3. Public SELECT — storefront and admin reads
DROP POLICY IF EXISTS "Public read product_selected_attribute_values" ON public.product_selected_attribute_values;
CREATE POLICY "Public read product_selected_attribute_values"
  ON public.product_selected_attribute_values FOR SELECT
  USING (true);

-- 4. Admin INSERT
DROP POLICY IF EXISTS "Admin insert product_selected_attribute_values" ON public.product_selected_attribute_values;
CREATE POLICY "Admin insert product_selected_attribute_values"
  ON public.product_selected_attribute_values FOR INSERT
  WITH CHECK (public.is_admin(auth.uid()));

-- 5. Admin DELETE
DROP POLICY IF EXISTS "Admin delete product_selected_attribute_values" ON public.product_selected_attribute_values;
CREATE POLICY "Admin delete product_selected_attribute_values"
  ON public.product_selected_attribute_values FOR DELETE
  USING (public.is_admin(auth.uid()));

-- 6. Performance index on product_id (primary query pattern)
CREATE INDEX IF NOT EXISTS idx_psa_product_id
  ON public.product_selected_attribute_values (product_id);

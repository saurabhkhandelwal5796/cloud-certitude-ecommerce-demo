-- ============================================================
-- Migration: Database Index Hardening
-- Date: 2026-07-30
-- Updated: 2026-07-31 — removed indexes on dropped tables/columns
-- (product_attribute_values and products.subcategory_id are removed
--  in migration 20260731000008_drop_subcategories_safe.sql)
-- ============================================================

-- 1. variant_attribute_values
CREATE INDEX IF NOT EXISTS idx_vav_variant_id ON public.variant_attribute_values USING btree (variant_id);
CREATE INDEX IF NOT EXISTS idx_vav_attribute_id ON public.variant_attribute_values USING btree (attribute_id);
CREATE INDEX IF NOT EXISTS idx_vav_attr_val_id ON public.variant_attribute_values USING btree (attribute_value_id);

-- 2. product_variants
CREATE INDEX IF NOT EXISTS idx_pv_product_id ON public.product_variants USING btree (product_id);
CREATE INDEX IF NOT EXISTS idx_pv_is_active ON public.product_variants USING btree (is_active);

-- 3. orders
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON public.orders USING btree (customer_email);

-- 4. products
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products USING btree (category);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON public.products USING btree (is_active);

-- ============================================================
-- Migration: Backfill default variants for existing products
--
-- Creates exactly ONE default variant per product that does
-- not already have a variant.
--
-- SKU format: DEFAULT-{product_id}
-- Price/quantity/is_active are copied from the products row.
-- discount_percent from products is converted to discounted_price.
--
-- SAFE: Uses NOT EXISTS guard — idempotent, can be run multiple times.
-- ============================================================

INSERT INTO public.product_variants (
  product_id,
  sku,
  variant_name,
  price,
  discounted_price,
  quantity,
  is_active,
  created_at,
  updated_at
)
SELECT
  p.id                                                  AS product_id,
  'DEFAULT-' || p.id                                    AS sku,
  'Default'                                             AS variant_name,
  COALESCE(p.price, 0)                                  AS price,
  CASE
    WHEN COALESCE(p.discount_percent, 0) > 0
    THEN ROUND(p.price * (1 - p.discount_percent / 100.0), 2)
    ELSE NULL
  END                                                   AS discounted_price,
  COALESCE(p.stock, 0)                                  AS quantity,
  COALESCE(p.is_active, true)                           AS is_active,
  timezone('utc'::text, now())                          AS created_at,
  timezone('utc'::text, now())                          AS updated_at
FROM public.products p
WHERE NOT EXISTS (
  SELECT 1
  FROM public.product_variants pv
  WHERE pv.product_id = p.id
);

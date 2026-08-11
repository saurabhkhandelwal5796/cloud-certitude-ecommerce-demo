-- ============================================================
-- Migration: Move GST from products to product_variants
-- Date: 2026-08-07
-- ============================================================
-- SAFE TO RUN MULTIPLE TIMES (idempotent)
-- ============================================================

-- Step 1: Add gst_rate column to product_variants
ALTER TABLE product_variants
  ADD COLUMN IF NOT EXISTS gst_rate NUMERIC NOT NULL DEFAULT 5;

-- Step 2: Backfill — copy each product's gst_rate into its variants
UPDATE product_variants pv
SET gst_rate = COALESCE(p.gst_rate, 5)
FROM products p
WHERE pv.product_id = p.id;

-- Step 3: Create index for query performance
CREATE INDEX IF NOT EXISTS idx_product_variants_gst_rate ON product_variants(gst_rate);

-- ============================================================
-- NOTE: products.gst_rate is intentionally NOT dropped here.
-- It is preserved for rollback safety and legacy read compatibility.
-- A follow-up migration can drop it once everything is verified.
-- ============================================================

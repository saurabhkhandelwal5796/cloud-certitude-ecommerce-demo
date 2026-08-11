-- ============================================================
-- Migration: 20260811000001_add_gst_rate_to_product_variants
-- Date: 2026-08-11
--
-- Purpose:
--   The GST rate column was added to product_variants via a local
--   migration (migrations/20260807_move_gst_to_variants.sql) but was
--   never applied to the live database via Supabase CLI.
--
--   The AdminVariantService.ts query explicitly selects `gst_rate`
--   from product_variants. Without this column, PostgREST returns
--   a schema error that causes the entire variants list to fail to load.
--
-- Architecture:
--   Product Variant is the sellable entity and owns GST rate.
--   products.gst_rate is NOT restored here.
--   Only product_variants.gst_rate is added.
--
-- Safety:
--   - Idempotent: uses ADD COLUMN IF NOT EXISTS.
--   - Non-destructive: adds column with safe default of 5 (5% GST).
--   - Backfills existing rows from products.gst_rate if the column exists.
--   - Creates an index for query performance.
-- ============================================================

-- Step 1: Add gst_rate column to product_variants
ALTER TABLE public.product_variants
  ADD COLUMN IF NOT EXISTS gst_rate NUMERIC NOT NULL DEFAULT 5;

-- Step 2: Backfill from products.gst_rate where it exists on the product.
-- COALESCE to 5 in case products.gst_rate is NULL.
-- Uses a DO block with an existence check to avoid an error
-- if products.gst_rate was already dropped.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = 'products'
      AND column_name  = 'gst_rate'
  ) THEN
    UPDATE public.product_variants pv
    SET gst_rate = COALESCE(p.gst_rate, 5)
    FROM public.products p
    WHERE pv.product_id = p.id
      AND pv.gst_rate = 5;  -- Only backfill rows still at default (not already set)
  END IF;
END;
$$;

-- Step 3: Index for filtering/sorting by GST rate
CREATE INDEX IF NOT EXISTS idx_product_variants_gst_rate
  ON public.product_variants (gst_rate);

-- ==========================================================================
-- Migration: add_is_primary_to_product_variants
-- Date:      20260806
--
-- Purpose:
--   The application code (VariantService.ts) expects a product_variants.is_primary
--   column that designates exactly ONE variant per product as the "Primary Variant"
--   (the single source of truth for the product image and representative data).
--   This column was never added to the database schema.
--
-- Safety:
--   - Idempotent: uses IF NOT EXISTS / IF EXISTS guards throughout.
--   - Non-destructive: adds a column with a safe default (false).
--   - Backfills existing data without data loss.
--   - Uses a partial unique index (not a full unique constraint) so the
--     uniqueness rule only applies to rows where is_primary = true.
-- ==========================================================================

-- Step 1: Add the column
-- Safe to run multiple times. Has no effect if column already exists.
ALTER TABLE public.product_variants
  ADD COLUMN IF NOT EXISTS is_primary BOOLEAN NOT NULL DEFAULT false;

-- Step 2: Partial unique index
-- Enforces at the DB level that at most ONE variant per product_id
-- can have is_primary = true. Non-primary variants are not constrained.
CREATE UNIQUE INDEX IF NOT EXISTS uix_primary_variant_per_product
  ON public.product_variants (product_id)
  WHERE (is_primary = true);

-- Step 3: Backfill existing products
-- For every product that has at least one variant but no primary variant yet,
-- elect the oldest variant (by created_at ASC) as the primary.
DO $$
DECLARE
  v_product_id TEXT;
  v_oldest_variant_id UUID;
  v_already_has_primary INT;
BEGIN
  FOR v_product_id IN
    SELECT DISTINCT product_id FROM public.product_variants
  LOOP
    SELECT COUNT(*) INTO v_already_has_primary
    FROM public.product_variants
    WHERE product_id = v_product_id
      AND is_primary = true;

    IF v_already_has_primary = 0 THEN
      SELECT id INTO v_oldest_variant_id
      FROM public.product_variants
      WHERE product_id = v_product_id
      ORDER BY created_at ASC
      LIMIT 1;

      IF v_oldest_variant_id IS NOT NULL THEN
        UPDATE public.product_variants
          SET is_primary = true
          WHERE id = v_oldest_variant_id;
      END IF;
    END IF;
  END LOOP;
END;
$$;

-- Verification (uncomment and run separately to confirm):
-- SELECT product_id, COUNT(*) AS primary_count
-- FROM public.product_variants
-- WHERE is_primary = true
-- GROUP BY product_id
-- HAVING COUNT(*) <> 1;
-- (Should return 0 rows.)

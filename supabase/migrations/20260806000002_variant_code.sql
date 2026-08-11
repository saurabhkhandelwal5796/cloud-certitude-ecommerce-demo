-- ============================================================
-- Migration: 20260806000001_variant_code
-- Purpose  : Introduce an immutable, human-readable Variant Code
--            (e.g. VAR-000001) to every product_variants row.
-- ============================================================

-- 1. Create sequence (never drops, so rerun is a no-op)
CREATE SEQUENCE IF NOT EXISTS variant_code_seq
  START WITH 1
  INCREMENT BY 1
  NO MINVALUE
  NO MAXVALUE
  CACHE 1;

-- 2. Add the column — allow empty string temporarily
ALTER TABLE public.product_variants
  ADD COLUMN IF NOT EXISTS variant_code TEXT NOT NULL DEFAULT '';

-- 3. Backfill existing rows in strict created_at ASC order
DO $$
DECLARE
  r RECORD;
  next_code TEXT;
BEGIN
  FOR r IN
    SELECT id
    FROM public.product_variants
    WHERE variant_code = ''
    ORDER BY created_at ASC, id ASC
  LOOP
    next_code := 'VAR-' || LPAD(nextval('variant_code_seq')::TEXT, 6, '0');
    UPDATE public.product_variants
    SET variant_code = next_code
    WHERE id = r.id;
  END LOOP;
END;
$$;

-- 4. Drop the default so future inserts cannot accidentally get empty string
ALTER TABLE public.product_variants
  ALTER COLUMN variant_code DROP DEFAULT;

-- 5. Create unique constraint (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'uq_product_variants_variant_code'
      AND conrelid = 'public.product_variants'::regclass
  ) THEN
    ALTER TABLE public.product_variants
      ADD CONSTRAINT uq_product_variants_variant_code UNIQUE (variant_code);
  END IF;
END;
$$;

-- 6. Create a B-TREE index for fast lookups / search
CREATE INDEX IF NOT EXISTS idx_product_variants_variant_code
  ON public.product_variants (variant_code);

-- 7. Trigger function: auto-sets variant_code on INSERT
CREATE OR REPLACE FUNCTION trg_set_variant_code()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.variant_code IS NULL OR NEW.variant_code = '' THEN
    NEW.variant_code := 'VAR-' || LPAD(nextval('variant_code_seq')::TEXT, 6, '0');
  END IF;
  RETURN NEW;
END;
$$;

-- 8. Attach the trigger (drop first to make idempotent)
DROP TRIGGER IF EXISTS trg_product_variants_variant_code ON public.product_variants;

CREATE TRIGGER trg_product_variants_variant_code
  BEFORE INSERT ON public.product_variants
  FOR EACH ROW
  EXECUTE FUNCTION trg_set_variant_code();

-- 9. Grant sequence usage to roles
GRANT USAGE ON SEQUENCE variant_code_seq TO authenticated;
GRANT USAGE ON SEQUENCE variant_code_seq TO anon;

-- 1. Add is_primary column
ALTER TABLE public.product_variants ADD COLUMN IF NOT EXISTS is_primary BOOLEAN NOT NULL DEFAULT false;

-- 2. Partial Unique Index (only one primary per product)
CREATE UNIQUE INDEX IF NOT EXISTS unique_primary_variant_per_product ON public.product_variants (product_id) WHERE is_primary = true;

-- 3. Backfill existing data
-- We want to make the oldest variant of each product the primary one
DO $$
DECLARE
  prod RECORD;
  first_var_id UUID;
BEGIN
  FOR prod IN SELECT DISTINCT product_id FROM public.product_variants LOOP
    SELECT id INTO first_var_id
    FROM public.product_variants
    WHERE product_id = prod.product_id
    ORDER BY created_at ASC
    LIMIT 1;
    
    IF first_var_id IS NOT NULL THEN
      UPDATE public.product_variants SET is_primary = true WHERE id = first_var_id;
    END IF;
  END LOOP;
END;
$$;

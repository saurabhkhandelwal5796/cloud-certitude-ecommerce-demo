-- Add images column to product_variants if it doesn't exist
ALTER TABLE public.product_variants 
ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}';

-- Optional: Drop variant_name (uncomment if ready, but we will leave it for now to avoid breaking existing admin UI until updated)
-- ALTER TABLE public.product_variants DROP COLUMN variant_name;

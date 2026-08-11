-- 1. Add the column
ALTER TABLE product_variants ADD COLUMN variant_signature TEXT DEFAULT '';

-- 2. Backfill existing data using string_agg
UPDATE product_variants pv
SET variant_signature = COALESCE(sub.signature, '')
FROM (
  SELECT variant_id, string_agg(attribute_value_id::text, '|' ORDER BY attribute_value_id::text) as signature
  FROM variant_attribute_values
  GROUP BY variant_id
) sub
WHERE pv.id = sub.variant_id;

-- 3. Add the unique constraint
ALTER TABLE product_variants ADD CONSTRAINT uq_product_signature UNIQUE (product_id, variant_signature);

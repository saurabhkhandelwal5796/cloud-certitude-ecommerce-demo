-- ============================================================
-- Migration: product_attribute_values
-- Junction table linking products to attribute values from
-- the Dynamic Product Attribute Engine.
--
-- product_id is TEXT (not UUID FK) because products can have
-- non-UUID ids like "product_1234567890" when created in-app.
--
-- Each (product_id, attribute_value_id) pair is unique so
-- the same value cannot be assigned to the same product twice.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.product_attribute_values (
  id                 UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id         TEXT        NOT NULL,
  attribute_id       UUID        NOT NULL
                       REFERENCES public.attributes(id)
                       ON DELETE CASCADE,
  attribute_value_id UUID        NOT NULL
                       REFERENCES public.attribute_values(id)
                       ON DELETE CASCADE,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),

  CONSTRAINT uq_product_attribute_value
    UNIQUE (product_id, attribute_value_id)
);

-- Fast lookups by product
CREATE INDEX IF NOT EXISTS idx_pav_product_id
  ON public.product_attribute_values (product_id);

-- Fast lookups by value (useful for future filter queries)
CREATE INDEX IF NOT EXISTS idx_pav_attribute_value_id
  ON public.product_attribute_values (attribute_value_id);

-- Fast lookups by attribute (useful for filter facets)
CREATE INDEX IF NOT EXISTS idx_pav_attribute_id
  ON public.product_attribute_values (attribute_id);

-- Enable RLS
ALTER TABLE public.product_attribute_values ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow select product_attribute_values" ON public.product_attribute_values;
CREATE POLICY "Allow select product_attribute_values"
  ON public.product_attribute_values FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow insert product_attribute_values" ON public.product_attribute_values;
CREATE POLICY "Allow insert product_attribute_values"
  ON public.product_attribute_values FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow update product_attribute_values" ON public.product_attribute_values;
CREATE POLICY "Allow update product_attribute_values"
  ON public.product_attribute_values FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow delete product_attribute_values" ON public.product_attribute_values;
CREATE POLICY "Allow delete product_attribute_values"
  ON public.product_attribute_values FOR DELETE USING (true);

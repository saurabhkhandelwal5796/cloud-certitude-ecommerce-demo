-- ============================================================
-- Migration: product_attribute_group
-- Stores exactly ONE attribute group per product.
--
-- UNIQUE(product_id) is the DB-level enforcement of
-- "one group per product". An upsert (ON CONFLICT DO UPDATE)
-- is used when the admin changes a product's group.
--
-- ON DELETE CASCADE on attribute_group_id means that if an
-- attribute group is deleted, the product loses its group
-- assignment automatically (returns to "unassigned" state).
-- ============================================================

CREATE TABLE IF NOT EXISTS public.product_attribute_group (
  id                 UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id         TEXT        NOT NULL,
  attribute_group_id UUID        NOT NULL
                       REFERENCES public.attribute_groups(id)
                       ON DELETE CASCADE,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),

  CONSTRAINT uq_product_attribute_group_product
    UNIQUE (product_id)
);

CREATE INDEX IF NOT EXISTS idx_pag_product_id
  ON public.product_attribute_group (product_id);

CREATE INDEX IF NOT EXISTS idx_pag_attribute_group_id
  ON public.product_attribute_group (attribute_group_id);

ALTER TABLE public.product_attribute_group ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow select product_attribute_group" ON public.product_attribute_group;
CREATE POLICY "Allow select product_attribute_group"
  ON public.product_attribute_group FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow insert product_attribute_group" ON public.product_attribute_group;
CREATE POLICY "Allow insert product_attribute_group"
  ON public.product_attribute_group FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow update product_attribute_group" ON public.product_attribute_group;
CREATE POLICY "Allow update product_attribute_group"
  ON public.product_attribute_group FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow delete product_attribute_group" ON public.product_attribute_group;
CREATE POLICY "Allow delete product_attribute_group"
  ON public.product_attribute_group FOR DELETE USING (true);

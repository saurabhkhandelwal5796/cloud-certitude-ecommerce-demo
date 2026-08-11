-- ============================================================
-- Migration: variant_attribute_values
--
-- Links specific attribute values (e.g. "Blue", "Size 30")
-- to individual product variants.
--
-- A variant can have many attribute values.
-- The unique constraint prevents duplicate assignments of the
-- same (variant, attribute) combination.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.variant_attribute_values (
  id                 UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  variant_id         UUID        NOT NULL
                       REFERENCES public.product_variants(id) ON DELETE CASCADE,
  attribute_id       UUID        NOT NULL
                       REFERENCES public.attributes(id)        ON DELETE CASCADE,
  attribute_value_id UUID        NOT NULL
                       REFERENCES public.attribute_values(id)  ON DELETE CASCADE,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),

  -- Prevents assigning the same attribute value twice to the same variant
  CONSTRAINT uq_variant_attribute_values
    UNIQUE (variant_id, attribute_id, attribute_value_id)
);

-- ── Indexes ────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_vav_variant_id
  ON public.variant_attribute_values (variant_id);

CREATE INDEX IF NOT EXISTS idx_vav_attribute_id
  ON public.variant_attribute_values (attribute_id);

CREATE INDEX IF NOT EXISTS idx_vav_attribute_value_id
  ON public.variant_attribute_values (attribute_value_id);

-- ── Row Level Security ──────────────────────────────────────────────────────

ALTER TABLE public.variant_attribute_values ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow select variant_attribute_values"  ON public.variant_attribute_values;
CREATE POLICY "Allow select variant_attribute_values"
  ON public.variant_attribute_values FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow insert variant_attribute_values"  ON public.variant_attribute_values;
CREATE POLICY "Allow insert variant_attribute_values"
  ON public.variant_attribute_values FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow update variant_attribute_values"  ON public.variant_attribute_values;
CREATE POLICY "Allow update variant_attribute_values"
  ON public.variant_attribute_values FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow delete variant_attribute_values"  ON public.variant_attribute_values;
CREATE POLICY "Allow delete variant_attribute_values"
  ON public.variant_attribute_values FOR DELETE USING (true);

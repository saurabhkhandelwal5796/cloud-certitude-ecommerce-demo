-- ============================================================
-- Migration: Dynamic Product Attribute Engine
-- Creates attribute_groups, attributes, and attribute_values
-- tables that power Amazon/Flipkart-style product filters.
--
-- Hierarchy:
--   attribute_groups  →  attributes  →  attribute_values
--       (Jeans)            (Fit)        (Slim, Skinny)
-- ============================================================


-- ────────────────────────────────────────────────────────────
-- 1. attribute_groups
--    Top-level containers (e.g. Jeans, Shirts, Shoes)
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.attribute_groups (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT        NOT NULL,
  description TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_attribute_groups_name
  ON public.attribute_groups (name);

ALTER TABLE public.attribute_groups ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow select attribute_groups" ON public.attribute_groups;
CREATE POLICY "Allow select attribute_groups"
  ON public.attribute_groups FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow insert attribute_groups" ON public.attribute_groups;
CREATE POLICY "Allow insert attribute_groups"
  ON public.attribute_groups FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow update attribute_groups" ON public.attribute_groups;
CREATE POLICY "Allow update attribute_groups"
  ON public.attribute_groups FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow delete attribute_groups" ON public.attribute_groups;
CREATE POLICY "Allow delete attribute_groups"
  ON public.attribute_groups FOR DELETE USING (true);


-- ────────────────────────────────────────────────────────────
-- 2. attributes
--    Named attributes scoped to a group (e.g. Fit, Rise, Sleeve)
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.attributes (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id   UUID        NOT NULL
               REFERENCES public.attribute_groups(id)
               ON DELETE CASCADE,
  name       TEXT        NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_attributes_group_id
  ON public.attributes (group_id);

ALTER TABLE public.attributes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow select attributes" ON public.attributes;
CREATE POLICY "Allow select attributes"
  ON public.attributes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow insert attributes" ON public.attributes;
CREATE POLICY "Allow insert attributes"
  ON public.attributes FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow update attributes" ON public.attributes;
CREATE POLICY "Allow update attributes"
  ON public.attributes FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow delete attributes" ON public.attributes;
CREATE POLICY "Allow delete attributes"
  ON public.attributes FOR DELETE USING (true);


-- ────────────────────────────────────────────────────────────
-- 3. attribute_values
--    Leaf values under an attribute (e.g. Slim, Skinny, Loose)
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.attribute_values (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  attribute_id UUID        NOT NULL
                 REFERENCES public.attributes(id)
                 ON DELETE CASCADE,
  value        TEXT        NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_attribute_values_attribute_id
  ON public.attribute_values (attribute_id);

ALTER TABLE public.attribute_values ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow select attribute_values" ON public.attribute_values;
CREATE POLICY "Allow select attribute_values"
  ON public.attribute_values FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow insert attribute_values" ON public.attribute_values;
CREATE POLICY "Allow insert attribute_values"
  ON public.attribute_values FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow update attribute_values" ON public.attribute_values;
CREATE POLICY "Allow update attribute_values"
  ON public.attribute_values FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow delete attribute_values" ON public.attribute_values;
CREATE POLICY "Allow delete attribute_values"
  ON public.attribute_values FOR DELETE USING (true);

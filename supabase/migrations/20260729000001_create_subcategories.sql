-- ============================================================
-- Migration: Subcategories
-- Date: 2026-07-29
--
-- Creates the subcategories table and wires products to it via
-- a nullable UUID foreign key (products.subcategory_id).
--
-- Hierarchy introduced:
--   products.category (TEXT enum: 'Men', 'Women', 'Kids', ...)
--       ↓
--   subcategories  ← NEW
--       ↓
--   products.subcategory_id (UUID FK, nullable)  ← NEW COLUMN
--
-- Backfill:
--   All existing products retain subcategory_id = NULL.
--   No existing data is modified.
--
-- Safety:
--   ON DELETE SET NULL ensures deleting a subcategory never
--   orphans or deletes products — it simply clears the assignment.
-- ============================================================


-- ────────────────────────────────────────────────────────────
-- 1. subcategories table
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.subcategories (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT        NOT NULL,
  category_id TEXT        NOT NULL,
  description TEXT,
  is_active   BOOLEAN     NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),

  -- Prevent duplicate subcategory names within the same top-level category
  CONSTRAINT uq_subcategory_name_per_category UNIQUE (category_id, name)
);

-- Fast lookup by parent category (used by admin dropdown query)
CREATE INDEX IF NOT EXISTS idx_subcategories_category_id
  ON public.subcategories (category_id);

-- Fast lookup by active status (used in admin UI filtering)
CREATE INDEX IF NOT EXISTS idx_subcategories_is_active
  ON public.subcategories (is_active);


-- ────────────────────────────────────────────────────────────
-- 2. auto-update updated_at trigger
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.set_subcategories_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = timezone('utc', now());
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_subcategories_updated_at ON public.subcategories;
CREATE TRIGGER trg_subcategories_updated_at
  BEFORE UPDATE ON public.subcategories
  FOR EACH ROW EXECUTE FUNCTION public.set_subcategories_updated_at();


-- ────────────────────────────────────────────────────────────
-- 3. Row Level Security
-- ────────────────────────────────────────────────────────────
ALTER TABLE public.subcategories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow select subcategories" ON public.subcategories;
CREATE POLICY "Allow select subcategories"
  ON public.subcategories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow insert subcategories" ON public.subcategories;
CREATE POLICY "Allow insert subcategories"
  ON public.subcategories FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow update subcategories" ON public.subcategories;
CREATE POLICY "Allow update subcategories"
  ON public.subcategories FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow delete subcategories" ON public.subcategories;
CREATE POLICY "Allow delete subcategories"
  ON public.subcategories FOR DELETE USING (true);


-- ────────────────────────────────────────────────────────────
-- 4. Add subcategory_id column to products
--    - Nullable UUID, FK to subcategories.id
--    - ON DELETE SET NULL: deleting a subcategory never removes products
--    - All existing products backfilled with NULL (default behaviour)
-- ────────────────────────────────────────────────────────────
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS subcategory_id UUID
    REFERENCES public.subcategories(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_products_subcategory_id
  ON public.products (subcategory_id);


-- ────────────────────────────────────────────────────────────
-- 5. Seed initial subcategories (Men / Women / Kids)
-- ────────────────────────────────────────────────────────────
INSERT INTO public.subcategories (name, category_id, description) VALUES
  -- Men
  ('Jeans',      'Men',   'Denim jeans including slim, skinny, and straight fits'),
  ('Shirts',     'Men',   'Casual and formal shirts including half-sleeve and full-sleeve'),
  ('T-Shirts',   'Men',   'Everyday crew-neck and polo t-shirts'),
  ('Trousers',   'Men',   'Formal and casual trousers'),
  ('Cargo',      'Men',   'Cargo pants and utility trousers'),
  ('Jackets',    'Men',   'Lightweight jackets, bombers, and blazers'),
  ('Kurta',      'Men',   'Traditional kurta and ethnic wear'),

  -- Women
  ('Sarees',     'Women', 'Silk, cotton, and designer sarees'),
  ('Kurtis',     'Women', 'Everyday kurtis and tunics'),
  ('Dresses',    'Women', 'Casual and formal dresses'),
  ('Tops',       'Women', 'Western tops, blouses, and shirts'),
  ('Leggings',   'Women', 'Leggings and churidar bottoms'),
  ('Suits',      'Women', 'Salwar suits and Anarkali sets'),
  ('Jeans',      'Women', 'Women''s denim jeans and jeggings'),

  -- Kids
  ('T-Shirts',   'Kids',  'Kids casual t-shirts'),
  ('Shorts',     'Kids',  'Kids shorts and half pants'),
  ('Frocks',     'Kids',  'Girls frocks and dresses'),
  ('Shirts',     'Kids',  'Kids formal and casual shirts'),
  ('Jeans',      'Kids',  'Kids denim jeans')
ON CONFLICT (category_id, name) DO NOTHING;

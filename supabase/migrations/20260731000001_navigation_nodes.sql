-- ============================================================
-- Migration: navigation_nodes (Flipkart-style unlimited hierarchy)
-- Date: 2026-07-31
--
-- Introduces a self-referencing navigation tree that supports
-- unlimited depth with pre-computed full_path for O(log n) URL lookups.
--
-- Key design decisions:
--   1. full_path is trigger-maintained — no recursive CTE at read time.
--   2. Products point to leaf nodes via nav_node_id FK.
--   3. Old category/subcategory columns are untouched (backward compat).
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- 1. navigation_nodes
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.navigation_nodes (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT        NOT NULL,
  slug        TEXT        NOT NULL,
  parent_id   UUID        REFERENCES public.navigation_nodes(id) ON DELETE CASCADE,
  level       INT         NOT NULL DEFAULT 0,
  icon        TEXT,
  sort_order  INT         NOT NULL DEFAULT 0,
  is_active   BOOLEAN     NOT NULL DEFAULT true,
  full_path   TEXT        UNIQUE,   -- e.g. "men/clothing/top-wear/t-shirts"
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT uq_nav_slug_per_parent UNIQUE (parent_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_nav_parent_id  ON public.navigation_nodes (parent_id);
CREATE INDEX IF NOT EXISTS idx_nav_full_path  ON public.navigation_nodes (full_path);
CREATE INDEX IF NOT EXISTS idx_nav_sort       ON public.navigation_nodes (parent_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_nav_is_active  ON public.navigation_nodes (is_active);
CREATE INDEX IF NOT EXISTS idx_nav_level      ON public.navigation_nodes (level);

-- ────────────────────────────────────────────────────────────
-- 2. Auto-compute full_path trigger
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.recompute_nav_full_path()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  v_path  TEXT;
  v_parts TEXT[] := ARRAY[NEW.slug];
  v_pid   UUID   := NEW.parent_id;
  v_slug  TEXT;
BEGIN
  -- Walk up the ancestor chain collecting slugs
  WHILE v_pid IS NOT NULL LOOP
    SELECT slug, parent_id INTO v_slug, v_pid
    FROM public.navigation_nodes
    WHERE id = v_pid;
    v_parts := ARRAY[v_slug] || v_parts;
  END LOOP;

  NEW.full_path  := array_to_string(v_parts, '/');
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_nav_full_path ON public.navigation_nodes;
CREATE TRIGGER trg_nav_full_path
  BEFORE INSERT OR UPDATE OF slug, parent_id
  ON public.navigation_nodes
  FOR EACH ROW EXECUTE FUNCTION public.recompute_nav_full_path();

-- ────────────────────────────────────────────────────────────
-- 3. updated_at auto-update trigger
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.set_nav_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_nav_updated_at ON public.navigation_nodes;
CREATE TRIGGER trg_nav_updated_at
  BEFORE UPDATE ON public.navigation_nodes
  FOR EACH ROW EXECUTE FUNCTION public.set_nav_updated_at();

-- ────────────────────────────────────────────────────────────
-- 4. RLS
-- ────────────────────────────────────────────────────────────
ALTER TABLE public.navigation_nodes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read navigation_nodes" ON public.navigation_nodes;
CREATE POLICY "Public read navigation_nodes"
  ON public.navigation_nodes FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admin all navigation_nodes" ON public.navigation_nodes;
CREATE POLICY "Admin all navigation_nodes"
  ON public.navigation_nodes FOR ALL
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- ────────────────────────────────────────────────────────────
-- 5. navigation_attribute_groups (filter config junction)
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.navigation_attribute_groups (
  nav_node_id        UUID NOT NULL REFERENCES public.navigation_nodes(id) ON DELETE CASCADE,
  attribute_group_id UUID NOT NULL REFERENCES public.attribute_groups(id) ON DELETE CASCADE,
  sort_order         INT  NOT NULL DEFAULT 0,
  is_active          BOOLEAN NOT NULL DEFAULT true,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (nav_node_id, attribute_group_id)
);

CREATE INDEX IF NOT EXISTS idx_nag_node  ON public.navigation_attribute_groups (nav_node_id);
CREATE INDEX IF NOT EXISTS idx_nag_group ON public.navigation_attribute_groups (attribute_group_id);

ALTER TABLE public.navigation_attribute_groups ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read nag" ON public.navigation_attribute_groups;
CREATE POLICY "Public read nag"
  ON public.navigation_attribute_groups FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin all nag" ON public.navigation_attribute_groups;
CREATE POLICY "Admin all nag"
  ON public.navigation_attribute_groups FOR ALL
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- ────────────────────────────────────────────────────────────
-- 6. navigation_banners
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.navigation_banners (
  id          UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  nav_node_id UUID    NOT NULL REFERENCES public.navigation_nodes(id) ON DELETE CASCADE,
  image_url   TEXT    NOT NULL,
  alt_text    TEXT,
  href        TEXT,
  sort_order  INT     NOT NULL DEFAULT 0,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_nb_node ON public.navigation_banners (nav_node_id);

ALTER TABLE public.navigation_banners ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read navigation_banners" ON public.navigation_banners;
CREATE POLICY "Public read navigation_banners"
  ON public.navigation_banners FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin all navigation_banners" ON public.navigation_banners;
CREATE POLICY "Admin all navigation_banners"
  ON public.navigation_banners FOR ALL
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- ────────────────────────────────────────────────────────────
-- 7. navigation_seo
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.navigation_seo (
  nav_node_id   UUID PRIMARY KEY REFERENCES public.navigation_nodes(id) ON DELETE CASCADE,
  title         TEXT,
  description   TEXT,
  og_image      TEXT,
  h1_override   TEXT,
  canonical_url TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.navigation_seo ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read navigation_seo" ON public.navigation_seo;
CREATE POLICY "Public read navigation_seo"
  ON public.navigation_seo FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin all navigation_seo" ON public.navigation_seo;
CREATE POLICY "Admin all navigation_seo"
  ON public.navigation_seo FOR ALL
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- ────────────────────────────────────────────────────────────
-- 8. products.nav_node_id (non-breaking, nullable FK)
-- ────────────────────────────────────────────────────────────
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS nav_node_id UUID
    REFERENCES public.navigation_nodes(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_products_nav_node_id
  ON public.products (nav_node_id)
  WHERE nav_node_id IS NOT NULL;

-- ────────────────────────────────────────────────────────────
-- 9. attribute_groups — display type metadata
-- ────────────────────────────────────────────────────────────
ALTER TABLE public.attribute_groups
  ADD COLUMN IF NOT EXISTS display_type TEXT NOT NULL DEFAULT 'multi-select'
    CHECK (display_type IN (
      'multi-select', 'single-select', 'color-swatch',
      'price-range', 'rating', 'toggle'
    )),
  ADD COLUMN IF NOT EXISTS is_collapsed_default BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS allow_search         BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS max_visible          INT     NOT NULL DEFAULT 6;

-- ────────────────────────────────────────────────────────────
-- 10. attribute_values — color swatch + custom sort
-- ────────────────────────────────────────────────────────────
ALTER TABLE public.attribute_values
  ADD COLUMN IF NOT EXISTS hex_color  TEXT,
  ADD COLUMN IF NOT EXISTS sort_order INT NOT NULL DEFAULT 0;

-- ────────────────────────────────────────────────────────────
-- 11. Seed initial navigation tree (mirrors existing subcategories)
-- ────────────────────────────────────────────────────────────
-- Root nodes
INSERT INTO public.navigation_nodes (name, slug, parent_id, level, sort_order) VALUES
  ('Men',   'men',   NULL, 0, 1),
  ('Women', 'women', NULL, 0, 2),
  ('Kids',  'kids',  NULL, 0, 3)
ON CONFLICT (parent_id, slug) DO NOTHING;

-- Men > Clothing section
INSERT INTO public.navigation_nodes (name, slug, parent_id, level, sort_order)
SELECT 'Clothing', 'clothing', id, 1, 1 FROM public.navigation_nodes
WHERE slug = 'men' AND parent_id IS NULL
ON CONFLICT (parent_id, slug) DO NOTHING;

-- Men > Footwear section
INSERT INTO public.navigation_nodes (name, slug, parent_id, level, sort_order)
SELECT 'Footwear', 'footwear', id, 1, 2 FROM public.navigation_nodes
WHERE slug = 'men' AND parent_id IS NULL
ON CONFLICT (parent_id, slug) DO NOTHING;

-- Men > Accessories section
INSERT INTO public.navigation_nodes (name, slug, parent_id, level, sort_order)
SELECT 'Accessories', 'accessories', id, 1, 3 FROM public.navigation_nodes
WHERE slug = 'men' AND parent_id IS NULL
ON CONFLICT (parent_id, slug) DO NOTHING;

-- Men > Clothing > Top Wear group
INSERT INTO public.navigation_nodes (name, slug, parent_id, level, sort_order)
SELECT 'Top Wear', 'top-wear',
  (SELECT id FROM public.navigation_nodes WHERE slug = 'clothing' AND parent_id =
    (SELECT id FROM public.navigation_nodes WHERE slug = 'men' AND parent_id IS NULL)),
  2, 1
ON CONFLICT (parent_id, slug) DO NOTHING;

-- Men > Clothing > Bottom Wear group
INSERT INTO public.navigation_nodes (name, slug, parent_id, level, sort_order)
SELECT 'Bottom Wear', 'bottom-wear',
  (SELECT id FROM public.navigation_nodes WHERE slug = 'clothing' AND parent_id =
    (SELECT id FROM public.navigation_nodes WHERE slug = 'men' AND parent_id IS NULL)),
  2, 2
ON CONFLICT (parent_id, slug) DO NOTHING;

-- Leaf nodes: Men > Clothing > Top Wear > T-Shirts, Shirts, etc.
DO $$
DECLARE
  v_top_wear_id UUID;
  v_bot_wear_id UUID;
  v_men_cloth_id UUID;
BEGIN
  -- Get Men Clothing
  SELECT id INTO v_men_cloth_id FROM public.navigation_nodes
  WHERE slug = 'clothing' AND parent_id = (SELECT id FROM public.navigation_nodes WHERE slug = 'men' AND parent_id IS NULL);

  -- Get Top Wear under Men Clothing
  SELECT id INTO v_top_wear_id FROM public.navigation_nodes
  WHERE slug = 'top-wear' AND parent_id = v_men_cloth_id;

  -- Get Bottom Wear under Men Clothing
  SELECT id INTO v_bot_wear_id FROM public.navigation_nodes
  WHERE slug = 'bottom-wear' AND parent_id = v_men_cloth_id;

  IF v_top_wear_id IS NOT NULL THEN
    INSERT INTO public.navigation_nodes (name, slug, parent_id, level, sort_order) VALUES
      ('T-Shirts',  't-shirts',  v_top_wear_id, 3, 1),
      ('Shirts',    'shirts',    v_top_wear_id, 3, 2),
      ('Kurta',     'kurta',     v_top_wear_id, 3, 3),
      ('Jackets',   'jackets',   v_top_wear_id, 3, 4)
    ON CONFLICT (parent_id, slug) DO NOTHING;
  END IF;

  IF v_bot_wear_id IS NOT NULL THEN
    INSERT INTO public.navigation_nodes (name, slug, parent_id, level, sort_order) VALUES
      ('Jeans',     'jeans',     v_bot_wear_id, 3, 1),
      ('Trousers',  'trousers',  v_bot_wear_id, 3, 2),
      ('Cargo',     'cargo',     v_bot_wear_id, 3, 3)
    ON CONFLICT (parent_id, slug) DO NOTHING;
  END IF;
END;
$$;

-- Women: Clothing section
INSERT INTO public.navigation_nodes (name, slug, parent_id, level, sort_order)
SELECT 'Clothing', 'clothing', id, 1, 1 FROM public.navigation_nodes
WHERE slug = 'women' AND parent_id IS NULL
ON CONFLICT (parent_id, slug) DO NOTHING;

-- Women > Clothing leaf nodes
DO $$
DECLARE v_women_cloth_id UUID;
BEGIN
  SELECT id INTO v_women_cloth_id FROM public.navigation_nodes
  WHERE slug = 'clothing' AND parent_id = (SELECT id FROM public.navigation_nodes WHERE slug = 'women' AND parent_id IS NULL);

  IF v_women_cloth_id IS NOT NULL THEN
    INSERT INTO public.navigation_nodes (name, slug, parent_id, level, sort_order) VALUES
      ('Sarees',   'sarees',   v_women_cloth_id, 2, 1),
      ('Kurtis',   'kurtis',   v_women_cloth_id, 2, 2),
      ('Dresses',  'dresses',  v_women_cloth_id, 2, 3),
      ('Tops',     'tops',     v_women_cloth_id, 2, 4),
      ('Leggings', 'leggings', v_women_cloth_id, 2, 5),
      ('Suits',    'suits',    v_women_cloth_id, 2, 6),
      ('Jeans',    'jeans',    v_women_cloth_id, 2, 7)
    ON CONFLICT (parent_id, slug) DO NOTHING;
  END IF;
END;
$$;

-- Kids: Clothing section
INSERT INTO public.navigation_nodes (name, slug, parent_id, level, sort_order)
SELECT 'Clothing', 'clothing', id, 1, 1 FROM public.navigation_nodes
WHERE slug = 'kids' AND parent_id IS NULL
ON CONFLICT (parent_id, slug) DO NOTHING;

DO $$
DECLARE v_kids_cloth_id UUID;
BEGIN
  SELECT id INTO v_kids_cloth_id FROM public.navigation_nodes
  WHERE slug = 'clothing' AND parent_id = (SELECT id FROM public.navigation_nodes WHERE slug = 'kids' AND parent_id IS NULL);

  IF v_kids_cloth_id IS NOT NULL THEN
    INSERT INTO public.navigation_nodes (name, slug, parent_id, level, sort_order) VALUES
      ('T-Shirts', 't-shirts', v_kids_cloth_id, 2, 1),
      ('Shorts',   'shorts',   v_kids_cloth_id, 2, 2),
      ('Frocks',   'frocks',   v_kids_cloth_id, 2, 3),
      ('Shirts',   'shirts',   v_kids_cloth_id, 2, 4),
      ('Jeans',    'jeans',    v_kids_cloth_id, 2, 5)
    ON CONFLICT (parent_id, slug) DO NOTHING;
  END IF;
END;
$$;

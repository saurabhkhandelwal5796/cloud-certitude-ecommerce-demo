-- ============================================================
-- Migration: product_variants
--
-- Every product can have UNLIMITED variants.
-- Each variant owns: SKU, price, discounted_price, inventory.
-- The UNIQUE(sku) constraint guarantees globally unique SKUs.
--
-- Existing products are backfilled with one DEFAULT-{product_id}
-- variant by the companion backfill migration.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.product_variants (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id       TEXT        NOT NULL,
  sku              TEXT        NOT NULL,
  variant_name     TEXT        NOT NULL DEFAULT '',
  price            NUMERIC(12,2) NOT NULL DEFAULT 0,
  discounted_price NUMERIC(12,2) NULL,
  quantity         INTEGER     NOT NULL DEFAULT 0,
  is_active        BOOLEAN     NOT NULL DEFAULT true,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),

  -- One product can have many variants; deleting a product removes all its variants
  CONSTRAINT fk_product_variants_product
    FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE,

  -- SKU must be globally unique across all products
  CONSTRAINT uq_product_variants_sku UNIQUE (sku)
);

-- ── Indexes ────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_pv_product_id
  ON public.product_variants (product_id);

CREATE INDEX IF NOT EXISTS idx_pv_sku
  ON public.product_variants (sku);

CREATE INDEX IF NOT EXISTS idx_pv_is_active
  ON public.product_variants (is_active);

-- Composite index: fastest path for "active variants for a product"
CREATE INDEX IF NOT EXISTS idx_pv_product_active
  ON public.product_variants (product_id, is_active);

-- ── Trigger: auto-update updated_at ────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_product_variants_updated_at ON public.product_variants;
CREATE TRIGGER trg_product_variants_updated_at
  BEFORE UPDATE ON public.product_variants
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── Row Level Security ──────────────────────────────────────────────────────

ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow select product_variants"  ON public.product_variants;
CREATE POLICY "Allow select product_variants"
  ON public.product_variants FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow insert product_variants"  ON public.product_variants;
CREATE POLICY "Allow insert product_variants"
  ON public.product_variants FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow update product_variants"  ON public.product_variants;
CREATE POLICY "Allow update product_variants"
  ON public.product_variants FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow delete product_variants"  ON public.product_variants;
CREATE POLICY "Allow delete product_variants"
  ON public.product_variants FOR DELETE USING (true);

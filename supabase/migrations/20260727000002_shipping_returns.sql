-- ============================================================
-- Shipping Architecture Migration
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ============================================================

-- 1. Warehouses (physical dispatch locations)
CREATE TABLE IF NOT EXISTS public.warehouses (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  city        TEXT NOT NULL,
  pincode     TEXT NOT NULL,
  address     TEXT,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Delivery zones (grouping of pincodes by geography)
CREATE TABLE IF NOT EXISTS public.delivery_zones (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,               -- e.g. "Metro", "Tier-2", "North-East", "Remote"
  description TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Pincode to zone mapping (indexed for fast lookup)
CREATE TABLE IF NOT EXISTS public.pincode_zone_mappings (
  pincode     TEXT NOT NULL,
  zone_id     UUID NOT NULL REFERENCES public.delivery_zones(id) ON DELETE CASCADE,
  state       TEXT,
  city        TEXT,
  PRIMARY KEY (pincode, zone_id)
);
CREATE INDEX IF NOT EXISTS idx_pincode_zone ON public.pincode_zone_mappings(pincode);

-- 4. SLA matrix: warehouse x zone -> delivery window
CREATE TABLE IF NOT EXISTS public.warehouse_delivery_sla (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  warehouse_id    UUID NOT NULL REFERENCES public.warehouses(id) ON DELETE CASCADE,
  zone_id         UUID NOT NULL REFERENCES public.delivery_zones(id) ON DELETE CASCADE,
  min_days        INT  NOT NULL DEFAULT 2,
  max_days        INT  NOT NULL DEFAULT 7,
  cod_available   BOOLEAN NOT NULL DEFAULT TRUE,
  free_above_amt  NUMERIC(10,2) NOT NULL DEFAULT 999.00,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (warehouse_id, zone_id)
);

-- 5. Product return policies (per product or global default)
CREATE TABLE IF NOT EXISTS public.product_return_policies (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id       TEXT REFERENCES public.products(id) ON DELETE CASCADE,
  return_days      INT  NOT NULL DEFAULT 30,
  exchange_allowed BOOLEAN NOT NULL DEFAULT TRUE,
  pickup_available BOOLEAN NOT NULL DEFAULT TRUE,
  notes            TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_return_policy_global
  ON public.product_return_policies (((product_id IS NULL)))
  WHERE product_id IS NULL;

-- 6. Product relationships table (Complete The Look, FBT, Similar)
CREATE TABLE IF NOT EXISTS public.product_relationships (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id         TEXT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  related_product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  relationship_type  TEXT NOT NULL CHECK (relationship_type IN ('COMPLETE_THE_LOOK','FREQUENTLY_BOUGHT','SIMILAR')),
  sort_order         INT  NOT NULL DEFAULT 0,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (product_id, related_product_id, relationship_type)
);
CREATE INDEX IF NOT EXISTS idx_pr_product ON public.product_relationships(product_id, relationship_type);

-- RLS: Allow public SELECT
ALTER TABLE public.warehouses              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_zones          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pincode_zone_mappings   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.warehouse_delivery_sla  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_return_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_relationships   ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'warehouses' AND policyname = 'Public read warehouses') THEN
    CREATE POLICY "Public read warehouses" ON public.warehouses FOR SELECT USING (TRUE);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'delivery_zones' AND policyname = 'Public read delivery zones') THEN
    CREATE POLICY "Public read delivery zones" ON public.delivery_zones FOR SELECT USING (TRUE);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'pincode_zone_mappings' AND policyname = 'Public read pincode mappings') THEN
    CREATE POLICY "Public read pincode mappings" ON public.pincode_zone_mappings FOR SELECT USING (TRUE);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'warehouse_delivery_sla' AND policyname = 'Public read warehouse sla') THEN
    CREATE POLICY "Public read warehouse sla" ON public.warehouse_delivery_sla FOR SELECT USING (TRUE);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'product_return_policies' AND policyname = 'Public read return policies') THEN
    CREATE POLICY "Public read return policies" ON public.product_return_policies FOR SELECT USING (TRUE);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'product_relationships' AND policyname = 'Public read product relationships') THEN
    CREATE POLICY "Public read product relationships" ON public.product_relationships FOR SELECT USING (TRUE);
  END IF;
END $$;

-- Seed global return policy
INSERT INTO public.product_return_policies (product_id, return_days, exchange_allowed, pickup_available, notes)
VALUES (NULL, 30, TRUE, TRUE, 'Standard policy for all products')
ON CONFLICT DO NOTHING;

-- Seed delivery zones
INSERT INTO public.delivery_zones (id, name, description) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Metro',  'Delhi, Mumbai, Bangalore, Hyderabad, Chennai, Kolkata'),
  ('00000000-0000-0000-0000-000000000002', 'Tier-2', 'Jaipur, Lucknow, Ahmedabad, Surat, Pune'),
  ('00000000-0000-0000-0000-000000000003', 'Rest',   'All other serviceable pincodes')
ON CONFLICT DO NOTHING;

-- Seed pincode examples
INSERT INTO public.pincode_zone_mappings (pincode, zone_id, state, city) VALUES
  ('302001', '00000000-0000-0000-0000-000000000002', 'Rajasthan',   'Jaipur'),
  ('302002', '00000000-0000-0000-0000-000000000002', 'Rajasthan',   'Jaipur'),
  ('110001', '00000000-0000-0000-0000-000000000001', 'Delhi',       'New Delhi'),
  ('400001', '00000000-0000-0000-0000-000000000001', 'Maharashtra', 'Mumbai')
ON CONFLICT DO NOTHING;

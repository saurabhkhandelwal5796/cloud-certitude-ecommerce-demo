-- Migration: 20260820_add_admin_returns_rls_policies.sql
-- Description: Add admin RLS policies on public.returns and public.refunds

-- 1. Returns Policies
ALTER TABLE public.returns ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin select returns" ON public.returns;
CREATE POLICY "Admin select returns"
  ON public.returns FOR SELECT
  TO authenticated
  USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admin update returns" ON public.returns;
CREATE POLICY "Admin update returns"
  ON public.returns FOR UPDATE
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admin delete returns" ON public.returns;
CREATE POLICY "Admin delete returns"
  ON public.returns FOR DELETE
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- 2. Refunds Policies
ALTER TABLE public.refunds ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin select refunds" ON public.refunds;
CREATE POLICY "Admin select refunds"
  ON public.refunds FOR SELECT
  TO authenticated
  USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admin update refunds" ON public.refunds;
CREATE POLICY "Admin update refunds"
  ON public.refunds FOR UPDATE
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admin insert refunds" ON public.refunds;
CREATE POLICY "Admin insert refunds"
  ON public.refunds FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin(auth.uid()));

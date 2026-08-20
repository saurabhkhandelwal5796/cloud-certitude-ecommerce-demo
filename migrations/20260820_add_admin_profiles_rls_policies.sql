-- Migration: 20260820_add_admin_profiles_rls_policies.sql
-- Description: Add admin UPDATE policy on public.profiles so administrators can manage user roles and statuses.

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin update profiles" ON public.profiles;
CREATE POLICY "Admin update profiles"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- Migration: 20260805000002_fix_variant_select_policy.sql
--
-- Root Cause:
--   Migration 20260728000006_security_hardening_rls.sql removed all open write
--   policies on product_variants and relied on an implicit unrestricted SELECT.
--   Migration 20260729000003_restore_full_admin_policies.sql restored INSERT,
--   UPDATE, and DELETE for admins but omitted the SELECT policy.
--
--   Supabase/PostgREST requires that .insert().select().single() satisfies BOTH
--   the INSERT policy (to write) AND the SELECT policy (to read the row back).
--   Without a SELECT policy, PostgREST throws 42501 on the RETURNING * clause.
--
-- Fix:
--   Add the single missing SELECT policy for admins on product_variants.
--   Uses public.is_admin(auth.uid()) — identical to all other admin write
--   policies on this table. Does NOT weaken RLS.

DROP POLICY IF EXISTS "Admin select product_variants" ON public.product_variants;

CREATE POLICY "Admin select product_variants"
  ON public.product_variants
  FOR SELECT
  USING (public.is_admin(auth.uid()));

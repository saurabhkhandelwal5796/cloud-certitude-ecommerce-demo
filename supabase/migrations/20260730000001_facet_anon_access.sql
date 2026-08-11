-- ============================================================
-- Migration: Facet Service – Fix anon read access
-- Date: 2026-07-30
--
-- The previous migration (20260729000005) created RLS policies
-- for subcategory_attribute_groups that only grant SELECT to
-- "authenticated" users. This blocks unauthenticated storefront
-- visitors from calling the facet RPCs because the RPC itself
-- runs as SECURITY INVOKER, meaning it inherits the caller's role.
--
-- Fix:
--   1. Drop the overly-restrictive authenticated-only read policy.
--   2. Add a broad public read policy (anon + authenticated).
--   3. Ensure all three facet RPCs are executable by anon as well.
-- ============================================================

-- ─── 1. Widen the SELECT policy on subcategory_attribute_groups ───────────────

DROP POLICY IF EXISTS "Public read subcategory_attribute_groups"
  ON public.subcategory_attribute_groups;

-- New policy: anonymous visitors can read (no auth required)
CREATE POLICY "Anon and authenticated read subcategory_attribute_groups"
  ON public.subcategory_attribute_groups
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- ─── 2. Ensure RPC grants include anon role ───────────────────────────────────

-- get_category_facets
GRANT EXECUTE ON FUNCTION public.get_category_facets(TEXT)     TO anon;
GRANT EXECUTE ON FUNCTION public.get_category_facets(TEXT)     TO authenticated;

-- get_subcategory_facets
GRANT EXECUTE ON FUNCTION public.get_subcategory_facets(UUID)  TO anon;
GRANT EXECUTE ON FUNCTION public.get_subcategory_facets(UUID)  TO authenticated;

-- get_search_facets
GRANT EXECUTE ON FUNCTION public.get_search_facets(UUID[])     TO anon;
GRANT EXECUTE ON FUNCTION public.get_search_facets(UUID[])     TO authenticated;

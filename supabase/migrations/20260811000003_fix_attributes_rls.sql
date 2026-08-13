-- =============================================================
-- Migration: Fix Attributes RLS Policy
-- Date: 2026-08-11
-- Description: Ensures that the Admin INSERT/UPDATE/DELETE policies 
-- for the attributes table are correctly applied. 
-- The previous restoration migration (20260804) may not have been applied
-- or was inadvertently reverted. This migration restores write access
-- for the 'attributes' table so admins can create sub-attributes securely.
-- =============================================================

ALTER TABLE public.attributes ENABLE ROW LEVEL SECURITY;

-- 1. Restore INSERT for attributes
DROP POLICY IF EXISTS "Admin insert attributes" ON public.attributes;
CREATE POLICY "Admin insert attributes" ON public.attributes FOR INSERT WITH CHECK (public.is_admin(auth.uid()));

-- 2. Restore UPDATE for attributes
DROP POLICY IF EXISTS "Admin update attributes" ON public.attributes;
CREATE POLICY "Admin update attributes" ON public.attributes FOR UPDATE USING (public.is_admin(auth.uid()));

-- 3. Restore DELETE for attributes
DROP POLICY IF EXISTS "Admin delete attributes" ON public.attributes;
CREATE POLICY "Admin delete attributes" ON public.attributes FOR DELETE USING (public.is_admin(auth.uid()));

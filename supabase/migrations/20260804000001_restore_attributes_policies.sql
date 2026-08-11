-- 20260804000001_restore_attributes_policies.sql

-- Ensure RLS is enabled on public.attributes
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

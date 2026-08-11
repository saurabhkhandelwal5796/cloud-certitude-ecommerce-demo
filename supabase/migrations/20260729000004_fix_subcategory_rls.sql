-- 20260729_fix_subcategory_rls.sql

-- Drop the overly permissive policies from Phase 1
DROP POLICY IF EXISTS "Allow insert subcategories" ON public.subcategories;
DROP POLICY IF EXISTS "Allow update subcategories" ON public.subcategories;
DROP POLICY IF EXISTS "Allow delete subcategories" ON public.subcategories;

-- Create secure Admin policies using the is_admin() function
DROP POLICY IF EXISTS "Admin insert subcategories" ON public.subcategories;
CREATE POLICY "Admin insert subcategories" 
  ON public.subcategories FOR INSERT 
  WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admin update subcategories" ON public.subcategories;
CREATE POLICY "Admin update subcategories" 
  ON public.subcategories FOR UPDATE 
  USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admin delete subcategories" ON public.subcategories;
CREATE POLICY "Admin delete subcategories" 
  ON public.subcategories FOR DELETE 
  USING (public.is_admin(auth.uid()));

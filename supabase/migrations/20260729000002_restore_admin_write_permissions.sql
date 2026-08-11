-- 20260729_restore_admin_write_permissions.sql

-- 1. Create or replace the is_admin function to check the profiles table for 'admin' role
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = user_id AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Restore INSERT/UPDATE for products
CREATE POLICY "Admin insert products"
  ON public.products FOR INSERT
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admin update products"
  ON public.products FOR UPDATE
  USING (public.is_admin(auth.uid()));

-- 3. Restore INSERT/UPDATE for product_attribute_group
CREATE POLICY "Admin insert product_attribute_group"
  ON public.product_attribute_group FOR INSERT
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admin update product_attribute_group"
  ON public.product_attribute_group FOR UPDATE
  USING (public.is_admin(auth.uid()));

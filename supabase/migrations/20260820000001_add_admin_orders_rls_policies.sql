-- Migration: 20260820000001_add_admin_orders_rls_policies.sql
-- Description: Add admin RLS policies for public.orders so administrators can view and update orders.

-- 1. Ensure public.is_admin function exists and is secure
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

-- 2. Admin SELECT policy on public.orders
DROP POLICY IF EXISTS "Admin select orders" ON public.orders;
CREATE POLICY "Admin select orders"
  ON public.orders FOR SELECT
  USING (public.is_admin(auth.uid()));

-- 3. Admin UPDATE policy on public.orders (enables updating status, tracking, notes)
DROP POLICY IF EXISTS "Admin update orders" ON public.orders;
CREATE POLICY "Admin update orders"
  ON public.orders FOR UPDATE
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- 4. Admin DELETE policy on public.orders
DROP POLICY IF EXISTS "Admin delete orders" ON public.orders;
CREATE POLICY "Admin delete orders"
  ON public.orders FOR DELETE
  USING (public.is_admin(auth.uid()));

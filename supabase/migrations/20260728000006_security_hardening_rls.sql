-- ============================================================
-- Migration: Production Security Hardening – Critical Fixes
-- Date: 2026-07-28
-- Run this entire script in Supabase SQL Editor
-- ============================================================


-- ═══════════════════════════════════════════════════════════════
-- SECTION 1: RESTRICT RPC EXECUTION (C2)
-- Prevent anonymous users from calling transactional RPCs.
-- ═══════════════════════════════════════════════════════════════

REVOKE EXECUTE ON FUNCTION checkout_order_atomic(
  TEXT, UUID, TEXT, TEXT, JSONB, NUMERIC, TEXT, JSONB, NUMERIC, NUMERIC, NUMERIC, NUMERIC, NUMERIC
) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION checkout_order_atomic(
  TEXT, UUID, TEXT, TEXT, JSONB, NUMERIC, TEXT, JSONB, NUMERIC, NUMERIC, NUMERIC, NUMERIC, NUMERIC
) TO authenticated;

REVOKE EXECUTE ON FUNCTION restore_inventory_atomic(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION restore_inventory_atomic(TEXT) TO authenticated;


-- ═══════════════════════════════════════════════════════════════
-- SECTION 2: product_variants — Close open write policies (C1)
-- SELECT remains public (storefront reads).
-- INSERT/UPDATE/DELETE are removed entirely — only service_role
-- (the RPC) can write to this table.
-- ═══════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "Allow insert product_variants" ON public.product_variants;
DROP POLICY IF EXISTS "Allow update product_variants" ON public.product_variants;
DROP POLICY IF EXISTS "Allow delete product_variants" ON public.product_variants;

-- Allow admin writes via service_role (RPC + Admin UI).
-- No authenticated-user INSERT/UPDATE/DELETE policy = only service_role succeeds.
-- SELECT remains unrestricted for storefront.


-- ═══════════════════════════════════════════════════════════════
-- SECTION 3: orders — Enable RLS and apply row-owner policies (C3)
-- ═══════════════════════════════════════════════════════════════

-- Enable RLS if not already enabled
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Drop old permissive policies if they exist
DROP POLICY IF EXISTS "Allow read orders"   ON public.orders;
DROP POLICY IF EXISTS "Allow insert orders" ON public.orders;
DROP POLICY IF EXISTS "Allow update orders" ON public.orders;
DROP POLICY IF EXISTS "Allow delete orders" ON public.orders;

-- Customers can only see their own orders
CREATE POLICY "Customers read own orders"
  ON public.orders FOR SELECT
  USING (profile_id = auth.uid());

-- Orders are inserted by the atomic RPC (service_role bypasses RLS)
-- No INSERT policy for authenticated users = only RPC can create orders

-- No direct UPDATE by customers (service_role updates status)
-- No DELETE policy = only service_role can delete


-- ═══════════════════════════════════════════════════════════════
-- SECTION 4: products — Enable RLS
-- Public SELECT; no authenticated write (admin goes via service_role)
-- ═══════════════════════════════════════════════════════════════

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow read products"   ON public.products;
DROP POLICY IF EXISTS "Allow insert products" ON public.products;
DROP POLICY IF EXISTS "Allow update products" ON public.products;
DROP POLICY IF EXISTS "Allow delete products" ON public.products;

-- Anyone (including anonymous) can read active products
CREATE POLICY "Public read products"
  ON public.products FOR SELECT
  USING (true);

-- Only service_role (admin panel via server-side) can INSERT/UPDATE/DELETE
-- No policy = authenticated users cannot write directly


-- ═══════════════════════════════════════════════════════════════
-- SECTION 5: profiles — Enable RLS and owner-only writes
-- ═══════════════════════════════════════════════════════════════

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow read profiles"   ON public.profiles;
DROP POLICY IF EXISTS "Allow insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow update profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow delete profiles" ON public.profiles;

-- Any authenticated user can read profiles (needed for admin name lookups)
CREATE POLICY "Authenticated read profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

-- Users can only update their own profile
CREATE POLICY "Users update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Supabase Auth trigger creates the profile on signup (service_role)
-- No INSERT policy for authenticated users


-- ═══════════════════════════════════════════════════════════════
-- SECTION 6: notifications — Owner-only read/update (H1)
-- ═══════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "Allow read notifications"   ON public.notifications;
DROP POLICY IF EXISTS "Allow insert notifications" ON public.notifications;
DROP POLICY IF EXISTS "Allow update notifications" ON public.notifications;
DROP POLICY IF EXISTS "Allow delete notifications" ON public.notifications;

-- Users can only read their own notifications
CREATE POLICY "Users read own notifications"
  ON public.notifications FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR user_email = (auth.jwt() ->> 'email'));

-- Users can mark their own notifications as read
CREATE POLICY "Users update own notifications"
  ON public.notifications FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid() OR user_email = (auth.jwt() ->> 'email'))
  WITH CHECK (user_id = auth.uid() OR user_email = (auth.jwt() ->> 'email'));

-- Notifications are inserted by the server API route (service_role) only
-- No INSERT policy for authenticated users


-- ═══════════════════════════════════════════════════════════════
-- SECTION 7: order_history — Owner-only read (H1)
-- ═══════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "Allow read order_history"   ON public.order_history;
DROP POLICY IF EXISTS "Allow insert order_history" ON public.order_history;
DROP POLICY IF EXISTS "Allow update order_history" ON public.order_history;
DROP POLICY IF EXISTS "Allow delete order_history" ON public.order_history;

-- Order history is joined by order_id. Customers can read their own.
-- This uses a subquery join to check ownership via orders table.
CREATE POLICY "Users read own order_history"
  ON public.order_history FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.order_id = order_history.order_id
        AND orders.profile_id = auth.uid()
    )
  );

-- INSERT/UPDATE/DELETE by service_role only (via RPCs and updateOrderStatus)


-- ═══════════════════════════════════════════════════════════════
-- SECTION 8: returns — Owner-only access (H1)
-- ═══════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "Allow read returns"   ON public.returns;
DROP POLICY IF EXISTS "Allow insert returns" ON public.returns;
DROP POLICY IF EXISTS "Allow update returns" ON public.returns;
DROP POLICY IF EXISTS "Allow delete returns" ON public.returns;

-- Customers can read their own return requests
CREATE POLICY "Users read own returns"
  ON public.returns FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.order_id = returns.order_id
        AND orders.profile_id = auth.uid()
    )
  );

-- Customers can create return requests for their own orders
CREATE POLICY "Users insert own returns"
  ON public.returns FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.order_id = returns.order_id
        AND orders.profile_id = auth.uid()
    )
  );

-- Admin updates via service_role only


-- ═══════════════════════════════════════════════════════════════
-- SECTION 9: attribute tables — Read-only for authenticated (H2)
-- Only admin (service_role) can INSERT/UPDATE/DELETE attributes.
-- ═══════════════════════════════════════════════════════════════

-- attribute_groups
DROP POLICY IF EXISTS "Allow insert attribute_groups" ON public.attribute_groups;
DROP POLICY IF EXISTS "Allow update attribute_groups" ON public.attribute_groups;
DROP POLICY IF EXISTS "Allow delete attribute_groups" ON public.attribute_groups;
-- SELECT policy remains (USING (true)) — public read is fine for catalogue

-- attributes
DROP POLICY IF EXISTS "Allow insert attributes" ON public.attributes;
DROP POLICY IF EXISTS "Allow update attributes" ON public.attributes;
DROP POLICY IF EXISTS "Allow delete attributes" ON public.attributes;

-- attribute_values
DROP POLICY IF EXISTS "Allow insert attribute_values" ON public.attribute_values;
DROP POLICY IF EXISTS "Allow update attribute_values" ON public.attribute_values;
DROP POLICY IF EXISTS "Allow delete attribute_values" ON public.attribute_values;

-- product_attribute_values
DROP POLICY IF EXISTS "Allow insert product_attribute_values" ON public.product_attribute_values;
DROP POLICY IF EXISTS "Allow update product_attribute_values" ON public.product_attribute_values;
DROP POLICY IF EXISTS "Allow delete product_attribute_values" ON public.product_attribute_values;

-- variant_attribute_values
DROP POLICY IF EXISTS "Allow insert variant_attribute_values" ON public.variant_attribute_values;
DROP POLICY IF EXISTS "Allow update variant_attribute_values" ON public.variant_attribute_values;
DROP POLICY IF EXISTS "Allow delete variant_attribute_values" ON public.variant_attribute_values;

-- product_attribute_group
DROP POLICY IF EXISTS "Allow insert product_attribute_group" ON public.product_attribute_group;
DROP POLICY IF EXISTS "Allow update product_attribute_group" ON public.product_attribute_group;
DROP POLICY IF EXISTS "Allow delete product_attribute_group" ON public.product_attribute_group;


-- ═══════════════════════════════════════════════════════════════
-- SECTION 10: Verify — Run these queries to confirm changes
-- ═══════════════════════════════════════════════════════════════

-- Check which tables have RLS enabled:
-- SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';

-- Check all active policies:
-- SELECT tablename, policyname, cmd, qual FROM pg_policies WHERE schemaname = 'public' ORDER BY tablename;

-- Check RPC execution grants:
-- SELECT grantee, privilege_type FROM information_schema.routine_privileges
--   WHERE routine_name IN ('checkout_order_atomic', 'restore_inventory_atomic');

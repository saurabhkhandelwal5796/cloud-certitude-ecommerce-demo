-- Migration: 20260820000002_fix_order_history_and_rpc.sql
-- Description:
--   1. Restores the initial order_history insert inside create_order RPC transaction.
--   2. Adds RLS policies on public.order_history for Admin SELECT/INSERT and authenticated cancellation INSERT.

-- ─── 1. Update create_order RPC to record initial order_history entry ───────────
CREATE OR REPLACE FUNCTION public.create_order(payload jsonb)
RETURNS uuid AS $$
DECLARE
  new_order_id uuid;
  v_order_id text;
  v_profile_id uuid;
  v_customer_name text;
  v_status text;
BEGIN
  -- Validate that the user is authenticated and is creating the order for themselves
  IF auth.uid() IS NULL OR (payload->>'profile_id')::uuid != auth.uid() THEN
    RAISE EXCEPTION 'Unauthorized: profile_id must match authenticated user';
  END IF;

  v_order_id := payload->>'order_id';
  v_profile_id := (payload->>'profile_id')::uuid;
  v_customer_name := payload->>'customer_name';
  v_status := COALESCE(payload->>'status', 'Pending');

  -- 1. Insert order
  INSERT INTO public.orders (
    order_id, profile_id, customer_name, customer_email, items,
    total_amount, status, payment_method, shipping_address,
    subtotal, tax, shipping, discount, grand_total
  ) VALUES (
    v_order_id,
    v_profile_id,
    v_customer_name,
    payload->>'customer_email',
    payload->'items',
    (payload->>'total_amount')::numeric,
    v_status,
    payload->>'payment_method',
    payload->'shipping_address',
    (payload->>'subtotal')::numeric,
    (payload->>'tax')::numeric,
    (payload->>'shipping')::numeric,
    (payload->>'discount')::numeric,
    (payload->>'grand_total')::numeric
  ) RETURNING id INTO new_order_id;

  -- 2. Transactionally record initial Order Audit History Entry
  INSERT INTO public.order_history (
    order_id,
    previous_status,
    new_status,
    changed_by_user_id,
    changed_by_name,
    remarks
  ) VALUES (
    v_order_id,
    NULL,
    v_status,
    v_profile_id,
    v_customer_name,
    'Order created'
  );

  RETURN new_order_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
   SET search_path = '';

-- ─── 2. RLS Policies on public.order_history ──────────────────────────────────

ALTER TABLE public.order_history ENABLE ROW LEVEL SECURITY;

-- Admins can read all order history records
DROP POLICY IF EXISTS "Admin select order_history" ON public.order_history;
CREATE POLICY "Admin select order_history"
  ON public.order_history FOR SELECT
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- Admins can insert status transition audit logs
DROP POLICY IF EXISTS "Admin insert order_history" ON public.order_history;
CREATE POLICY "Admin insert order_history"
  ON public.order_history FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin(auth.uid()));

-- Customers can insert cancellation audit records for their own orders
DROP POLICY IF EXISTS "Users insert own order_cancellation_history" ON public.order_history;
CREATE POLICY "Users insert own order_cancellation_history"
  ON public.order_history FOR INSERT
  TO authenticated
  WITH CHECK (
    new_status = 'Cancelled'
    AND EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.order_id = order_history.order_id
        AND orders.profile_id = auth.uid()
    )
  );

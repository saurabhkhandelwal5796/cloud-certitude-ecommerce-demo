-- ============================================================
-- create_order: a lightweight SECURITY DEFINER fallback RPC for
-- inserting into the orders table when the caller is authenticated.
--
-- NOTE: The production checkout flow uses checkout_order_atomic,
-- which also validates variants, decrements stock, and writes
-- order_history.  This RPC is retained for administrative tooling
-- that bypasses the storefront (e.g. manual order creation).
--
-- Security:
--   - SECURITY DEFINER bypasses RLS so the function can insert.
--   - SET search_path prevents schema-injection attacks.
--   - auth.uid() == profile_id is enforced before any DML.
-- ============================================================

CREATE OR REPLACE FUNCTION public.create_order(payload jsonb)
RETURNS uuid AS $$
DECLARE
  new_order_id uuid;
BEGIN
  -- Validate that the user is authenticated and is creating the order for themselves
  IF auth.uid() IS NULL OR (payload->>'profile_id')::uuid != auth.uid() THEN
    RAISE EXCEPTION 'Unauthorized: profile_id must match authenticated user';
  END IF;

  INSERT INTO public.orders (
    order_id, profile_id, customer_name, customer_email, items,
    total_amount, status, payment_method, shipping_address,
    subtotal, tax, shipping, discount, grand_total
  ) VALUES (
    payload->>'order_id',
    (payload->>'profile_id')::uuid,
    payload->>'customer_name',
    payload->>'customer_email',
    payload->'items',
    (payload->>'total_amount')::numeric,
    COALESCE(payload->>'status', 'Pending'),
    payload->>'payment_method',
    payload->'shipping_address',
    (payload->>'subtotal')::numeric,
    (payload->>'tax')::numeric,
    (payload->>'shipping')::numeric,
    (payload->>'discount')::numeric,
    (payload->>'grand_total')::numeric
  ) RETURNING id INTO new_order_id;

  RETURN new_order_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
   SET search_path = '';

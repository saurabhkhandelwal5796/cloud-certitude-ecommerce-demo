-- Checkout Order Atomic RPC
CREATE OR REPLACE FUNCTION checkout_order_atomic(
  p_order_id TEXT,
  p_profile_id UUID,
  p_customer_name TEXT,
  p_customer_email TEXT,
  p_items JSONB,
  p_total_amount NUMERIC,
  p_payment_method TEXT,
  p_shipping_address JSONB,
  p_subtotal NUMERIC,
  p_tax NUMERIC,
  p_shipping NUMERIC,
  p_discount NUMERIC,
  p_grand_total NUMERIC
) RETURNS JSONB AS $$
DECLARE
  v_item JSONB;
  v_variant_id UUID;
  v_requested_qty INT;
  v_current_qty INT;
BEGIN
  -- Loop through items
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_variant_id := (v_item->>'variantId')::UUID;
    v_requested_qty := COALESCE(
      (v_item->'pricing'->>'quantity')::INT,
      (v_item->>'quantity')::INT
    );
    
    IF v_variant_id IS NULL THEN
      -- Legacy or invalid items cannot be decremented.
      RAISE EXCEPTION 'Item missing variantId: %', v_item->>'name';
    END IF;

    IF v_requested_qty IS NULL OR v_requested_qty <= 0 THEN
      RAISE EXCEPTION
      'Invalid quantity (%) for Variant (%)',
      v_requested_qty,
      v_variant_id;
    END IF;

    -- Lock row for atomic read/write
    SELECT quantity INTO v_current_qty 
    FROM product_variants 
    WHERE id = v_variant_id 
    FOR UPDATE;

    IF v_current_qty IS NULL THEN
      RAISE EXCEPTION 'Variant not found: %', v_variant_id;
    END IF;

    IF v_current_qty < v_requested_qty THEN
      RAISE EXCEPTION 'Out of stock for % (Requested: %, Available: %)', v_item->>'name', v_requested_qty, v_current_qty;
    END IF;

    -- Decrement inventory
    UPDATE product_variants 
    SET quantity = quantity - v_requested_qty 
    WHERE id = v_variant_id;
  END LOOP;

  -- Insert order
  INSERT INTO orders (
    order_id, profile_id, customer_name, customer_email, items, total_amount, status, payment_method, shipping_address, subtotal, tax, shipping, discount, grand_total
  ) VALUES (
    p_order_id, p_profile_id, p_customer_name, p_customer_email, p_items, p_total_amount, 'Pending', p_payment_method, p_shipping_address, p_subtotal, p_tax, p_shipping, p_discount, p_grand_total
  );

  -- Insert initial order history
  INSERT INTO order_history (
    order_id, previous_status, new_status, changed_by_user_id, changed_by_name, remarks
  ) VALUES (
    p_order_id, NULL, 'Pending', p_profile_id, p_customer_name, 'Order created'
  );

  RETURN jsonb_build_object('success', true, 'order_id', p_order_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Restore Inventory Atomic RPC
CREATE OR REPLACE FUNCTION restore_inventory_atomic(
  p_order_id TEXT
) RETURNS JSONB AS $$
DECLARE
  v_items JSONB;
  v_item JSONB;
  v_variant_id UUID;
  v_requested_qty INT;
BEGIN
  -- Lock order row and get items
  SELECT items INTO v_items
  FROM orders
  WHERE order_id = p_order_id
  FOR UPDATE;

  IF v_items IS NULL THEN
    RAISE EXCEPTION 'Order not found: %', p_order_id;
  END IF;

  -- Loop through items and increment
  FOR v_item IN SELECT * FROM jsonb_array_elements(v_items)
  LOOP
    v_variant_id := (v_item->>'variantId')::UUID;
    v_requested_qty := COALESCE(
      (v_item->'pricing'->>'quantity')::INT,
      (v_item->>'quantity')::INT
    );

    IF v_variant_id IS NOT NULL THEN
      IF v_requested_qty IS NULL OR v_requested_qty <= 0 THEN
        RAISE EXCEPTION
        'Invalid quantity (%) for Variant (%)',
        v_requested_qty,
        v_variant_id;
      END IF;

      UPDATE product_variants 
      SET quantity = quantity + v_requested_qty 
      WHERE id = v_variant_id;
    END IF;
  END LOOP;

  RETURN jsonb_build_object('success', true, 'message', 'Inventory restored');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

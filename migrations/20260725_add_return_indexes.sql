-- Migration: Add Performance Indexes for Product Return Module and Audit Logs

-- Index on returns.order_id for fast lookup by order ID
CREATE INDEX IF NOT EXISTS idx_returns_order_id ON public.returns(order_id);

-- Index on returns.user_id for customer order history filtering
CREATE INDEX IF NOT EXISTS idx_returns_user_id ON public.returns(user_id);

-- Index on returns.status for admin filtering tabs (Pending, Approved, Rejected, Returned)
CREATE INDEX IF NOT EXISTS idx_returns_status ON public.returns(status);

-- Index on order_history.order_id for timeline and delivery window calculations
CREATE INDEX IF NOT EXISTS idx_order_history_order_id ON public.order_history(order_id);

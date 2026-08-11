-- Migration: Create order_history table for auditing order status transitions
CREATE TABLE IF NOT EXISTS public.order_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id TEXT NOT NULL,
  previous_status TEXT,
  new_status TEXT NOT NULL,
  changed_by_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  changed_by_name TEXT,
  remarks TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index for fast order_id lookups
CREATE INDEX IF NOT EXISTS idx_order_history_order_id ON public.order_history(order_id);

-- Enable RLS
ALTER TABLE public.order_history ENABLE ROW LEVEL SECURITY;

-- Idempotent Policy Definitions
DROP POLICY IF EXISTS "Allow read order_history" ON public.order_history;
CREATE POLICY "Allow read order_history" ON public.order_history FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow insert order_history" ON public.order_history;
CREATE POLICY "Allow insert order_history" ON public.order_history FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow update order_history" ON public.order_history;
CREATE POLICY "Allow update order_history" ON public.order_history FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow delete order_history" ON public.order_history;
CREATE POLICY "Allow delete order_history" ON public.order_history FOR DELETE USING (true);

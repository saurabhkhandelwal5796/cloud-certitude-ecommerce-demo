-- Migration: Create returns table for customer return requests
CREATE TABLE IF NOT EXISTS public.returns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_email TEXT NOT NULL,
  reason TEXT NOT NULL,
  comments TEXT,
  status TEXT NOT NULL DEFAULT 'Pending',
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index for fast order_id lookups
CREATE INDEX IF NOT EXISTS idx_returns_order_id ON public.returns(order_id);
CREATE INDEX IF NOT EXISTS idx_returns_customer_email ON public.returns(customer_email);

-- Enable RLS
ALTER TABLE public.returns ENABLE ROW LEVEL SECURITY;

-- Idempotent Policy Definitions
DROP POLICY IF EXISTS "Allow read returns" ON public.returns;
CREATE POLICY "Allow read returns" ON public.returns FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow insert returns" ON public.returns;
CREATE POLICY "Allow insert returns" ON public.returns FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow update returns" ON public.returns;
CREATE POLICY "Allow update returns" ON public.returns FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow delete returns" ON public.returns;
CREATE POLICY "Allow delete returns" ON public.returns FOR DELETE USING (true);

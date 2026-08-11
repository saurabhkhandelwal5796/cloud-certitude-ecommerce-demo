-- Migration: Create public.refunds table for Refund Management Foundation
CREATE TABLE IF NOT EXISTS public.refunds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id TEXT NOT NULL,
  return_id UUID REFERENCES public.returns(id) ON DELETE SET NULL,
  customer_email TEXT NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'Pending', -- Pending | Initiated | Completed | Failed
  initiated_by TEXT,
  remarks TEXT,
  
  -- Future Payment Gateway Compatibility Columns (Nullable)
  payment_gateway TEXT,
  gateway_transaction_id TEXT,
  refund_transaction_id TEXT,
  processed_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_refunds_order_id ON public.refunds(order_id);
CREATE INDEX IF NOT EXISTS idx_refunds_return_id ON public.refunds(return_id);
CREATE INDEX IF NOT EXISTS idx_refunds_status ON public.refunds(status);

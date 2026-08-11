-- Migration: Add optional logistics and completion tracking columns to public.returns
ALTER TABLE public.returns
  ADD COLUMN IF NOT EXISTS tracking_number TEXT,
  ADD COLUMN IF NOT EXISTS courier_name TEXT,
  ADD COLUMN IF NOT EXISTS received_by TEXT,
  ADD COLUMN IF NOT EXISTS received_at TIMESTAMP WITH TIME ZONE;

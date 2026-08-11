-- Migration: Create public.admin_activity_logs table for Admin Activity Audit System
CREATE TABLE IF NOT EXISTS public.admin_activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  admin_name TEXT NOT NULL,
  activity_type TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  description TEXT NOT NULL,
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.admin_activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin select admin_activity_logs" ON public.admin_activity_logs FOR SELECT USING (public.is_admin(auth.uid()));
CREATE POLICY "Admin insert admin_activity_logs" ON public.admin_activity_logs FOR INSERT WITH CHECK (public.is_admin(auth.uid()));

CREATE INDEX IF NOT EXISTS idx_admin_logs_admin_user_id ON public.admin_activity_logs(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_logs_activity_type ON public.admin_activity_logs(activity_type);
CREATE INDEX IF NOT EXISTS idx_admin_logs_created_at ON public.admin_activity_logs(created_at);

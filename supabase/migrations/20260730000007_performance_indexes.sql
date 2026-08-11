-- Phase 9A: Database Performance Hardening
-- Creates missing indexes to prevent sequential scans on hot paths

-- Create missing orders indexes for customer lookup
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON public.orders USING btree (customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_profile_id ON public.orders USING btree (profile_id);

-- Create missing products indexes for category and active filtering
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products USING btree (category);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON public.products USING btree (is_active);

-- Subcategory and search indexes are confirmed to exist as:
-- idx_products_subcategory (B-Tree)
-- idx_products_search_vector (GIN)

-- Optional: Drop duplicate subcategory index to save write overhead
DROP INDEX IF EXISTS public.idx_products_subcategory_id;

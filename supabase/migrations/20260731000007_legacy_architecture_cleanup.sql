
-- Phase 24: Legacy Architecture Cleanup

-- 1. Drop Legacy Functions
DROP FUNCTION IF EXISTS public.get_subcategory_facets(uuid);

-- 2. Drop Legacy Tables
DROP TABLE IF EXISTS public.product_attribute_values CASCADE;
DROP TABLE IF EXISTS public.product_attribute_group CASCADE;
DROP TABLE IF EXISTS public.subcategory_attribute_groups CASCADE;
DROP TABLE IF EXISTS public.subcategories CASCADE;

-- 20260729_restore_full_admin_policies.sql (Idempotent Version)

-- 1. Restore DELETE for products and product_attribute_group
DROP POLICY IF EXISTS "Admin delete products" ON public.products;
CREATE POLICY "Admin delete products" ON public.products FOR DELETE USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admin delete product_attribute_group" ON public.product_attribute_group;
CREATE POLICY "Admin delete product_attribute_group" ON public.product_attribute_group FOR DELETE USING (public.is_admin(auth.uid()));

-- 2. Restore all writes for product_attribute_values
DROP POLICY IF EXISTS "Admin insert product_attribute_values" ON public.product_attribute_values;
CREATE POLICY "Admin insert product_attribute_values" ON public.product_attribute_values FOR INSERT WITH CHECK (public.is_admin(auth.uid()));
DROP POLICY IF EXISTS "Admin update product_attribute_values" ON public.product_attribute_values;
CREATE POLICY "Admin update product_attribute_values" ON public.product_attribute_values FOR UPDATE USING (public.is_admin(auth.uid()));
DROP POLICY IF EXISTS "Admin delete product_attribute_values" ON public.product_attribute_values;
CREATE POLICY "Admin delete product_attribute_values" ON public.product_attribute_values FOR DELETE USING (public.is_admin(auth.uid()));

-- 3. Restore all writes for attribute_groups
DROP POLICY IF EXISTS "Admin insert attribute_groups" ON public.attribute_groups;
CREATE POLICY "Admin insert attribute_groups" ON public.attribute_groups FOR INSERT WITH CHECK (public.is_admin(auth.uid()));
DROP POLICY IF EXISTS "Admin update attribute_groups" ON public.attribute_groups;
CREATE POLICY "Admin update attribute_groups" ON public.attribute_groups FOR UPDATE USING (public.is_admin(auth.uid()));
DROP POLICY IF EXISTS "Admin delete attribute_groups" ON public.attribute_groups;
CREATE POLICY "Admin delete attribute_groups" ON public.attribute_groups FOR DELETE USING (public.is_admin(auth.uid()));

-- 4. Restore all writes for attribute_values
DROP POLICY IF EXISTS "Admin insert attribute_values" ON public.attribute_values;
CREATE POLICY "Admin insert attribute_values" ON public.attribute_values FOR INSERT WITH CHECK (public.is_admin(auth.uid()));
DROP POLICY IF EXISTS "Admin update attribute_values" ON public.attribute_values;
CREATE POLICY "Admin update attribute_values" ON public.attribute_values FOR UPDATE USING (public.is_admin(auth.uid()));
DROP POLICY IF EXISTS "Admin delete attribute_values" ON public.attribute_values;
CREATE POLICY "Admin delete attribute_values" ON public.attribute_values FOR DELETE USING (public.is_admin(auth.uid()));

-- 5. Restore all writes for product_variants
DROP POLICY IF EXISTS "Admin insert product_variants" ON public.product_variants;
CREATE POLICY "Admin insert product_variants" ON public.product_variants FOR INSERT WITH CHECK (public.is_admin(auth.uid()));
DROP POLICY IF EXISTS "Admin update product_variants" ON public.product_variants;
CREATE POLICY "Admin update product_variants" ON public.product_variants FOR UPDATE USING (public.is_admin(auth.uid()));
DROP POLICY IF EXISTS "Admin delete product_variants" ON public.product_variants;
CREATE POLICY "Admin delete product_variants" ON public.product_variants FOR DELETE USING (public.is_admin(auth.uid()));

-- 6. Restore all writes for variant_attribute_values
DROP POLICY IF EXISTS "Admin insert variant_attribute_values" ON public.variant_attribute_values;
CREATE POLICY "Admin insert variant_attribute_values" ON public.variant_attribute_values FOR INSERT WITH CHECK (public.is_admin(auth.uid()));
DROP POLICY IF EXISTS "Admin update variant_attribute_values" ON public.variant_attribute_values;
CREATE POLICY "Admin update variant_attribute_values" ON public.variant_attribute_values FOR UPDATE USING (public.is_admin(auth.uid()));
DROP POLICY IF EXISTS "Admin delete variant_attribute_values" ON public.variant_attribute_values;
CREATE POLICY "Admin delete variant_attribute_values" ON public.variant_attribute_values FOR DELETE USING (public.is_admin(auth.uid()));

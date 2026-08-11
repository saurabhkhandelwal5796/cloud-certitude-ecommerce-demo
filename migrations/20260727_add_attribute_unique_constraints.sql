-- ============================================================
-- Migration: Add unique constraints to the Attribute Engine
-- Prevents duplicate group names, attribute names within a group,
-- and attribute values within an attribute (all case-insensitive).
-- ============================================================

-- attribute_groups: unique group names (case-insensitive)
CREATE UNIQUE INDEX IF NOT EXISTS uq_attribute_groups_name_lower
  ON public.attribute_groups (LOWER(name));

-- attributes: unique attribute name per group (case-insensitive)
CREATE UNIQUE INDEX IF NOT EXISTS uq_attributes_group_name_lower
  ON public.attributes (group_id, LOWER(name));

-- attribute_values: unique value per attribute (case-insensitive)
CREATE UNIQUE INDEX IF NOT EXISTS uq_attribute_values_attr_value_lower
  ON public.attribute_values (attribute_id, LOWER(value));

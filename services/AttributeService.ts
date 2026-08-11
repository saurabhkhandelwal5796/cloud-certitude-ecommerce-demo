/**
 * AttributeService.ts
 *
 * Service layer for the Dynamic Product Attribute Engine.
 *
 * Manages a three-tier hierarchy stored in Supabase:
 *   attribute_groups  →  attributes  →  attribute_values
 *
 * All operations use the browser Supabase client (getSupabaseClient),
 * matching the pattern used throughout AdminService.ts.
 *
 * This service is intentionally generic — it carries no knowledge of
 * clothing, categories, or any domain-specific logic. It is a pure
 * key/value attribute store that can support any product taxonomy.
 */

import { getSupabaseClient } from "@/lib/supabase/client";

// ─── Exported Types ──────────────────────────────────────────────────────────

export interface AttributeGroup {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
}

export interface Attribute {
  id: string;
  group_id: string;
  name: string;
  created_at: string;
}

export interface AttributeValue {
  id: string;
  attribute_id: string;
  value: string;
  created_at: string;
}

// ─── Validation ───────────────────────────────────────────────────────────────

/**
 * Allowed characters: letters, digits, spaces, hyphens, ampersands.
 * Minimum 2 characters, maximum 50. Must contain at least one letter.
 *
 * Valid:   "Mid Rise", "T-Shirts", "Men & Women", "Slim Fit"
 * Invalid: "**", "@@@", "!!!!", "----", "<script>"
 */
const NAME_REGEX = /^[A-Za-z0-9 \-&]+$/;

export function validateAttributeName(raw: string): string | null {
  const name = raw.trim();
  if (name.length < 2) return "Name must be at least 2 characters.";
  if (name.length > 50) return "Name must be at most 50 characters.";
  if (!NAME_REGEX.test(name)) {
    return "Invalid name format. Only letters, numbers, spaces, hyphens ( - ) and ampersands ( & ) are allowed.";
  }
  if (!/[A-Za-z]/.test(name)) {
    return "Name must contain at least one letter.";
  }
  return null; // valid
}

/**
 * Validates an attribute VALUE (e.g. "30", "32", "UK-9", "XXL", "Slim Fit").
 *
 * Less strict than validateAttributeName — numbers-only values are valid
 * because sizes like 30, 32, 44 are common attribute values.
 *
 * Minimum length: 1  (a single digit is acceptable)
 * Maximum length: 50
 * Allowed characters: letters, digits, spaces, hyphens, ampersands.
 * Does NOT require at least one letter.
 *
 * Valid:   "30", "32", "XXL", "UK-9", "128 GB", "Slim", "Mid Rise"
 * Invalid: "**", "@@@", "<script>", ""
 */
export function validateAttributeValue(raw: string): string | null {
  const val = raw.trim();
  if (val.length < 1) return "Value cannot be empty.";
  if (val.length > 50) return "Value must be at most 50 characters.";
  if (!NAME_REGEX.test(val)) {
    return "Invalid format. Only letters, numbers, spaces, hyphens ( - ) and ampersands ( & ) are allowed.";
  }
  return null; // valid — no letter requirement for values
}


// ─── Error Mapping ────────────────────────────────────────────────────────────

/**
 * Maps Supabase / Postgres error codes to user-friendly messages.
 * Code 23505 = unique_violation.
 */
function mapSupabaseError(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error: any,
  context: "group" | "attribute" | "value"
): string {
  if (error?.code === "23505") {
    if (context === "group") return "Attribute Group already exists.";
    if (context === "attribute") return "Attribute already exists in this group.";
    return "Attribute Value already exists.";
  }
  return "Failed to save. Please try again.";
}



/**
 * Fetch all attribute groups, ordered alphabetically by name.
 */
export async function getAttributeGroups(): Promise<AttributeGroup[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("attribute_groups")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    console.error("[AttributeService] getAttributeGroups error:", error);
    throw error;
  }
  return data ?? [];
}

/**
 * Create a new attribute group.
 */
export async function createAttributeGroup(
  name: string,
  description?: string
): Promise<AttributeGroup> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("attribute_groups")
    .insert({ name: name.trim(), description: description?.trim() || null })
    .select()
    .single();

  if (error) {
    console.error("[AttributeService] createAttributeGroup error:", error);
    throw new Error(mapSupabaseError(error, "group"));
  }
  return data;
}

/**
 * Update an existing attribute group's name and/or description.
 */
export async function updateAttributeGroup(
  id: string,
  name: string,
  description?: string
): Promise<AttributeGroup> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("attribute_groups")
    .update({ name: name.trim(), description: description?.trim() || null })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("[AttributeService] updateAttributeGroup error:", error);
    throw new Error(mapSupabaseError(error, "group"));
  }
  return data;
}

/**
 * Delete an attribute group. Cascades to all child attributes and values.
 */
export async function deleteAttributeGroup(id: string): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from("attribute_groups")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("[AttributeService] deleteAttributeGroup error:", error);
    throw error;
  }
}

// ─── Attributes ───────────────────────────────────────────────────────────────

/**
 * Fetch all attributes belonging to a specific group.
 */
export async function getAttributes(groupId: string): Promise<Attribute[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("attributes")
    .select("*")
    .eq("group_id", groupId)
    .order("name", { ascending: true });

  if (error) {
    console.error("[AttributeService] getAttributes error:", error);
    throw error;
  }
  return data ?? [];
}

/**
 * Create a new attribute inside a group.
 */
export async function createAttribute(
  groupId: string,
  name: string
): Promise<Attribute> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("attributes")
    .insert({ group_id: groupId, name: name.trim() })
    .select()
    .single();

  if (error) {
    console.error("[AttributeService] createAttribute error:", error);
    throw new Error(mapSupabaseError(error, "attribute"));
  }
  return data;
}

/**
 * Rename an existing attribute.
 */
export async function updateAttribute(
  id: string,
  name: string
): Promise<Attribute> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("attributes")
    .update({ name: name.trim() })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("[AttributeService] updateAttribute error:", error);
    throw new Error(mapSupabaseError(error, "attribute"));
  }
  return data;
}

/**
 * Delete an attribute. Cascades to all child attribute_values.
 */
export async function deleteAttribute(id: string): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from("attributes")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("[AttributeService] deleteAttribute error:", error);
    throw error;
  }
}

// ─── Attribute Values ─────────────────────────────────────────────────────────

/**
 * Fetch all values for a specific attribute.
 */
export async function getAttributeValues(
  attributeId: string
): Promise<AttributeValue[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("attribute_values")
    .select("*")
    .eq("attribute_id", attributeId)
    .order("value", { ascending: true });

  if (error) {
    console.error("[AttributeService] getAttributeValues error:", error);
    throw error;
  }
  return data ?? [];
}

/**
 * Create a new value under an attribute.
 */
export async function createAttributeValue(
  attributeId: string,
  value: string
): Promise<AttributeValue> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("attribute_values")
    .insert({ attribute_id: attributeId, value: value.trim() })
    .select()
    .single();

  if (error) {
    console.error("[AttributeService] createAttributeValue error:", error);
    throw new Error(mapSupabaseError(error, "value"));
  }
  return data;
}

/**
 * Update an existing attribute value string.
 */
export async function updateAttributeValue(
  id: string,
  value: string
): Promise<AttributeValue> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("attribute_values")
    .update({ value: value.trim() })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("[AttributeService] updateAttributeValue error:", error);
    throw new Error(mapSupabaseError(error, "value"));
  }
  return data;
}

/**
 * Delete an attribute value.
 */
export async function deleteAttributeValue(id: string): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from("attribute_values")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("[AttributeService] deleteAttributeValue error:", error);
    throw error;
  }
}

// ─── Product ↔ Attribute Assignment ──────────────────────────────────────────

/**
 * A fully-resolved attribute group tree used to populate the
 * "Manage Attributes" modal checkboxes.
 */
export interface CatalogGroup {
  id: string;
  name: string;
  description: string | null;
  attributes: CatalogAttribute[];
}

export interface CatalogAttribute {
  id: string;
  name: string;
  values: CatalogValue[];
}

export interface CatalogValue {
  id: string;
  value: string;
}

/**
 * Fetches the complete attribute catalog:
 *   groups → attributes → values
 * Returned as a nested tree for rendering the assignment modal.
 */
export async function getFullCatalog(): Promise<CatalogGroup[]> {
  const supabase = getSupabaseClient();

  const [groupsRes, attrsRes, valuesRes] = await Promise.all([
    supabase.from("attribute_groups").select("*").order("name", { ascending: true }),
    supabase.from("attributes").select("*").order("name", { ascending: true }),
    supabase.from("attribute_values").select("*").order("value", { ascending: true }),
  ]);

  if (groupsRes.error) throw groupsRes.error;
  if (attrsRes.error) throw attrsRes.error;
  if (valuesRes.error) throw valuesRes.error;

  const groups = groupsRes.data ?? [];
  const attrs = attrsRes.data ?? [];
  const values = valuesRes.data ?? [];

  return groups.map((g) => ({
    id: g.id,
    name: g.name,
    description: g.description,
    attributes: attrs
      .filter((a) => a.group_id === g.id)
      .map((a) => ({
        id: a.id,
        name: a.name,
        values: values
          .filter((v) => v.attribute_id === a.id)
          .map((v) => ({ id: v.id, value: v.value })),
      })),
  }));
}

/**
 * Returns the set of attribute_value_ids currently assigned to a product.
 *
 * Reads from product_selected_attribute_values — a product-level junction table
 * that has no relationship to product_variants. This is the correct source of
 * truth for "which attribute values has the admin ticked for this product".
 */
export async function getProductAttributes(
  productId: string
): Promise<string[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("product_selected_attribute_values" as any)
    .select("attribute_value_id")
    .eq("product_id", productId);

  if (error) {
    console.error("[AttributeService] getProductAttributes error:", error);
    throw error;
  }
  return (data ?? []).map((r: any) => String(r.attribute_value_id));
}

/**
 * Atomically replaces all attribute value selections for a product.
 *
 * Deletes every existing row for productId in product_selected_attribute_values,
 * then inserts the new set.  Passing an empty array clears all selections.
 *
 * This function NEVER touches product_variants.  Variants are a separate
 * concept and are created explicitly by the admin in the Variants tab.
 */
export async function setProductAttributes(
  productId: string,
  assignments: Array<{ attributeId: string; attributeValueId: string }>
): Promise<void> {
  const supabase = getSupabaseClient();

  // 1. Clear existing product-level selections
  const { error: deleteError } = await (supabase as any)
    .from("product_selected_attribute_values")
    .delete()
    .eq("product_id", productId);

  if (deleteError) {
    console.error("[AttributeService] setProductAttributes delete error:", deleteError);
    throw deleteError;
  }

  // 2. Insert new selections (if any)
  if (assignments.length === 0) return;

  const rows = assignments.map((a) => ({
    product_id: productId,
    attribute_value_id: a.attributeValueId,
  }));

  const { error: insertError } = await (supabase as any)
    .from("product_selected_attribute_values")
    .insert(rows);

  if (insertError) {
    console.error("[AttributeService] setProductAttributes insert error:", insertError);
    throw insertError;
  }
}

/**
 * VariantService.ts
 *
 * CRUD operations for product_variants and variant_attribute_values.
 *
 * Architecture:
 *   product  →  product_variants  (unlimited variants per product)
 *                     ↓
 *            variant_attribute_values  (e.g. Color=Blue, Size=30)
 */

import { getSupabaseClient } from "@/lib/supabase/client";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ProductVariant {
  id: string;
  productId: string;
  sku: string;
  variantCode: string;
  variantName: string;
  price: number;
  discountedPrice: number | null;
  quantity: number;
  isActive: boolean;
  isPrimary: boolean;
  images: string[];
  variantSignature: string;
  /** GST rate for this variant (e.g. 5, 12, 18, 28) */
  gstRate: number;
  createdAt: string;
  updatedAt: string;
}

export interface VariantAttributeValue {
  id: string;
  variantId: string;
  attributeId: string;
  attributeValueId: string;
}

export interface CreateVariantInput {
  productId: string;
  sku: string;
  variantName?: string;
  price: number;
  discountedPrice?: number | null;
  quantity?: number;
  isActive?: boolean;
  isPrimary?: boolean;
  images?: string[];
  variantSignature?: string;
  /** GST rate for this variant (default: 5) */
  gstRate?: number;
}

export interface UpdateVariantInput {
  sku?: string;
  variantName?: string;
  price?: number;
  discountedPrice?: number | null;
  quantity?: number;
  isActive?: boolean;
  isPrimary?: boolean;
  images?: string[];
  variantSignature?: string;
  /** GST rate for this variant */
  gstRate?: number;
}

// ─── Validation ───────────────────────────────────────────────────────────────

const SKU_REGEX = /^[A-Za-z0-9 \-_&/]+$/;

export function validateSku(raw: string): string | null {
  const sku = raw.trim();
  if (sku.length < 1) return "SKU cannot be empty.";
  if (sku.length > 100) return "SKU must be at most 100 characters.";
  if (!SKU_REGEX.test(sku)) {
    return "Invalid SKU. Only letters, numbers, spaces, hyphens ( - ), underscores ( _ ), slashes ( / ) and ampersands ( & ) are allowed.";
  }
  return null;
}

export function generateVariantSignature(attributeValueIds: string[]): string {
  // Sort attribute value IDs alphabetically to ensure deterministic hash
  return attributeValueIds.filter(Boolean).sort().join('|');
}

export function validateVariantFields(
  price: number | string,
  quantity: number | string,
  discountedPrice?: number | string | null,
  sku?: string,
  variantName?: string
): { isValid: boolean; error: string | null } {
  const priceNum = typeof price === 'string' ? parseFloat(price) : price;
  if (isNaN(priceNum) || priceNum <= 0) {
    return { isValid: false, error: "Price must be a valid positive number." };
  }
  
  const qtyNum = typeof quantity === 'string' ? parseInt(quantity, 10) : quantity;
  if (isNaN(qtyNum) || qtyNum < 0) {
    return { isValid: false, error: "Quantity must be a valid non-negative number." };
  }
  
  if (discountedPrice !== undefined && discountedPrice !== null && String(discountedPrice).trim() !== "") {
    const discPercentNum = typeof discountedPrice === 'string' ? parseFloat(discountedPrice) : discountedPrice;
    if (discPercentNum < 0 || discPercentNum > priceNum) {
      return { isValid: false, error: "Discounted price cannot be negative or greater than the original price." };
    }
  }

  if (sku !== undefined && !sku.trim()) {
    return { isValid: false, error: "SKU is required." };
  }

  if (variantName !== undefined && !variantName.trim()) {
    return { isValid: false, error: "At least one attribute must be selected to generate a variant name." };
  }

  return { isValid: true, error: null };
}

/**
 * Auto-generates a variant name from an array of selected attribute values.
 * Ignores empty values and joins them with " / ".
 * Example: ["Blue", "M", "Cotton"] -> "Blue / M / Cotton"
 */
export function generateVariantName(selectedValues: (string | null | undefined)[]): string {
  return selectedValues.filter(Boolean).join(" / ");
}

export async function isSkuUnique(sku: string, excludeVariantId?: string): Promise<boolean> {
  const supabase = getSupabaseClient();
  let query = supabase.from("product_variants").select("id").eq("sku", sku.trim());
  if (excludeVariantId) {
    query = query.neq("id", excludeVariantId);
  }
  const { data, error } = await query;
  if (error) {
    console.error("[VariantService] isSkuUnique error:", error);
    throw new Error("Failed to check SKU uniqueness.");
  }
  return data.length === 0;
}

export async function uploadVariantImages(
  productId: string,
  variantId: string,
  files: File[]
): Promise<string[]> {
  if (!files || files.length === 0) return [];
  const supabase = getSupabaseClient();
  
  return Promise.all(
    files.map(async (file) => {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
      const filePath = `product-variants/${productId}/${variantId}/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from("profile-images")
        .upload(filePath, file);
        
      if (uploadError) throw uploadError;
      
      const { data } = supabase.storage.from("profile-images").getPublicUrl(filePath);
      return data.publicUrl;
    })
  );
}

// ─── Row Mapper ───────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapRow(row: any): ProductVariant {
  return {
    id: String(row.id),
    productId: String(row.product_id),
    sku: String(row.sku),
    variantCode: String(row.variant_code ?? ""),
    variantName: String(row.variant_name ?? ""),
    price: Number(row.price),
    discountedPrice: row.discounted_price != null ? Number(row.discounted_price) : null,
    quantity: Number(row.quantity ?? 0),
    isActive: Boolean(row.is_active ?? true),
    isPrimary: Boolean(row.is_primary ?? false),
    images: Array.isArray(row.images) ? row.images : [],
    variantSignature: String(row.variant_signature ?? ""),
    gstRate: Number(row.gst_rate ?? 5),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

// ─── CRUD ─────────────────────────────────────────────────────────────────────

/**
 * Returns all variants for a given product, ordered by creation date.
 */
export async function getProductVariants(productId: string): Promise<ProductVariant[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("product_variants")
    .select("*")
    .eq("product_id", productId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("[VariantService] getProductVariants error:", error);
    throw error;
  }
  return (data ?? []).map(mapRow);
}

/**
 * Returns a single variant by ID.
 */
export async function getVariantById(variantId: string): Promise<ProductVariant | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("product_variants")
    .select("*")
    .eq("id", variantId)
    .maybeSingle();

  if (error) {
    console.error("[VariantService] getVariantById error:", error);
    throw error;
  }
  return data ? mapRow(data) : null;
}

/**
 * Creates a new variant for a product.
 * Validates SKU format and checks for duplicate SKU before inserting.
 */
export async function createVariant(input: CreateVariantInput): Promise<ProductVariant> {
  // 1. Validate SKU
  const skuErr = validateSku(input.sku);
  if (skuErr) throw new Error(skuErr);

  const supabase = getSupabaseClient();

  // 2. Duplicate SKU check (client-side pre-flight — DB constraint is the final guard)
  const { data: existing } = await supabase
    .from("product_variants")
    .select("id")
    .eq("sku", input.sku.trim())
    .maybeSingle();
  if (existing) throw new Error("A variant with this SKU already exists.");

  // Check if this is the first variant
  const { count } = await supabase
    .from("product_variants")
    .select("id", { count: "exact", head: true })
    .eq("product_id", input.productId);

  const isFirst = count === 0;

  // 3. Insert
  const { data, error } = await supabase
    .from("product_variants")
    .insert({
      product_id: input.productId,
      sku: input.sku.trim(),
      variant_name: (input.variantName ?? "").trim(),
      price: input.price,
      discounted_price: input.discountedPrice ?? null,
      quantity: input.quantity ?? 0,
      is_active: input.isActive ?? true,
      is_primary: input.isPrimary ?? isFirst,
      images: input.images ?? [],
      variant_signature: input.variantSignature ?? "",
      gst_rate: input.gstRate ?? 5,
    })
    .select()
    .single();

  if (error) {
    console.error("[VariantService] createVariant error:", error);
    if (error.code === "23505") {
      if (error.message?.includes("uq_product_signature")) {
        throw new Error("A variant with this exact combination of attributes already exists.");
      }
      throw new Error("A variant with this SKU or attribute combination already exists.");
    }
    throw error;
  }
  
  const created = mapRow(data);
  
  // 4. Sync parent product if this variant is primary
  if (created.isPrimary) {
    await syncParentProduct(created);
  }
  
  return created;
}

/**
 * Internal helper to sync a primary variant's data to the parent product row.
 */
async function syncParentProduct(variant: ProductVariant): Promise<void> {
  const supabase = getSupabaseClient();
  let defaultImage = "";
  if (variant.images && variant.images.length > 0) {
    defaultImage = variant.images[0];
  }
  const discountPercent = variant.discountedPrice 
    ? Math.round(((variant.price - variant.discountedPrice) / variant.price) * 100)
    : 0;

  const { error: syncErr } = await supabase
    .from("products")
    .update({
      price: variant.price,
      discount_percent: discountPercent,
      stock: variant.quantity,
      sku: variant.sku,
      images: variant.images || []
    } as any)
    .eq("id", variant.productId);

  if (syncErr) throw syncErr;
}

/**
 * Updates a variant's fields. Only supplied fields are changed.
 */
export async function updateVariant(
  variantId: string,
  input: UpdateVariantInput
): Promise<ProductVariant> {
  if (input.sku !== undefined) {
    const skuErr = validateSku(input.sku);
    if (skuErr) throw new Error(skuErr);
  }

  const supabase = getSupabaseClient();
  const updatePayload: {
    sku?: string;
    variant_name?: string;
    price?: number;
    discounted_price?: number | null;
    quantity?: number;
    is_active?: boolean;
    is_primary?: boolean;
    images?: string[];
    variant_signature?: string;
  } = {};
  if (input.sku !== undefined)             updatePayload.sku              = input.sku.trim();
  if (input.variantName !== undefined)     updatePayload.variant_name     = input.variantName.trim();
  if (input.price !== undefined)           updatePayload.price            = input.price;
  if (input.discountedPrice !== undefined) updatePayload.discounted_price = input.discountedPrice;
  if (input.quantity !== undefined)        updatePayload.quantity         = input.quantity;
  if (input.isActive !== undefined)        updatePayload.is_active        = input.isActive;
  if (input.isPrimary !== undefined)       updatePayload.is_primary       = input.isPrimary;
  if (input.images !== undefined)          updatePayload.images           = input.images;
  if (input.variantSignature !== undefined) updatePayload.variant_signature = input.variantSignature;
  if (input.gstRate !== undefined)         (updatePayload as any).gst_rate = input.gstRate;

  const { data, error } = await supabase
    .from("product_variants")
    .update(updatePayload)
    .eq("id", variantId)
    .select()
    .single();

  if (error) {
    console.error("[VariantService] updateVariant error:", error);
    if (error.code === "23505") {
      if (error.message?.includes("uq_product_signature")) {
        throw new Error("A variant with this exact combination of attributes already exists.");
      }
      throw new Error("A variant with this SKU or attribute combination already exists.");
    }
    throw error;
  }
  
  const updated = mapRow(data);
  
  // Sync parent product if this variant is primary
  if (updated.isPrimary) {
    await syncParentProduct(updated);
  }
  
  return updated;

}

/**
 * Deletes a variant and all its attribute value assignments (cascade).
 * If the deleted variant was primary, promotes the oldest remaining active variant.
 */
export async function deleteVariant(variantId: string): Promise<void> {
  const supabase = getSupabaseClient();
  
  // Get variant to check if it was primary
  const { data: variant } = await supabase
    .from("product_variants")
    .select("product_id, is_primary")
    .eq("id", variantId)
    .maybeSingle();

  const { error } = await supabase
    .from("product_variants")
    .delete()
    .eq("id", variantId);

  if (error) {
    console.error("[VariantService] deleteVariant error:", error);
    throw error;
  }

  // Auto-promote next variant if primary was deleted
  if (variant && variant.is_primary) {
    const { data: nextVariants } = await supabase
      .from("product_variants")
      .select("id")
      .eq("product_id", variant.product_id)
      .eq("is_active", true)
      .order("created_at", { ascending: true })
      .limit(1);
      
    if (nextVariants && nextVariants.length > 0) {
      await setPrimaryVariant(variant.product_id, nextVariants[0].id);
    }
  }
}

/**
 * Sets a variant as the primary variant for its product.
 * Updates the product_variants table and syncs denormalized fields to the products table.
 */
export async function setPrimaryVariant(productId: string, variantId: string): Promise<void> {
  const supabase = getSupabaseClient();
  
  // 1. Demote all variants for this product
  const { error: demoteErr } = await supabase
    .from("product_variants")
    .update({ is_primary: false })
    .eq("product_id", productId);
    
  if (demoteErr) throw demoteErr;

  // 2. Promote the new variant and fetch its data
  const { data: promotedVariant, error: promoteErr } = await supabase
    .from("product_variants")
    .update({ is_primary: true })
    .eq("id", variantId)
    .select()
    .single();

  if (promoteErr) throw promoteErr;

  // 3. Sync to parent product
  if (promotedVariant) {
    await syncParentProduct(mapRow(promotedVariant));
  }
}

/**
 * Bulk updates a specific set of fields for variants by IDs.
 */
export async function bulkUpdateVariantsFields(variantIds: string[], fields: Partial<ProductVariant>): Promise<void> {
  if (variantIds.length === 0) return;
  const supabase = getSupabaseClient();
  const updatePayload: any = {};
  if (fields.price !== undefined) updatePayload.price = fields.price;
  if (fields.discountedPrice !== undefined) updatePayload.discounted_price = fields.discountedPrice;
  if (fields.quantity !== undefined) updatePayload.quantity = fields.quantity;
  if (fields.isActive !== undefined) updatePayload.is_active = fields.isActive;

  const { error } = await supabase
    .from("product_variants")
    .update(updatePayload)
    .in("id", variantIds);

  if (error) {
    console.error("[VariantService] bulkUpdateVariantsFields error:", error);
    throw error;
  }
}

/**
 * Bulk updates variants using upsert.
 */
export async function bulkUpsertVariants(
  variants: Array<ProductVariant>
): Promise<ProductVariant[]> {
  if (variants.length === 0) return [];
  
  const supabase = getSupabaseClient();
  const payload = variants.map(v => ({
    id: v.id,
    product_id: v.productId,
    sku: v.sku.trim(),
    variant_name: v.variantName.trim(),
    price: v.price,
    discounted_price: v.discountedPrice,
    quantity: v.quantity,
    is_active: v.isActive,
    images: v.images,
    variant_signature: v.variantSignature,
    gst_rate: v.gstRate ?? 5,
  }));

  const { data, error } = await supabase
    .from("product_variants")
    .upsert(payload, { onConflict: "id" })
    .select();

  if (error) {
    console.error("[VariantService] bulkUpsertVariants error:", error);
    throw error;
  }
  return (data ?? []).map(mapRow);
}

/**
 * Bulk deletes variants by IDs.
 */
export async function bulkDeleteVariants(variantIds: string[]): Promise<void> {
  if (variantIds.length === 0) return;
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from("product_variants")
    .delete()
    .in("id", variantIds);

  if (error) {
    console.error("[VariantService] bulkDeleteVariants error:", error);
    throw error;
  }
}

// ─── Variant Attribute Values ─────────────────────────────────────────────────

/**
 * Returns all attribute value IDs assigned to a variant.
 */
export async function getVariantAttributeValues(variantId: string): Promise<string[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("variant_attribute_values")
    .select("attribute_value_id")
    .eq("variant_id", variantId);

  if (error) {
    console.error("[VariantService] getVariantAttributeValues error:", error);
    throw error;
  }
  return (data ?? []).map((r) => String(r.attribute_value_id));
}

/**
 * Replaces ALL attribute value assignments for a variant (delete + insert).
 * Each assignment maps: variant → attribute → attribute_value.
 */
export async function setVariantAttributeValues(
  variantId: string,
  assignments: Array<{ attributeId: string; attributeValueId: string }>
): Promise<void> {
  const supabase = getSupabaseClient();

  // 1. Delete existing assignments
  const { error: deleteError } = await supabase
    .from("variant_attribute_values")
    .delete()
    .eq("variant_id", variantId);

  if (deleteError) {
    console.error("[VariantService] setVariantAttributeValues delete error:", deleteError);
    throw deleteError;
  }

  if (assignments.length === 0) return;

  // 2. Insert new assignments
  const rows = assignments.map((a) => ({
    variant_id: variantId,
    attribute_id: a.attributeId,
    attribute_value_id: a.attributeValueId,
  }));

  const { error: insertError } = await supabase
    .from("variant_attribute_values")
    .insert(rows);

  if (insertError) {
    console.error("[VariantService] setVariantAttributeValues insert error:", insertError);
    throw insertError;
  }
}

// ─── Bulk Helpers ─────────────────────────────────────────────────────────────

/**
 * Returns all variants for a list of product IDs in a single query.
 * Used by getProducts() shim to avoid N+1 queries.
 *
 * Returns: { [productId]: ProductVariant[] }
 */
export async function getVariantsByProductIds(
  productIds: string[]
): Promise<Record<string, ProductVariant[]>> {
  if (productIds.length === 0) return {};

  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("product_variants")
    .select("*")
    .in("product_id", productIds)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("[VariantService] getVariantsByProductIds error:", error);
    throw error;
  }

  const result: Record<string, ProductVariant[]> = {};
  for (const row of data ?? []) {
    const variant = mapRow(row);
    if (!result[variant.productId]) result[variant.productId] = [];
    result[variant.productId].push(variant);
  }
  return result;
}

// ─── Storefront Variant Detail ─────────────────────────────────────────────────

/**
 * A variant paired with a human-readable attribute map.
 * Example: { variant: {...}, attributes: { "Color": "Blue", "Size": "30" } }
 */
export interface VariantWithAttributes {
  variant: ProductVariant;
  /** Attribute name → value string, e.g. { Color: "Blue", Size: "30" } */
  attributes: Record<string, string>;
}

/**
 * Fetches all active variants for a product, each enriched with their
 * human-readable attribute key/value pairs.
 *
 * Runs 3 parallel queries (variants, attribute_values join, attributes names)
 * and stitches them together client-side to avoid N+1 round trips.
 *
 * Falls back gracefully: if the variant_attribute_values table is empty or
 * the variant has no assignments, attributes will be an empty object {}.
 */
export async function getVariantsWithAttributes(
  productId: string
): Promise<VariantWithAttributes[]> {
  const supabase = getSupabaseClient();

  // 1. All variants for the product (active + inactive — UI decides what to show)
  const { data: variantRows, error: variantErr } = await supabase
    .from("product_variants")
    .select("*")
    .eq("product_id", productId)
    .order("created_at", { ascending: true });

  if (variantErr) {
    console.error("[VariantService] getVariantsWithAttributes variants error:", variantErr);
    throw variantErr;
  }

  const variants = (variantRows ?? []).map(mapRow);
  if (variants.length === 0) return [];

  const variantIds = variants.map((v) => v.id);

  // 2. variant_attribute_values rows for these variants
  const { data: vavRows, error: vavErr } = await supabase
    .from("variant_attribute_values")
    .select("variant_id, attribute_id, attribute_value_id")
    .in("variant_id", variantIds);

  if (vavErr) {
    // Non-fatal — table may be empty before any admin assignments
    console.warn("[VariantService] getVariantsWithAttributes vav error:", vavErr);
    return variants.map((v) => ({ variant: v, attributes: {} }));
  }

  // If no assignments at all, return variants with empty attribute maps
  if (!vavRows || vavRows.length === 0) {
    return variants.map((v) => ({ variant: v, attributes: {} }));
  }

  // 3. Fetch the attribute names and values we actually need (not the whole catalog)
  const attrValueIds = [...new Set(vavRows.map((r) => r.attribute_value_id))];
  const attrIds      = [...new Set(vavRows.map((r) => r.attribute_id))];

  const [avRes, aRes] = await Promise.all([
    supabase
      .from("attribute_values")
      .select("id, value")
      .in("id", attrValueIds),
    supabase
      .from("attributes")
      .select("id, name")
      .in("id", attrIds),
  ]);

  // Build lookup maps
  const valueMap: Record<string, string> = {};
  for (const row of avRes.data ?? []) valueMap[row.id] = row.value;

  const attrNameMap: Record<string, string> = {};
  for (const row of aRes.data ?? []) attrNameMap[row.id] = row.name;

  // 4. Group vav rows by variant_id
  const vavByVariant: Record<string, typeof vavRows> = {};
  for (const row of vavRows) {
    if (!vavByVariant[row.variant_id]) vavByVariant[row.variant_id] = [];
    vavByVariant[row.variant_id].push(row);
  }

  // 5. Stitch together
  return variants.map((v) => {
    const rows = vavByVariant[v.id] ?? [];
    const attributes: Record<string, string> = {};
    for (const row of rows) {
      const attrName  = attrNameMap[row.attribute_id];
      const attrValue = valueMap[row.attribute_value_id];
      if (attrName && attrValue) {
        attributes[attrName] = attrValue;
      }
    }
    return { variant: v, attributes };
  });
}

// ─── SSR-Safe Variant Fetcher ──────────────────────────────────────────────────

/**
 * Server-side equivalent of getVariantsWithAttributes.
 *
 * Uses getSupabaseAdmin() (service role key) instead of createBrowserClient,
 * so it works correctly inside Next.js Server Components and Route Handlers.
 *
 * ⚠️  Do NOT import this in Client Components — the service role key is
 * only available server-side.
 */
export async function getVariantsWithAttributesSSR(
  productId: string
): Promise<VariantWithAttributes[]> {
  // Dynamic import keeps the service role key out of client bundles
  const { getSupabaseAdmin } = await import("@/lib/supabase/server");
  const supabase = getSupabaseAdmin();

  // 1. All variants for the product
  const { data: variantRows, error: variantErr } = await supabase
    .from("product_variants")
    .select("*")
    .eq("product_id", productId)
    .order("created_at", { ascending: true });

  if (variantErr) {
    console.error("[VariantService SSR] variants error:", variantErr);
    throw variantErr;
  }

  const variants = (variantRows ?? []).map(mapRow);
  if (variants.length === 0) return [];

  const variantIds = variants.map((v) => v.id);

  // 2. variant_attribute_values rows for these variants
  const { data: vavRows, error: vavErr } = await (supabase as any)
    .from("variant_attribute_values")
    .select("variant_id, attribute_id, attribute_value_id")
    .in("variant_id", variantIds);

  if (vavErr || !vavRows || vavRows.length === 0) {
    return variants.map((v) => ({ variant: v, attributes: {} }));
  }

  // 3. Fetch attribute names and values
  const attrValueIds = [...new Set(vavRows.map((r: any) => r.attribute_value_id))];
  const attrIds      = [...new Set(vavRows.map((r: any) => r.attribute_id))];

  const [avRes, aRes] = await Promise.all([
    (supabase as any).from("attribute_values").select("id, value").in("id", attrValueIds),
    (supabase as any).from("attributes").select("id, name").in("id", attrIds),
  ]);

  const valueMap: Record<string, string> = {};
  for (const row of (avRes.data as any[]) ?? []) valueMap[row.id] = row.value;

  const attrNameMap: Record<string, string> = {};
  for (const row of (aRes.data as any[]) ?? []) attrNameMap[row.id] = row.name;

  // 4. Group by variant_id
  const vavByVariant: Record<string, typeof vavRows> = {};
  for (const row of (vavRows as any[])) {
    if (!vavByVariant[row.variant_id]) vavByVariant[row.variant_id] = [];
    vavByVariant[row.variant_id].push(row);
  }

  // 5. Stitch together
  return variants.map((v) => {
    const rows = vavByVariant[v.id] ?? [];
    const attributes: Record<string, string> = {};
    for (const row of rows) {
      const attrName  = attrNameMap[row.attribute_id];
      const attrValue = valueMap[row.attribute_value_id];
      if (attrName && attrValue) {
        attributes[attrName] = attrValue;
      }
    }
    return { variant: v, attributes };
  });
}


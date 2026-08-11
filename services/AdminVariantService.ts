/**
 * AdminVariantService.ts
 *
 * Provides specialized data-fetching for the Admin Variants page.
 * Keeps responsibility separate from the core VariantService.
 */

import { getSupabaseClient } from "@/lib/supabase/client";

export interface AdminVariantListItem {
  id: string;
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
  /** GST rate for this variant */
  gstRate: number;
  createdAt: string;
  updatedAt: string;
  product: {
    id: string;
    name: string;
  } | null;
}

export interface GetAdminVariantsParams {
  page: number;
  pageSize: number;
  searchQuery?: string;
  sortBy: "products.name" | "price" | "quantity" | "created_at";
  sortOrder: "asc" | "desc";
  productId?: string;
  status?: 'active' | 'inactive';
  stock?: 'in_stock' | 'out_of_stock' | 'low_stock';
  minPrice?: number;
  maxPrice?: number;
  fromDate?: string;
  toDate?: string;
}

export interface GetAdminVariantsResult {
  data: AdminVariantListItem[];
  total: number;
}

export async function getAdminVariantsPaginated(params: GetAdminVariantsParams): Promise<GetAdminVariantsResult> {
  const supabase = getSupabaseClient() as any;

  // We are joining the products table strictly to retrieve the product name.
  // Use products!product_id(...) to explicitly name the FK column, which
  // prevents PostgREST PGRST200 "relationship not found" errors when the
  // schema cache hasn't resolved the FK by constraint name alone.
  let query = supabase
    .from("product_variants")
    .select(`
      id,
      sku,
      variant_code,
      variant_name,
      price,
      discounted_price,
      quantity,
      is_active,
      is_primary,
      images,
      variant_signature,
      gst_rate,
      created_at,
      updated_at,
      product_id,
      products!product_id (
        id,
        name
      )
    `, { count: "exact" });

  if (params.searchQuery) {
    const q = params.searchQuery.trim();
    
    // Since Supabase JS .or() does not natively support joining foreign columns perfectly in logic trees,
    // we fetch matching product IDs first.
    const { data: matchedProducts } = await supabase
      .from("products")
      .select("id")
      .ilike("name", `%${q}%`);
      
    let orQuery = `sku.ilike.%${q}%,variant_name.ilike.%${q}%,variant_code.ilike.%${q}%`;
    if (matchedProducts && matchedProducts.length > 0) {
      const pIds = matchedProducts.map((p: any) => p.id);
      orQuery += `,product_id.in.(${pIds.join(',')})`;
    }
    
    query = query.or(orQuery);
  }

  // Apply filters
  if (params.productId) {
    query = query.eq("product_id", params.productId);
  }
  if (params.status) {
    query = query.eq("is_active", params.status === 'active');
  }
  if (params.stock) {
    if (params.stock === 'in_stock') query = query.gt("quantity", 0);
    else if (params.stock === 'out_of_stock') query = query.lte("quantity", 0);
    else if (params.stock === 'low_stock') query = query.gt("quantity", 0).lte("quantity", 10);
  }
  if (params.minPrice !== undefined) {
    query = query.gte("price", params.minPrice);
  }
  if (params.maxPrice !== undefined) {
    query = query.lte("price", params.maxPrice);
  }
  if (params.fromDate) {
    query = query.gte("created_at", params.fromDate);
  }
  if (params.toDate) {
    // Add 1 day or use 23:59:59 to include the entire toDate
    query = query.lte("created_at", `${params.toDate}T23:59:59.999Z`);
  }

  // Sorting
  if (params.sortBy === "products.name") {
    query = query.order("name", { referencedTable: "products", ascending: params.sortOrder === "asc" });
  } else {
    query = query.order(params.sortBy, { ascending: params.sortOrder === "asc" });
  }
  // Stable pagination tie-breaker
  query = query.order("id", { ascending: true });

  // Pagination
  const from = (params.page - 1) * params.pageSize;
  const to = from + params.pageSize - 1;
  query = query.range(from, to);

  const { data, count, error } = await query;

  if (error) {
    // Log specific fields so the error is diagnosable — the raw error object
    // serializes as {} in console.error because PostgREST error properties
    // are non-enumerable or the object is not a plain Error.
    console.error(
      "[AdminVariantService] getAdminVariantsPaginated error:",
      `code=${error.code} | message=${error.message} | details=${error.details} | hint=${error.hint}`
    );
    // Throw so the caller (page.tsx try/catch) can surface it correctly.
    // Do NOT silently return [] — an empty list is indistinguishable from
    // "no variants exist" which hides the real database failure.
    throw new Error(
      `[AdminVariantService] Failed to fetch variants: ${error.message || error.code || "unknown error"}`
    );
  }

  const items: AdminVariantListItem[] = (data || []).map((row: any) => ({
    id: row.id,
    sku: row.sku,
    variantCode: row.variant_code || "",
    variantName: row.variant_name || "",
    price: Number(row.price),
    discountedPrice: row.discounted_price != null ? Number(row.discounted_price) : null,
    quantity: Number(row.quantity),
    isActive: Boolean(row.is_active),
    isPrimary: Boolean(row.is_primary),
    images: Array.isArray(row.images) ? row.images : [],
    variantSignature: row.variant_signature || "",
    gstRate: Number(row.gst_rate ?? 5),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    product: row.products ? { id: row.products.id, name: row.products.name } : null
  }));

  return {
    data: items,
    total: count || 0,
  };
}


export async function getProductsWithAttributes(): Promise<{ id: string; name: string }[]> {
  const supabase = getSupabaseClient() as any;
  const { data, error } = await supabase
    .from("product_selected_attribute_values")
    .select(`
      product_id,
      products (
        id,
        name
      )
    `);

  if (error) {
    console.error("[AdminVariantService] getProductsWithAttributes error:", error);
    throw new Error(error.message || "Failed to load products with attributes");
  }

  const map = new Map<string, { id: string; name: string }>();
  data.forEach((row: any) => {
    if (row.products && row.products.id) {
      map.set(row.products.id, row.products);
    }
  });
  
  return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * ProductFilterService.ts
 *
 * Orchestrates server-side (database-level) filtering for the product catalog.
 * Translates URL-based search parameters into a structured JSON payload and
 * delegates the dynamic intersection to PostgreSQL RPCs.
 *
 * V1 API  (filter_products):   Used by category pages (/men, /women, /kids).
 * V2 API  (filter_products_v2): Used by the Search page. Returns products,
 *                               facets, totalCount, hasNextPage, and
 *                               executionTimeMs in a single DB call.
 *
 * Design notes:
 *   - All filtering, sorting, and pagination happen in the DB (1 query each).
 *   - Products with Qty=0 variants remain visible; inactive products excluded.
 *   - Safe to call from Client Components (uses the anon Supabase client).
 */

import { getSupabaseClient } from "@/lib/supabase/client";

// ─── V1 Types ─────────────────────────────────────────────────────────────────

export interface FilterParams {
  category?: string;
  subcategoryName?: string;
  filters?: Record<string, string[]>;
  priceMax?: number;
  sort?: string;
  limit?: number;
  offset?: number;
}

/** Shape returned to UI — matches the ProductType used in CollectionTemplate. */
export interface FilteredProduct {
  id: string;
  name: string;
  price: number;
  imageSrc: string;
  discountPercent?: number;
  rating?: number;
  reviewCount?: number;
  category: string;
  brand?: string;
  color?: string;
  size?: string[];
  description?: string;
}

// ─── V2 Types ─────────────────────────────────────────────────────────────────

/**
 * Extended filter params for V2 (adds full-text search query).
 * All V1 params are inherited unchanged.
 */
export interface FilterParamsV2 extends FilterParams {
  /** Full-text search query passed to PostgreSQL tsvector, e.g. "slim fit jeans" */
  searchQuery?: string;
}

/**
 * Composite result returned by filter_products_v2 in a single DB call.
 */
export interface FilteredProductsV2Result {
  products: FilteredProduct[];
  /** Keyed by attribute name: { "Color": ["Blue","Black"], "Brand": ["Levi's"] } */
  facets: Record<string, string[]>;
  /** Total count of matching products across all pages (used for accurate pagination). */
  totalCount: number;
  /** True when (offset + limit) < totalCount. */
  hasNextPage: boolean;
  /** PostgreSQL-measured wall-clock execution time in milliseconds. */
  executionTimeMs: number;
}

// ─── V3 Types (Navigation-node-based) ────────────────────────────────────────

/**
 * Filter params for the new navigation-node-scoped filter RPC.
 * Products are scoped by nav_node_id instead of category TEXT.
 */
export interface FilterParamsByNode {
  navNodeId: string;
  filters?: Record<string, string[]>;
  priceMax?: number;
  sort?: string;
  limit?: number;
  offset?: number;
}

/**
 * Result returned by filter_products_by_node RPC.
 */
export interface FilteredProductsByNodeResult {
  products: FilteredProduct[];
  totalCount: number;
  hasNextPage: boolean;
}

// ─── V4 Types (Global Search) ────────────────────────────────────────────────

export interface FilterParamsGlobalSearch {
  searchQuery: string;
  filters?: Record<string, string[]>;
  priceMax?: number;
  sort?: string;
  limit?: number;
  offset?: number;
}

export interface FilteredProductsGlobalSearchResult {
  products: FilteredProduct[];
  facets: any;
  metadata: any;
  totalCount: number;
  hasNextPage: boolean;
}

// ─── Row Mapper ───────────────────────────────────────────────────────────────

/**
 * Maps a raw DB row (snake_case fields) to the FilteredProduct shape
 * (camelCase), so the UI does not need to change field access patterns.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapRow(row: Record<string, any>): FilteredProduct {
  const images: string[] = Array.isArray(row.images) ? row.images : [];
  const imageSrc: string =
    row.image_src || row.imageSrc || images[0] || "";

  return {
    id: row.id,
    name: row.name,
    price: Number(row.price),
    imageSrc,
    discountPercent: row.discount_percent ?? row.discountPercent,
    rating: row.rating ?? 4.5,
    reviewCount: row.review_count ?? row.reviewCount ?? 0,
    category: row.category,
    brand: row.brand,
    color: Array.isArray(row.color) ? row.color[0] : row.color,
    size: Array.isArray(row.size) ? row.size : undefined,
    description: row.description,
  };
}

// ─── V1 Public API ────────────────────────────────────────────────────────────

/**
 * Validates and sanitizes raw URL search parameters into a clean dictionary
 * of attribute filters, excluding internal routing keys.
 *
 * /men?Color=Blue&Fit=Slim  →  { Color: ['Blue'], Fit: ['Slim'] }
 * /men?Color=Blue&Color=Black  →  { Color: ['Blue', 'Black'] }
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function validateFilters(rawFilters: Record<string, any>): Record<string, string[]> {
  const RESERVED = new Set(['category', 'q', 'sort', 'page', 'priceMax']);
  const cleanFilters: Record<string, string[]> = {};

  for (const [key, val] of Object.entries(rawFilters)) {
    if (RESERVED.has(key)) continue;

    let arr: string[];
    if (Array.isArray(val)) {
      arr = val.map(String);
    } else if (typeof val === 'string') {
      arr = val.split(',').map(s => s.trim()).filter(Boolean);
    } else if (val !== null && val !== undefined) {
      arr = [String(val)];
    } else {
      continue;
    }

    if (arr.length > 0) {
      cleanFilters[key] = arr;
    }
  }

  return cleanFilters;
}

/**
 * Builds the argument object required by the `filter_products` V1 RPC.
 */
export function buildFilterQuery(params: FilterParams) {
  return {
    p_category:  params.category  || 'All',
    p_filters:   params.filters   || {},
    p_price_max: params.priceMax  !== undefined ? params.priceMax : null,
    p_sort:      params.sort      || 'newest',
    p_limit:     params.limit     || 20,
    p_offset:    params.offset    || 0,
    p_subcategory_name: params.subcategoryName || null,
  };
}

/**
 * Calls the `filter_products` V1 RPC and returns a normalized list of products.
 * Exactly 1 DB call. Used by category pages (CollectionTemplate).
 */
export async function getFilteredProducts(
  params: FilterParams
): Promise<FilteredProduct[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = getSupabaseClient() as any;
  const args = buildFilterQuery(params);

  const { data, error } = await supabase.rpc('filter_products', args);

  if (error) {
    console.error(
      "[ProductFilterService] getFilteredProducts error:",
      error.message, error.code
    );
    throw error;
  }

  const rows: Record<string, unknown>[] = Array.isArray(data) ? data : [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return rows.map(r => mapRow(r as Record<string, any>));
}

// ─── V2 Public API ────────────────────────────────────────────────────────────

/**
 * Builds the argument object required by the `filter_products_v2` RPC.
 * Extends V1 with the p_search parameter for full-text search.
 */
export function buildFilterQueryV2(params: FilterParamsV2) {
  return {
    p_search:    (params.searchQuery && params.searchQuery.trim() !== '')
                   ? params.searchQuery.trim()
                   : null,
    p_category:  params.category   || 'All',
    p_filters:   params.filters    || {},
    p_price_max: params.priceMax   !== undefined ? params.priceMax : null,
    p_sort:      params.sort       || 'newest',
    p_limit:     params.limit      || 20,
    p_offset:    params.offset     || 0,
    p_subcategory_name: params.subcategoryName || null,
  };
}

/**
 * Calls the `filter_products_v2` RPC.
 *
 * Returns the full composite result in a SINGLE DB call:
 *   { products, facets, totalCount, hasNextPage, executionTimeMs }
 *
 * - products        — normalized FilteredProduct[] for the current page only.
 * - facets          — dynamic attribute values from ALL matched products.
 * - totalCount      — total matches across all pages (for pagination).
 * - hasNextPage     — true when offset + limit < totalCount.
 * - executionTimeMs — PostgreSQL-measured wall time.
 *
 * Used exclusively by the Search page. Category pages continue using
 * getFilteredProducts() (V1) which is entirely unchanged.
 */
export async function getFilteredProductsV2(
  params: FilterParamsV2
): Promise<FilteredProductsV2Result> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = getSupabaseClient() as any;
  const args = buildFilterQueryV2(params);

  const { data, error } = await supabase.rpc('filter_products_v2', args);

  if (error) {
    console.error(
      "[ProductFilterService] getFilteredProductsV2 error:",
      error.message, error.code
    );
    throw error;
  }

  // V2 RPC returns a single JSONB object, not an array.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const payload = (data ?? {}) as Record<string, any>;

  const rawProducts: Record<string, unknown>[] = Array.isArray(payload.products)
    ? payload.products
    : [];

  return {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    products:        rawProducts.map(r => mapRow(r as Record<string, any>)),
    facets:          (payload.facets as Record<string, string[]>) ?? {},
    totalCount:      Number(payload.totalCount   ?? 0),
    hasNextPage:     Boolean(payload.hasNextPage  ?? false),
    executionTimeMs: Number(payload.executionTimeMs ?? 0),
  };
}

// ─── V3 Public API (Navigation-node-based) ────────────────────────────────────

/**
 * Calls the `filter_products_by_node` RPC.
 *
 * Products are scoped to a single navigation node (leaf node UUID).
 * Returns paginated products + totalCount + hasNextPage in one DB call.
 *
 * Used exclusively by NodeCollectionTemplate (catch-all route pages).
 * Category pages continue using V1. Search page continues using V2.
 */
export async function getFilteredProductsByNode(
  params: FilterParamsByNode
): Promise<FilteredProductsByNodeResult> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = getSupabaseClient() as any;

  const args = {
    p_nav_node_id: params.navNodeId,
    p_filters:     params.filters    ?? {},
    p_price_max:   params.priceMax   !== undefined ? params.priceMax : null,
    p_sort:        params.sort        || 'newest',
    p_limit:       params.limit       || 20,
    p_offset:      params.offset      || 0,
  };

  const { data, error } = await supabase.rpc('filter_products_by_node', args);

  if (error) {
    console.error(
      '[ProductFilterService] getFilteredProductsByNode error:',
      error.message, error.code
    );
    throw error;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const payload = (data ?? {}) as Record<string, any>;
  const rawProducts: Record<string, unknown>[] = Array.isArray(payload.products)
    ? payload.products
    : [];

  return {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    products:    rawProducts.map(r => mapRow(r as Record<string, any>)),
    totalCount:  Number(payload.totalCount  ?? 0),
    hasNextPage: Boolean(payload.hasNextPage ?? false),
  };
}

// ─── V4 Public API (Global Search) ──────────────────────────────────────────

/**
 * Calls the `global_product_search` RPC.
 * Used exclusively by the Phase 17 Search Results page.
 */
export async function getGlobalSearchResults(
  params: FilterParamsGlobalSearch
): Promise<FilteredProductsGlobalSearchResult> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = getSupabaseClient() as any;

  const args = {
    p_query:       params.searchQuery,
    p_filters:     params.filters    ?? {},
    p_price_max:   params.priceMax   !== undefined ? params.priceMax : null,
    p_sort:        params.sort        || 'relevance',
    p_limit:       params.limit       || 20,
    p_offset:      params.offset      || 0,
  };

  const { data, error } = await supabase.rpc('global_product_search', args);

  if (error) {
    console.error(
      '[ProductFilterService] getGlobalSearchResults error:',
      error.message, error.code
    );
    throw error;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const payload = (data ?? {}) as Record<string, any>;
  const rawProducts: Record<string, unknown>[] = Array.isArray(payload.products)
    ? payload.products
    : [];

  return {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    products:    rawProducts.map(r => mapRow(r as Record<string, any>)),
    facets:      payload.facets ?? {},
    metadata:    payload.metadata ?? {},
    totalCount:  Number(payload.totalCount  ?? 0),
    hasNextPage: Boolean(payload.hasNextPage ?? false),
  };
}


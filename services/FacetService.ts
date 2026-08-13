/**
 * FacetService.ts
 *
 * Centralized Dynamic Facets API for the Cloud Certitude storefront.
 *
 * Generates filter facets by intersecting:
 *   (Attribute Groups linked to Category/Subcategory)
 *   INTERSECT (Active Products)
 *   INTERSECT (Active In-Stock Variants)
 *
 * Architecture:
 *   Client → FacetService → PostgreSQL RPC (single aggregation query)
 *
 * Performance:
 *   - Max 1 DB call per facet request (everything aggregated in-DB).
 *   - Results cached in-memory for 5 minutes per cache key.
 *   - Inactive products and zero-stock variants are excluded at the DB level.
 *
 * DO NOT import this service in:
 *   - Cart
 *   - Checkout
 *   - Orders
 *   - Inventory
 *
 * It is exclusively used by storefront collection and search pages.
 */

import { getSupabaseClient } from "@/lib/supabase/client";

// ─── Types ────────────────────────────────────────────────────────────────────

/**
 * A single facet group (e.g. "Color") with its available values.
 * Values are strings that appear on at least one active, in-stock variant.
 */
export interface FacetGroup {
  /** Attribute name, e.g. "Color", "Fit", "Waist" */
  attributeName: string;
  /** Distinct values that appear on visible products/variants */
  values: string[];
}

/**
 * The full facet result returned by all getFacets methods.
 * Keyed by attribute name for O(1) lookup in filter components.
 *
 * Example:
 * {
 *   "Color": ["Black", "Blue"],
 *   "Fit":   ["Regular", "Slim"],
 *   "Waist": ["30", "32", "34"]
 * }
 */
export type FacetResult = Record<string, string[]>;

/**
 * A facet in the legacy array format used by DynamicFilterSidebar.
 * FacetService.toFacetArray() converts FacetResult → Facet[].
 */
export interface Facet {
  attributeName: string;
  type: "multi-select" | "single-select" | "range" | "brand";
  values: Array<{ id: string; label: string; count: number }>;
}

// ─── Node Facet Types (Flipkart-style rich facets) ────────────────────────────

/**
 * A single filter value with optional hex color (for color swatches)
 * and a real product count derived from the DB.
 */
export interface NodeFacetValue {
  value: string;
  hexColor: string | null;
  count: number;
}

/**
 * A single filter group returned by get_node_facets RPC.
 * Carries full display metadata stored in attribute_groups.
 */
export interface NodeFacetGroup {
  attributeName: string;
  displayType: "multi-select" | "single-select" | "color-swatch" | "price-range" | "rating" | "toggle";
  sortOrder: number;
  allowSearch: boolean;
  maxVisible: number;
  isCollapsedDefault: boolean;
  values: NodeFacetValue[];
}

/** Full facet result from get_node_facets — keyed by attribute name. */
export type NodeFacetResult = Record<string, Omit<NodeFacetGroup, "attributeName">>;

// ─── In-Memory Cache ─────────────────────────────────────────────────────────

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

interface CacheEntry {
  data: FacetResult;
  expiresAt: number;
}

const _cache = new Map<string, CacheEntry>();

function getCached(key: string): FacetResult | null {
  const entry = _cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    _cache.delete(key);
    return null;
  }
  return entry.data;
}

function setCache(key: string, data: FacetResult): void {
  _cache.set(key, { data, expiresAt: Date.now() + CACHE_TTL_MS });
}

/** Invalidate all cached facets. Call after product/variant changes in admin. */
export function invalidateFacetCache(): void {
  _cache.clear();
}

// ─── Internal RPC Helper ─────────────────────────────────────────────────────

/**
 * Calls a Supabase RPC that returns a JSONB object.
 * The RPC is expected to return { data: FacetResult }.
 */
async function callFacetRpc(
  rpcName: string,
  params: Record<string, unknown>
): Promise<FacetResult> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.rpc(rpcName as any, params);

  if (error) {
    console.error(`[FacetService] ${rpcName} error:`, error.message, error.code);
    throw new Error(`Failed to load facets: ${error.message}`);
  }

  // RPC returns JSONB — Supabase deserialises it to a plain JS object.
  // If no products match, the RPC returns null → normalise to {}.
  return (data as unknown as FacetResult) ?? {};
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Returns facets for a top-level category page (e.g. /men, /women).
 *
 * Facets reflect all attribute values that appear on at least one
 * active, in-stock product whose category matches p_category.
 *
 * Pass "All" to get facets for the full catalogue.
 *
 * @param categoryId  e.g. "Men" | "Women" | "Kids" | "All"
 */
export async function getCategoryFacets(categoryId: string): Promise<FacetResult> {
  const cacheKey = `category:${categoryId}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const result = await callFacetRpc("get_category_facets", { p_category: categoryId });
  setCache(cacheKey, result);
  return result;
}

/**
 * Returns facets scoped to a specific set of product IDs.
 *
 * Used by the search results page to generate contextual filters
 * only for the products returned by the text search.
 *
 * Example: searching "Jeans" returns 12 products → call
 * getSearchFacets(productIds) to get Color/Fit/Waist only.
 *
 * @param productIds  Array of product UUIDs from search results
 */
export async function getSearchFacets(productIds: string[]): Promise<FacetResult> {
  if (!productIds || productIds.length === 0) return {};

  // Sort IDs to produce a stable cache key regardless of result order
  const cacheKey = `search:${[...productIds].sort().join(",")}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const result = await callFacetRpc("get_search_facets", {
    p_product_ids: productIds,
  });
  setCache(cacheKey, result);
  return result;
}

/**
 * Returns all visible attribute values from the catalogue.
 * Used by the admin to populate attribute pickers and dropdowns.
 * Does NOT filter by product visibility.
 */
export async function getVisibleFacetValues(): Promise<
  Array<{ id: string; attributeName: string; value: string }>
> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("attribute_values")
    .select("id, value, attributes(name)")
    .order("value", { ascending: true });

  if (error) {
    console.error("[FacetService] getVisibleFacetValues error:", error.message);
    throw new Error("Failed to load attribute values.");
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data ?? []).map((row: any) => ({
    id: row.id,
    attributeName: row.attributes?.name ?? "Unknown",
    value: row.value,
  }));
}

// ─── Format Helpers ───────────────────────────────────────────────────────────

/**
 * Converts FacetResult (Record<string, string[]>) → Facet[]
 * for use with the existing DynamicFilterSidebar component.
 *
 * Assigns filter type heuristically:
 *   - "Brand"       → type: "brand"
 *   - numeric-only  → type: "range"
 *   - everything    → type: "multi-select"
 */
export function toFacetArray(result: FacetResult): Facet[] {
  return Object.entries(result).map(([attributeName, values]) => {
    const isNumeric = values.every((v) => /^\d+(\.\d+)?$/.test(v));
    const isBrand = attributeName.toLowerCase() === "brand";

    const type: Facet["type"] = isBrand
      ? "brand"
      : isNumeric
      ? "range"
      : "multi-select";

    return {
      attributeName,
      type,
      values: values.map((label, i) => ({
        id: `${attributeName}-${i}`,
        label,
        count: 0, // Count not needed for storefront display
      })),
    };
  });
}

// ─── Node Facets (Flipkart-style) ─────────────────────────────────────────────

/**
 * Returns rich facets for a navigation node page.
 *
 * Uses the get_node_facets RPC which returns display metadata
 * (display_type, hex_color, sort_order, counts) alongside values.
 *
 * Cached in-memory for 5 minutes per node.
 *
 * @param navNodeId  UUID of the navigation node
 */
export async function getNodeFacets(navNodeId: string): Promise<NodeFacetGroup[]> {
  const cacheKey = `node:${navNodeId}`;
  const cached = getCached(cacheKey);

  // Convert cached FacetResult (legacy shape) to NodeFacetGroup[] if present
  // We store node facets under the same cache map using a different key prefix
  // so they won't collide with legacy category/subcategory keys.
  // The cache here stores the raw RPC result as-is; we parse below.

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = getSupabaseClient() as any;
  const { data, error } = await supabase.rpc("get_node_facets", {
    p_nav_node_id: navNodeId,
  });

  if (error) {
    console.error("[FacetService] get_node_facets error:", error.message);
    return [];
  }

  const rawResult = (data ?? {}) as { metadata?: { product_count: number; has_children: boolean }; facets?: NodeFacetResult };
  const rawFacets = rawResult.facets ?? {};
  
  const groups: NodeFacetGroup[] = Object.entries(rawFacets).map(([attributeName, meta]) => {
    let values = (meta.values ?? []).map((v: NodeFacetValue) => ({
      value: v.value,
      hexColor: v.hexColor ?? null,
      count: v.count ?? 0,
    }));
    
    // Deduplicate values by display label to prevent duplicate React keys
    // This happens when multiple underlying entities (e.g. Navigation Nodes) share the same name
    const uniqueValues = new Map<string, any>();
    for (const v of values) {
      if (uniqueValues.has(v.value)) {
        uniqueValues.get(v.value).count += v.count;
      } else {
        uniqueValues.set(v.value, { ...v });
      }
    }
    values = Array.from(uniqueValues.values());

    return {
      attributeName,
      displayType: meta.displayType ?? "multi-select",
      sortOrder: meta.sortOrder ?? 0,
      allowSearch: meta.allowSearch ?? false,
      maxVisible: meta.maxVisible ?? 6,
      isCollapsedDefault: meta.isCollapsedDefault ?? false,
      values,
    };
  });

  // Sort by sortOrder ascending
  groups.sort((a, b) => a.sortOrder - b.sortOrder);

  // Store a simple representation in legacy cache to avoid redundant calls
  const legacyShape: FacetResult = {};
  for (const g of groups) {
    legacyShape[g.attributeName] = g.values.map((v) => v.value);
  }
  setCache(cacheKey, legacyShape);

  return groups;
}

/**
 * Converts NodeFacetGroup[] to the legacy Facet[] shape
 * for backward compatibility with components not yet upgraded.
 */
export function toNodeFacetArray(groups: NodeFacetGroup[]): Facet[] {
  return groups.map((g) => ({
    attributeName: g.attributeName,
    type: g.displayType === "color-swatch"
      ? "multi-select"
      : g.displayType === "price-range"
      ? "range"
      : g.attributeName.toLowerCase() === "brand"
      ? "brand"
      : "multi-select",
    values: g.values.map((v, i) => ({
      id: `${g.attributeName}-${i}`,
      label: v.value,
      count: v.count,
    })),
  }));
}

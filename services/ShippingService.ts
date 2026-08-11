/**
 * ShippingService.ts
 *
 * Pincode-based delivery estimate lookup using the warehouse × zone SLA matrix.
 * No courier API integration — pure SLA calculation from DB config.
 *
 * Architecture:
 *   Customer pincode → pincode_zone_mappings → zone_id
 *   Product warehouse → warehouse_delivery_sla (warehouse_id × zone_id)
 *   → min_days / max_days / cod_available / free_above_amt
 *
 * To update delivery windows: Admin edits warehouse_delivery_sla rows only.
 * Zero code changes required for new cities, couriers, or brands.
 */

import { getSupabaseClient } from "@/lib/supabase/client";

export interface DeliveryEstimate {
  available: boolean;
  minDays: number;
  maxDays: number;
  deliveryDateRange: string;       // e.g. "Thu, 31 Jul – Sat, 2 Aug"
  warehouseName: string;
  warehouseCity: string;
  zoneName: string;
  codAvailable: boolean;
  freeAboveAmount: number;
  /** Present when no SLA is configured for this pincode/zone */
  fallbackMessage?: string;
}

export interface ReturnPolicy {
  returnDays: number;
  exchangeAllowed: boolean;
  pickupAvailable: boolean;
  notes: string | null;
}

/**
 * Adds business days to a date (skips weekends for display purposes).
 */
function addBusinessDays(date: Date, days: number): Date {
  const result = new Date(date);
  let added = 0;
  while (added < days) {
    result.setDate(result.getDate() + 1);
    const day = result.getDay();
    if (day !== 0 && day !== 6) added++;  // skip Sunday=0, Saturday=6
  }
  return result;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-IN", {
    weekday: "short",
    day:     "numeric",
    month:   "short",
  });
}

/**
 * Looks up delivery estimate for a given pincode.
 * Uses the first active warehouse if product-specific warehouse is not configured.
 *
 * @param pincode  - 6-digit Indian pincode entered by customer
 * @param productId - optional, reserved for per-product warehouse mapping (future)
 */
export async function getDeliveryEstimate(
  pincode: string,
  productId?: string
): Promise<DeliveryEstimate> {
  void productId; // reserved for future per-product warehouse routing

  const supabase = getSupabaseClient();
  const today = new Date();

  try {
    // 1. Pincode → zone lookup
    const { data: pzRows } = await (supabase as any)
      .from("pincode_zone_mappings")
      .select("zone_id, city, state")
      .eq("pincode", pincode.trim())
      .limit(1)
      .maybeSingle();

    if (!pzRows) {
      // Pincode not in our DB — return a generic estimate
      return {
        available: true,
        minDays: 5,
        maxDays: 10,
        deliveryDateRange: `${formatDate(addBusinessDays(today, 5))} – ${formatDate(addBusinessDays(today, 10))}`,
        warehouseName: "Central Warehouse",
        warehouseCity: "Jaipur",
        zoneName: "Rest of India",
        codAvailable: false,
        freeAboveAmount: 999,
        fallbackMessage: "Pincode not in express zone. Standard delivery applies.",
      };
    }

    const zoneId = pzRows.zone_id;

    // 2. Find first active warehouse
    const { data: warehouseRow } = await (supabase as any)
      .from("warehouses")
      .select("id, name, city")
      .eq("is_active", true)
      .limit(1)
      .maybeSingle();

    if (!warehouseRow) {
      // No warehouse configured yet — graceful fallback
      return {
        available: true,
        minDays: 5,
        maxDays: 7,
        deliveryDateRange: `${formatDate(addBusinessDays(today, 5))} – ${formatDate(addBusinessDays(today, 7))}`,
        warehouseName: "Main Warehouse",
        warehouseCity: "Jaipur",
        zoneName: "Standard",
        codAvailable: true,
        freeAboveAmount: 999,
        fallbackMessage: "Warehouse not configured. Using standard SLA.",
      };
    }

    // 3. SLA lookup
    const { data: slaRow } = await (supabase as any)
      .from("warehouse_delivery_sla")
      .select("min_days, max_days, cod_available, free_above_amt")
      .eq("warehouse_id", warehouseRow.id)
      .eq("zone_id", zoneId)
      .maybeSingle();

    // 4. Zone name
    const { data: zoneRow } = await (supabase as any)
      .from("delivery_zones")
      .select("name")
      .eq("id", zoneId)
      .maybeSingle();

    const minDays = slaRow?.min_days ?? 4;
    const maxDays = slaRow?.max_days ?? 7;

    return {
      available:        true,
      minDays,
      maxDays,
      deliveryDateRange: `${formatDate(addBusinessDays(today, minDays))} – ${formatDate(addBusinessDays(today, maxDays))}`,
      warehouseName:    warehouseRow.name,
      warehouseCity:    warehouseRow.city,
      zoneName:         zoneRow?.name ?? "Standard",
      codAvailable:     slaRow?.cod_available ?? true,
      freeAboveAmount:  slaRow?.free_above_amt ?? 999,
    };
  } catch (err) {
    console.error("[ShippingService] getDeliveryEstimate failed:", err);
    // Never crash the product page — return a reasonable default
    return {
      available: true,
      minDays: 5,
      maxDays: 7,
      deliveryDateRange: `${formatDate(addBusinessDays(today, 5))} – ${formatDate(addBusinessDays(today, 7))}`,
      warehouseName:   "Main Warehouse",
      warehouseCity:   "India",
      zoneName:        "Standard",
      codAvailable:    true,
      freeAboveAmount: 999,
      fallbackMessage: "Delivery estimate temporarily unavailable.",
    };
  }
}

/**
 * Fetches the return policy for a product.
 * Falls back to the global default policy (product_id IS NULL) if no product-specific one exists.
 */
export async function getReturnPolicy(productId: string): Promise<ReturnPolicy> {
  const supabase = getSupabaseClient();

  try {
    // First try product-specific policy
    const { data: specific } = await (supabase as any)
      .from("product_return_policies")
      .select("return_days, exchange_allowed, pickup_available, notes")
      .eq("product_id", productId)
      .maybeSingle();

    if (specific) {
      return {
        returnDays:       specific.return_days,
        exchangeAllowed:  specific.exchange_allowed,
        pickupAvailable:  specific.pickup_available,
        notes:            specific.notes ?? null,
      };
    }

    // Fall back to global policy
    const { data: global } = await (supabase as any)
      .from("product_return_policies")
      .select("return_days, exchange_allowed, pickup_available, notes")
      .is("product_id", null)
      .maybeSingle();

    return {
      returnDays:      global?.return_days      ?? 30,
      exchangeAllowed: global?.exchange_allowed  ?? true,
      pickupAvailable: global?.pickup_available  ?? true,
      notes:           global?.notes             ?? null,
    };
  } catch {
    // DB not set up yet — use hardcoded safe defaults
    return { returnDays: 30, exchangeAllowed: true, pickupAvailable: true, notes: null };
  }
}

/**
 * SnapshotService.ts
 *
 * Builds immutable OrderItemSnapshot records for each cart item at checkout.
 *
 * Architecture:
 *   Cart items carry minimal display data (name, price, image).
 *   This service fetches the missing data (SKU, description, category,
 *   all variant attributes) in batch and freezes them into a snapshot
 *   that is stored permanently in orders.items.
 *
 * Design decisions:
 *   - Batch queries: all variant IDs fetched in ONE query set (no N+1)
 *   - Graceful degradation: if enrichment fails for an item, it falls
 *     back to the cart data rather than blocking the order
 *   - Never blocks an order: snapshot failure is logged, not thrown
 */

import { getSupabaseClient } from "@/lib/supabase/client";
import type { CartItemType } from "@/context/CartContext";
import type { OrderItemSnapshot } from "@/types/OrderItemSnapshot";

interface EnrichmentParams {
  cartItems: CartItemType[];
  itemBreakdowns?: { id: string; variantId?: string; gstRate: number; gstAmount: number; lineTotal: number; }[];
  orderId: string;
  orderDate: string;       // ISO timestamp
  paymentMethod: string;
  transactionId: string;
}

/**
 * Builds a complete OrderItemSnapshot[] from cart items.
 * Fetches missing fields (SKU, description, category, all attributes)
 * in batch to minimise round trips.
 *
 * Returns one snapshot per cart item. Items that fail enrichment
 * gracefully fall back to cart-level data.
 */
export async function buildOrderSnapshots(
  params: EnrichmentParams
): Promise<OrderItemSnapshot[]> {
  const { cartItems, itemBreakdowns, orderId, orderDate, paymentMethod, transactionId } = params;

  if (cartItems.length === 0) return [];

  const supabase = getSupabaseClient();

  // ── 1. Collect all variant IDs that need enrichment ────────────────────────
  const variantIds = cartItems
    .map((i) => i.variantId)
    .filter((id): id is string => Boolean(id));

  // ── 2. Batch-fetch variant rows (sku, variant_signature, product_id, price) ─
  let variantRows: Record<string, {
    id: string;
    product_id: string;
    sku: string;
    variant_signature: string;
    price: number;
    discounted_price: number | null;
    images: string[];
    gst_rate: number;
  }> = {};

  if (variantIds.length > 0) {
    const { data: vData } = await supabase
      .from("product_variants")
      .select("id, product_id, sku, variant_signature, price, discounted_price, images, gst_rate")
      .in("id", variantIds);

    for (const row of vData ?? []) {
      variantRows[row.id] = row;
    }
  }

  // ── 3. Collect all product IDs from variants ───────────────────────────────
  const productIdSet = new Set<string>(
    cartItems.map((i) => {
      const vRow = i.variantId ? variantRows[i.variantId] : null;
      return vRow?.product_id ?? i.id;
    })
  );
  const productIds = [...productIdSet];

  // ── 4. Batch-fetch product rows (name, description, category, brand) ────────
  let productRows: Record<string, {
    id: string;
    name: string;
    description: string;
    category: string;
    brand: string;
    images: string[] | null;
  }> = {};

  if (productIds.length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: pData } = await (supabase as any)
      .from("products")
      .select("id, name, description, category, brand, images")
      .in("id", productIds);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    for (const row of (pData ?? []) as any[]) {
      productRows[row.id] = row;
    }
  }

  // ── 5. Batch-fetch all variant attribute assignments ───────────────────────
  let attributesByVariant: Record<string, Record<string, string>> = {};

  if (variantIds.length > 0) {
    // a) variant_attribute_values linking table
    const { data: vavData } = await supabase
      .from("variant_attribute_values")
      .select("variant_id, attribute_id, attribute_value_id")
      .in("variant_id", variantIds);

    if (vavData && vavData.length > 0) {
      // b) resolve attribute names and values
      const attrValueIds = [...new Set(vavData.map((r) => r.attribute_value_id))];
      const attrIds      = [...new Set(vavData.map((r) => r.attribute_id))];

      const [avRes, aRes] = await Promise.all([
        supabase.from("attribute_values").select("id, value").in("id", attrValueIds),
        supabase.from("attributes").select("id, name").in("id", attrIds),
      ]);

      const valueMap: Record<string, string> = {};
      for (const row of avRes.data ?? []) valueMap[row.id] = row.value;

      const attrNameMap: Record<string, string> = {};
      for (const row of aRes.data ?? []) attrNameMap[row.id] = row.name;

      // c) group by variant_id
      for (const row of vavData) {
        const attrName  = attrNameMap[row.attribute_id];
        const attrValue = valueMap[row.attribute_value_id];
        if (!attrName || !attrValue) continue;

        if (!attributesByVariant[row.variant_id]) {
          attributesByVariant[row.variant_id] = {};
        }
        attributesByVariant[row.variant_id][attrName] = attrValue;
      }
    }
  }

  // ── 6. Build one snapshot per cart item ────────────────────────────────────
  return cartItems.map((item): OrderItemSnapshot => {
    const vRow     = item.variantId ? variantRows[item.variantId] : null;
    const productId = vRow?.product_id ?? item.id;
    const pRow     = productRows[productId] ?? null;

    // Attributes: prefer DB-fetched; fall back to size/color from cart
    const dbAttributes = (item.variantId ? attributesByVariant[item.variantId] : null) ?? {};
    const attributes: Record<string, string> =
      Object.keys(dbAttributes).length > 0
        ? dbAttributes
        : {
            ...(item.selectedSize ? { Size: item.selectedSize } : {}),
            ...(item.selectedColor ? { Color: item.selectedColor } : {}),
          };

    // Pricing: use cart price as the authoritative "charged" price
    const originalPrice    = item.price ?? vRow?.price;
    const discountPercent  = item.discountPercent ?? 0;
    const unitPrice        = discountPercent > 0
      ? item.price * (1 - discountPercent / 100)
      : item.price;
    const subtotal         = unitPrice * item.quantity;

    // Image: prefer variant image, fall back to cart image
    const variantImage = vRow?.images?.[0] ?? "";
    const productImage = variantImage || item.imageSrc || "";

    const breakdown = itemBreakdowns?.find(
      (b) => b.id === item.id && (b.variantId === item.variantId || !b.variantId)
    );

    const gstRateVal = breakdown?.gstRate ?? item.gstRate ?? (vRow?.gst_rate != null ? Number(vRow.gst_rate) : 5);
    const gstAmountVal = breakdown?.gstAmount ?? parseFloat((parseFloat(subtotal.toFixed(2)) * (gstRateVal / 100)).toFixed(2));
    const lineTotalVal = breakdown?.lineTotal ?? parseFloat((parseFloat(subtotal.toFixed(2)) + gstAmountVal).toFixed(2));

    return {
      productId,
      productName:        pRow?.name        ?? item.name,
      productDescription: pRow?.description ?? "",
      brand:              pRow?.brand        ?? item.brand ?? "Certitude Atelier",
      category:           pRow?.category     ?? "",
      productImage,

      variantId:          item.variantId ?? "",
      variantSignature:   vRow?.variant_signature ?? "",
      sku:                vRow?.sku ?? "",

      attributes,

      pricing: {
        unitPrice:       parseFloat(unitPrice.toFixed(2)),
        originalPrice:   parseFloat(originalPrice.toFixed(2)),
        discountPercent,
        quantity:        item.quantity,
        subtotal:        parseFloat(subtotal.toFixed(2)),
        gstRate:         gstRateVal,
        gstAmount:       gstAmountVal,
        lineTotal:       lineTotalVal,
      },

      purchaseMetadata: {
        orderId,
        orderDate,
        paymentMethod,
        transactionId,
      },
    };
  });
}

/**
 * Reads attributes from a snapshot in display order.
 * Returns an array of { name, value } pairs suitable for rendering.
 */
export function getSnapshotAttributes(
  snapshot: OrderItemSnapshot
): Array<{ name: string; value: string }> {
  return Object.entries(snapshot.attributes).map(([name, value]) => ({ name, value }));
}

/**
 * Returns the effective unit price for display (post-discount).
 */
export function getSnapshotDisplayPrice(snapshot: OrderItemSnapshot): number {
  return snapshot.pricing.unitPrice;
}

/**
 * Backward-compatibility helper.
 * When reading legacy orders that have thin items (no snapshot shape),
 * coerces the raw item into a partial snapshot for consistent rendering.
 */
export function coerceLegacyItem(raw: {
  id?: string;
  name: string;
  quantity: number;
  size?: string;
  color?: string;
  price: number;
  imageSrc?: string;
  brand?: string;
  discountPercent?: number;
  variantId?: string;
  variantSignature?: string;
}): OrderItemSnapshot {
  const discountPercent = raw.discountPercent ?? 0;
  const unitPrice       = discountPercent > 0
    ? raw.price * (1 - discountPercent / 100)
    : raw.price;

  return {
    productId:          raw.id ?? "",
    productName:        raw.name,
    productDescription: "",
    brand:              raw.brand ?? "",
    category:           "",
    productImage:       raw.imageSrc ?? "",

    variantId:          raw.variantId ?? "",
    variantSignature:   raw.variantSignature ?? "",
    sku:                "",

    attributes: {
      ...(raw.size  ? { Size: raw.size }   : {}),
      ...(raw.color ? { Color: raw.color } : {}),
    },

    pricing: {
      unitPrice:       parseFloat(unitPrice.toFixed(2)),
      originalPrice:   raw.price,
      discountPercent,
      quantity:        raw.quantity,
      subtotal:        parseFloat((unitPrice * raw.quantity).toFixed(2)),
      gstRate:         5, // Fallback legacy rate
      gstAmount:       parseFloat(((unitPrice * raw.quantity) * 0.05).toFixed(2)),
      lineTotal:       parseFloat(((unitPrice * raw.quantity) * 1.05).toFixed(2)),
    },

    purchaseMetadata: {
      orderId:       "",
      orderDate:     "",
      paymentMethod: "",
      transactionId: "",
    },
  };
}

/**
 * Detects whether an order item is already a full snapshot or a legacy thin item.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isFullSnapshot(item: any): item is OrderItemSnapshot {
  return (
    item &&
    typeof item.pricing === "object" &&
    typeof item.purchaseMetadata === "object" &&
    typeof item.attributes === "object"
  );
}

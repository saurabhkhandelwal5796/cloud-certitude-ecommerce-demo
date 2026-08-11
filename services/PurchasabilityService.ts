/**
 * PurchasabilityService.ts
 *
 * SINGLE SOURCE OF TRUTH for business rule enforcement.
 *
 * This service determines whether a product or variant is purchasable by
 * checking all relevant conditions from the database. It is consumed by:
 *   - Home Page / Category Pages  (display filtering)
 *   - CartContext                  (staleness detection on load)
 *   - Buy Again / Reorder          (live validation before adding to cart)
 *   - WishlistItem                 (availability badge)
 *   - Checkout Page                (pre-flight validation)
 *
 * Business Rules enforced:
 *   1. Product must be Active.
 *   2. Product must have at least one Active Variant.
 *   3. Active Variant must have Price > 0.
 *   4. Active Variant must have at least one image.
 *   5. Active Variant may have Quantity = 0 (shows Out of Stock, not hidden).
 */

import { getSupabaseClient } from "@/lib/supabase/client";

// ─── Types ────────────────────────────────────────────────────────────────────

export type PurchasabilityReason =
  | "PRODUCT_INACTIVE"
  | "NO_ACTIVE_VARIANT"
  | "PRICE_ZERO"
  | "NO_IMAGE"
  | "VARIANT_INACTIVE"
  | "VARIANT_NOT_FOUND"
  | "PRODUCT_NOT_FOUND"
  | "OUT_OF_STOCK";

export interface PurchasabilityResult {
  purchasable: boolean;
  outOfStock?: boolean;   // true when purchasable in principle but stock = 0
  reason?: PurchasabilityReason;
  availableStock?: number;
}

export interface CartValidationResult {
  variantId: string;
  result: PurchasabilityResult;
}

// ─── Core Checks ──────────────────────────────────────────────────────────────

/**
 * Checks whether a specific variant is purchasable.
 * Fetches live data from Supabase, validates every business rule.
 */
export async function isVariantPurchasable(
  variantId: string
): Promise<PurchasabilityResult> {
  try {
    const supabase = getSupabaseClient() as any;

    // 1. Fetch variant + its parent product in one join
    const { data: variant, error } = await supabase
      .from("product_variants")
      .select("id, product_id, price, quantity, is_active, images, products(status)")
      .eq("id", variantId)
      .maybeSingle();

    if (error) {
      console.error("[PurchasabilityService] isVariantPurchasable error:", error);
      return { purchasable: false, reason: "VARIANT_NOT_FOUND" };
    }

    if (!variant) {
      return { purchasable: false, reason: "VARIANT_NOT_FOUND" };
    }

    // 2. Check parent product active
    const productActive = variant.products?.status === 'active';
    if (!productActive) {
      return { purchasable: false, reason: "PRODUCT_INACTIVE" };
    }

    // 3. Check variant active
    if (!variant.is_active) {
      return { purchasable: false, reason: "VARIANT_INACTIVE" };
    }

    // 4. Check price > 0
    if (Number(variant.price) <= 0) {
      return { purchasable: false, reason: "PRICE_ZERO" };
    }

    // 5. Check at least one image
    const images = Array.isArray(variant.images) ? variant.images : [];
    if (images.length === 0) {
      return { purchasable: false, reason: "NO_IMAGE" };
    }

    // 6. Check stock — out of stock is still "purchasable" in the display sense
    const qty = Number(variant.quantity ?? 0);
    if (qty === 0) {
      return {
        purchasable: true,
        outOfStock: true,
        reason: "OUT_OF_STOCK",
        availableStock: 0,
      };
    }

    return { purchasable: true, outOfStock: false, availableStock: qty };
  } catch (err) {
    console.error("[PurchasabilityService] isVariantPurchasable exception:", err);
    return { purchasable: false, reason: "VARIANT_NOT_FOUND" };
  }
}

/**
 * Checks whether a product has at least one purchasable (active, priced, imaged) variant.
 * Used for product-level display gates (Home, Category, Search).
 */
export async function isProductPurchasable(
  productId: string
): Promise<PurchasabilityResult> {
  try {
    const supabase = getSupabaseClient() as any;

    // 1. Check product active status
    const { data: product, error: productErr } = await supabase
      .from("products")
      .select("status")
      .eq("id", productId)
      .maybeSingle();

    if (productErr || !product) {
      return { purchasable: false, reason: "PRODUCT_NOT_FOUND" };
    }

    if (product.status !== 'active') {
      return { purchasable: false, reason: "PRODUCT_INACTIVE" };
    }

    // 2. Fetch all active variants
    const { data: variants, error: variantsErr } = await supabase
      .from("product_variants")
      .select("id, price, images, quantity, is_active")
      .eq("product_id", productId)
      .eq("is_active", true);

    if (variantsErr) {
      console.error("[PurchasabilityService] isProductPurchasable variants error:", variantsErr);
      return { purchasable: false, reason: "NO_ACTIVE_VARIANT" };
    }

    const activeVariants = (variants ?? []).filter((v: any) => v.is_active);

    if (activeVariants.length === 0) {
      return { purchasable: false, reason: "NO_ACTIVE_VARIANT" };
    }

    // 3. At least one variant must be priced
    const pricedVariants = activeVariants.filter((v: any) => Number(v.price) > 0);

    if (pricedVariants.length === 0) {
      return { purchasable: false, reason: "PRICE_ZERO" };
    }

    // 4. At least one priced variant must have an image
    const qualifiedVariants = pricedVariants.filter(
      (v: any) => Array.isArray(v.images) && v.images.length > 0
    );

    if (qualifiedVariants.length === 0) {
      return { purchasable: false, reason: "NO_IMAGE" };
    }

    // 4. Stock is optional for display — product is still visible when 0 stock
    return { purchasable: true };
  } catch (err) {
    console.error("[PurchasabilityService] isProductPurchasable exception:", err);
    return { purchasable: false, reason: "PRODUCT_NOT_FOUND" };
  }
}

/**
 * Validates a batch of cart items for staleness.
 * Returns a map of variantId → PurchasabilityResult.
 * Items without a variantId are skipped (legacy items).
 */
export async function validateCartItems(
  variantIds: string[]
): Promise<Map<string, PurchasabilityResult>> {
  const resultMap = new Map<string, PurchasabilityResult>();

  if (variantIds.length === 0) return resultMap;

  try {
    const supabase = getSupabaseClient() as any;

    // Batch fetch all relevant variants + parent products
    const { data: variants, error } = await supabase
      .from("product_variants")
      .select("id, product_id, price, quantity, is_active, images, products(status)")
      .in("id", variantIds);

    if (error) {
      console.error("[PurchasabilityService] validateCartItems error:", error);
      // On error, treat all as unknown — don't block the cart
      return resultMap;
    }

    const variantDataMap = new Map<string, any>(
      (variants ?? []).map((v: any) => [String(v.id), v])
    );

    for (const vid of variantIds) {
      const variant = variantDataMap.get(vid);

      if (!variant) {
        resultMap.set(vid, { purchasable: false, reason: "VARIANT_NOT_FOUND" });
        continue;
      }

      const productActive = variant.products?.status === 'active';
      if (!productActive) {
        resultMap.set(vid, { purchasable: false, reason: "PRODUCT_INACTIVE" });
        continue;
      }

      if (!variant.is_active) {
        resultMap.set(vid, { purchasable: false, reason: "VARIANT_INACTIVE" });
        continue;
      }

      if (Number(variant.price) <= 0) {
        resultMap.set(vid, { purchasable: false, reason: "PRICE_ZERO" });
        continue;
      }

      const images = Array.isArray(variant.images) ? variant.images : [];
      if (images.length === 0) {
        resultMap.set(vid, { purchasable: false, reason: "NO_IMAGE" });
        continue;
      }

      const qty = Number(variant.quantity ?? 0);
      if (qty === 0) {
        resultMap.set(vid, {
          purchasable: true,
          outOfStock: true,
          reason: "OUT_OF_STOCK",
          availableStock: 0,
        });
        continue;
      }

      resultMap.set(vid, { purchasable: true, availableStock: qty });
    }
  } catch (err) {
    console.error("[PurchasabilityService] validateCartItems exception:", err);
  }

  return resultMap;
}

/**
 * Returns a human-readable label for a purchasability failure reason.
 */
export function getPurchasabilityLabel(reason?: PurchasabilityReason): string {
  switch (reason) {
    case "PRODUCT_INACTIVE":    return "Product no longer available";
    case "VARIANT_INACTIVE":    return "This variant has been discontinued";
    case "NO_ACTIVE_VARIANT":   return "No variants available";
    case "PRICE_ZERO":          return "Pricing not configured";
    case "NO_IMAGE":            return "Product images unavailable";
    case "VARIANT_NOT_FOUND":   return "Item no longer exists";
    case "PRODUCT_NOT_FOUND":   return "Product no longer exists";
    case "OUT_OF_STOCK":        return "Out of Stock";
    default:                    return "Not available";
  }
}

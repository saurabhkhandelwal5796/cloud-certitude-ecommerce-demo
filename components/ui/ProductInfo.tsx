"use client";

import React, { useState, useEffect, useMemo } from "react";
import { formatPrice } from "@/utils";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useRouter } from "next/navigation";
import type { VariantWithAttributes } from "@/services/VariantService";
import DeliveryChecker from "@/components/ui/DeliveryChecker";
import { getReturnPolicy, ReturnPolicy } from "@/services/ShippingService";

// ─── Props ────────────────────────────────────────────────────────────────────

interface ProductInfoProps {
  id: string;
  name: string;
  brand: string;
  price: number;                        // fallback price (from products row)
  imageSrc: string;
  discountPercent?: number;             // fallback discount (from products row)
  rating: number;
  reviewCount: number;
  sku: string;                          // fallback SKU (from products row)
  description: string;
  category?: string;
  /** All variants with their attribute key-value maps (from getVariantsWithAttributes) */
  variants: VariantWithAttributes[];
  /** Product-level attribute assignments { "Material": "Cotton", "Fit": "Slim" } */
  productAttributes: Record<string, string>;
  /** Optional variant ID passed from filtered URL to pre-select matching variant */
  initialVariantId?: string;
  /** Callback fired when the active variant changes (useful for lifting state) */
  onVariantChange?: (variant: VariantWithAttributes | null) => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Returns unique, sorted values for a given attribute key across active variants */
function uniqueAttrValues(
  variants: VariantWithAttributes[],
  key: string
): string[] {
  const seen = new Set<string>();
  for (const v of variants) {
    if (v.variant.isActive && v.attributes[key]) {
      seen.add(v.attributes[key]);
    }
  }
  return [...seen].sort();
}

/**
 * Returns all attribute keys present across any active variant,
 * preserving insertion order (Color first, then Size, then others).
 */
function allAttrKeys(variants: VariantWithAttributes[]): string[] {
  const keys: string[] = [];
  const seen = new Set<string>();
  // Prioritise Color then Size in the display order
  for (const priority of ["Color", "Size"]) {
    if (variants.some((v) => v.variant.isActive && v.attributes[priority])) {
      keys.push(priority);
      seen.add(priority);
    }
  }
  for (const v of variants) {
    if (!v.variant.isActive) continue;
    for (const k of Object.keys(v.attributes)) {
      if (!seen.has(k)) { keys.push(k); seen.add(k); }
    }
  }
  return keys;
}

/**
 * Finds the exact variant matching ALL currently selected attribute values.
 * Unselected attributes (empty string) are treated as wildcards.
 */
function resolveVariantByAttrs(
  variants: VariantWithAttributes[],
  selected: Record<string, string>
): VariantWithAttributes | null {
  return (
    variants.find(
      (v) =>
        v.variant.isActive &&
        Object.entries(selected).every(
          ([key, val]) => val === "" || v.attributes[key] === val
        )
    ) ?? null
  );
}

// ─── Inventory Badge ──────────────────────────────────────────────────────────

function InventoryBadge({ quantity }: { quantity: number }) {
  if (quantity === 0) {
    return (
      <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full bg-rose-50 text-rose-600 border border-rose-100">
        <span className="h-1.5 w-1.5 rounded-full bg-rose-500 inline-block" />
        Out of Stock
      </span>
    );
  }
  if (quantity <= 5) {
    return (
      <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full bg-amber-50 text-amber-600 border border-amber-100">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-500 inline-block animate-pulse" />
        Low Stock — {quantity} left
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block" />
      In Stock
    </span>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * ProductInfo Component
 *
 * Renders the descriptive and transactional sections of the product view.
 * Variant-aware: derives price, discount, inventory, SKU and cart payload
 * from the resolved variant rather than static hardcoded constants.
 */
export default function ProductInfo({
  id,
  name,
  brand,
  price: fallbackPrice,
  imageSrc,
  discountPercent: fallbackDiscountPercent,
  rating: initialRating,
  reviewCount: initialReviewCount,
  sku: fallbackSku,
  description,
  category,
  variants,
  productAttributes,
  initialVariantId,
  onVariantChange,
}: ProductInfoProps) {
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string>("description");
  const [returnPolicy, setReturnPolicy] = useState<ReturnPolicy | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isBuying, setIsBuying] = useState(false);

  // Dynamic reviews rating state
  const [dynamicRating, setDynamicRating] = useState(initialRating);
  const [dynamicReviewCount, setDynamicReviewCount] = useState(initialReviewCount);

  React.useEffect(() => {
    let isMounted = true;
    const loadDynamicRating = async () => {
      try {
        const { getReviewsByProductId } = await import("@/services/ReviewService");
        const [list, policy] = await Promise.all([
          getReviewsByProductId(id),
          getReturnPolicy(id)
        ]);
        
        if (!isMounted) return;
        setReturnPolicy(policy);

        if (list.length > 0) {
          const avg = list.reduce((sum, r) => sum + r.rating, 0) / list.length;
          setDynamicRating(parseFloat(avg.toFixed(1)));
          setDynamicReviewCount(list.length);
        } else {
          setDynamicRating(initialRating);
          setDynamicReviewCount(initialReviewCount);
        }
      } catch (err) {
        console.error("Failed to load dynamic ratings in ProductInfo:", err);
      }
    };
    loadDynamicRating();
    if (typeof window !== "undefined") {
      window.addEventListener("focus", loadDynamicRating);
      return () => window.removeEventListener("focus", loadDynamicRating);
    }
  }, [id, initialRating, initialReviewCount]);

  // ── Variant Selection State ──────────────────────────────────────────────────

  const hasVariants = variants.length > 0;

  // All attribute keys present across active variants (Color, Size, Fit, Rise, …)
  const attrKeys = useMemo(() => allAttrKeys(variants), [variants]);

  // Per-attribute value lists
  const attrValueMap = useMemo(() => {
    const map: Record<string, string[]> = {};
    for (const key of attrKeys) {
      map[key] = uniqueAttrValues(variants, key);
    }
    return map;
  }, [variants, attrKeys]);

  // Helper to get initial selected attributes based on primary variant
  const getInitialAttrs = () => {
    let targetVariant = null;
    if (initialVariantId) {
      targetVariant = variants.find(v => v.variant.id === initialVariantId && v.variant.isActive);
    }
    if (!targetVariant) {
      targetVariant = variants.find(v => (v.variant as any).isPrimary && v.variant.isActive);
    }
    const init: Record<string, string> = {};
    
    for (const key of attrKeys) {
      if (targetVariant && targetVariant.attributes[key]) {
        init[key] = targetVariant.attributes[key];
      } else {
        const vals = uniqueAttrValues(variants, key);
        init[key] = vals.length > 0 ? vals[0] : "";
      }
    }
    return init;
  };

  // Selected value per attribute — initialised to primary variant or first available option
  const [selectedAttrs, setSelectedAttrs] = useState<Record<string, string>>(getInitialAttrs);

  // When variants change (e.g. after navigation), re-initialise selected attrs
  useEffect(() => {
    setSelectedAttrs(getInitialAttrs());
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [variants]);

  // Active variant resolved from the full attribute selection
  const activeVariantEntry = useMemo(
    () => (hasVariants ? resolveVariantByAttrs(variants, selectedAttrs) : null),
    [variants, selectedAttrs, hasVariants]
  );

  // Convenience shorthands for backwards compatibility
  const selectedColor = selectedAttrs["Color"] ?? "";
  const selectedSize  = selectedAttrs["Size"]  ?? "";

  useEffect(() => {
    if (onVariantChange) {
      onVariantChange(activeVariantEntry);
    }
  }, [activeVariantEntry, onVariantChange]);

  const activeVariant = activeVariantEntry?.variant ?? null;

  // ── Derived Display Values ────────────────────────────────────────────────────

  const displayPrice = activeVariant?.price ?? (hasVariants ? 0 : fallbackPrice);
  const displayDiscountedPrice = activeVariant?.discountedPrice ?? null;
  const displayDiscountPercent =
    displayDiscountedPrice != null && displayPrice > 0
      ? Math.round(((displayPrice - displayDiscountedPrice) / displayPrice) * 100)
      : (hasVariants ? 0 : (fallbackDiscountPercent ?? 0));
  const finalPrice = displayDiscountedPrice ?? (
    displayDiscountPercent > 0
      ? displayPrice * (1 - displayDiscountPercent / 100)
      : displayPrice
  );
  const displaySku    = activeVariant?.sku ?? (hasVariants ? '' : fallbackSku);
  const displayStock  = activeVariant?.quantity ?? 0;
  const isOutOfStock  = hasVariants ? displayStock === 0 : false;

  const isWishlisted = isInWishlist(id);

  // ── Cart Handlers ─────────────────────────────────────────────────────────────

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    setIsAdding(true);
    setTimeout(() => {
      setIsAdding(false);
      addToCart(
        {
          id,
          variantId: activeVariant?.id,
          name,
          price: displayPrice,
          imageSrc: (activeVariant?.images && activeVariant.images.length > 0) ? activeVariant.images[0] : (imageSrc || ""),
          discountPercent: displayDiscountPercent || undefined,
          brand,
          maxStock: displayStock,
          gstRate: activeVariant?.gstRate,
        },
        1,
        selectedSize || "Default",
        selectedColor || "Default"
      );
    }, 600);
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    setIsBuying(true);
    setTimeout(() => {
      setIsBuying(false);
      addToCart(
        {
          id,
          variantId: activeVariant?.id,
          name,
          price: displayPrice,
          imageSrc: (activeVariant?.images && activeVariant.images.length > 0) ? activeVariant.images[0] : (imageSrc || ""),
          discountPercent: displayDiscountPercent || undefined,
          brand,
          maxStock: displayStock,
          gstRate: activeVariant?.gstRate,
        },
        1,
        selectedSize || "Default",
        selectedColor || "Default"
      );
      router.push("/checkout");
    }, 600);
  };

  const toggleWishlist = () => {
    if (isWishlisted) {
      removeFromWishlist(id);
    } else {
      addToWishlist({
        id,
        name,
        price: displayPrice,
        imageSrc,
        discountPercent: displayDiscountPercent || undefined,
        rating: dynamicRating,
        category: category ?? brand,
        brand,
        description,
      });
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-6 text-left w-full">
      {/* 1. Header */}
      <div>
        <span className="text-xs font-bold uppercase tracking-widest text-[#E0A99E]">
          {brand}
        </span>
        <h1 className="mt-1 text-2xl md:text-3xl font-black text-stone-900 tracking-wide uppercase leading-tight">
          {name}
        </h1>
        <div className="mt-3 flex items-center gap-4 text-xs flex-wrap">
          {/* Stars — only shown when real reviews exist */}
          {dynamicReviewCount > 0 ? (
            <>
              <div className="flex items-center gap-1">
                <div className="flex text-amber-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <svg
                      key={i}
                      className={`h-3.5 w-3.5 ${
                        i < Math.floor(dynamicRating) ? "fill-current" : "text-stone-200"
                      }`}
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.03a1 1 0 00-1.175 0l-2.8 2.03c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="font-bold text-stone-700">{dynamicRating.toFixed(1)}</span>
              </div>
              <span className="text-stone-400 font-light border-l border-stone-200 pl-4">
                {dynamicReviewCount} Verified Purchaser Reviews
              </span>
            </>
          ) : (
            <span className="text-stone-400 text-[11px] italic">No ratings yet</span>
          )}

          {/* SKU — hidden for DEFAULT-* auto-generated SKUs */}
          {displaySku && !displaySku.startsWith("DEFAULT-") && (
            <span className="text-stone-400 font-light border-l border-stone-200 pl-4 select-all">
              SKU: {displaySku}
            </span>
          )}
        </div>
      </div>

      <hr className="border-stone-200/60" />

      {/* 2. Pricing */}
      <div className="space-y-2">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-2xl md:text-3xl font-extrabold text-stone-900">
            {formatPrice(finalPrice)}
          </span>
          {displayDiscountPercent > 0 && (
            <>
              <span className="text-sm font-semibold text-stone-400 line-through">
                {formatPrice(displayPrice)}
              </span>
              <span className="text-xs font-extrabold text-rose-500 uppercase bg-rose-50 px-2 py-0.5 rounded">
                {displayDiscountPercent}% OFF
              </span>
            </>
          )}
        </div>
        {displayDiscountPercent > 0 && (
          <div className="inline-flex items-center gap-1 bg-[#E0A99E]/10 border border-[#E0A99E]/20 text-[#C68B7D] text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full shadow-sm">
            <svg className="h-3 w-3 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Limited Time Offer
          </div>
        )}
      </div>

      {/* 3. Variant Selectors — dynamic: one row per attribute key */}
      {hasVariants && attrKeys.length > 0 && (
        <div className="space-y-5">
          {attrKeys.map((attrKey) => {
            const values = attrValueMap[attrKey] ?? [];
            if (values.length === 0) return null;

            const isColor = attrKey === "Color";
            const isSize  = attrKey === "Size";

            return (
              <div key={attrKey} className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold uppercase tracking-wider text-stone-500">
                    {isColor ? (
                      <>
                        Color: <span className="text-stone-900 font-semibold">{selectedAttrs[attrKey]}</span>
                      </>
                    ) : isSize ? (
                      "Select Size"
                    ) : (
                      <>
                        {attrKey}:
                        {selectedAttrs[attrKey] && (
                          <span className="text-stone-900 font-semibold ml-1">{selectedAttrs[attrKey]}</span>
                        )}
                      </>
                    )}
                  </span>
                  {isSize && (
                    <button className="text-stone-400 hover:text-stone-850 hover:underline font-semibold cursor-pointer">
                      Size Guide
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  {values.map((val) => {
                    const active = selectedAttrs[attrKey] === val;

                    // For Size: check stock given other currently selected attrs
                    let inStock = true;
                    if (isSize) {
                      const testSelection = { ...selectedAttrs, [attrKey]: val };
                      const match = resolveVariantByAttrs(variants, testSelection);
                      inStock = (match?.variant.quantity ?? 0) > 0;
                    }
                    // For Color: check that any active variant with this color has stock
                    if (isColor) {
                      inStock = variants.some(
                        (v) => v.variant.isActive && v.attributes[attrKey] === val && v.variant.quantity > 0
                      );
                    }

                    if (isColor || !isSize) {
                      // Pill button (Color + other attrs like Fit, Rise, Material)
                      return (
                        <button
                          key={val}
                          type="button"
                          onClick={() =>
                            setSelectedAttrs((prev) => ({ ...prev, [attrKey]: val }))
                          }
                          disabled={!inStock}
                          className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer ${
                            active
                              ? "bg-stone-900 text-white border-stone-900 shadow-sm"
                              : inStock
                              ? "bg-white text-stone-700 border-stone-200 hover:border-stone-400"
                              : "bg-stone-50 text-stone-300 border-stone-100 line-through cursor-not-allowed"
                          }`}
                        >
                          {val}
                        </button>
                      );
                    }

                    // Size chip buttons
                    return (
                      <button
                        key={val}
                        type="button"
                        onClick={() =>
                          setSelectedAttrs((prev) => ({ ...prev, [attrKey]: val }))
                        }
                        disabled={!inStock}
                        className={`h-10 min-w-[2.5rem] px-3 rounded-full text-xs font-bold transition-all border cursor-pointer ${
                          active
                            ? "bg-[#E0A99E] text-white border-transparent shadow-sm shadow-[#E0A99E]/20"
                            : inStock
                            ? "bg-white text-stone-700 border-stone-200 hover:border-stone-400"
                            : "bg-stone-50 text-stone-300 border-stone-100 line-through cursor-not-allowed"
                        }`}
                      >
                        {val}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Inventory Badge */}
          <InventoryBadge quantity={activeVariantEntry?.variant.quantity ?? 0} />
        </div>
      )}

      {/* 4. Action Buttons */}
      <div className="flex flex-col gap-3 mt-2">
        <div className="flex gap-3">
          {/* Add to Cart */}
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={isAdding || isOutOfStock}
            className="flex-1 rounded-full bg-white border border-stone-250 py-3 text-xs font-bold uppercase tracking-wider text-stone-700 hover:bg-stone-50 hover:border-stone-400 transition-colors shadow-sm disabled:opacity-50 h-12 flex items-center justify-center cursor-pointer"
          >
            {isOutOfStock ? "Out of Stock" : isAdding ? "Adding..." : "Add to Cart"}
          </button>

          {/* Add to Wishlist */}
          <button
            type="button"
            onClick={toggleWishlist}
            className="flex-shrink-0 h-12 w-12 rounded-full border border-stone-250 bg-white text-stone-500 hover:text-rose-500 hover:border-stone-400 transition-colors flex items-center justify-center cursor-pointer shadow-sm"
            title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
          >
            <svg
              className={`h-5 w-5 ${isWishlisted ? "fill-rose-500 text-rose-500" : "currentColor"}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.8}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </button>
        </div>

        {/* Buy Now */}
        <button
          type="button"
          onClick={handleBuyNow}
          disabled={isBuying || isOutOfStock}
          className="w-full rounded-full bg-[#E0A99E] py-3 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#D4988D] transition-colors shadow-md hover:shadow-[#E0A99E]/20 h-12 flex items-center justify-center cursor-pointer disabled:opacity-60"
        >
          {isOutOfStock ? "Unavailable" : isBuying ? "Processing..." : "Buy Now"}
        </button>
        {displayStock > 0 && displayStock <= 5 && (
          <p className="text-center text-xs font-bold text-rose-500 tracking-wider mt-1">
            Only {displayStock} left in stock!
          </p>
        )}
      </div>

      <hr className="border-stone-200/60" />

      {/* 5. Product Details Tabs */}
      <div className="space-y-4">
        <div className="flex border-b border-stone-200">
          {[
            { id: "description", label: "Details" },
            { id: "specs",       label: "Specifications" },
            { id: "shipping",    label: "Shipping" },
            { id: "returns",     label: "Returns" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`pb-2.5 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
                activeTab === tab.id
                  ? "border-[#E0A99E] text-stone-900"
                  : "border-transparent text-stone-400 hover:text-stone-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="min-h-[80px]">
          {/* Description tab */}
          {activeTab === "description" && (
            <div className="text-xs text-stone-600 leading-relaxed font-light">
              <p>{description}</p>
            </div>
          )}

          {/* Specifications tab — dynamic from attribute engine */}
          {activeTab === "specs" && (
            <div className="text-xs text-stone-600 space-y-3">
              {Object.keys(productAttributes).length === 0 &&
               Object.keys(activeVariantEntry?.attributes ?? {}).filter((k) => k !== "Color" && k !== "Size").length === 0 ? (
                <p className="font-light text-stone-400 italic">
                  No specifications have been added for this product yet.
                </p>
              ) : (
                <table className="w-full">
                  <tbody className="divide-y divide-stone-100">
                    {/* Variant-level attributes (excluding Color & Size — shown as swatches) */}
                    {Object.entries(activeVariantEntry?.attributes ?? {})
                      .filter(([key]) => key !== "Color" && key !== "Size")
                      .map(([key, val]) => (
                        <tr key={key}>
                          <td className="py-2 pr-4 font-bold text-stone-500 uppercase tracking-wider text-[10px] w-1/3">
                            {key}
                          </td>
                          <td className="py-2 text-stone-800 font-semibold">{val}</td>
                        </tr>
                      ))}
                    {/* Product-level attributes */}
                    {Object.entries(productAttributes).map(([key, val]) => (
                      <tr key={key}>
                        <td className="py-2 pr-4 font-bold text-stone-500 uppercase tracking-wider text-[10px] w-1/3">
                          {key}
                        </td>
                        <td className="py-2 text-stone-800 font-semibold">{val}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* Shipping tab — dynamic estimates, hidden when out of stock */}
          {activeTab === "shipping" && (
            <div className="text-xs text-stone-600 space-y-4">
              <div className="flex items-start gap-2">
                <svg className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="font-semibold text-stone-700">Free Shipping Available on orders over ₹1,000</span>
              </div>
              {!isOutOfStock ? (
                <DeliveryChecker productId={id} />
              ) : (
                <p className="text-stone-400 italic">Delivery estimate unavailable — item is currently out of stock.</p>
              )}
              <p className="font-light text-stone-500 mt-4">All garments are packed in signature recyclable dust sleeves.</p>
            </div>
          )}

          {/* Returns tab — dynamic return window from DB */}
          {activeTab === "returns" && (
            <div className="text-xs text-stone-600 leading-relaxed font-light space-y-3">
              {returnPolicy ? (
                <>
                  <div className="flex items-start gap-2">
                    <svg className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="font-semibold text-stone-700">
                      Eligible for {returnPolicy.returnDays}-day returns.
                    </span>
                  </div>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Exchange: {returnPolicy.exchangeAllowed ? "Allowed" : "Not Allowed"}</li>
                    <li>Return Pickup: {returnPolicy.pickupAvailable ? "Available" : "Customer Drop-off"}</li>
                  </ul>
                  {returnPolicy.notes && (
                    <p className="italic text-stone-500 mt-2">{returnPolicy.notes}</p>
                  )}
                  <p className="mt-3">Items must be unworn and in their original condition with tags intact.</p>
                </>
              ) : (
                <p>Loading return policy...</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

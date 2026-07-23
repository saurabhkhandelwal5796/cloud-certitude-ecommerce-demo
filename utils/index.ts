/**
 * Utility Functions
 *
 * This file is the central export for shared utility helpers.
 * Add formatting, validation, and other helpers here as the project grows.
 *
 * Future phases will add:
 *   - Currency formatting (formatPrice)
 *   - Date formatting (formatDate)
 *   - String helpers (slugify, truncate)
 *   - Validation helpers (isValidEmail)
 *   - Class name merging (cn — Tailwind class merger)
 */

// ---------------------------------------------------------------------------
// Format helpers
// ---------------------------------------------------------------------------

/**
 * Formats a number as a currency string.
 * @example formatPrice(1999) // → "₹1,999.00" depending on locale
 */
export function formatPrice(
  amount: number,
  currency = "INR",
  locale = "en-IN"
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

export const formatINR = (value: number) =>
  `INR ${value.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

/**
 * Formats a date string into a human-readable format.
 */
export function formatDate(
  dateString: string,
  locale = "en-US",
  options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  }
): string {
  return new Date(dateString).toLocaleDateString(locale, options);
}

// ---------------------------------------------------------------------------
// String helpers
// ---------------------------------------------------------------------------

/**
 * Converts a string to a URL-friendly slug.
 * @example slugify("Blue Denim Jacket") // → "blue-denim-jacket"
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Truncates a string to a maximum length, appending "…" if needed.
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 1) + "…";
}

// ---------------------------------------------------------------------------
// Validation helpers
// ---------------------------------------------------------------------------

/**
 * Checks whether a string is a valid email address.
 */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ---------------------------------------------------------------------------
// Class name helper (Tailwind-friendly)
// ---------------------------------------------------------------------------

/**
 * Merges class names, filtering out falsy values.
 * Lightweight alternative to clsx/classnames.
 * @example cn("px-4", isActive && "bg-emerald-500") // → "px-4 bg-emerald-500"
 */
export function cn(...classes: (string | boolean | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}

// ---------------------------------------------------------------------------
// Supabase connection verification
// ---------------------------------------------------------------------------

export interface SupabaseConfigStatus {
  isConfigured: boolean;
  hasUrl: boolean;
  hasAnonKey: boolean;
  urlFormatValid: boolean;
}

/**
 * Checks at runtime if the required Supabase environment variables are loaded
 * and present. Does not throw errors, allowing components/pages to render a fallback status.
 */
export function verifySupabaseConfig(): SupabaseConfigStatus {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const hasUrl = !!url && url.trim().length > 0 && url !== "your-supabase-project-url";
  const hasAnonKey = !!anonKey && anonKey.trim().length > 0 && anonKey !== "your-supabase-anon-key";
  const urlFormatValid = hasUrl && url.startsWith("https://");

  return {
    isConfigured: hasUrl && hasAnonKey && urlFormatValid,
    hasUrl,
    hasAnonKey,
    urlFormatValid,
  };
}

export const CATEGORY_FALLBACK_IMAGES: Record<string, string> = {
  Men: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab",
  Women: "https://images.unsplash.com/photo-1483985988355-763728e1935b",
  Kids: "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea",
  Accessories: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49",
  Footwear: "https://images.unsplash.com/photo-1542291026-7eec264c27ff"
};

export function getCategoryFallbackImage(category?: string): string {
  if (!category) return CATEGORY_FALLBACK_IMAGES.Men;
  const normalized = category.trim();
  return CATEGORY_FALLBACK_IMAGES[normalized] || CATEGORY_FALLBACK_IMAGES.Men;
}

export function getCategoryFromProductId(id: string): string {
  if (id.startsWith("m")) return "Men";
  if (id.startsWith("w")) return "Women";
  if (id.startsWith("k")) return "Kids";
  if (id.startsWith("a")) return "Accessories";
  if (id.startsWith("f")) return "Footwear";
  return "Men";
}

export function getGstLabel(items?: any[]): string {
  if (!items || items.length === 0) return "GST (Calculated per product)";

  let products: any[] = [];
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem("certitude_admin_products");
      if (stored) products = JSON.parse(stored);
    } catch (e) {}
  }

  const rates = items.map((item) => {
    const matched = products.find((p) => p.id === (item.id || item.productId));
    return matched?.gstRate ?? matched?.gst_rate ?? item.gstRate ?? item.gst_rate ?? 5;
  });

  const uniqueRates = Array.from(new Set(rates));
  if (uniqueRates.length === 1) {
    return `GST (${uniqueRates[0]}% on taxable subtotal)`;
  }
  return "GST (Mixed Rates on taxable subtotal)";
}


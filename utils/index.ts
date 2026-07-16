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
 * @example formatPrice(1999) // → "₹1,999.00" or "$19.99" depending on locale
 */
export function formatPrice(
  amount: number,
  currency = "USD",
  locale = "en-US"
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

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


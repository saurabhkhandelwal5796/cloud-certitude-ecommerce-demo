/**
 * Supabase — Central Export
 *
 * Import the appropriate client factory based on your context:
 *   - `getSupabaseClient()`  → for Client Components (browser)
 *   - `getSupabaseAdmin()`   → for Server Components / Route Handlers / Server Actions
 */

export { getSupabaseClient } from "./client";
export { getSupabaseAdmin } from "./server";

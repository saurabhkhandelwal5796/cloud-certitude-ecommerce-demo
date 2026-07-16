/**
 * Supabase — Central Export
 *
 * Import the appropriate client factory based on your context:
 *   - `getSupabaseClient()`  → for Client Components (browser)
 *   - `getSupabaseAdmin()`   → for Server Components / Route Handlers / Server Actions
 *
 * It also exports the Database type definition for strong schema typing.
 */

export { getSupabaseClient } from "./client";
export { getSupabaseAdmin } from "./server";
export type { Database, Json } from "./types";

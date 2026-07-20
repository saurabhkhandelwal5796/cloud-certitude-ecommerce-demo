import { getSupabaseClient } from "@/lib/supabase/client";

export type UserRole = "admin" | "customer";

/**
 * Get the role of the currently authenticated user from the profiles table.
 * Falls back to "customer" if no profile found.
 */
export async function getUserRole(): Promise<UserRole> {
  try {
    const supabase = getSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return "customer";

    const { data } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    return (data?.role as UserRole) || "customer";
  } catch {
    return "customer";
  }
}

/**
 * Get the role of a user by ID (server-side, uses service role).
 */
export async function getUserRoleById(userId: string): Promise<UserRole> {
  try {
    const supabase = getSupabaseClient();
    const { data } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .single();
    return (data?.role as UserRole) || "customer";
  } catch {
    return "customer";
  }
}

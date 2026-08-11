/**
 * API Route: /api/admin/navigation
 *
 * GET     — list all navigation nodes (admin use, no cache)
 * POST    — create a new node
 * PATCH   — update an existing node (name, slug, parent, icon, sort_order, is_active)
 * DELETE  — delete a node (cascade to children via FK ON DELETE CASCADE)
 *
 * All mutations trigger Next.js cache revalidation on the navigation-tree tag.
 */

import { NextRequest, NextResponse } from "next/server";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getDb = (): any => {
  const { getSupabaseAdmin } = require("@/lib/supabase/server");
  return getSupabaseAdmin();
};
import { revalidateTag } from "next/cache";
import { createServerClient } from "@/lib/supabase/cookie-client";


// ─── Auth Guard ───────────────────────────────────────────────────────────────

async function requireAdmin(): Promise<boolean> {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    return profile?.role === "admin";
  } catch {
    return false;
  }
}

// ─── GET ──────────────────────────────────────────────────────────────────────

export async function GET() {
  const isAdmin = await requireAdmin();
  if (!isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { data, error } = await getDb()
    .from("navigation_nodes")
    .select("id, name, slug, full_path, level, icon, sort_order, is_active, parent_id, created_at")
    .order("level",      { ascending: true })
    .order("sort_order", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data ?? []);
}

// ─── POST ─────────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const isAdmin = await requireAdmin();
  if (!isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const { name, slug, parent_id, icon, sort_order, is_active, level } = body;

  if (!name || !slug) {
    return NextResponse.json({ error: "name and slug are required" }, { status: 400 });
  }

  const { data, error } = await getDb()
    .from("navigation_nodes")
    .insert({
      name,
      slug,
      parent_id: parent_id ?? null,
      icon: icon ?? null,
      sort_order: sort_order ?? 0,
      is_active: is_active ?? false,
      level: level ?? 0,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  revalidateTag("navigation-tree", "default");
  return NextResponse.json(data, { status: 201 });
}

// ─── PATCH ────────────────────────────────────────────────────────────────────

export async function PATCH(req: NextRequest) {
  const isAdmin = await requireAdmin();
  if (!isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const { id, ...updates } = body;

  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  // Only allow safe fields to be updated
  const allowed = ["name", "slug", "parent_id", "icon", "sort_order", "is_active"];
  const safeUpdates: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in updates) {
      safeUpdates[key] = updates[key];
    }
  }

  const { data, error } = await getDb()
    .from("navigation_nodes")
    .update(safeUpdates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  revalidateTag("navigation-tree", "default");
  return NextResponse.json(data);
}

// ─── DELETE ───────────────────────────────────────────────────────────────────

export async function DELETE(req: NextRequest) {
  const isAdmin = await requireAdmin();
  if (!isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  const { error } = await getDb()
    .from("navigation_nodes")
    .delete()
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  revalidateTag("navigation-tree", "default");
  return NextResponse.json({ success: true });
}

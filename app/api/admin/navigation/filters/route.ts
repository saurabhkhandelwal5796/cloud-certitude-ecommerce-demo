import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/cookie-client";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getDb = (): any => {
  const { getSupabaseAdmin } = require("@/lib/supabase/server");
  return getSupabaseAdmin();
};

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

export async function GET(req: NextRequest) {
  const isAdmin = await requireAdmin();
  if (!isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const navNodeId = searchParams.get("navNodeId");

  if (!navNodeId) {
    return NextResponse.json({ error: "navNodeId is required" }, { status: 400 });
  }

  const { data, error } = await getDb()
    .from("navigation_attribute_groups")
    .select("attribute_group_id")
    .eq("nav_node_id", navNodeId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const groupIds = data.map((d: any) => d.attribute_group_id);
  return NextResponse.json(groupIds);
}

export async function POST(req: NextRequest) {
  const isAdmin = await requireAdmin();
  if (!isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const { navNodeId, groupIds } = body;

  if (!navNodeId || !Array.isArray(groupIds)) {
    return NextResponse.json({ error: "navNodeId and groupIds array are required" }, { status: 400 });
  }

  const db = getDb();

  // 1. Delete all existing mappings for this node
  const { error: deleteError } = await db
    .from("navigation_attribute_groups")
    .delete()
    .eq("nav_node_id", navNodeId);

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 });
  }

  // 2. Insert new mappings
  if (groupIds.length > 0) {
    const inserts = groupIds.map((id: string) => ({
      nav_node_id: navNodeId,
      attribute_group_id: id
    }));
    
    const { error: insertError } = await db
      .from("navigation_attribute_groups")
      .insert(inserts);

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }
  }

  return NextResponse.json({ success: true });
}

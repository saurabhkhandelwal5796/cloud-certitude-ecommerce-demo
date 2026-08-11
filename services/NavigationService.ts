/**
 * NavigationService.ts
 *
 * Customer-facing service for the navigation_nodes tree.
 *
 * Responsibilities:
 *   - getNavTree()       — full tree for the mega menu (cached 5 min)
 *   - getNodeByPath()    — resolve URL path to a NavNode (single indexed lookup)
 *   - getAncestors()     — breadcrumb chain (root → current)
 *   - getNodeSeo()       — SEO metadata per node
 *   - getNodeBanners()   — promotional banners per node
 *
 * All reads use getSupabaseAdmin() (server-side only).
 * DO NOT import this service in client components.
 */

import { getSupabaseAdmin } from "@/lib/supabase/server";
import { unstable_cache } from "next/cache";

/**
 * Returns a loosely-typed Supabase client.
 *
 * The new tables (navigation_nodes, navigation_seo, navigation_banners)
 * are not yet in the generated Database type — they will be added after
 * running `supabase gen types typescript` post-migration.
 *
 * Until then we cast to any to allow the service to compile.
 * This is the same pattern used in FacetService and ProductFilterService.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = () => getSupabaseAdmin() as any;


// ─── Types ────────────────────────────────────────────────────────────────────

export interface NavNode {
  id: string;
  name: string;
  slug: string;
  fullPath: string;
  level: number;
  icon: string | null;
  sortOrder: number;
  isActive: boolean;
  children: NavNode[];
}

export interface NodeSeo {
  title: string | null;
  description: string | null;
  ogImage: string | null;
  h1Override: string | null;
  canonicalUrl: string | null;
}

export interface NodeBanner {
  id: string;
  imageUrl: string;
  altText: string | null;
  href: string | null;
  sortOrder: number;
}

// ─── Raw DB Row Types ─────────────────────────────────────────────────────────

interface RawNavNode {
  id: string;
  name: string;
  slug: string;
  full_path: string;
  level: number;
  icon: string | null;
  sort_order: number;
  is_active: boolean;
  parent_id: string | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function mapRawNode(raw: RawNavNode): NavNode {
  return {
    id: raw.id,
    name: raw.name,
    slug: raw.slug,
    fullPath: raw.full_path,
    level: raw.level,
    icon: raw.icon,
    sortOrder: raw.sort_order,
    isActive: raw.is_active,
    children: [],
  };
}

/** Builds a recursive NavNode[] tree from a flat list ordered by sort_order. */
function buildTree(flat: RawNavNode[]): NavNode[] {
  const nodeMap = new Map<string, NavNode>();
  const roots: NavNode[] = [];

  // First pass: create all nodes
  for (const raw of flat) {
    nodeMap.set(raw.id, mapRawNode(raw));
  }

  // Second pass: wire parent→child relationships
  for (const raw of flat) {
    const node = nodeMap.get(raw.id)!;
    if (raw.parent_id && nodeMap.has(raw.parent_id)) {
      nodeMap.get(raw.parent_id)!.children.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Returns the full navigation tree for the mega menu.
 *
 * Fetches all active nodes in a single query, then builds the tree in-memory.
 * Cached for 5 minutes server-side via Next.js unstable_cache.
 *
 * Cache tag "navigation-tree" allows targeted revalidation from admin actions.
 */
export const getNavTree = unstable_cache(
  async (): Promise<NavNode[]> => {
    try {
      const { data, error } = await db()
        .from("navigation_nodes")
        .select("id, name, slug, full_path, level, icon, sort_order, is_active, parent_id")
        .eq("is_active", true)
        .order("level",      { ascending: true })
        .order("sort_order", { ascending: true });

      if (error) {
        console.error("[NavigationService] getNavTree error:", error.message);
        return [];
      }

      return buildTree((data ?? []) as RawNavNode[]);
    } catch (e) {
      console.error("[NavigationService] getNavTree unexpected error:", e);
      return [];
    }
  },
  ["navigation-tree"],
  { revalidate: 300, tags: ["navigation-tree"] }
);

/**
 * Resolves a URL path to a NavNode via the indexed full_path column.
 *
 * Single indexed DB lookup — no recursion.
 * Returns null if the node does not exist or is inactive.
 *
 * @param fullPath  e.g. "men/clothing/top-wear/t-shirts"
 */
export async function getNodeByPath(fullPath: string): Promise<NavNode | null> {
  try {
    const { data, error } = await db()
      .from("navigation_nodes")
      .select("id, name, slug, full_path, level, icon, sort_order, is_active, parent_id")
      .eq("full_path", fullPath)
      .eq("is_active", true)
      .single();

    if (error || !data) return null;
    return mapRawNode(data as RawNavNode);
  } catch (e) {
    console.error("[NavigationService] getNodeByPath error:", e);
    return null;
  }
}

/**
 * Returns the ancestor chain for a node, ordered root → parent.
 *
 * Used to render breadcrumbs. The current node itself is NOT included.
 * Example: for node "T-Shirts" (men/clothing/top-wear/t-shirts)
 * returns [Men, Clothing, Top Wear]
 *
 * @param nodeId  UUID of the current node
 */
export async function getAncestors(nodeId: string): Promise<NavNode[]> {
  try {
    const ancestors: NavNode[] = [];
    void ancestors;

    // Fetch current node to get its full_path
    const { data: current, error: e1 } = await db()
      .from("navigation_nodes")
      .select("full_path, parent_id")
      .eq("id", nodeId)
      .single();

    if (e1 || !current) return [];

    const fullPath: string = (current as { full_path: string; parent_id: string | null }).full_path;

    // Split path into segments; each prefix is an ancestor
    const segments = fullPath.split("/");
    // Remove the last segment (current node itself)
    segments.pop();

    if (segments.length === 0) return [];

    // Build ancestor full_paths
    const ancestorPaths: string[] = [];
    for (let i = 1; i <= segments.length; i++) {
      ancestorPaths.push(segments.slice(0, i).join("/"));
    }

    const { data, error: e2 } = await db()
      .from("navigation_nodes")
      .select("id, name, slug, full_path, level, icon, sort_order, is_active, parent_id")
      .in("full_path", ancestorPaths)
      .order("level", { ascending: true });

    if (e2 || !data) return [];

    return (data as RawNavNode[]).map(mapRawNode);
  } catch (e) {
    console.error("[NavigationService] getAncestors error:", e);
    return [];
  }
}

/**
 * Returns SEO metadata for a navigation node.
 * Returns null if no SEO record exists (caller uses fallback values).
 */
export async function getNodeSeo(nodeId: string): Promise<NodeSeo | null> {
  try {
    const { data, error } = await db()
      .from("navigation_seo")
      .select("title, description, og_image, h1_override, canonical_url")
      .eq("nav_node_id", nodeId)
      .single();

    if (error || !data) return null;

    const row = data as {
      title: string | null;
      description: string | null;
      og_image: string | null;
      h1_override: string | null;
      canonical_url: string | null;
    };

    return {
      title: row.title,
      description: row.description,
      ogImage: row.og_image,
      h1Override: row.h1_override,
      canonicalUrl: row.canonical_url,
    };
  } catch (e) {
    console.error("[NavigationService] getNodeSeo error:", e);
    return null;
  }
}

/**
 * Returns active banners for a navigation node, ordered by sort_order.
 */
export async function getNodeBanners(nodeId: string): Promise<NodeBanner[]> {
  try {
    const { data, error } = await db()
      .from("navigation_banners")
      .select("id, image_url, alt_text, href, sort_order")
      .eq("nav_node_id", nodeId)
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (error || !data) return [];

    return (data as Array<{
      id: string;
      image_url: string;
      alt_text: string | null;
      href: string | null;
      sort_order: number;
    }>).map((row) => ({
      id: row.id,
      imageUrl: row.image_url,
      altText: row.alt_text,
      href: row.href,
      sortOrder: row.sort_order,
    }));
  } catch (e) {
    console.error("[NavigationService] getNodeBanners error:", e);
    return [];
  }
}

/**
 * Returns all navigation nodes (active + inactive) for admin use.
 * NOT cached — admin needs fresh data.
 */
export async function getAllNodesForAdmin(): Promise<RawNavNode[]> {
  const { data, error } = await db()
    .from("navigation_nodes")
    .select("id, name, slug, full_path, level, icon, sort_order, is_active, parent_id")
    .order("level",      { ascending: true })
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("[NavigationService] getAllNodesForAdmin error:", error.message);
    return [];
  }
  return (data ?? []) as RawNavNode[];
}

/** Returns all leaf nodes (nodes with no children). Used by facet admin UI. */
export async function getLeafNodes(): Promise<NavNode[]> {
  const { data, error } = await db()
    .from("navigation_nodes")
    .select("id, name, slug, full_path, level, icon, sort_order, is_active, parent_id")
    .eq("is_active", true)
    .order("full_path", { ascending: true });

  if (error || !data) return [];

  const allNodes = data as RawNavNode[];
  const parentIds = new Set(allNodes.map((n) => n.parent_id).filter(Boolean));

  return allNodes
    .filter((n) => !parentIds.has(n.id))
    .map(mapRawNode);
}

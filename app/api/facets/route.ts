/**
 * GET /api/facets
 *
 * Server-side facade for the Dynamic Facets Service.
 *
 * This route exists as a thin proxy so that:
 *   1. Future server-rendered pages can prefetch facets without a client round-trip.
 *   2. External integrations or edge middleware can fetch facets via HTTP.
 *
 * Query Params (exclusive — use only ONE per request):
 *   ?category=Men           → calls getCategoryFacets("Men")
 *   ?productIds=id1,id2,…   → calls getSearchFacets([id1, id2, …])
 *
 * Response:
 *   200  { data: FacetResult }   on success
 *   400  { error: string }       on invalid or missing params
 *   500  { error: string }       on internal error
 *
 * Caching:
 *   The route sets Cache-Control to 5 minutes (matching FacetService TTL).
 *   Next.js edge/CDN caching will further reduce DB load on repeat requests.
 *
 * DO NOT expose this route to Cart/Checkout/Orders flows.
 * It is exclusively a read API for the storefront search and collection pages.
 */

import { NextRequest, NextResponse } from "next/server";
import {
  getCategoryFacets,
  getSearchFacets,
} from "@/services/FacetService";

const CACHE_SECONDS = 300; // 5 minutes

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const category    = searchParams.get("category");
  
  const productIds  = searchParams.get("productIds");

  try {
    let data: Record<string, string[]>;

    if (category !== null) {
      // e.g. /api/facets?category=Men
      data = await getCategoryFacets(category);
    } else if (productIds !== null) {
      // e.g. /api/facets?productIds=id1,id2,id3
      const ids = productIds
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      if (ids.length === 0) {
        return NextResponse.json({ data: {} }, { status: 200 });
      }

      const invalidIds = ids.filter((id) => !isUUID(id));
      if (invalidIds.length > 0) {
        return NextResponse.json(
          { error: `Invalid product UUID(s): ${invalidIds.slice(0, 3).join(", ")}` },
          { status: 400 }
        );
      }

      data = await getSearchFacets(ids);
    } else {
      return NextResponse.json(
        {
          error:
            "Missing query param. Use ?category=<name>, or ?productIds=<uuid,uuid,…>",
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { data },
      {
        status: 200,
        headers: {
          "Cache-Control": `public, s-maxage=${CACHE_SECONDS}, stale-while-revalidate=${CACHE_SECONDS}`,
        },
      }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[/api/facets] Error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isUUID(value: string): boolean {
  return UUID_REGEX.test(value);
}


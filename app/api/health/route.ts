import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    let supabase;
    try {
      supabase = getSupabaseAdmin();
    } catch (e) {
      // Env variables missing
      return NextResponse.json({
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        database: "disconnected",
        searchV2: "unknown",
        facets: "unknown",
        version: "1.0.0"
      }, { status: 503 });
    }

    // 1. Database Connection Check (lightweight)
    const dbPromise = supabase.from('products').select('id').limit(1);

    // 2-4. Check RPC existence with dummy payload.
    // The RPC will either execute fast (no results) or return an error.
    // If it returns error code 'PGRST202' (function not found), it's missing.
    // We cast to any to suppress TS errors if the generated types are stale.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const searchV2Promise = (supabase as any).rpc('filter_products_v2', {
      search_term: '___health_check___',
      page: 1,
      page_size: 1
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const categoryPromise = (supabase as any).rpc('get_category_facets', {
      p_category: '___health_check___'
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const subcategoryPromise = (supabase as any).rpc('get_node_facets', { p_nav_node_id: '___health_check___' });

    const [dbRes, searchRes, catRes, subcatRes] = await Promise.all([
      dbPromise,
      searchV2Promise,
      categoryPromise,
      subcategoryPromise
    ]);

    // Check for hard failures (connection issues or function missing)
    // PostgREST "function not found" is PGRST202.
    // FETCH_ERROR indicates a network-level disconnect.
    const isDbConnected = !dbRes.error || (dbRes.error && dbRes.error.code !== 'FETCH_ERROR');
    const searchV2Available = !searchRes.error || searchRes.error.code !== 'PGRST202';
    const facetsAvailable = !catRes.error || catRes.error.code !== 'PGRST202';
    const subFacetsAvailable = !subcatRes.error || subcatRes.error.code !== 'PGRST202';

    const isHealthy = isDbConnected && searchV2Available && facetsAvailable && subFacetsAvailable;

    const status = isHealthy ? "healthy" : "unhealthy";
    const httpStatus = isHealthy ? 200 : 503;

    return NextResponse.json({
      status,
      timestamp: new Date().toISOString(),
      database: isDbConnected ? "connected" : "disconnected",
      searchV2: searchV2Available ? "available" : "unavailable",
      facets: (facetsAvailable && subFacetsAvailable) ? "available" : "unavailable",
      version: "1.0.0"
    }, { status: httpStatus });

  } catch (error) {
    return NextResponse.json({
      status: "unhealthy",
      timestamp: new Date().toISOString(),
      database: "error",
      searchV2: "unknown",
      facets: "unknown",
      version: "1.0.0"
    }, { status: 503 });
  }
}


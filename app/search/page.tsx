"use client";

/**
 * SearchPage – Phase 6C
 *
 * Migrated from client-side bulk download to server-side filtering via
 * the `filter_products_v2` PostgreSQL RPC.
 *
 * What changed vs. the previous implementation:
 *   - REMOVED: AdminService.getVisibleProducts() + client-side .filter() + .slice(0,20)
 *   - ADDED:   ProductFilterService.getFilteredProductsV2() — single DB call per search
 *   - ADDED:   300 ms debounce on the ?q= query parameter
 *   - ADDED:   DynamicFilterSidebar with facets returned by the RPC
 *   - ADDED:   Pagination (8 per page, driven by totalCount from RPC)
 *   - ADDED:   Sort controls (relevance, price-asc, price-desc, highest-rated)
 *   - ADDED:   Full URL state sync (?q=, ?sort=, ?page=, ?priceMax=, ?Brand=, etc.)
 *
 * What did NOT change:
 *   - ProductCard component (zero changes)
 *   - DynamicFilterSidebar component (zero changes)
 *   - Pagination component (zero changes)
 *   - Cart / Checkout / Orders / Inventory / Variants / Category Pages
 *   - Existing search URL pattern (?q=jeans still works)
 */

import React, { useState, useEffect, useCallback, useRef, Suspense, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import ProductCard from "@/components/ui/ProductCard";
import Pagination from "@/components/ui/Pagination";
import DynamicFilterSidebar from "@/components/ui/DynamicFilterSidebar";
import MobileFilterDrawer from "@/components/ui/MobileFilterDrawer";
import type { NodeFacetGroup } from "@/services/FacetService";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ProductType {
  id: string;
  name: string;
  price: number;
  imageSrc: string;
  discountPercent?: number;
  rating?: number;
  reviewCount?: number;
  category: string;
  brand?: string;
  color?: string;
  size?: string[];
  description?: string;
}

const ITEMS_PER_PAGE = 8;
const DEBOUNCE_MS    = 300;

// ─── Helpers ──────────────────────────────────────────────────────────────────

// ─── Inner component (uses useSearchParams → must be inside <Suspense>) ────────

function SearchResults() {
  const searchParams = useSearchParams();
  const router       = useRouter();

  // ── State ──────────────────────────────────────────────────────────────────
  const [products,        setProducts]        = useState<ProductType[]>([]);
  const [facets,          setFacets]          = useState<NodeFacetGroup[]>([]);
  const [totalCount,      setTotalCount]      = useState<number>(0);
  const [hasNextPage,     setHasNextPage]     = useState<boolean>(false);
  const [isLoading,       setIsLoading]       = useState<boolean>(false);
  const [execMs,          setExecMs]          = useState<number | null>(null);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Derived from URL
  const rawQuery  = searchParams.get("q") || "";
  const sortParam = searchParams.get("sort") || "newest";

  // ── Debounced query ref ───────────────────────────────────────────────────
  const [debouncedQuery, setDebouncedQuery] = useState(rawQuery);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setDebouncedQuery(rawQuery);
    }, DEBOUNCE_MS);
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [rawQuery]);

  const currentPage = Number(searchParams.get("page") || "1");
  const priceRange  = Number(searchParams.get("priceMax") || "15000");

  const activeFilters = useMemo(() => {
    const filters: Record<string, string[]> = {};
    searchParams.forEach((val, key) => {
      if (["q", "sort", "page", "priceMax"].includes(key)) return;
      if (!filters[key]) filters[key] = [];
      filters[key].push(val);
    });
    return filters;
  }, [searchParams]);

  // ── Core fetch ────────────────────────────────────────────────────────────
  const fetchProducts = useCallback(async () => {
    if (!debouncedQuery.trim()) {
      setProducts([]);
      setFacets([]);
      setTotalCount(0);
      setHasNextPage(false);
      setExecMs(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const { getGlobalSearchResults, validateFilters } = await import(
        "@/services/ProductFilterService"
      );

      const cleanFilters = validateFilters(activeFilters);

      const result = await getGlobalSearchResults({
        searchQuery: debouncedQuery,
        filters:    cleanFilters,
        priceMax:   priceRange < 15000 ? priceRange : undefined,
        sort:       sortParam,
        limit:      ITEMS_PER_PAGE,
        offset:     (currentPage - 1) * ITEMS_PER_PAGE,
      });

      setProducts(result.products as ProductType[]);
      
      // Convert facet object to array
      const facetArray = Object.values(result.facets) as NodeFacetGroup[];
      setFacets(facetArray);
      
      setTotalCount(result.totalCount);
      setHasNextPage(result.hasNextPage);
      setExecMs(null); // No execution time in V4 result
    } catch (err) {
      console.error("[SearchPage] Error fetching products:", err);
      setProducts([]);
      setFacets([]);
    } finally {
      setIsLoading(false);
    }
  }, [debouncedQuery, activeFilters, priceRange, sortParam, currentPage]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleFilterChange = (attributeName: string, valueLabel: string) => {
    const current = activeFilters[attributeName] || [];
    const updated = current.includes(valueLabel)
      ? current.filter(v => v !== valueLabel)
      : [...current, valueLabel];

    const newFilters = { ...activeFilters, [attributeName]: updated };
    if (updated.length === 0) delete newFilters[attributeName];

    const params = new URLSearchParams(searchParams.toString());
    params.delete(attributeName);
    if (newFilters[attributeName]) {
      newFilters[attributeName].forEach(val => params.append(attributeName, val));
    }
    params.set("page", "1");
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const handleClearAll = () => {
    const params = new URLSearchParams();
    if (rawQuery) params.set("q", rawQuery);
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const handleSortChange = (sort: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", sort);
    params.set("page", "1");
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    router.push(`?${params.toString()}`, { scroll: false });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ── Pagination ────────────────────────────────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(totalCount / ITEMS_PER_PAGE));

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 bg-[#FAF9F6]">
      {/* Page heading */}
      <div className="mb-10">
        <h1 className="text-2xl font-bold tracking-tight text-stone-900">
          {rawQuery
            ? <>Search Results for <span className="text-[#C68B7D]">&ldquo;{rawQuery}&rdquo;</span></>
            : "Search Products"}
        </h1>
        {!isLoading && debouncedQuery && (
          <p className="mt-1 text-xs text-stone-400 font-medium">
            {totalCount} {totalCount === 1 ? "product" : "products"} found
            {execMs !== null && ` · ${execMs}ms`}
          </p>
        )}
      </div>

      {/* Empty query prompt */}
      {!rawQuery && (
        <div className="text-center py-24 border border-dashed border-stone-200 rounded-3xl bg-white/60">
          <svg className="mx-auto h-10 w-10 text-stone-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <p className="text-stone-400 text-sm">Type something in the search bar above to find products.</p>
        </div>
      )}

      {rawQuery && (
        <>
          {/* ── Main Layout ── */}
          <div className="flex flex-col lg:flex-row gap-8 items-start relative pb-20 lg:pb-0 mt-8">
            {/* ── Desktop Sidebar ── */}
            <div className="hidden lg:block lg:w-1/4 lg:sticky lg:top-24">
              <DynamicFilterSidebar
              facetGroups={facets}
              selectedFilters={activeFilters}
              onFilterChange={handleFilterChange}
              priceRange={priceRange}
              setPriceRange={(val) => {
                const params = new URLSearchParams(searchParams.toString());
                params.set("priceMax", String(val));
                params.set("page", "1");
                router.push(`?${params.toString()}`, { scroll: false });
              }}
              onClear={handleClearAll}
            />
          </div>

          {/* ── Main content ── */}
          <div className="w-full lg:w-3/4">

            {/* Controls bar */}
            <div className="flex items-center justify-between gap-4 border-b border-stone-200/50 pb-6 mb-8">
              <span className="text-xs text-stone-400 uppercase tracking-widest font-bold">
                {isLoading
                  ? "Searching…"
                  : `${totalCount} ${totalCount === 1 ? "Result" : "Results"}`}
              </span>

              {/* Sort selector */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-stone-500 font-bold uppercase tracking-wider">Sort By:</span>
                <select
                  value={sortParam}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="rounded-full border border-stone-200 bg-white px-4 py-2 text-xs font-semibold text-stone-700 focus:border-[#E0A99E] focus:outline-none focus:ring-1 focus:ring-[#E0A99E] cursor-pointer"
                >
                  <option value="newest">Newest</option>
                  <option value="relevance">Relevance</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="highest-rated">Highest Rated</option>
                </select>
              </div>
            </div>

            {/* Product grid */}
            {isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                {Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
                  <div key={i} className="animate-pulse rounded-2xl bg-stone-100 aspect-[3/4]" />
                ))}
              </div>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    name={product.name}
                    price={product.price}
                    imageSrc={product.imageSrc}
                    discountPercent={product.discountPercent}
                    rating={product.rating}
                    reviewCount={product.reviewCount}
                    category={product.category}
                    brand={product.brand}
                    description={product.description}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-3xl border border-stone-200/50 bg-white p-12 text-center shadow-sm">
                <h3 className="text-lg font-bold text-stone-800">No products matched</h3>
                <p className="mt-2 text-sm text-stone-500 font-light max-w-sm mx-auto leading-relaxed">
                  We couldn&apos;t find any items matching &ldquo;{rawQuery}&rdquo;.
                  Try a different search term or clear your filters.
                </p>
                <button
                  onClick={handleClearAll}
                  className="mt-6 rounded-full bg-[#E0A99E] px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#D4988D] transition-colors shadow-sm cursor-pointer"
                >
                  Clear Filters
                </button>
              </div>
            )}

            {/* Pagination */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        </div>

      {/* Mobile Sticky Filter Button */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 lg:hidden pointer-events-none">
        <button
          onClick={() => setIsMobileFilterOpen(true)}
          className="pointer-events-auto bg-stone-900 text-white px-8 py-3.5 rounded-full shadow-xl shadow-stone-900/20 font-bold text-xs uppercase tracking-widest flex items-center gap-2.5 transition-transform active:scale-95 cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
          Filters
        </button>
      </div>

      <MobileFilterDrawer
        isOpen={isMobileFilterOpen}
        onClose={() => setIsMobileFilterOpen(false)}
        facetGroups={facets}
        selectedFilters={activeFilters}
        onFilterChange={handleFilterChange}
        priceRange={priceRange}
        setPriceRange={(val) => {
          const params = new URLSearchParams(searchParams.toString());
          params.set("priceMax", String(val));
          params.set("page", "1");
          router.push(`?${params.toString()}`, { scroll: false });
        }}
        onClear={handleClearAll}
          />
        </>
      )}
    </div>
  );
}

// ─── Page export ──────────────────────────────────────────────────────────────

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center py-24">
        <p className="text-stone-500 animate-pulse">Loading search…</p>
      </div>
    }>
      <SearchResults />
    </Suspense>
  );
}

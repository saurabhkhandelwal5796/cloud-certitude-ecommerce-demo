// @ts-nocheck
"use client";

/**
 * CollectionTemplate – Phase 4B (Server-Side Filtering)
 *
 * Product fetching now delegates entirely to the `filter_products` PostgreSQL RPC
 * via ProductFilterService. The browser no longer downloads the full catalogue.
 *
 * What changed (Phase 4B):
 *   - Removed: AdminService.getVisibleProducts() + client-side JS filter/sort/page logic.
 *   - Added: single getFilteredProducts() call that re-fetches on filter/sort/page change.
 *   - Preserved: all JSX, URL params, DynamicFilterSidebar, ProductCard, Pagination,
 *                Quick View modal, search input, loading states, skeleton UX.
 *
 * What did NOT change:
 *   - Cart / Checkout / Orders / Inventory / Variants / Search / DynamicFilterSidebar
 */

import React, { useState, useEffect, useCallback, useMemo } from "react";
import HeroBanner from "./HeroBanner";
import ProductCard from "./ProductCard";
import Pagination from "./Pagination";
import ProductQuickViewModal from "./ProductQuickViewModal";
import DynamicFilterSidebar, { Facet } from "./DynamicFilterSidebar";
import { useSearchParams, useRouter } from "next/navigation";

interface ProductType {
  id: string;
  variantId?: string;
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

interface CollectionTemplateProps {
  title: string;
  description: string;
  imageSrc: string;
  categoryFilter: "Men" | "Women" | "Kids" | "New Arrival" | "Sale" | "Accessories" | "Footwear" | "All";
  subcategoryFilter?: string;
}

const ITEMS_PER_PAGE = 8;

/**
 * CollectionTemplate Component
 *
 * Shared client wrapper for category grids (/men, /women, /kids, /new-arrivals, /sale).
 * Orchestrates:
 *   - Sidebar attribute filters (dynamic EAV + Brand + Price Range)
 *   - Sort selectors (price-asc, price-desc, rating, etc.)
 *   - Pagination indexing
 *   - Quick view product modal detail states
 *   - URL param sync (for shareable filtered URLs)
 *
 * Phase 4B: Filtering, sorting, and pagination delegated to DB via filter_products RPC.
 */
export default function CollectionTemplate({
  title,
  description,
  imageSrc,
  categoryFilter,
  subcategoryFilter,
}: CollectionTemplateProps) {
  // ─── Product state (now DB-filtered, not downloaded in bulk) ─────────────────
  const [products, setProducts] = useState<ProductType[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // ─── Facets (sidebar attribute groups) ───────────────────────────────────────
  const [facets, setFacets] = useState<Facet[]>([]);


  // ─── Controls ────────────────────────────────────────────────────────────────
  const [priceRange, setPriceRange] = useState<number>(15000);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortOption, setSortOption] = useState<string>("newest");
  const [currentPage, setCurrentPage] = useState<number>(1);

  // ─── Quick View Modal ─────────────────────────────────────────────────────────
  const [quickViewProduct, setQuickViewProduct] = useState<ProductType | null>(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState<boolean>(false);

  const searchParams = useSearchParams();
  const router = useRouter();
  const brandParam = searchParams.get("brand");

  // ─── 1. Load facets once per category ────────────────────────────────────────
  useEffect(() => {
    const loadFacets = async () => {
      try {
        const { getCategoryFacets } = await import("@/services/FacetService");
        const data = await getCategoryFacets(categoryFilter);
        const facetArray: Facet[] = Object.entries(data || {}).map(([attrName, values]) => ({
          attributeName: attrName,
          type: attrName.toLowerCase() === "brand" ? "brand" : "multi-select",
          values: (values || []).map((val, idx) => ({
            id: `${attrName}-${idx}`,
            label: val,
            count: 0
          }))
        }));
        setFacets(facetArray);
      } catch (err) {
        console.error("Failed to load facets:", err);
        setFacets([]);
      }
    };
    loadFacets();
  }, [categoryFilter]);

  // ─── 2. Derive active filters from URL (Single Source of Truth) ─────────────
  const activeFilters = useMemo(() => {
    const filters: Record<string, string[]> = {};
    searchParams.forEach((val, key) => {
      if (key !== "q" && key !== "sort" && key !== "page") {
        if (!filters[key]) filters[key] = [];
        filters[key].push(val);
      }
    });
    if (brandParam && !filters["Brand"]) {
      filters["Brand"] = [brandParam];
    }
    return filters;
  }, [searchParams, brandParam]);

  // ─── 3. Fetch products from DB whenever filters/sort/page changes ─────────────
  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const { getFilteredProducts, validateFilters } = await import(
        "@/services/ProductFilterService"
      );

      // Merge selectedFilters with price and resolve category
      const cleanFilters = validateFilters(activeFilters);

      // Resolve category — for Sale/New Arrival, pass 'All' and rely on product tags
      // (the DB column 'category' only holds: Men/Women/Kids/Accessories/Footwear)
      const dbCategory =
        categoryFilter === "New Arrival" || categoryFilter === "Sale"
          ? "All"
          : categoryFilter;

      const data = await getFilteredProducts({
        category: dbCategory,
        subcategoryName: subcategoryFilter,
        filters: cleanFilters,
        priceMax: priceRange,
        sort: categoryFilter === "New Arrival" ? "newest" : sortOption,
        limit: ITEMS_PER_PAGE,
        offset: (currentPage - 1) * ITEMS_PER_PAGE,
      });

      // For Sale: filter strictly for minimum 50% discount (no fallback to lesser discounts)
      let result = data as ProductType[];
      if (categoryFilter === "Sale") {
        result = result.filter(
          (p) => p.discountPercent !== undefined && Number(p.discountPercent) >= 50
        );
      }
      // Apply in-page search query (lightweight: only on the returned page of results)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        result = result.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.category.toLowerCase().includes(q)
        );
      }

      setProducts(result);
      // Total count: use length of result on this page to estimate pagination.
      // If result fills the page, there may be more; if less, this is the last page.
      setTotalCount((currentPage - 1) * ITEMS_PER_PAGE + result.length);
    } catch (err) {
      console.error("[CollectionTemplate] Failed to load products:", err);
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  }, [categoryFilter, activeFilters, priceRange, sortOption, currentPage, searchQuery]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // ─── Handlers ─────────────────────────────────────────────────────────────────
  const handleFilterChange = (attributeName: string, valueLabel: string) => {
    const current = activeFilters[attributeName] || [];
    const updated = current.includes(valueLabel)
      ? current.filter((v) => v !== valueLabel)
      : [...current, valueLabel];

    const newFilters = { ...activeFilters, [attributeName]: updated };
    if (updated.length === 0) delete newFilters[attributeName];

    // Update URL (shareable filter links)
    const params = new URLSearchParams(searchParams.toString());
    params.delete(attributeName);
    if (newFilters[attributeName]) {
      newFilters[attributeName].forEach((val) =>
        params.append(attributeName, val)
      );
    }
    router.push(`?${params.toString()}`, { scroll: false });
    setCurrentPage(1);
  };

  const handleClearAll = () => {

    setPriceRange(15000);
    setSearchQuery("");
    setCurrentPage(1);
    router.push("?", { scroll: false });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleOpenQuickView = (product: ProductType) => {
    setQuickViewProduct(product);
    setIsQuickViewOpen(true);
  };

  const handleCloseQuickView = () => {
    setIsQuickViewOpen(false);
    setQuickViewProduct(null);
  };

  // ─── Pagination (server-driven) ────────────────────────────────────────────────
  // We infer whether there is a next page by whether the current page returned
  // a full complement of ITEMS_PER_PAGE products.
  const hasNextPage = products.length === ITEMS_PER_PAGE;
  const totalPages = hasNextPage ? currentPage + 1 : currentPage;

  // ─── JSX ──────────────────────────────────────────────────────────────────────
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 bg-[#FAF9F6]">
      {/* 1. Hero banner */}
      <HeroBanner title={title} description={description} imageSrc={imageSrc} />

      {/* Main Grid: Filters Sidebar + Catalog */}
      <div className="mt-12 flex flex-col lg:flex-row gap-8 items-start">
        {/* Dynamic Filter Sidebar (takes 1/4 of desktop width) */}
        <div className="w-full lg:w-1/4 lg:sticky lg:top-24">
          <DynamicFilterSidebar
            facets={facets}
            selectedFilters={activeFilters}
            onFilterChange={handleFilterChange}
            priceRange={priceRange}
            setPriceRange={setPriceRange}
            onClear={handleClearAll}
          />
        </div>

        {/* Product Catalog list (takes 3/4 of desktop width) */}
        <div className="w-full lg:w-3/4">
          {/* Controls Bar: Search & Sort Option */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-stone-200/50 pb-6 mb-8">
            {/* Search Input */}
            <div className="relative w-full sm:max-w-xs text-left">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search within page..."
                className="w-full rounded-full border border-stone-200 bg-white pl-4 pr-10 py-2.5 text-xs text-stone-850 placeholder-stone-400 shadow-sm focus:border-[#E0A99E] focus:outline-none focus:ring-1 focus:ring-[#E0A99E]"
              />
              <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-stone-400">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
            </div>

            {/* Sorting Selection Dropdown */}
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <span className="text-xs text-stone-500 font-bold uppercase tracking-wider">Sort By:</span>
              <select
                value={sortOption}
                onChange={(e) => {
                  setSortOption(e.target.value);
                  setCurrentPage(1);
                }}
                className="rounded-full border border-stone-200 bg-white px-4 py-2 text-xs font-semibold text-stone-700 focus:border-[#E0A99E] focus:outline-none focus:ring-1 focus:ring-[#E0A99E] cursor-pointer"
              >
                <option value="newest">Newest</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="best-selling">Best Selling</option>
                <option value="highest-rated">Highest Rated</option>
              </select>
            </div>
          </div>

          {/* Results Summary */}
          <div className="text-left text-xs text-stone-400 uppercase tracking-widest font-bold mb-6">
            {isLoading
              ? "Loading products..."
              : `Showing ${products.length} ${products.length === 1 ? "Product" : "Products"}`
            }
          </div>

          {/* Products Grid */}
          {isLoading ? (
            // Skeleton loading state — preserves existing layout feel
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
              {Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
                <div
                  key={i}
                  className="animate-pulse rounded-2xl bg-stone-100 aspect-[3/4]"
                />
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  variantId={product.variantId}
                  name={product.name}
                  price={product.price}
                  imageSrc={product.imageSrc}
                  discountPercent={product.discountPercent}
                  rating={product.rating}
                  reviewCount={product.reviewCount}
                  category={product.category}
                  brand={product.brand}
                  description={product.description}
                  onQuickView={handleOpenQuickView}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-stone-200/50 bg-white p-12 text-center shadow-sm">
              <h3 className="text-lg font-bold text-stone-800">No products matched</h3>
              <p className="mt-2 text-sm text-stone-500 font-light max-w-sm mx-auto leading-relaxed">
                We couldn&apos;t find any items matching your current filters or search terms. Try clearing parameters.
              </p>
              <button
                onClick={handleClearAll}
                className="mt-6 rounded-full bg-[#E0A99E] px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#D4988D] transition-colors shadow-sm cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          )}

          {/* Pagination bar */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      </div>

      {/* Modal dialog for Quick View */}
      <ProductQuickViewModal
        product={quickViewProduct}
        isOpen={isQuickViewOpen}
        onClose={handleCloseQuickView}
      />
    </div>
  );
}

"use client";

/**
 * NodeCollectionTemplate
 *
 * The collection page client component for the new navigation_nodes architecture.
 * Powers all pages served by app/[...navpath]/page.tsx.
 *
 * Key differences from legacy CollectionTemplate:
 *  - Accepts navNodeId (UUID) instead of hardcoded categoryFilter string
 *  - Calls getFilteredProductsByNode() → filter_products_by_node RPC
 *  - Calls getNodeFacets() → get_node_facets RPC (rich metadata + counts)
 *  - Renders new DynamicFilterSidebar with facetGroups prop
 *  - All URL persistence unchanged (useSearchParams pattern)
 *
 * NOT modifying: Cart, Checkout, Orders, Inventory, Wishlist.
 */

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import ProductCard from "./ProductCard";
import Pagination from "./Pagination";
import ProductQuickViewModal from "./ProductQuickViewModal";
import DynamicFilterSidebar from "./DynamicFilterSidebar";
import MobileFilterDrawer from "./MobileFilterDrawer";
import type { NodeFacetGroup } from "@/services/FacetService";
import type { NavNode } from "@/services/NavigationService";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ProductType {
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

interface NodeCollectionTemplateProps {
  node: NavNode;
  isTopLevelCategory?: boolean;
  childCategories?: NavNode[];
}

const ITEMS_PER_PAGE = 8;

// ─── Component ────────────────────────────────────────────────────────────────

export default function NodeCollectionTemplate({ node, isTopLevelCategory, childCategories }: NodeCollectionTemplateProps) {
  // ─── Product state ────────────────────────────────────────────────────────
  const [products, setProducts] = useState<ProductType[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const [facetGroups, setFacetGroups] = useState<NodeFacetGroup[]>([]);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // ─── Controls ─────────────────────────────────────────────────────────────
  const [priceRange, setPriceRange] = useState(15000);
  const [sortOption, setSortOption] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);

  // ─── Quick View ───────────────────────────────────────────────────────────
  const [quickViewProduct, setQuickViewProduct] = useState<ProductType | null>(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

  const searchParams = useSearchParams();
  const router = useRouter();

  // ─── 1. Load facets once per node ─────────────────────────────────────────
  useEffect(() => {
    const loadFacets = async () => {
      try {
        const { getNodeFacets } = await import("@/services/FacetService");
        const groups = await getNodeFacets(node.id);
        setFacetGroups(groups);
      } catch (err) {
        console.error("[NodeCollectionTemplate] Failed to load facets:", err);
      }
    };
    loadFacets();
  }, [node.id]);

  // ─── 2. Derive active filters from URL (Single Source of Truth) ───────────
  const activeFilters = useMemo(() => {
    const filters: Record<string, string[]> = {};
    searchParams.forEach((val, key) => {
      if (key !== "sort" && key !== "page" && key !== "priceMax") {
        if (!filters[key]) filters[key] = [];
        filters[key].push(val);
      }
    });
    return filters;
  }, [searchParams]);

  // ─── 3. Sync sort/page from URL ───────────────────────────────────────────
  useEffect(() => {
    const sort = searchParams.get("sort");
    const page = searchParams.get("page");
    if (sort) setSortOption(sort);
    if (page) setCurrentPage(Number(page));
  }, [searchParams]);

  // ─── 4. Fetch products whenever filters/sort/page change ──────────────────
  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const { getFilteredProductsByNode, validateFilters } = await import(
        "@/services/ProductFilterService"
      );
      const cleanFilters = validateFilters(activeFilters);
      const result = await getFilteredProductsByNode({
        navNodeId: node.id,
        filters: cleanFilters,
        priceMax: priceRange,
        sort: sortOption,
        limit: ITEMS_PER_PAGE,
        offset: (currentPage - 1) * ITEMS_PER_PAGE,
      });
      setProducts(result.products as ProductType[]);
      setTotalCount(result.totalCount);
    } catch (err) {
      console.error("[NodeCollectionTemplate] Failed to load products:", err);
      setProducts([]);
      setTotalCount(0);
    } finally {
      setIsLoading(false);
    }
  }, [node.id, activeFilters, priceRange, sortOption, currentPage]);

  useEffect(() => {
    if (isTopLevelCategory && childCategories && childCategories.length > 0) {
      setIsLoading(false); // Skip fetching products
      return;
    }
    fetchProducts();
  }, [fetchProducts, isTopLevelCategory, childCategories]);

  // ─── Handlers ─────────────────────────────────────────────────────────────
  const handleFilterChange = (attributeName: string, valueLabel: string) => {
    const current = activeFilters[attributeName] ?? [];
    const updated = current.includes(valueLabel)
      ? current.filter((v) => v !== valueLabel)
      : [...current, valueLabel];

    const newFilters = { ...activeFilters, [attributeName]: updated };
    if (updated.length === 0) delete newFilters[attributeName];

    const params = new URLSearchParams();
    for (const [key, vals] of Object.entries(newFilters)) {
      vals.forEach((v) => params.append(key, v));
    }
    router.push(`?${params.toString()}`, { scroll: false });
    setCurrentPage(1);
  };

  const handleClearAll = () => {
    setPriceRange(15000);
    setCurrentPage(1);
    router.push("?", { scroll: false });
  };

  const handleSortChange = (sort: string) => {
    setSortOption(sort);
    setCurrentPage(1);
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", sort);
    params.delete("page");
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    router.push(`?${params.toString()}`, { scroll: false });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const totalPages = Math.max(1, Math.ceil(totalCount / ITEMS_PER_PAGE));

  // ─── Render ───────────────────────────────────────────────────────────────
  // ─── 5. Top-Level Category Selection View ─────────────────────────────────
  if (isTopLevelCategory && childCategories && childCategories.length > 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center animate-fade-in">
        <h1 className="text-3xl font-black uppercase tracking-widest text-stone-900 mb-4">{node.name}</h1>
        <p className="text-sm font-medium text-stone-500 mb-12">Please select a category to continue shopping.</p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 text-left">
          {childCategories.map((child) => (
            <div key={child.id} className="group flex flex-col bg-white border border-stone-200/60 rounded-2xl overflow-hidden hover:shadow-xl hover:border-[#E0A99E] transition-all cursor-pointer" onClick={() => router.push(`/${child.fullPath}`)}>
              <div className="p-6 pb-4">
                <div className="flex items-center gap-3 mb-2">
                  {child.icon && <span className="text-2xl opacity-80 group-hover:opacity-100 transition-opacity">{child.icon}</span>}
                  <h3 className="text-lg font-black tracking-widest uppercase text-stone-850 group-hover:text-[#C68B7D] transition-colors">{child.name}</h3>
                </div>
                {child.children && child.children.length > 0 && (
                  <ul className="mt-4 space-y-2">
                    {child.children.slice(0, 4).map((subChild) => (
                      <li key={subChild.id} className="text-xs font-medium text-stone-500 hover:text-stone-900 transition-colors">
                        <a href={`/${subChild.fullPath}`} onClick={(e) => { e.stopPropagation(); router.push(`/${subChild.fullPath}`); }} className="block">
                          {subChild.name}
                        </a>
                      </li>
                    ))}
                    {child.children.length > 4 && (
                      <li className="text-xs font-bold text-[#E0A99E] mt-2">
                        + {child.children.length - 4} more
                      </li>
                    )}
                  </ul>
                )}
              </div>
              <div className="mt-auto bg-stone-50 border-t border-stone-100 p-4 flex justify-between items-center group-hover:bg-[#E0A99E]/5 transition-colors">
                <span className="text-[10px] font-black uppercase tracking-widest text-stone-400 group-hover:text-[#C68B7D]">Shop {child.name}</span>
                <svg className="w-4 h-4 text-stone-300 group-hover:text-[#E0A99E] transition-colors transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ─── 6. Standard Product Listing View ─────────────────────────────────────
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 bg-[#FAF9F6]">
      {/* Hero strip */}
      <div className="rounded-2xl bg-gradient-to-r from-stone-800 to-stone-700 px-6 py-10 mb-8 text-white">
        <h1 className="text-3xl font-bold tracking-tight">{node.name}</h1>
        <p className="mt-1 text-stone-300 text-sm font-light">
          {totalCount > 0 ? `${totalCount.toLocaleString()} products` : "Explore our collection"}
        </p>
      </div>

      {/* Main layout */}
      <div className="flex flex-col lg:flex-row gap-8 items-start relative pb-20 lg:pb-0">
        {/* Desktop Filter sidebar */}
        <div className="hidden lg:block lg:w-1/4 lg:sticky lg:top-24">
          <DynamicFilterSidebar
            facetGroups={facetGroups}
            selectedFilters={activeFilters}
            onFilterChange={handleFilterChange}
            priceRange={priceRange}
            setPriceRange={setPriceRange}
            onClear={handleClearAll}
          />
        </div>

        {/* Product grid */}
        <div className="w-full lg:w-3/4">
          {/* Controls bar */}
          <div className="flex items-center justify-between gap-4 border-b border-stone-200/50 pb-5 mb-6">
            <span className="text-xs text-stone-400 uppercase tracking-widest font-bold">
              {isLoading
                ? "Loading..."
                : `${totalCount.toLocaleString()} ${totalCount === 1 ? "Product" : "Products"}`}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-stone-500 font-bold uppercase tracking-wider">Sort:</span>
              <select
                value={sortOption}
                onChange={(e) => handleSortChange(e.target.value)}
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

          {/* Products */}
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
                  onQuickView={(p) => {
                    setQuickViewProduct(p as ProductType);
                    setIsQuickViewOpen(true);
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-stone-200/50 bg-white p-12 text-center shadow-sm">
              <h3 className="text-lg font-bold text-stone-800">No products found</h3>
              <p className="mt-2 text-sm text-stone-500 font-light max-w-sm mx-auto leading-relaxed">
                No items match your current filters. Try adjusting or clearing them.
              </p>
              <button
                onClick={handleClearAll}
                className="mt-6 rounded-full bg-[#E0A99E] px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#D4988D] transition-colors shadow-sm cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          )}

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
        facetGroups={facetGroups}
        selectedFilters={activeFilters}
        onFilterChange={handleFilterChange}
        priceRange={priceRange}
        setPriceRange={setPriceRange}
        onClear={handleClearAll}
      />

      <ProductQuickViewModal
        product={quickViewProduct}
        isOpen={isQuickViewOpen}
        onClose={() => {
          setIsQuickViewOpen(false);
          setQuickViewProduct(null);
        }}
      />
    </div>
  );
}

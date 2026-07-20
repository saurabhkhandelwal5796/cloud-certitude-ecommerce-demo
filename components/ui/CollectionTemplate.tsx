"use client";

import React, { useState, useEffect, useMemo } from "react";
import HeroBanner from "./HeroBanner";
import FilterSidebar from "./FilterSidebar";
import ProductCard from "./ProductCard";
import Pagination from "./Pagination";
import ProductQuickViewModal from "./ProductQuickViewModal";

interface ProductType {
  id: string;
  name: string;
  price: number;
  imageSrc: string;
  discountPercent?: number;
  rating: number;
  reviewCount?: number;
  category: string;
  brand?: string;
  color?: string;
  size?: string[]; // E.g. ["S", "M", "L"]
  description?: string;
}

interface CollectionTemplateProps {
  title: string;
  description: string;
  imageSrc: string;
  categoryFilter: "Men" | "Women" | "Kids" | "New Arrival" | "Sale" | "Accessories" | "Footwear" | "All";
}

const ITEMS_PER_PAGE = 8;

/**
 * CollectionTemplate Component
 *
 * Shared client wrapper for category grids (/men, /women, /kids, /new-arrivals, /sale).
 * Orchestrates local client-side state for:
 *   - Search input filtering
 *   - Sidebar attribute filters (size, color, brand, price range)
 *   - Sort selectors (price-asc, price-desc, rating, etc.)
 *   - Pagination indexing
 *   - Quick view product modal detail states
 */
export default function CollectionTemplate({
  title,
  description,
  imageSrc,
  categoryFilter,
}: CollectionTemplateProps) {
  // Dynamic products to pull updated ratings and review counts from catalog storage
  const [dynamicProducts, setDynamicProducts] = useState<ProductType[]>([]);

  useEffect(() => {
    const loadDynamicProducts = async () => {
      try {
        const { getProducts } = await import("@/services/AdminService");
        const list = await getProducts();
        
        let filteredList = list;
        if (categoryFilter === "Men" || categoryFilter === "Women" || categoryFilter === "Kids" || categoryFilter === "Accessories" || categoryFilter === "Footwear") {
          filteredList = list.filter((p) => p.category === categoryFilter);
        } else if (categoryFilter === "New Arrival") {
          filteredList = list.filter((p) => p.tags?.includes("New Arrival") || p.id.startsWith("new") || p.id.startsWith("na"));
        } else if (categoryFilter === "Sale") {
          filteredList = list.filter((p) => (p.discountPercent !== undefined && p.discountPercent > 0) || p.tags?.includes("Sale"));
        }
        
        const mapped = filteredList.map((p) => ({
          id: p.id,
          name: p.name,
          price: p.price,
          imageSrc: p.imageSrc,
          discountPercent: p.discountPercent,
          rating: p.rating || 4.5,
          reviewCount: p.reviewCount || 0,
          category: p.category,
          brand: p.brand,
          description: p.description,
          color: p.color?.[0] || "Beige",
          size: p.size,
        }));
        
        setDynamicProducts(mapped);
      } catch (err) {
        console.error("Failed to load products in CollectionTemplate:", err);
      }
    };
    loadDynamicProducts();
  }, [categoryFilter]);

  // Filters & State
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<number>(10000);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortOption, setSortOption] = useState<string>("newest");
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Quick View Modal State
  const [quickViewProduct, setQuickViewProduct] = useState<ProductType | null>(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState<boolean>(false);

  const handleClearAll = () => {
    setSelectedSizes([]);
    setSelectedColors([]);
    setSelectedBrands([]);
    setPriceRange(10000);
    setSearchQuery("");
    setCurrentPage(1);
  };

  // Filtered & Sorted Products
  const processedProducts = useMemo(() => {
    let result = [...dynamicProducts];

    // 1. Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
      );
    }

    // 2. Size Filter
    if (selectedSizes.length > 0) {
      result = result.filter((p) =>
        p.size ? p.size.some((s) => selectedSizes.includes(s)) : false
      );
    }

    // 3. Color Filter
    if (selectedColors.length > 0) {
      result = result.filter((p) => (p.color ? selectedColors.includes(p.color) : false));
    }

    // 4. Brand Filter
    if (selectedBrands.length > 0) {
      result = result.filter((p) => (p.brand ? selectedBrands.includes(p.brand) : false));
    }

    // 5. Price range (check discounted price if discount exists)
    result = result.filter((p) => {
      const disc = p.discountPercent ? p.price * (1 - p.discountPercent / 100) : p.price;
      return disc <= priceRange;
    });

    // 6. Sorting options
    if (sortOption === "price-asc") {
      result.sort((a, b) => {
        const pA = a.discountPercent ? a.price * (1 - a.discountPercent / 100) : a.price;
        const pB = b.discountPercent ? b.price * (1 - b.discountPercent / 100) : b.price;
        return pA - pB;
      });
    } else if (sortOption === "price-desc") {
      result.sort((a, b) => {
        const pA = a.discountPercent ? a.price * (1 - a.discountPercent / 100) : a.price;
        const pB = b.discountPercent ? b.price * (1 - b.discountPercent / 100) : b.price;
        return pB - pA;
      });
    } else if (sortOption === "highest-rated") {
      result.sort((a, b) => b.rating - a.rating);
    } else if (sortOption === "best-selling") {
      result.reverse();
    }

    return result;
  }, [dynamicProducts, searchQuery, selectedSizes, selectedColors, selectedBrands, priceRange, sortOption]);

  // Paginated Products
  const totalPages = Math.ceil(processedProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = useMemo(() => {
    const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
    return processedProducts.slice(startIdx, startIdx + ITEMS_PER_PAGE);
  }, [processedProducts, currentPage]);

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

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 bg-[#FAF9F6]">
      {/* 1. Hero banner */}
      <HeroBanner title={title} description={description} imageSrc={imageSrc} />

      {/* Main Grid: Filters Sidebar + Catalog */}
      <div className="mt-12 flex flex-col lg:flex-row gap-8 items-start">
        {/* Sidebar: Filters (takes 1/4 of desktop width) */}
        <div className="w-full lg:w-1/4 lg:sticky lg:top-24">
          <FilterSidebar
            selectedSizes={selectedSizes}
            setSelectedSizes={setSelectedSizes}
            selectedColors={selectedColors}
            setSelectedColors={setSelectedColors}
            selectedBrands={selectedBrands}
            setSelectedBrands={setSelectedBrands}
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
                  setCurrentPage(1); // reset to first page on search
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
            Showing {processedProducts.length} {processedProducts.length === 1 ? "Product" : "Products"}
          </div>

          {/* Products Grid */}
          {paginatedProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
              {paginatedProducts.map((product) => (
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

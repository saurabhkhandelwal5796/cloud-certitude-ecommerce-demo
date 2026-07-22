/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { getProducts, AdminProduct } from "@/services/AdminService";
import { getReviews, deleteReview, ProductReview } from "@/services/ReviewService";
import ReviewTable from "@/components/ui/ReviewTable";

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRating, setFilterRating] = useState<string>("all");
  const [filterProduct, setFilterProduct] = useState<string>("all");
  const [filterReported, setFilterReported] = useState<string>("all");
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      const allReviews = await getReviews();
      const allProducts = await getProducts();
      setReviews(allReviews);
      setProducts(allProducts);
    } catch (err) {
      console.error("[AdminReviews] Error loading reviews data:", err);
      setError("Unable to load data from server.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (error) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="text-rose-500 font-bold uppercase tracking-wider text-sm border border-rose-200 bg-rose-50/50 px-6 py-4 rounded-3xl">
          ⚠️ {error}
        </div>
      </div>
    );
  }

  // Product ID to Product Name mapping
  const productNames: Record<string, string> = {};
  products.forEach((p) => {
    productNames[p.id] = p.name;
  });

  const handleDeleteReview = async (reviewId: string) => {
    try {
      await deleteReview(reviewId);
      await loadData();
    } catch (err) {
      console.error("[AdminReviews] Delete error:", err);
    }
  };

  // Filtered reviews
  const getFilteredReviews = () => {
    return reviews.filter((r) => {
      const productName = productNames[r.productId] || "";
      const matchesSearch =
        r.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.customerEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.reviewText.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.productId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        productName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesRating =
        filterRating === "all" || r.rating.toString() === filterRating;

      const matchesProduct =
        filterProduct === "all" || r.productId === filterProduct;

      const matchesReported =
        filterReported === "all" ||
        (filterReported === "reported" && r.reported) ||
        (filterReported === "clean" && !r.reported);

      return matchesSearch && matchesRating && matchesProduct && matchesReported;
    });
  };

  const filteredReviewsList = getFilteredReviews();

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex items-center gap-2.5 text-stone-500 font-light text-sm">
          <svg className="h-5 w-5 animate-spin text-[#E0A99E]" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Loading Product Reviews...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 text-left">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-wider uppercase">
            Product Reviews
          </h1>
          <p className="mt-1 text-xs text-stone-400 font-light uppercase tracking-widest">
            Moderate, filter, and inspect customer feedback across products.
          </p>
        </div>
      </div>

      {/* Filters card */}
      <div className="rounded-3xl border border-stone-200/50 bg-white p-5 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="space-y-1 text-left">
            <label htmlFor="search-input" className="text-[9px] font-extrabold uppercase tracking-widest text-stone-400">
              Search Reviews
            </label>
            <input
              id="search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search customer, text, product..."
              className="w-full rounded-2xl border border-stone-200/60 bg-[#FAF9F6] px-4 py-2.5 text-xs font-bold text-stone-850 placeholder-stone-400 focus:outline-none focus:border-stone-300"
            />
          </div>

          {/* Rating filter */}
          <div className="space-y-1 text-left">
            <label htmlFor="rating-filter" className="text-[9px] font-extrabold uppercase tracking-widest text-stone-400">
              Rating
            </label>
            <select
              id="rating-filter"
              value={filterRating}
              onChange={(e) => setFilterRating(e.target.value)}
              className="w-full rounded-2xl border border-stone-200/60 bg-[#FAF9F6] px-4 py-2.5 text-xs font-bold text-stone-850 focus:outline-none focus:border-stone-300 cursor-pointer"
            >
              <option value="all">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
          </div>

          {/* Product filter */}
          <div className="space-y-1 text-left">
            <label htmlFor="product-filter" className="text-[9px] font-extrabold uppercase tracking-widest text-stone-400">
              Product
            </label>
            <select
              id="product-filter"
              value={filterProduct}
              onChange={(e) => setFilterProduct(e.target.value)}
              className="w-full rounded-2xl border border-stone-200/60 bg-[#FAF9F6] px-4 py-2.5 text-xs font-bold text-stone-850 focus:outline-none focus:border-stone-300 cursor-pointer"
            >
              <option value="all">All Products</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Reported filter */}
          <div className="space-y-1 text-left">
            <label htmlFor="reported-filter" className="text-[9px] font-extrabold uppercase tracking-widest text-stone-400">
              Flagged status
            </label>
            <select
              id="reported-filter"
              value={filterReported}
              onChange={(e) => setFilterReported(e.target.value)}
              className="w-full rounded-2xl border border-stone-200/60 bg-[#FAF9F6] px-4 py-2.5 text-xs font-bold text-stone-850 focus:outline-none focus:border-stone-300 cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="reported">🚩 Reported / Flagged</option>
              <option value="clean">Clean / Approved</option>
            </select>
          </div>
        </div>

        {/* Count summary */}
        <div className="flex items-center justify-between text-[10px] text-stone-400 font-extrabold uppercase tracking-widest border-t border-stone-50 pt-3">
          <span>Showing {filteredReviewsList.length} of {reviews.length} reviews</span>
          {(searchQuery || filterRating !== "all" || filterProduct !== "all" || filterReported !== "all") && (
            <button
              onClick={() => {
                setSearchQuery("");
                setFilterRating("all");
                setFilterProduct("all");
                setFilterReported("all");
              }}
              className="text-[#E0A99E] hover:text-[#C68B7D] cursor-pointer transition-colors"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Reviews Table */}
      <ReviewTable
        reviews={filteredReviewsList}
        productNames={productNames}
        onDelete={handleDeleteReview}
      />
    </div>
  );
}

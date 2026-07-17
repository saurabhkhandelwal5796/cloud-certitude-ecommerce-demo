/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import React, { useState, useEffect, useCallback } from "react";
import RatingBreakdown from "./RatingBreakdown";
import ReviewCard from "./ReviewCard";
import ReviewForm from "./ReviewForm";
import { getSupabaseClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";
import {
  ProductReview,
  getReviewsByProductId,
  submitReview,
  editReview,
  deleteReview,
  voteHelpful,
  reportReview,
  checkHasPurchased,
  checkHasReviewed,
} from "@/services/ReviewService";

interface ProductReviewsProps {
  productId: string;
  initialRating?: number;
  initialReviewCount?: number;
}

type SortOption = "recent" | "highest" | "lowest" | "helpful";

export default function ProductReviews({
  productId,
  initialRating = 0,
  initialReviewCount = 0,
}: ProductReviewsProps) {
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>("recent");
  const [user, setUser] = useState<User | null>(null);
  
  // Status check variables
  const [hasPurchased, setHasPurchased] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<ProductReview | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load reviews and user session state
  const loadData = useCallback(async () => {
    try {
      const list = await getReviewsByProductId(productId);
      setReviews(list);

      const supabase = getSupabaseClient();
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();

      if (currentUser && currentUser.email) {
        setUser(currentUser);
        const purchased = await checkHasPurchased(currentUser.email, productId);
        const reviewed = await checkHasReviewed(currentUser.email, productId);
        setHasPurchased(purchased);
        setHasReviewed(reviewed);
      } else {
        setUser(null);
        setHasPurchased(false);
        setHasReviewed(false);
      }
    } catch (err) {
      console.error("[ProductReviews] Load error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle Sort
  const getSortedReviews = () => {
    const list = [...reviews];
    if (sortBy === "recent") {
      return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }
    if (sortBy === "highest") {
      return list.sort((a, b) => b.rating - a.rating);
    }
    if (sortBy === "lowest") {
      return list.sort((a, b) => a.rating - b.rating);
    }
    if (sortBy === "helpful") {
      return list.sort((a, b) => b.helpfulCount - a.helpfulCount);
    }
    return list;
  };

  const handleReviewSubmit = async (data: { rating: number; title: string; reviewText: string }) => {
    if (!user) return;

    if (editingReview) {
      // Edit mode
      await editReview(editingReview.id, {
        rating: data.rating,
        title: data.title,
        reviewText: data.reviewText,
      });
      setEditingReview(null);
    } else {
      // Create mode
      const rawMeta = user.user_metadata || {};
      const customerEmail = user.email || "anonymous@cloudcertitude.com";
      const customerName = rawMeta.full_name || rawMeta.name || customerEmail.split("@")[0];
      await submitReview({
        productId,
        customerName,
        customerEmail,
        rating: data.rating,
        title: data.title,
        reviewText: data.reviewText,
      });
    }

    setIsFormOpen(false);
    await loadData();
  };

  const handleReviewDelete = async (reviewId: string) => {
    await deleteReview(reviewId);
    await loadData();
  };

  const handleHelpful = async (reviewId: string) => {
    if (!user) return;
    await voteHelpful(reviewId, user.email!);
  };

  const handleReport = async (reviewId: string) => {
    await reportReview(reviewId);
  };

  // Compute breakdown stats dynamically
  const totalReviews = reviews.length;
  const avgRating = totalReviews > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
    : initialRating;

  const distribution: { [key: number]: number } = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach((r) => {
    if (distribution[r.rating] !== undefined) {
      distribution[r.rating] += 1;
    }
  });

  // If there are no reviews, fallback to dynamic initial count distributions
  const finalTotalCount = totalReviews > 0 ? totalReviews : initialReviewCount;
  const finalAvgRating = totalReviews > 0 ? avgRating : initialRating;

  const fallbackDistribution: { [key: number]: number } = {
    5: Math.round(finalTotalCount * 0.70),
    4: Math.round(finalTotalCount * 0.18),
    3: Math.round(finalTotalCount * 0.08),
    2: Math.round(finalTotalCount * 0.03),
    1: Math.round(finalTotalCount * 0.01),
  };

  const currentDistribution = totalReviews > 0 ? distribution : fallbackDistribution;

  const sortedReviewsList = getSortedReviews();

  if (isLoading) {
    return (
      <div className="border-t border-stone-200/50 py-16 text-center text-stone-500 text-xs">
        🔄 Loading customer reviews...
      </div>
    );
  }

  return (
    <div className="border-t border-stone-200/50 py-16" id="product-reviews-section">
      <h2 className="text-xl font-black text-stone-900 tracking-wider uppercase mb-10 text-left">
        Customer Reviews
      </h2>

      <div className="flex flex-col lg:flex-row gap-12 items-start">
        {/* Left: Star stats overview breakdown */}
        <div className="w-full lg:w-1/3 flex flex-col gap-6 text-left">
          <RatingBreakdown
            rating={finalAvgRating}
            totalReviews={finalTotalCount}
            distribution={currentDistribution}
          />

          {/* Verification / Review Submission Options */}
          <div className="p-6 rounded-3xl border border-stone-250 bg-stone-50/50 space-y-4">
            <h4 className="text-xs font-black text-stone-900 uppercase tracking-widest">
              Review this product
            </h4>
            
            {!user ? (
              <p className="text-[11px] text-stone-500 font-light leading-relaxed">
                Please sign in to write a review. Only verified purchasers can review.
              </p>
            ) : !hasPurchased ? (
              <p className="text-[11px] text-stone-500 font-light leading-relaxed">
                🔒 Reviews are restricted to verified purchasers of this item.
              </p>
            ) : hasReviewed && !editingReview ? (
              <p className="text-[11px] text-stone-500 font-light leading-relaxed">
                You have already submitted a review for this product. You can edit your existing review if you want to make changes.
              </p>
            ) : (
              <p className="text-[11px] text-stone-500 font-light leading-relaxed">
                You purchased this item! Share your feedback with other customers.
              </p>
            )}

            {user && hasPurchased && (!hasReviewed || editingReview) && !isFormOpen && (
              <button
                type="button"
                onClick={() => setIsFormOpen(true)}
                className="w-full rounded-full bg-stone-900 py-3 text-[10px] font-black uppercase tracking-widest text-white hover:bg-stone-850 transition-colors shadow-md h-11 flex items-center justify-center cursor-pointer"
              >
                Write a Review
              </button>
            )}
          </div>
        </div>

        {/* Right: Reviews List & Input Form */}
        <div className="w-full lg:w-2/3 flex flex-col gap-8 text-left">
          {/* Write/Edit Review Form container */}
          {isFormOpen && (
            <div className="animate-fadeIn">
              <ReviewForm
                initialRating={editingReview?.rating}
                initialTitle={editingReview?.title}
                initialReviewText={editingReview?.reviewText}
                isEditing={!!editingReview}
                onSubmit={handleReviewSubmit}
                onCancel={() => {
                  setIsFormOpen(false);
                  setEditingReview(null);
                }}
              />
            </div>
          )}

          {/* Sorting panel */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-stone-100 pb-4 gap-3">
            <h3 className="text-xs font-black text-stone-750 uppercase tracking-widest">
              Verified Shopper Reviews ({totalReviews})
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-stone-400">
                Sort by:
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="bg-white border border-stone-200/60 rounded-xl px-2.5 py-1.5 text-[10px] font-extrabold uppercase tracking-widest text-stone-700 focus:outline-none cursor-pointer"
              >
                <option value="recent">Most Recent</option>
                <option value="highest">Highest Rated</option>
                <option value="lowest">Lowest Rated</option>
                <option value="helpful">Most Helpful</option>
              </select>
            </div>
          </div>

          {/* List display */}
          <div className="space-y-8">
            {sortedReviewsList.length > 0 ? (
              sortedReviewsList.map((rev) => (
                <ReviewCard
                  key={rev.id}
                  review={rev}
                  currentUserEmail={user?.email}
                  onEdit={(r) => {
                    setEditingReview(r);
                    setIsFormOpen(true);
                    // scroll to form
                    document.getElementById("product-reviews-section")?.scrollIntoView({ behavior: "smooth" });
                  }}
                  onDelete={handleReviewDelete}
                  onHelpfulClick={handleHelpful}
                  onReportClick={handleReport}
                />
              ))
            ) : (
              <div className="py-12 border border-dashed border-stone-200 rounded-3xl text-center bg-white/50">
                <span className="block text-2xl mb-3">💬</span>
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-stone-700">
                  No Written Reviews Yet
                </h4>
                <p className="mt-1 text-[10px] text-stone-400 font-light uppercase tracking-widest">
                  Be the first verified buyer to share your feedback!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

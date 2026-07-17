"use client";

import React, { useState } from "react";
import RatingStars from "./RatingStars";
import { ProductReview } from "@/services/ReviewService";

interface ReviewCardProps {
  review: ProductReview;
  currentUserEmail?: string;
  onEdit?: (review: ProductReview) => void;
  onDelete?: (reviewId: string) => void;
  onHelpfulClick?: (reviewId: string) => Promise<void>;
  onReportClick?: (reviewId: string) => Promise<void>;
}

export default function ReviewCard({
  review,
  currentUserEmail,
  onEdit,
  onDelete,
  onHelpfulClick,
  onReportClick,
}: ReviewCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [hasReported, setHasReported] = useState(review.reported);
  const [helpfulVotes, setHelpfulVotes] = useState(review.helpfulCount);
  const [isHelpfulActive, setIsHelpfulActive] = useState(
    currentUserEmail ? review.helpfulUserEmails.includes(currentUserEmail.toLowerCase()) : false
  );

  const isOwner = currentUserEmail && review.customerEmail.toLowerCase() === currentUserEmail.toLowerCase();

  const handleHelpful = async () => {
    if (!currentUserEmail) {
      alert("Please sign in to vote reviews as helpful.");
      return;
    }
    if (onHelpfulClick) {
      await onHelpfulClick(review.id);
      if (isHelpfulActive) {
        setHelpfulVotes((prev) => Math.max(0, prev - 1));
        setIsHelpfulActive(false);
      } else {
        setHelpfulVotes((prev) => prev + 1);
        setIsHelpfulActive(true);
      }
    }
  };

  const handleReport = async () => {
    if (hasReported) return;
    if (onReportClick) {
      await onReportClick(review.id);
      setHasReported(true);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete your review? This action cannot be undone.")) {
      setIsDeleting(true);
      if (onDelete) {
        onDelete(review.id);
      }
    }
  };

  return (
    <div className="flex flex-col gap-3 pb-8 border-b border-stone-100 last:border-b-0 text-left transition-all duration-300">
      {/* Top Header: Stars & Verified Badge */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <RatingStars rating={review.rating} size="sm" />
          {review.title && (
            <span className="text-xs font-bold text-stone-900 leading-none">
              {review.title}
            </span>
          )}
        </div>
        
        {review.isVerifiedPurchase && (
          <span className="text-[9px] font-extrabold text-[#E0A99E] uppercase tracking-wider flex items-center gap-1">
            <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Verified Purchase
          </span>
        )}
      </div>

      {/* Customer and Date info */}
      <div className="flex items-center justify-between text-[10px] text-stone-400 font-light uppercase tracking-wider">
        <div className="flex items-center gap-1.5 font-semibold text-stone-700">
          <span>{review.customerName}</span>
          <span>&middot;</span>
          <span className="font-light text-stone-400">{review.date}</span>
        </div>

        {/* Owner actions (Edit / Delete) */}
        {isOwner && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => onEdit && onEdit(review)}
              className="text-[10px] font-extrabold text-stone-500 hover:text-stone-900 cursor-pointer uppercase tracking-widest transition-colors"
            >
              Edit
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="text-[10px] font-extrabold text-rose-400 hover:text-rose-600 cursor-pointer uppercase tracking-widest transition-colors disabled:opacity-50"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        )}
      </div>

      {/* Review Details Text */}
      <p className="text-xs md:text-sm text-stone-600 leading-relaxed font-light mt-1">
        &ldquo;{review.reviewText}&rdquo;
      </p>

      {/* Footer votes & reporting */}
      <div className="flex items-center gap-4 mt-2">
        <button
          type="button"
          onClick={handleHelpful}
          className={`flex items-center gap-1 rounded-full border px-3 py-1 text-[9px] font-extrabold uppercase tracking-widest transition-colors cursor-pointer ${
            isHelpfulActive
              ? "bg-[#E0A99E]/10 border-[#E0A99E]/50 text-[#C68B7D]"
              : "bg-white border-stone-200 text-stone-450 hover:bg-stone-50"
          }`}
        >
          👍 Helpful ({helpfulVotes})
        </button>

        <button
          type="button"
          onClick={handleReport}
          disabled={hasReported}
          className={`text-[9px] font-extrabold uppercase tracking-widest transition-colors cursor-pointer ${
            hasReported
              ? "text-rose-450 opacity-60"
              : "text-stone-400 hover:text-rose-500"
          }`}
        >
          {hasReported ? "🚩 Flagged" : "Report"}
        </button>
      </div>
    </div>
  );
}

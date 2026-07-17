"use client";

import React, { useState } from "react";
import RatingStars from "./RatingStars";

interface ReviewFormProps {
  initialRating?: number;
  initialTitle?: string;
  initialReviewText?: string;
  isEditing?: boolean;
  onSubmit: (data: { rating: number; title: string; reviewText: string }) => Promise<void>;
  onCancel?: () => void;
}

export default function ReviewForm({
  initialRating = 5,
  initialTitle = "",
  initialReviewText = "",
  isEditing = false,
  onSubmit,
  onCancel,
}: ReviewFormProps) {
  const [rating, setRating] = useState(initialRating);
  const [title, setTitle] = useState(initialTitle);
  const [reviewText, setReviewText] = useState(initialReviewText);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (rating < 1 || rating > 5) {
      setErrorMsg("Please select a rating between 1 and 5 stars.");
      return;
    }
    if (!title.trim()) {
      setErrorMsg("Please provide a title for your review.");
      return;
    }
    if (!reviewText.trim()) {
      setErrorMsg("Please write some review details.");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({ rating, title: title.trim(), reviewText: reviewText.trim() });
      if (!isEditing) {
        setTitle("");
        setReviewText("");
        setRating(5);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An error occurred. Please try again.";
      setErrorMsg(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-6 sm:p-8 rounded-3xl border border-stone-250 bg-white shadow-sm space-y-6 text-left"
    >
      <div>
        <h3 className="text-sm font-black text-stone-900 uppercase tracking-widest">
          {isEditing ? "Edit Your Review" : "Write a Product Review"}
        </h3>
        <p className="mt-1 text-[10px] text-stone-400 font-light uppercase tracking-widest">
          Share your experience with other shoppers.
        </p>
      </div>

      {errorMsg && (
        <div className="rounded-2xl bg-rose-50 border border-rose-100 p-4 text-xs font-semibold text-rose-600">
          ⚠️ {errorMsg}
        </div>
      )}

      {/* Rating Selection */}
      <div className="space-y-2">
        <label className="block text-[10px] font-extrabold uppercase tracking-widest text-stone-600">
          Your Rating
        </label>
        <RatingStars
          rating={rating}
          interactive
          size="md"
          onRatingChange={(r) => {
            setRating(r);
            setErrorMsg(null);
          }}
        />
      </div>

      {/* Title */}
      <div className="space-y-2">
        <label htmlFor="review-title" className="block text-[10px] font-extrabold uppercase tracking-widest text-stone-600">
          Review Title
        </label>
        <input
          id="review-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Incredibly soft cashmere, perfect fit!"
          className="w-full rounded-2xl border border-stone-250 bg-[#FAF9F6] px-4 py-3 text-xs font-bold text-stone-850 placeholder-stone-400 transition-colors focus:border-stone-400 focus:outline-none"
        />
      </div>

      {/* Review Text */}
      <div className="space-y-2">
        <label htmlFor="review-details" className="block text-[10px] font-extrabold uppercase tracking-widest text-stone-600">
          Review Details
        </label>
        <textarea
          id="review-details"
          rows={4}
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          placeholder="What did you like or dislike? How does the product fit/feel?"
          className="w-full rounded-2xl border border-stone-250 bg-[#FAF9F6] px-4 py-3 text-xs font-bold text-stone-850 placeholder-stone-400 transition-colors focus:border-stone-400 focus:outline-none resize-y min-h-[80px]"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-grow sm:flex-none px-6 py-3 rounded-full bg-stone-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-stone-850 transition-colors shadow-md h-11 flex items-center justify-center cursor-pointer disabled:opacity-50"
        >
          {isSubmitting ? "Submitting..." : isEditing ? "Save Changes" : "Submit Review"}
        </button>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-6 py-3 rounded-full border border-stone-250 bg-white text-stone-700 text-[10px] font-black uppercase tracking-widest hover:bg-stone-50 transition-colors h-11 flex items-center justify-center cursor-pointer"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

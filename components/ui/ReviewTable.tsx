"use client";

import React from "react";
import RatingStars from "./RatingStars";
import { ProductReview } from "@/services/ReviewService";

interface ReviewTableProps {
  reviews: ProductReview[];
  productNames: Record<string, string>;
  onDelete: (id: string) => void;
}

export default function ReviewTable({
  reviews,
  productNames,
  onDelete,
}: ReviewTableProps) {
  if (reviews.length === 0) {
    return (
      <div className="py-16 text-center border border-dashed border-stone-250 bg-white rounded-3xl">
        <span className="block text-2xl mb-3">💬</span>
        <h4 className="text-xs font-extrabold uppercase tracking-wider text-stone-700">
          No Reviews Found
        </h4>
        <p className="mt-1 text-[10px] text-stone-400 font-light uppercase tracking-widest">
          Adjust your filters or check back later.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-3xl border border-stone-200/50 bg-white shadow-sm">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-stone-100 text-[10px] uppercase font-bold text-stone-400 bg-stone-50/50">
            <th className="p-4 font-extrabold tracking-wider">Product</th>
            <th className="p-4 font-extrabold tracking-wider">Customer</th>
            <th className="p-4 font-extrabold tracking-wider text-center">Rating</th>
            <th className="p-4 font-extrabold tracking-wider">Review Details</th>
            <th className="p-4 font-extrabold tracking-wider text-center">Status</th>
            <th className="p-4 font-extrabold tracking-wider">Date</th>
            <th className="p-4 font-extrabold tracking-wider text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-100 text-xs">
          {reviews.map((rev) => {
            const productName = productNames[rev.productId] || `Product ID: ${rev.productId}`;
            return (
              <tr key={rev.id} className="hover:bg-stone-50/30 transition-colors">
                {/* Product Column */}
                <td className="p-4 align-top font-bold text-stone-850 min-w-[150px]">
                  <span className="block text-xs line-clamp-2">{productName}</span>
                  <span className="block text-[9px] text-[#E0A99E] font-extrabold uppercase tracking-widest mt-0.5">
                    ID: {rev.productId}
                  </span>
                </td>

                {/* Customer Column */}
                <td className="p-4 align-top min-w-[120px]">
                  <span className="block font-bold text-stone-850">{rev.customerName}</span>
                  <span className="block text-[9px] text-stone-400 select-all font-light mt-0.5">
                    {rev.customerEmail}
                  </span>
                </td>

                {/* Rating Column */}
                <td className="p-4 align-top text-center">
                  <div className="flex justify-center">
                    <RatingStars rating={rev.rating} size="xs" />
                  </div>
                  <span className="text-[9px] font-extrabold text-stone-400 mt-1 block">
                    ({rev.rating}/5)
                  </span>
                </td>

                {/* Review Details Column */}
                <td className="p-4 align-top max-w-[280px]">
                  {rev.title && (
                    <span className="block font-extrabold text-stone-850 mb-1">
                      {rev.title}
                    </span>
                  )}
                  <p className="text-stone-600 font-light leading-relaxed line-clamp-3">
                    {rev.reviewText}
                  </p>
                </td>

                {/* Status Column */}
                <td className="p-4 align-top text-center min-w-[100px]">
                  <div className="flex flex-col gap-1 items-center">
                    {rev.reported && (
                      <span className="inline-block px-2 py-0.5 rounded-full bg-rose-50 border border-rose-100 text-[8px] font-black text-rose-500 uppercase tracking-widest">
                        🚩 Reported
                      </span>
                    )}
                    {rev.isVerifiedPurchase ? (
                      <span className="inline-block px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-100 text-[8px] font-black text-emerald-600 uppercase tracking-widest">
                        ✓ Verified
                      </span>
                    ) : (
                      <span className="inline-block px-2 py-0.5 rounded-full bg-stone-50 border border-stone-150 text-[8px] font-extrabold text-stone-400 uppercase tracking-widest">
                        Standard
                      </span>
                    )}
                  </div>
                </td>

                {/* Date Column */}
                <td className="p-4 align-top whitespace-nowrap text-stone-450 uppercase tracking-wider text-[10px]">
                  {rev.date}
                </td>

                {/* Actions Column */}
                <td className="p-4 align-top text-right whitespace-nowrap">
                  <button
                    onClick={() => {
                      if (window.confirm("Are you sure you want to delete this review?")) {
                        onDelete(rev.id);
                      }
                    }}
                    className="px-3 py-1.5 rounded-xl border border-rose-100 bg-rose-50/50 hover:bg-rose-50 hover:border-rose-200 text-rose-500 font-extrabold text-[9px] uppercase tracking-widest transition-all cursor-pointer"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

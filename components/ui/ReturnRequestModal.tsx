"use client";

import React, { useState } from "react";

interface ReturnRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reason: string, comments: string) => Promise<void>;
  orderId: string;
  isSubmitting?: boolean;
}

const REASON_OPTIONS = [
  "Size Issue",
  "Wrong Product Received",
  "Damaged Product",
  "Quality Issue",
  "Changed My Mind",
  "Other",
];

export default function ReturnRequestModal({
  isOpen,
  onClose,
  onSubmit,
  orderId,
  isSubmitting = false,
}: ReturnRequestModalProps) {
  const [reason, setReason] = useState<string>(REASON_OPTIONS[0]);
  const [comments, setComments] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason) {
      setError("Please select a reason for the return request.");
      return;
    }
    setError(null);
    try {
      await onSubmit(reason, comments);
      setComments("");
      onClose();
    } catch (err: any) {
      setError(err?.message || "Failed to submit return request. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl border border-stone-200 shadow-2xl w-full max-w-md overflow-hidden text-left p-6 space-y-5">
        {/* Header */}
        <div className="flex justify-between items-start border-b border-stone-150 pb-4">
          <div>
            <h3 className="text-base font-extrabold text-stone-900 uppercase tracking-wider">
              Request Return
            </h3>
            <p className="text-xs text-stone-500 font-light mt-0.5">
              Order ID: <span className="font-mono font-bold text-stone-800 uppercase">{orderId}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="text-stone-400 hover:text-stone-700 text-lg font-bold transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-600 mb-1.5">
              Reason for Return <span className="text-rose-500">*</span>
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={isSubmitting}
              className="w-full rounded-xl border border-stone-250 bg-stone-50 px-3.5 py-2.5 text-xs text-stone-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#E0A99E]/50 focus:border-[#E0A99E] transition-all cursor-pointer"
            >
              {REASON_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-600 mb-1.5">
              Additional Comments <span className="text-stone-400 font-normal">(Optional)</span>
            </label>
            <textarea
              rows={3}
              maxLength={500}
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              disabled={isSubmitting}
              placeholder="Provide details about why you want to return this item (max 500 characters)..."
              className="w-full rounded-xl border border-stone-250 bg-stone-50 px-3.5 py-2.5 text-xs text-stone-800 font-light focus:outline-none focus:ring-2 focus:ring-[#E0A99E]/50 focus:border-[#E0A99E] transition-all resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-full px-5 py-2 text-xs font-bold uppercase tracking-wider text-stone-500 hover:text-stone-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-full bg-[#E0A99E] px-6 py-2 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#D4988D] transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <svg className="h-3.5 w-3.5 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Submitting...
                </>
              ) : (
                "Submit Return Request"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

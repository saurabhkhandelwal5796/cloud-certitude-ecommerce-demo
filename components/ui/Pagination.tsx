import React from "react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

/**
 * Pagination Component
 *
 * Renders page navigation selectors below collections grids.
 * Displays Previous, Next, and numeric page indicators.
 */
export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <nav className="flex items-center justify-center gap-2 border-t border-stone-200/50 py-8 mt-12">
      {/* Previous Button */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="flex h-9 items-center justify-center rounded-full border border-stone-200 bg-white px-4 text-xs font-bold uppercase tracking-wider text-stone-700 hover:border-stone-400 disabled:opacity-40 transition-colors cursor-pointer"
      >
        Prev
      </button>

      {/* Page Numbers */}
      {Array.from({ length: totalPages }).map((_, idx) => {
        const pageNum = idx + 1;
        const active = pageNum === currentPage;
        return (
          <button
            key={pageNum}
            onClick={() => onPageChange(pageNum)}
            className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold transition-all cursor-pointer ${
              active
                ? "bg-[#E0A99E] text-white"
                : "border border-stone-200 bg-white text-stone-700 hover:border-stone-400"
            }`}
          >
            {pageNum}
          </button>
        );
      })}

      {/* Next Button */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="flex h-9 items-center justify-center rounded-full border border-stone-200 bg-white px-4 text-xs font-bold uppercase tracking-wider text-stone-700 hover:border-stone-400 disabled:opacity-40 transition-colors cursor-pointer"
      >
        Next
      </button>
    </nav>
  );
}

import React from "react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

/**
 * Pagination Component
 *
 * Renders page navigation selectors below collections grids.
 * Displays Previous, Next, and numeric page indicators.
 */
export default function Pagination({ currentPage, totalPages, onPageChange, className }: PaginationProps) {
  if (totalPages <= 1) return null;

  const getPages = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    
    if (currentPage <= 4) {
      return [1, 2, 3, 4, 5, '...', totalPages];
    }
    
    if (currentPage >= totalPages - 3) {
      return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }
    
    return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
  };

  const pages = getPages();

  return (
    <nav className={`flex flex-wrap items-center justify-center gap-2 ${className !== undefined ? className : "border-t border-stone-200/50 py-8 mt-12"}`}>
      {/* Previous Button */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="flex h-9 items-center justify-center rounded-full border border-stone-200 bg-white px-4 text-xs font-bold uppercase tracking-wider text-stone-700 hover:border-stone-400 disabled:opacity-40 transition-colors cursor-pointer"
      >
        Prev
      </button>

      {/* Page Numbers */}
      {pages.map((page, idx) => {
        if (page === '...') {
          return (
            <span key={`ellipsis-${idx}`} className="flex h-9 w-6 items-center justify-center text-xs font-bold text-stone-400 select-none">
              ...
            </span>
          );
        }

        const pageNum = page as number;
        const active = pageNum === currentPage;
        return (
          <button
            key={pageNum}
            onClick={() => onPageChange(pageNum)}
            className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold transition-all cursor-pointer ${
              active
                ? "bg-[#E0A99E] text-white shadow-sm shadow-[#E0A99E]/20"
                : "border border-stone-200 bg-white text-stone-700 hover:border-[#E0A99E] hover:text-[#C68B7D]"
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

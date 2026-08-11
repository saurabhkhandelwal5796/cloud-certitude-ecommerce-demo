"use client";

import React, { useEffect, useRef } from "react";
import DynamicFilterSidebar, { Facet } from "./DynamicFilterSidebar";
import type { NodeFacetGroup } from "@/services/FacetService";

interface MobileFilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  // DynamicFilterSidebar props:
  facetGroups?: NodeFacetGroup[];
  facets?: Facet[];
  selectedFilters: Record<string, string[]>;
  onFilterChange: (attributeName: string, valueLabel: string) => void;
  priceRange: number;
  setPriceRange: (val: number) => void;
  onClear: () => void;
}

export default function MobileFilterDrawer({
  isOpen,
  onClose,
  ...sidebarProps
}: MobileFilterDrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (isOpen && drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
      // Prevent body scroll when drawer is open
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isOpen && e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          isOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        className={`fixed bottom-0 left-0 right-0 z-50 flex flex-col bg-white rounded-t-3xl shadow-2xl transition-transform duration-300 ease-in-out lg:hidden max-h-[85vh] ${
          isOpen ? "translate-y-0" : "translate-y-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 flex-shrink-0">
          <h3 className="text-sm font-black uppercase tracking-widest text-stone-900">
            Filters
          </h3>
          <button
            onClick={onClose}
            className="p-2 -mr-2 text-stone-400 hover:text-stone-800 transition-colors cursor-pointer"
            aria-label="Close filters"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-2 py-4">
          <div className="pointer-events-auto">
            {/* 
              We wrap DynamicFilterSidebar. It has its own padding/borders, 
              but it's fine. We hide its internal "Filters" header via CSS.
            */}
            <div className="[&>aside>div:first-child]:hidden [&>aside]:border-none [&>aside]:shadow-none [&>aside]:p-2">
              <DynamicFilterSidebar {...sidebarProps} />
            </div>
          </div>
        </div>

        {/* Sticky Footer Actions */}
        <div className="flex items-center gap-3 px-6 py-4 border-t border-stone-100 bg-white flex-shrink-0 pb-safe">
          <button
            onClick={() => {
              sidebarProps.onClear();
              onClose();
            }}
            className="flex-1 py-3.5 px-4 rounded-full border border-stone-200 text-xs font-bold uppercase tracking-wider text-stone-600 hover:bg-stone-50 transition-colors cursor-pointer"
          >
            Clear All
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-3.5 px-4 rounded-full bg-[#E0A99E] hover:bg-[#D4988D] text-xs font-bold uppercase tracking-wider text-white shadow-sm transition-colors cursor-pointer"
          >
            Apply
          </button>
        </div>
      </div>
    </>
  );
}

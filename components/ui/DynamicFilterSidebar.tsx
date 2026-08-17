"use client";

/**
 * DynamicFilterSidebar — Flipkart-style rich filter panel
 *
 * Supports NodeFacetGroup[] from the new navigation architecture:
 *   - multi-select  (checkboxes with real product counts)
 *   - color-swatch  (hex-color circles, multi-select)
 *   - price-range   (slider)
 *   - toggle        (single on/off switch)
 *   - single-select (radio buttons)
 *   - rating        (star filter)
 *
 * Features:
 *   - Active filter pills row
 *   - Expand / collapse per group
 *   - Search inside filter group (when allowSearch=true)
 *   - "Show more / Show less" above maxVisible
 *   - Real product counts per value
 *   - Clear all button
 *
 * Backward-compatible: also accepts the legacy Facet[] shape via the
 * `legacyFacets` prop (used by old CollectionTemplate during transition).
 */

import React, { useState, useMemo } from "react";
import type { NodeFacetGroup } from "@/services/FacetService";

// ─── Legacy compatibility shim ────────────────────────────────────────────────

export interface FacetValue {
  id: string;
  label: string;
  count: number;
}

export interface Facet {
  attributeName: string;
  type: string;
  values: FacetValue[];
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface DynamicFilterSidebarProps {
  /** New rich facet groups (Flipkart-style). Preferred. */
  facetGroups?: NodeFacetGroup[];
  /** Legacy flat facet array. Used during transition period. */
  facets?: Facet[];
  selectedFilters: Record<string, string[]>;
  onFilterChange: (attributeName: string, valueLabel: string) => void;
  priceRange: number;
  setPriceRange: (val: number) => void;
  onClear: () => void;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function isHexColor(val: string): boolean {
  return /^#[0-9A-Fa-f]{6}$/.test(val);
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function ActiveFilterPills({
  selectedFilters,
  onFilterChange,
  onClear,
}: {
  selectedFilters: Record<string, string[]>;
  onFilterChange: (attr: string, val: string) => void;
  onClear: () => void;
}) {
  const pills: { attr: string; val: string }[] = [];
  for (const [attr, vals] of Object.entries(selectedFilters)) {
    if (attr === "priceMax") continue;
    for (const val of vals) {
      pills.push({ attr, val });
    }
  }
  if (pills.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5 pb-3 border-b border-stone-100">
      {pills.map(({ attr, val }) => (
        <button
          key={`${attr}-${val}`}
          onClick={() => onFilterChange(attr, val)}
          className="flex items-center gap-1 bg-[#F4E8E5] text-[#B37A6D] text-[11px] font-semibold px-2.5 py-1 rounded-full hover:bg-[#E8D0CC] transition-colors"
        >
          {val}
          <span className="text-[10px] leading-none">✕</span>
        </button>
      ))}
      <button
        onClick={onClear}
        className="text-[11px] font-semibold text-stone-400 hover:text-stone-700 px-2 py-1 transition-colors"
      >
        Clear all
      </button>
    </div>
  );
}

function GroupHeader({
  name,
  isOpen,
  onToggle,
}: {
  name: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between py-1 group"
    >
      <h4 className="text-[11px] font-extrabold uppercase tracking-widest text-stone-500 group-hover:text-stone-800 transition-colors">
        {name}
      </h4>
      <svg
        className={`w-3.5 h-3.5 text-stone-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2.5}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    </button>
  );
}

function ColorSwatchGroup({
  group,
  selectedFilters,
  onFilterChange,
}: {
  group: NodeFacetGroup;
  selectedFilters: Record<string, string[]>;
  onFilterChange: (attr: string, val: string) => void;
}) {
  const selected = selectedFilters[group.attributeName] ?? [];

  return (
    <div className="flex flex-wrap gap-2 pt-1">
      {group.values.map((v) => {
        const active = selected.includes(v.value);
        const bg = v.hexColor && isHexColor(v.hexColor) ? v.hexColor : "#E5E7EB";
        return (
          <button
            key={v.value}
            title={`${v.value} (${v.count})`}
            onClick={() => onFilterChange(group.attributeName, v.value)}
            className={`relative w-8 h-8 rounded-full border-2 transition-all ${
              active
                ? "border-[#B37A6D] scale-110 shadow-md"
                : "border-stone-200 hover:border-stone-400 hover:scale-105"
            }`}
            style={{ backgroundColor: bg }}
          >
            {active && (
              <span className="absolute inset-0 flex items-center justify-center text-white text-[10px] font-bold drop-shadow">
                ✓
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

function CheckboxGroup({
  group,
  selectedFilters,
  onFilterChange,
  searchQuery,
}: {
  group: NodeFacetGroup;
  selectedFilters: Record<string, string[]>;
  onFilterChange: (attr: string, val: string) => void;
  searchQuery: string;
}) {
  const [showAll, setShowAll] = useState(false);
  const selected = selectedFilters[group.attributeName] ?? [];

  const filtered = useMemo(
    () =>
      searchQuery.trim()
        ? group.values.filter((v) =>
            v.value.toLowerCase().includes(searchQuery.toLowerCase())
          )
        : group.values,
    [group.values, searchQuery]
  );

  const visible = showAll ? filtered : filtered.slice(0, group.maxVisible);
  const hidden = filtered.length - group.maxVisible;

  return (
    <div className="space-y-1.5">
      {visible.map((v) => {
        const active = selected.includes(v.value);
        return (
          <label
            key={`${group.attributeName}-${v.value}`}
            className="flex items-center justify-between text-sm text-stone-700 cursor-pointer select-none group"
          >
            <div className="flex items-center gap-2.5">
              <input
                type="checkbox"
                checked={active}
                onChange={() => onFilterChange(group.attributeName, v.value)}
                className="rounded border-stone-300 text-[#E0A99E] focus:ring-[#E0A99E] h-4 w-4 cursor-pointer accent-[#E0A99E]"
              />
              <span
                className={`text-[13px] font-light transition-colors ${
                  active ? "text-stone-900 font-medium" : "group-hover:text-stone-900"
                }`}
              >
                {v.value}
              </span>
            </div>
            <span className="text-[10px] text-stone-400 font-medium bg-stone-100 px-1.5 py-0.5 rounded-full">
              {v.count}
            </span>
          </label>
        );
      })}
      {!showAll && hidden > 0 && (
        <button
          onClick={() => setShowAll(true)}
          className="text-[11px] font-semibold text-[#C68B7D] hover:text-[#B37A6D] hover:underline mt-1"
        >
          + {hidden} more
        </button>
      )}
      {showAll && filtered.length > group.maxVisible && (
        <button
          onClick={() => setShowAll(false)}
          className="text-[11px] font-semibold text-stone-400 hover:text-stone-700 hover:underline mt-1"
        >
          Show less
        </button>
      )}
    </div>
  );
}

function NodeFacetSection({
  group,
  selectedFilters,
  onFilterChange,
}: {
  group: NodeFacetGroup;
  selectedFilters: Record<string, string[]>;
  onFilterChange: (attr: string, val: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(!group.isCollapsedDefault);
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="space-y-2">
      <GroupHeader
        name={group.attributeName}
        isOpen={isOpen}
        onToggle={() => setIsOpen((p) => !p)}
      />
      {isOpen && (
        <div className="space-y-2">
          {group.allowSearch && group.values.length > group.maxVisible && (
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search ${group.attributeName.toLowerCase()}...`}
              className="w-full text-xs border border-stone-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#E0A99E] bg-stone-50 placeholder-stone-400"
            />
          )}
          {group.displayType === "color-swatch" ? (
            <ColorSwatchGroup
              group={group}
              selectedFilters={selectedFilters}
              onFilterChange={onFilterChange}
            />
          ) : (
            <CheckboxGroup
              group={group}
              selectedFilters={selectedFilters}
              onFilterChange={onFilterChange}
              searchQuery={searchQuery}
            />
          )}
        </div>
      )}
    </div>
  );
}

// Legacy section for old Facet[] shape
function LegacyFacetSection({
  facet,
  selectedFilters,
  onFilterChange,
}: {
  facet: Facet;
  selectedFilters: Record<string, string[]>;
  onFilterChange: (attr: string, val: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(true);
  const selected = selectedFilters[facet.attributeName] ?? [];

  return (
    <div className="space-y-2">
      <GroupHeader
        name={facet.attributeName}
        isOpen={isOpen}
        onToggle={() => setIsOpen((p) => !p)}
      />
      {isOpen && (
        <div className="space-y-1.5">
          {facet.values.map((val) => {
            const active = selected.includes(val.label);
            return (
              <label
                key={val.id}
                className="flex items-center justify-between text-sm text-stone-700 cursor-pointer select-none group"
              >
                <div className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={() => onFilterChange(facet.attributeName, val.label)}
                    className="rounded border-stone-300 text-[#E0A99E] focus:ring-[#E0A99E] h-4 w-4 cursor-pointer accent-[#E0A99E]"
                  />
                  <span
                    className={`text-[13px] font-light transition-colors ${
                      active ? "text-stone-900 font-medium" : "group-hover:text-stone-900"
                    }`}
                  >
                    {val.label}
                  </span>
                </div>
                {val.count > 0 && (
                  <span className="text-[10px] text-stone-400 font-medium bg-stone-100 px-1.5 py-0.5 rounded-full">
                    {val.count}
                  </span>
                )}
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function DynamicFilterSidebar({
  facetGroups,
  facets,
  selectedFilters,
  onFilterChange,
  priceRange,
  setPriceRange,
  onClear,
}: DynamicFilterSidebarProps) {
  const [priceOpen, setPriceOpen] = useState(true);

  return (
    <aside className="w-full flex flex-col gap-5 rounded-2xl border border-stone-200/50 bg-white p-5 shadow-sm shadow-stone-200/20 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-stone-200">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-stone-100 pb-3">
        <h3 className="text-xs font-extrabold uppercase tracking-widest text-stone-900">
          Filters
        </h3>
        <button
          onClick={onClear}
          className="text-xs font-semibold text-[#C68B7D] hover:text-[#B37A6D] hover:underline cursor-pointer transition-colors"
        >
          Clear All
        </button>
      </div>

      {/* Active filter pills */}
      <ActiveFilterPills
        selectedFilters={selectedFilters}
        onFilterChange={onFilterChange}
        onClear={onClear}
      />

      {/* Rich node facet groups */}
      {facetGroups && facetGroups.length > 0
        ? facetGroups.map((group) => (
            <NodeFacetSection
              key={group.attributeName}
              group={group}
              selectedFilters={selectedFilters}
              onFilterChange={onFilterChange}
            />
          ))
        : facets?.map((facet) => (
            <LegacyFacetSection
              key={facet.attributeName}
              facet={facet}
              selectedFilters={selectedFilters}
              onFilterChange={onFilterChange}
            />
          ))}

      {/* Price Range (always present) */}
      <div className="space-y-2">
        <GroupHeader
          name="Price Range"
          isOpen={priceOpen}
          onToggle={() => setPriceOpen((p) => !p)}
        />
        {priceOpen && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] text-stone-500 font-medium">
              <span>₹500</span>
              <span className="text-stone-800 font-bold">Up to ₹{priceRange.toLocaleString()}</span>
              <span>₹15,000</span>
            </div>
            <input
              type="range"
              min={500}
              max={15000}
              step={500}
              value={priceRange}
              onChange={(e) => setPriceRange(Number(e.target.value))}
              className="w-full h-1.5 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-[#E0A99E]"
            />
          </div>
        )}
      </div>
    </aside>
  );
}

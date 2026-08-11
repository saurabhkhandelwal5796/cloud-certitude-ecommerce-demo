"use client";

/**
 * Admin Catalog — Facet Mappings Page
 *
 * Allows admins to link Attribute Groups to Navigation Nodes so that
 * the Dynamic Facets Service only shows relevant filters.
 *
 * Example:
 *   Men → Jeans  linked to  [Color, Fit, Waist]
 *   Men → Shirts linked to  [Color, Sleeve Length, Collar]
 *
 * This prevents "Half Sleeve" from appearing in the Jeans filter.
 *
 * Architecture:
 *   This page writes to:  public.navigation_attribute_groups
 *   FacetService reads:   same table via get_node_facets RPC
 *
 * DO NOT import FacetService here — admin writes go directly to Supabase.
 */

import React, { useState, useEffect, useCallback } from "react";
import { getSupabaseClient } from "@/lib/supabase/client";
import { getAttributeGroups, AttributeGroup } from "@/services/AttributeService";

// ─── Local Types ─────────────────────────────────────────────────────────────
// NavNode mirrors NavigationService.NavNode without importing the server-only
// service into this client component.
interface NavNode {
  id: string;
  name: string;
  slug: string;
  fullPath: string;
  level: number;
  icon: string | null;
  sortOrder: number;
  isActive: boolean;
  children: NavNode[];
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface NavNodeFacetMapping {
  navNodeId: string;
  navNodeName: string;
  categoryId: string;
  linkedGroupIds: string[];
}

// ─── Spinner ──────────────────────────────────────────────────────────────────

function Spinner() {
  return (
    <div className="flex h-[50vh] items-center justify-center">
      <div className="flex items-center gap-2.5 text-stone-500 font-light text-sm">
        <svg className="h-5 w-5 animate-spin text-[#E0A99E]" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
        Loading facet mappings…
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function FacetMappingsPage() {
  const [leafNodes, setLeafNodes] = useState<NavNode[]>([]);
  const [attributeGroups, setAttributeGroups] = useState<AttributeGroup[]>([]);
  const [mappings, setMappings] = useState<Record<string, Set<string>>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null); // navNodeId being saved
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>("All");

  // ─── Toast helper ───────────────────────────────────────────────────────────
  const showToast = (msg: string, type: "success" | "error") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // ─── Load data ──────────────────────────────────────────────────────────────
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch all navigation nodes via the API route (server-side, uses getSupabaseAdmin).
      // Compute leaf nodes client-side: a leaf is any node whose id is not a parent_id of another node.
      const [navResponse, groups] = await Promise.all([
        fetch("/api/admin/navigation").then((r) => r.json()),
        getAttributeGroups(),
      ]);

      const allNodes: Array<{ id: string; name: string; slug: string; full_path: string; level: number; parent_id: string | null; is_active: boolean }> =
        Array.isArray(navResponse) ? navResponse : [];
      const parentIds = new Set(allNodes.map((n) => n.parent_id).filter(Boolean));
      const leaves: NavNode[] = allNodes
        .filter((n) => n.is_active && !parentIds.has(n.id))
        .map((n) => ({
          id: n.id,
          name: n.name,
          slug: n.slug ?? n.full_path.split("/").pop() ?? n.name,
          fullPath: n.full_path,
          level: n.level,
          icon: null,
          sortOrder: 0,
          isActive: n.is_active,
          children: [],
        }));

      setLeafNodes(leaves);
      setAttributeGroups(groups);

      // Load existing mappings from junction table
      const supabase = getSupabaseClient();
      const { data: junctionRows, error } = await supabase
        .from("navigation_attribute_groups" as any)
        .select("nav_node_id, attribute_group_id");

      if (error) throw error;

      // Build a Record<navNodeId, Set<groupId>>
      const mapped: Record<string, Set<string>> = {};
      for (const node of leaves) {
        mapped[node.id] = new Set<string>();
      }
      for (const row of (junctionRows ?? []) as any[]) {
        if (mapped[row.nav_node_id]) {
          mapped[row.nav_node_id].add(row.attribute_group_id);
        }
      }
      setMappings(mapped);
    } catch (err: any) {
      console.error("[FacetMappingsPage] loadData error:", err);
      showToast("Failed to load facet mappings.", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ─── Toggle a group on/off for a nav node ────────────────────────────────
  const handleToggle = (navNodeId: string, groupId: string) => {
    setMappings((prev) => {
      const current = new Set(prev[navNodeId] ?? []);
      if (current.has(groupId)) {
        current.delete(groupId);
      } else {
        current.add(groupId);
      }
      return { ...prev, [navNodeId]: current };
    });
  };

  // ─── Save a single nav node's mappings ────────────────────────────────────
  const handleSave = async (navNodeId: string) => {
    setSaving(navNodeId);
    try {
      const supabase = getSupabaseClient();

      // Delete all existing rows for this nav node
      const { error: delError } = await supabase
        .from("navigation_attribute_groups" as any)
        .delete()
        .eq("nav_node_id", navNodeId);

      if (delError) throw delError;

      // Insert the new selection (if any)
      const groupIds = Array.from(mappings[navNodeId] ?? []);
      if (groupIds.length > 0) {
        const rows = groupIds.map((gid, i) => ({
          nav_node_id: navNodeId,
          attribute_group_id: gid,
          sort_order: i,
        }));
        const { error: insError } = await supabase
          .from("navigation_attribute_groups" as any)
          .insert(rows);
        if (insError) throw insError;
      }

      showToast("Facet mapping saved successfully.", "success");
    } catch (err: any) {
      console.error("[FacetMappingsPage] handleSave error:", err);
      showToast("Failed to save mapping. Please try again.", "error");
      // Roll back local state by reloading
      await loadData();
    } finally {
      setSaving(null);
    }
  };

  const visibleNodes =
    selectedCategoryFilter === "All"
      ? leafNodes
      : leafNodes.filter((s) => s.fullPath.split("/")[0] === selectedCategoryFilter);

  const uniqueCategories = Array.from(new Set(leafNodes.map((s) => s.fullPath.split("/")[0]))).sort();

  if (loading) return <Spinner />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-stone-800">
            Facet Mappings
          </h1>
          <p className="text-sm text-stone-500 mt-1">
            Control which attribute groups appear as filters on each subcategory page.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-stone-400">
            Filter:
          </span>
          <select
            value={selectedCategoryFilter}
            onChange={(e) => setSelectedCategoryFilter(e.target.value)}
            className="rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-semibold text-stone-700 focus:border-[#C68B7D] focus:outline-none focus:ring-1 focus:ring-[#C68B7D]"
          >
            <option value="All">All Categories</option>
            {uniqueCategories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Info Banner */}
      <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4">
        <p className="text-xs font-semibold text-amber-800 leading-relaxed">
          <span className="font-black uppercase tracking-wider">How it works:</span>{" "}
          Select which Attribute Groups should appear as filter facets for each subcategory.
          Only groups you link here will be shown in the storefront filter sidebar.
          Facet results are always further intersected with active, in-stock variants.
        </p>
      </div>

      {/* Subcategory Cards */}
      {visibleNodes.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-stone-200 bg-white/60 p-12 text-center">
          <p className="text-stone-500 text-sm">
            {leafNodes.length === 0
              ? "No leaf nodes found."
              : "No leaf nodes found for the selected category."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {visibleNodes.map((subcat) => {
            const linked = mappings[subcat.id] ?? new Set<string>();
            const isSaving = saving === subcat.id;

            return (
              <div
                key={subcat.id}
                className="rounded-3xl border border-stone-200/60 bg-white/70 backdrop-blur-xl shadow-sm"
              >
                {/* Card Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center rounded-lg bg-stone-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-stone-600">
                      {subcat.fullPath.split("/")[0]}
                    </span>
                    <h2 className="text-sm font-black text-stone-800 tracking-tight">
                      {subcat.name}
                    </h2>
                    {!subcat.isActive && (
                      <span className="text-[10px] text-stone-400 font-semibold uppercase">(inactive)</span>
                    )}
                    <span className="text-[10px] font-bold text-[#C68B7D] bg-[#E0A99E]/10 rounded-full px-2 py-0.5">
                      {linked.size} group{linked.size !== 1 ? "s" : ""} linked
                    </span>
                  </div>
                  <button
                    onClick={() => handleSave(subcat.id)}
                    disabled={isSaving}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#C68B7D] px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-white hover:bg-[#b07b6f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                  >
                    {isSaving ? (
                      <>
                        <svg className="h-3 w-3 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Saving…
                      </>
                    ) : (
                      "Save"
                    )}
                  </button>
                </div>

                {/* Attribute Group Checkboxes */}
                <div className="px-6 py-4">
                  {attributeGroups.length === 0 ? (
                    <p className="text-xs text-stone-400">
                      No attribute groups found. Create attribute groups first under Catalog → Attributes.
                    </p>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                      {attributeGroups.map((group) => {
                        const checked = linked.has(group.id);
                        return (
                          <label
                            key={group.id}
                            className={`flex items-center gap-2.5 rounded-xl border px-3 py-2.5 cursor-pointer transition-all select-none text-xs font-semibold ${
                              checked
                                ? "border-[#E0A99E] bg-[#E0A99E]/10 text-[#C68B7D]"
                                : "border-stone-200 bg-stone-50 text-stone-600 hover:border-stone-300 hover:bg-stone-100"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => handleToggle(subcat.id, group.id)}
                              className="rounded border-stone-300 text-[#E0A99E] focus:ring-[#E0A99E] h-3.5 w-3.5 cursor-pointer"
                            />
                            {group.name}
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl px-5 py-3.5 text-sm font-semibold shadow-xl transition-all ${
            toast.type === "success"
              ? "bg-emerald-600 text-white"
              : "bg-rose-600 text-white"
          }`}
        >
          <span>{toast.type === "success" ? "✓" : "✕"}</span>
          {toast.msg}
        </div>
      )}
    </div>
  );
}



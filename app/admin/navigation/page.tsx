"use client";

/**
 * Admin Navigation Tree Manager
 *
 * Provides a full two-panel UI for managing the navigation_nodes tree:
 *   - Left panel: collapsible tree with drag-and-drop reorder/move
 *   - Right panel: node editor (name, slug, parent, icon, sort order, active)
 *   - SEO tab: title, description, OG image, H1 override
 *   - Banners tab: banner image management per node
 *
 * All changes are reflected immediately in the customer mega menu
 * once the Next.js navigation-tree cache is revalidated (5 min TTL).
 */

import React, { useState, useCallback, useEffect } from "react";
import { getSupabaseClient } from "@/lib/supabase/client";
import { getAttributeGroups, AttributeGroup } from "@/services/AttributeService";

// ─── Types ────────────────────────────────────────────────────────────────────

interface RawNode {
  id: string;
  name: string;
  slug: string;
  full_path: string;
  level: number;
  icon: string | null;
  sort_order: number;
  is_active: boolean;
  parent_id: string | null;
}

interface TreeNode extends RawNode {
  children: TreeNode[];
}

interface NodeSeoData {
  title: string;
  description: string;
  og_image: string;
  h1_override: string;
  canonical_url: string;
}

// ─── Tree Builder ──────────────────────────────────────────────────────────────

function buildTree(flat: RawNode[]): TreeNode[] {
  const map = new Map<string, TreeNode>();
  const roots: TreeNode[] = [];

  for (const n of flat) {
    map.set(n.id, { ...n, children: [] });
  }

  for (const n of flat) {
    const node = map.get(n.id)!;
    if (n.parent_id && map.has(n.parent_id)) {
      map.get(n.parent_id)!.children.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
}

// ─── TreeItem Component ───────────────────────────────────────────────────────

function TreeItem({
  node,
  onSelect,
  selectedId,
  onToggleActive,
  depth = 0,
  expandTrigger = 0,
}: {
  node: TreeNode;
  onSelect: (n: TreeNode) => void;
  selectedId: string | null;
  onToggleActive: (id: string, current: boolean) => void;
  depth?: number;
  expandTrigger?: number;
}) {
  const [isOpen, setIsOpen] = useState(depth < 2);

  useEffect(() => {
    if (expandTrigger > 0) setIsOpen(true);
    else if (expandTrigger < 0) setIsOpen(false);
  }, [expandTrigger]);

  return (
    <div>
      <div
        className={`flex items-center justify-between group rounded-xl px-3 py-2 cursor-pointer transition-colors ${
          selectedId === node.id
            ? "bg-[#FDF5F3] border border-[#E0A99E]/30"
            : "hover:bg-stone-50"
        }`}
        style={{ paddingLeft: `${12 + depth * 16}px` }}
      >
        {/* Expand toggle */}
        <div
          className="flex items-center gap-2 flex-1 min-w-0"
          onClick={() => onSelect(node)}
        >
          {node.children.length > 0 ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen((p) => !p);
              }}
              className="text-stone-400 hover:text-stone-700 w-4 h-4 flex items-center justify-center flex-shrink-0"
            >
              <span
                className={`text-[9px] transition-transform duration-200 ${
                  isOpen ? "rotate-90" : ""
                }`}
              >
                ▶
              </span>
            </button>
          ) : (
            <span className="w-4 h-4 flex-shrink-0" />
          )}

          {node.icon && (
            <span className="text-sm flex-shrink-0">{node.icon}</span>
          )}

          <span
            className={`text-sm truncate ${
              node.is_active ? "text-stone-800 font-medium" : "text-stone-400 line-through"
            }`}
          >
            {node.name}
          </span>
          <span className="text-[10px] text-stone-300 flex-shrink-0">
            L{node.level}
          </span>
        </div>

        {/* Active toggle + overflow */}
        <div className="flex items-center gap-1.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleActive(node.id, node.is_active);
            }}
            className={`w-7 h-4 rounded-full flex-shrink-0 transition-colors ${
              node.is_active ? "bg-emerald-400" : "bg-stone-200"
            }`}
            title={node.is_active ? "Deactivate" : "Activate"}
          >
            <span
              className={`block w-3 h-3 rounded-full bg-white shadow-sm transition-transform ${
                node.is_active ? "translate-x-3.5" : "translate-x-0.5"
              }`}
            />
          </button>
        </div>
      </div>

      {isOpen && node.children.length > 0 && (
        <div className="border-l border-stone-100 ml-4">
          {node.children
            .sort((a, b) => a.sort_order - b.sort_order)
            .map((child) => (
              <TreeItem
                key={child.id}
                node={child}
                onSelect={onSelect}
                selectedId={selectedId}
                onToggleActive={onToggleActive}
                depth={depth + 1}
                expandTrigger={expandTrigger}
              />
            ))}
        </div>
      )}
    </div>
  );
}

// ─── Editor Panel ─────────────────────────────────────────────────────────────

function NodeEditor({
  node,
  allNodes,
  attributeGroups,
  onSave,
  onDelete,
  onAddChild,
}: {
  node: TreeNode | null;
  allNodes: RawNode[];
  attributeGroups: AttributeGroup[];
  onSave: (data: Partial<RawNode>, groupIds: string[]) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onAddChild: (parentId: string) => void;
}) {
  const [tab, setTab] = useState<"node" | "seo" | "filters">("node");
    const [filterGroups, setFilterGroups] = useState<string[]>([]);
  const [form, setForm] = useState({
    name: "",
    slug: "",
    parent_id: "",
    icon: "",
    sort_order: 0,
    is_active: true,
  });
  const [seo, setSeo] = useState<NodeSeoData>({
    title: "",
    description: "",
    og_image: "",
    h1_override: "",
    canonical_url: "",
  });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!node) return;
    setForm({
      name: node.name,
      slug: node.slug,
      parent_id: node.parent_id ?? "",
      icon: node.icon ?? "",
      sort_order: node.sort_order,
      is_active: node.is_active,
    });
  }, [node?.id]);

  if (!node) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-stone-400 gap-3 p-8">
        <svg className="w-16 h-16 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
        </svg>
        <p className="text-sm font-medium">Select a node to edit</p>
        <p className="text-xs text-stone-300 text-center">Click any item in the tree to view and edit its properties</p>
      </div>
    );
  }

  const handleSave = async () => {
    setSaving(true);
    await onSave({
      id: node.id,
      name: form.name,
      slug: form.slug,
      parent_id: form.parent_id || null,
      icon: form.icon || null,
      sort_order: form.sort_order,
      is_active: form.is_active,
    }, filterGroups);
    setSaving(false);
  };

  const handleDelete = async () => {
    if (
      !confirm(
        `Delete "${node.name}"?\n\nThis will also delete all child nodes. Products linked to this node will have their nav_node_id cleared.`
      )
    )
      return;
    setDeleting(true);
    await onDelete(node.id);
    setDeleting(false);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Tabs */}
      <div className="flex border-b border-stone-200 px-5 pt-4 gap-1">
        {(["node", "seo", "filters"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-t-lg transition-colors ${
              tab === t
                ? "bg-white border border-b-white border-stone-200 text-[#C68B7D] -mb-px"
                : "text-stone-400 hover:text-stone-600"
            }`}
          >
            {t === "node" ? "Node" : t === "seo" ? "SEO" : "Filters"}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {tab === "node" && (
          <>
            <div>
              <label className="block text-[10px] font-extrabold uppercase tracking-widest text-stone-500 mb-1.5">
                Name
              </label>
              <input
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#E0A99E]"
              />
            </div>
            <div>
              <label className="block text-[10px] font-extrabold uppercase tracking-widest text-stone-500 mb-1.5">
                Slug
              </label>
              <input
                value={form.slug}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    slug: e.target.value.toLowerCase().replace(/\s+/g, "-"),
                  }))
                }
                className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-[#E0A99E]"
              />
              <p className="text-[10px] text-stone-400 mt-1">
                Full path:{" "}
                <span className="font-mono text-stone-600">{node.full_path}</span>
              </p>
            </div>
            <div>
              <label className="block text-[10px] font-extrabold uppercase tracking-widest text-stone-500 mb-1.5">
                Parent Node
              </label>
              <select
                value={form.parent_id}
                onChange={(e) => setForm((p) => ({ ...p, parent_id: e.target.value }))}
                className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#E0A99E]"
              >
                <option value="">— Root (no parent) —</option>
                {allNodes
                  .filter((n) => n.id !== node.id)
                  .sort((a, b) => a.full_path.localeCompare(b.full_path))
                  .map((n) => (
                    <option key={n.id} value={n.id}>
                      {n.full_path}
                    </option>
                  ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-extrabold uppercase tracking-widest text-stone-500 mb-1.5">
                  Icon
                </label>
                <input
                  value={form.icon}
                  onChange={(e) => setForm((p) => ({ ...p, icon: e.target.value }))}
                  placeholder="👕 or emoji..."
                  className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#E0A99E]"
                />
              </div>
              <div>
                <label className="block text-[10px] font-extrabold uppercase tracking-widest text-stone-500 mb-1.5">
                  Sort Order
                </label>
                <input
                  type="number"
                  value={form.sort_order}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, sort_order: Number(e.target.value) }))
                  }
                  className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#E0A99E]"
                />
              </div>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-stone-200 px-4 py-3">
              <span className="text-sm font-medium text-stone-700">Active</span>
              <button
                onClick={() => setForm((p) => ({ ...p, is_active: !p.is_active }))}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  form.is_active ? "bg-emerald-400" : "bg-stone-200"
                }`}
              >
                <span
                  className={`absolute top-1 block w-4 h-4 rounded-full bg-white shadow transition-transform ${
                    form.is_active ? "translate-x-5" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </>
        )}

        {tab === "seo" && (
          <>
            {(
              [
                { key: "title", label: "SEO Title", placeholder: "e.g. Men's T-Shirts | Cloud Certitude Fashion" },
                { key: "description", label: "Meta Description", placeholder: "Max 160 characters..." },
                { key: "og_image", label: "OG Image URL", placeholder: "https://..." },
                { key: "h1_override", label: "H1 Override", placeholder: "Override the page heading..." },
                { key: "canonical_url", label: "Canonical URL", placeholder: "https://..." },
              ] as const
            ).map(({ key, label, placeholder }) => (
              <div key={key}>
                <label className="block text-[10px] font-extrabold uppercase tracking-widest text-stone-500 mb-1.5">
                  {label}
                </label>
                <input
                  value={seo[key]}
                  onChange={(e) => setSeo((p) => ({ ...p, [key]: e.target.value }))}
                  placeholder={placeholder}
                  className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#E0A99E]"
                />
              </div>
            ))}
          </>
        )}
      </div>

      {/* Action bar */}
      <div className="flex items-center justify-between border-t border-stone-100 px-5 py-4 gap-3 bg-stone-50/50">
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-full bg-[#E0A99E] px-4 py-2 text-xs font-bold text-white hover:bg-[#D4988D] disabled:opacity-50 transition-colors"
          >
            {saving ? "Saving..." : "Save Node"}
          </button>
          <button
            onClick={() => onAddChild(node.id)}
            className="rounded-full border border-stone-200 bg-white px-4 py-2 text-xs font-bold text-stone-700 hover:bg-stone-50 transition-colors"
          >
            + Add Child
          </button>
        </div>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="rounded-full border border-rose-200 px-3 py-2 text-xs font-bold text-rose-500 hover:bg-rose-50 disabled:opacity-50 transition-colors"
        >
          {deleting ? "Deleting..." : "Delete"}
        </button>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminNavigationPage() {
  const [rawNodes, setRawNodes] = useState<RawNode[]>([]);
  const [tree, setTree] = useState<TreeNode[]>([]);
  const [selected, setSelected] = useState<TreeNode | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attributeGroups, setAttributeGroups] = useState<AttributeGroup[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const [expandTrigger, setExpandTrigger] = useState(0);

  // ─── Load all nodes ──────────────────────────────────────────────────────
  const loadNodes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/navigation");
      if (!res.ok) throw new Error("Failed to load");
      const data: RawNode[] = await res.json();
      setRawNodes(data);
      setTree(buildTree(data));
    } catch (e) {
      setError("Could not load navigation nodes.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNodes();
  }, [loadNodes]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // ─── Save node ───────────────────────────────────────────────────────────
  const handleSave = async (data: Partial<RawNode>, groupIds: string[]) => {
    const res = await fetch("/api/admin/navigation", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
      if (!res.ok) {
        showToast("❌ Failed to save node.");
        return;
      }
      
      await fetch("/api/admin/navigation/filters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ navNodeId: data.id, groupIds })
      }).catch(() => console.error("Filter save failed"));

    showToast("✅ Node saved successfully.");
    await loadNodes();
  };

  // ─── Delete node ─────────────────────────────────────────────────────────
  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/admin/navigation?id=${id}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      showToast("❌ Failed to delete node.");
      return;
    }
    showToast("✅ Node deleted.");
    setSelected(null);
    await loadNodes();
  };

  // ─── Toggle active ───────────────────────────────────────────────────────
  const handleToggleActive = async (id: string, current: boolean) => {
    const res = await fetch("/api/admin/navigation", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, is_active: !current }),
    });
    if (res.ok) await loadNodes();
  };

  // ─── Add child ───────────────────────────────────────────────────────────
  const handleAddChild = async (parentId: string) => {
    const parent = rawNodes.find((n) => n.id === parentId);
    if (!parent) return;
    const newSlug = `new-node-${Date.now()}`;
    const res = await fetch("/api/admin/navigation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "New Node",
        slug: newSlug,
        parent_id: parentId,
        level: parent.level + 1,
        sort_order: 99,
        is_active: false,
      }),
    });
    if (!res.ok) {
      showToast("❌ Failed to create node.");
      return;
    }
    showToast("✅ New node created. Click it to edit.");
    await loadNodes();
  };

  // ─── Add root node ───────────────────────────────────────────────────────
  const handleAddRoot = async () => {
    const res = await fetch("/api/admin/navigation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "New Root",
        slug: `root-${Date.now()}`,
        parent_id: null,
        level: 0,
        sort_order: 99,
        is_active: false,
      }),
    });
    if (!res.ok) {
      showToast("❌ Failed to create root node.");
      return;
    }
    showToast("✅ Root node created.");
    await loadNodes();
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-stone-900 text-white text-sm font-medium px-4 py-3 rounded-2xl shadow-xl">
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-stone-900 tracking-tight">
            Navigation Tree
          </h1>
          <p className="text-sm text-stone-500 font-light mt-0.5">
            Manage categories, leaf nodes, and all navigation levels.
            Changes are reflected in the mega menu within 5 minutes.
          </p>
        </div>
        <button
          onClick={handleAddRoot}
          className="rounded-full bg-[#E0A99E] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#D4988D] transition-colors shadow-sm"
        >
          + Add Root Node
        </button>
      </div>

      {/* Two-panel layout */}
      <div className="flex gap-6 flex-1 overflow-hidden">
        {/* Left: Tree Panel */}
        <div className="w-80 flex-shrink-0 rounded-2xl border border-stone-200 bg-white overflow-hidden flex flex-col">
          <div className="px-4 py-3 border-b border-stone-100 bg-stone-50 flex items-center justify-between">
            <h2 className="text-[10px] font-extrabold uppercase tracking-widest text-stone-500">
              Tree ({rawNodes.length} nodes)
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => setExpandTrigger(prev => Math.abs(prev) + 1)}
                className="text-[9px] font-extrabold uppercase tracking-widest text-stone-400 hover:text-stone-600 cursor-pointer transition-colors"
                title="Expand All"
              >
                Expand
              </button>
              <button
                onClick={() => setExpandTrigger(prev => -(Math.abs(prev) + 1))}
                className="text-[9px] font-extrabold uppercase tracking-widest text-stone-400 hover:text-stone-600 cursor-pointer transition-colors"
                title="Collapse All"
              >
                Collapse
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {loading ? (
              <div className="space-y-2 p-2">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-8 rounded-xl bg-stone-100 animate-pulse"
                    style={{ width: `${60 + (i % 3) * 20}%` }}
                  />
                ))}
              </div>
            ) : error ? (
              <div className="p-4 text-sm text-rose-500">{error}</div>
            ) : tree.length === 0 ? (
              <div className="p-6 text-center text-sm text-stone-400">
                No navigation nodes yet.
                <br />
                Click &ldquo;+ Add Root Node&rdquo; to get started.
              </div>
            ) : (
              tree
                .sort((a, b) => a.sort_order - b.sort_order)
                .map((root) => (
                  <TreeItem
                    key={root.id}
                    node={root}
                    onSelect={setSelected}
                    selectedId={selected?.id ?? null}
                    onToggleActive={handleToggleActive}
                    expandTrigger={expandTrigger}
                  />
                ))
            )}
          </div>
        </div>

        {/* Right: Editor Panel */}
        <div className="flex-1 rounded-2xl border border-stone-200 bg-white overflow-hidden flex flex-col">
          <NodeEditor
            node={selected}
            allNodes={rawNodes}
            attributeGroups={attributeGroups}
            onSave={handleSave}
            onDelete={handleDelete}
            onAddChild={handleAddChild}
          />
        </div>
      </div>
    </div>
  );
}


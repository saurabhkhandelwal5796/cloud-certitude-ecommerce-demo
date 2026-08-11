"use client";

/**
 * Admin Catalog — Attributes Page
 *
 * A three-screen drill-down UI for managing the Dynamic Product Attribute Engine.
 * All three views are rendered in this single page component using local state.
 *
 * Navigation:
 *   Screen 1 (groups)    — List, add, edit, delete Attribute Groups
 *   Screen 2 (attrs)     — List, add, edit, delete Attributes inside a Group
 *   Screen 3 (values)    — List, add, edit, delete Values inside an Attribute
 *
 * Styling follows the existing Admin Panel aesthetic:
 *   rounded-3xl cards, stone palette, #E0A99E accent.
 */

import React, { useState, useEffect, useCallback } from "react";
import {
  AttributeGroup,
  Attribute,
  AttributeValue,
  getAttributeGroups,
  createAttributeGroup,
  updateAttributeGroup,
  deleteAttributeGroup,
  getAttributes,
  createAttribute,
  updateAttribute,
  deleteAttribute,
  getAttributeValues,
  createAttributeValue,
  updateAttributeValue,
  deleteAttributeValue,
  validateAttributeName,
  validateAttributeValue,
} from "@/services/AttributeService";

// ─── Types ────────────────────────────────────────────────────────────────────

type ActiveView = "groups" | "attrs" | "values";

// ─── Shared UI Atoms ──────────────────────────────────────────────────────────

function Spinner() {
  return (
    <div className="flex h-[60vh] items-center justify-center">
      <div className="flex items-center gap-2.5 text-stone-500 font-light text-sm">
        <svg
          className="h-5 w-5 animate-spin text-[#E0A99E]"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
        Loading…
      </div>
    </div>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="text-rose-500 font-bold uppercase tracking-wider text-sm border border-rose-200 bg-rose-50/50 px-6 py-4 rounded-3xl">
      ⚠️ {message}
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <p className="text-center text-xs text-stone-400 font-light py-10 uppercase tracking-widest">
      {label}
    </p>
  );
}

// ─── Inline Modal ─────────────────────────────────────────────────────────────

interface ModalProps {
  title: string;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  submitLabel: string;
  isSubmitting: boolean;
  formError: string;
  children: React.ReactNode;
}

function Modal({
  title,
  onClose,
  onSubmit,
  submitLabel,
  isSubmitting,
  formError,
  children,
}: ModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-stone-900/30 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Panel */}
      <div className="relative w-full max-w-md rounded-3xl border border-stone-200/60 bg-white shadow-xl shadow-stone-300/30 p-8 z-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-sm font-black uppercase tracking-wider text-stone-900">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-stone-400 hover:text-stone-700 transition-colors text-lg leading-none"
          >
            ✕
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          {children}

          {formError && (
            <p className="text-rose-500 text-xs font-semibold">{formError}</p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-full border border-stone-200 bg-white px-4 py-2.5 text-xs font-bold text-stone-500 hover:bg-stone-50 transition-colors uppercase tracking-wider cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 rounded-full bg-[#E0A99E] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#D4988D] transition-colors uppercase tracking-wider shadow-md hover:shadow-[#E0A99E]/20 disabled:opacity-60 cursor-pointer"
            >
              {isSubmitting ? "Saving…" : submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Input Field ──────────────────────────────────────────────────────────────

function FormField({
  label,
  value,
  onChange,
  placeholder,
  required,
  multiline,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  multiline?: boolean;
}) {
  const base =
    "w-full rounded-2xl border border-stone-200 bg-stone-50/50 px-4 py-2.5 text-xs text-stone-800 placeholder:text-stone-300 focus:border-[#E0A99E] focus:outline-none focus:ring-1 focus:ring-[#E0A99E]/30 transition-colors";

  return (
    <div>
      <label className="block text-[10px] font-extrabold uppercase tracking-widest text-stone-500 mb-1.5">
        {label}
        {required && <span className="text-[#E0A99E] ml-0.5">*</span>}
      </label>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={3}
          className={`${base} resize-none`}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={base}
        />
      )}
    </div>
  );
}

// ─── Breadcrumb ───────────────────────────────────────────────────────────────

function Breadcrumb({
  parts,
}: {
  parts: { label: string; onClick?: () => void }[];
}) {
  return (
    <nav className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-bold text-stone-400 mb-1">
      {parts.map((p, i) => (
        <React.Fragment key={i}>
          {i > 0 && <span className="text-stone-300">/</span>}
          {p.onClick ? (
            <button
              type="button"
              onClick={p.onClick}
              className="hover:text-[#E0A99E] transition-colors cursor-pointer"
            >
              {p.label}
            </button>
          ) : (
            <span className="text-stone-700">{p.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}

// ─── Back Button ──────────────────────────────────────────────────────────────

function BackButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-widest text-stone-500 hover:text-stone-900 transition-colors cursor-pointer"
    >
      ← {label}
    </button>
  );
}

// ─── Action Icon Buttons ──────────────────────────────────────────────────────

function EditBtn({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title="Edit"
      className="p-1.5 rounded-xl text-stone-400 hover:text-[#E0A99E] hover:bg-[#E0A99E]/10 transition-colors cursor-pointer"
    >
      ✏️
    </button>
  );
}

function DeleteBtn({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title="Delete"
      className="p-1.5 rounded-xl text-stone-400 hover:text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer"
    >
      🗑️
    </button>
  );
}

// ─── Page Count badge ─────────────────────────────────────────────────────────

function CountBadge({ n, label }: { n: number; label: string }) {
  return (
    <span className="text-[9px] font-extrabold uppercase tracking-widest text-stone-400">
      {n} {label}
    </span>
  );
}

// ─── Main Page Component ──────────────────────────────────────────────────────

export default function AttributesPage() {
  // ── Navigation state ──
  const [activeView, setActiveView] = useState<ActiveView>("groups");
  const [selectedGroup, setSelectedGroup] = useState<AttributeGroup | null>(null);
  const [selectedAttr, setSelectedAttr] = useState<Attribute | null>(null);

  // ── Data ──
  const [groups, setGroups] = useState<AttributeGroup[]>([]);
  const [attrs, setAttrs] = useState<Attribute[]>([]);
  const [values, setValues] = useState<AttributeValue[]>([]);

  // ── Loading / error ──
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── Modal: Groups ──
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [editingGroup, setEditingGroup] = useState<AttributeGroup | null>(null);
  const [groupName, setGroupName] = useState("");
  const [groupDesc, setGroupDesc] = useState("");
  const [groupFormError, setGroupFormError] = useState("");
  const [groupSubmitting, setGroupSubmitting] = useState(false);

  // ── Modal: Attributes ──
  const [showAttrModal, setShowAttrModal] = useState(false);
  const [editingAttr, setEditingAttr] = useState<Attribute | null>(null);
  const [attrName, setAttrName] = useState("");
  const [attrFormError, setAttrFormError] = useState("");
  const [attrSubmitting, setAttrSubmitting] = useState(false);

  // ── Modal: Values ──
  const [showValueModal, setShowValueModal] = useState(false);
  const [editingValue, setEditingValue] = useState<AttributeValue | null>(null);
  const [valueName, setValueName] = useState("");
  const [valueFormError, setValueFormError] = useState("");
  const [valueSubmitting, setValueSubmitting] = useState(false);

  // ────────────────────────────────────────────────────────────
  // Data loaders
  // ────────────────────────────────────────────────────────────

  const loadGroups = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      setGroups(await getAttributeGroups());
    } catch {
      setError("Unable to load attribute groups from database.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadAttrs = useCallback(async (groupId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      setAttrs(await getAttributes(groupId));
    } catch {
      setError("Unable to load attributes from database.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadValues = useCallback(async (attrId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      setValues(await getAttributeValues(attrId));
    } catch {
      setError("Unable to load attribute values from database.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ── Initial load ──
  useEffect(() => {
    loadGroups();
  }, [loadGroups]);

  // ────────────────────────────────────────────────────────────
  // Navigation helpers
  // ────────────────────────────────────────────────────────────

  const goToGroups = () => {
    setActiveView("groups");
    setSelectedGroup(null);
    setSelectedAttr(null);
    setAttrs([]);
    setValues([]);
    loadGroups();
  };

  const goToAttrs = (group: AttributeGroup) => {
    setSelectedGroup(group);
    setSelectedAttr(null);
    setValues([]);
    setActiveView("attrs");
    loadAttrs(group.id);
  };

  const goToValues = (attr: Attribute) => {
    setSelectedAttr(attr);
    setActiveView("values");
    loadValues(attr.id);
  };

  // ────────────────────────────────────────────────────────────
  // Group CRUD handlers
  // ────────────────────────────────────────────────────────────

  const openAddGroup = () => {
    setEditingGroup(null);
    setGroupName("");
    setGroupDesc("");
    setGroupFormError("");
    setShowGroupModal(true);
  };

  const openEditGroup = (g: AttributeGroup) => {
    setEditingGroup(g);
    setGroupName(g.name);
    setGroupDesc(g.description ?? "");
    setGroupFormError("");
    setShowGroupModal(true);
  };

  const handleSaveGroup = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Format validation
    const formatErr = validateAttributeName(groupName);
    if (formatErr) {
      setGroupFormError(formatErr);
      return;
    }

    // 2. Client-side duplicate check (case-insensitive, exclude self when editing)
    const normalized = groupName.trim().toLowerCase();
    const isDuplicate = groups.some(
      (g) =>
        g.name.toLowerCase() === normalized &&
        g.id !== editingGroup?.id
    );
    if (isDuplicate) {
      setGroupFormError("Attribute Group already exists.");
      return;
    }

    setGroupSubmitting(true);
    try {
      if (editingGroup) {
        await updateAttributeGroup(editingGroup.id, groupName, groupDesc);
      } else {
        await createAttributeGroup(groupName, groupDesc);
      }
      setShowGroupModal(false);
      loadGroups();
    } catch (err) {
      setGroupFormError(
        err instanceof Error ? err.message : "Failed to save. Please try again."
      );
    } finally {
      setGroupSubmitting(false);
    }
  };

  const handleDeleteGroup = async (g: AttributeGroup) => {
    if (
      !confirm(
        `Delete group "${g.name}"?\n\nThis will also delete all its attributes and values.`
      )
    )
      return;
    try {
      await deleteAttributeGroup(g.id);
      loadGroups();
    } catch {
      alert("Failed to delete group.");
    }
  };

  // ────────────────────────────────────────────────────────────
  // Attribute CRUD handlers
  // ────────────────────────────────────────────────────────────

  const openAddAttr = () => {
    setEditingAttr(null);
    setAttrName("");
    setAttrFormError("");
    setShowAttrModal(true);
  };

  const openEditAttr = (a: Attribute) => {
    setEditingAttr(a);
    setAttrName(a.name);
    setAttrFormError("");
    setShowAttrModal(true);
  };

  const handleSaveAttr = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Format validation
    const formatErr = validateAttributeName(attrName);
    if (formatErr) {
      setAttrFormError(formatErr);
      return;
    }

    // 2. Client-side duplicate check within this group
    const normalized = attrName.trim().toLowerCase();
    const isDuplicate = attrs.some(
      (a) =>
        a.name.toLowerCase() === normalized &&
        a.id !== editingAttr?.id
    );
    if (isDuplicate) {
      setAttrFormError("Attribute already exists in this group.");
      return;
    }

    if (!selectedGroup) return;
    setAttrSubmitting(true);
    try {
      if (editingAttr) {
        await updateAttribute(editingAttr.id, attrName);
      } else {
        await createAttribute(selectedGroup.id, attrName);
      }
      setShowAttrModal(false);
      loadAttrs(selectedGroup.id);
    } catch (err) {
      setAttrFormError(
        err instanceof Error ? err.message : "Failed to save. Please try again."
      );
    } finally {
      setAttrSubmitting(false);
    }
  };

  const handleDeleteAttr = async (a: Attribute) => {
    if (
      !confirm(
        `Delete attribute "${a.name}"?\n\nThis will also delete all its values.`
      )
    )
      return;
    try {
      await deleteAttribute(a.id);
      if (selectedGroup) loadAttrs(selectedGroup.id);
    } catch {
      alert("Failed to delete attribute.");
    }
  };

  // ────────────────────────────────────────────────────────────
  // Value CRUD handlers
  // ────────────────────────────────────────────────────────────

  const openAddValue = () => {
    setEditingValue(null);
    setValueName("");
    setValueFormError("");
    setShowValueModal(true);
  };

  const openEditValue = (v: AttributeValue) => {
    setEditingValue(v);
    setValueName(v.value);
    setValueFormError("");
    setShowValueModal(true);
  };

  const handleSaveValue = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Format validation — values use the looser validator (numbers OK)
    const formatErr = validateAttributeValue(valueName);
    if (formatErr) {
      setValueFormError(formatErr);
      return;
    }

    // 2. Client-side duplicate check within this attribute
    const normalized = valueName.trim().toLowerCase();
    const isDuplicate = values.some(
      (v) =>
        v.value.toLowerCase() === normalized &&
        v.id !== editingValue?.id
    );
    if (isDuplicate) {
      setValueFormError("Attribute Value already exists.");
      return;
    }

    if (!selectedAttr) return;
    setValueSubmitting(true);
    try {
      if (editingValue) {
        await updateAttributeValue(editingValue.id, valueName);
      } else {
        await createAttributeValue(selectedAttr.id, valueName);
      }
      setShowValueModal(false);
      loadValues(selectedAttr.id);
    } catch (err) {
      setValueFormError(
        err instanceof Error ? err.message : "Failed to save. Please try again."
      );
    } finally {
      setValueSubmitting(false);
    }
  };

  const handleDeleteValue = async (v: AttributeValue) => {
    if (!confirm(`Delete value "${v.value}"?`)) return;
    try {
      await deleteAttributeValue(v.id);
      if (selectedAttr) loadValues(selectedAttr.id);
    } catch {
      alert("Failed to delete value.");
    }
  };

  // ────────────────────────────────────────────────────────────
  // Render
  // ────────────────────────────────────────────────────────────

  if (isLoading) return <Spinner />;

  return (
    <div className="space-y-8 text-left">

      {/* ── Screen 1: Attribute Groups ─────────────────────────── */}
      {activeView === "groups" && (
        <>
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <Breadcrumb parts={[{ label: "Catalog" }, { label: "Attributes" }]} />
              <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-wider uppercase">
                Attribute Groups
              </h1>
              <p className="mt-1 text-xs text-stone-400 font-light uppercase tracking-widest">
                Define product taxonomy groups. Click a group to manage its attributes.
              </p>
            </div>
            <button
              onClick={openAddGroup}
              className="rounded-full bg-[#E0A99E] px-6 py-2.5 text-xs font-bold text-white hover:bg-[#D4988D] transition-colors shadow-md hover:shadow-[#E0A99E]/20 uppercase tracking-wider cursor-pointer whitespace-nowrap"
            >
              + Add Group
            </button>
          </div>

          {error && <ErrorBanner message={error} />}

          {/* Groups Grid */}
          {groups.length === 0 ? (
            <div className="rounded-3xl border border-stone-200/50 bg-white shadow-sm">
              <EmptyState label="No attribute groups yet. Create your first group above." />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {groups.map((g) => (
                <div
                  key={g.id}
                  className="group rounded-3xl border border-stone-200/50 bg-white p-6 shadow-sm shadow-stone-200/30 flex flex-col gap-3 hover:shadow-md hover:border-stone-300/60 transition-all duration-200"
                >
                  {/* Card top row */}
                  <div className="flex items-start justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => goToAttrs(g)}
                      className="text-left flex-1 min-w-0"
                    >
                      <h3 className="text-sm font-extrabold text-stone-900 tracking-wide truncate hover:text-[#C68B7D] transition-colors">
                        {g.name}
                      </h3>
                      {g.description && (
                        <p className="text-[11px] text-stone-400 font-light mt-0.5 line-clamp-2">
                          {g.description}
                        </p>
                      )}
                    </button>
                    <div className="flex items-center gap-0.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <EditBtn onClick={() => openEditGroup(g)} />
                      <DeleteBtn onClick={() => handleDeleteGroup(g)} />
                    </div>
                  </div>

                  {/* Card footer */}
                  <div className="flex items-center justify-between pt-3 border-t border-stone-100">
                    <span className="text-[9px] font-extrabold uppercase tracking-widest text-stone-300">
                      {new Date(g.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                    <button
                      type="button"
                      onClick={() => goToAttrs(g)}
                      className="text-[9px] font-extrabold text-[#E0A99E] hover:text-[#C68B7D] uppercase tracking-widest transition-colors cursor-pointer"
                    >
                      Manage Attributes →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Group Modal */}
          {showGroupModal && (
            <Modal
              title={editingGroup ? "Edit Group" : "Add Attribute Group"}
              onClose={() => setShowGroupModal(false)}
              onSubmit={handleSaveGroup}
              submitLabel={editingGroup ? "Save Changes" : "Create Group"}
              isSubmitting={groupSubmitting}
              formError={groupFormError}
            >
              <FormField
                label="Group Name"
                value={groupName}
                onChange={setGroupName}
                placeholder="e.g. Jeans, Shirts, Shoes"
                required
              />
              <FormField
                label="Description"
                value={groupDesc}
                onChange={setGroupDesc}
                placeholder="Optional — brief description of this group"
                multiline
              />
            </Modal>
          )}
        </>
      )}

      {/* ── Screen 2: Attributes ────────────────────────────────── */}
      {activeView === "attrs" && selectedGroup && (
        <>
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <Breadcrumb
                parts={[
                  { label: "Attributes", onClick: goToGroups },
                  { label: selectedGroup.name },
                ]}
              />
              <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-wider uppercase">
                {selectedGroup.name}
              </h1>
              <p className="mt-1 text-xs text-stone-400 font-light uppercase tracking-widest">
                Click an attribute to manage its values.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <BackButton onClick={goToGroups} label="All Groups" />
              <button
                onClick={openAddAttr}
                className="rounded-full bg-[#E0A99E] px-6 py-2.5 text-xs font-bold text-white hover:bg-[#D4988D] transition-colors shadow-md hover:shadow-[#E0A99E]/20 uppercase tracking-wider cursor-pointer whitespace-nowrap"
              >
                + Add Attribute
              </button>
            </div>
          </div>

          {error && <ErrorBanner message={error} />}

          {/* Attributes Table */}
          <div className="rounded-3xl border border-stone-200/50 bg-white shadow-sm overflow-hidden">
            {attrs.length === 0 ? (
              <EmptyState label="No attributes yet. Add your first attribute above." />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-stone-100 bg-stone-50/50 text-[10px] uppercase font-bold text-stone-400">
                      <th className="py-4 px-6 font-semibold">Attribute Name</th>
                      <th className="py-4 px-6 font-semibold">Created</th>
                      <th className="py-4 px-6 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-50 text-xs">
                    {attrs.map((a) => (
                      <tr
                        key={a.id}
                        className="hover:bg-stone-50/60 transition-colors"
                      >
                        <td className="py-4 px-6">
                          <button
                            type="button"
                            onClick={() => goToValues(a)}
                            className="font-bold text-stone-900 hover:text-[#C68B7D] transition-colors cursor-pointer text-left"
                          >
                            {a.name}
                          </button>
                        </td>
                        <td className="py-4 px-6 text-stone-400 font-light">
                          {new Date(a.created_at).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center justify-end gap-1">
                            <EditBtn onClick={() => openEditAttr(a)} />
                            <DeleteBtn onClick={() => handleDeleteAttr(a)} />
                            <button
                              type="button"
                              onClick={() => goToValues(a)}
                              className="ml-1 text-[9px] font-extrabold text-[#E0A99E] hover:text-[#C68B7D] uppercase tracking-widest transition-colors cursor-pointer"
                            >
                              Values →
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Footer count */}
          {attrs.length > 0 && (
            <div className="flex justify-end">
              <CountBadge n={attrs.length} label="attributes" />
            </div>
          )}

          {/* Attribute Modal */}
          {showAttrModal && (
            <Modal
              title={editingAttr ? "Edit Attribute" : "Add Attribute"}
              onClose={() => setShowAttrModal(false)}
              onSubmit={handleSaveAttr}
              submitLabel={editingAttr ? "Save Changes" : "Create Attribute"}
              isSubmitting={attrSubmitting}
              formError={attrFormError}
            >
              <FormField
                label="Attribute Name"
                value={attrName}
                onChange={setAttrName}
                placeholder="e.g. Fit, Rise, Sleeve, Fabric"
                required
              />
            </Modal>
          )}
        </>
      )}

      {/* ── Screen 3: Attribute Values ──────────────────────────── */}
      {activeView === "values" && selectedGroup && selectedAttr && (
        <>
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <Breadcrumb
                parts={[
                  { label: "Attributes", onClick: goToGroups },
                  { label: selectedGroup.name, onClick: () => goToAttrs(selectedGroup) },
                  { label: selectedAttr.name },
                ]}
              />
              <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-wider uppercase">
                {selectedAttr.name}
                <span className="ml-2 text-base font-light text-stone-400">
                  — {selectedGroup.name}
                </span>
              </h1>
              <p className="mt-1 text-xs text-stone-400 font-light uppercase tracking-widest">
                Manage the selectable values for this attribute.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <BackButton
                onClick={() => goToAttrs(selectedGroup)}
                label={selectedGroup.name}
              />
              <button
                onClick={openAddValue}
                className="rounded-full bg-[#E0A99E] px-6 py-2.5 text-xs font-bold text-white hover:bg-[#D4988D] transition-colors shadow-md hover:shadow-[#E0A99E]/20 uppercase tracking-wider cursor-pointer whitespace-nowrap"
              >
                + Add Value
              </button>
            </div>
          </div>

          {error && <ErrorBanner message={error} />}

          {/* Values as pills */}
          <div className="rounded-3xl border border-stone-200/50 bg-white p-8 shadow-sm min-h-[200px]">
            {values.length === 0 ? (
              <EmptyState label="No values yet. Add your first value above." />
            ) : (
              <div className="flex flex-wrap gap-3">
                {values.map((v) => (
                  <div
                    key={v.id}
                    className="group flex items-center gap-2 rounded-full border border-stone-200 bg-stone-50 px-4 py-2 hover:border-[#E0A99E]/50 hover:bg-[#E0A99E]/5 transition-all duration-200"
                  >
                    <span className="text-xs font-semibold text-stone-700">
                      {v.value}
                    </span>
                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => openEditValue(v)}
                        title="Edit"
                        className="w-4 h-4 flex items-center justify-center text-stone-400 hover:text-[#E0A99E] transition-colors text-[10px] cursor-pointer"
                      >
                        ✏
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteValue(v)}
                        title="Delete"
                        className="w-4 h-4 flex items-center justify-center text-stone-400 hover:text-rose-500 transition-colors text-[10px] cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer count */}
          {values.length > 0 && (
            <div className="flex justify-end">
              <CountBadge n={values.length} label="values" />
            </div>
          )}

          {/* Value Modal */}
          {showValueModal && (
            <Modal
              title={editingValue ? "Edit Value" : "Add Value"}
              onClose={() => setShowValueModal(false)}
              onSubmit={handleSaveValue}
              submitLabel={editingValue ? "Save Changes" : "Add Value"}
              isSubmitting={valueSubmitting}
              formError={valueFormError}
            >
              <FormField
                label="Value"
                value={valueName}
                onChange={setValueName}
                placeholder="e.g. Slim, Skinny, Mid Rise, Cotton"
                required
              />
            </Modal>
          )}
        </>
      )}
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { formatPrice } from "@/utils";
import {
  getCustomerById,
  getOrdersByCustomer,
  updateUserRole,
  updateUserStatus,
  updateCustomerProfile,
  AdminCustomer,
  AdminOrder,
  UpdateCustomerProfilePayload,
} from "@/services/AdminService";
import { getSupabaseClient } from "@/lib/supabase/client";

/**
 * Salesforce-Style Customer Detail View (/admin/customers/[id])
 *
 * Provides:
 * - Enterprise Contact Record Header & Lifetime KPI Tiles
 * - Inline Salesforce-Style Editing for Customer Profile / Contact Fields
 * - Navigation Tabs: Overview and Orders
 * - Overview Tab: Contact info, addresses, and system metadata
 * - Orders Tab: Related orders table with clickable order drill-down to /admin/orders/[orderId]
 */
export default function AdminCustomerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const customerId = params?.id as string;

  const [customer, setCustomer] = useState<AdminCustomer | null>(null);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [activeTab, setActiveTab] = useState<"overview" | "orders">("overview");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Editable Form State
  const [formData, setFormData] = useState<UpdateCustomerProfilePayload>({
    name: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    country: "",
    newsletterSubscribed: false,
  });

  const loadCustomerData = async () => {
    if (!customerId) return;
    setIsLoading(true);
    try {
      const supabase = getSupabaseClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setCurrentUserId(user.id);

      const decodedId = decodeURIComponent(customerId);
      const custData = await getCustomerById(decodedId);
      setCustomer(custData);

      if (custData) {
        setFormData({
          name: custData.name || "",
          phone: custData.phone || "",
          address: custData.address || "",
          city: custData.city || "",
          state: custData.state || "",
          country: custData.country || "",
          newsletterSubscribed: Boolean(custData.newsletterSubscribed),
        });
      }

      // Load orders for this customer by ID and email
      const customerOrders = await getOrdersByCustomer(custData?.id || custData?.email || decodedId);
      setOrders(customerOrders);
    } catch (err) {
      console.error("[CustomerDetail] Error loading customer data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCustomerData();
  }, [customerId]);

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMsg({ text, type });
    setTimeout(() => setToastMsg(null), 4000);
  };

  const handleStartEdit = () => {
    if (!customer) return;
    setFormData({
      name: customer.name || "",
      phone: customer.phone || "",
      address: customer.address || "",
      city: customer.city || "",
      state: customer.state || "",
      country: customer.country || "",
      newsletterSubscribed: Boolean(customer.newsletterSubscribed),
    });
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    if (customer) {
      setFormData({
        name: customer.name || "",
        phone: customer.phone || "",
        address: customer.address || "",
        city: customer.city || "",
        state: customer.state || "",
        country: customer.country || "",
        newsletterSubscribed: Boolean(customer.newsletterSubscribed),
      });
    }
    setIsEditing(false);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer?.id) {
      showToast("Cannot update profile: missing customer user ID.", "error");
      return;
    }
    if (!formData.name?.trim()) {
      showToast("Customer Name is required.", "error");
      return;
    }

    setIsSaving(true);
    try {
      const result = await updateCustomerProfile(customer.id, formData);
      if (result.success) {
        showToast("Customer profile updated successfully.");
        setIsEditing(false);
        await loadCustomerData();
      } else {
        showToast(result.error || "Failed to update customer profile.", "error");
      }
    } catch (err: any) {
      console.error("[CustomerDetail] handleSaveProfile exception:", err);
      showToast(err?.message || "An unexpected error occurred while saving.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleRoleChange = async (newRole: "admin" | "customer") => {
    if (!customer?.id) return;
    if (customer.id === currentUserId && newRole === "customer") {
      showToast("Security Protection: You cannot revoke your own Admin role.", "error");
      return;
    }
    const ok = await updateUserRole(customer.id, newRole);
    if (ok) {
      showToast(`Role updated to ${newRole.toUpperCase()}.`);
      loadCustomerData();
    } else {
      showToast("Failed to update role. Please verify Admin RLS permissions.", "error");
    }
  };

  const handleStatusToggle = async () => {
    if (!customer?.id) return;
    if (customer.id === currentUserId) {
      showToast("Security Protection: You cannot disable your own active account.", "error");
      return;
    }
    const targetStatus = customer.status === "disabled" ? "active" : "disabled";
    const ok = await updateUserStatus(customer.id, targetStatus);
    if (ok) {
      showToast(`Account set to ${targetStatus.toUpperCase()}.`);
      loadCustomerData();
    } else {
      showToast("Failed to update status. Please verify Admin RLS permissions.", "error");
    }
  };

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex items-center gap-2.5 text-stone-500 font-light text-sm">
          <svg className="h-5 w-5 animate-spin text-[#E0A99E]" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Loading Customer Record...
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="space-y-6 text-left">
        <Link
          href="/admin/customers"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-500 hover:text-stone-900 transition"
        >
          ← Back to Customers Registry
        </Link>
        <div className="bg-white rounded-3xl border border-stone-200 p-8 text-center">
          <span className="text-3xl block mb-2">🔍</span>
          <h2 className="text-lg font-black text-stone-800">Customer Not Found</h2>
          <p className="text-xs text-stone-400 mt-1">
            No profile or record matching &quot;{customerId}&quot; was located in the registry.
          </p>
        </div>
      </div>
    );
  }

  const isCurrentAdmin = customer.id === currentUserId;

  return (
    <div className="space-y-6 text-left">
      {/* Toast Notification */}
      {toastMsg && (
        <div
          className={`rounded-2xl border px-4 py-3 text-xs font-semibold flex items-center gap-2 transition-all ${
            toastMsg.type === "success"
              ? "border-emerald-250 bg-emerald-50 text-emerald-800"
              : "border-rose-250 bg-rose-50 text-rose-800"
          }`}
        >
          <span>{toastMsg.type === "success" ? "✓" : "⚠️"}</span>
          <span>{toastMsg.text}</span>
        </div>
      )}

      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs font-bold text-stone-400">
        <Link href="/admin/customers" className="hover:text-stone-900 transition">
          Customers
        </Link>
        <span>/</span>
        <span className="text-stone-800">{customer.name}</span>
      </div>

      {/* Salesforce-Style Contact Record Header */}
      <div className="bg-white rounded-3xl border border-stone-200/60 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {customer.avatarUrl ? (
              <Image
                src={customer.avatarUrl}
                alt={customer.name}
                width={56}
                height={56}
                className="rounded-full object-cover border border-stone-200 shadow-sm"
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#E0A99E] to-stone-800 text-white font-black text-base flex items-center justify-center shadow-sm">
                {(customer.name || customer.email || "U").slice(0, 2).toUpperCase()}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#E0A99E]">
                  Contact Record
                </span>
                <span className="text-stone-300">•</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                    customer.status === "disabled"
                      ? "bg-rose-100 text-rose-800"
                      : "bg-emerald-100 text-emerald-800"
                  }`}
                >
                  {customer.status === "disabled" ? "Disabled" : "Active"}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                    customer.role === "admin"
                      ? "bg-purple-100 text-purple-800"
                      : "bg-stone-100 text-stone-700"
                  }`}
                >
                  {customer.role || "customer"}
                </span>
              </div>
              <h1 className="text-2xl font-black text-stone-900 tracking-tight mt-0.5">
                {customer.name}
              </h1>
              <p className="text-xs font-mono text-stone-400 mt-0.5">
                {customer.email} {customer.id && `• ID: ${customer.id}`}
              </p>
            </div>
          </div>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            {!isEditing ? (
              <button
                type="button"
                onClick={handleStartEdit}
                className="px-4 py-2 text-xs font-black uppercase tracking-wider rounded-xl border border-stone-300 bg-stone-900 text-white hover:bg-stone-800 transition shadow-2xs cursor-pointer flex items-center gap-1.5"
              >
                <span>✏️</span>
                <span>Edit Profile</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  disabled={isSaving}
                  className="px-3.5 py-2 text-xs font-bold rounded-xl border border-stone-200 bg-white text-stone-600 hover:bg-stone-50 transition cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  className="px-4 py-2 text-xs font-black uppercase tracking-wider rounded-xl border border-[#C68B7D] bg-[#A65B4E] text-white hover:bg-[#8F4C40] transition shadow-2xs cursor-pointer disabled:opacity-60 flex items-center gap-1.5"
                >
                  {isSaving ? (
                    <>
                      <svg className="h-3.5 w-3.5 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <span>💾</span>
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            )}

            <button
              onClick={handleStatusToggle}
              disabled={isCurrentAdmin || isEditing}
              className={`px-3.5 py-2 text-xs font-extrabold rounded-xl border transition cursor-pointer ${
                customer.status === "disabled"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                  : "border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100"
              } ${isCurrentAdmin || isEditing ? "opacity-40 cursor-not-allowed" : ""}`}
            >
              {customer.status === "disabled" ? "Enable Account" : "Disable Account"}
            </button>

            <select
              value={customer.role || "customer"}
              disabled={isCurrentAdmin || isEditing}
              onChange={(e) => handleRoleChange(e.target.value as "admin" | "customer")}
              className={`text-xs font-bold rounded-xl px-3 py-2 border transition cursor-pointer ${
                customer.role === "admin"
                  ? "bg-purple-50 text-purple-900 border-purple-200 font-extrabold"
                  : "bg-stone-50 text-stone-700 border-stone-200"
              } ${isCurrentAdmin || isEditing ? "opacity-60 cursor-not-allowed" : ""}`}
            >
              <option value="customer">Role: Customer</option>
              <option value="admin">Role: Admin</option>
            </select>
          </div>
        </div>

        {/* Highlights Tile Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-5 border-t border-stone-150 text-xs">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-stone-400 block">Phone</span>
            <span className="font-mono text-stone-800 font-medium mt-0.5 block">{customer.phone || "—"}</span>
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-stone-400 block">Total Lifetime Spend</span>
            <span className="font-black text-stone-900 mt-0.5 block">{formatPrice(customer.totalSpend)}</span>
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-stone-400 block">Orders Placed</span>
            <span className="font-extrabold text-stone-900 mt-0.5 block">{orders.length}</span>
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-stone-400 block">Registered On</span>
            <span className="text-stone-600 mt-0.5 block">{formatDate(customer.createdAt)}</span>
          </div>
        </div>
      </div>

      {/* Salesforce-Style Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-stone-200 pb-px">
        <button
          onClick={() => setActiveTab("overview")}
          className={`px-4 py-2.5 text-xs font-black uppercase tracking-wider transition-all border-b-2 cursor-pointer flex items-center gap-2 ${
            activeTab === "overview"
              ? "border-[#E0A99E] text-stone-900 bg-white rounded-t-xl"
              : "border-transparent text-stone-400 hover:text-stone-700 hover:bg-stone-50/50"
          }`}
        >
          <span>👤</span>
          <span>Overview</span>
          {isEditing && (
            <span className="px-1.5 py-0.2 bg-amber-100 text-amber-900 text-[9px] font-extrabold rounded-md uppercase">
              Editing
            </span>
          )}
        </button>

        <button
          onClick={() => {
            if (!isEditing) setActiveTab("orders");
            else showToast("Please save or cancel your profile edits before switching tabs.", "error");
          }}
          className={`px-4 py-2.5 text-xs font-black uppercase tracking-wider transition-all border-b-2 cursor-pointer flex items-center gap-2 ${
            activeTab === "orders"
              ? "border-[#E0A99E] text-stone-900 bg-white rounded-t-xl"
              : "border-transparent text-stone-400 hover:text-stone-700 hover:bg-stone-50/50"
          } ${isEditing ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <span>📦</span>
          <span>Orders</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
              orders.length > 0 ? "bg-[#E0A99E]/20 text-[#A65B4E]" : "bg-stone-100 text-stone-400"
            }`}
          >
            {orders.length}
          </span>
        </button>
      </div>

      {/* TAB CONTENT: OVERVIEW */}
      {activeTab === "overview" && (
        <form onSubmit={handleSaveProfile} className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
          {/* Contact Information Card */}
          <div className="bg-white rounded-3xl border border-stone-200/60 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black uppercase tracking-wider text-stone-800">
                Contact & Address Details
              </h3>
              {isEditing ? (
                <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                  Editing Mode Active
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleStartEdit}
                  className="text-xs font-bold text-[#A65B4E] hover:underline"
                >
                  Edit Details
                </button>
              )}
            </div>

            <div className="space-y-3.5 text-xs">
              {/* Full Name */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 py-1.5 border-b border-stone-100">
                <label className="text-stone-400 font-semibold sm:w-1/3">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    required
                    value={formData.name || ""}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Jane Doe"
                    className="sm:w-2/3 px-3 py-1.5 rounded-xl border border-stone-300 focus:border-[#A65B4E] focus:ring-1 focus:ring-[#A65B4E] outline-none text-xs font-bold text-stone-900"
                  />
                ) : (
                  <span className="font-bold text-stone-900 sm:w-2/3">{customer.name}</span>
                )}
              </div>

              {/* Email (Read-Only Authentication Identity) */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 py-1.5 border-b border-stone-100">
                <span className="text-stone-400 font-semibold sm:w-1/3 flex items-center gap-1">
                  <span>Email</span>
                  <span title="Account login identity (Read-Only)" className="text-[10px] text-stone-300">🔒</span>
                </span>
                <span className="font-mono text-stone-800 sm:w-2/3">{customer.email}</span>
              </div>

              {/* Phone */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 py-1.5 border-b border-stone-100">
                <label className="text-stone-400 font-semibold sm:w-1/3">Phone Number</label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={formData.phone || ""}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="e.g. +91 9876543210"
                    className="sm:w-2/3 px-3 py-1.5 rounded-xl border border-stone-300 focus:border-[#A65B4E] focus:ring-1 focus:ring-[#A65B4E] outline-none text-xs font-mono text-stone-900"
                  />
                ) : (
                  <span className="font-mono text-stone-800 sm:w-2/3">{customer.phone || "—"}</span>
                )}
              </div>

              {/* Street Address */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 py-1.5 border-b border-stone-100">
                <label className="text-stone-400 font-semibold sm:w-1/3">Street Address</label>
                {isEditing ? (
                  <textarea
                    rows={2}
                    value={formData.address || ""}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Apartment, Street address..."
                    className="sm:w-2/3 px-3 py-1.5 rounded-xl border border-stone-300 focus:border-[#A65B4E] focus:ring-1 focus:ring-[#A65B4E] outline-none text-xs text-stone-900 resize-none"
                  />
                ) : (
                  <span className="text-stone-800 sm:w-2/3">{customer.address || "—"}</span>
                )}
              </div>

              {/* City / State */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 py-1.5 border-b border-stone-100">
                <label className="text-stone-400 font-semibold sm:w-1/3">City & State</label>
                {isEditing ? (
                  <div className="flex items-center gap-2 sm:w-2/3">
                    <input
                      type="text"
                      value={formData.city || ""}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      placeholder="City"
                      className="w-1/2 px-3 py-1.5 rounded-xl border border-stone-300 focus:border-[#A65B4E] focus:ring-1 focus:ring-[#A65B4E] outline-none text-xs text-stone-900"
                    />
                    <input
                      type="text"
                      value={formData.state || ""}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      placeholder="State"
                      className="w-1/2 px-3 py-1.5 rounded-xl border border-stone-300 focus:border-[#A65B4E] focus:ring-1 focus:ring-[#A65B4E] outline-none text-xs text-stone-900"
                    />
                  </div>
                ) : (
                  <span className="text-stone-800 sm:w-2/3">
                    {[customer.city, customer.state].filter(Boolean).join(", ") || "—"}
                  </span>
                )}
              </div>

              {/* Country */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 py-1.5 border-b border-stone-100">
                <label className="text-stone-400 font-semibold sm:w-1/3">Country</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.country || ""}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    placeholder="e.g. India"
                    className="sm:w-2/3 px-3 py-1.5 rounded-xl border border-stone-300 focus:border-[#A65B4E] focus:ring-1 focus:ring-[#A65B4E] outline-none text-xs text-stone-900"
                  />
                ) : (
                  <span className="text-stone-800 sm:w-2/3">{customer.country || "—"}</span>
                )}
              </div>

              {/* Newsletter Subscribed */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 py-1.5">
                <label className="text-stone-400 font-semibold sm:w-1/3">Newsletter</label>
                {isEditing ? (
                  <label className="sm:w-2/3 flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={formData.newsletterSubscribed || false}
                      onChange={(e) => setFormData({ ...formData, newsletterSubscribed: e.target.checked })}
                      className="h-4 w-4 rounded text-[#A65B4E] focus:ring-[#A65B4E] border-stone-300 cursor-pointer"
                    />
                    <span className="text-xs text-stone-700 font-semibold">Subscribed to marketing & newsletters</span>
                  </label>
                ) : (
                  <span className="font-bold text-stone-800 sm:w-2/3">
                    {customer.newsletterSubscribed ? "Subscribed (Yes)" : "Not Subscribed (No)"}
                  </span>
                )}
              </div>
            </div>

            {/* In-Card Save / Cancel Footer when Editing */}
            {isEditing && (
              <div className="pt-4 border-t border-stone-150 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  disabled={isSaving}
                  className="px-3 py-1.5 text-xs font-bold rounded-xl border border-stone-200 bg-white text-stone-600 hover:bg-stone-50 transition cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-1.5 text-xs font-black uppercase tracking-wider rounded-xl border border-[#C68B7D] bg-[#A65B4E] text-white hover:bg-[#8F4C40] transition shadow-2xs cursor-pointer disabled:opacity-60 flex items-center gap-1.5"
                >
                  {isSaving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            )}
          </div>

          {/* System & Audit Card (Read-Only) */}
          <div className="bg-white rounded-3xl border border-stone-200/60 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black uppercase tracking-wider text-stone-800">
                System & Activity Information
              </h3>
              <span className="text-[10px] font-bold text-stone-400 bg-stone-100 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <span>🔒</span>
                <span>Protected Audit Metadata</span>
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-2 border-b border-stone-100">
                <span className="text-stone-400 font-semibold">Profile User ID</span>
                <span className="font-mono text-stone-800 text-[11px] select-all">{customer.id || "N/A"}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-stone-100">
                <span className="text-stone-400 font-semibold">Role</span>
                <span className="font-extrabold uppercase text-stone-900">{customer.role || "customer"}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-stone-100">
                <span className="text-stone-400 font-semibold">Account Status</span>
                <span className="font-extrabold uppercase text-stone-900">{customer.status || "active"}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-stone-100">
                <span className="text-stone-400 font-semibold">Account Created</span>
                <span className="text-stone-800">{formatDate(customer.createdAt)}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-stone-400 font-semibold">Last Sign In</span>
                <span className="text-stone-800">{formatDate(customer.lastSignInAt)}</span>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* TAB CONTENT: ORDERS */}
      {activeTab === "orders" && (
        <div className="bg-white rounded-3xl border border-stone-200/60 shadow-sm overflow-hidden animate-fadeIn">
          {/* Related List Header */}
          <div className="p-6 border-b border-stone-150 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-stone-50/50">
            <div>
              <h3 className="text-base font-black text-stone-900 flex items-center gap-2">
                <span>📦</span>
                <span>Customer Orders</span>
              </h3>
              <p className="text-xs text-stone-400 mt-0.5">
                {orders.length} {orders.length === 1 ? "order" : "orders"} placed by this customer • Total Value: {formatPrice(orders.reduce((sum, o) => sum + o.total, 0))}
              </p>
            </div>
          </div>

          {/* Orders Table */}
          {orders.length === 0 ? (
            <div className="p-12 text-center text-stone-400">
              <span className="text-3xl block mb-2">🛒</span>
              <p className="text-xs font-medium">No orders placed yet by this customer account.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="border-b border-stone-150 bg-stone-50 text-[10px] uppercase font-black tracking-wider text-stone-500 select-none">
                    <th className="py-3.5 px-6">Order ID</th>
                    <th className="py-3.5 px-4">Date</th>
                    <th className="py-3.5 px-4 text-center">Status</th>
                    <th className="py-3.5 px-4">Payment Method</th>
                    <th className="py-3.5 px-4 text-center">Items</th>
                    <th className="py-3.5 px-4 text-right">Total Amount</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-xs">
                  {orders.map((ord) => {
                    const orderHref = `/admin/orders/${ord.orderId}`;
                    return (
                      <tr key={ord.orderId} className="hover:bg-stone-50/80 transition-colors group">
                        {/* Order ID - Clickable Link to Order Audit/Workspace */}
                        <td className="py-3.5 px-6">
                          <Link
                            href={orderHref}
                            className="font-mono font-bold text-stone-900 group-hover:text-[#A65B4E] group-hover:underline flex items-center gap-1.5"
                          >
                            <span>{ord.orderId}</span>
                            <span className="text-[10px] text-stone-400 opacity-0 group-hover:opacity-100 transition-opacity">↗</span>
                          </Link>
                        </td>

                        {/* Order Date */}
                        <td className="py-3.5 px-4 text-stone-600 whitespace-nowrap">
                          {ord.orderDate}
                        </td>

                        {/* Status Badge */}
                        <td className="py-3.5 px-4 text-center">
                          <span
                            className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide border bg-stone-100 text-stone-700 border-stone-200"
                          >
                            {ord.status}
                          </span>
                        </td>

                        {/* Payment Method */}
                        <td className="py-3.5 px-4 text-stone-600 font-medium">
                          {ord.paymentMethod || "Credit Card"}
                        </td>

                        {/* Items Count */}
                        <td className="py-3.5 px-4 text-center">
                          <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-stone-100 text-stone-700">
                            {ord.itemsCount || ord.items?.length || 1} {ord.itemsCount === 1 ? "item" : "items"}
                          </span>
                        </td>

                        {/* Total Amount */}
                        <td className="py-3.5 px-4 text-right font-black text-stone-900">
                          {formatPrice(ord.total)}
                        </td>

                        {/* Action Link */}
                        <td className="py-3.5 px-6 text-right whitespace-nowrap">
                          <Link
                            href={orderHref}
                            className="px-3 py-1 text-[11px] font-extrabold rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-800 inline-flex items-center gap-1 transition shadow-2xs cursor-pointer"
                          >
                            <span>View Order</span>
                            <span>➔</span>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

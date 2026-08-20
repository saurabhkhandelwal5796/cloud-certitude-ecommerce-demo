"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/utils";
import {
  getAllReturnRequests,
  approveReturnRequest,
  rejectReturnRequest,
  markReturnProductReceived,
  updateRefundStatus,
  initiateOrUpdateRefund,
  getOrders,
  getRefundByOrderId,
  AdminOrder,
  RefundRecord,
  ReturnRequestRecord,
} from "@/services/AdminService";
import { isFullSnapshot, coerceLegacyItem } from "@/services/SnapshotService";

type ReturnFilterStatus = "All" | "Pending" | "Approved" | "Rejected" | "Returned";
type SortOption = "newest" | "oldest" | "reason" | "status";

/**
 * Salesforce-Style Returns & RMA Management Workspace (/admin/returns)
 *
 * Provides:
 * - Enterprise Object Header with dynamic record count and live Refresh
 * - Real-Time RMA Metric Cards (Pending, Approved, Rejected, Completed)
 * - Salesforce List View Filter Presets, Live Multi-Field Search, and Sorting
 * - Enhanced Table with Clickable Order & Customer Deep Links and dedicated Refund Status Column
 * - Detailed Expandable RMA Accordion with Item Thumbnails, Variant Breakdown, Shipping/Pickup Address,
 *   Customer Comments, Admin Notes, and 5-Stage Lifecycle Progress Tracker
 * - Modal Workflow for Recording Refund Completion and Gateway Audit IDs
 */
export default function AdminReturnsPage() {
  const [returnsList, setReturnsList] = useState<ReturnRequestRecord[]>([]);
  const [ordersMap, setOrdersMap] = useState<Record<string, AdminOrder>>({});
  const [refundsMap, setRefundsMap] = useState<Record<string, RefundRecord | null>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<ReturnFilterStatus>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [selectedNotes, setSelectedNotes] = useState<Record<string, string>>({});
  const [toastMsg, setToastMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [expandedReturnId, setExpandedReturnId] = useState<string | null>(null);

  // Refund Completion Modal State
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
  const [targetRefundId, setTargetRefundId] = useState<string | null>(null);
  const [modalTxId, setModalTxId] = useState("");
  const [modalRemarks, setModalRemarks] = useState("");
  const [isSubmittingRefund, setIsSubmittingRefund] = useState(false);

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMsg({ text, type });
    setTimeout(() => setToastMsg(null), 3500);
  };

  const fetchReturnsData = async (isManualRefresh = false) => {
    if (isManualRefresh) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const [returnsData, allOrders] = await Promise.all([
        getAllReturnRequests(),
        getOrders(),
      ]);
      setReturnsList(returnsData);

      // Build Order Lookup Map
      const ordMap: Record<string, AdminOrder> = {};
      allOrders.forEach((o) => {
        ordMap[o.orderId.toLowerCase()] = o;
      });
      setOrdersMap(ordMap);

      // Load Refund records for all return requests
      const refMap: Record<string, RefundRecord | null> = {};
      for (const ret of returnsData) {
        if (!refMap[ret.order_id]) {
          const ref = await getRefundByOrderId(ret.order_id);
          refMap[ret.order_id] = ref;
        }
      }
      setRefundsMap(refMap);

      if (isManualRefresh) {
        showToast("Returns registry refreshed successfully.");
      }
    } catch (err) {
      console.error("[AdminReturnsPage] Error loading returns data:", err);
      showToast("Failed to load return requests.", "error");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchReturnsData();
  }, []);

  const handleApprove = async (returnId: string) => {
    const notes = selectedNotes[returnId] || "";
    try {
      const success = await approveReturnRequest(returnId, notes);
      if (success) {
        showToast(`Return Request #${returnId.slice(0, 8)} approved.`);
        await fetchReturnsData();
      } else {
        showToast("Failed to approve return request.", "error");
      }
    } catch (err) {
      console.error("[AdminReturnsPage] Error approving return:", err);
      showToast("An error occurred while approving return.", "error");
    }
  };

  const handleReject = async (returnId: string) => {
    const notes = selectedNotes[returnId] || "";
    if (!notes.trim()) {
      showToast("Admin notes are required when rejecting a return request.", "error");
      return;
    }
    try {
      const success = await rejectReturnRequest(returnId, notes);
      if (success) {
        showToast(`Return Request #${returnId.slice(0, 8)} rejected.`);
        await fetchReturnsData();
      } else {
        showToast("Failed to reject return request.", "error");
      }
    } catch (err) {
      console.error("[AdminReturnsPage] Error rejecting return:", err);
      showToast("An error occurred while rejecting return.", "error");
    }
  };

  const handleMarkReceived = async (returnId: string) => {
    const notes = selectedNotes[returnId] || "";
    try {
      const success = await markReturnProductReceived(returnId, notes);
      if (success) {
        showToast(`Product receipt recorded for Return #${returnId.slice(0, 8)}.`);
        await fetchReturnsData();
      } else {
        showToast("Failed to mark returned product received.", "error");
      }
    } catch (err) {
      console.error("[AdminReturnsPage] Error marking product received:", err);
      showToast("An error occurred while recording product receipt.", "error");
    }
  };

  const handleInitiateRefund = async (
    orderId: string,
    customerEmail: string,
    amount: number,
    returnId?: string
  ) => {
    try {
      const notes = selectedNotes[orderId] || selectedNotes[returnId || ""] || "";
      const result = await initiateOrUpdateRefund(orderId, customerEmail, amount, returnId, notes);

      if (result.success) {
        showToast(`Refund for Order ${orderId} has been initiated.`);
        await fetchReturnsData();
      } else {
        showToast(result.error || "Failed to initiate refund.", "error");
      }
    } catch (err: any) {
      console.error("[AdminReturnsPage] Error initiating refund:", err);
      showToast(err?.message || "An error occurred while initiating refund.", "error");
    }
  };

  const openCompleteModal = (refundId: string) => {
    setTargetRefundId(refundId);
    setModalTxId("");
    setModalRemarks("Refund completed by admin");
    setIsCompleteModalOpen(true);
  };

  const handleConfirmComplete = async () => {
    if (!targetRefundId) return;
    setIsSubmittingRefund(true);
    try {
      const success = await updateRefundStatus(targetRefundId, "Completed", modalRemarks, modalTxId);
      if (success) {
        showToast("Refund recorded as completed.");
        setIsCompleteModalOpen(false);
        setTargetRefundId(null);
        await fetchReturnsData();
      } else {
        showToast("Failed to mark refund as completed.", "error");
      }
    } catch (err) {
      console.error("[AdminReturnsPage] Error completing refund:", err);
      showToast("An error occurred while completing refund.", "error");
    } finally {
      setIsSubmittingRefund(false);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedReturnId((prev) => (prev === id ? null : id));
  };

  // Helper to format timestamps
  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Badges styling
  const getReturnStatusBadgeStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "returned":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "rejected":
        return "bg-rose-100 text-rose-800 border-rose-200";
      default:
        return "bg-amber-100 text-amber-800 border-amber-200";
    }
  };

  const getRefundStatusBadgeStyle = (status?: string | null) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "initiated":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "pending":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "failed":
        return "bg-rose-100 text-rose-800 border-rose-200";
      default:
        return "bg-stone-100 text-stone-500 border-stone-200";
    }
  };

  // Metrics
  const pendingCount = returnsList.filter((r) => r.status.toLowerCase() === "pending").length;
  const approvedCount = returnsList.filter((r) => r.status.toLowerCase() === "approved").length;
  const rejectedCount = returnsList.filter((r) => r.status.toLowerCase() === "rejected").length;
  const returnedCount = returnsList.filter((r) => r.status.toLowerCase() === "returned").length;

  // Filtered & Sorted Return Requests
  const filteredReturns = useMemo(() => {
    return returnsList
      .filter((item) => {
        // Preset Status Filter
        if (activeFilter !== "All" && item.status.toLowerCase() !== activeFilter.toLowerCase()) {
          return false;
        }

        // Live Search Query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const ord = ordersMap[item.order_id.toLowerCase()];
          const custName = ord?.customerName || "";
          const matches =
            item.id.toLowerCase().includes(q) ||
            item.order_id.toLowerCase().includes(q) ||
            item.customer_email.toLowerCase().includes(q) ||
            custName.toLowerCase().includes(q) ||
            item.reason.toLowerCase().includes(q) ||
            (item.comments && item.comments.toLowerCase().includes(q));
          if (!matches) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "newest") {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }
        if (sortBy === "oldest") {
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        }
        if (sortBy === "reason") {
          return a.reason.localeCompare(b.reason);
        }
        if (sortBy === "status") {
          return a.status.localeCompare(b.status);
        }
        return 0;
      });
  }, [returnsList, activeFilter, searchQuery, sortBy, ordersMap]);

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

      {/* Salesforce-Style Object Header */}
      <div className="bg-white rounded-3xl border border-stone-200/60 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#E0A99E] to-stone-800 flex items-center justify-center text-white text-xl shadow-md">
              🔄
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-[#E0A99E] block">
                Operations Workspace
              </span>
              <h1 className="text-2xl font-black text-stone-900 tracking-tight">
                Returns & RMA Management
              </h1>
              <p className="text-xs text-stone-400 mt-0.5">
                {returnsList.length} total return requests • Reverse logistics & refund lifecycles
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchReturnsData(true)}
              disabled={isRefreshing}
              className="px-4 py-2 text-xs font-black uppercase tracking-wider rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 transition shadow-2xs cursor-pointer flex items-center gap-2 disabled:opacity-50"
            >
              <svg
                className={`h-3.5 w-3.5 text-stone-500 ${isRefreshing ? "animate-spin text-[#E0A99E]" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.5"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              <span>{isRefreshing ? "Refreshing..." : "Refresh"}</span>
            </button>
          </div>
        </div>

        {/* RMA Metric Summary Tiles */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-5 border-t border-stone-150">
          <div className="bg-amber-50/60 border border-amber-200/80 rounded-2xl p-3.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 block">
              Pending Returns
            </span>
            <span className="text-2xl font-black text-amber-950 mt-1 block">
              {pendingCount}
            </span>
          </div>

          <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-2xl p-3.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 block">
              Approved Returns
            </span>
            <span className="text-2xl font-black text-emerald-950 mt-1 block">
              {approvedCount}
            </span>
          </div>

          <div className="bg-rose-50/60 border border-rose-200/80 rounded-2xl p-3.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-rose-800 block">
              Rejected Returns
            </span>
            <span className="text-2xl font-black text-rose-950 mt-1 block">
              {rejectedCount}
            </span>
          </div>

          <div className="bg-blue-50/60 border border-blue-200/80 rounded-2xl p-3.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-blue-800 block">
              Completed Returns
            </span>
            <span className="text-2xl font-black text-blue-950 mt-1 block">
              {returnedCount}
            </span>
          </div>
        </div>
      </div>

      {/* Filter Presets, Search & Sorting Controls */}
      <div className="bg-white rounded-3xl border border-stone-200/60 p-4 shadow-sm space-y-3">
        {/* Preset Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
          {(["All", "Pending", "Approved", "Rejected", "Returned"] as ReturnFilterStatus[]).map((preset) => {
            const count =
              preset === "All"
                ? returnsList.length
                : returnsList.filter((r) => r.status.toLowerCase() === preset.toLowerCase()).length;
            const isSelected = activeFilter === preset;

            return (
              <button
                key={preset}
                onClick={() => setActiveFilter(preset)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? "bg-[#E0A99E] text-white shadow-2xs"
                    : "bg-stone-100 hover:bg-stone-200 text-stone-600"
                }`}
              >
                <span>{preset === "All" ? "All Returns" : preset}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    isSelected ? "bg-white/25 text-white" : "bg-white text-stone-500"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Live Search & Sort Dropdown */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-stone-100">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Return ID, Order ID, Customer Name, Email, or Reason..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-stone-200 bg-stone-50/50 text-xs focus:bg-white focus:border-[#A65B4E] focus:ring-1 focus:ring-[#A65B4E] outline-none transition"
            />
            <span className="absolute left-3 top-2.5 text-stone-400 text-xs">🔍</span>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-2 text-stone-400 hover:text-stone-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-stone-400 font-bold whitespace-nowrap">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="px-3 py-2 rounded-xl border border-stone-200 bg-stone-50 text-stone-700 font-bold text-xs outline-none cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="reason">Reason (A-Z)</option>
              <option value="status">Status</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main RMA Data Table */}
      <div className="bg-white rounded-3xl border border-stone-200/60 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-stone-400 font-light text-xs flex items-center justify-center gap-2">
            <svg className="h-5 w-5 animate-spin text-[#E0A99E]" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Loading RMA requests...
          </div>
        ) : filteredReturns.length === 0 ? (
          <div className="p-12 text-center text-stone-400 space-y-2">
            <span className="text-3xl block">📋</span>
            <p className="text-xs font-semibold text-stone-700">No return requests found.</p>
            <p className="text-xs text-stone-400">
              {searchQuery
                ? `No return matches "${searchQuery}".`
                : `No returns in "${activeFilter}" filter state.`}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[950px]">
              <thead>
                <tr className="border-b border-stone-150 bg-stone-50/80 text-[10px] uppercase font-black tracking-wider text-stone-500 select-none">
                  <th className="py-3.5 px-5">Return ID</th>
                  <th className="py-3.5 px-4">Order ID</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Request Date</th>
                  <th className="py-3.5 px-4">Reason</th>
                  <th className="py-3.5 px-4 text-center">Return Status</th>
                  <th className="py-3.5 px-4 text-center">Refund Status</th>
                  <th className="py-3.5 px-4 text-center">RMA Actions</th>
                  <th className="py-3.5 px-5 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-xs">
                {filteredReturns.map((ret) => {
                  const isExpanded = expandedReturnId === ret.id;
                  const associatedOrder = ordersMap[ret.order_id.toLowerCase()];
                  const associatedRefund = refundsMap[ret.order_id];

                  const customerName =
                    associatedOrder?.customerName || ret.customer_email.split("@")[0];
                  const customerHref = associatedOrder?.profileId
                    ? `/admin/customers/${associatedOrder.profileId}`
                    : `/admin/customers/${ret.customer_email}`;
                  const orderHref = `/admin/orders/${ret.order_id}`;

                  return (
                    <React.Fragment key={ret.id}>
                      <tr className="hover:bg-stone-50/80 transition-colors group">
                        {/* Return ID */}
                        <td className="py-3.5 px-5">
                          <span className="font-mono text-xs font-black text-stone-900 bg-stone-100 px-2 py-0.5 rounded-md">
                            #{ret.id.slice(0, 8)}
                          </span>
                        </td>

                        {/* Order ID - Clickable Link to Order Detail View */}
                        <td className="py-3.5 px-4">
                          <Link
                            href={orderHref}
                            className="font-mono font-bold text-stone-900 group-hover:text-[#A65B4E] group-hover:underline flex items-center gap-1"
                          >
                            <span>{ret.order_id}</span>
                            <span className="text-[10px] text-stone-400">↗</span>
                          </Link>
                        </td>

                        {/* Customer - Clickable Link to Customer Detail View */}
                        <td className="py-3.5 px-4">
                          <Link
                            href={customerHref}
                            className="font-bold text-stone-900 hover:text-[#A65B4E] hover:underline block truncate max-w-[160px]"
                          >
                            {customerName}
                          </Link>
                          <span className="text-[10px] font-mono text-stone-400 block truncate max-w-[160px]">
                            {ret.customer_email}
                          </span>
                        </td>

                        {/* Request Date */}
                        <td className="py-3.5 px-4 text-stone-600 whitespace-nowrap text-[11px]">
                          {formatDate(ret.created_at)}
                        </td>

                        {/* Reason */}
                        <td className="py-3.5 px-4">
                          <span className="font-semibold text-stone-800 bg-stone-50 border border-stone-200 px-2 py-0.5 rounded-md text-[11px] inline-block truncate max-w-[140px]">
                            {ret.reason}
                          </span>
                        </td>

                        {/* Return Status */}
                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wide border ${getReturnStatusBadgeStyle(
                              ret.status
                            )}`}
                          >
                            {ret.status}
                          </span>
                        </td>

                        {/* Dedicated Refund Status Column */}
                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wide border ${getRefundStatusBadgeStyle(
                              associatedRefund?.status
                            )}`}
                          >
                            {associatedRefund?.status || "None"}
                          </span>
                        </td>

                        {/* RMA Actions */}
                        <td className="py-3.5 px-4 text-center">
                          {ret.status.toLowerCase() === "pending" ? (
                            <div className="flex flex-col gap-1.5 min-w-[180px]">
                              <input
                                type="text"
                                placeholder="Admin note..."
                                value={selectedNotes[ret.id] || ""}
                                onChange={(e) =>
                                  setSelectedNotes({ ...selectedNotes, [ret.id]: e.target.value })
                                }
                                className="rounded-lg border border-stone-200 bg-stone-50 px-2.5 py-1 text-[10px] focus:outline-none focus:ring-1 focus:ring-[#A65B4E]"
                              />
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  onClick={() => handleApprove(ret.id)}
                                  className="rounded-lg bg-emerald-700 px-2.5 py-1 text-[10px] font-black uppercase text-white hover:bg-emerald-800 transition cursor-pointer shadow-2xs"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleReject(ret.id)}
                                  className="rounded-lg bg-rose-700 px-2.5 py-1 text-[10px] font-black uppercase text-white hover:bg-rose-800 transition cursor-pointer shadow-2xs"
                                >
                                  Reject
                                </button>
                              </div>
                            </div>
                          ) : ret.status.toLowerCase() === "approved" ? (
                            <button
                              onClick={() => handleMarkReceived(ret.id)}
                              className="rounded-lg bg-blue-700 px-3 py-1 text-[10px] font-black uppercase text-white hover:bg-blue-800 transition shadow-2xs cursor-pointer whitespace-nowrap"
                            >
                              Confirm Received
                            </button>
                          ) : ret.status.toLowerCase() === "returned" && (!associatedRefund || associatedRefund.status === "Pending") ? (
                            <button
                              onClick={() =>
                                handleInitiateRefund(
                                  ret.order_id,
                                  ret.customer_email,
                                  associatedOrder?.grand_total !== undefined ? associatedOrder.grand_total : associatedOrder?.total || 0,
                                  ret.id
                                )
                              }
                              className="rounded-lg bg-purple-700 px-3 py-1 text-[10px] font-black uppercase text-white hover:bg-purple-800 transition shadow-2xs cursor-pointer whitespace-nowrap"
                            >
                              Initiate Refund
                            </button>
                          ) : ret.status.toLowerCase() === "returned" && associatedRefund?.status === "Initiated" ? (
                            <button
                              onClick={() => openCompleteModal(associatedRefund.id)}
                              className="rounded-lg bg-emerald-700 px-3 py-1 text-[10px] font-black uppercase text-white hover:bg-emerald-800 transition shadow-2xs cursor-pointer whitespace-nowrap"
                            >
                              Complete Refund
                            </button>
                          ) : (
                            <span className="text-[10px] text-stone-400 font-semibold italic">
                              {associatedRefund ? `Refund ${associatedRefund.status}` : ret.status.toLowerCase() === "returned" ? "Product Received" : "Closed"}
                            </span>
                          )}
                        </td>

                        {/* Details Toggle Button */}
                        <td className="py-3.5 px-5 text-right">
                          <button
                            onClick={() => toggleExpand(ret.id)}
                            className="rounded-xl border border-stone-200 bg-stone-50 px-2.5 py-1 text-[10px] font-black uppercase text-stone-700 hover:bg-stone-100 transition cursor-pointer whitespace-nowrap"
                          >
                            {isExpanded ? "Hide ▲" : "View Details ▼"}
                          </button>
                        </td>
                      </tr>

                      {/* Expandable Return Detail Section */}
                      {isExpanded && (
                        <tr className="bg-stone-50/60 border-b border-stone-200">
                          <td colSpan={9} className="p-6">
                            <div className="space-y-6 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm text-left">
                              {/* Panel Header with Deep Links */}
                              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-stone-150 pb-4">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-black uppercase tracking-wider text-[#A65B4E]">
                                      RMA Record Overview
                                    </span>
                                    <span className="text-stone-300">•</span>
                                    <span className="font-mono text-xs font-bold text-stone-800">
                                      ID: {ret.id}
                                    </span>
                                  </div>
                                  <h4 className="text-sm font-black text-stone-900 mt-0.5">
                                    Return for Order #{ret.order_id}
                                  </h4>
                                </div>

                                <div className="flex items-center gap-2">
                                  <Link
                                    href={orderHref}
                                    className="px-3 py-1.5 text-[11px] font-bold rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-800 inline-flex items-center gap-1 transition"
                                  >
                                    <span>📦 View Order Audit</span>
                                    <span>↗</span>
                                  </Link>
                                  <Link
                                    href={customerHref}
                                    className="px-3 py-1.5 text-[11px] font-bold rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-800 inline-flex items-center gap-1 transition"
                                  >
                                    <span>👤 View Customer Profile</span>
                                    <span>↗</span>
                                  </Link>
                                </div>
                              </div>

                              {/* Structured Return Items Breakdown */}
                              <div>
                                <span className="block text-[10px] font-black uppercase tracking-wider text-stone-400 mb-3">
                                  Purchased Order Items
                                </span>
                                {associatedOrder?.items && associatedOrder.items.length > 0 ? (
                                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {associatedOrder.items.map((rawItem, iIdx) => {
                                      const item = isFullSnapshot(rawItem)
                                        ? rawItem
                                        : coerceLegacyItem(rawItem as any);

                                      return (
                                        <div
                                          key={iIdx}
                                          className="p-3 rounded-2xl border border-stone-200 bg-stone-50/50 flex items-start gap-3 text-xs"
                                        >
                                          <div className="relative h-16 w-14 rounded-xl border border-stone-200 overflow-hidden bg-white shrink-0">
                                            {item.productImage ? (
                                              <Image
                                                src={item.productImage}
                                                alt={item.productName}
                                                fill
                                                sizes="60px"
                                                className="object-cover"
                                              />
                                            ) : (
                                              <div className="w-full h-full flex items-center justify-center text-[9px] text-stone-400">
                                                No Img
                                              </div>
                                            )}
                                          </div>
                                          <div className="min-w-0 flex-1">
                                            <h5 className="font-bold text-stone-900 truncate">
                                              {item.productName}
                                            </h5>
                                            <p className="font-mono text-[10px] text-stone-500 mt-0.5">
                                              SKU: {item.sku || "N/A"}
                                            </p>
                                            <div className="flex flex-wrap gap-1 mt-1">
                                              {Object.entries(item.attributes || {}).map(([k, v]) => (
                                                <span
                                                  key={k}
                                                  className="bg-white border border-stone-200 px-1.5 py-0.2 rounded text-[9px] font-semibold text-stone-700"
                                                >
                                                  {k}: {v}
                                                </span>
                                              ))}
                                            </div>
                                            <div className="flex justify-between items-center mt-2 pt-1 border-t border-stone-200/60 font-bold text-stone-800">
                                              <span>Qty: {item.pricing.quantity}</span>
                                              <span>{formatPrice(item.pricing.lineTotal ?? item.pricing.subtotal)}</span>
                                            </div>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                ) : (
                                  <p className="text-xs text-stone-400 italic">No structured items archived.</p>
                                )}
                              </div>

                              {/* Details Grid: Contact, Reason, Comments, and Refund Audit */}
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs border-t border-stone-150 pt-5">
                                {/* Col 1: Customer Contact & Pickup Address */}
                                <div className="space-y-2">
                                  <span className="block text-[10px] font-black uppercase tracking-wider text-stone-400">
                                    Customer & Pickup Address
                                  </span>
                                  <div>
                                    <span className="text-stone-400 text-[10px]">Name: </span>
                                    <span className="font-bold text-stone-900">{customerName}</span>
                                  </div>
                                  <div>
                                    <span className="text-stone-400 text-[10px]">Email: </span>
                                    <span className="font-mono text-stone-800">{ret.customer_email}</span>
                                  </div>
                                  {associatedOrder?.address?.phone && (
                                    <div>
                                      <span className="text-stone-400 text-[10px]">Phone: </span>
                                      <span className="font-mono text-stone-800">{associatedOrder.address.phone}</span>
                                    </div>
                                  )}
                                  {associatedOrder?.address && (
                                    <div className="pt-1 text-[11px] text-stone-700">
                                      <span className="text-stone-400 text-[10px] block">Address:</span>
                                      <span>
                                        {[
                                          associatedOrder.address.addressLine1,
                                          associatedOrder.address.city,
                                          associatedOrder.address.state,
                                          associatedOrder.address.country,
                                        ]
                                          .filter(Boolean)
                                          .join(", ")}
                                      </span>
                                    </div>
                                  )}
                                </div>

                                {/* Col 2: Reason & Customer Comments */}
                                <div className="space-y-2">
                                  <span className="block text-[10px] font-black uppercase tracking-wider text-stone-400">
                                    Return Reason & Comments
                                  </span>
                                  <div>
                                    <span className="font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 text-[11px] inline-block">
                                      {ret.reason}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-stone-400 text-[10px] block">Customer Comments:</span>
                                    <p className="text-stone-700 italic text-[11px] bg-stone-50 p-2.5 rounded-xl border border-stone-200 mt-1">
                                      {ret.comments ? `"${ret.comments}"` : "No comments provided."}
                                    </p>
                                  </div>
                                  {ret.admin_notes && (
                                    <div>
                                      <span className="text-stone-400 text-[10px] block">Admin Notes:</span>
                                      <p className="text-stone-800 font-medium text-[11px] bg-amber-50/50 p-2 rounded-xl border border-amber-200 mt-0.5">
                                        {ret.admin_notes}
                                      </p>
                                    </div>
                                  )}
                                </div>

                                {/* Col 3: Timestamps & Refund Audit Details */}
                                <div className="space-y-2">
                                  <span className="block text-[10px] font-black uppercase tracking-wider text-stone-400">
                                    Timestamps & Financial Audit
                                  </span>
                                  <div>
                                    <span className="text-stone-400 text-[10px]">Requested: </span>
                                    <span className="font-medium text-stone-800">{formatDate(ret.created_at)}</span>
                                  </div>
                                  <div>
                                    <span className="text-stone-400 text-[10px]">Product Received: </span>
                                    <span className="font-medium text-stone-800">
                                      {ret.received_at ? formatDate(ret.received_at) : "Pending Warehouse Receipt"}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-stone-400 text-[10px]">Refund Tx ID: </span>
                                    <span className="font-mono font-bold text-stone-900 block select-all">
                                      {associatedRefund?.refund_transaction_id || "N/A"}
                                    </span>
                                  </div>
                                  {associatedRefund?.processed_at && (
                                    <div>
                                      <span className="text-stone-400 text-[10px]">Refund Processed: </span>
                                      <span className="font-medium text-stone-800">{formatDate(associatedRefund.processed_at)}</span>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* 5-Stage Return & Refund Progress Lifecycle Timeline */}
                              <div className="border-t border-stone-150 pt-5">
                                <span className="block text-[10px] font-black uppercase tracking-wider text-stone-400 mb-3">
                                  5-Stage Return & Refund Progress Lifecycle
                                </span>
                                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
                                  {/* Stage 1 */}
                                  <div className="p-3 rounded-2xl border border-emerald-200 bg-emerald-50/60">
                                    <span className="block text-[9px] font-black uppercase text-emerald-700">1. Return Requested</span>
                                    <span className="block text-[10px] text-emerald-900 font-bold mt-1">Done ✓</span>
                                    <span className="block text-[9px] text-emerald-700/80 font-light mt-0.5">
                                      {new Date(ret.created_at).toLocaleDateString()}
                                    </span>
                                  </div>

                                  {/* Stage 2 */}
                                  <div
                                    className={`p-3 rounded-2xl border ${
                                      ret.status.toLowerCase() === "rejected"
                                        ? "border-rose-200 bg-rose-50/60 text-rose-900"
                                        : ret.status.toLowerCase() === "approved" || ret.status.toLowerCase() === "returned"
                                        ? "border-emerald-200 bg-emerald-50/60 text-emerald-900"
                                        : "border-stone-200 bg-stone-50/60 text-stone-400"
                                    }`}
                                  >
                                    <span className="block text-[9px] font-black uppercase">
                                      2. {ret.status.toLowerCase() === "rejected" ? "Return Rejected" : "Return Approved"}
                                    </span>
                                    <span className="block text-[10px] font-bold mt-1">
                                      {ret.status.toLowerCase() === "pending" ? "Pending" : "Done ✓"}
                                    </span>
                                  </div>

                                  {/* Stage 3 */}
                                  <div
                                    className={`p-3 rounded-2xl border ${
                                      ret.status.toLowerCase() === "returned"
                                        ? "border-emerald-200 bg-emerald-50/60 text-emerald-900"
                                        : "border-stone-200 bg-stone-50/60 text-stone-400"
                                    }`}
                                  >
                                    <span className="block text-[9px] font-black uppercase">3. Product Received</span>
                                    <span className="block text-[10px] font-bold mt-1">
                                      {ret.status.toLowerCase() === "returned" ? "Received ✓" : "Pending"}
                                    </span>
                                    {ret.received_at && (
                                      <span className="block text-[9px] font-light mt-0.5">
                                        {new Date(ret.received_at).toLocaleDateString()}
                                      </span>
                                    )}
                                  </div>

                                  {/* Stage 4 */}
                                  <div
                                    className={`p-3 rounded-2xl border ${
                                      associatedRefund?.status === "Initiated" || associatedRefund?.status === "Completed"
                                        ? "border-emerald-200 bg-emerald-50/60 text-emerald-900"
                                        : "border-stone-200 bg-stone-50/60 text-stone-400"
                                    }`}
                                  >
                                    <span className="block text-[9px] font-black uppercase">4. Refund Initiated</span>
                                    <span className="block text-[10px] font-bold mt-1">
                                      {associatedRefund?.status === "Initiated" || associatedRefund?.status === "Completed" ? "Initiated ✓" : "Pending"}
                                    </span>
                                  </div>

                                  {/* Stage 5 */}
                                  <div
                                    className={`p-3 rounded-2xl border ${
                                      associatedRefund?.status === "Completed"
                                        ? "border-emerald-200 bg-emerald-50/60 text-emerald-900"
                                        : "border-stone-200 bg-stone-50/60 text-stone-400"
                                    }`}
                                  >
                                    <span className="block text-[9px] font-black uppercase">5. Refund Completed</span>
                                    <span className="block text-[10px] font-bold mt-1">
                                      {associatedRefund?.status === "Completed" ? "Completed ✓" : "Pending"}
                                    </span>
                                    {associatedRefund?.processed_at && (
                                      <span className="block text-[9px] font-light mt-0.5">
                                        {new Date(associatedRefund.processed_at).toLocaleDateString()}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Refund Completion Modal */}
      {isCompleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl space-y-5 text-left border border-stone-200">
            <div className="border-b border-stone-150 pb-3">
              <h3 className="text-sm font-black uppercase tracking-wider text-stone-900">
                Mark Refund Completed
              </h3>
              <p className="text-[10px] text-stone-400 font-light mt-0.5">
                Record refund transaction ID and administrator settlement remarks.
              </p>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1">
                  Gateway / Bank Transaction ID (Optional)
                </label>
                <input
                  type="text"
                  value={modalTxId}
                  onChange={(e) => setModalTxId(e.target.value)}
                  placeholder="e.g. TXN-RFD-981245"
                  className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-xs font-mono font-medium focus:outline-none focus:ring-1 focus:ring-[#A65B4E]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1">
                  Settlement Remarks (Optional)
                </label>
                <textarea
                  rows={3}
                  value={modalRemarks}
                  onChange={(e) => setModalRemarks(e.target.value)}
                  placeholder="Enter remarks or settlement reference..."
                  className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#A65B4E] resize-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-stone-150 pt-4">
              <button
                type="button"
                onClick={() => setIsCompleteModalOpen(false)}
                disabled={isSubmittingRefund}
                className="rounded-xl border border-stone-200 bg-white px-4 py-2 text-xs font-bold text-stone-600 hover:bg-stone-50 transition cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmComplete}
                disabled={isSubmittingRefund}
                className="rounded-xl bg-emerald-700 px-5 py-2 text-xs font-black text-white hover:bg-emerald-800 transition shadow-sm cursor-pointer uppercase tracking-wider disabled:opacity-60 flex items-center gap-1.5"
              >
                {isSubmittingRefund ? "Recording..." : "Confirm Completion"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

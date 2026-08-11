// @ts-nocheck
"use client";

import React, { useState, useEffect } from "react";
import {
  getAllReturnRequests,
  approveReturnRequest,
  rejectReturnRequest,
  markReturnProductReceived,
  updateRefundStatus,
  getOrders,
  getRefundByOrderId,
  AdminOrder,
  RefundRecord,
  ReturnRequestRecord,
} from "@/services/AdminService";
import { isFullSnapshot } from "@/services/SnapshotService";

/** Resolves a display name from either a full snapshot or a legacy order item. */
function getItemName(item: NonNullable<AdminOrder["items"]>[number]): string {
  return isFullSnapshot(item) ? item.productName : item.name;
}

type ReturnFilterStatus = "All" | "Pending" | "Approved" | "Rejected" | "Returned";

export default function AdminReturnsPage() {
  const [returnsList, setReturnsList] = useState<ReturnRequestRecord[]>([]);
  const [ordersMap, setOrdersMap] = useState<Record<string, AdminOrder>>({});
  const [refundsMap, setRefundsMap] = useState<Record<string, RefundRecord | null>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<ReturnFilterStatus>("All");
  const [selectedNotes, setSelectedNotes] = useState<Record<string, string>>({});
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [expandedReturnId, setExpandedReturnId] = useState<string | null>(null);

  const fetchReturns = async () => {
    setIsLoading(true);
    try {
      const [returnsData, allOrders] = await Promise.all([
        getAllReturnRequests(),
        getOrders(),
      ]);
      setReturnsList(returnsData);

      // Build map of orderId -> AdminOrder
      const map: Record<string, AdminOrder> = {};
      allOrders.forEach((o) => {
        map[o.orderId] = o;
      });
      setOrdersMap(map);

      // Fetch refunds for orders with returns
      const refMap: Record<string, RefundRecord | null> = {};
      for (const ret of returnsData) {
        if (!refMap[ret.order_id]) {
          const ref = await getRefundByOrderId(ret.order_id);
          refMap[ret.order_id] = ref;
        }
      }
      setRefundsMap(refMap);
    } catch (err) {
      console.error("[AdminReturnsPage] Error loading return requests:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReturns();
  }, []);

  const handleApprove = async (returnId: string) => {
    const notes = selectedNotes[returnId] || "";
    try {
      const success = await approveReturnRequest(returnId, notes);
      if (success) {
        setActionMessage(`Return request #${returnId.slice(0, 8)} approved.`);
        setTimeout(() => setActionMessage(null), 3000);
        await fetchReturns();
      } else {
        alert("Failed to approve return request.");
      }
    } catch (err) {
      console.error("[AdminReturnsPage] Error approving return:", err);
    }
  };

  const handleReject = async (returnId: string) => {
    const notes = selectedNotes[returnId] || "";
    if (!notes.trim()) {
      alert("Admin notes are required when rejecting a return request.");
      return;
    }
    try {
      const success = await rejectReturnRequest(returnId, notes);
      if (success) {
        setActionMessage(`Return request #${returnId.slice(0, 8)} rejected.`);
        setTimeout(() => setActionMessage(null), 3000);
        await fetchReturns();
      } else {
        alert("Failed to reject return request.");
      }
    } catch (err) {
      console.error("[AdminReturnsPage] Error rejecting return:", err);
    }
  };

  const handleMarkReceived = async (returnId: string) => {
    const notes = selectedNotes[returnId] || "";
    try {
      const success = await markReturnProductReceived(returnId, notes);
      if (success) {
        setActionMessage(`Return #${returnId.slice(0, 8)} marked as returned product received.`);
        setTimeout(() => setActionMessage(null), 3000);
        await fetchReturns();
      } else {
        alert("Failed to mark returned product received.");
      }
    } catch (err) {
      console.error("[AdminReturnsPage] Error marking product received:", err);
    }
  };

  const handleInitiateRefund = async (orderId: string, refundId?: string) => {
    try {
      const notes = selectedNotes[orderId] || "";
      let targetId = refundId;

      if (!targetId) {
        const existingRef = await getRefundByOrderId(orderId);
        if (existingRef) targetId = existingRef.id;
      }

      if (targetId) {
        const success = await updateRefundStatus(targetId, "Initiated", notes);
        if (success) {
          setActionMessage(`Refund for order ${orderId} has been initiated successfully.`);
          setTimeout(() => setActionMessage(null), 3000);
          await fetchReturns();
        } else {
          alert("Failed to initiate refund.");
        }
      } else {
        alert("Refund record not found for this order.");
      }
    } catch (err) {
      console.error("[AdminReturnsPage] Error initiating refund:", err);
    }
  };

  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
  const [targetRefundId, setTargetRefundId] = useState<string | null>(null);
  const [modalTxId, setModalTxId] = useState("");
  const [modalRemarks, setModalRemarks] = useState("");

  const openCompleteModal = (refundId: string) => {
    setTargetRefundId(refundId);
    setModalTxId("");
    setModalRemarks("Refund completed by admin");
    setIsCompleteModalOpen(true);
  };

  const handleConfirmComplete = async () => {
    if (!targetRefundId) return;
    try {
      const success = await updateRefundStatus(targetRefundId, "Completed", modalRemarks, modalTxId);
      if (success) {
        setActionMessage("Refund completed successfully.");
        setTimeout(() => setActionMessage(null), 3000);
        setIsCompleteModalOpen(false);
        setTargetRefundId(null);
        await fetchReturns();
      } else {
        alert("Failed to mark refund completed.");
      }
    } catch (err) {
      console.error("[AdminReturnsPage] Error completing refund:", err);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedReturnId((prev) => (prev === id ? null : id));
  };

  const filteredReturns = returnsList.filter((item) => {
    if (activeFilter === "All") return true;
    return item.status.toLowerCase() === activeFilter.toLowerCase();
  });

  const getStatusBadgeStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "returned":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "rejected":
        return "bg-rose-50 text-rose-700 border-rose-200";
      default:
        return "bg-amber-50 text-amber-700 border-amber-200";
    }
  };

  const pendingCount = returnsList.filter((r) => r.status.toLowerCase() === "pending").length;
  const approvedCount = returnsList.filter((r) => r.status.toLowerCase() === "approved").length;
  const rejectedCount = returnsList.filter((r) => r.status.toLowerCase() === "rejected").length;
  const returnedCount = returnsList.filter((r) => r.status.toLowerCase() === "returned").length;

  return (
    <div className="space-y-8 p-6 lg:p-10 max-w-7xl mx-auto text-left">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-stone-200/60 pb-6">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-wider text-stone-900">
            Product Return Requests
          </h1>
          <p className="text-xs text-stone-500 font-light mt-1">
            Review, approve, reject, and confirm receipt for customer product returns.
          </p>
        </div>
      </div>

      {actionMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2">
          <span>✓</span>
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-amber-250 bg-amber-50/60 p-4 text-left shadow-sm">
          <span className="block text-[9px] font-black uppercase tracking-widest text-amber-700">Pending Returns</span>
          <span className="text-2xl font-black text-amber-950 mt-1 block">{pendingCount}</span>
        </div>
        <div className="rounded-2xl border border-emerald-250 bg-emerald-50/60 p-4 text-left shadow-sm">
          <span className="block text-[9px] font-black uppercase tracking-widest text-emerald-700">Approved Returns</span>
          <span className="text-2xl font-black text-emerald-950 mt-1 block">{approvedCount}</span>
        </div>
        <div className="rounded-2xl border border-rose-250 bg-rose-50/60 p-4 text-left shadow-sm">
          <span className="block text-[9px] font-black uppercase tracking-widest text-rose-700">Rejected Returns</span>
          <span className="text-2xl font-black text-rose-950 mt-1 block">{rejectedCount}</span>
        </div>
        <div className="rounded-2xl border border-blue-250 bg-blue-50/60 p-4 text-left shadow-sm">
          <span className="block text-[9px] font-black uppercase tracking-widest text-blue-700">Completed Returns</span>
          <span className="text-2xl font-black text-blue-950 mt-1 block">{returnedCount}</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-stone-200 pb-3 overflow-x-auto">
        {(["All", "Pending", "Approved", "Rejected", "Returned"] as ReturnFilterStatus[]).map((tab) => {
          const count =
            tab === "All"
              ? returnsList.length
              : returnsList.filter((r) => r.status.toLowerCase() === tab.toLowerCase()).length;
          const isActive = activeFilter === tab;

          return (
            <button
              key={tab}
              onClick={() => setActiveFilter(tab)}
              className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? "bg-[#E0A99E] text-white shadow-sm"
                  : "bg-white text-stone-600 hover:bg-stone-100 border border-stone-200"
              }`}
            >
              {tab} ({count})
            </button>
          );
        })}
      </div>

      {/* Data Table */}
      <div className="rounded-2xl border border-stone-200 bg-white shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-stone-400 font-light text-xs flex items-center justify-center gap-2">
            <svg className="h-4 w-4 animate-spin text-[#E0A99E]" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Loading return requests...
          </div>
        ) : filteredReturns.length === 0 ? (
          <div className="p-12 text-center text-stone-400 font-light text-xs space-y-2">
            <span className="text-3xl block">📋</span>
            <p>No return requests match the selected filter ({activeFilter}).</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-stone-150 bg-stone-50/80 text-[10px] uppercase font-bold tracking-wider text-stone-400">
                  <th className="py-4 px-6">Order ID</th>
                  <th className="py-4 px-6">Customer Details</th>
                  <th className="py-4 px-6">Return Reason</th>
                  <th className="py-4 px-6">Comments</th>
                  <th className="py-4 px-6">Created Date</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-center">Actions</th>
                  <th className="py-4 px-4 text-center">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-xs">
                {filteredReturns.map((ret) => {
                  const isExpanded = expandedReturnId === ret.id;
                  const associatedOrder = ordersMap[ret.order_id];
                  const associatedRefund = refundsMap[ret.order_id];
                  const productNames = associatedOrder?.items?.map((i) => getItemName(i)).join(", ") || "Order Items";

                  return (
                    <React.Fragment key={ret.id}>
                      <tr className="hover:bg-stone-50/50 transition-colors">
                        {/* Order ID */}
                        <td className="py-4 px-6 font-mono font-bold text-stone-900 uppercase">
                          {ret.order_id}
                        </td>

                        {/* Customer Details */}
                        <td className="py-4 px-6">
                          <span className="block font-bold text-stone-900">
                            {ret.customer_email.split("@")[0]}
                          </span>
                          <span className="block text-[10px] text-stone-400 font-light select-all">
                            {ret.customer_email}
                          </span>
                        </td>

                        {/* Return Reason */}
                        <td className="py-4 px-6 font-semibold text-stone-800">
                          {ret.reason}
                        </td>

                        {/* Comments */}
                        <td className="py-4 px-6 max-w-xs">
                          <p className="text-stone-600 font-light truncate">
                            {ret.comments || <span className="text-stone-300 italic">No comments</span>}
                          </p>
                        </td>

                        {/* Created Date */}
                        <td className="py-4 px-6 text-stone-500 font-light text-[11px]">
                          {new Date(ret.created_at).toLocaleString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                        </td>

                        {/* Status */}
                        <td className="py-4 px-6">
                          <span
                            className={`inline-block rounded-full px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider border ${getStatusBadgeStyle(
                              ret.status
                            )}`}
                          >
                            {ret.status}
                          </span>
                          {ret.admin_notes && (
                            <span className="block text-[9px] text-stone-400 font-light mt-1 truncate max-w-[140px]">
                              Note: {ret.admin_notes}
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-6 text-center">
                          {ret.status.toLowerCase() === "pending" ? (
                            <div className="flex flex-col gap-2 min-w-[180px]">
                              <input
                                type="text"
                                placeholder="Optional admin note..."
                                value={selectedNotes[ret.id] || ""}
                                onChange={(e) =>
                                  setSelectedNotes({ ...selectedNotes, [ret.id]: e.target.value })
                                }
                                className="rounded-lg border border-stone-200 bg-stone-50 px-2.5 py-1 text-[10px] font-light focus:outline-none focus:ring-1 focus:ring-[#E0A99E]"
                              />
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => handleApprove(ret.id)}
                                  className="rounded-full bg-emerald-600 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white hover:bg-emerald-700 transition-colors shadow-sm cursor-pointer"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleReject(ret.id)}
                                  className="rounded-full bg-rose-600 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white hover:bg-rose-700 transition-colors shadow-sm cursor-pointer"
                                >
                                  Reject
                                </button>
                              </div>
                            </div>
                          ) : ret.status.toLowerCase() === "approved" ? (
                            <div className="flex flex-col items-center gap-1.5 min-w-[160px]">
                              <button
                                onClick={() => handleMarkReceived(ret.id)}
                                className="rounded-full bg-blue-600 px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white hover:bg-blue-700 transition-colors shadow-sm cursor-pointer whitespace-nowrap"
                              >
                                Mark Product Received
                              </button>
                            </div>
                          ) : ret.status.toLowerCase() === "returned" && (!associatedRefund || associatedRefund.status === "Pending") ? (
                            <div className="flex flex-col items-center gap-1.5 min-w-[160px]">
                              <button
                                onClick={() => handleInitiateRefund(ret.order_id, associatedRefund?.id)}
                                className="rounded-full bg-purple-600 px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white hover:bg-purple-700 transition-colors shadow-sm cursor-pointer whitespace-nowrap"
                              >
                                Initiate Refund
                              </button>
                            </div>
                          ) : ret.status.toLowerCase() === "returned" && associatedRefund?.status === "Initiated" ? (
                            <div className="flex flex-col items-center gap-1.5 min-w-[160px]">
                              <button
                                onClick={() => openCompleteModal(associatedRefund.id)}
                                className="rounded-full bg-emerald-700 px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white hover:bg-emerald-800 transition-colors shadow-sm cursor-pointer whitespace-nowrap"
                              >
                                Mark Refund Completed
                              </button>
                            </div>
                          ) : (
                            <span className="text-[10px] text-stone-400 font-light italic">
                              {associatedRefund ? `Refund ${associatedRefund.status}` : ret.status.toLowerCase() === "returned" ? "Product Received" : "Action completed"}
                            </span>
                          )}
                        </td>

                        {/* Details Toggle Button */}
                        <td className="py-4 px-4 text-center">
                          <button
                            onClick={() => toggleExpand(ret.id)}
                            className="rounded-xl border border-stone-200 bg-stone-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer whitespace-nowrap"
                          >
                            {isExpanded ? "Hide ▲" : "View Details ▼"}
                          </button>
                        </td>
                      </tr>

                      {/* Expandable Return Details Panel */}
                      {isExpanded && (
                        <tr className="bg-[#FBF9F5]/80 border-b border-stone-200">
                          <td colSpan={8} className="p-6">
                            <div className="space-y-6 rounded-2xl border border-stone-200/80 bg-white p-6 shadow-sm text-left">
                              {/* Panel Title */}
                              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-stone-100 pb-4">
                                <div>
                                  <h4 className="text-xs font-black uppercase tracking-wider text-stone-900">
                                    Return Details — <span className="font-mono">{ret.id}</span>
                                  </h4>
                                  <p className="text-[10px] text-stone-400 font-light">
                                    Read-only system audit view for Return Request #{ret.id.slice(0, 8)}
                                  </p>
                                </div>
                                <span
                                  className={`rounded-full px-3 py-0.5 text-[9px] font-black uppercase tracking-wider border ${getStatusBadgeStyle(
                                    ret.status
                                  )}`}
                                >
                                  {ret.status}
                                </span>
                              </div>

                              {/* Details Grid */}
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
                                {/* Left Column: Identity & Contact */}
                                <div className="space-y-2.5">
                                  <span className="block text-[10px] font-bold uppercase tracking-wider text-stone-400">
                                    Order & Customer Info
                                  </span>
                                  <div>
                                    <span className="text-stone-400 font-light text-[10px]">Return ID: </span>
                                    <span className="font-mono font-medium text-stone-800 select-all">{ret.id}</span>
                                  </div>
                                  <div>
                                    <span className="text-stone-400 font-light text-[10px]">Order ID: </span>
                                    <span className="font-mono font-bold text-stone-900 select-all">{ret.order_id}</span>
                                  </div>
                                  <div>
                                    <span className="text-stone-400 font-light text-[10px]">Customer Name: </span>
                                    <span className="font-bold text-stone-900">
                                      {associatedOrder?.customerName || ret.customer_email.split("@")[0]}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-stone-400 font-light text-[10px]">Customer Email: </span>
                                    <span className="font-medium text-stone-700 select-all">{ret.customer_email}</span>
                                  </div>
                                </div>

                                {/* Middle Column: Product & Return Reason */}
                                <div className="space-y-2.5">
                                  <span className="block text-[10px] font-bold uppercase tracking-wider text-stone-400">
                                    Product & Request Reason
                                  </span>
                                  <div>
                                    <span className="text-stone-400 font-light text-[10px]">Products: </span>
                                    <span className="font-bold text-stone-900 block mt-0.5">{productNames}</span>
                                  </div>
                                  <div>
                                    <span className="text-stone-400 font-light text-[10px]">Return Reason: </span>
                                    <span className="font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 text-[11px] inline-block mt-0.5">
                                      {ret.reason}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-stone-400 font-light text-[10px]">Customer Comments: </span>
                                    <p className="text-stone-700 font-light mt-0.5 italic text-[11px] bg-stone-50 p-2 rounded-lg border border-stone-150">
                                      {ret.comments || "No additional comments provided."}
                                    </p>
                                  </div>
                                </div>

                                {/* Right Column: Timestamps & Refund Audit Details */}
                                <div className="space-y-2.5">
                                  <span className="block text-[10px] font-bold uppercase tracking-wider text-stone-400">
                                    System Timestamps & Audit Details
                                  </span>
                                  <div>
                                    <span className="text-stone-400 font-light text-[10px]">Requested Date: </span>
                                    <span className="font-medium text-stone-800">
                                      {new Date(ret.created_at).toLocaleString()}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-stone-400 font-light text-[10px]">Product Received Date: </span>
                                    <span className="font-medium text-stone-800">
                                      {ret.received_at ? new Date(ret.received_at).toLocaleString() : "Pending Receipt"}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-stone-400 font-light text-[10px]">Refund Transaction ID: </span>
                                    <span className="font-mono font-bold text-stone-900 select-all block mt-0.5">
                                      {associatedRefund?.refund_transaction_id || <span className="text-stone-300 font-normal italic">N/A</span>}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-stone-400 font-light text-[10px]">Refund Completion Time: </span>
                                    <span className="font-medium text-stone-800 block mt-0.5">
                                      {associatedRefund?.processed_at ? new Date(associatedRefund.processed_at).toLocaleString() : "Pending Completion"}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-stone-400 font-light text-[10px]">Refund Remarks: </span>
                                    <span className="font-medium text-stone-800 block mt-0.5">
                                      {associatedRefund?.remarks || <span className="text-stone-300 italic">None</span>}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* 5-Stage Return & Refund Progress Lifecycle Timeline */}
                              <div className="border-t border-stone-100 pt-5">
                                <span className="block text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-3">
                                  Return & Refund Progress Lifecycle
                                </span>
                                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
                                  {/* Step 1: Return Requested */}
                                  <div className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/50">
                                    <span className="block text-[9px] font-black uppercase text-emerald-700">1. Return Requested</span>
                                    <span className="block text-[10px] text-emerald-900 font-bold mt-1">Done ✓</span>
                                    <span className="block text-[9px] text-emerald-700/80 font-light mt-0.5">
                                      {new Date(ret.created_at).toLocaleDateString()}
                                    </span>
                                  </div>

                                  {/* Step 2: Return Approved / Rejected */}
                                  <div
                                    className={`p-3 rounded-xl border ${
                                      ret.status.toLowerCase() === "rejected"
                                        ? "border-rose-200 bg-rose-50/50 text-rose-900"
                                        : ret.status.toLowerCase() === "approved" || ret.status.toLowerCase() === "returned"
                                        ? "border-emerald-200 bg-emerald-50/50 text-emerald-900"
                                        : "border-stone-200 bg-stone-50/50 text-stone-400"
                                    }`}
                                  >
                                    <span className="block text-[9px] font-black uppercase">
                                      2. {ret.status.toLowerCase() === "rejected" ? "Return Rejected" : "Return Approved"}
                                    </span>
                                    <span className="block text-[10px] font-bold mt-1">
                                      {ret.status.toLowerCase() === "pending" ? "Pending" : "Done ✓"}
                                    </span>
                                  </div>

                                  {/* Step 3: Product Received */}
                                  <div
                                    className={`p-3 rounded-xl border ${
                                      ret.status.toLowerCase() === "returned"
                                        ? "border-emerald-200 bg-emerald-50/50 text-emerald-900"
                                        : "border-stone-200 bg-stone-50/50 text-stone-400"
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

                                  {/* Step 4: Refund Initiated */}
                                  <div
                                    className={`p-3 rounded-xl border ${
                                      associatedRefund?.status === "Initiated" || associatedRefund?.status === "Completed"
                                        ? "border-emerald-200 bg-emerald-50/50 text-emerald-900"
                                        : "border-stone-200 bg-stone-50/50 text-stone-400"
                                    }`}
                                  >
                                    <span className="block text-[9px] font-black uppercase">4. Refund Initiated</span>
                                    <span className="block text-[10px] font-bold mt-1">
                                      {associatedRefund?.status === "Initiated" || associatedRefund?.status === "Completed" ? "Initiated ✓" : "Pending"}
                                    </span>
                                  </div>

                                  {/* Step 5: Refund Completed */}
                                  <div
                                    className={`p-3 rounded-xl border ${
                                      associatedRefund?.status === "Completed"
                                        ? "border-emerald-200 bg-emerald-50/50 text-emerald-900"
                                        : "border-stone-200 bg-stone-50/50 text-stone-400"
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

      {/* Optional Refund Completion Modal */}
      {isCompleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl space-y-5 text-left border border-stone-200">
            <div className="border-b border-stone-150 pb-3">
              <h3 className="text-sm font-black uppercase tracking-wider text-stone-900">
                Mark Refund Completed
              </h3>
              <p className="text-[10px] text-stone-400 font-light mt-0.5">
                Record refund completion details and audit transaction ID.
              </p>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1">
                  Refund Transaction ID (Optional)
                </label>
                <input
                  type="text"
                  value={modalTxId}
                  onChange={(e) => setModalTxId(e.target.value)}
                  placeholder="e.g. TXN-RFD-981245"
                  className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-xs font-mono font-medium focus:outline-none focus:ring-1 focus:ring-[#E0A99E]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1">
                  Admin Remarks (Optional)
                </label>
                <textarea
                  rows={3}
                  value={modalRemarks}
                  onChange={(e) => setModalRemarks(e.target.value)}
                  placeholder="Enter remarks or payment reference..."
                  className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-xs font-light focus:outline-none focus:ring-1 focus:ring-[#E0A99E]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-stone-150 pt-4">
              <button
                onClick={() => setIsCompleteModalOpen(false)}
                className="rounded-xl border border-stone-200 bg-white px-4 py-2 text-xs font-bold text-stone-600 hover:bg-stone-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmComplete}
                className="rounded-xl bg-emerald-700 px-5 py-2 text-xs font-extrabold text-white hover:bg-emerald-800 transition-colors shadow-sm cursor-pointer uppercase tracking-wider"
              >
                Confirm Completion
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

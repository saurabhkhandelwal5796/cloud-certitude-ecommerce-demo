// @ts-nocheck
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/utils";
import { isFullSnapshot, coerceLegacyItem } from "@/services/SnapshotService";
import OrderTimeline from "@/components/ui/OrderTimeline";
import OrderAuditTimeline from "@/components/ui/OrderAuditTimeline";
import {
  getOrders,
  updateOrderStatus,
  getDashboardStats,
  getReturnRequestByOrderId,
  approveReturnRequest,
  rejectReturnRequest,
  markReturnProductReceived,
  getReturnAnalytics,
  getRefundByOrderId,
  updateRefundStatus,
  getUserNotifications,
  AdminOrder,
  DashboardStats,
  ReturnRequestRecord,
  ReturnAnalytics,
  RefundRecord,
  InAppNotification,
} from "@/services/AdminService";

const STATUSES: AdminOrder["status"][] = [
  "Pending",
  "Confirmed",
  "Processing",
  "Shipped",
  "Out for Delivery",
  "Delivered",
  "Cancelled",
  "Refunded",
  "Return Requested",
  "Return Approved",
  "Return Rejected",
  "Returned",
];

type WorkspaceTab =
  | "overview"
  | "details"
  | "products"
  | "customer"
  | "shipment"
  | "returns"
  | "timeline"
  | "notifications"
  | "notes";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState<string | null>(null);

  // Enterprise Workspace Drawer State
  const [workspaceOrderId, setWorkspaceOrderId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<WorkspaceTab>("overview");

  // Return & Refund Module Data Caches
  const [returnsMap, setReturnsMap] = useState<Record<string, ReturnRequestRecord>>({});
  const [analyticsMap, setAnalyticsMap] = useState<Record<string, ReturnAnalytics>>({});
  const [refundsMap, setRefundsMap] = useState<Record<string, RefundRecord>>({});
  const [notificationsMap, setNotificationsMap] = useState<Record<string, InAppNotification[]>>({});
  const [adminNotesMap, setAdminNotesMap] = useState<Record<string, string>>({});

  // Refund Completion Modal State
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
  const [targetRefundId, setTargetRefundId] = useState<string | null>(null);
  const [modalTxId, setModalTxId] = useState("");
  const [modalRemarks, setModalRemarks] = useState("");

  // Search, Filter, Sort State
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortByDate, setSortByDate] = useState("newest"); // newest | oldest

  const loadData = () => {
    Promise.all([getOrders(), getDashboardStats()])
      .then(([ordersList, summaryStats]) => {
        setOrders(ordersList);
        setStats(summaryStats);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("[Admin Orders] Error loading page stats:", err);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: AdminOrder["status"]) => {
    try {
      await updateOrderStatus(orderId, newStatus);

      setOrders((prev) =>
        prev.map((o) => (o.orderId === orderId ? { ...o, status: newStatus } : o))
      );

      const updatedStats = await getDashboardStats();
      setStats(updatedStats);

      setNotification(`Fulfillment status for order ${orderId} successfully set to ${newStatus}.`);
      setTimeout(() => setNotification(null), 3000);
    } catch (err) {
      console.error("Failed to update order status:", err);
      alert("Failed to update status.");
    }
  };

  const getStatusStyle = (status: AdminOrder["status"]) => {
    switch (status) {
      case "Delivered":
      case "Return Approved":
      case "Returned":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "Cancelled":
      case "Return Rejected":
        return "bg-rose-50 text-rose-700 border-rose-200";
      case "Shipped":
      case "Out for Delivery":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "Return Requested":
        return "bg-amber-100 text-amber-800 border-amber-300 font-bold animate-pulse";
      default:
        return "bg-amber-50 text-amber-700 border-amber-200";
    }
  };

  const openOrderWorkspace = async (orderId: string, initialTab: WorkspaceTab = "overview") => {
    setWorkspaceOrderId(orderId);
    setActiveTab(initialTab);

    // Load Return Request Data if missing
    if (!returnsMap[orderId]) {
      try {
        const records = await getReturnRequestByOrderId(orderId);
        if (records && records.length > 0) {
          setReturnsMap((prev) => ({ ...prev, [orderId]: records[0] }));
          const analytics = await getReturnAnalytics(orderId, records[0]);
          setAnalyticsMap((prev) => ({ ...prev, [orderId]: analytics }));
        }
      } catch (err) {
        console.error("[AdminOrders] Exception fetching return request for order:", err);
      }
    }

    // Load Refund Record Data if missing
    if (!refundsMap[orderId]) {
      try {
        const refRecord = await getRefundByOrderId(orderId);
        if (refRecord) {
          setRefundsMap((prev) => ({ ...prev, [orderId]: refRecord }));
        }
      } catch (err) {
        console.error("[AdminOrders] Exception fetching refund record:", err);
      }
    }

    // Load Order Notifications if missing
    const targetOrder = orders.find((o) => o.orderId === orderId);
    if (targetOrder && !notificationsMap[orderId]) {
      try {
        const notifs = await getUserNotifications(targetOrder.customerEmail);
        setNotificationsMap((prev) => ({ ...prev, [orderId]: notifs }));
      } catch (err) {
        console.error("[AdminOrders] Exception fetching notifications for order:", err);
      }
    }
  };

  const handleApproveReturn = async (orderId: string, returnId: string) => {
    const note = adminNotesMap[returnId] || "";
    try {
      const success = await approveReturnRequest(returnId, note);
      if (success) {
        setNotification(`Return request for order ${orderId} has been approved.`);
        setTimeout(() => setNotification(null), 3000);
        await openOrderWorkspace(orderId, "returns");
        loadData();
      } else {
        alert("Failed to approve return request.");
      }
    } catch (err) {
      console.error("[AdminOrders] Exception approving return:", err);
    }
  };

  const handleRejectReturn = async (orderId: string, returnId: string) => {
    const note = adminNotesMap[returnId] || "";
    if (!note.trim()) {
      alert("Admin notes/remarks are required when rejecting a return request.");
      return;
    }
    try {
      const success = await rejectReturnRequest(returnId, note);
      if (success) {
        setNotification(`Return request for order ${orderId} has been rejected.`);
        setTimeout(() => setNotification(null), 3000);
        await openOrderWorkspace(orderId, "returns");
        loadData();
      } else {
        alert("Failed to reject return request.");
      }
    } catch (err) {
      console.error("[AdminOrders] Exception rejecting return:", err);
    }
  };

  const handleMarkReceived = async (orderId: string, returnId: string) => {
    try {
      const note = adminNotesMap[returnId] || "";
      const success = await markReturnProductReceived(returnId, note);
      if (success) {
        setNotification(`Returned product for order ${orderId} has been marked as received.`);
        setTimeout(() => setNotification(null), 3000);
        await openOrderWorkspace(orderId, "returns");
        loadData();
      } else {
        alert("Failed to mark product received.");
      }
    } catch (err) {
      console.error("[AdminOrders] Exception marking product received:", err);
    }
  };

  const handleRefundStatusUpdate = async (
    orderId: string,
    refundId: string,
    newStatus: "Completed" | "Initiated" | "Failed"
  ) => {
    if (newStatus === "Completed") {
      setTargetRefundId(refundId);
      setModalTxId("");
      setModalRemarks("Refund processed by admin");
      setIsRefundModalOpen(true);
      return;
    }

    try {
      const success = await updateRefundStatus(refundId, newStatus, `Status updated to ${newStatus}`);
      if (success) {
        setNotification(`Refund status for order ${orderId} set to ${newStatus}.`);
        setTimeout(() => setNotification(null), 3000);
        await openOrderWorkspace(orderId, "returns");
        loadData();
      } else {
        alert(`Failed to update refund status to ${newStatus}.`);
      }
    } catch (err) {
      console.error("[AdminOrders] Exception updating refund status:", err);
    }
  };

  const handleConfirmRefundCompletion = async () => {
    if (!targetRefundId || !workspaceOrderId) return;
    try {
      const success = await updateRefundStatus(
        targetRefundId,
        "Completed",
        modalRemarks,
        modalTxId
      );
      if (success) {
        setNotification("Refund marked as Completed successfully.");
        setTimeout(() => setNotification(null), 3000);
        setIsRefundModalOpen(false);
        setTargetRefundId(null);
        await openOrderWorkspace(workspaceOrderId, "returns");
        loadData();
      } else {
        alert("Failed to complete refund.");
      }
    } catch (err) {
      console.error("[AdminOrders] Exception completing refund:", err);
    }
  };

  // Process Search, Filter, Sort
  const processedOrders = orders
    .filter((order) => {
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesId = order.orderId.toLowerCase().includes(query);
        const matchesName = order.customerName.toLowerCase().includes(query);
        const matchesEmail = order.customerEmail.toLowerCase().includes(query);
        if (!matchesId && !matchesName && !matchesEmail) return false;
      }
      if (statusFilter !== "All" && order.status !== statusFilter) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      const dateA = new Date(a.orderDate).getTime() || 0;
      const dateB = new Date(b.orderDate).getTime() || 0;
      return sortByDate === "newest" ? dateB - dateA : dateA - dateB;
    });

  const selectedWorkspaceOrder = workspaceOrderId
    ? orders.find((o) => o.orderId === workspaceOrderId) || null
    : null;

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex items-center gap-2.5 text-stone-500 font-light text-sm">
          <svg className="h-5 w-5 animate-spin text-[#E0A99E]" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Loading Order Workspace...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 text-left">
      {/* Page Title */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-wider uppercase">
          Orders Administration & Workspace
        </h1>
        <p className="mt-1 text-xs text-stone-400 font-light uppercase tracking-widest">
          Enterprise order workspace for fulfillment management, returns, refunds, and history timelines.
        </p>
      </div>

      {/* Summary KPI Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-stone-200/50 bg-white p-4 shadow-sm text-left">
            <span className="text-[9px] font-extrabold uppercase tracking-widest text-stone-400">
              Pending Orders
            </span>
            <h4 className="text-xl font-black text-stone-900 mt-1">{stats.pendingOrdersCount}</h4>
          </div>
          <div className="rounded-2xl border border-stone-200/50 bg-white p-4 shadow-sm text-left">
            <span className="text-[9px] font-extrabold uppercase tracking-widest text-[#E0A99E]">
              Delivered Orders
            </span>
            <h4 className="text-xl font-black text-stone-900 mt-1">{stats.deliveredOrdersCount}</h4>
          </div>
          <div className="rounded-2xl border border-stone-200/50 bg-white p-4 shadow-sm text-left">
            <span className="text-[9px] font-extrabold uppercase tracking-widest text-rose-450">
              Cancelled Orders
            </span>
            <h4 className="text-xl font-black text-stone-900 mt-1">{stats.cancelledOrdersCount}</h4>
          </div>
          <div className="rounded-2xl border border-stone-200/50 bg-white p-4 shadow-sm text-left">
            <span className="text-[9px] font-extrabold uppercase tracking-widest text-emerald-600">
              Revenue Today
            </span>
            <h4 className="text-xl font-black text-stone-900 mt-1">{formatPrice(stats.revenueToday)}</h4>
          </div>
        </div>
      )}

      {/* Return Module Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-amber-250 bg-amber-50/60 p-4 text-left shadow-sm">
          <span className="block text-[9px] font-black uppercase tracking-widest text-amber-700">
            Pending Returns
          </span>
          <span className="text-2xl font-black text-amber-950 mt-1 block">
            {orders.filter((o) => o.status === "Return Requested").length}
          </span>
        </div>
        <div className="rounded-2xl border border-emerald-250 bg-emerald-50/60 p-4 text-left shadow-sm">
          <span className="block text-[9px] font-black uppercase tracking-widest text-emerald-700">
            Approved Returns
          </span>
          <span className="text-2xl font-black text-emerald-950 mt-1 block">
            {orders.filter((o) => o.status === "Return Approved").length}
          </span>
        </div>
        <div className="rounded-2xl border border-rose-250 bg-rose-50/60 p-4 text-left shadow-sm">
          <span className="block text-[9px] font-black uppercase tracking-widest text-rose-700">
            Rejected Returns
          </span>
          <span className="text-2xl font-black text-rose-950 mt-1 block">
            {orders.filter((o) => o.status === "Return Rejected").length}
          </span>
        </div>
        <div className="rounded-2xl border border-blue-250 bg-blue-50/60 p-4 text-left shadow-sm">
          <span className="block text-[9px] font-black uppercase tracking-widest text-blue-700">
            Completed Returns
          </span>
          <span className="text-2xl font-black text-blue-950 mt-1 block">
            {orders.filter((o) => o.status === "Returned").length}
          </span>
        </div>
      </div>

      {/* Notification Banner */}
      {notification && (
        <div className="rounded-2xl border border-emerald-250 bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-700 flex items-center gap-2">
          <span>✓</span>
          <span>{notification}</span>
        </div>
      )}

      {/* Filter Tabs Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-stone-400 font-bold uppercase tracking-widest text-[10px] whitespace-nowrap">
          Quick Filters:
        </span>
        {["All", "Return Requested", "Return Approved", "Return Rejected", "Returned"].map((tab) => {
          const count =
            tab === "All"
              ? orders.length
              : orders.filter((o) => o.status === tab).length;
          const isActive = statusFilter === tab;

          return (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`rounded-full px-3.5 py-1.5 text-[10px] font-extrabold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
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

      {/* Controls Bar */}
      <div className="bg-white border border-stone-200/50 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:max-w-xs">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search ID, Name, or Email..."
            className="w-full rounded-xl border border-stone-200 bg-stone-50/50 pl-4 pr-10 py-2 text-xs text-stone-850 placeholder-stone-400 focus:border-[#E0A99E]/50 focus:outline-none focus:ring-1 focus:ring-[#E0A99E]/50"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 items-center w-full md:w-auto justify-end text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-stone-400 font-bold uppercase tracking-wider text-[10px]">
              Status:
            </span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-stone-200 bg-stone-50/50 px-3 py-1.5 text-stone-800 focus:outline-none focus:ring-1 focus:ring-[#E0A99E]/50 font-medium"
            >
              <option value="All">All Statuses</option>
              {STATUSES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-stone-400 font-bold uppercase tracking-wider text-[10px]">
              Sort:
            </span>
            <select
              value={sortByDate}
              onChange={(e) => setSortByDate(e.target.value)}
              className="rounded-xl border border-stone-200 bg-stone-50/50 px-3 py-1.5 text-stone-800 focus:outline-none focus:ring-1 focus:ring-[#E0A99E]/50 font-medium"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders List Table */}
      <div className="rounded-3xl border border-stone-200/50 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="border-b border-stone-150 bg-stone-50/50 text-[10px] uppercase font-bold text-stone-400">
                <th className="py-4 px-6 font-semibold">Order ID (Open Workspace)</th>
                <th className="py-4 px-6 font-semibold">Customer Details</th>
                <th className="py-4 px-6 font-semibold">Order Date</th>
                <th className="py-4 px-6 font-semibold">Method</th>
                <th className="py-4 px-6 font-semibold">Total Price</th>
                <th className="py-4 px-6 font-semibold text-center">Fulfillment Action</th>
                <th className="py-4 px-6 font-semibold text-center">Workspace</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-xs">
              {processedOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-stone-400 font-light">
                    No orders match your search criteria.
                  </td>
                </tr>
              ) : (
                processedOrders.map((o) => (
                  <tr key={o.orderId} className="hover:bg-stone-50/60 transition-colors">
                    <td className="py-4 px-6">
                      <button
                        onClick={() => openOrderWorkspace(o.orderId)}
                        className="font-mono font-bold text-[#C68B7D] hover:text-stone-900 uppercase text-left block focus:outline-none underline decoration-stone-300 hover:decoration-stone-800 transition-colors"
                      >
                        {o.orderId}
                      </button>
                    </td>
                    <td className="py-4 px-6">
                      <div>
                        <span className="block font-bold text-stone-850 text-sm">
                          {o.customerName}
                        </span>
                        <span className="block text-[10px] text-stone-400 font-light mt-0.5 select-all">
                          {o.customerEmail}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-stone-500 font-light">
                      {o.orderDate}
                    </td>
                    <td className="py-4 px-6 text-stone-650 font-medium">
                      {o.paymentMethod}
                    </td>
                    <td className="py-4 px-6 font-bold text-stone-900">
                      {formatPrice(o.total)}
                      <span className="block text-[9px] text-stone-400 font-light mt-0.5">
                        {o.itemsCount} {o.itemsCount === 1 ? "Item" : "Items"}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="flex items-center justify-center">
                        <select
                          value={o.status}
                          onChange={(e) => handleStatusChange(o.orderId, e.target.value as AdminOrder["status"])}
                          className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider border cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#E0A99E]/50 ${getStatusStyle(o.status)}`}
                        >
                          {STATUSES.map((st) => (
                            <option key={st} value={st} className="bg-white text-stone-800">
                              {st}
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <button
                        onClick={() => openOrderWorkspace(o.orderId)}
                        className="rounded-xl border border-stone-200 bg-stone-50 px-3.5 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-stone-700 hover:bg-stone-100 transition-colors shadow-sm cursor-pointer whitespace-nowrap"
                      >
                        Open Workspace ↗
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────────────────────
          ENTERPRISE ORDER WORKSPACE DRAWER / MODAL (~92% W x 90% H)
         ────────────────────────────────────────────────────────────────────────── */}
      {selectedWorkspaceOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-md p-3 sm:p-6 animate-fadeIn">
          <div className="w-[94vw] h-[90vh] max-w-7xl rounded-3xl bg-white shadow-2xl flex flex-col md:flex-row overflow-hidden border border-stone-200">
            
            {/* 1. LEFT-SIDE SUMMARY PANEL (~320px) */}
            <div className="w-full md:w-[320px] bg-[#FBF9F5] border-b md:border-b-0 md:border-r border-stone-200 p-6 flex flex-col justify-between shrink-0 overflow-y-auto space-y-6">
              <div className="space-y-6 text-left">
                {/* Header Badge */}
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-black uppercase tracking-widest text-[#E0A99E] bg-[#E0A99E]/10 px-2.5 py-1 rounded-full border border-[#E0A99E]/20">
                    Order Workspace
                  </span>
                  <button
                    onClick={() => setWorkspaceOrderId(null)}
                    className="md:hidden text-stone-400 hover:text-stone-800 font-bold text-sm"
                  >
                    ✕
                  </button>
                </div>

                {/* Order ID */}
                <div>
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-stone-400">
                    Order Identifier
                  </span>
                  <h3 className="font-mono text-base font-black text-stone-900 select-all mt-0.5 uppercase">
                    {selectedWorkspaceOrder.orderId}
                  </h3>
                  <Link
                    href={`/admin/orders/${selectedWorkspaceOrder.orderId}`}
                    className="mt-3 inline-flex items-center gap-1.5 text-[10px] font-black text-stone-900 bg-white border border-stone-300 hover:bg-stone-900 hover:text-white px-3 py-2 rounded-xl transition-all shadow-sm w-full justify-center text-center uppercase tracking-wider"
                  >
                    <span>🛡️ Audit & Divergence Report →</span>
                  </Link>
                </div>

                {/* Customer Details Card */}
                <div className="p-3.5 rounded-2xl bg-white border border-stone-200/80 shadow-sm space-y-2">
                  <span className="block text-[9px] font-extrabold uppercase tracking-wider text-stone-400">
                    Customer Contact
                  </span>
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-[#E0A99E]/20 text-[#C68B7D] font-black text-xs flex items-center justify-center border border-[#E0A99E]/30 shrink-0">
                      {selectedWorkspaceOrder.customerName.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-stone-900 text-xs truncate">
                        {selectedWorkspaceOrder.customerName}
                      </p>
                      <p className="text-[10px] text-stone-500 font-light truncate select-all">
                        {selectedWorkspaceOrder.customerEmail}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Fulfillment Status Selector */}
                <div className="space-y-1.5">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-stone-400">
                    Fulfillment Status
                  </span>
                  <select
                    value={selectedWorkspaceOrder.status}
                    onChange={(e) =>
                      handleStatusChange(selectedWorkspaceOrder.orderId, e.target.value as AdminOrder["status"])
                    }
                    className={`w-full rounded-xl px-3.5 py-2 text-xs font-bold uppercase tracking-wider border cursor-pointer focus:outline-none ${getStatusStyle(
                      selectedWorkspaceOrder.status
                    )}`}
                  >
                    {STATUSES.map((st) => (
                      <option key={st} value={st} className="bg-white text-stone-800">
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Financial Summary */}
                <div className="space-y-3 pt-2 border-t border-stone-200/60">
                  <div>
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-stone-400">
                      Grand Total Amount
                    </span>
                    <span className="text-2xl font-black text-stone-900">
                      {formatPrice(selectedWorkspaceOrder.total)}
                    </span>
                  </div>

                  <div>
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-stone-400">
                      Order Placed Date
                    </span>
                    <span className="text-xs font-medium text-stone-700">
                      {selectedWorkspaceOrder.orderDate}
                    </span>
                  </div>

                  <div>
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-stone-400">
                      Payment Gateway Method
                    </span>
                    <span className="text-xs font-semibold text-stone-800">
                      {selectedWorkspaceOrder.paymentMethod}
                    </span>
                  </div>
                </div>
              </div>

              {/* Close Button */}
              <div className="pt-4 border-t border-stone-200">
                <button
                  onClick={() => setWorkspaceOrderId(null)}
                  className="w-full rounded-xl border border-stone-300 bg-white py-2.5 text-xs font-extrabold uppercase tracking-wider text-stone-700 hover:bg-stone-100 transition-colors shadow-sm cursor-pointer"
                >
                  Close Workspace
                </button>
              </div>
            </div>

            {/* 2. RIGHT-SIDE MAIN WORKSPACE AREA */}
            <div className="flex-1 flex flex-col min-w-0 bg-white overflow-hidden text-left">
              
              {/* Workspace Navigation Bar (9 Tabs) */}
              <div className="border-b border-stone-200 bg-stone-50/50 px-6 pt-4 flex items-center gap-1 overflow-x-auto text-xs font-bold uppercase tracking-wider shrink-0 no-scrollbar">
                {(
                  [
                    { id: "overview", label: "Overview" },
                    { id: "details", label: "Order Details" },
                    { id: "products", label: `Products (${selectedWorkspaceOrder.itemsCount})` },
                    { id: "customer", label: "Customer" },
                    { id: "shipment", label: "Shipment" },
                    { id: "returns", label: "Returns & Refunds" },
                    { id: "timeline", label: "Timeline" },
                    { id: "notifications", label: "Notifications" },
                    { id: "notes", label: "Internal Notes" },
                  ] as { id: WorkspaceTab; label: string }[]
                ).map((tab) => {
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-4 py-3 border-b-2 text-[11px] font-extrabold transition-all cursor-pointer whitespace-nowrap ${
                        isActive
                          ? "border-[#E0A99E] text-[#C68B7D] bg-white rounded-t-xl"
                          : "border-transparent text-stone-500 hover:text-stone-800"
                      }`}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {/* Workspace Content Area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                
                {/* ── TAB 1: OVERVIEW ── */}
                {activeTab === "overview" && (
                  <div className="space-y-6">
                    {/* 5 KPI Summary Cards */}
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-wider text-stone-900 mb-3">
                        Order Lifecycle KPI Summary
                      </h4>
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                        <div className="p-3.5 rounded-2xl border border-stone-200 bg-stone-50/60">
                          <span className="block text-[9px] font-bold uppercase text-stone-400">1. Order Status</span>
                          <span className="block text-xs font-black text-stone-900 mt-1">{selectedWorkspaceOrder.status}</span>
                        </div>
                        <div className="p-3.5 rounded-2xl border border-emerald-200 bg-emerald-50/50">
                          <span className="block text-[9px] font-bold uppercase text-emerald-700">2. Payment Status</span>
                          <span className="block text-xs font-black text-emerald-900 mt-1">Paid ({selectedWorkspaceOrder.paymentMethod})</span>
                        </div>
                        <div className="p-3.5 rounded-2xl border border-blue-200 bg-blue-50/50">
                          <span className="block text-[9px] font-bold uppercase text-blue-700">3. Shipment Status</span>
                          <span className="block text-xs font-black text-blue-900 mt-1">
                            {selectedWorkspaceOrder.status === "Delivered"
                              ? "Delivered"
                              : selectedWorkspaceOrder.status === "Shipped" || selectedWorkspaceOrder.status === "Out for Delivery"
                              ? "In Transit"
                              : "Processing"}
                          </span>
                        </div>
                        <div className="p-3.5 rounded-2xl border border-amber-200 bg-amber-50/50">
                          <span className="block text-[9px] font-bold uppercase text-amber-700">4. Return Status</span>
                          <span className="block text-xs font-black text-amber-950 mt-1">
                            {returnsMap[selectedWorkspaceOrder.orderId]?.status || "No Return"}
                          </span>
                        </div>
                        <div className="p-3.5 rounded-2xl border border-purple-200 bg-purple-50/50">
                          <span className="block text-[9px] font-bold uppercase text-purple-700">5. Refund Status</span>
                          <span className="block text-xs font-black text-purple-900 mt-1">
                            {refundsMap[selectedWorkspaceOrder.orderId]?.status || "N/A"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Visual Progress Tracker */}
                    <div className="p-6 rounded-2xl border border-stone-200 bg-white shadow-sm space-y-4">
                      <span className="block text-[10px] font-black uppercase tracking-widest text-[#E0A99E] text-center">
                        Fulfillment Lifecycle Progress
                      </span>
                      <OrderTimeline status={selectedWorkspaceOrder.status} />
                    </div>
                  </div>
                )}

                {/* ── TAB 2: ORDER DETAILS ── */}
                {activeTab === "details" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Billing Invoice Summary */}
                    <div className="p-5 rounded-2xl border border-stone-200 bg-white shadow-sm space-y-4">
                      <h4 className="text-xs font-black uppercase tracking-wider text-stone-900 border-b border-stone-150 pb-2">
                        Billing Invoice Breakdown
                      </h4>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between text-stone-600">
                          <span>Items Subtotal</span>
                          <span className="font-medium text-stone-800">{formatPrice(selectedWorkspaceOrder.subtotal ?? 0)}</span>
                        </div>
                        <div className="flex justify-between text-stone-600">
                          <span>Shipping Fee</span>
                          <span className="font-medium text-stone-800">
                            {selectedWorkspaceOrder.shipping === 0 ? "FREE" : formatPrice(selectedWorkspaceOrder.shipping ?? 0)}
                          </span>
                        </div>
                        <div className="flex justify-between text-stone-600">
                          <span>Estimated Tax</span>
                          <span className="font-medium text-stone-800">{formatPrice(selectedWorkspaceOrder.tax ?? 0)}</span>
                        </div>
                        {(selectedWorkspaceOrder.discount ?? 0) > 0 && (
                          <div className="flex justify-between text-rose-600 font-medium">
                            <span>Promotional Discount</span>
                            <span>-{formatPrice(selectedWorkspaceOrder.discount ?? 0)}</span>
                          </div>
                        )}
                        <div className="flex justify-between pt-3 border-t border-stone-200 text-sm font-black text-stone-900">
                          <span>Grand Total</span>
                          <span>{formatPrice(selectedWorkspaceOrder.total)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Delivery Address */}
                    <div className="p-5 rounded-2xl border border-stone-200 bg-white shadow-sm space-y-4">
                      <h4 className="text-xs font-black uppercase tracking-wider text-stone-900 border-b border-stone-150 pb-2">
                        Shipping & Delivery Address
                      </h4>
                      {selectedWorkspaceOrder.address ? (
                        <div className="text-xs text-stone-600 leading-relaxed space-y-1">
                          <p className="font-bold text-stone-900">
                            {selectedWorkspaceOrder.address.firstName} {selectedWorkspaceOrder.address.lastName}
                          </p>
                          <p>{selectedWorkspaceOrder.address.addressLine1}</p>
                          {selectedWorkspaceOrder.address.addressLine2 && <p>{selectedWorkspaceOrder.address.addressLine2}</p>}
                          <p>
                            {selectedWorkspaceOrder.address.city}, {selectedWorkspaceOrder.address.state} {selectedWorkspaceOrder.address.postalCode}
                          </p>
                          <p>{selectedWorkspaceOrder.address.country}</p>
                          <p className="pt-2 text-stone-500 font-medium">📞 {selectedWorkspaceOrder.address.phone}</p>
                        </div>
                      ) : (
                        <p className="text-xs text-stone-400 italic">No delivery address specified.</p>
                      )}
                    </div>
                  </div>
                )}

                {/* ── TAB 3: PRODUCTS ── */}
                {activeTab === "products" && (
                  <div className="p-5 rounded-2xl border border-stone-200 bg-white shadow-sm space-y-4">
                    <h4 className="text-xs font-black uppercase tracking-wider text-stone-900 border-b border-stone-150 pb-3">
                      Purchased Items ({selectedWorkspaceOrder.itemsCount})
                    </h4>
                    <div className="divide-y divide-stone-100">
                      {selectedWorkspaceOrder.items?.map((rawItem, idx) => {
                        const item = isFullSnapshot(rawItem) ? rawItem : coerceLegacyItem(rawItem as any);
                        const isSnapshot = isFullSnapshot(rawItem);
                        return (
                          <div key={idx} className="py-4 flex items-center justify-between gap-4 text-xs">
                            <div className="flex items-center gap-3 min-w-0">
                              {item.productImage && (
                                <div className="relative h-14 w-12 border border-stone-200 rounded-lg bg-stone-50 overflow-hidden shrink-0">
                                  <Image src={item.productImage} alt={item.productName} fill className="object-cover" />
                                </div>
                              )}
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <p className="font-bold text-stone-900 uppercase tracking-wider text-xs truncate">{item.productName}</p>
                                  {isSnapshot && (
                                    <span className="text-[8px] bg-emerald-100 text-emerald-800 font-extrabold uppercase px-1.5 py-0.5 rounded border border-emerald-300 shrink-0">
                                      IMMUTABLE
                                    </span>
                                  )}
                                </div>
                                {item.sku && (
                                  <span className="block text-[10px] font-mono text-stone-500 mt-0.5">
                                    SKU: {item.sku}
                                  </span>
                                )}
                                <p className="text-[11px] text-stone-400 font-light mt-1 flex flex-wrap gap-2">
                                  {Object.entries(item.attributes).map(([k, v]) => (
                                    <span key={k}>{k}: <strong className="text-stone-700 font-medium">{v}</strong></span>
                                  ))}
                                </p>
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <span className="block font-bold text-stone-900">{formatPrice(item.pricing.subtotal)}</span>
                              <span className="block text-[10px] text-stone-400">
                                Qty: {item.pricing.quantity} &times; {formatPrice(item.pricing.unitPrice)}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* ── TAB 4: CUSTOMER ── */}
                {activeTab === "customer" && (
                  <div className="p-5 rounded-2xl border border-stone-200 bg-white shadow-sm space-y-4">
                    <h4 className="text-xs font-black uppercase tracking-wider text-stone-900 border-b border-stone-150 pb-2">
                      Customer Profile & Context
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="block text-[10px] font-bold uppercase text-stone-400">Full Name</span>
                        <span className="font-bold text-stone-900 text-sm block mt-0.5">{selectedWorkspaceOrder.customerName}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] font-bold uppercase text-stone-400">Email Address</span>
                        <span className="font-medium text-stone-800 select-all block mt-0.5">{selectedWorkspaceOrder.customerEmail}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] font-bold uppercase text-stone-400">Contact Phone</span>
                        <span className="font-medium text-stone-800 block mt-0.5">
                          {selectedWorkspaceOrder.address?.phone || "N/A"}
                        </span>
                      </div>
                      <div>
                        <span className="block text-[10px] font-bold uppercase text-stone-400">Order Count Context</span>
                        <span className="font-bold text-emerald-800 block mt-0.5">
                          {orders.filter((o) => o.customerEmail === selectedWorkspaceOrder.customerEmail).length} Orders Placed
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── TAB 5: SHIPMENT ── */}
                {activeTab === "shipment" && (
                  <div className="p-5 rounded-2xl border border-stone-200 bg-white shadow-sm space-y-4">
                    <h4 className="text-xs font-black uppercase tracking-wider text-stone-900 border-b border-stone-150 pb-2">
                      Logistics & Shipment Details
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                      <div>
                        <span className="block text-[10px] font-bold uppercase text-stone-400">Shipment Status</span>
                        <span className="font-bold text-stone-900 block mt-0.5">{selectedWorkspaceOrder.status}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] font-bold uppercase text-stone-400">Carrier Partner</span>
                        <span className="font-medium text-stone-700 block mt-0.5">Express Logistics Standard</span>
                      </div>
                      <div>
                        <span className="block text-[10px] font-bold uppercase text-stone-400">Tracking Code</span>
                        <span className="font-mono font-bold text-stone-800 select-all block mt-0.5">
                          TRK-{selectedWorkspaceOrder.orderId.replace("ORD-", "")}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── TAB 6: RETURNS & REFUNDS ── */}
                {activeTab === "returns" && (
                  <div className="space-y-6">
                    {/* Return Request Info Section */}
                    {returnsMap[selectedWorkspaceOrder.orderId] ? (
                      <div className="p-5 rounded-2xl border border-stone-200 bg-white shadow-sm space-y-4">
                        <div className="flex justify-between items-center border-b border-stone-150 pb-3">
                          <div>
                            <span className="block text-[9px] font-black uppercase tracking-widest text-[#E0A99E]">
                              Return Request Details
                            </span>
                            <h4 className="font-bold text-stone-900 text-sm mt-0.5">
                              Reason: {returnsMap[selectedWorkspaceOrder.orderId].reason}
                            </h4>
                          </div>
                          <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200">
                            {returnsMap[selectedWorkspaceOrder.orderId].status}
                          </span>
                        </div>

                        <div className="text-xs space-y-2">
                          <p className="text-stone-600">
                            Customer Comments:{" "}
                            <span className="italic font-light text-stone-800 bg-stone-50 p-2 rounded-lg border border-stone-150 inline-block ml-1">
                              &ldquo;{returnsMap[selectedWorkspaceOrder.orderId].comments || "None"}&rdquo;
                            </span>
                          </p>
                        </div>

                        {/* Admin Action Buttons */}
                        {returnsMap[selectedWorkspaceOrder.orderId].status.toLowerCase() === "pending" ? (
                          <div className="pt-3 border-t border-stone-150 space-y-3">
                            <input
                              type="text"
                              placeholder="Enter admin notes / remarks..."
                              value={adminNotesMap[returnsMap[selectedWorkspaceOrder.orderId].id] || ""}
                              onChange={(e) =>
                                setAdminNotesMap({
                                  ...adminNotesMap,
                                  [returnsMap[selectedWorkspaceOrder.orderId].id]: e.target.value,
                                })
                              }
                              className="w-full rounded-xl border border-stone-250 bg-stone-50 px-3.5 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#E0A99E]"
                            />
                            <div className="flex gap-3 justify-end">
                              <button
                                type="button"
                                onClick={() => handleRejectReturn(selectedWorkspaceOrder.orderId, returnsMap[selectedWorkspaceOrder.orderId].id)}
                                className="rounded-full bg-rose-600 px-5 py-2 text-xs font-bold uppercase text-white hover:bg-rose-700"
                              >
                                Reject Return
                              </button>
                              <button
                                type="button"
                                onClick={() => handleApproveReturn(selectedWorkspaceOrder.orderId, returnsMap[selectedWorkspaceOrder.orderId].id)}
                                className="rounded-full bg-emerald-600 px-5 py-2 text-xs font-bold uppercase text-white hover:bg-emerald-700"
                              >
                                Approve Return
                              </button>
                            </div>
                          </div>
                        ) : returnsMap[selectedWorkspaceOrder.orderId].status === "Approved" && selectedWorkspaceOrder.status === "Return Approved" ? (
                          <div className="pt-3 border-t border-stone-150 flex justify-between items-center">
                            <span className="text-xs text-stone-500 font-light">Awaiting warehouse product receipt.</span>
                            <button
                              type="button"
                              onClick={() => handleMarkReceived(selectedWorkspaceOrder.orderId, returnsMap[selectedWorkspaceOrder.orderId].id)}
                              className="rounded-full bg-blue-600 px-6 py-2 text-xs font-bold uppercase text-white hover:bg-blue-700"
                            >
                              Mark Product Received
                            </button>
                          </div>
                        ) : null}
                      </div>
                    ) : (
                      <div className="p-5 rounded-2xl border border-stone-200 bg-white shadow-sm text-xs text-stone-400 font-light">
                        No return request associated with this order.
                      </div>
                    )}

                    {/* Refund Information Section */}
                    {refundsMap[selectedWorkspaceOrder.orderId] ? (
                      <div className="p-5 rounded-2xl border border-stone-200 bg-white shadow-sm space-y-4">
                        <div className="flex justify-between items-center border-b border-stone-150 pb-3">
                          <div>
                            <span className="block text-[9px] font-black uppercase tracking-widest text-emerald-600">
                              Refund Management Information
                            </span>
                            <h4 className="font-bold text-stone-900 text-sm mt-0.5">
                              Amount: {formatPrice(refundsMap[selectedWorkspaceOrder.orderId].amount)}
                            </h4>
                          </div>
                          <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase bg-emerald-50 text-emerald-800 border border-emerald-200">
                            Refund Status: {refundsMap[selectedWorkspaceOrder.orderId].status}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-light text-stone-600">
                          <div>
                            <span className="block font-bold uppercase text-[9px] text-stone-400">Created Date</span>
                            <span className="font-medium text-stone-800">
                              {new Date(refundsMap[selectedWorkspaceOrder.orderId].created_at).toLocaleString()}
                            </span>
                          </div>
                          <div>
                            <span className="block font-bold uppercase text-[9px] text-stone-400">Transaction ID</span>
                            <span className="font-mono font-bold text-stone-900 select-all">
                              {refundsMap[selectedWorkspaceOrder.orderId].refund_transaction_id || "N/A"}
                            </span>
                          </div>
                          <div>
                            <span className="block font-bold uppercase text-[9px] text-stone-400">Remarks</span>
                            <span className="font-medium text-stone-800">
                              {refundsMap[selectedWorkspaceOrder.orderId].remarks || "None"}
                            </span>
                          </div>
                        </div>

                        {/* Admin Refund Actions */}
                        <div className="pt-3 border-t border-stone-150 flex justify-end gap-2">
                          {refundsMap[selectedWorkspaceOrder.orderId].status === "Pending" && (
                            <button
                              type="button"
                              onClick={() => handleRefundStatusUpdate(selectedWorkspaceOrder.orderId, refundsMap[selectedWorkspaceOrder.orderId].id, "Initiated")}
                              className="rounded-full bg-purple-600 px-4 py-1.5 text-xs font-bold uppercase text-white hover:bg-purple-700"
                            >
                              Initiate Refund
                            </button>
                          )}
                          {refundsMap[selectedWorkspaceOrder.orderId].status === "Initiated" && (
                            <button
                              type="button"
                              onClick={() => handleRefundStatusUpdate(selectedWorkspaceOrder.orderId, refundsMap[selectedWorkspaceOrder.orderId].id, "Completed")}
                              className="rounded-full bg-emerald-700 px-4 py-1.5 text-xs font-bold uppercase text-white hover:bg-emerald-800"
                            >
                              Mark Refund Completed
                            </button>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="p-5 rounded-2xl border border-stone-200 bg-white shadow-sm text-xs text-stone-400 font-light">
                        No active refund record for this order.
                      </div>
                    )}
                  </div>
                )}

                {/* ── TAB 7: TIMELINE ── */}
                {activeTab === "timeline" && (
                  <div className="p-5 rounded-2xl border border-stone-200 bg-white shadow-sm">
                    <OrderAuditTimeline orderId={selectedWorkspaceOrder.orderId} />
                  </div>
                )}

                {/* ── TAB 8: NOTIFICATIONS ── */}
                {activeTab === "notifications" && (
                  <div className="p-5 rounded-2xl border border-stone-200 bg-white shadow-sm space-y-4">
                    <h4 className="text-xs font-black uppercase tracking-wider text-stone-900 border-b border-stone-150 pb-2">
                      Customer Notifications Audit Log
                    </h4>
                    {notificationsMap[selectedWorkspaceOrder.orderId] && notificationsMap[selectedWorkspaceOrder.orderId].length > 0 ? (
                      <div className="divide-y divide-stone-100">
                        {notificationsMap[selectedWorkspaceOrder.orderId].map((n) => (
                          <div key={n.id} className="py-3 text-xs space-y-1">
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-stone-900">{n.type || "Notification"}</span>
                              <span className="text-[10px] text-stone-400">{new Date(n.timestamp).toLocaleString()}</span>
                            </div>
                            <p className="text-stone-600 font-light">{n.message}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-stone-400 italic">No notifications logged for this customer.</p>
                    )}
                  </div>
                )}

                {/* ── TAB 9: INTERNAL NOTES ── */}
                {activeTab === "notes" && (
                  <div className="p-5 rounded-2xl border border-stone-200 bg-white shadow-sm space-y-4">
                    <h4 className="text-xs font-black uppercase tracking-wider text-stone-900 border-b border-stone-150 pb-2">
                      Internal Admin Notes & System Remarks (Read-Only)
                    </h4>
                    <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-700 leading-relaxed font-light italic">
                      {returnsMap[selectedWorkspaceOrder.orderId]?.admin_notes ||
                        refundsMap[selectedWorkspaceOrder.orderId]?.remarks ||
                        "No internal administrative notes recorded for this order workspace."}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Refund Completion Modal */}
      {isRefundModalOpen && (
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
                onClick={() => setIsRefundModalOpen(false)}
                className="rounded-xl border border-stone-200 bg-white px-4 py-2 text-xs font-bold text-stone-600 hover:bg-stone-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRefundCompletion}
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

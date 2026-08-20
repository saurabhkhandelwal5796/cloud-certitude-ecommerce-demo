"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { formatPrice } from "@/utils";
import { getSupabaseClient } from "@/lib/supabase/client";
import OrderAuditTimeline from "@/components/ui/OrderAuditTimeline";
import {
  getOrders,
  getCustomerById,
  getReturnRequestByOrderId,
  getRefundByOrderId,
  AdminOrder,
  AdminCustomer,
  ReturnRequestRecord,
  RefundRecord,
} from "@/services/AdminService";
import { getVariantById } from "@/services/VariantService";
import { isFullSnapshot, coerceLegacyItem } from "@/services/SnapshotService";
import { OrderItemSnapshot } from "@/types/OrderItemSnapshot";

interface DivergenceAnalysis {
  itemSnapshot: OrderItemSnapshot;
  liveVariant: unknown | null;
  status: "IDENTICAL" | "DIVERGED" | "MISSING_IN_CATALOG" | "LEGACY_ITEM";
  differences: string[];
}

/**
 * Salesforce-Style Admin Order Detail & Forensic Workspace (/admin/orders/[orderId])
 *
 * Provides:
 * - Order Record Header with Customer Context & Links back to Customer Detail
 * - Detailed Order Items with Immutable Snapshot & Catalog Divergence Verification
 * - Comprehensive Payment & Financial Breakdown
 * - Shipping & Destination Details
 * - Active Return Request & Refund Status Modules
 * - Minute-to-Minute Chronological Order Audit Timeline
 */
export default function AdminOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderIdParam = Array.isArray(params?.orderId) ? params?.orderId[0] : params?.orderId;
  const orderId = orderIdParam || "";

  const [order, setOrder] = useState<AdminOrder | null>(null);
  const [customer, setCustomer] = useState<AdminCustomer | null>(null);
  const [returnRequest, setReturnRequest] = useState<ReturnRequestRecord | null>(null);
  const [refundRecord, setRefundRecord] = useState<RefundRecord | null>(null);
  const [analyses, setAnalyses] = useState<DivergenceAnalysis[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrderDataAndAnalyze = async () => {
      try {
        const supabase = getSupabaseClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          router.push(`/signin?next=/admin/orders/${orderId}`);
          return;
        }

        const list = await getOrders();
        const matched = list.find((o) => o.orderId.toLowerCase() === orderId.toLowerCase());

        if (!matched) {
          setErrorMsg("Order not found in administrative ledger.");
          setIsLoading(false);
          return;
        }

        setOrder(matched);

        // Fetch associated Customer Profile, Return Request, and Refund Record in parallel
        const [custProfile, retReq, refRec] = await Promise.all([
          getCustomerById(matched.profileId || matched.customerEmail),
          getReturnRequestByOrderId(matched.orderId),
          getRefundByOrderId(matched.orderId),
        ]);

        setCustomer(custProfile);
        setReturnRequest(retReq);
        setRefundRecord(refRec);

        // Perform real-time catalog divergence analysis
        const itemAnalyses: DivergenceAnalysis[] = [];
        for (const rawItem of matched.items || []) {
          const snapshot = isFullSnapshot(rawItem)
            ? rawItem
            : coerceLegacyItem(rawItem as {
                id?: string;
                name: string;
                quantity: number;
                size?: string;
                color?: string;
                price: number;
                imageSrc?: string;
                brand?: string;
                discountPercent?: number;
                variantId?: string;
                variantSignature?: string;
              });

          if (!snapshot.variantId || !isFullSnapshot(rawItem)) {
            itemAnalyses.push({
              itemSnapshot: snapshot,
              liveVariant: null,
              status: "LEGACY_ITEM",
              differences: ["Legacy order item (recorded before immutable snapshot audit architecture)."],
            });
            continue;
          }

          let liveVariant: Record<string, unknown> | null = null;
          try {
            const fetched = await getVariantById(snapshot.variantId);
            liveVariant = (fetched as unknown as Record<string, unknown>) || null;
          } catch {
            liveVariant = null;
          }

          if (!liveVariant) {
            itemAnalyses.push({
              itemSnapshot: snapshot,
              liveVariant: null,
              status: "MISSING_IN_CATALOG",
              differences: ["Variant or product has been deleted or inactivated in live catalog since purchase."],
            });
            continue;
          }

          // Compare snapshot values vs live catalog values
          const diffs: string[] = [];
          const livePrice = Number(liveVariant.discountedPrice ?? liveVariant.price);
          if (Math.abs(livePrice - snapshot.pricing.originalPrice) > 0.01) {
            diffs.push(`Price modified: snapshot recorded ${formatPrice(snapshot.pricing.originalPrice)}, live catalog now lists ${formatPrice(livePrice)}.`);
          }

          if (liveVariant.sku && liveVariant.sku !== snapshot.sku) {
            diffs.push(`SKU modified: snapshot recorded '${snapshot.sku || "N/A"}', live catalog now lists '${liveVariant.sku}'.`);
          }

          if (liveVariant.variant_signature && liveVariant.variant_signature !== snapshot.variantSignature) {
            diffs.push(`Variant Signature modified: snapshot recorded '${snapshot.variantSignature}', live catalog now lists '${liveVariant.variant_signature}'.`);
          }

          if (liveVariant.is_active === false || liveVariant.isActive === false) {
            diffs.push("Variant has been set to INACTIVE in live catalog (currently not purchasable by new customers).");
          }

          itemAnalyses.push({
            itemSnapshot: snapshot,
            liveVariant,
            status: diffs.length > 0 ? "DIVERGED" : "IDENTICAL",
            differences: diffs,
          });
        }

        setAnalyses(itemAnalyses);
      } catch (err) {
        console.error("[AdminOrderDetail] Error running audit:", err);
        setErrorMsg("Failed executing order inspection.");
      } finally {
        setIsLoading(false);
      }
    };

    if (orderId) {
      fetchOrderDataAndAnalyze();
    }
  }, [orderId, router]);

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "Delivered":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "Pending":
      case "Processing":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "Shipped":
      case "Out for Delivery":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Cancelled":
        return "bg-rose-100 text-rose-800 border-rose-200";
      case "Return Requested":
      case "Return Approved":
      case "Returned":
        return "bg-purple-100 text-purple-800 border-purple-200";
      default:
        return "bg-stone-100 text-stone-700 border-stone-200";
    }
  };

  const getDivergenceBadgeStyle = (status: DivergenceAnalysis["status"]) => {
    switch (status) {
      case "IDENTICAL":
        return "bg-emerald-100 text-emerald-800 border-emerald-300";
      case "DIVERGED":
        return "bg-amber-100 text-amber-800 border-amber-300";
      case "MISSING_IN_CATALOG":
        return "bg-rose-100 text-rose-800 border-rose-300";
      case "LEGACY_ITEM":
        return "bg-stone-100 text-stone-600 border-stone-300";
    }
  };

  const getDivergenceStatusLabel = (status: DivergenceAnalysis["status"]) => {
    switch (status) {
      case "IDENTICAL":
        return "Verified & Consistent";
      case "DIVERGED":
        return "Catalog Diverged";
      case "MISSING_IN_CATALOG":
        return "Deleted from Catalog";
      case "LEGACY_ITEM":
        return "Legacy Format";
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 text-center min-h-[60vh] flex items-center justify-center">
        <div className="flex items-center gap-2.5 text-stone-600 font-medium text-sm">
          <svg className="h-5 w-5 animate-spin text-[#E0A99E]" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Loading Order Details & Audit Timeline...
        </div>
      </div>
    );
  }

  if (errorMsg || !order) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8 text-center min-h-[60vh] flex flex-col items-center justify-center">
        <div className="p-8 rounded-3xl bg-white border border-stone-200 shadow-sm max-w-lg">
          <span className="text-3xl block mb-3">🛡️</span>
          <h2 className="text-lg font-bold text-stone-900 mb-2">Order Not Found</h2>
          <p className="text-stone-500 text-xs mb-6 leading-relaxed">
            {errorMsg || "We couldn't locate the requested order in the database."}
          </p>
          <Link
            href="/admin/orders"
            className="rounded-full bg-stone-900 hover:bg-stone-800 text-white px-6 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors inline-block"
          >
            ← Back to Admin Orders
          </Link>
        </div>
      </div>
    );
  }

  const customerDetailHref = customer?.id
    ? `/admin/customers/${customer.id}`
    : `/admin/customers/${order.customerEmail}`;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 text-stone-800 space-y-6 text-left">
      {/* Top Breadcrumb & Customer Context Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 font-bold text-stone-400">
          <Link href="/admin/orders" className="hover:text-stone-900 transition">
            Orders
          </Link>
          <span>/</span>
          {customer ? (
            <>
              <Link href={customerDetailHref} className="hover:text-stone-900 transition text-[#A65B4E]">
                {customer.name}
              </Link>
              <span>/</span>
            </>
          ) : null}
          <span className="text-stone-800 font-mono">{order.orderId}</span>
        </div>

        <div className="flex items-center gap-3">
          {customer && (
            <Link
              href={customerDetailHref}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 font-bold transition shadow-2xs"
            >
              <span>👤</span>
              <span>View Customer Record ({customer.name})</span>
            </Link>
          )}
          <Link
            href="/admin/orders"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 font-bold transition shadow-2xs"
          >
            <span>←</span>
            <span>All Orders</span>
          </Link>
        </div>
      </div>

      {/* Salesforce-Style Order Record Header */}
      <div className="bg-white rounded-3xl border border-stone-200/80 shadow-sm overflow-hidden">
        <div className="bg-stone-900 text-white px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#E0A99E] to-stone-800 flex items-center justify-center text-white text-xl shadow-md">
              📦
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold text-[#E0A99E] tracking-widest block">
                  Order Record
                </span>
                <span className="text-stone-400 font-mono text-[10px]">
                  · Placed on {order.orderDate}
                </span>
              </div>
              <h1 className="text-2xl font-black font-mono tracking-wide uppercase mt-0.5">
                {order.orderId}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wide border ${getStatusBadgeClass(
                order.status
              )}`}
            >
              Status: {order.status}
            </span>
          </div>
        </div>

        {/* Header Highlights Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-6 bg-stone-50/70 border-b border-stone-200/60 text-xs">
          <div>
            <span className="text-[10px] text-stone-400 uppercase font-extrabold tracking-wider block mb-1">
              Customer Account
            </span>
            <Link
              href={customerDetailHref}
              className="font-bold text-stone-900 hover:text-[#A65B4E] hover:underline block truncate text-sm"
            >
              {order.customerName} ↗
            </Link>
            <span className="text-stone-500 font-mono text-[11px] block mt-0.5 select-all truncate">
              {order.customerEmail}
            </span>
          </div>

          <div>
            <span className="text-[10px] text-stone-400 uppercase font-extrabold tracking-wider block mb-1">
              Customer Contact
            </span>
            <span className="font-mono text-stone-800 font-medium block">
              {customer?.phone ? `📞 ${customer.phone}` : "Phone: —"}
            </span>
            <span className="text-stone-400 text-[10px] block mt-0.5">
              Role: <strong className="uppercase text-stone-700">{customer?.role || "customer"}</strong>
            </span>
          </div>

          <div>
            <span className="text-[10px] text-stone-400 uppercase font-extrabold tracking-wider block mb-1">
              Payment & Transaction
            </span>
            <span className="font-bold text-stone-900 block">{order.paymentMethod || "Credit Card"}</span>
            <span className="font-mono text-stone-500 text-[10px] block mt-0.5 truncate" title={order.transactionId || "N/A"}>
              Tx: {order.transactionId || "Recorded via Stripe/PG"}
            </span>
          </div>

          <div>
            <span className="text-[10px] text-stone-400 uppercase font-extrabold tracking-wider block mb-1">
              Total Order Value
            </span>
            <span className="font-black text-[#A65B4E] text-lg block">
              {formatPrice(order.grand_total !== undefined ? order.grand_total : order.total)}
            </span>
            <span className="text-stone-400 text-[10px] block">
              {order.itemsCount || order.items?.length || 1} items included
            </span>
          </div>
        </div>
      </div>

      {/* SECTION 1: ORDER ITEMS & FORENSIC SNAPSHOT AUDIT */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-black uppercase tracking-wider text-stone-900 flex items-center gap-2">
              <span>🛍️</span>
              <span>Purchased Items & Snapshot Verification</span>
            </h2>
            <p className="text-xs text-stone-500 font-light mt-0.5">
              Immutable order snapshots recorded at checkout compared against live catalog variants.
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-stone-500 bg-white px-3 py-1 rounded-xl border border-stone-200">
            {analyses.length} {analyses.length === 1 ? "Item" : "Items"}
          </span>
        </div>

        <div className="space-y-4">
          {analyses.map((analysis, idx) => {
            const item = analysis.itemSnapshot;
            const statusStyle = getDivergenceBadgeStyle(analysis.status);
            const statusLabel = getDivergenceStatusLabel(analysis.status);

            return (
              <div
                key={`item-${idx}`}
                className="bg-white rounded-3xl border border-stone-200/80 shadow-sm overflow-hidden"
              >
                {/* Item Header */}
                <div className="px-6 py-3.5 bg-stone-50/80 border-b border-stone-150 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold bg-stone-900 text-white px-2.5 py-0.5 rounded-lg">
                      Item #{idx + 1}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-black uppercase tracking-wider ${statusStyle}`}>
                      {statusLabel}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-black text-stone-900 text-sm">
                      {formatPrice(item.pricing.lineTotal ?? item.pricing.subtotal)}
                    </span>
                    <span className="text-xs text-stone-500 font-medium ml-1.5">
                      ({item.pricing.quantity} &times; {formatPrice(item.pricing.unitPrice)})
                    </span>
                  </div>
                </div>

                {/* Item Body */}
                <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Image & Product Basics (4 Cols) */}
                  <div className="lg:col-span-4 flex items-start gap-4 border-b lg:border-b-0 lg:border-r border-stone-150 pb-4 lg:pb-0 lg:pr-6">
                    <div className="relative h-24 w-20 rounded-2xl border border-stone-200 overflow-hidden bg-stone-50 flex-shrink-0">
                      {item.productImage ? (
                        <Image
                          src={item.productImage}
                          alt={item.productName}
                          fill
                          sizes="100px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10px] text-stone-400 font-light">
                          No Image
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-[9px] uppercase font-black text-[#A65B4E] tracking-widest block">
                        {item.brand || "Atelier"} {item.category ? `· ${item.category}` : ""}
                      </span>
                      <h4 className="font-black text-stone-900 text-sm mt-0.5 truncate">
                        {item.productName}
                      </h4>
                      <p className="font-mono text-[11px] text-stone-500 mt-1">
                        SKU: <strong className="text-stone-800">{item.sku || "N/A"}</strong>
                      </p>
                      {item.variantId && (
                        <p className="font-mono text-[10px] text-stone-400 mt-0.5 truncate" title={item.variantId}>
                          Variant: {item.variantId.slice(0, 12)}...
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Attributes & GST Breakdown (4 Cols) */}
                  <div className="lg:col-span-4 border-b lg:border-b-0 lg:border-r border-stone-150 pb-4 lg:pb-0 lg:pr-6 space-y-3 text-xs">
                    <div>
                      <span className="block text-[10px] font-extrabold uppercase tracking-wider text-stone-400 mb-1.5">
                        Recorded Variant Attributes
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {Object.entries(item.attributes || {}).length === 0 ? (
                          <span className="text-stone-400 text-xs">Standard Item</span>
                        ) : (
                          Object.entries(item.attributes).map(([k, v]) => (
                            <div
                              key={k}
                              className="bg-stone-50 border border-stone-200 px-2.5 py-1 rounded-lg text-xs"
                            >
                              <span className="text-stone-400 font-medium mr-1">{k}:</span>
                              <strong className="text-stone-800 font-bold">{v}</strong>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-[11px]">
                      <span className="text-stone-500">GST Applied</span>
                      <span className="font-bold text-stone-800">
                        {item.pricing.gstRate ? `${item.pricing.gstRate}% (${formatPrice(item.pricing.gstAmount || 0)})` : "Included"}
                      </span>
                    </div>
                  </div>

                  {/* Divergence Diagnosis (4 Cols) */}
                  <div className="lg:col-span-4 flex flex-col justify-between text-xs">
                    <div>
                      <span className="block text-[10px] font-extrabold uppercase tracking-wider text-stone-400 mb-2">
                        Catalog Consistency Audit
                      </span>
                      {analysis.differences.length === 0 ? (
                        <div className="p-3 bg-emerald-50/80 rounded-2xl border border-emerald-200 text-emerald-900 text-xs flex items-start gap-2">
                          <span className="text-sm font-bold">✓</span>
                          <span>Verified: Live catalog parameters match order snapshot.</span>
                        </div>
                      ) : (
                        <div className="space-y-1.5">
                          {analysis.differences.map((diff, dIdx) => (
                            <div
                              key={dIdx}
                              className={`p-2.5 rounded-xl border text-[11px] leading-relaxed flex items-start gap-2 ${
                                analysis.status === "MISSING_IN_CATALOG"
                                  ? "bg-rose-50 border-rose-200 text-rose-900"
                                  : analysis.status === "LEGACY_ITEM"
                                  ? "bg-stone-50 border-stone-200 text-stone-600"
                                  : "bg-amber-50 border-amber-200 text-amber-900"
                              }`}
                            >
                              <span className="font-bold">{analysis.status === "MISSING_IN_CATALOG" ? "✕" : "⚠"}</span>
                              <span>{diff}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 2 & 3: PAYMENT, FINANCIALS & SHIPPING DETAILS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Payment & Financial Ledger */}
        <div className="bg-white rounded-3xl border border-stone-200/80 p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-black uppercase tracking-wider text-stone-800 flex items-center gap-2">
            <span>💳</span>
            <span>Payment & Financial Ledger</span>
          </h3>
          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between py-2 border-b border-stone-100">
              <span className="text-stone-500">Payment Method</span>
              <span className="font-bold text-stone-900">{order.paymentMethod || "Credit Card"}</span>
            </div>
            {order.transactionId && (
              <div className="flex justify-between py-2 border-b border-stone-100">
                <span className="text-stone-500">Gateway Transaction ID</span>
                <span className="font-mono text-stone-800 text-[11px] select-all">{order.transactionId}</span>
              </div>
            )}
            {order.subtotal !== undefined && (
              <div className="flex justify-between py-1.5 text-stone-600">
                <span>Subtotal</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
            )}
            {order.discount !== undefined && order.discount > 0 && (
              <div className="flex justify-between py-1.5 text-emerald-700 font-semibold">
                <span>Discount Applied</span>
                <span>-{formatPrice(order.discount)}</span>
              </div>
            )}
            {order.tax !== undefined && (
              <div className="flex justify-between py-1.5 text-stone-600">
                <span>Tax / GST</span>
                <span>{formatPrice(order.tax)}</span>
              </div>
            )}
            {order.shipping !== undefined && (
              <div className="flex justify-between py-1.5 text-stone-600">
                <span>Shipping & Delivery</span>
                <span>{order.shipping === 0 ? "FREE" : formatPrice(order.shipping)}</span>
              </div>
            )}
            <div className="flex justify-between pt-3 border-t border-stone-200 text-sm font-black text-stone-900">
              <span>Grand Total</span>
              <span className="text-[#A65B4E] text-base">
                {formatPrice(order.grand_total !== undefined ? order.grand_total : order.total)}
              </span>
            </div>
          </div>
        </div>

        {/* Shipping & Delivery Address */}
        <div className="bg-white rounded-3xl border border-stone-200/80 p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-black uppercase tracking-wider text-stone-800 flex items-center gap-2">
            <span>🚚</span>
            <span>Delivery & Shipping Destination</span>
          </h3>
          {order.address ? (
            <div className="space-y-2.5 text-xs text-stone-700">
              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-150 space-y-1">
                <div className="font-bold text-stone-900 text-sm">
                  {[order.address.firstName, order.address.lastName].filter(Boolean).join(" ") || order.customerName}
                </div>
                {order.address.addressLine1 && <div>{order.address.addressLine1}</div>}
                {order.address.addressLine2 && <div>{order.address.addressLine2}</div>}
                <div>
                  {[order.address.city, order.address.state, order.address.postalCode].filter(Boolean).join(", ")}
                </div>
                {order.address.country && <div className="font-semibold text-stone-800">{order.address.country}</div>}
                {order.address.phone && (
                  <div className="pt-2 font-mono text-stone-600 flex items-center gap-1">
                    <span>📞</span> {order.address.phone}
                  </div>
                )}
              </div>
              <div className="flex justify-between text-stone-500 text-[11px] pt-1">
                <span>Recipient Email</span>
                <span className="font-mono text-stone-800">{order.address.email || order.customerEmail}</span>
              </div>
            </div>
          ) : (
            <div className="p-6 text-center text-stone-400 text-xs">
              Shipping address details archived with order snapshot.
            </div>
          )}
        </div>
      </div>

      {/* SECTION 4: RETURNS & REFUNDS STATUS (If available) */}
      {(returnRequest || refundRecord) && (
        <div className="bg-white rounded-3xl border border-stone-200/80 p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-black uppercase tracking-wider text-stone-800 flex items-center gap-2">
            <span>🔄</span>
            <span>Active Return & Refund Lifecycle</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Return Request Summary */}
            {returnRequest && (
              <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-black uppercase text-[10px] text-amber-900 tracking-wider">
                    Return Request #{returnRequest.id.slice(0, 8)}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-200 text-amber-950 uppercase">
                    {returnRequest.status}
                  </span>
                </div>
                <div className="text-stone-800">
                  <strong className="text-stone-900">Reason:</strong> {returnRequest.reason}
                </div>
                {returnRequest.comments && (
                  <div className="text-stone-600 text-[11px]">
                    <em>&quot;{returnRequest.comments}&quot;</em>
                  </div>
                )}
                {returnRequest.admin_notes && (
                  <div className="pt-1.5 border-t border-amber-200/60 text-[11px] text-stone-700">
                    <strong>Admin Note:</strong> {returnRequest.admin_notes}
                  </div>
                )}
              </div>
            )}

            {/* Refund Summary */}
            {refundRecord && (
              <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-black uppercase text-[10px] text-blue-900 tracking-wider">
                    Refund Record #{refundRecord.id.slice(0, 8)}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-200 text-blue-950 uppercase">
                    {refundRecord.status}
                  </span>
                </div>
                <div className="text-stone-900 font-bold">
                  Amount: {formatPrice(refundRecord.amount)}
                </div>
                {refundRecord.refund_transaction_id && (
                  <div className="font-mono text-[10px] text-stone-600 truncate">
                    Refund Tx: {refundRecord.refund_transaction_id}
                  </div>
                )}
                {refundRecord.remarks && (
                  <div className="text-[11px] text-stone-600">
                    Remarks: {refundRecord.remarks}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SECTION 5: MINUTE-TO-MINUTE ORDER AUDIT TIMELINE */}
      <div className="bg-white rounded-3xl border border-stone-200/80 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-stone-150 pb-3">
          <div>
            <h3 className="text-sm font-black text-stone-900 uppercase tracking-wider flex items-center gap-2">
              <span>📜</span>
              <span>Minute-to-Minute Order Audit Timeline</span>
            </h3>
            <p className="text-xs text-stone-400 font-light mt-0.5">
              Immutable chronological record of every status transition and administrator action.
            </p>
          </div>
        </div>
        <OrderAuditTimeline orderId={orderId} isCustomerView={false} />
      </div>
    </div>
  );
}

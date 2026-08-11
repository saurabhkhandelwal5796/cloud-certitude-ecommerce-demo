// @ts-nocheck
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { formatPrice, getGstLabel } from "@/utils";
import { getSupabaseClient } from "@/lib/supabase/client";
import OrderTimeline from "@/components/ui/OrderTimeline";
import OrderAuditTimeline from "@/components/ui/OrderAuditTimeline";
import ReturnRequestModal from "@/components/ui/ReturnRequestModal";
import {
  getOrders,
  AdminOrder,
  getOrderHistory,
  getReturnRequestByOrderId,
  getRefundByOrderId,
  createReturnRequest,
  ReturnRequestRecord,
  RefundRecord,
} from "@/services/AdminService";
import { isFullSnapshot, coerceLegacyItem } from "@/services/SnapshotService";

interface PageProps {
  params: Promise<{ orderId: string }>;
}

export default function OrderDetailsPage({ params }: PageProps) {
  const router = useRouter();
  const resolvedParams = React.use(params);
  const orderId = resolvedParams.orderId;

  const [order, setOrder] = useState<AdminOrder | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Phase 2 Return Module States
  const [existingReturn, setExistingReturn] = useState<ReturnRequestRecord | null>(null);
  const [associatedRefund, setAssociatedRefund] = useState<RefundRecord | null>(null);
  const [deliveryDate, setDeliveryDate] = useState<Date | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmittingReturn, setIsSubmittingReturn] = useState(false);
  const [returnSuccessMessage, setReturnSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const loadOrderDetail = async () => {
      try {
        const supabase = getSupabaseClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          router.push(`/signin?next=/orders/${orderId}`);
          return;
        }

        const ordersList = await getOrders();
        const found = ordersList.find(
          (o) => o.orderId.toLowerCase() === orderId.toLowerCase()
        );

        if (found) {
          if (found.customerEmail.toLowerCase() === user.email?.toLowerCase()) {
            setOrder(found);

            const existingReturns = await getReturnRequestByOrderId(found.orderId);
            if (existingReturns && existingReturns.length > 0) {
              setExistingReturn(existingReturns[0]);
              const ref = await getRefundByOrderId(found.orderId);
              setAssociatedRefund(ref);
            }

            const history = await getOrderHistory(found.orderId);
            const deliveryEvent = history.find(
              (h) => h.newStatus.toLowerCase() === "delivered"
            );
            if (deliveryEvent) {
              setDeliveryDate(new Date(deliveryEvent.createdAt));
            }
          } else {
            console.warn("[OrderDetails] Unauthorized attempt to access order:", orderId);
          }
        }
      } catch (err) {
        console.error("[OrderDetails] Failed loading order details:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadOrderDetail();
  }, [orderId, router]);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 bg-[#FAF9F6] text-center">
        <div className="flex items-center justify-center gap-2.5 text-stone-500 font-light text-sm">
          <svg className="h-5 w-5 animate-spin text-[#E0A99E]" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Fetching order details...
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 sm:px-6 lg:px-8 bg-[#FAF9F6] text-center space-y-4">
        <span className="text-4xl">🔎</span>
        <h2 className="text-xl font-bold text-stone-850">Order Not Found</h2>
        <p className="text-xs text-stone-500 font-light max-w-sm mx-auto leading-relaxed">
          We couldn&apos;t retrieve order details for ID: <strong className="font-mono text-stone-700">{orderId}</strong>. It may have been placed under a different account or deleted.
        </p>
        <Link
          href="/orders"
          className="inline-flex rounded-full bg-[#E0A99E] px-8 py-2 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#D4988D] transition-colors shadow-sm"
        >
          Return to Orders
        </Link>
      </div>
    );
  }

  // Derived totals (no recalculation allowed)
  const subtotal = order.subtotal;
  const deliveryFee = order.shipping;
  const tax = order.tax;
  const discount = order.discount;
  const grandTotal = order.grand_total;

  // Return Eligibility Logic (7 Days from Delivery Date in order_history)
  const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
  const effectiveDeliveryTime = deliveryDate
    ? deliveryDate.getTime()
    : order.orderDate
    ? new Date(order.orderDate).getTime()
    : Date.now();
  const isWithinReturnWindow = Date.now() - effectiveDeliveryTime <= SEVEN_DAYS_MS;

  const handleReturnSubmit = async (reason: string, comments: string) => {
    setIsSubmittingReturn(true);
    try {
      const supabase = getSupabaseClient();
      const { data: { user } } = await supabase.auth.getUser();

      const created = await createReturnRequest({
        orderId: order.orderId,
        customerEmail: order.customerEmail,
        reason,
        comments,
        userId: user?.id ?? null,
      });

      if (created) {
        setExistingReturn(created);
        setReturnSuccessMessage("Your return request has been submitted successfully.");
      }
    } catch (err) {
      console.error("[OrderDetails] Failed submitting return request:", err);
      throw err;
    } finally {
      setIsSubmittingReturn(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 bg-[#FAF9F6] text-stone-800 min-h-[calc(100vh-10rem)]">
      
      {/* Back Link */}
      <div className="mb-6">
        <Link
          href="/orders"
          className="text-xs text-stone-400 hover:text-stone-850 font-bold uppercase tracking-widest transition-colors inline-flex items-center gap-1"
        >
          ← Back to Orders
        </Link>
      </div>

      {/* Main Container */}
      <div className="rounded-2xl border border-stone-250 bg-white shadow-sm overflow-hidden text-left">
        
        {/* Header Summary */}
        <div className="border-b border-stone-150 bg-stone-50 px-6 py-6 flex flex-col sm:flex-row justify-between gap-4">
          <div>
            <h1 className="text-lg font-black text-stone-900 tracking-wider uppercase">
              Order Details
            </h1>
            <p className="mt-1 text-xs text-stone-400 font-light tracking-wide">
              Placed on {order.orderDate}
            </p>
          </div>
          <div className="text-right sm:text-right">
            <span className="block text-[10px] text-stone-400 font-light uppercase tracking-wider">
              Order ID
            </span>
            <span className="font-mono font-bold text-stone-850 text-sm select-all uppercase">
              {order.orderId}
            </span>
            {order.transactionId && (
              <span className="block text-[10px] text-stone-400 font-mono mt-0.5" title="Transaction ID">
                Tx: {order.transactionId}
              </span>
            )}
          </div>
        </div>

        {/* 1. Fulfillment Progress Tracker */}
        <div className="px-6 py-8 border-b border-stone-150 space-y-6">
          <div>
            <h3 className="text-xs font-bold text-stone-900 uppercase tracking-widest mb-6">
              Fulfillment Progress
            </h3>
            <div className="bg-stone-50 rounded-xl p-6 border border-stone-200/50">
              <OrderTimeline status={order.status} />
            </div>
          </div>

          {/* Audit History Log */}
          <OrderAuditTimeline orderId={orderId} isCustomerView={true} />

          {/* Product Return & Refund Request Module */}
          {(existingReturn || order.status === "Delivered" || order.status.toLowerCase().includes("return")) && (
            <div className="pt-6 border-t border-stone-150">
              {existingReturn ? (
                <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-5 text-xs">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-stone-200/60 pb-4">
                    <div>
                      <span className="block text-[9px] font-black uppercase tracking-widest text-[#E0A99E]">
                        Product Return Overview
                      </span>
                      <p className="font-bold text-stone-900 text-sm mt-0.5">
                        Reason: <span className="text-stone-700 font-medium">{existingReturn.reason}</span>
                      </p>
                      {existingReturn.comments && (
                        <p className="text-[11px] text-stone-500 font-light mt-0.5 italic">
                          &ldquo;{existingReturn.comments}&rdquo;
                        </p>
                      )}
                    </div>
                    <span className="px-3.5 py-1 rounded-full bg-[#E0A99E]/10 text-[#C68B7D] text-[10px] font-extrabold uppercase tracking-wider border border-[#E0A99E]/20">
                      {existingReturn.status}
                    </span>
                  </div>

                  {/* 5-Stage Customer Return & Refund Progress Lifecycle */}
                  <div>
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-3">
                      Return & Refund Progress Tracker
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-center">
                      {/* Step 1: Return Requested */}
                      <div className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/60">
                        <span className="block text-[9px] font-black uppercase text-emerald-700">1. Return Requested</span>
                        <span className="block text-[10px] text-emerald-900 font-bold mt-1">Done ✓</span>
                        <span className="block text-[9px] text-emerald-700/80 font-light mt-0.5">
                          {new Date(existingReturn.created_at).toLocaleDateString()}
                        </span>
                      </div>

                      {/* Step 2: Return Approved / Rejected */}
                      <div
                        className={`p-3 rounded-xl border ${
                          existingReturn.status.toLowerCase() === "rejected"
                            ? "border-rose-200 bg-rose-50/60 text-rose-900"
                            : existingReturn.status.toLowerCase() === "approved" || existingReturn.status.toLowerCase() === "returned"
                            ? "border-emerald-200 bg-emerald-50/60 text-emerald-900"
                            : "border-stone-200 bg-white text-stone-400"
                        }`}
                      >
                        <span className="block text-[9px] font-black uppercase">
                          2. {existingReturn.status.toLowerCase() === "rejected" ? "Return Rejected" : "Return Approved"}
                        </span>
                        <span className="block text-[10px] font-bold mt-1">
                          {existingReturn.status.toLowerCase() === "pending" ? "Pending" : "Done ✓"}
                        </span>
                      </div>

                      {/* Step 3: Product Received */}
                      <div
                        className={`p-3 rounded-xl border ${
                          existingReturn.status.toLowerCase() === "returned"
                            ? "border-emerald-200 bg-emerald-50/60 text-emerald-900"
                            : "border-stone-200 bg-white text-stone-400"
                        }`}
                      >
                        <span className="block text-[9px] font-black uppercase">3. Product Received</span>
                        <span className="block text-[10px] font-bold mt-1">
                          {existingReturn.status.toLowerCase() === "returned" ? "Received ✓" : "Pending"}
                        </span>
                        {existingReturn.received_at && (
                          <span className="block text-[9px] font-light mt-0.5">
                            {new Date(existingReturn.received_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>

                      {/* Step 4: Refund Initiated */}
                      <div
                        className={`p-3 rounded-xl border ${
                          associatedRefund?.status === "Initiated" || associatedRefund?.status === "Completed"
                            ? "border-emerald-200 bg-emerald-50/60 text-emerald-900"
                            : "border-stone-200 bg-white text-stone-400"
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
                            ? "border-emerald-200 bg-emerald-50/60 text-emerald-900"
                            : "border-stone-200 bg-white text-stone-400"
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
              ) : isWithinReturnWindow ? (
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-stone-50 border border-stone-200/80">
                  <div>
                    <h4 className="font-extrabold text-stone-900 uppercase tracking-wider text-xs">
                      Eligible for Return
                    </h4>
                    <p className="text-[11px] text-stone-500 font-light mt-0.5">
                      Items delivered within the last 7 days are eligible for hassle-free return.
                    </p>
                  </div>
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="rounded-full bg-[#E0A99E] px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#D4988D] transition-colors shadow-sm cursor-pointer whitespace-nowrap"
                  >
                    Request Return
                  </button>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-xs text-stone-500 font-light">
                  <span className="font-bold text-stone-800 uppercase text-[10px] tracking-wider block mb-0.5">Return Window Notice</span>
                  Return window has expired.
                </div>
              )}

              {returnSuccessMessage && (
                <div className="mt-3 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2">
                  <span className="text-base">✓</span>
                  <span>{returnSuccessMessage}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 2. Billing & Shipping Metadata */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 border-b border-stone-150 text-xs">
          {/* Left Column: Shipping Address */}
          <div className="space-y-3">
            <h3 className="font-bold text-stone-900 uppercase tracking-wider text-[10px] border-b border-stone-105 pb-1">
              Shipping Address
            </h3>
            {order.address ? (
              <div className="text-stone-600 font-light leading-relaxed space-y-0.5 pt-1">
                <p className="font-semibold text-stone-850">
                  {order.address.firstName} {order.address.lastName}
                </p>
                <p>{order.address.addressLine1}</p>
                {order.address.addressLine2 && <p>{order.address.addressLine2}</p>}
                <p>
                  {order.address.city}, {order.address.state} {order.address.postalCode}
                </p>
                <p>{order.address.country}</p>
                <p className="mt-2 text-stone-500">📞 {order.address.phone}</p>
              </div>
            ) : (
              <p className="text-stone-400 font-light">No shipping location info.</p>
            )}
          </div>

          {/* Right Column: Billing breakdown */}
          <div className="space-y-3">
            <h3 className="font-bold text-stone-900 uppercase tracking-wider text-[10px] border-b border-stone-105 pb-1">
              Billing Invoice Summary
            </h3>
            <div className="space-y-2 pt-1 font-light text-stone-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{subtotal !== undefined && subtotal !== null ? formatPrice(subtotal) : "Data unavailable"}</span>
              </div>
              {discount !== undefined && discount !== null ? (
                discount > 0 ? (
                  <div className="flex justify-between text-rose-600">
                    <span>Discount</span>
                    <span>- {formatPrice(discount)}</span>
                  </div>
                ) : null
              ) : (
                <div className="flex justify-between text-rose-600">
                  <span>Discount</span>
                  <span>Data unavailable</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>{getGstLabel(order.items)}</span>
                <span>{tax !== undefined && tax !== null ? formatPrice(tax) : "Data unavailable"}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping & Handling</span>
                <span>{deliveryFee !== undefined && deliveryFee !== null ? (deliveryFee === 0 ? "Free" : formatPrice(deliveryFee)) : "Data unavailable"}</span>
              </div>
              <div className="flex justify-between">
                <span>Payment Mode</span>
                <span className="font-semibold text-stone-850">{order.paymentMethod}</span>
              </div>
              {order.transactionId && (
                <div className="flex justify-between text-[11px] font-mono">
                  <span>Transaction Ref</span>
                  <span className="text-stone-700 truncate max-w-[160px]" title={order.transactionId}>{order.transactionId}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-stone-950 border-t border-stone-150 pt-2 text-sm">
                <span>Grand Total</span>
                <span>{grandTotal !== undefined && grandTotal !== null ? formatPrice(grandTotal) : "Data unavailable"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Items Bought */}
        <div className="p-6 space-y-4">
          <h3 className="text-xs font-bold text-stone-900 uppercase tracking-widest mb-4">
            Items in this Order
          </h3>
          
          <div className="space-y-6">
            {order.items?.map((rawItem, idx) => {
              const item = isFullSnapshot(rawItem) ? rawItem : coerceLegacyItem(rawItem as any);
              const isSnapshot = isFullSnapshot(rawItem);
              return (
                <div
                  key={`${item.productName}-${idx}`}
                  className="flex items-start gap-5 pb-5 border-b border-stone-100 last:border-0 last:pb-0"
                >
                  <div className="relative h-24 w-18 rounded-lg border border-stone-200 overflow-hidden bg-stone-50 flex-shrink-0">
                    {item.productImage ? (
                      <Image
                        src={item.productImage}
                        alt={item.productName}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[10px] text-stone-400 font-light">
                        No Image
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 text-xs">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[9px] uppercase font-bold text-[#E0A99E] tracking-wider block">
                          {item.brand || "Atelier"} {item.category ? `· ${item.category}` : ""}
                        </span>
                        <Link
                          href={`/products/${item.productId || "m1"}`}
                          className="font-bold text-stone-900 hover:text-[#E0A99E] transition-colors text-sm uppercase tracking-wide block"
                        >
                          {item.productName}
                        </Link>
                      </div>
                      <span className="font-bold text-stone-850 text-sm whitespace-nowrap">
                        {formatPrice(item.pricing.subtotal)}
                      </span>
                    </div>

                    {item.sku && (
                      <div className="mt-1 flex items-center gap-1.5">
                        <span className="text-[10px] font-mono bg-stone-100 px-2 py-0.5 rounded text-stone-600">
                          SKU: <strong>{item.sku}</strong>
                        </span>
                        {isSnapshot && (
                          <span className="text-[9px] bg-emerald-50 text-emerald-700 font-bold uppercase px-1.5 py-0.5 rounded border border-emerald-200/50">
                            Verified Snapshot
                          </span>
                        )}
                      </div>
                    )}

                    {item.productDescription && (
                      <p className="mt-1.5 text-[11px] text-stone-500 font-light line-clamp-2 leading-relaxed">
                        {item.productDescription}
                      </p>
                    )}

                    <div className="mt-2 pt-2 border-t border-stone-100 flex flex-wrap items-center gap-2 text-xs">
                      {Object.entries(item.attributes).map(([attrName, attrVal]) => (
                        <span key={attrName} className="inline-flex items-center gap-1 bg-stone-50 border border-stone-200 px-2 py-0.5 rounded-md text-[11px]">
                          <span className="text-stone-400 font-light">{attrName}:</span>
                          <strong className="font-semibold text-stone-700">{attrVal}</strong>
                        </span>
                      ))}
                      <span className="inline-flex items-center gap-1 bg-stone-900 text-white px-2.5 py-0.5 rounded-md text-[11px] font-medium ml-auto">
                        Qty: <strong className="font-bold">{item.pricing.quantity}</strong>
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

      </div>

      {/* Return Request Modal Component */}
      <ReturnRequestModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleReturnSubmit}
        orderId={order.orderId}
        isSubmitting={isSubmittingReturn}
      />
    </div>
  );
}

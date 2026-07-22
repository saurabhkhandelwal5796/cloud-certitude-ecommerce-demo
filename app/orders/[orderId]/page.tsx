"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { formatPrice } from "@/utils";
import { getSupabaseClient } from "@/lib/supabase/client";
import OrderTimeline from "@/components/ui/OrderTimeline";
import { getOrders, AdminOrder } from "@/services/AdminService";

interface PageProps {
  params: Promise<{ orderId: string }>;
}

/**
 * Customer Order Details Subpage (/orders/[orderId])
 *
 * Renders complete metadata, timeline tracking, and billing invoice for a single order.
 */
export default function OrderDetailsPage({ params }: PageProps) {
  const router = useRouter();
  const resolvedParams = React.use(params);
  const orderId = resolvedParams.orderId;

  const [order, setOrder] = useState<AdminOrder | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
          // Verify customer authorization
          if (found.customerEmail.toLowerCase() === user.email?.toLowerCase()) {
            setOrder(found);
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
          </div>
        </div>

        {/* 1. Fulfillment Progress Tracker */}
        <div className="px-6 py-8 border-b border-stone-150">
          <h3 className="text-xs font-bold text-stone-900 uppercase tracking-widest mb-6">
            Fulfillment Progress
          </h3>
          <div className="bg-stone-50 rounded-xl p-6 border border-stone-200/50">
            <OrderTimeline status={order.status} />
          </div>
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
                <span>Estimated Tax (8%)</span>
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
          
          <div className="space-y-4">
            {order.items?.map((item, idx) => (
              <div
                key={`${item.name}-${item.size}-${item.color}-${idx}`}
                className="flex items-start gap-4 pb-4 border-b border-stone-100 last:border-0 last:pb-0"
              >
                {item.imageSrc && (
                  <div className="relative h-20 w-15 rounded-lg border border-stone-200 overflow-hidden bg-stone-50 flex-shrink-0">
                    <Image
                      src={item.imageSrc}
                      alt={item.name}
                      fill
                      sizes="60px"
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0 text-xs">
                  <span className="block font-bold text-stone-900 text-sm truncate uppercase tracking-wide">
                    {item.name}
                  </span>
                  <span className="block text-[10px] text-stone-400 font-light mt-0.5">
                    Size: {item.size} &middot; Color: {item.color} &middot; Qty: {item.quantity}
                  </span>
                  <span className="block text-xs font-bold text-stone-850 mt-1">
                    {formatPrice(item.price)}
                  </span>
                </div>
              </div>
            ))}
          </div>

        </div>

      </div>
    </div>
  );
}

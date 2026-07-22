"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { formatPrice } from "@/utils";
import { AddressType } from "@/components/ui/ShippingForm";

interface OrderDetailType {
  orderId: string;
  deliveryDate: string;
  address: AddressType;
  paymentMethod: string;
  razorpayPaymentId?: string;
  transactionId?: string;
  paymentTimestamp?: string;
  itemsCount: number;
  items: Array<{
    name: string;
    quantity: number;
    size: string;
    color: string;
    price: number;
  }>;
  totals: {
    subtotal: number;
    shipping: number;
    tax?: number;
    discountPercent: number;
    grandTotal: number;
  };
}

/**
 * OrderConfirmationPage Component
 *
 * Renders the checkout success page.
 * Loads details from the placed order in localStorage.
 */
export default function OrderConfirmationPage() {
  const [order, setOrder] = useState<OrderDetailType | null>(null);

  useEffect(() => {
    const loadOrder = async () => {
      try {
        const stored = localStorage.getItem("certitude_last_order");
        if (stored) {
          setOrder(JSON.parse(stored));
        }
      } catch (err) {
        console.error("[Confirmation] Failed loading order from localStorage:", err);
      }
    };
    loadOrder();
  }, []);

  if (!order) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 bg-[#FAF9F6] text-center">
        <h2 className="text-xl font-bold text-stone-850">No Order Details Found</h2>
        <p className="mt-2 text-xs text-stone-500 font-light max-w-sm mx-auto leading-relaxed">
          We couldn&apos;t load the parameters for your last transaction. Please visit your profile or explore items.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex rounded-full bg-[#E0A99E] px-8 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#D4988D] transition-colors shadow-sm"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  // Format Payment method display name
  const formatPaymentName = (method: string) => {
    if (method === "credit") return "Credit Card";
    if (method === "debit") return "Debit Card";
    if (method === "upi") return "UPI Payments";
    if (method === "netbanking") return "Net Banking";
    if (method === "razorpay") return "Razorpay (Test)";
    return "Cash on Delivery";
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8 bg-[#FAF9F6] text-stone-800">
      {/* Visual Success Card Header */}
      <div className="rounded-3xl border border-stone-200/50 bg-white p-6 md:p-8 shadow-sm text-center space-y-6">
        
        {/* Checkmark icon */}
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500 mb-2">
          <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <div>
          <h1 className="text-xl md:text-2xl font-black text-stone-900 tracking-wider uppercase">
            Order Confirmed!
          </h1>
          <p className="mt-2 text-xs text-stone-500 font-light leading-relaxed max-w-md mx-auto">
            Thank you for your patron membership at <strong>Cloud Certitude Fashion</strong>. Your order is registered and currently processing in our warehouse.
          </p>
        </div>

        {/* Order ID & delivery estimation */}
        <div className="grid grid-cols-2 gap-4 bg-stone-50/50 rounded-2xl p-4 text-left text-xs border border-stone-100">
          <div>
            <span className="block text-stone-400 font-light">Order ID</span>
            <span className="font-extrabold text-stone-850 uppercase select-all">{order.orderId}</span>
          </div>
          <div>
            <span className="block text-stone-400 font-light">Estimated Delivery</span>
            <span className="font-extrabold text-stone-850">{order.deliveryDate}</span>
          </div>
        </div>

        {/* Address and payment info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left text-xs pt-2">
          
          {/* Shipping address details */}
          <div className="space-y-2">
            <h4 className="font-bold text-stone-900 uppercase tracking-wider text-[10px] border-b border-stone-105 pb-1">
              Shipping Address
            </h4>
            <div className="text-stone-600 font-light leading-relaxed space-y-0.5">
              <p className="font-semibold text-stone-850">
                {order.address.firstName} {order.address.lastName}
              </p>
              <p>{order.address.addressLine1}</p>
              {order.address.addressLine2 && <p>{order.address.addressLine2}</p>}
              <p>
                {order.address.city}, {order.address.state} {order.address.postalCode}
              </p>
              <p>{order.address.country}</p>
              <p className="mt-1">📞 {order.address.phone}</p>
            </div>
          </div>

          {/* Payment and totals summary */}
          <div className="space-y-4">
            {/* Payment method */}
            <div className="space-y-1">
              <h4 className="font-bold text-stone-900 uppercase tracking-wider text-[10px] border-b border-stone-105 pb-1">
                Payment Details
              </h4>
              <p className="text-stone-600 font-light mt-1">
                Method: <strong className="font-semibold text-stone-850">{formatPaymentName(order.paymentMethod)}</strong>
              </p>
              {order.transactionId && (
                <p className="text-stone-500 font-light text-[10px] mt-1 break-all">
                  Transaction ID:{" "}
                  <span className="font-mono text-stone-700 select-all">{order.transactionId}</span>
                </p>
              )}
              {order.paymentTimestamp && (
                <p className="text-stone-500 font-light text-[10px] mt-0.5">
                  Paid On: <span className="text-stone-700">{order.paymentTimestamp}</span>
                </p>
              )}
              {order.razorpayPaymentId && !order.transactionId && (
                <p className="text-stone-500 font-light text-[10px] mt-1 break-all">
                  Payment ID:{" "}
                  <span className="font-mono text-stone-700 select-all">{order.razorpayPaymentId}</span>
                </p>
              )}
            </div>

            {/* Calculations summaries */}
            <div className="space-y-2 text-stone-600">
              <h4 className="font-bold text-stone-900 uppercase tracking-wider text-[10px] border-b border-stone-105 pb-1">
                Totals Summary
              </h4>
              <div className="space-y-1.5 font-light">
                <div className="flex justify-between">
                  <span>Subtotal ({order.itemsCount} Items)</span>
                  <span>{formatPrice(order.totals.subtotal)}</span>
                </div>
                {order.totals.discountPercent > 0 && (
                  <div className="flex justify-between text-rose-600">
                    <span>Discount (-{order.totals.discountPercent}%)</span>
                    <span>- {formatPrice(order.totals.subtotal * (order.totals.discountPercent / 100))}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Shipping Fee</span>
                  <span>{order.totals.shipping === 0 ? "Free" : `₹${order.totals.shipping}`}</span>
                </div>
                {order.totals.tax !== undefined && order.totals.tax > 0 && (
                  <div className="flex justify-between">
                    <span>Estimated Tax (8%)</span>
                    <span>{formatPrice(order.totals.tax)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-stone-950 border-t border-stone-100 pt-1.5">
                  <span>Grand Total</span>
                  <span>{formatPrice(order.totals.grandTotal)}</span>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* Continue Shopping button */}
        <div className="pt-6 border-t border-stone-105">
          <Link
            href="/"
            className="inline-flex rounded-full bg-[#E0A99E] px-8 py-3 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#D4988D] transition-colors shadow-md hover:shadow-[#E0A99E]/20"
          >
            Continue Shopping
          </Link>
        </div>

      </div>
    </div>
  );
}

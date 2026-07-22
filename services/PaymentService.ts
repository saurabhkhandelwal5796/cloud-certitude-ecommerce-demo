/**
 * PaymentService.ts
 *
 * Pure TypeScript service module for simulated payment processing.
 * Contains no external dependencies.
 *
 * Exports:
 *   - generateOrderId()         → ORD-YYYYMMDD-XXXXX style order IDs
 *   - generateTransactionId()   → TXN-YYYYMMDD-XXXXX style transaction IDs
 *   - generatePaymentTimestamp()→ human-readable transaction timestamp
 *   - computeDeliveryDate()     → human-readable estimated delivery string
 *   - buildOrderPayload(...)    → packages the order payload for localStorage
 */

import type { CartItemType } from "@/context/CartContext";
import type { AddressType } from "@/components/ui/ShippingForm";
import { calculateOrderTotals } from "./PricingService";

/**
 * Generates an Order ID in the format ORD-YYYYMMDD-XXXXX.
 */
export function generateOrderId(): string {
  const date = new Date();
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(10000 + Math.random() * 90000).toString();
  return `ORD-${yyyy}${mm}${dd}-${random}`;
}

/**
 * Generates a Transaction ID in the format TXN-YYYYMMDD-XXXXX.
 */
export function generateTransactionId(): string {
  const date = new Date();
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(10000 + Math.random() * 90000).toString();
  return `TXN-${yyyy}${mm}${dd}-${random}`;
}

/**
 * Generates a formatted payment timestamp.
 * Example: "Jul 17, 2026, 10:45 AM"
 */
export function generatePaymentTimestamp(): string {
  return new Date().toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

/**
 * Computes a human-readable estimated delivery string based on delivery option.
 */
export function computeDeliveryDate(deliveryOption: string): string {
  if (deliveryOption === "sameday") return "Today by 9 PM";

  const date = new Date();
  if (deliveryOption === "express") {
    date.setDate(date.getDate() + 2);
  } else {
    date.setDate(date.getDate() + 5);
  }

  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

export interface OrderPayload {
  orderId: string;
  transactionId?: string;
  paymentTimestamp?: string;
  deliveryDate: string;
  address: AddressType;
  paymentMethod: string;
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
    tax: number;
    discount: number;
    discountPercent: number;
    grandTotal: number;
  };
}

/**
 * Builds the complete order payload for localStorage.
 */
export function buildOrderPayload(params: {
  orderId: string;
  transactionId?: string;
  paymentTimestamp?: string;
  cartItems: CartItemType[];
  address: AddressType;
  deliveryOption: string;
  deliveryFee: number;
  selectedPayment: string;
  discountPercent: number;
}): OrderPayload {
  const {
    orderId,
    transactionId,
    paymentTimestamp,
    cartItems,
    address,
    deliveryOption,
    deliveryFee,
    selectedPayment,
    discountPercent,
  } = params;

  const subtotal = cartItems.reduce(
    (acc, item) =>
      acc +
      (item.discountPercent
        ? item.price * (1 - item.discountPercent / 100)
        : item.price) *
        item.quantity,
    0
  );

  const discountAmount = subtotal * (discountPercent / 100);
  const calculated = calculateOrderTotals(subtotal, deliveryFee, discountAmount);

  return {
    orderId,
    transactionId,
    paymentTimestamp,
    deliveryDate: computeDeliveryDate(deliveryOption),
    address,
    paymentMethod: selectedPayment,
    itemsCount: cartItems.length,
    items: cartItems.map((item) => ({
      name: item.name,
      quantity: item.quantity,
      size: item.selectedSize,
      color: item.selectedColor,
      price: item.price,
    })),
    totals: {
      subtotal: calculated.subtotal,
      shipping: calculated.shipping,
      tax: calculated.tax,
      discount: calculated.discount,
      discountPercent,
      grandTotal: calculated.grandTotal,
    },
  };
}

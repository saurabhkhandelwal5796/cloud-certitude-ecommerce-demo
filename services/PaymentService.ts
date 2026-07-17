/**
 * PaymentService.ts
 *
 * Pure TypeScript service module for Razorpay TEST MODE integration.
 * Contains no React dependencies — safe to call from any component or context.
 *
 * Exports:
 *   - generateOrderId()         → CC-XXXXXXXX style order IDs
 *   - computeDeliveryDate()     → human-readable estimated delivery string
 *   - loadRazorpayScript()      → dynamically injects the Razorpay CDN script
 *   - openRazorpayCheckout()    → opens the Razorpay modal and returns a Promise
 */

import type { CartItemType } from "@/context/CartContext";
import type { AddressType } from "@/components/ui/ShippingForm";

// ---------------------------------------------------------------------------
// Order ID generator
// ---------------------------------------------------------------------------

/**
 * Generates a unique order ID in the format CC-XXXXXXXX.
 * Prefixed with "CC" for Cloud Certitude.
 */
export function generateOrderId(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.floor(100000 + Math.random() * 900000).toString();
  return `CC-${timestamp}${random.slice(0, 4)}`;
}

// ---------------------------------------------------------------------------
// Delivery date calculator
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Order payload builder
// ---------------------------------------------------------------------------

export interface OrderPayload {
  orderId: string;
  deliveryDate: string;
  address: AddressType;
  paymentMethod: string;
  razorpayPaymentId?: string;
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
    discountPercent: number;
    grandTotal: number;
  };
}

/**
 * Builds the complete order payload for localStorage storage.
 */
export function buildOrderPayload(params: {
  orderId: string;
  cartItems: CartItemType[];
  address: AddressType;
  deliveryOption: string;
  deliveryFee: number;
  selectedPayment: string;
  discountPercent: number;
  razorpayPaymentId?: string;
}): OrderPayload {
  const {
    orderId,
    cartItems,
    address,
    deliveryOption,
    deliveryFee,
    selectedPayment,
    discountPercent,
    razorpayPaymentId,
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

  const tax = subtotal * 0.08;
  const discountAmount = subtotal * (discountPercent / 100);
  const grandTotal = subtotal + tax + deliveryFee - discountAmount;

  return {
    orderId,
    deliveryDate: computeDeliveryDate(deliveryOption),
    address,
    paymentMethod: selectedPayment,
    razorpayPaymentId,
    itemsCount: cartItems.length,
    items: cartItems.map((item) => ({
      name: item.name,
      quantity: item.quantity,
      size: item.selectedSize,
      color: item.selectedColor,
      price: item.price,
    })),
    totals: {
      subtotal,
      shipping: deliveryFee,
      tax,
      discountPercent,
      grandTotal,
    },
  };
}

// ---------------------------------------------------------------------------
// Razorpay script loader
// ---------------------------------------------------------------------------

const RAZORPAY_SCRIPT_URL = "https://checkout.razorpay.com/v1/checkout.js";

/**
 * Dynamically injects the Razorpay Checkout script into the document.
 * Resolves to true if the script loaded successfully, false otherwise.
 * Safe to call multiple times — will not duplicate the script tag.
 */
export function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    // Already loaded
    if (typeof window !== "undefined" && window.Razorpay) {
      resolve(true);
      return;
    }

    // Check if script tag already exists (e.g. still loading)
    const existingScript = document.querySelector(
      `script[src="${RAZORPAY_SCRIPT_URL}"]`
    );
    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(true));
      existingScript.addEventListener("error", () => resolve(false));
      return;
    }

    const script = document.createElement("script");
    script.src = RAZORPAY_SCRIPT_URL;
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

// ---------------------------------------------------------------------------
// Razorpay checkout opener
// ---------------------------------------------------------------------------

export interface RazorpayCheckoutParams {
  /** Razorpay Key ID — from NEXT_PUBLIC_RAZORPAY_KEY_ID */
  keyId: string;
  /** Grand total in INR (will be converted to paise: × 100) */
  amountInRupees: number;
  /** Pre-fill customer name */
  customerName: string;
  /** Pre-fill customer email */
  customerEmail: string;
  /** Pre-fill customer phone */
  customerPhone: string;
  /** Pre-created Razorpay order ID from backend (optional) */
  razorpayOrderId?: string;
}

export interface RazorpayCheckoutResult {
  success: true;
  paymentId: string;
}

export interface RazorpayCheckoutFailure {
  success: false;
  error: string;
}

/**
 * Opens the Razorpay payment modal.
 * Returns a Promise that resolves when the modal is closed (success or failure).
 *
 * In TEST MODE:
 *   - Use test cards:  4111 1111 1111 1111  (Visa success)
 *                      5104 0600 0000 0008  (Mastercard success)
 *   - Use test UPI:    success@razorpay     (success)
 *                      failure@razorpay     (failure)
 */
export function openRazorpayCheckout(
  params: RazorpayCheckoutParams
): Promise<RazorpayCheckoutResult | RazorpayCheckoutFailure> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !window.Razorpay) {
      resolve({ success: false, error: "Razorpay SDK not loaded." });
      return;
    }

    const options: RazorpayOptions = {
      key: params.keyId,
      // Razorpay expects amount in paise (1 INR = 100 paise)
      amount: Math.round(params.amountInRupees * 100),
      currency: "INR",
      name: "Cloud Certitude Fashion",
      description: "Premium Fashion — TEST MODE",
      order_id: params.razorpayOrderId,
      prefill: {
        name: params.customerName,
        email: params.customerEmail,
        contact: params.customerPhone,
      },
      theme: {
        color: "#E0A99E",
      },
      modal: {
        confirm_close: true,
        ondismiss: () => {
          resolve({
            success: false,
            error: "Payment was cancelled. Please try again.",
          });
        },
      },
      handler: (response: RazorpayPaymentResponse) => {
        resolve({
          success: true,
          paymentId: response.razorpay_payment_id,
        });
      },
    };

    try {
      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", () => {
        resolve({
          success: false,
          error: "Payment Failed. Please try again.",
        });
      });
      rzp.open();
    } catch (err) {
      resolve({
        success: false,
        error: err instanceof Error ? err.message : "Unexpected payment error.",
      });
    }
  });
}

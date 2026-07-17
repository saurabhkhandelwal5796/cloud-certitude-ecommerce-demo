/**
 * razorpay.d.ts
 *
 * Global TypeScript ambient declaration for the Razorpay Checkout JS SDK.
 * The SDK is loaded at runtime via a <script> tag (CDN), not via npm.
 * This file prevents TypeScript from erroring on `new window.Razorpay(...)`.
 *
 * Reference: https://razorpay.com/docs/payment-gateway/web-integration/standard/
 */

interface RazorpayOptions {
  /** Razorpay Key ID (starts with rzp_test_ in test mode) */
  key: string;
  /** Amount in the smallest currency unit (paise for INR) */
  amount: number;
  /** ISO 4217 currency code, e.g. "INR" */
  currency: string;
  /** Display name of your store */
  name: string;
  /** Short description shown inside the modal */
  description?: string;
  /** Base64-encoded logo shown inside the modal */
  image?: string;
  /** Pre-created Razorpay Order ID (optional for test mode) */
  order_id?: string;
  /** Called when payment is successfully captured */
  handler: (response: RazorpayPaymentResponse) => void;
  /** Pre-fill customer details */
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  /** Theming */
  theme?: {
    color?: string;
  };
  /** Modal configuration */
  modal?: {
    /** Whether closing the modal triggers ondismiss */
    confirm_close?: boolean;
    /** Called when the modal is dismissed without completing payment */
    ondismiss?: () => void;
    /** Redirect to the payment URL instead of using iframe */
    escape?: boolean;
    /** Whether to handle modal internally */
    handleback?: boolean;
  };
}

interface RazorpayPaymentResponse {
  razorpay_payment_id: string;
  razorpay_order_id?: string;
  razorpay_signature?: string;
}

interface RazorpayInstance {
  open(): void;
  on(event: string, callback: () => void): void;
}

interface RazorpayConstructor {
  new (options: RazorpayOptions): RazorpayInstance;
}

interface Window {
  Razorpay: RazorpayConstructor;
}

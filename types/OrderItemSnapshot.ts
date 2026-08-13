/**
 * OrderItemSnapshot — the immutable record of a purchased item.
 *
 * Written once at checkout and never mutated thereafter.
 * All product/variant data is frozen at purchase time so historical
 * orders remain accurate even after products are edited or deleted.
 */
export interface OrderItemSnapshot {
  // ── Product identity ──────────────────────────────────────────
  productId: string;
  productName: string;
  productDescription: string;
  brand: string;
  category: string;
  productImage: string;

  // ── Variant identity ──────────────────────────────────────────
  variantId: string;
  variantSignature: string;        // e.g. "Blue|32|Slim|Mid Rise"
  sku: string;

  // ── All selected attributes ───────────────────────────────────
  // e.g. { Color: "Blue", Size: "32", Fit: "Slim", Rise: "Mid Rise" }
  attributes: Record<string, string>;

  // ── Pricing ───────────────────────────────────────────────────
  pricing: {
    unitPrice: number;             // price at time of purchase (post-discount)
    originalPrice: number;         // pre-discount price
    discountPercent: number;
    quantity: number;
    subtotal: number;              // unitPrice * quantity
    /** GST rate applied to this line item (e.g. 5, 12, 18, 28). Frozen at purchase time. */
    gstRate?: number;
    /** Exact GST amount calculated for this line item (after global discounts). Frozen at purchase time. */
    gstAmount?: number;
    /** Final line total including GST. Frozen at purchase time. */
    lineTotal?: number;
  };

  // ── Purchase metadata ─────────────────────────────────────────
  purchaseMetadata: {
    orderId: string;
    orderDate: string;             // ISO timestamp
    paymentMethod: string;
    transactionId: string;
  };
}

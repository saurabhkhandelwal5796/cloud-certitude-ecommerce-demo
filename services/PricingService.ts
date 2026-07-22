export interface OrderTotals {
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  grandTotal: number;
}

/**
 * Single source of truth for order calculations.
 * - Tax is 8%
 * - Tax applies on (subtotal + shipping)
 * - grandTotal = subtotal + shipping + tax - discount
 */
export function calculateOrderTotals(
  subtotal: number,
  shipping: number,
  discount: number
): OrderTotals {
  const discountedSubtotal = subtotal - discount;
  const taxableValue = discountedSubtotal + shipping;
  const tax = Number((taxableValue * 0.08).toFixed(2));
  const grandTotal = Number((taxableValue + tax).toFixed(2));

  return {
    subtotal,
    tax,
    shipping,
    discount,
    grandTotal,
  };
}

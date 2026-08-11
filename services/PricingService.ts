export interface OrderTotals {
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  grandTotal: number;
}

/**
 * Single source of truth for order calculations (Pure utility, zero localStorage dependence).
 * - Primary: Calculate GST using active items passed by caller
 * - Fallback: GST = 0% if items are missing (warns)
 * - Defensive check: Warn if sum of item subtotals != subtotal parameter
 */
export function calculateOrderTotals(
  subtotal: number,
  shipping: number,
  discount: number,
  cartItems?: any[]
): OrderTotals {
  let tax = 0;
  const items = cartItems && Array.isArray(cartItems) ? cartItems : [];

  if (items.length > 0 && subtotal > 0) {
    let itemsCalculatedSubtotal = 0;

    items.forEach((item) => {
      const price = Number(item.price || 0);
      const qty = Number(item.quantity || 1);
      const discPct = Number(item.discountPercent || item.discount_percent || 0);
      const originalSubtotal = price * qty;
      const itemSubtotalAfterItemDiscount = originalSubtotal * (1 - discPct / 100);
      itemsCalculatedSubtotal += itemSubtotalAfterItemDiscount;
    });

    // Defensive check: Compare calculated sum of items against subtotal parameter
    if (Math.abs(itemsCalculatedSubtotal - subtotal) > 0.5) {
      console.warn("PricingService: Item subtotal mismatch detected.", {
        itemsCalculatedSubtotal,
        subtotal,
      });
    }

    let totalTax = 0;
    items.forEach((item) => {
      const price = Number(item.price || 0);
      const qty = Number(item.quantity || 1);
      const discPct = Number(item.discountPercent || item.discount_percent || 0);
      const originalSubtotal = price * qty;
      const itemSubtotalAfterItemDiscount = originalSubtotal * (1 - discPct / 100);

      // Distribute global discount proportionally across items based on subtotal
      const fraction = subtotal > 0 ? itemSubtotalAfterItemDiscount / subtotal : 0;
      const itemPromoDiscount = discount * fraction;
      const itemTaxableAmount = Math.max(0, itemSubtotalAfterItemDiscount - itemPromoDiscount);

      // Resolve GST Rate: item rate
      const rate = item.gstRate ?? item.gst_rate;
      if (rate === undefined || rate === null) {
        console.warn(`PricingService: Missing GST rate for item ${item.id || item.name}, using 0% to avoid arbitrary tax charges.`);
      }
      const itemTax = itemTaxableAmount * (Number(rate || 0) / 100);
      totalTax += itemTax;
    });

    tax = Number(totalTax.toFixed(2));
  } else {
    // Fallback: GST calculation requires line items.
    if (subtotal > 0) {
      console.warn("PricingService: Cannot calculate tax without line items. Using 0%.");
    }
    tax = 0;
  }

  const grandTotal = Number((subtotal - discount + shipping + tax).toFixed(2));

  return {
    subtotal,
    tax,
    shipping,
    discount,
    grandTotal,
  };
}

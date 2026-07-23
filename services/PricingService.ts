export interface OrderTotals {
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  grandTotal: number;
}

/**
 * Single source of truth for order calculations.
 * - Tax is calculated based on item-level GST rates
 * - Taxable amount = (subtotal - discount + shipping)
 * - grandTotal = subtotal + shipping + tax - discount
 */
export function calculateOrderTotals(
  subtotal: number,
  shipping: number,
  discount: number
): OrderTotals {
  let tax = 0;

  // Attempt to load cart and product database from localStorage for item-level GST
  let cart: any[] = [];
  let products: any[] = [];

  if (typeof window !== "undefined") {
    try {
      const storedCart = localStorage.getItem("certitude_cart");
      if (storedCart) {
        cart = JSON.parse(storedCart);
      }
      const storedProducts = localStorage.getItem("certitude_admin_products");
      if (storedProducts) {
        products = JSON.parse(storedProducts);
      }
    } catch (e) {
      console.error("[PricingService] Error reading cart/products from storage:", e);
    }
  }

  if (cart.length > 0 && subtotal > 0) {
    let totalTax = 0;
    cart.forEach((item) => {
      const originalSubtotal = (item.price || 0) * (item.quantity || 1);
      const itemLevelDiscount = originalSubtotal * ((item.discountPercent || item.discount_percent || 0) / 100);
      const itemSubtotalAfterItemDiscount = originalSubtotal - itemLevelDiscount;

      const fraction = itemSubtotalAfterItemDiscount / subtotal;
      
      // Distribute global discount proportionally
      const itemPromoDiscount = discount * fraction;
      const itemTaxableAmount = itemSubtotalAfterItemDiscount - itemPromoDiscount;

      // Resolve GST Rate: 
      // 1. Look up in active products catalog (which is updated via Admin CRUD)
      // 2. Look up on the cart item itself
      // 3. Fallback to default of 5%
      const matchedProduct = products.find((p) => p.id === item.id);
      const rate =
        matchedProduct?.gstRate ??
        matchedProduct?.gst_rate ??
        item.gstRate ??
        item.gst_rate ??
        5;

      const itemTax = itemTaxableAmount * (rate / 100);
      totalTax += itemTax;
    });
    tax = Number(totalTax.toFixed(2));
  } else {
    // Fallback if cart is empty or we are on the server side: 
    // Calculate using the default GST rate of 5% on the entire taxable value
    const taxableValue = subtotal - discount;
    tax = Number((taxableValue * 0.05).toFixed(2));
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

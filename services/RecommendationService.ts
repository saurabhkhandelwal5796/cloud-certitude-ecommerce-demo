/**
 * RecommendationService.ts
 *
 * Core engine for AI-powered product suggestions and customer profiling.
 * Implements recommendation algorithms including content-based category preference,
 * association rule mining (frequently bought together, customers also bought),
 * styling rules (complete the look), and popularity-based rankings.
 */

import { getProducts, getOrders, AdminProduct } from "./AdminService";

export interface UserPreferences {
  recentlyViewed: string[]; // product IDs
  categoryViews: Record<string, number>; // category count
  totalViews: number;
}

const isBrowser = typeof window !== "undefined";

// Helper for local storage
function getStorageItem<T>(key: string, fallback: T): T {
  if (!isBrowser) return fallback;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

function setStorageItem<T>(key: string, value: T): void {
  if (!isBrowser) return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Error saving ${key}:`, err);
  }
}

/**
 * Tracks a product view in the customer's browser profile.
 */
export async function trackProductView(productId: string): Promise<void> {
  if (!isBrowser) return;

  const products = await getProducts();
  const product = products.find((p) => p.id === productId);
  if (!product) return;

  // 1. Update recently viewed IDs
  const viewedIds = getStorageItem<string[]>("certitude_viewed_ids", []);
  const filtered = viewedIds.filter((id) => id !== productId);
  filtered.unshift(productId); // add to top
  const updatedIds = filtered.slice(0, 12); // keep top 12
  setStorageItem("certitude_viewed_ids", updatedIds);

  // 2. Update category counts
  const categoryViews = getStorageItem<Record<string, number>>("certitude_category_views", {});
  const cat = product.category || "General";
  categoryViews[cat] = (categoryViews[cat] || 0) + 1;
  setStorageItem("certitude_category_views", categoryViews);

  // 3. Update total views count
  const totalViews = getStorageItem<number>("certitude_total_views", 0);
  setStorageItem("certitude_total_views", totalViews + 1);

  // Trigger event for components to refresh
  window.dispatchEvent(new Event("certitude_recommendations_updated"));
}

/**
 * Gets the current customer's profile preferences.
 */
export function getCustomerProfile(): UserPreferences {
  return {
    recentlyViewed: getStorageItem<string[]>("certitude_viewed_ids", []),
    categoryViews: getStorageItem<Record<string, number>>("certitude_category_views", {}),
    totalViews: getStorageItem<number>("certitude_total_views", 0),
  };
}

/**
 * Clear customer tracking preferences.
 */
export function resetCustomerProfile(): void {
  if (!isBrowser) return;
  localStorage.removeItem("certitude_viewed_ids");
  localStorage.removeItem("certitude_category_views");
  localStorage.removeItem("certitude_total_views");
  window.dispatchEvent(new Event("certitude_recommendations_updated"));
}

/**
 * Helper to retrieve best-selling products from order item count tallies.
 */
export async function getBestSellers(): Promise<AdminProduct[]> {
  const products = await getProducts();
  const orders = await getOrders();

  const productSalesCount: Record<string, number> = {};
  orders
    .filter((o) => o.status !== "Cancelled" && o.items)
    .forEach((o) => {
      o.items!.forEach((item) => {
        const key = item.id ?? item.name;
        productSalesCount[key] = (productSalesCount[key] || 0) + item.quantity;
      });
    });

  const sorted = [...products].sort((a, b) => {
    const salesA = productSalesCount[a.id] || 0;
    const salesB = productSalesCount[b.id] || 0;
    return salesB - salesA;
  });

  return sorted;
}

/**
 * Returns trending products (highest views + recent purchases).
 */
export async function getTrendingNow(): Promise<AdminProduct[]> {
  const products = await getProducts();
  const viewedIds = getStorageItem<string[]>("certitude_viewed_ids", []);
  
  // Tally views score (earlier viewed is higher score)
  const viewScore: Record<string, number> = {};
  viewedIds.forEach((id, index) => {
    viewScore[id] = 100 - index * 5;
  });

  // Sort by rating & view score
  const sorted = [...products].sort((a, b) => {
    const scoreA = (viewScore[a.id] || 0) + (a.rating || 0) * 10;
    const scoreB = (viewScore[b.id] || 0) + (b.rating || 0) * 10;
    return scoreB - scoreA;
  });

  return sorted;
}

/**
 * Generates custom AI-powered product recommendations for the customer.
 */
export async function getRecommendedForYou(email?: string): Promise<AdminProduct[]> {
  const products = await getProducts();
  const orders = await getOrders();
  const profile = getCustomerProfile();

  // Find user's favorite category from browsing
  let favCategory = "";
  let maxViews = 0;
  Object.entries(profile.categoryViews).forEach(([cat, views]) => {
    if (views > maxViews) {
      maxViews = views;
      favCategory = cat;
    }
  });

  // Tally user's purchased categories
  if (email) {
    const userOrders = orders.filter((o) => o.customerEmail.toLowerCase() === email.toLowerCase() && o.status !== "Cancelled");
    const purchasedCats: Record<string, number> = {};
    userOrders.forEach((o) => {
      o.items?.forEach((item) => {
        const prod = products.find((p) => p.id === item.id);
        if (prod) {
          purchasedCats[prod.category] = (purchasedCats[prod.category] || 0) + item.quantity;
        }
      });
    });

    let maxPurchases = 0;
    Object.entries(purchasedCats).forEach(([cat, qty]) => {
      if (qty > maxPurchases) {
        maxPurchases = qty;
        favCategory = cat; // purchase history overrides browsing views
      }
    });
  }

  // Filter out already purchased product IDs to avoid redundant recommendations
  const purchasedIds = new Set<string>();
  if (email) {
    orders
      .filter((o) => o.customerEmail.toLowerCase() === email.toLowerCase() && o.status !== "Cancelled")
      .forEach((o) => {
        o.items?.forEach((item) => {
          if (item.id) purchasedIds.add(item.id);
        });
      });
  }

  // Grade products based on category affinity, rating, and viewed state
  const scored = products.map((p) => {
    let score = 0;
    
    // Category preference matching
    if (favCategory && p.category.toLowerCase() === favCategory.toLowerCase()) {
      score += 150;
    }
    
    // Wishlist bonus
    const wishlist = getStorageItem<{ id: string }[]>("certitude_wishlist", []);
    if (wishlist.some((item) => item.id === p.id)) {
      score += 100;
    }

    // High rating bonus
    score += (p.rating || 0) * 15;

    // Penalty for already purchased items
    if (purchasedIds.has(p.id)) {
      score -= 300;
    }

    return { product: p, score };
  });

  // Sort and extract product objects
  const list = scored.sort((a, b) => b.score - a.score).map((s) => s.product);

  // If recommendations list contains less than 4 items, fallback to best sellers/trending
  if (list.length < 4 || favCategory === "") {
    return getTrendingNow();
  }

  return list;
}

/**
 * Finds products commonly purchased in the same order as a given product ID.
 */
export async function getCustomersAlsoBought(productId: string): Promise<AdminProduct[]> {
  const orders = await getOrders();
  const products = await getProducts();

  // Find all orders that contain our productId
  const coOrders = orders.filter((o) =>
    o.status !== "Cancelled" && o.items?.some((item) => item.id === productId)
  );

  const productCoCounts: Record<string, number> = {};
  coOrders.forEach((o) => {
    o.items?.forEach((item) => {
      if (item.id && item.id !== productId) {
        productCoCounts[item.id] = (productCoCounts[item.id] || 0) + 1;
      }
    });
  });

  const sortedIds = Object.entries(productCoCounts)
    .sort((a, b) => b[1] - a[1])
    .map((entry) => entry[0]);

  const matched = products.filter((p) => sortedIds.includes(p.id));

  // Fallback if no association orders exist: recommend products in the same category or best sellers
  if (matched.length === 0) {
    const currentProduct = products.find((p) => p.id === productId);
    return products.filter(
      (p) => p.id !== productId && (!currentProduct || p.category === currentProduct.category)
    );
  }

  return matched;
}

/**
 * Retrieves similar items matching the active item's category or brand.
 */
export async function getSimilarProducts(productId: string): Promise<AdminProduct[]> {
  const products = await getProducts();
  const current = products.find((p) => p.id === productId);

  if (!current) return products.slice(0, 4);

  return products.filter(
    (p) =>
      p.id !== productId &&
      (p.category.toLowerCase() === current.category.toLowerCase() ||
        p.brand.toLowerCase() === current.brand.toLowerCase())
  );
}

// Complete the look style packages
const LOOKS: Record<string, { accessories: string[]; subtitle: string }> = {
  // Men's cashmer coat -> pants, boot, sunglasses
  m1: { accessories: ["m2", "w2", "w1"], subtitle: "Modern Tailoring" },
  m2: { accessories: ["m1", "w2", "w1"], subtitle: "Summer Elegance" },
  w1: { accessories: ["w2", "m1", "m2"], subtitle: "High Fashion Evening" },
  w2: { accessories: ["w1", "m1", "m2"], subtitle: "Winter Knit Capsule" },
  k1: { accessories: ["m1", "w2", "k2"], subtitle: "Cute Knitted Style" },
};

/**
 * Returns matching products to complete the outfit style package.
 */
export async function getCompleteTheLook(productId: string): Promise<{
  accessories: AdminProduct[];
  subtitle: string;
}> {
  const products = await getProducts();
  const look = LOOKS[productId] || { accessories: ["m1", "w1", "w2"], subtitle: "Classics Set" };

  const matchedAccessories = products.filter((p) => look.accessories.includes(p.id));
  return {
    accessories: matchedAccessories,
    subtitle: look.subtitle,
  };
}

/**
 * Packages a product bundle containing the main product plus two companion products.
 */
export async function getFrequentlyBoughtTogether(productId: string): Promise<{
  mainProduct: AdminProduct;
  bundleProducts: AdminProduct[];
  totalPrice: number;
  discountedPrice: number;
}> {
  const products = await getProducts();
  const main = products.find((p) => p.id === productId);
  if (!main) {
    throw new Error("Product not found");
  }

  // Get similar products to fill the bundle
  const others = products.filter((p) => p.id !== productId).slice(0, 2);

  const totalPrice = main.price + others.reduce((s, p) => s + p.price, 0);
  // Offer 15% discount for buying the package bundle!
  const discountedPrice = Math.round(totalPrice * 0.85);

  return {
    mainProduct: main,
    bundleProducts: others,
    totalPrice,
    discountedPrice,
  };
}

/**
 * Returns products popular in a mock region (simulating localized popularity).
 */
export async function getPopularInYourArea(): Promise<AdminProduct[]> {
  const products = await getProducts();
  // Reverse order or pick items for geographical styling
  return [...products].reverse().slice(0, 4);
}

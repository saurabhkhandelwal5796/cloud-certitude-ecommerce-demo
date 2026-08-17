// @ts-nocheck
/**
 * RecommendationService.ts
 *
 * Core engine for AI-powered product suggestions and customer profiling.
 * Implements recommendation algorithms including content-based category preference,
 * association rule mining (frequently bought together, customers also bought),
 * styling rules (complete the look), and popularity-based rankings.
 */

import { getOrders, AdminProduct } from "./AdminService";
import { isFullSnapshot } from "./SnapshotService";

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

function mapRawProducts(data: any[]): AdminProduct[] {
  return data.map((p: any) => {
    // Find primary variant if included in the payload
    let primaryVariant = null;
    if (Array.isArray(p.product_variants) && p.product_variants.length > 0) {
      primaryVariant = p.product_variants.find((v: any) => v.is_primary && v.is_active) || 
                       p.product_variants.find((v: any) => v.is_active) || 
                       p.product_variants[0];
    }

    const variantId = primaryVariant ? primaryVariant.id : (p.variant_id !== undefined ? String(p.variant_id) : (p.variantId !== undefined ? String(p.variantId) : undefined));
    const price = primaryVariant ? Number(primaryVariant.price) : Number(p.price);
    
    let discountPercent = 0;
    if (primaryVariant) {
      if (primaryVariant.price > 0 && primaryVariant.discounted_price !== null && primaryVariant.discounted_price < primaryVariant.price) {
        discountPercent = Math.round(((primaryVariant.price - primaryVariant.discounted_price) / primaryVariant.price) * 100);
      } else {
        discountPercent = primaryVariant.discount_percent ? Number(primaryVariant.discount_percent) : 0;
      }
    } else {
      discountPercent = p.discount_percent !== undefined ? Number(p.discount_percent) : (p.discountPercent !== undefined ? Number(p.discountPercent) : 0);
    }

    const imageSrc = primaryVariant && Array.isArray(primaryVariant.images) && primaryVariant.images.length > 0 
      ? primaryVariant.images[0] 
      : "";

    return {
      id: String(p.id),
      variantId,
      name: String(p.name),
      description: String(p.description || ""),
      category: String(p.category),
      brand: String(p.brand || "Atelier"),
      price,
      discountPercent,
      stockQuantity: p.stock !== undefined ? Number(p.stock) : (p.stockQuantity !== undefined ? Number(p.stockQuantity) : 0),
      imageSrc,
      images: primaryVariant && Array.isArray(primaryVariant.images) ? (primaryVariant.images as string[]) : [],
      size: Array.isArray(p.size) ? (p.size as string[]) : ["S", "M", "L", "XL"],
      color: Array.isArray(p.color) ? (p.color as string[]) : ["Beige", "Black", "Charcoal"],
      rating: p.rating !== undefined ? Number(p.rating) : 4.5,
      reviewCount: p.review_count !== undefined ? Number(p.review_count) : (p.reviewCount !== undefined ? Number(p.reviewCount) : 0),
      sku: String(p.sku || ""),
      tags: Array.isArray(p.tags) ? (p.tags as string[]) : [],
      hsnCode: p.hsn_code !== undefined ? String(p.hsn_code || "") : "",
      navNodeId: p.nav_node_id ? String(p.nav_node_id) : (p.navNodeId ? String(p.navNodeId) : null),
      status: p.status as "draft" | "active" | "archived" || "draft"
    };
  });
}

export async function fetchProductsByIds(ids: string[]): Promise<AdminProduct[]> {
  if (!ids || ids.length === 0) return [];
  const { getSupabaseClient } = await import("@/lib/supabase/client");
  const supabase = getSupabaseClient() as any;
  const { data } = await supabase.from('products').select('*, product_variants(*)').in('id', ids).eq('status', 'active');
  if (!data) return [];
  return mapRawProducts(data);
}

export async function fetchProductsByQuery(queryModifier: (q: any) => any): Promise<AdminProduct[]> {
  const { getSupabaseClient } = await import("@/lib/supabase/client");
  const supabase = getSupabaseClient() as any;
  let q = supabase.from('products').select('*, product_variants(*)').eq('status', 'active');
  q = queryModifier(q);
  const { data } = await q;
  if (!data) return [];
  return mapRawProducts(data);
}

/**
 * Tracks a product view in the customer's browser profile.
 */
export async function trackProductView(productId: string): Promise<void> {
  if (!isBrowser) return;

  const products = await fetchProductsByIds([productId]);
  const product = products[0];
  if (!product) return;

  let profile = getCustomerProfile();
  
  if (!profile.recentlyViewed.includes(productId)) {
    profile.recentlyViewed.unshift(productId);
    if (profile.recentlyViewed.length > 15) {
      profile.recentlyViewed.pop();
    }
  } else {
    profile.recentlyViewed = profile.recentlyViewed.filter((id) => id !== productId);
    profile.recentlyViewed.unshift(productId);
  }

  const cat = product.category || "Unknown";
  profile.categoryViews[cat] = (profile.categoryViews[cat] || 0) + 1;
  profile.totalViews += 1;

  setStorageItem("certitude_customer_profile", profile);
  
  const viewedIds = getStorageItem<string[]>("certitude_viewed_ids", []);
  if (!viewedIds.includes(productId)) {
    viewedIds.unshift(productId);
    setStorageItem("certitude_viewed_ids", viewedIds.slice(0, 50));
  }

  window.dispatchEvent(new Event("certitude_recommendations_updated"));
}

export function getCustomerProfile(): UserPreferences {
  const defaultProfile: UserPreferences = {
    recentlyViewed: [],
    categoryViews: {},
    totalViews: 0,
  };
  return getStorageItem<UserPreferences>("certitude_customer_profile", defaultProfile);
}

export function clearCustomerProfile(): void {
  localStorage.removeItem("certitude_customer_profile");
  localStorage.removeItem("certitude_viewed_ids");
  localStorage.removeItem("certitude_category_views");
  localStorage.removeItem("certitude_total_views");
  window.dispatchEvent(new Event("certitude_recommendations_updated"));
}

export async function getBestSellers(): Promise<AdminProduct[]> {
  const orders = await getOrders();

  const productSalesCount: Record<string, number> = {};
  orders
    .filter((o) => o.status !== "Cancelled" && o.items)
    .forEach((o) => {
      o.items!.forEach((item) => {
        const key = isFullSnapshot(item) ? item.productId : (item.id ?? item.name);
        if (!key) return;
        const qty = isFullSnapshot(item) ? item.pricing.quantity : item.quantity;
        productSalesCount[key] = (productSalesCount[key] || 0) + qty;
      });
    });

  const topIds = Object.entries(productSalesCount)
    .sort((a, b) => b[1] - a[1])
    .map(e => e[0])
    .slice(0, 20);

  const products = await fetchProductsByIds(topIds);
  return topIds.map(id => products.find(p => p.id === id)).filter(Boolean) as AdminProduct[];
}

export async function getTrendingNow(): Promise<AdminProduct[]> {
  const viewedIds = getStorageItem<string[]>("certitude_viewed_ids", []);
  
  const viewScore: Record<string, number> = {};
  viewedIds.forEach((id, index) => {
    viewScore[id] = 100 - index * 5;
  });

  const products = await fetchProductsByQuery(q => q.order('rating', { ascending: false }).limit(20));

  const sorted = [...products].sort((a, b) => {
    const scoreA = (viewScore[a.id] || 0) + (a.rating) * 10;
    const scoreB = (viewScore[b.id] || 0) + (b.rating) * 10;
    return scoreB - scoreA;
  });

  return sorted.slice(0, 8);
}

export async function getRecommendedForYou(email?: string): Promise<AdminProduct[]> {
  const orders = await getOrders();
  const profile = getCustomerProfile();

  let favCategory = "";
  let maxViews = 0;
  Object.entries(profile.categoryViews).forEach(([cat, views]) => {
    if (views > maxViews) {
      maxViews = views;
      favCategory = cat;
    }
  });

  if (email) {
    const userOrders = orders.filter((o) => o.customerEmail.toLowerCase() === email.toLowerCase() && o.status !== "Cancelled");
    const purchasedCats: Record<string, number> = {};
    const prodIds = new Set<string>();
    userOrders.forEach((o) => o.items?.forEach((item) => {
      const prodId = isFullSnapshot(item) ? item.productId : item.id;
      if (prodId) prodIds.add(prodId);
    }));
    
    if (prodIds.size > 0) {
       const prods = await fetchProductsByIds(Array.from(prodIds));
       prods.forEach(prod => {
         userOrders.forEach((o) => o.items?.forEach((item) => {
            const prodId = isFullSnapshot(item) ? item.productId : item.id;
            if (prodId === prod.id) {
               const qty = isFullSnapshot(item) ? item.pricing.quantity : item.quantity;
               purchasedCats[prod.category] = (purchasedCats[prod.category] || 0) + qty;
            }
         }));
       });
    }

    let maxPurchases = 0;
    Object.entries(purchasedCats).forEach(([cat, qty]) => {
      if (qty > maxPurchases) {
        maxPurchases = qty;
        favCategory = cat; 
      }
    });
  }

  const purchasedIds = new Set<string>();
  if (email) {
    orders
      .filter((o) => o.customerEmail.toLowerCase() === email.toLowerCase() && o.status !== "Cancelled")
      .forEach((o) => {
        o.items?.forEach((item) => {
          const prodId = isFullSnapshot(item) ? item.productId : item.id;
          if (prodId) purchasedIds.add(prodId);
        });
      });
  }

  let products: AdminProduct[] = [];
  if (favCategory) {
    products = await fetchProductsByQuery(q => q.eq('category', favCategory).limit(30));
  } else {
    products = await fetchProductsByQuery(q => q.order('rating', { ascending: false }).limit(20));
  }

  const scored = products.map((p) => {
    let score = 0;
    if (favCategory && p.category.toLowerCase() === favCategory.toLowerCase()) {
      score += 150;
    }
    const wishlist = getStorageItem<{ id: string }[]>("certitude_wishlist", []);
    if (wishlist.some((item) => item.id === p.id)) {
      score += 100;
    }
    score += (p.rating) * 15;
    if (purchasedIds.has(p.id)) {
      score -= 300;
    }
    return { product: p, score };
  });

  const list = scored.sort((a, b) => b.score - a.score).map((s) => s.product);

  if (list.length < 4 || favCategory === "") {
    return getTrendingNow();
  }

  return list.slice(0, 8);
}

async function fetchSimilarProducts(current: AdminProduct, limit: number): Promise<AdminProduct[]> {
  const { getSupabaseClient } = await import("@/lib/supabase/client");
  const supabase = getSupabaseClient() as any;
  const productId = current.id;
  
  let results: AdminProduct[] = [];
  
  // 1. Try to find products with the exact same navigation node (leaf level, e.g. kids/footwear/sneakers)
  if (current.navNodeId) {
    const primaryMatches = await fetchProductsByQuery(q => 
      q.eq('nav_node_id', current.navNodeId)
       .neq('id', productId)
       .limit(limit)
    );
    results = primaryMatches;
  }
  
  // 2. If we need more, try to find products in sibling navigation nodes (e.g. other kids/footwear products like sandals)
  if (results.length < limit && current.navNodeId) {
    try {
      const { data: nodeData } = await supabase
        .from('navigation_nodes')
        .select('parent_id')
        .eq('id', current.navNodeId)
        .maybeSingle();
        
      if (nodeData && nodeData.parent_id) {
        const { data: siblingNodes } = await supabase
          .from('navigation_nodes')
          .select('id')
          .eq('parent_id', nodeData.parent_id);
          
        if (siblingNodes && siblingNodes.length > 0) {
          const siblingIds = siblingNodes.map((n: any) => n.id).filter((id: string) => id !== current.navNodeId);
          if (siblingIds.length > 0) {
            const extraLimit = limit - results.length;
            const siblingMatches = await fetchProductsByQuery(q => 
              q.in('nav_node_id', siblingIds)
               .neq('id', productId)
               .limit(extraLimit)
            );
            results = [...results, ...siblingMatches];
          }
        }
      }
    } catch (err) {
      console.error("[SimilarProducts] Sibling fetch failed:", err);
    }
  }
  
  // 3. Fallback to same high-level category (e.g. Men, Women, Kids, Footwear, Accessories)
  if (results.length < limit) {
    const extraLimit = limit - results.length;
    const fallbackMatches = await fetchProductsByQuery(q => 
      q.eq('category', current.category)
       .neq('id', productId)
       .limit(limit + 5)
    );
    const existingIds = new Set(results.map(r => r.id));
    for (const match of fallbackMatches) {
      if (results.length >= limit) break;
      if (!existingIds.has(match.id)) {
        results.push(match);
      }
    }
  }
  
  return results.slice(0, limit);
}

export async function getCustomersAlsoBought(productId: string): Promise<AdminProduct[]> {
  const orders = await getOrders();

  const coOrders = orders.filter((o) =>
    o.status !== "Cancelled" && o.items?.some((item) => {
      const prodId = isFullSnapshot(item) ? item.productId : item.id;
      return prodId === productId;
    })
  );

  const productCoCounts: Record<string, number> = {};
  coOrders.forEach((o) => {
    o.items?.forEach((item) => {
      const prodId = isFullSnapshot(item) ? item.productId : item.id;
      if (prodId && prodId !== productId) {
        productCoCounts[prodId] = (productCoCounts[prodId] || 0) + 1;
      }
    });
  });

  const sortedIds = Object.entries(productCoCounts)
    .sort((a, b) => b[1] - a[1])
    .map((entry) => entry[0])
    .slice(0, 10);

  if (sortedIds.length > 0) {
     return await fetchProductsByIds(sortedIds);
  }

  const prods = await fetchProductsByIds([productId]);
  const currentProduct = prods[0];
  if (currentProduct) {
     return await fetchSimilarProducts(currentProduct, 4);
  }
  return [];
}

export async function getSimilarProducts(productId: string): Promise<AdminProduct[]> {
  const prods = await fetchProductsByIds([productId]);
  const current = prods[0];

  if (!current) return await fetchProductsByQuery(q => q.limit(4));

  return await fetchSimilarProducts(current, 4);
}

export async function getCompleteTheLook(productId: string): Promise<{
  accessories: AdminProduct[];
  subtitle: string;
}> {
  const { getSupabaseClient } = await import("@/lib/supabase/client");
  const supabase = getSupabaseClient() as any;
  
  const { data: relations } = await supabase
    .from("product_relationships")
    .select("related_product_id")
    .eq("product_id", productId)
    .eq("relationship_type", "COMPLETE_THE_LOOK")
    .order("sort_order", { ascending: true })
    .limit(3);

  const relatedIds = relations ? relations.map((r: any) => r.related_product_id) : [];
  const matchedAccessories = await fetchProductsByIds(relatedIds);

  return {
    accessories: matchedAccessories,
    subtitle: "Complete The Look",
  };
}

export async function getFrequentlyBoughtTogether(productId: string): Promise<{
  mainProduct: AdminProduct;
  bundleProducts: AdminProduct[];
  totalPrice: number;
  discountedPrice: number;
} | null> {
  const prods = await fetchProductsByIds([productId]);
  const main = prods[0];
  if (!main) {
    return null;
  }

  const { getSupabaseClient } = await import("@/lib/supabase/client");
  const supabase = getSupabaseClient() as any;
  
  const { data: relations } = await supabase
    .from("product_relationships")
    .select("related_product_id")
    .eq("product_id", productId)
    .eq("relationship_type", "FREQUENTLY_BOUGHT")
    .order("sort_order", { ascending: true })
    .limit(2);

  const relatedIds = relations ? relations.map((r: any) => r.related_product_id) : [];
  const others = await fetchProductsByIds(relatedIds);

  const totalPrice = main.price + others.reduce((s, p) => s + p.price, 0);
  const discountedPrice = Math.round(totalPrice * 0.85);

  return {
    mainProduct: main,
    bundleProducts: others,
    totalPrice,
    discountedPrice,
  };
}

export async function getPopularInYourArea(): Promise<AdminProduct[]> {
  return await fetchProductsByQuery(q => q.order('created_at', { ascending: false }).limit(4));
}

export async function getNewArrivals(): Promise<AdminProduct[]> {
  return await fetchProductsByQuery(q => q.or('tags.cs.{"New Arrival"},id.ilike.new%,id.ilike.na%').limit(8));
}

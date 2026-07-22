/**
 * ReviewService.ts
 *
 * Handles client-side persistence and calculations for product reviews and ratings.
 * Features verified purchase checking, helpful voting, report flagging, and admin moderation.
 * Automatically synchronizes computed ratings/counts back to the product catalog store.
 */

import { getOrders, getProducts, saveProduct, AdminProduct } from "./AdminService";
import { getSupabaseClient } from "@/lib/supabase/client";

export interface ProductReview {
  id: string;
  productId: string;
  customerName: string;
  customerEmail: string;
  rating: number;
  title: string;
  reviewText: string;
  date: string;
  isVerifiedPurchase: boolean;
  helpfulCount: number;
  reported: boolean;
  helpfulUserEmails: string[];
}

const isBrowser = typeof window !== "undefined";

// Helper for local storage
function getStorageItem<T>(key: string, fallback: T): T {
  if (!isBrowser) return fallback;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (err) {
    console.error(`Error reading key ${key} from localStorage:`, err);
    return fallback;
  }
}

function setStorageItem<T>(key: string, value: T): void {
  if (!isBrowser) return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Error writing key ${key} to localStorage:`, err);
  }
}


/**
 * Retrieves all reviews.
 */
export async function getReviews(): Promise<ProductReview[]> {
  const supabase = getSupabaseClient() as any;
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error("[ReviewService] Error fetching reviews:", error);
    throw new Error("Unable to load data from server.");
  }

  return (data || []).map((r: any) => ({
    id: r.id,
    productId: r.product_id,
    customerName: r.customer_name,
    customerEmail: r.customer_email,
    rating: r.rating,
    title: r.title || "",
    reviewText: r.review_text,
    date: new Date(r.created_at).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    isVerifiedPurchase: r.is_verified_purchase,
    helpfulCount: r.helpful_count || 0,
    reported: r.reported || false,
    helpfulUserEmails: r.helpful_user_emails || [],
  }));
}

/**
 * Retrieves reviews for a specific product.
 */
export async function getReviewsByProductId(productId: string): Promise<ProductReview[]> {
  const supabase = getSupabaseClient() as any;
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('product_id', productId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error(`[ReviewService] Error fetching reviews for product ${productId}:`, error);
    throw new Error("Unable to load data from server.");
  }

  return (data || []).map((r: any) => ({
    id: r.id,
    productId: r.product_id,
    customerName: r.customer_name,
    customerEmail: r.customer_email,
    rating: r.rating,
    title: r.title || "",
    reviewText: r.review_text,
    date: new Date(r.created_at).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    isVerifiedPurchase: r.is_verified_purchase,
    helpfulCount: r.helpful_count || 0,
    reported: r.reported || false,
    helpfulUserEmails: r.helpful_user_emails || [],
  }));
}

/**
 * Checks if a customer has purchased a specific product.
 */
export async function checkHasPurchased(email: string, productId: string): Promise<boolean> {
  const orders = await getOrders();
  // Filter for completed/delivered/confirmed/processing orders from this user
  const userOrders = orders.filter(
    (o) =>
      o.customerEmail.toLowerCase() === email.toLowerCase() &&
      o.status !== "Cancelled"
  );
  
  // Look for the product in the order items
  return userOrders.some((o) =>
    o.items?.some((item) => item.id === productId)
  );
}

/**
 * Checks if a customer has already reviewed a product.
 */
export async function checkHasReviewed(email: string, productId: string): Promise<boolean> {
  const supabase = getSupabaseClient() as any;
  const { data, error } = await supabase
    .from('reviews')
    .select('id')
    .eq('product_id', productId)
    .eq('customer_email', email.toLowerCase());

  if (error) {
    console.error("[ReviewService] Error checking review status:", error);
    return false;
  }

  return (data || []).length > 0;
}

/**
 * Helper to update product ratings in catalog.
 */
async function syncProductRatings(productId: string): Promise<void> {
  const reviews = await getReviewsByProductId(productId);
  const totalCount = reviews.length;
  const avgRating = totalCount > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalCount
    : 0;

  const supabase = getSupabaseClient() as any;
  const { error } = await supabase
    .from('products')
    .update({
      rating: parseFloat(avgRating.toFixed(1)),
      review_count: totalCount,
      reviewCount: totalCount,
    })
    .eq('id', productId);

  if (error) {
    console.error(`[ReviewService] Failed to sync product ratings for ${productId}:`, error);
  }
}

/**
 * Submits a new review.
 */
export async function submitReview(params: {
  productId: string;
  customerName: string;
  customerEmail: string;
  rating: number;
  title: string;
  reviewText: string;
}): Promise<ProductReview> {
  const isVerified = await checkHasPurchased(params.customerEmail, params.productId);
  const hasReviewed = await checkHasReviewed(params.customerEmail, params.productId);

  if (hasReviewed) {
    throw new Error("You have already reviewed this product.");
  }

  const supabase = getSupabaseClient() as any;
  const { data, error } = await supabase
    .from('reviews')
    .insert({
      product_id: params.productId,
      customer_name: params.customerName,
      customer_email: params.customerEmail.toLowerCase(),
      rating: params.rating,
      title: params.title,
      review_text: params.reviewText,
      is_verified_purchase: isVerified,
      helpful_count: 0,
      reported: false,
      helpful_user_emails: [],
    })
    .select()
    .single();

  if (error) {
    console.error("[ReviewService] Error inserting review:", error);
    throw new Error("Unable to save review to server.");
  }

  const newReview: ProductReview = {
    id: data.id,
    productId: data.product_id,
    customerName: data.customer_name,
    customerEmail: data.customer_email,
    rating: data.rating,
    title: data.title || "",
    reviewText: data.review_text,
    date: new Date(data.created_at).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    isVerifiedPurchase: data.is_verified_purchase,
    helpfulCount: data.helpful_count || 0,
    reported: data.reported || false,
    helpfulUserEmails: data.helpful_user_emails || [],
  };

  // Recalculate and update catalog stats
  await syncProductRatings(params.productId);

  return newReview;
}

/**
 * Edits an existing review.
 */
export async function editReview(
  reviewId: string,
  params: { rating: number; title: string; reviewText: string }
): Promise<boolean> {
  const supabase = getSupabaseClient() as any;
  
  // Get product_id first to sync ratings
  const { data: reviewData } = await supabase
    .from('reviews')
    .select('product_id')
    .eq('id', reviewId)
    .single();

  const { error } = await supabase
    .from('reviews')
    .update({
      rating: params.rating,
      title: params.title,
      review_text: params.reviewText,
    })
    .eq('id', reviewId);

  if (error) {
    console.error(`[ReviewService] Error editing review ${reviewId}:`, error);
    return false;
  }

  if (reviewData) {
    await syncProductRatings(reviewData.product_id);
  }
  return true;
}

/**
 * Deletes a review.
 */
export async function deleteReview(reviewId: string): Promise<boolean> {
  const supabase = getSupabaseClient() as any;

  // Get product_id first to sync ratings
  const { data: reviewData } = await supabase
    .from('reviews')
    .select('product_id')
    .eq('id', reviewId)
    .single();

  const { error } = await supabase
    .from('reviews')
    .delete()
    .eq('id', reviewId);

  if (error) {
    console.error(`[ReviewService] Error deleting review ${reviewId}:`, error);
    return false;
  }

  if (reviewData) {
    await syncProductRatings(reviewData.product_id);
  }
  return true;
}

/**
 * Upvotes a review as helpful.
 */
export async function voteHelpful(reviewId: string, userEmail: string): Promise<boolean> {
  const supabase = getSupabaseClient() as any;

  const { data: reviewData, error: fetchError } = await supabase
    .from('reviews')
    .select('helpful_user_emails, helpful_count')
    .eq('id', reviewId)
    .single();

  if (fetchError || !reviewData) {
    console.error(`[ReviewService] Error fetching review for helpful vote ${reviewId}:`, fetchError);
    return false;
  }

  const emails = reviewData.helpful_user_emails || [];
  let newEmails = [...emails];
  let newCount = reviewData.helpful_count || 0;

  if (emails.includes(userEmail.toLowerCase())) {
    newEmails = newEmails.filter((e: string) => e !== userEmail.toLowerCase());
    newCount = Math.max(0, newCount - 1);
  } else {
    newEmails.push(userEmail.toLowerCase());
    newCount += 1;
  }

  const { error } = await supabase
    .from('reviews')
    .update({
      helpful_user_emails: newEmails,
      helpful_count: newCount,
    })
    .eq('id', reviewId);

  if (error) {
    console.error(`[ReviewService] Error updating helpful vote ${reviewId}:`, error);
    return false;
  }

  return true;
}

/**
 * Flags a review as reported.
 */
export async function reportReview(reviewId: string): Promise<boolean> {
  const supabase = getSupabaseClient() as any;
  const { error } = await supabase
    .from('reviews')
    .update({ reported: true })
    .eq('id', reviewId);

  if (error) {
    console.error(`[ReviewService] Error reporting review ${reviewId}:`, error);
    return false;
  }

  return true;
}

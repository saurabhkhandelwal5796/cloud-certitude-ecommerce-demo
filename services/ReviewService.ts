/**
 * ReviewService.ts
 *
 * Handles client-side persistence and calculations for product reviews and ratings.
 * Features verified purchase checking, helpful voting, report flagging, and admin moderation.
 * Automatically synchronizes computed ratings/counts back to the product catalog store.
 */

import { getOrders, getProducts, saveProduct, AdminProduct } from "./AdminService";

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

// Initial Mock Reviews Distribution
const INITIAL_REVIEWS: ProductReview[] = [
  // Product m1 reviews
  {
    id: "rev-m1-1",
    productId: "m1",
    customerName: "Eleanor Vance",
    customerEmail: "eleanor@sky.net",
    rating: 5,
    title: "Stunning Cashmere Quality!",
    reviewText: "Absolutely stunning quality. The cashmere feels exceptionally soft and heavy. The drape is elegant and tailored to perfection.",
    date: "Jul 12, 2026",
    isVerifiedPurchase: true,
    helpfulCount: 24,
    reported: false,
    helpfulUserEmails: [],
  },
  {
    id: "rev-m1-2",
    productId: "m1",
    customerName: "Julian Brooks",
    customerEmail: "julian@gmail.com",
    rating: 5,
    title: "Perfect Tailoring",
    reviewText: "Highly recommend this piece. Fits perfectly across the shoulders, and the fabric breathes well in warm environments.",
    date: "Jun 30, 2026",
    isVerifiedPurchase: true,
    helpfulCount: 15,
    reported: false,
    helpfulUserEmails: [],
  },
  {
    id: "rev-m1-3",
    productId: "m1",
    customerName: "Saskia Sterling",
    customerEmail: "saskia@yahoo.in",
    rating: 4,
    title: "Exquisite details",
    reviewText: "Exquisite details. The buttons feel solid and high-end. Deducted one star only because shipping took an extra day.",
    date: "Jun 14, 2026",
    isVerifiedPurchase: false,
    helpfulCount: 8,
    reported: false,
    helpfulUserEmails: [],
  },
  // Product w1 reviews
  {
    id: "rev-w1-1",
    productId: "w1",
    customerName: "Sarah Connor",
    customerEmail: "sarah@sky.net",
    rating: 5,
    title: "Worth every single rupee!",
    reviewText: "Exquisite floor-length evening gown crafted from heavy 100% mulberry silk satin with a delicate drape back. Fit is phenomenal.",
    date: "Jul 10, 2026",
    isVerifiedPurchase: true,
    helpfulCount: 42,
    reported: false,
    helpfulUserEmails: [],
  },
  {
    id: "rev-w1-2",
    productId: "w1",
    customerName: "Emma Watson",
    customerEmail: "emma@watson.co.uk",
    rating: 5,
    title: "Pure elegance and class",
    reviewText: "Simply breathtaking gown. The texture and sheen under ambient lighting are mesmerizing. Perfect for high-profile galas.",
    date: "Jun 24, 2026",
    isVerifiedPurchase: true,
    helpfulCount: 19,
    reported: false,
    helpfulUserEmails: [],
  },
  // Product w2 reviews
  {
    id: "rev-w2-1",
    productId: "w2",
    customerName: "Clarissa Finch",
    customerEmail: "clarissa@gmail.com",
    rating: 5,
    title: "Responsible luxury knitwear",
    reviewText: "The material texture is beautiful. You can tell this is crafted with care from sustainable organic extra-fine wool fabrics.",
    date: "May 10, 2026",
    isVerifiedPurchase: true,
    helpfulCount: 12,
    reported: false,
    helpfulUserEmails: [],
  },
  {
    id: "rev-w2-2",
    productId: "w2",
    customerName: "Dimitri Mercer",
    customerEmail: "dimitri@outlook.com",
    rating: 4,
    title: "Warm and cozy oversized look",
    reviewText: "An essential addition to my capsule wardrobe. Minimalist, premium, and holds its shape well after cleaning. Slightly larger than expected.",
    date: "May 28, 2026",
    isVerifiedPurchase: true,
    helpfulCount: 3,
    reported: false,
    helpfulUserEmails: [],
  }
];

if (isBrowser) {
  if (!localStorage.getItem("certitude_product_reviews")) {
    setStorageItem("certitude_product_reviews", INITIAL_REVIEWS);
  }
}

/**
 * Retrieves all reviews.
 */
export async function getReviews(): Promise<ProductReview[]> {
  return getStorageItem<ProductReview[]>("certitude_product_reviews", INITIAL_REVIEWS);
}

/**
 * Retrieves reviews for a specific product.
 */
export async function getReviewsByProductId(productId: string): Promise<ProductReview[]> {
  const reviews = await getReviews();
  return reviews.filter((r) => r.productId === productId);
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
  const reviews = await getReviewsByProductId(productId);
  return reviews.some((r) => r.customerEmail.toLowerCase() === email.toLowerCase());
}

/**
 * Helper to update product ratings in catalog.
 */
async function syncProductRatings(productId: string): Promise<void> {
  const reviews = await getReviewsByProductId(productId);
  const products = await getProducts();
  const prodIndex = products.findIndex((p) => p.id === productId);

  if (prodIndex >= 0) {
    const totalCount = reviews.length;
    const avgRating = totalCount > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalCount
      : 0;

    const updatedProduct: AdminProduct = {
      ...products[prodIndex],
      rating: parseFloat(avgRating.toFixed(1)),
      reviewCount: totalCount,
    };

    await saveProduct(updatedProduct);
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
  const reviews = await getReviews();

  const isVerified = await checkHasPurchased(params.customerEmail, params.productId);
  const hasReviewed = await checkHasReviewed(params.customerEmail, params.productId);

  if (hasReviewed) {
    throw new Error("You have already reviewed this product.");
  }

  const newReview: ProductReview = {
    id: `rev-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    productId: params.productId,
    customerName: params.customerName,
    customerEmail: params.customerEmail,
    rating: params.rating,
    title: params.title,
    reviewText: params.reviewText,
    date: new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    isVerifiedPurchase: isVerified,
    helpfulCount: 0,
    reported: false,
    helpfulUserEmails: [],
  };

  reviews.unshift(newReview);
  setStorageItem("certitude_product_reviews", reviews);

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
  const reviews = await getReviews();
  const index = reviews.findIndex((r) => r.id === reviewId);

  if (index >= 0) {
    reviews[index].rating = params.rating;
    reviews[index].title = params.title;
    reviews[index].reviewText = params.reviewText;
    
    setStorageItem("certitude_product_reviews", reviews);
    await syncProductRatings(reviews[index].productId);
    return true;
  }
  return false;
}

/**
 * Deletes a review.
 */
export async function deleteReview(reviewId: string): Promise<boolean> {
  const reviews = await getReviews();
  const index = reviews.findIndex((r) => r.id === reviewId);

  if (index >= 0) {
    const productId = reviews[index].productId;
    const filtered = reviews.filter((r) => r.id !== reviewId);
    setStorageItem("certitude_product_reviews", filtered);
    await syncProductRatings(productId);
    return true;
  }
  return false;
}

/**
 * Upvotes a review as helpful.
 */
export async function voteHelpful(reviewId: string, userEmail: string): Promise<boolean> {
  const reviews = await getReviews();
  const index = reviews.findIndex((r) => r.id === reviewId);

  if (index >= 0) {
    const r = reviews[index];
    if (r.helpfulUserEmails.includes(userEmail.toLowerCase())) {
      // User already upvoted, remove it
      r.helpfulUserEmails = r.helpfulUserEmails.filter((e) => e !== userEmail.toLowerCase());
      r.helpfulCount = Math.max(0, r.helpfulCount - 1);
    } else {
      // User upvoted, add it
      r.helpfulUserEmails.push(userEmail.toLowerCase());
      r.helpfulCount += 1;
    }
    setStorageItem("certitude_product_reviews", reviews);
    return true;
  }
  return false;
}

/**
 * Flags a review as reported.
 */
export async function reportReview(reviewId: string): Promise<boolean> {
  const reviews = await getReviews();
  const index = reviews.findIndex((r) => r.id === reviewId);

  if (index >= 0) {
    reviews[index].reported = true;
    setStorageItem("certitude_product_reviews", reviews);
    return true;
  }
  return false;
}

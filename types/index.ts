/**
 * Global Type Definitions
 *
 * This file is the central export for all shared TypeScript types and interfaces.
 * Add product, user, order, and other domain types here as the project grows.
 *
 * Future phases will add:
 *   - Product types (Product, ProductVariant, ProductCategory)
 *   - User / Auth types (User, Session, UserProfile)
 *   - Cart types (Cart, CartItem)
 *   - Order types (Order, OrderItem, OrderStatus)
 *   - API response wrappers (ApiResponse<T>, PaginatedResponse<T>)
 */

// ---------------------------------------------------------------------------
// Common Utilities
// ---------------------------------------------------------------------------

/** Make selected keys of T required */
export type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] };

/** Make all keys of T optional (deep) */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// ---------------------------------------------------------------------------
// Placeholder domain types — to be expanded in future phases
// ---------------------------------------------------------------------------

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  id: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
  createdAt: string;
}

export interface CartItem {
  productId: string;
  quantity: number;
  price: number;
}

export type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  status: OrderStatus;
  total: number;
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// API helpers
// ---------------------------------------------------------------------------

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  success: boolean;
}

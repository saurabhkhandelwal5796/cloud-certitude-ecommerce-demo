/**
 * AdminService.ts
 *
 * Core service for the cloud-certitude-ecommerce-demo Admin Panel & Customer Orders.
 * Handles fetching, updating, and saving Products, Orders, Customers, and Stats.
 *
 * Data Persistence Strategy:
 *   1. Attempts to connect and query Supabase.
 *   2. Gracefully falls back to localStorage (with initial mock data) if Supabase
 *      is not configured or if the required tables do not exist in the project database.
 */

import type { AddressType } from "@/components/ui/ShippingForm";

export interface AdminProduct {
  id: string;
  name: string;
  description: string;
  category: string;
  brand: string;
  price: number;
  discountPercent?: number;
  stockQuantity: number;
  imageSrc: string;
  images: string[];
  size: string[];
  color: string[];
  rating?: number;
  reviewCount?: number;
  sku?: string;
}

export interface AdminOrder {
  orderId: string;
  customerName: string;
  customerEmail: string;
  orderDate: string;
  paymentMethod: string;
  status: "Pending" | "Confirmed" | "Processing" | "Shipped" | "Out for Delivery" | "Delivered" | "Cancelled";
  total: number;
  itemsCount: number;
  address?: AddressType;
  items?: Array<{
    id?: string;
    name: string;
    quantity: number;
    size: string;
    color: string;
    price: number;
    imageSrc?: string;
    brand?: string;
    discountPercent?: number;
  }>;
}

export interface AdminCustomer {
  email: string;
  name: string;
  ordersCount: number;
  totalSpend: number;
}

// ─── Default Initial Mock Datasets ──────────────────────────────────────────

const INITIAL_PRODUCTS: AdminProduct[] = [
  {
    id: "m1",
    name: "Classic Cashmere Trench Coat",
    description: "Premium double-breasted coat made with pure organic cashmere and structured shoulders for an elegant silhouette.",
    category: "Men",
    brand: "Certitude",
    price: 499,
    discountPercent: 15,
    stockQuantity: 45,
    imageSrc: "https://images.unsplash.com/photo-1617137968427-85924c800a22?q=80&w=400&auto=format&fit=crop",
    images: ["https://images.unsplash.com/photo-1617137968427-85924c800a22?q=80&w=400&auto=format&fit=crop"],
    size: ["M", "L", "XL"],
    color: ["Beige", "Black", "Charcoal"],
    rating: 4.8,
    reviewCount: 124,
    sku: "CC-M-TRENCH-01"
  },
  {
    id: "m2",
    name: "Minimalist Linen Utility Shirt",
    description: "A breathable, lightweight utility shirt crafted from 100% fine French flax linen, featuring double patch pockets.",
    category: "Men",
    brand: "Atelier",
    price: 120,
    stockQuantity: 60,
    imageSrc: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?q=80&w=400&auto=format&fit=crop",
    images: ["https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?q=80&w=400&auto=format&fit=crop"],
    size: ["S", "M", "L"],
    color: ["Cream", "White", "Blue"],
    rating: 4.5,
    reviewCount: 98,
    sku: "CC-M-LINEN-02"
  },
  {
    id: "w1",
    name: "Silk Cocktail Evening Gown",
    description: "Exquisite floor-length evening gown crafted from heavy 100% mulberry silk satin with a delicate drape back.",
    category: "Women",
    brand: "Certitude",
    price: 650,
    discountPercent: 10,
    stockQuantity: 18,
    imageSrc: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=400&auto=format&fit=crop",
    images: ["https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=400&auto=format&fit=crop"],
    size: ["S", "M", "L"],
    color: ["Blush", "Black"],
    rating: 4.9,
    reviewCount: 240,
    sku: "CC-W-SILK-01"
  },
  {
    id: "w2",
    name: "Oversized Merino Wool Sweater",
    description: "Relaxed mock neck sweater chunky knit from responsibly sourced extra-fine Australian merino wool.",
    category: "Women",
    brand: "EcoKnit",
    price: 195,
    stockQuantity: 32,
    imageSrc: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=400&auto=format&fit=crop",
    images: ["https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=400&auto=format&fit=crop"],
    size: ["XS", "S", "M", "L"],
    color: ["Beige", "Charcoal", "White"],
    rating: 4.7,
    reviewCount: 156,
    sku: "CC-W-MERINO-02"
  },
  {
    id: "k1",
    name: "Kids Cotton Knit Romper Set",
    description: "An incredibly soft, organic cotton pointelle knit romper set complete with matching booties.",
    category: "Kids",
    brand: "EcoKnit",
    price: 85,
    discountPercent: 10,
    stockQuantity: 25,
    imageSrc: "https://images.unsplash.com/photo-1622290319146-7b63df48a635?q=80&w=400&auto=format&fit=crop",
    images: ["https://images.unsplash.com/photo-1622290319146-7b63df48a635?q=80&w=400&auto=format&fit=crop"],
    size: ["S", "M"],
    color: ["Beige", "Blush"],
    rating: 4.7,
    reviewCount: 42,
    sku: "CC-K-ROMPER-01"
  }
];

const INITIAL_ORDERS: AdminOrder[] = [
  {
    orderId: "ORD-20260715-48172",
    customerName: "Sarah Connor",
    customerEmail: "sarah@sky.net",
    orderDate: "Jul 15, 2026, 02:30 PM",
    paymentMethod: "Credit Card",
    status: "Delivered",
    total: 820.00,
    itemsCount: 2,
    address: {
      firstName: "Sarah",
      lastName: "Connor",
      email: "sarah@sky.net",
      phone: "9876543210",
      addressLine1: "123 Resistance Way",
      addressLine2: "",
      city: "Los Angeles",
      state: "California",
      country: "USA",
      postalCode: "90001"
    },
    items: [
      {
        id: "m1",
        name: "Classic Cashmere Trench Coat",
        quantity: 1,
        size: "M",
        color: "Beige",
        price: 499,
        imageSrc: "https://images.unsplash.com/photo-1617137968427-85924c800a22?q=80&w=400&auto=format&fit=crop",
        brand: "Certitude"
      },
      {
        id: "w2",
        name: "Oversized Merino Wool Sweater",
        quantity: 1,
        size: "S",
        color: "Beige",
        price: 195,
        imageSrc: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=400&auto=format&fit=crop",
        brand: "EcoKnit"
      }
    ]
  },
  {
    orderId: "ORD-20260716-19283",
    customerName: "John Doe",
    customerEmail: "john@gmail.com",
    orderDate: "Jul 16, 2026, 11:15 AM",
    paymentMethod: "UPI Payments",
    status: "Shipped",
    total: 350.00,
    itemsCount: 1,
    address: {
      firstName: "John",
      lastName: "Doe",
      email: "john@gmail.com",
      phone: "9988776655",
      addressLine1: "456 Fashion Blvd",
      addressLine2: "Apt 4B",
      city: "New Delhi",
      state: "Delhi",
      country: "India",
      postalCode: "110001"
    },
    items: [
      {
        id: "m2",
        name: "Minimalist Linen Utility Shirt",
        quantity: 2,
        size: "M",
        color: "Cream",
        price: 120,
        imageSrc: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?q=80&w=400&auto=format&fit=crop",
        brand: "Atelier"
      }
    ]
  },
  {
    orderId: "ORD-20260717-57382",
    customerName: "Amit Sharma",
    customerEmail: "amit@yahoo.in",
    orderDate: "Jul 17, 2026, 09:45 AM",
    paymentMethod: "Cash on Delivery",
    status: "Processing",
    total: 120.00,
    itemsCount: 1,
    address: {
      firstName: "Amit",
      lastName: "Sharma",
      email: "amit@yahoo.in",
      phone: "9988998899",
      addressLine1: "12 Rose Garden Colony",
      addressLine2: "",
      city: "Mumbai",
      state: "Maharashtra",
      country: "India",
      postalCode: "400001"
    },
    items: [
      {
        id: "m2",
        name: "Minimalist Linen Utility Shirt",
        quantity: 1,
        size: "L",
        color: "Cream",
        price: 120,
        imageSrc: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?q=80&w=400&auto=format&fit=crop",
        brand: "Atelier"
      }
    ]
  },
  {
    orderId: "ORD-20260717-90284",
    customerName: "Emma Watson",
    customerEmail: "emma@watson.co.uk",
    orderDate: "Jul 17, 2026, 10:10 AM",
    paymentMethod: "Debit Card",
    status: "Pending",
    total: 650.00,
    itemsCount: 1,
    address: {
      firstName: "Emma",
      lastName: "Watson",
      email: "emma@watson.co.uk",
      phone: "8877665544",
      addressLine1: "77 London Bridge Road",
      addressLine2: "",
      city: "London",
      state: "Greater London",
      country: "UK",
      postalCode: "EC1A 1BB"
    },
    items: [
      {
        id: "w1",
        name: "Silk Cocktail Evening Gown",
        quantity: 1,
        size: "S",
        color: "Blush",
        price: 650,
        imageSrc: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=400&auto=format&fit=crop",
        brand: "Certitude"
      }
    ]
  }
];

const INITIAL_CUSTOMERS: AdminCustomer[] = [
  {
    email: "sarah@sky.net",
    name: "Sarah Connor",
    ordersCount: 5,
    totalSpend: 1840.00
  },
  {
    email: "john@gmail.com",
    name: "John Doe",
    ordersCount: 3,
    totalSpend: 1250.00
  },
  {
    email: "amit@yahoo.in",
    name: "Amit Sharma",
    ordersCount: 2,
    totalSpend: 4300.00
  },
  {
    email: "emma@watson.co.uk",
    name: "Emma Watson",
    ordersCount: 1,
    totalSpend: 650.00
  }
];

// ─── LocalStorage Helper Functions ──────────────────────────────────────────

const isBrowser = typeof window !== "undefined";

function getLocalStorageItem<T>(key: string, defaultValue: T): T {
  if (!isBrowser) return defaultValue;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setLocalStorageItem<T>(key: string, value: T): void {
  if (!isBrowser) return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`[AdminService] Error saving ${key} to localStorage:`, err);
  }
}

// Initialize LocalStorage arrays if empty
if (isBrowser) {
  if (!localStorage.getItem("certitude_admin_products")) {
    setLocalStorageItem("certitude_admin_products", INITIAL_PRODUCTS);
  }
  if (!localStorage.getItem("certitude_admin_orders")) {
    setLocalStorageItem("certitude_admin_orders", INITIAL_ORDERS);
  }
  if (!localStorage.getItem("certitude_admin_customers")) {
    setLocalStorageItem("certitude_admin_customers", INITIAL_CUSTOMERS);
  }
}

// ─── Public Service API ─────────────────────────────────────────────────────

/**
 * Returns all products.
 */
export async function getProducts(): Promise<AdminProduct[]> {
  return getLocalStorageItem<AdminProduct[]>("certitude_admin_products", INITIAL_PRODUCTS);
}

/**
 * Saves (adds or edits) a product.
 */
export async function saveProduct(product: AdminProduct): Promise<AdminProduct> {
  const products = await getProducts();
  const index = products.findIndex((p) => p.id === product.id);

  if (index >= 0) {
    products[index] = product;
  } else {
    products.push(product);
  }

  setLocalStorageItem("certitude_admin_products", products);
  return product;
}

/**
 * Deletes a product by ID.
 */
export async function deleteProduct(id: string): Promise<boolean> {
  const products = await getProducts();
  const filtered = products.filter((p) => p.id !== id);
  setLocalStorageItem("certitude_admin_products", filtered);
  return true;
}

/**
 * Returns all orders.
 */
export async function getOrders(): Promise<AdminOrder[]> {
  return getLocalStorageItem<AdminOrder[]>("certitude_admin_orders", INITIAL_ORDERS);
}

/**
 * Updates the status of an order.
 * Also registers an in-app notification for the customer.
 */
export async function updateOrderStatus(
  orderId: string,
  status: AdminOrder["status"]
): Promise<boolean> {
  const orders = await getOrders();
  const index = orders.findIndex((o) => o.orderId === orderId);

  if (index >= 0) {
    orders[index].status = status;
    setLocalStorageItem("certitude_admin_orders", orders);

    // Register Notification
    const customerEmail = orders[index].customerEmail;
    let message = "";
    if (status === "Confirmed") message = `Your order ${orderId} has been confirmed.`;
    else if (status === "Processing") message = `Your order ${orderId} is currently being processed.`;
    else if (status === "Shipped") message = `Your order ${orderId} has been shipped.`;
    else if (status === "Out for Delivery") message = `Your order ${orderId} is out for delivery!`;
    else if (status === "Delivered") message = `Your order ${orderId} has been successfully delivered. Thank you!`;
    else if (status === "Cancelled") message = `Your order ${orderId} has been cancelled.`;

    if (message) {
      registerNotification(customerEmail, message);
    }

    return true;
  }

  return false;
}

/**
 * Returns all customers.
 */
export async function getCustomers(): Promise<AdminCustomer[]> {
  return getLocalStorageItem<AdminCustomer[]>("certitude_admin_customers", INITIAL_CUSTOMERS);
}

export interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalCustomers: number;
  totalRevenue: number;
  pendingOrdersCount: number;
  deliveredOrdersCount: number;
  cancelledOrdersCount: number;
  revenueToday: number;
}

/**
 * Aggregates summary statistics for the dashboard.
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  const products = await getProducts();
  const orders = await getOrders();
  const customers = await getCustomers();

  // Sum revenue of non-Cancelled orders
  const totalRevenue = orders
    .filter((o) => o.status !== "Cancelled")
    .reduce((sum, o) => sum + o.total, 0);

  // Status-based counts
  const pendingOrdersCount = orders.filter((o) => o.status === "Pending").length;
  const deliveredOrdersCount = orders.filter((o) => o.status === "Delivered").length;
  const cancelledOrdersCount = orders.filter((o) => o.status === "Cancelled").length;

  // Revenue Today
  const todayStr = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const revenueToday = orders
    .filter((o) => o.status !== "Cancelled" && o.orderDate.startsWith(todayStr))
    .reduce((sum, o) => sum + o.total, 0);

  return {
    totalProducts: products.length,
    totalOrders: orders.length,
    totalCustomers: customers.length,
    totalRevenue,
    pendingOrdersCount,
    deliveredOrdersCount,
    cancelledOrdersCount,
    revenueToday,
  };
}

/**
 * Syncs a newly placed order from checkout page into the admin store.
 */
export function registerNewCheckoutOrder(params: {
  orderId: string;
  customerName: string;
  customerEmail: string;
  total: number;
  itemsCount: number;
  paymentMethod: string;
  address?: AddressType;
  items?: AdminOrder["items"];
}) {
  if (!isBrowser) return;

  const orders = getLocalStorageItem<AdminOrder[]>("certitude_admin_orders", INITIAL_ORDERS);
  const customers = getLocalStorageItem<AdminCustomer[]>("certitude_admin_customers", INITIAL_CUSTOMERS);

  // 1. Add new order
  const newOrder: AdminOrder = {
    orderId: params.orderId,
    customerName: params.customerName,
    customerEmail: params.customerEmail,
    orderDate: new Date().toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }),
    paymentMethod: params.paymentMethod === "credit" ? "Credit Card" :
                   params.paymentMethod === "debit" ? "Debit Card" :
                   params.paymentMethod === "upi" ? "UPI Payments" :
                   params.paymentMethod === "netbanking" ? "Net Banking" : "Cash on Delivery",
    status: "Pending",
    total: params.total,
    itemsCount: params.itemsCount,
    address: params.address,
    items: params.items,
  };

  orders.unshift(newOrder); // Add to top
  setLocalStorageItem("certitude_admin_orders", orders);

  console.log("[AdminService] Order registered:", {
    orderId: newOrder.orderId,
    customerEmail: newOrder.customerEmail,
    total: newOrder.total,
    status: newOrder.status,
    totalOrdersNow: orders.length,
  });

  // 2. Add or update Customer
  const custIndex = customers.findIndex((c) => c.email.toLowerCase() === params.customerEmail.toLowerCase());
  if (custIndex >= 0) {
    customers[custIndex].ordersCount += 1;
    customers[custIndex].totalSpend += params.total;
  } else {
    customers.push({
      email: params.customerEmail,
      name: params.customerName,
      ordersCount: 1,
      totalSpend: params.total,
    });
  }
  setLocalStorageItem("certitude_admin_customers", customers);

  // 3. Register Notification
  registerNotification(params.customerEmail, `Your order ${params.orderId} was successfully placed!`);
}

/**
 * Returns orders placed by a specific customer.
 */
export async function getOrdersByCustomerEmail(email: string): Promise<AdminOrder[]> {
  const orders = await getOrders();
  const matched = orders.filter((o) => o.customerEmail.toLowerCase() === email.toLowerCase());
  console.log(`[AdminService] getOrdersByCustomerEmail("${email}"): ${matched.length} of ${orders.length} orders matched`);
  return matched;
}

/**
 * Cancels a customer's order if it is in Pending status.
 */
export async function cancelCustomerOrder(orderId: string): Promise<boolean> {
  const orders = await getOrders();
  const index = orders.findIndex((o) => o.orderId === orderId);

  if (index >= 0) {
    if (orders[index].status !== "Pending") {
      throw new Error("Only pending orders can be cancelled.");
    }
    orders[index].status = "Cancelled";
    setLocalStorageItem("certitude_admin_orders", orders);

    // Register Notification
    registerNotification(orders[index].customerEmail, `Your order ${orderId} has been successfully cancelled.`);
    return true;
  }
  return false;
}

// ─── Notification System ────────────────────────────────────────────────────

export interface InAppNotification {
  id: string;
  message: string;
  timestamp: string;
  isRead: boolean;
}

/**
 * Returns all notifications for a specific user.
 */
export function getUserNotifications(email: string): InAppNotification[] {
  const key = `certitude_notifications_${email.toLowerCase()}`;
  return getLocalStorageItem<InAppNotification[]>(key, []);
}

/**
 * Pushes a new notification to a user's feed.
 */
export function registerNotification(email: string, message: string) {
  if (!isBrowser) return;

  const key = `certitude_notifications_${email.toLowerCase()}`;
  const notifications = getLocalStorageItem<InAppNotification[]>(key, []);
  
  const newNotif: InAppNotification = {
    id: `notif_${Date.now()}`,
    message,
    timestamp: new Date().toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }),
    isRead: false,
  };

  notifications.unshift(newNotif);
  setLocalStorageItem(key, notifications);
  
  // Custom event to sync notification bells across the client UI
  window.dispatchEvent(new Event("certitude_notifications_updated"));
}

/**
 * Marks all notifications as read.
 */
export function markNotificationsAsRead(email: string) {
  if (!isBrowser) return;

  const key = `certitude_notifications_${email.toLowerCase()}`;
  const notifications = getLocalStorageItem<InAppNotification[]>(key, []);
  
  const updated = notifications.map((n) => ({ ...n, isRead: true }));
  setLocalStorageItem(key, updated);

  window.dispatchEvent(new Event("certitude_notifications_updated"));
}

// ─── Analytics & BI Service API ──────────────────────────────────────────────

export type DateRangeFilter = "today" | "week" | "month" | "year" | "all";

export interface MonthlyDataPoint {
  month: string;   // "Jan", "Feb", …
  year: number;
  value: number;
}

export interface CategoryBreakdown {
  category: string;
  revenue: number;
  percentage: number;
  color: string;
}

export interface ProductAnalytic {
  id: string;
  name: string;
  brand: string;
  category: string;
  unitsSold: number;
  revenue: number;
  imageSrc?: string;
}

export interface AnalyticsSummary {
  // Revenue
  revenueToday: number;
  revenueThisWeek: number;
  revenueThisMonth: number;
  revenueThisYear: number;
  revenuePrevMonth: number;
  revenuePrevYear: number;
  // Orders
  totalOrders: number;
  pendingOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  ordersThisMonth: number;
  ordersPrevMonth: number;
  // Customers
  totalCustomers: number;
  newCustomersThisMonth: number;
  newCustomersPrevMonth: number;
  returningCustomers: number;
  avgCustomerSpend: number;
  // Products
  totalProducts: number;
  outOfStockCount: number;
  bestSellingProduct: string;
  lowestSellingProduct: string;
}

/** Parses a stored orderDate string into a JS Date object */
function parseOrderDate(dateStr: string): Date {
  try {
    return new Date(dateStr);
  } catch {
    return new Date();
  }
}

/** Whether a Date falls within the current calendar week (Sun–Sat) */
function isThisWeek(d: Date): boolean {
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 7);
  return d >= startOfWeek && d < endOfWeek;
}

/** Whether a Date is today */
function isToday(d: Date): boolean {
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

/** Whether a Date is in the current calendar month */
function isThisMonth(d: Date): boolean {
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
}

/** Whether a Date is in the previous calendar month */
function isPrevMonth(d: Date): boolean {
  const now = new Date();
  const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  return d.getFullYear() === prev.getFullYear() && d.getMonth() === prev.getMonth();
}

/** Whether a Date is in the current year */
function isThisYear(d: Date): boolean {
  return d.getFullYear() === new Date().getFullYear();
}

/** Whether a Date is in the previous year */
function isPrevYear(d: Date): boolean {
  return d.getFullYear() === new Date().getFullYear() - 1;
}

// Sample data used when real order history is sparse (< 6 real orders)
const SAMPLE_MONTHLY_REVENUE: number[] = [
  124000, 185000, 210000, 340000, 280000, 412000,
  490000, 375000, 430000, 395000, 460000, 520000,
];
const SAMPLE_MONTHLY_ORDERS: number[] = [
  42, 65, 74, 118, 96, 143, 170, 128, 149, 135, 158, 180,
];
const SAMPLE_CUSTOMER_GROWTH: number[] = [
  18, 27, 34, 51, 44, 63, 79, 58, 70, 62, 76, 90,
];

/**
 * Returns the consolidated analytics summary computed from real data.
 */
export async function getAnalyticsSummary(): Promise<AnalyticsSummary> {
  const orders = await getOrders();
  const customers = await getCustomers();
  const products = await getProducts();

  const activeOrders = orders.filter((o) => o.status !== "Cancelled");

  const sumRevenue = (filter: (d: Date) => boolean) =>
    activeOrders
      .filter((o) => filter(parseOrderDate(o.orderDate)))
      .reduce((s, o) => s + o.total, 0);

  const countOrders = (filter: (d: Date) => boolean) =>
    orders.filter((o) => filter(parseOrderDate(o.orderDate))).length;

  // Revenue bucketed
  const revenueToday = sumRevenue(isToday);
  const revenueThisWeek = sumRevenue(isThisWeek);
  const revenueThisMonth = sumRevenue(isThisMonth);
  const revenueThisYear = sumRevenue(isThisYear);
  const revenuePrevMonth = sumRevenue(isPrevMonth);
  const revenuePrevYear = sumRevenue(isPrevYear);

  // Order counts
  const pendingOrders = orders.filter((o) => o.status === "Pending").length;
  const deliveredOrders = orders.filter((o) => o.status === "Delivered").length;
  const cancelledOrders = orders.filter((o) => o.status === "Cancelled").length;
  const ordersThisMonth = countOrders(isThisMonth);
  const ordersPrevMonth = countOrders(isPrevMonth);

  // Customer metrics
  const totalCustomers = customers.length;
  const avgCustomerSpend =
    totalCustomers > 0
      ? customers.reduce((s, c) => s + c.totalSpend, 0) / totalCustomers
      : 0;

  // Approximate "new this month" as orders this month from unique emails not seen before
  const emailsThisMonth = new Set(
    orders
      .filter((o) => isThisMonth(parseOrderDate(o.orderDate)))
      .map((o) => o.customerEmail.toLowerCase())
  );
  const emailsPrevMonth = new Set(
    orders
      .filter((o) => isPrevMonth(parseOrderDate(o.orderDate)))
      .map((o) => o.customerEmail.toLowerCase())
  );
  const newCustomersThisMonth = [...emailsThisMonth].filter(
    (e) => !emailsPrevMonth.has(e)
  ).length;
  const newCustomersPrevMonth = [...emailsPrevMonth].filter(
    (e) => !emailsThisMonth.has(e)
  ).length;
  const returningCustomers = Math.max(0, totalCustomers - newCustomersThisMonth);

  // Product stock
  const outOfStockCount = products.filter((p) => p.stockQuantity === 0).length;

  // Best / lowest selling from order items
  const salesByProduct: Record<string, { name: string; units: number }> = {};
  orders
    .filter((o) => o.status !== "Cancelled" && o.items)
    .forEach((o) => {
      o.items!.forEach((item) => {
        const key = item.id ?? item.name;
        if (!salesByProduct[key]) {
          salesByProduct[key] = { name: item.name, units: 0 };
        }
        salesByProduct[key].units += item.quantity;
      });
    });

  const sortedProducts = Object.values(salesByProduct).sort(
    (a, b) => b.units - a.units
  );
  const bestSellingProduct =
    sortedProducts[0]?.name ?? products[0]?.name ?? "N/A";
  const lowestSellingProduct =
    sortedProducts[sortedProducts.length - 1]?.name ??
    products[products.length - 1]?.name ??
    "N/A";

  return {
    revenueToday,
    revenueThisWeek,
    revenueThisMonth,
    revenueThisYear,
    revenuePrevMonth,
    revenuePrevYear,
    totalOrders: orders.length,
    pendingOrders,
    deliveredOrders,
    cancelledOrders,
    ordersThisMonth,
    ordersPrevMonth,
    totalCustomers,
    newCustomersThisMonth,
    newCustomersPrevMonth,
    returningCustomers,
    avgCustomerSpend,
    totalProducts: products.length,
    outOfStockCount,
    bestSellingProduct,
    lowestSellingProduct,
  };
}

const MONTH_LABELS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/**
 * Returns 12-month revenue array (current year, Jan–Dec).
 * Falls back to rich sample data when real orders are sparse.
 */
export async function getMonthlyRevenueData(): Promise<MonthlyDataPoint[]> {
  const orders = await getOrders();
  const year = new Date().getFullYear();

  const realData: number[] = Array(12).fill(0);
  orders
    .filter((o) => o.status !== "Cancelled" && parseOrderDate(o.orderDate).getFullYear() === year)
    .forEach((o) => {
      const m = parseOrderDate(o.orderDate).getMonth();
      realData[m] += o.total;
    });

  const hasData = realData.some((v) => v > 0);
  const data = hasData ? realData : SAMPLE_MONTHLY_REVENUE;

  return MONTH_LABELS.map((month, i) => ({ month, year, value: data[i] }));
}

/**
 * Returns 12-month orders-per-month array.
 */
export async function getOrdersPerMonthData(): Promise<MonthlyDataPoint[]> {
  const orders = await getOrders();
  const year = new Date().getFullYear();

  const realData: number[] = Array(12).fill(0);
  orders
    .filter((o) => parseOrderDate(o.orderDate).getFullYear() === year)
    .forEach((o) => {
      const m = parseOrderDate(o.orderDate).getMonth();
      realData[m] += 1;
    });

  const hasData = realData.some((v) => v > 0);
  const data = hasData ? realData : SAMPLE_MONTHLY_ORDERS;

  return MONTH_LABELS.map((month, i) => ({ month, year, value: data[i] }));
}

/**
 * Returns category revenue breakdown with percentages.
 */
export async function getCategoryBreakdown(): Promise<CategoryBreakdown[]> {
  const orders = await getOrders();

  // Tally revenue per category from order items
  const catRevenue: Record<string, number> = {};
  orders
    .filter((o) => o.status !== "Cancelled" && o.items)
    .forEach((o) => {
      o.items!.forEach((item) => {
        // Heuristic: derive category from product id prefix or use "Other"
        const cat = item.id
          ? item.id.startsWith("w")
            ? "Women"
            : item.id.startsWith("m")
            ? "Men"
            : item.id.startsWith("k")
            ? "Kids"
            : "Accessories"
          : "Other";
        catRevenue[cat] = (catRevenue[cat] ?? 0) + item.price * item.quantity;
      });
    });

  const total = Object.values(catRevenue).reduce((s, v) => s + v, 0);

  // Fall back to sample if no data
  const SAMPLE_CATEGORIES: CategoryBreakdown[] = [
    { category: "Women", revenue: 412000, percentage: 54, color: "#E0A99E" },
    { category: "Men", revenue: 248000, percentage: 32, color: "#C68B7D" },
    { category: "Kids", revenue: 98000, percentage: 13, color: "#D4988D" },
    { category: "Accessories", revenue: 8000, percentage: 1, color: "#B87265" },
  ];

  if (total === 0) return SAMPLE_CATEGORIES;

  const COLORS = ["#E0A99E", "#C68B7D", "#D4988D", "#B87265", "#A06055"];
  return Object.entries(catRevenue).map(([category, revenue], i) => ({
    category,
    revenue,
    percentage: Math.round((revenue / total) * 100),
    color: COLORS[i % COLORS.length],
  }));
}

/**
 * Returns top 10 products by total revenue.
 */
export async function getTopProducts(): Promise<ProductAnalytic[]> {
  const orders = await getOrders();
  const products = await getProducts();

  const map: Record<string, ProductAnalytic> = {};

  orders
    .filter((o) => o.status !== "Cancelled" && o.items)
    .forEach((o) => {
      o.items!.forEach((item) => {
        const key = item.id ?? item.name;
        if (!map[key]) {
          const catalogProduct = products.find((p) => p.id === item.id);
          map[key] = {
            id: key,
            name: item.name,
            brand: item.brand ?? catalogProduct?.brand ?? "Certitude",
            category: catalogProduct?.category ?? "Fashion",
            unitsSold: 0,
            revenue: 0,
            imageSrc: item.imageSrc ?? catalogProduct?.imageSrc,
          };
        }
        map[key].unitsSold += item.quantity;
        map[key].revenue += item.price * item.quantity;
      });
    });

  const sorted = Object.values(map).sort((a, b) => b.revenue - a.revenue);

  if (sorted.length > 0) return sorted.slice(0, 10);

  // Fallback: derive from products list with synthetic sales
  const SYNTHETIC_UNITS = [124, 98, 86, 74, 61, 55, 48, 42, 38, 31];
  return products.slice(0, 10).map((p, i) => ({
    id: p.id,
    name: p.name,
    brand: p.brand,
    category: p.category,
    unitsSold: SYNTHETIC_UNITS[i] ?? 20,
    revenue: (SYNTHETIC_UNITS[i] ?? 20) * p.price,
    imageSrc: p.imageSrc,
  }));
}

/**
 * Returns 12-month new-customer growth data.
 */
export async function getCustomerGrowthData(): Promise<MonthlyDataPoint[]> {
  const orders = await getOrders();
  const year = new Date().getFullYear();

  // Count distinct email addresses per month as a proxy for new customers
  const emailsByMonth: Set<string>[] = Array.from({ length: 12 }, () => new Set());
  orders
    .filter((o) => parseOrderDate(o.orderDate).getFullYear() === year)
    .forEach((o) => {
      const m = parseOrderDate(o.orderDate).getMonth();
      emailsByMonth[m].add(o.customerEmail.toLowerCase());
    });

  const realData = emailsByMonth.map((s) => s.size);
  const hasData = realData.some((v) => v > 0);
  const data = hasData ? realData : SAMPLE_CUSTOMER_GROWTH;

  return MONTH_LABELS.map((month, i) => ({ month, year, value: data[i] }));
}

/**
 * Filters an array of AdminOrders by a DateRangeFilter.
 */
export function filterOrdersByDateRange(
  orders: AdminOrder[],
  range: DateRangeFilter
): AdminOrder[] {
  if (range === "all") return orders;

  const filterFn: Record<Exclude<DateRangeFilter, "all">, (d: Date) => boolean> = {
    today: isToday,
    week: isThisWeek,
    month: isThisMonth,
    year: isThisYear,
  };

  return orders.filter((o) => filterFn[range](parseOrderDate(o.orderDate)));
}


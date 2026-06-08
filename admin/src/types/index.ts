export type UserRole = 'USER' | 'ADMIN' | 'SUPER_ADMIN';
export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED';
export type ReviewStatus = 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED';
export type ReturnStatus = 'REQUESTED' | 'APPROVED' | 'REJECTED' | 'RECEIVED' | 'REFUNDED';
export type CouponType = 'PERCENTAGE' | 'FIXED';

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  phone?: string;
  createdAt: string;
  _count?: { orders: number };
}

export interface ProductVariant {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  stringVariantId?: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  status: 'ACTIVE' | 'INACTIVE' | 'DRAFT';
  avgRating: number;
  totalReviews: number;
  variants: ProductVariant[];
  brand?: { name: string };
  category?: { name: string };
}

export interface OrderItem {
  id: string;
  productName: string;
  variantName: string;
  quantity: number;
  price: number;
  stringVariantId?: string;
}

export interface Order {
  id: string;
  code: string;
  status: OrderStatus;
  totalAmount: number;
  createdAt: string;
  user?: { id: string; fullName: string; email: string };
  guestEmail?: string;
  guestName?: string;
  items?: OrderItem[];
  shippingAddress?: Record<string, unknown>;
}

export interface Review {
  id: string;
  rating: number;
  title: string;
  comment: string;
  status: ReviewStatus;
  images: string[];
  helpfulCount: number;
  createdAt: string;
  user: { id: string; fullName: string; email: string };
  product: { id: string; name: string; slug: string };
  adminNote?: string;
}

export interface ReturnRequest {
  id: string;
  orderCode: string;
  status: ReturnStatus;
  reason: string;
  description?: string;
  refundAmount?: number;
  createdAt: string;
  order: { id: string; code: string; totalAmount: number };
  user?: { id: string; fullName: string; email: string };
  guestEmail?: string;
  items: Array<{ productName: string; quantity: number; reason: string }>;
  adminNote?: string;
}

export interface Coupon {
  id: string;
  code: string;
  type: CouponType;
  value: number;
  minOrderValue?: number;
  maxDiscount?: number;
  usageLimit?: number;
  usageCount: number;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
  createdAt: string;
}

export interface DashboardSummary {
  revenue: {
    today: number;
    thisWeek: number;
    thisMonth: number;
    thisYear: number;
  };
  orders: {
    total: number;
    pending: number;
    processing: number;
    delivered: number;
    cancelled: number;
  };
  users: {
    total: number;
    newThisMonth: number;
  };
  alerts: {
    pendingReviews: number;
    pendingReturns: number;
    lowStockVariants: number;
    stringQueue: number;
  };
}

export interface RevenuePoint {
  date: string;
  revenue: number;
  orders: number;
}

export interface TopProduct {
  productId: string;
  productName: string;
  totalSold: number;
  revenue: number;
}

export interface LowStockVariant {
  variantId: string;
  variantName: string;
  sku: string;
  stock: number;
  productName: string;
  productId: string;
}

export interface StringQueueItem {
  orderId: string;
  orderCode: string;
  createdAt: string;
  customer: string;
  items: Array<{ itemName: string; stringVariantName: string }>;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

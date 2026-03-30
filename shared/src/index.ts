// ==================== USER ====================
export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN',
}

export interface IUser {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  avatar?: string;
  role: UserRole;
  isActive: boolean;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

// ==================== ADDRESS ====================
export interface IAddress {
  id: string;
  userId: string;
  fullName: string;
  phone: string;
  province: string;
  district: string;
  ward: string;
  street: string;
  isDefault: boolean;
}

// ==================== CATEGORY ====================
export interface ICategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentId?: string;
  level: number;
  isActive: boolean;
  sortOrder: number;
  children?: ICategory[];
}

// ==================== BRAND ====================
export interface IBrand {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  description?: string;
  isActive: boolean;
}

// ==================== PRODUCT ====================
export enum ProductStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  OUT_OF_STOCK = 'OUT_OF_STOCK',
}

export interface IProduct {
  id: string;
  name: string;
  slug: string;
  description?: string;
  shortDescription?: string;
  categoryId: string;
  brandId: string;
  basePrice: number;
  salePrice?: number;
  sku: string;
  status: ProductStatus;
  isFeatured: boolean;
  totalSold: number;
  avgRating: number;
  totalReviews: number;
  metaTitle?: string;
  metaDescription?: string;
  category?: ICategory;
  brand?: IBrand;
  images?: IProductImage[];
  variants?: IProductVariant[];
  createdAt: string;
  updatedAt: string;
}

export interface IProductVariant {
  id: string;
  productId: string;
  name: string;
  sku: string;
  price: number;
  salePrice?: number;
  stock: number;
  attributes: Record<string, string>;
}

export interface IProductImage {
  id: string;
  productId: string;
  url: string;
  alt?: string;
  sortOrder: number;
  isMain: boolean;
}

// ==================== CART ====================
export interface ICartItem {
  id: string;
  productId: string;
  variantId?: string;
  quantity: number;
  product?: IProduct;
  variant?: IProductVariant;
}

export interface ICart {
  id: string;
  userId: string;
  items: ICartItem[];
}

// ==================== ORDER ====================
export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  SHIPPING = 'SHIPPING',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}

export enum PaymentMethod {
  COD = 'COD',
  BANK_TRANSFER = 'BANK_TRANSFER',
  E_WALLET = 'E_WALLET',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

export interface IOrder {
  id: string;
  orderCode: string;
  userId: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
  note?: string;
  shippingAddress: IAddress;
  couponId?: string;
  items?: IOrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface IOrderItem {
  id: string;
  orderId: string;
  productId: string;
  variantId?: string;
  productName: string;
  productImage: string;
  variantName?: string;
  price: number;
  quantity: number;
  total: number;
}

// ==================== COUPON ====================
export enum CouponType {
  PERCENTAGE = 'PERCENTAGE',
  FIXED_AMOUNT = 'FIXED_AMOUNT',
}

export interface ICoupon {
  id: string;
  code: string;
  type: CouponType;
  value: number;
  minOrderAmount?: number;
  maxDiscount?: number;
  usageLimit: number;
  usedCount: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

// ==================== REVIEW ====================
export interface IReview {
  id: string;
  userId: string;
  productId: string;
  orderId: string;
  rating: number;
  comment: string;
  images?: string[];
  isApproved: boolean;
  user?: Pick<IUser, 'id' | 'fullName' | 'avatar'>;
  createdAt: string;
}

// ==================== NOTIFICATION ====================
export enum NotificationType {
  ORDER = 'ORDER',
  PROMOTION = 'PROMOTION',
  SYSTEM = 'SYSTEM',
}

export interface INotification {
  id: string;
  userId: string;
  title: string;
  content: string;
  type: NotificationType;
  isRead: boolean;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

// ==================== BANNER ====================
export enum BannerPosition {
  HOME_SLIDER = 'HOME_SLIDER',
  HOME_BANNER = 'HOME_BANNER',
  CATEGORY_BANNER = 'CATEGORY_BANNER',
}

export interface IBanner {
  id: string;
  title: string;
  image: string;
  link?: string;
  position: BannerPosition;
  sortOrder: number;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
}

// ==================== API RESPONSE ====================
export interface IApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

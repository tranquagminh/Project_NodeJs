export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface ApiListResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ProductImage {
  id: string;
  url: string;
  alt: string | null;
  isMain: boolean;
  sortOrder: number;
}

export interface Order {
  id: string;
  orderCode: string;
  status: 'PENDING' | 'CONFIRMED' | 'SHIPPING' | 'DELIVERED' | 'CANCELLED';
  paymentMethod: 'CREDIT_CARD' | 'BANK_TRANSFER' | 'E_WALLET';
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
  subtotal: string;
  shippingFee: string;
  estimatedTax: string;
  discount: string;
  total: string;
  shippingMethod: 'STANDARD_DELIVERY' | 'EXPRESS_VELOCITY';
  shippingAddress: {
    firstName: string;
    lastName: string;
    addressLine1: string;
    city: string;
    postalCode: string;
    country?: string;
  };
  items: OrderItem[];
  createdAt: string;
}

export interface OrderItem {
  id: string;
  productName: string;
  productImage: string;
  variantName: string | null;
  price: string;
  quantity: number;
  total: string;
}

export interface Review {
  id: string;
  userId: string;
  rating: number;
  comment: string | null;
  isApproved: boolean;
  createdAt: string;
  user: { fullName: string; avatar: string | null };
}

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  phone: string | null;
  avatar: string | null;
  role: 'USER' | 'ADMIN' | 'SUPER_ADMIN';
}

export interface ProductSpec {
  flex: 'STIFF' | 'MEDIUM' | 'FLEXIBLE' | null;
  frameMaterial: string | null;
  shaftMaterial: string | null;
  jointType: string | null;
  weightGripDesc: string | null;
  recommendedTension: string | null;
  maxTensionByWeight: Record<string, number> | null;
  skillLevel: 'PROFESSIONAL' | 'INTERMEDIATE' | 'ADVANCED' | 'BEGINNER' | null;
  playStyle: 'POWER_HEAD_HEAVY' | 'SPEED_HEAD_LIGHT' | 'CONTROL_EVEN_BALANCE' | null;
  series: string | null;
  technologyIds: string[];
  recommendedStringIds: string[];
}

export interface ProductVariant {
  id: string;
  name: string;
  sku: string;
  price: string;
  salePrice: string | null;
  stock: number;
  attributes: Record<string, string | number> | null;
}

export interface ProductListItem {
  id: string;
  name: string;
  slug: string;
  basePrice: string;
  salePrice: string | null;
  isFeatured: boolean;
  isNewArrival: boolean;
  avgRating: string;
  totalSold: number;
  images: ProductImage[];
  spec: Pick<ProductSpec, 'flex' | 'playStyle' | 'series' | 'skillLevel'> | null;
  brand: { id: string; name: string; slug: string } | null;
  category: { id: string; name: string; slug: string } | null;
}

export interface ProductDetail extends ProductListItem {
  description: string | null;
  shortDescription: string | null;
  spec: ProductSpec | null;
  variants: ProductVariant[];
}

export interface Athlete {
  id: string;
  name: string;
  title: string | null;
  image: string;
  profileLink: string | null;
  sortOrder: number;
}

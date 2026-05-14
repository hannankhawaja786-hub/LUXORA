// ============================================================
// LUXORA — Supabase Database Types
// ============================================================

export type LoyaltyTier = 'bronze' | 'silver' | 'gold' | 'platinum';

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export type PaymentStatus = 'unpaid' | 'paid' | 'refunded' | 'failed';

// ─────────────────────────────────────────────
// Table Row Types (matches Supabase schema)
// ─────────────────────────────────────────────

export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  loyalty_points: number;
  tier: LoyaltyTier;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface Product {
  id: string;
  category_id: string | null;
  name: string;
  brand: string | null;
  description: string | null;
  short_description: string | null;
  price: number;
  compare_price: number | null;
  currency: string;
  sku: string | null;
  stock_quantity: number;
  images: string[];
  tags: string[];
  is_featured: boolean;
  is_active: boolean;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  // joined
  categories?: Category | null;
}

export interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  created_at: string;
  updated_at: string;
  // joined
  products?: Product | null;
}

export interface Order {
  id: string;
  user_id: string | null;
  order_number: string;
  status: OrderStatus;
  total_amount: number;
  currency: string;
  shipping_address: ShippingAddress | null;
  payment_method: string | null;
  payment_status: PaymentStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
  // joined
  order_items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  product_brand: string | null;
  product_price: number;
  quantity: number;
  subtotal: number;
  created_at: string;
}

export interface WishlistItem {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
  // joined
  products?: Product | null;
}

// ─────────────────────────────────────────────
// Helper / Input Types
// ─────────────────────────────────────────────

export interface ShippingAddress {
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  country: string;
  postal_code?: string;
}

export interface ProductFilters {
  category_slug?: string;
  is_featured?: boolean;
  min_price?: number;
  max_price?: number;
  brand?: string;
  tags?: string[];
  search?: string;
  limit?: number;
  offset?: number;
}

export interface CartItemWithProduct extends CartItem {
  products: Product;
}

export interface WishlistItemWithProduct extends WishlistItem {
  products: Product;
}
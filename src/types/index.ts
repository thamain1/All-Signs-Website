export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  parent_id: string | null;
  image_url: string | null;
  display_order: number;
  is_active: boolean;
}

export interface Product {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  description: string | null;
  short_description: string | null;
  image_urls: string[];
  is_active: boolean;
  allows_custom_size: boolean;
  min_width: number | null;
  max_width: number | null;
  min_height: number | null;
  max_height: number | null;
  production_days_min: number;
  production_days_max: number;
  seo_title: string | null;
  seo_description: string | null;
}

export interface ProductOption {
  id: string;
  product_id: string;
  option_type: 'material' | 'size' | 'finishing' | 'addon';
  name: string;
  value: string;
  description: string | null;
  price_modifier: number;
  is_default: boolean;
  display_order: number;
  is_active: boolean;
}

export interface PricingRule {
  id: string;
  product_id: string;
  material_option_id: string | null;
  base_price: number;
  price_per_sqft: number;
  min_quantity: number;
  max_quantity: number | null;
  discount_percent: number;
  is_active: boolean;
}

export interface CartItem {
  id: string;
  cart_id: string;
  product_id: string;
  quantity: number;
  width: number | null;
  height: number | null;
  selected_options: Record<string, string>;
  unit_price: number;
  total_price: number;
  production_speed: string;
  product?: Product;
}

export interface Cart {
  id: string;
  user_id: string | null;
  session_id: string | null;
  promo_code: string | null;
  discount_amount: number;
  items?: CartItem[];
}

export interface Address {
  id: string;
  user_id: string;
  address_type: 'shipping' | 'billing';
  full_name: string;
  company: string | null;
  address_line1: string;
  address_line2: string | null;
  city: string;
  state: string;
  zip_code: string;
  country: string;
  phone: string | null;
  is_default: boolean;
}

export interface Order {
  id: string;
  order_number: string;
  user_id: string;
  status: string;
  subtotal: number;
  discount_amount: number;
  shipping_cost: number;
  tax_amount: number;
  total_amount: number;
  promo_code: string | null;
  shipping_address: Record<string, string>;
  billing_address: Record<string, string> | null;
  shipping_method: string | null;
  estimated_production_date: string | null;
  estimated_delivery_date: string | null;
  shipped_date: string | null;
  tracking_number: string | null;
  tracking_url: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  width: number | null;
  height: number | null;
  selected_options: Record<string, string>;
  unit_price: number;
  total_price: number;
  production_speed: string;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  category: string | null;
  content: string;
  excerpt: string | null;
  image_url: string | null;
  is_published: boolean;
  published_at: string | null;
}

export interface PromoCode {
  id: string;
  code: string;
  description: string | null;
  discount_type: 'percentage' | 'fixed' | 'free_shipping';
  discount_value: number;
  min_order_amount: number;
  max_uses: number | null;
  current_uses: number;
  valid_from: string;
  valid_until: string | null;
  is_active: boolean;
}

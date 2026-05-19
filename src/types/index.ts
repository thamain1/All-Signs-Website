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
  size_preset_category: string | null;
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
  store_id?: string | null;
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
  store_id?: string | null;
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
  store_id?: string | null;
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

export interface PreflightCheck {
  checks: Array<{
    type: string;
    status: 'pass' | 'warn' | 'fail';
    message: string;
    details?: any;
  }>;
  warnings: string[];
  blockers: string[];
  passed: boolean;
}

export interface Design {
  id: string;
  user_id: string;
  name: string;
  product_id: string | null;
  template_id: string | null;
  product_type: string;
  variant_snapshot: Record<string, any>;
  width_in: number;
  height_in: number;
  bleed_in: number;
  safe_zone_in: number;
  editor_json: any;
  preview_png_url: string | null;
  print_pdf_url: string | null;
  preflight_json: PreflightCheck;
  status: 'draft' | 'ready' | 'rendering' | 'failed' | 'archived';
  last_edited_at: string;
  created_at: string;
  updated_at: string;
}

export interface TemplateCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
}

export interface Template {
  id: string;
  name: string;
  slug: string;
  category_id: string | null;
  product_type: string;
  tags: string[];
  thumbnail_url: string | null;
  base_width_in: number;
  base_height_in: number;
  bleed_in: number;
  safe_zone_in: number;
  editor_json: any;
  description: string | null;
  is_published: boolean;
  usage_count: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface DesignAsset {
  id: string;
  design_id: string;
  user_id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  file_url: string;
  width_px: number | null;
  height_px: number | null;
  thumbnail_url: string | null;
  created_at: string;
}

export interface ProofLink {
  id: string;
  design_id: string;
  order_id: string | null;
  token: string;
  title: string | null;
  message: string | null;
  expires_at: string | null;
  created_by: string;
  view_count: number;
  last_viewed_at: string | null;
  created_at: string;
}

export interface BusinessStore {
  id: string;
  slug: string;
  name: string;
  owner_user_id: string | null;
  logo_url: string | null;
  logo_storage_path: string | null;
  primary_color: string;
  welcome_message: string | null;
  allowed_email_domains: string[];
  status: 'active' | 'paused' | 'archived';
  created_at: string;
  updated_at: string;
}

export interface StoreProduct {
  id: string;
  store_id: string;
  product_id: string;
  display_name: string | null;
  display_description: string | null;
  mockup_image_url: string | null;
  logo_placement_notes: string | null;
  custom_unit_price: number | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  product?: Product;
}

export interface StoreMember {
  id: string;
  store_id: string;
  user_id: string;
  role: 'buyer' | 'manager' | 'owner';
  created_at: string;
}

export interface StoreSignupInfo {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  primary_color: string;
  welcome_message: string | null;
  allowed_email_domains: string[];
  status: 'active' | 'paused' | 'archived';
}

export interface ProofComment {
  id: string;
  proof_link_id: string;
  author_user_id: string | null;
  author_name: string | null;
  comment: string;
  status: 'comment' | 'approved' | 'change_requested';
  is_internal: boolean;
  created_at: string;
}

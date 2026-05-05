-- ============================================================
-- All Signs NC - Complete Database Schema
-- Generated: 2026-05-05
-- Migrations included (in order):
--   1. 20260105180759_create_core_ecommerce_schema
--   2. 20260105184412_create_design_studio_schema
--   3. 20260105201417_create_content_management_system
--   4. 20260105205655_add_storage_policies
--   5. 20260105223144_add_storage_bucket_policies
--   6. 20260105231230_allow_public_content_slots_access
--   7. 20260125180247_add_product_size_presets
--   8. 20260125180440_add_size_preset_category_to_products
-- ============================================================


-- ============================================================
-- MIGRATION 1: Core Ecommerce Schema
-- ============================================================

-- Product Categories
CREATE TABLE IF NOT EXISTS product_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  parent_id uuid REFERENCES product_categories(id),
  image_url text,
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Categories are viewable by everyone"
  ON product_categories FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Admin can manage categories"
  ON product_categories FOR ALL
  TO authenticated
  USING (auth.jwt()->>'role' = 'admin')
  WITH CHECK (auth.jwt()->>'role' = 'admin');

-- Products
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES product_categories(id) NOT NULL,
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  short_description text,
  image_urls text[] DEFAULT '{}',
  is_active boolean DEFAULT true,
  allows_custom_size boolean DEFAULT false,
  min_width numeric,
  max_width numeric,
  min_height numeric,
  max_height numeric,
  production_days_min integer DEFAULT 1,
  production_days_max integer DEFAULT 5,
  seo_title text,
  seo_description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Products are viewable by everyone"
  ON products FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Admin can manage products"
  ON products FOR ALL
  TO authenticated
  USING (auth.jwt()->>'role' = 'admin')
  WITH CHECK (auth.jwt()->>'role' = 'admin');

-- Product Options (materials, sizes, finishing)
CREATE TABLE IF NOT EXISTS product_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  option_type text NOT NULL, -- 'material', 'size', 'finishing', 'addon'
  name text NOT NULL,
  value text NOT NULL,
  description text,
  price_modifier numeric DEFAULT 0,
  is_default boolean DEFAULT false,
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE product_options ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Product options are viewable by everyone"
  ON product_options FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Admin can manage product options"
  ON product_options FOR ALL
  TO authenticated
  USING (auth.jwt()->>'role' = 'admin')
  WITH CHECK (auth.jwt()->>'role' = 'admin');

-- Pricing Rules
CREATE TABLE IF NOT EXISTS pricing_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  material_option_id uuid REFERENCES product_options(id),
  base_price numeric NOT NULL DEFAULT 0,
  price_per_sqft numeric DEFAULT 0,
  min_quantity integer DEFAULT 1,
  max_quantity integer,
  discount_percent numeric DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE pricing_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Pricing rules are viewable by everyone"
  ON pricing_rules FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Admin can manage pricing rules"
  ON pricing_rules FOR ALL
  TO authenticated
  USING (auth.jwt()->>'role' = 'admin')
  WITH CHECK (auth.jwt()->>'role' = 'admin');

-- Addresses
CREATE TABLE IF NOT EXISTS addresses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  address_type text DEFAULT 'shipping', -- 'shipping' or 'billing'
  full_name text NOT NULL,
  company text,
  address_line1 text NOT NULL,
  address_line2 text,
  city text NOT NULL,
  state text NOT NULL,
  zip_code text NOT NULL,
  country text DEFAULT 'US',
  phone text,
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own addresses"
  ON addresses FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own addresses"
  ON addresses FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own addresses"
  ON addresses FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own addresses"
  ON addresses FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Carts
CREATE TABLE IF NOT EXISTS carts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id text,
  promo_code text,
  discount_amount numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE carts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own cart"
  ON carts FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cart"
  ON carts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cart"
  ON carts FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Cart Items
CREATE TABLE IF NOT EXISTS cart_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id uuid REFERENCES carts(id) ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES products(id) NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  width numeric,
  height numeric,
  selected_options jsonb DEFAULT '{}',
  unit_price numeric NOT NULL,
  total_price numeric NOT NULL,
  production_speed text DEFAULT 'standard',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own cart items"
  ON cart_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM carts
      WHERE carts.id = cart_items.cart_id
      AND carts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own cart items"
  ON cart_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM carts
      WHERE carts.id = cart_items.cart_id
      AND carts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own cart items"
  ON cart_items FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM carts
      WHERE carts.id = cart_items.cart_id
      AND carts.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM carts
      WHERE carts.id = cart_items.cart_id
      AND carts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own cart items"
  ON cart_items FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM carts
      WHERE carts.id = cart_items.cart_id
      AND carts.user_id = auth.uid()
    )
  );

-- Orders
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text UNIQUE NOT NULL,
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  status text DEFAULT 'pending', -- pending, artwork_review, in_production, shipped, delivered, cancelled
  subtotal numeric NOT NULL,
  discount_amount numeric DEFAULT 0,
  shipping_cost numeric DEFAULT 0,
  tax_amount numeric DEFAULT 0,
  total_amount numeric NOT NULL,
  promo_code text,
  shipping_address jsonb NOT NULL,
  billing_address jsonb,
  shipping_method text,
  estimated_production_date date,
  estimated_delivery_date date,
  shipped_date timestamptz,
  tracking_number text,
  tracking_url text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own orders"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin can view all orders"
  ON orders FOR SELECT
  TO authenticated
  USING (auth.jwt()->>'role' = 'admin');

CREATE POLICY "Admin can update all orders"
  ON orders FOR UPDATE
  TO authenticated
  USING (auth.jwt()->>'role' = 'admin')
  WITH CHECK (auth.jwt()->>'role' = 'admin');

-- Order Items
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES products(id) NOT NULL,
  product_name text NOT NULL,
  quantity integer NOT NULL,
  width numeric,
  height numeric,
  selected_options jsonb DEFAULT '{}',
  unit_price numeric NOT NULL,
  total_price numeric NOT NULL,
  production_speed text DEFAULT 'standard',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own order items"
  ON order_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Admin can view all order items"
  ON order_items FOR SELECT
  TO authenticated
  USING (auth.jwt()->>'role' = 'admin');

-- Uploads (artwork files)
CREATE TABLE IF NOT EXISTS uploads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  order_item_id uuid REFERENCES order_items(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  file_url text NOT NULL,
  file_size bigint,
  file_type text,
  status text DEFAULT 'pending', -- pending, approved, rejected, needs_revision
  admin_notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE uploads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own uploads"
  ON uploads FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own uploads"
  ON uploads FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin can view all uploads"
  ON uploads FOR SELECT
  TO authenticated
  USING (auth.jwt()->>'role' = 'admin');

CREATE POLICY "Admin can update all uploads"
  ON uploads FOR UPDATE
  TO authenticated
  USING (auth.jwt()->>'role' = 'admin')
  WITH CHECK (auth.jwt()->>'role' = 'admin');

-- Support Tickets
CREATE TABLE IF NOT EXISTS support_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id uuid REFERENCES orders(id) ON DELETE SET NULL,
  ticket_type text NOT NULL, -- 'pre_sales', 'design_help', 'order_issue', 'reprint_claim'
  subject text NOT NULL,
  status text DEFAULT 'open', -- open, in_progress, resolved, closed
  priority text DEFAULT 'normal', -- low, normal, high, urgent
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tickets"
  ON support_tickets FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tickets"
  ON support_tickets FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin can view all tickets"
  ON support_tickets FOR SELECT
  TO authenticated
  USING (auth.jwt()->>'role' = 'admin');

CREATE POLICY "Admin can update all tickets"
  ON support_tickets FOR UPDATE
  TO authenticated
  USING (auth.jwt()->>'role' = 'admin')
  WITH CHECK (auth.jwt()->>'role' = 'admin');

-- Ticket Messages
CREATE TABLE IF NOT EXISTS ticket_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid REFERENCES support_tickets(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  message text NOT NULL,
  is_admin boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE ticket_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages for own tickets"
  ON ticket_messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM support_tickets
      WHERE support_tickets.id = ticket_messages.ticket_id
      AND support_tickets.user_id = auth.uid()
    ) OR auth.jwt()->>'role' = 'admin'
  );

CREATE POLICY "Users can insert messages for own tickets"
  ON ticket_messages FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM support_tickets
      WHERE support_tickets.id = ticket_messages.ticket_id
      AND support_tickets.user_id = auth.uid()
    ) OR auth.jwt()->>'role' = 'admin'
  );

-- Articles (Resources/Blog)
CREATE TABLE IF NOT EXISTS articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  category text, -- 'material_guide', 'file_setup', 'installation', 'turnaround'
  content text NOT NULL,
  excerpt text,
  image_url text,
  is_published boolean DEFAULT false,
  published_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published articles are viewable by everyone"
  ON articles FOR SELECT
  TO public
  USING (is_published = true);

CREATE POLICY "Admin can manage articles"
  ON articles FOR ALL
  TO authenticated
  USING (auth.jwt()->>'role' = 'admin')
  WITH CHECK (auth.jwt()->>'role' = 'admin');

-- Promo Codes
CREATE TABLE IF NOT EXISTS promo_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  description text,
  discount_type text NOT NULL, -- 'percentage', 'fixed', 'free_shipping'
  discount_value numeric NOT NULL,
  min_order_amount numeric DEFAULT 0,
  max_uses integer,
  current_uses integer DEFAULT 0,
  valid_from timestamptz DEFAULT now(),
  valid_until timestamptz,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view active promo codes"
  ON promo_codes FOR SELECT
  TO authenticated
  USING (is_active = true AND (valid_until IS NULL OR valid_until > now()));

CREATE POLICY "Admin can manage promo codes"
  ON promo_codes FOR ALL
  TO authenticated
  USING (auth.jwt()->>'role' = 'admin')
  WITH CHECK (auth.jwt()->>'role' = 'admin');

-- Indexes
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_product_options_product ON product_options(product_id);
CREATE INDEX IF NOT EXISTS idx_pricing_rules_product ON pricing_rules(product_id);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_uploads_user ON uploads(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_user ON support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles(slug);


-- ============================================================
-- MIGRATION 2: Design Studio Schema
-- ============================================================

-- Template Categories
CREATE TABLE IF NOT EXISTS template_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE template_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Template categories are viewable by everyone"
  ON template_categories FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Admin can manage template categories"
  ON template_categories FOR ALL
  TO authenticated
  USING (auth.jwt()->>'role' = 'admin')
  WITH CHECK (auth.jwt()->>'role' = 'admin');

-- Templates
CREATE TABLE IF NOT EXISTS templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  category_id uuid REFERENCES template_categories(id),
  product_type text NOT NULL,
  tags text[] DEFAULT '{}',
  thumbnail_url text,
  base_width_in numeric NOT NULL,
  base_height_in numeric NOT NULL,
  bleed_in numeric DEFAULT 0.125,
  safe_zone_in numeric DEFAULT 0.25,
  editor_json jsonb NOT NULL,
  description text,
  is_published boolean DEFAULT false,
  usage_count integer DEFAULT 0,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published templates are viewable by everyone"
  ON templates FOR SELECT
  TO public
  USING (is_published = true);

CREATE POLICY "Admin can manage all templates"
  ON templates FOR ALL
  TO authenticated
  USING (auth.jwt()->>'role' = 'admin')
  WITH CHECK (auth.jwt()->>'role' = 'admin');

-- Designs
CREATE TABLE IF NOT EXISTS designs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL DEFAULT 'Untitled Design',
  product_id uuid REFERENCES products(id),
  template_id uuid REFERENCES templates(id),
  product_type text NOT NULL,
  variant_snapshot jsonb NOT NULL,
  width_in numeric NOT NULL,
  height_in numeric NOT NULL,
  bleed_in numeric DEFAULT 0.125,
  safe_zone_in numeric DEFAULT 0.25,
  editor_json jsonb NOT NULL,
  preview_png_url text,
  print_pdf_url text,
  preflight_json jsonb DEFAULT '{"checks": [], "warnings": [], "blockers": [], "passed": false}',
  status text DEFAULT 'draft',
  last_edited_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE designs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own designs"
  ON designs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own designs"
  ON designs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own designs"
  ON designs FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own designs"
  ON designs FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admin can view all designs"
  ON designs FOR SELECT
  TO authenticated
  USING (auth.jwt()->>'role' = 'admin');

CREATE POLICY "Admin can update all designs"
  ON designs FOR UPDATE
  TO authenticated
  USING (auth.jwt()->>'role' = 'admin')
  WITH CHECK (auth.jwt()->>'role' = 'admin');

-- Design Versions
CREATE TABLE IF NOT EXISTS design_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  design_id uuid REFERENCES designs(id) ON DELETE CASCADE NOT NULL,
  version_number integer NOT NULL,
  editor_json jsonb NOT NULL,
  preview_png_url text,
  created_by uuid REFERENCES auth.users(id) NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(design_id, version_number)
);

ALTER TABLE design_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view versions of own designs"
  ON design_versions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM designs
      WHERE designs.id = design_versions.design_id
      AND designs.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert versions for own designs"
  ON design_versions FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM designs
      WHERE designs.id = design_versions.design_id
      AND designs.user_id = auth.uid()
    )
  );

-- Design Assets
CREATE TABLE IF NOT EXISTS design_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  design_id uuid REFERENCES designs(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  file_name text NOT NULL,
  file_type text NOT NULL,
  file_size bigint NOT NULL,
  file_url text NOT NULL,
  width_px integer,
  height_px integer,
  thumbnail_url text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE design_assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own design assets"
  ON design_assets FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own design assets"
  ON design_assets FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own design assets"
  ON design_assets FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Render Jobs
CREATE TABLE IF NOT EXISTS render_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  design_id uuid REFERENCES designs(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  job_type text NOT NULL,
  status text DEFAULT 'pending',
  output_url text,
  error_message text,
  metadata jsonb DEFAULT '{}',
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE render_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own render jobs"
  ON render_jobs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own render jobs"
  ON render_jobs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin can view all render jobs"
  ON render_jobs FOR SELECT
  TO authenticated
  USING (auth.jwt()->>'role' = 'admin');

-- Proof Links
CREATE TABLE IF NOT EXISTS proof_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  design_id uuid REFERENCES designs(id) ON DELETE CASCADE NOT NULL,
  order_id uuid REFERENCES orders(id) ON DELETE SET NULL,
  token text UNIQUE NOT NULL,
  title text,
  message text,
  expires_at timestamptz,
  created_by uuid REFERENCES auth.users(id) NOT NULL,
  view_count integer DEFAULT 0,
  last_viewed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE proof_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own proof links"
  ON proof_links FOR SELECT
  TO authenticated
  USING (auth.uid() = created_by);

CREATE POLICY "Users can insert own proof links"
  ON proof_links FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Anyone with token can view proof link"
  ON proof_links FOR SELECT
  TO public
  USING (
    token IS NOT NULL
    AND (expires_at IS NULL OR expires_at > now())
  );

CREATE POLICY "Admin can view all proof links"
  ON proof_links FOR SELECT
  TO authenticated
  USING (auth.jwt()->>'role' = 'admin');

-- Proof Comments
CREATE TABLE IF NOT EXISTS proof_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  proof_link_id uuid REFERENCES proof_links(id) ON DELETE CASCADE NOT NULL,
  author_user_id uuid REFERENCES auth.users(id),
  author_name text,
  comment text NOT NULL,
  status text DEFAULT 'comment',
  is_internal boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE proof_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view proof comments via valid proof link"
  ON proof_comments FOR SELECT
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM proof_links
      WHERE proof_links.id = proof_comments.proof_link_id
      AND (proof_links.expires_at IS NULL OR proof_links.expires_at > now())
    )
  );

CREATE POLICY "Authenticated users can insert proof comments"
  ON proof_comments FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can insert anonymous proof comments"
  ON proof_comments FOR INSERT
  TO anon
  WITH CHECK (author_user_id IS NULL);

CREATE POLICY "Admin can manage all proof comments"
  ON proof_comments FOR ALL
  TO authenticated
  USING (auth.jwt()->>'role' = 'admin')
  WITH CHECK (auth.jwt()->>'role' = 'admin');

-- Add design_id to cart_items and order_items
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'cart_items' AND column_name = 'design_id'
  ) THEN
    ALTER TABLE cart_items ADD COLUMN design_id uuid REFERENCES designs(id) ON DELETE SET NULL;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'order_items' AND column_name = 'design_id'
  ) THEN
    ALTER TABLE order_items ADD COLUMN design_id uuid REFERENCES designs(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_designs_user ON designs(user_id);
CREATE INDEX IF NOT EXISTS idx_designs_status ON designs(status);
CREATE INDEX IF NOT EXISTS idx_designs_product ON designs(product_id);
CREATE INDEX IF NOT EXISTS idx_templates_published ON templates(is_published);
CREATE INDEX IF NOT EXISTS idx_templates_category ON templates(category_id);
CREATE INDEX IF NOT EXISTS idx_proof_links_token ON proof_links(token);
CREATE INDEX IF NOT EXISTS idx_proof_links_design ON proof_links(design_id);
CREATE INDEX IF NOT EXISTS idx_design_assets_design ON design_assets(design_id);
CREATE INDEX IF NOT EXISTS idx_render_jobs_design ON render_jobs(design_id);
CREATE INDEX IF NOT EXISTS idx_render_jobs_status ON render_jobs(status);


-- ============================================================
-- MIGRATION 3: Content Management System
-- ============================================================

-- Profiles
CREATE TABLE IF NOT EXISTS profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Media Assets
CREATE TABLE IF NOT EXISTS media_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  title text NOT NULL,
  alt_text text DEFAULT '',
  tags text[] DEFAULT '{}',
  mime_type text NOT NULL,
  byte_size integer NOT NULL,
  storage_path text NOT NULL,
  url text NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived'))
);

ALTER TABLE media_assets ENABLE ROW LEVEL SECURITY;

-- Content Slots
CREATE TABLE IF NOT EXISTS content_slots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slot_key text UNIQUE NOT NULL,
  draft_value jsonb DEFAULT '{}',
  published_value jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

ALTER TABLE content_slots ENABLE ROW LEVEL SECURITY;

-- Content Versions
CREATE TABLE IF NOT EXISTS content_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  version integer NOT NULL,
  published_snapshot jsonb NOT NULL,
  published_at timestamptz DEFAULT now(),
  published_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  notes text DEFAULT ''
);

ALTER TABLE content_versions ENABLE ROW LEVEL SECURITY;

-- Helper function: check if current user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE user_id = auth.uid()
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles RLS
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid() AND role = 'user');

CREATE POLICY "Users can update their own profile (non-role fields)"
  ON profiles FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (
    user_id = auth.uid() AND
    (role = (SELECT role FROM profiles WHERE user_id = auth.uid()))
  );

CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "Admins can update any profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Media Assets RLS
CREATE POLICY "Anyone can view active media assets"
  ON media_assets FOR SELECT
  TO authenticated
  USING (status = 'active');

CREATE POLICY "Admins can view all media assets"
  ON media_assets FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "Admins can insert media assets"
  ON media_assets FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update media assets"
  ON media_assets FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete media assets"
  ON media_assets FOR DELETE
  TO authenticated
  USING (is_admin());

-- Content Slots RLS
CREATE POLICY "Anyone can view published content slots"
  ON content_slots FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert content slots"
  ON content_slots FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update content slots"
  ON content_slots FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete content slots"
  ON content_slots FOR DELETE
  TO authenticated
  USING (is_admin());

-- Content Versions RLS
CREATE POLICY "Admins can view content versions"
  ON content_versions FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "Admins can insert content versions"
  ON content_versions FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update content versions"
  ON content_versions FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete content versions"
  ON content_versions FOR DELETE
  TO authenticated
  USING (is_admin());

-- Indexes
CREATE INDEX IF NOT EXISTS idx_media_assets_status ON media_assets(status);
CREATE INDEX IF NOT EXISTS idx_media_assets_created_by ON media_assets(created_by);
CREATE INDEX IF NOT EXISTS idx_content_slots_slot_key ON content_slots(slot_key);
CREATE INDEX IF NOT EXISTS idx_content_versions_version ON content_versions(version);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- Default content slots
INSERT INTO content_slots (slot_key, published_value) VALUES
  ('home.hero.background', '{
    "fallbackPath": "/images/stock/hero-print-studio-1600.webp",
    "alt": "Large format printing studio with professional equipment",
    "headline": "Professional Signs & Banners",
    "subhead": "Custom printing solutions for your business",
    "enabled": true
  }'),
  ('home.categoryTile.yardSigns', '{
    "fallbackPath": "/images/stock/category-yard-signs-600.webp",
    "alt": "Custom yard signs and lawn signs",
    "enabled": true
  }'),
  ('home.categoryTile.banners', '{
    "fallbackPath": "/images/stock/category-banners-600.webp",
    "alt": "Indoor and outdoor vinyl banners",
    "enabled": true
  }'),
  ('home.categoryTile.vehicle', '{
    "fallbackPath": "/images/stock/category-vehicle-600.webp",
    "alt": "Vehicle wraps and car decals",
    "enabled": true
  }'),
  ('home.categoryTile.decals', '{
    "fallbackPath": "/images/stock/category-decals-600.webp",
    "alt": "Custom vinyl decals and stickers",
    "enabled": true
  }'),
  ('home.categoryTile.rigidSigns', '{
    "fallbackPath": "/images/stock/category-rigid-signs-600.webp",
    "alt": "Rigid signs and mounted displays",
    "enabled": true
  }'),
  ('home.categoryTile.flags', '{
    "fallbackPath": "/images/stock/category-flags-600.webp",
    "alt": "Custom flags and feather banners",
    "enabled": true
  }'),
  ('home.categoryTile.tradeShow', '{
    "fallbackPath": "/images/stock/category-trade-show-600.webp",
    "alt": "Trade show displays and pop-up banners",
    "enabled": true
  }'),
  ('about.quality.image', '{
    "fallbackPath": "/images/stock/about-quality.webp",
    "alt": "Quality printing with attention to detail",
    "enabled": true
  }'),
  ('about.craftsmanship.image', '{
    "fallbackPath": "/images/stock/about-craftsmanship.jpg",
    "alt": "Expert craftsmanship in every print",
    "enabled": true
  }')
ON CONFLICT (slot_key) DO NOTHING;


-- ============================================================
-- MIGRATION 4: Storage Policies (media-library bucket objects)
-- ============================================================

DROP POLICY IF EXISTS "Admins can upload media" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update media" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete media" ON storage.objects;
DROP POLICY IF EXISTS "Public can view media" ON storage.objects;

CREATE POLICY "Admins can upload media"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'media-library' AND is_admin());

CREATE POLICY "Admins can update media"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'media-library' AND is_admin())
  WITH CHECK (bucket_id = 'media-library' AND is_admin());

CREATE POLICY "Admins can delete media"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'media-library' AND is_admin());

CREATE POLICY "Public can view media"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'media-library');


-- ============================================================
-- MIGRATION 5: Storage Bucket Policies
-- ============================================================

CREATE POLICY "Admins can create buckets"
  ON storage.buckets FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update buckets"
  ON storage.buckets FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete buckets"
  ON storage.buckets FOR DELETE
  TO authenticated
  USING (is_admin());

CREATE POLICY "Anyone can view buckets"
  ON storage.buckets FOR SELECT
  TO public
  USING (true);


-- ============================================================
-- MIGRATION 6: Allow Public Access to Content Slots
-- ============================================================

DROP POLICY IF EXISTS "Anyone can view published content slots" ON content_slots;

CREATE POLICY "Public can view content slots"
  ON content_slots
  FOR SELECT
  TO authenticated, anon
  USING (true);


-- ============================================================
-- MIGRATION 7: Product Size Presets
-- ============================================================

CREATE TABLE IF NOT EXISTS product_size_presets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  category_slug text NOT NULL,
  name text NOT NULL,
  width numeric NOT NULL,
  height numeric NOT NULL,
  unit text DEFAULT 'inches',
  is_default boolean DEFAULT false,
  display_order integer DEFAULT 0,
  guidance_text text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE product_size_presets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Size presets are viewable by everyone"
  ON product_size_presets FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Admin can manage size presets"
  ON product_size_presets FOR ALL
  TO authenticated
  USING (auth.jwt()->>'role' = 'admin')
  WITH CHECK (auth.jwt()->>'role' = 'admin');

CREATE INDEX IF NOT EXISTS idx_product_size_presets_product ON product_size_presets(product_id);
CREATE INDEX IF NOT EXISTS idx_product_size_presets_category ON product_size_presets(category_slug);

CREATE TABLE IF NOT EXISTS viewing_distance_guidelines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_slug text NOT NULL,
  guideline_text text NOT NULL,
  inches_per_foot numeric DEFAULT 1.0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE viewing_distance_guidelines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Guidelines are viewable by everyone"
  ON viewing_distance_guidelines FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Admin can manage guidelines"
  ON viewing_distance_guidelines FOR ALL
  TO authenticated
  USING (auth.jwt()->>'role' = 'admin')
  WITH CHECK (auth.jwt()->>'role' = 'admin');

INSERT INTO viewing_distance_guidelines (category_slug, guideline_text, inches_per_foot)
VALUES ('all', 'Recommended letter height: 1 inch per 10 feet of viewing distance', 0.1)
ON CONFLICT DO NOTHING;


-- ============================================================
-- MIGRATION 8: Add Size Preset Category to Products
-- ============================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'size_preset_category'
  ) THEN
    ALTER TABLE products ADD COLUMN size_preset_category text;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_products_size_preset_category ON products(size_preset_category);

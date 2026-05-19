-- Business Stores: white-label corporate merch shops within AllSigns.
-- Each partner company gets a /store/:slug storefront with their logo on
-- pre-curated products. Browsing is gated (must log in), and signup is
-- restricted to email addresses matching the store's allowed_email_domains.

-- ── Tables ──────────────────────────────────────────────────────────────────

CREATE TABLE business_stores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  owner_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  logo_url text,
  logo_storage_path text,
  primary_color text NOT NULL DEFAULT '#10B981',
  welcome_message text,
  allowed_email_domains text[] NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'active', -- active | paused | archived
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT business_stores_slug_format CHECK (slug ~ '^[a-z0-9][a-z0-9-]*[a-z0-9]$'),
  CONSTRAINT business_stores_status_chk CHECK (status IN ('active','paused','archived'))
);

CREATE INDEX idx_business_stores_slug ON business_stores(slug);
CREATE INDEX idx_business_stores_owner ON business_stores(owner_user_id);
CREATE INDEX idx_business_stores_status ON business_stores(status);

CREATE TABLE store_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid NOT NULL REFERENCES business_stores(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  display_name text,
  display_description text,
  mockup_image_url text,
  logo_placement_notes text,
  custom_unit_price numeric(10,2),
  display_order int NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(store_id, product_id)
);

CREATE INDEX idx_store_products_store ON store_products(store_id);
CREATE INDEX idx_store_products_product ON store_products(product_id);

CREATE TABLE store_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid NOT NULL REFERENCES business_stores(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'buyer', -- buyer | manager | owner
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(store_id, user_id),
  CONSTRAINT store_members_role_chk CHECK (role IN ('buyer','manager','owner'))
);

CREATE INDEX idx_store_members_store ON store_members(store_id);
CREATE INDEX idx_store_members_user ON store_members(user_id);

-- ── Link existing tables to stores ──────────────────────────────────────────

ALTER TABLE orders ADD COLUMN IF NOT EXISTS store_id uuid REFERENCES business_stores(id);
ALTER TABLE cart_items ADD COLUMN IF NOT EXISTS store_id uuid REFERENCES business_stores(id);
CREATE INDEX IF NOT EXISTS idx_orders_store ON orders(store_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_store ON cart_items(store_id);

-- Apparel doesn't fit the inches-based design tool; flag products that are
-- only sold via stores so they don't pollute the public catalog.
ALTER TABLE products ADD COLUMN IF NOT EXISTS for_stores_only boolean NOT NULL DEFAULT false;
CREATE INDEX IF NOT EXISTS idx_products_for_stores_only ON products(for_stores_only);

-- ── updated_at trigger ──────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_business_stores_updated_at ON business_stores;
CREATE TRIGGER trg_business_stores_updated_at
  BEFORE UPDATE ON business_stores
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_store_products_updated_at ON store_products;
CREATE TRIGGER trg_store_products_updated_at
  BEFORE UPDATE ON store_products
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── Helpers ─────────────────────────────────────────────────────────────────

-- Check if the current user is an admin (matches existing profiles-based pattern).
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean LANGUAGE sql SECURITY DEFINER STABLE
SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin'
  );
$$;

-- Look up a store's public info by slug for the signup page. SECURITY DEFINER
-- so unauthenticated visitors can see store branding + the allowed-domain list
-- BEFORE creating an account. Returns NULL if store is not active.
CREATE OR REPLACE FUNCTION get_store_signup_info(p_slug text)
RETURNS TABLE (
  id uuid,
  name text,
  slug text,
  logo_url text,
  primary_color text,
  welcome_message text,
  allowed_email_domains text[],
  status text
) LANGUAGE sql SECURITY DEFINER STABLE
SET search_path = public AS $$
  SELECT id, name, slug, logo_url, primary_color, welcome_message,
         allowed_email_domains, status
  FROM business_stores
  WHERE slug = p_slug AND status = 'active'
  LIMIT 1;
$$;
GRANT EXECUTE ON FUNCTION get_store_signup_info(text) TO anon, authenticated;

-- Join a store after signup. Enforces email-domain match server-side.
CREATE OR REPLACE FUNCTION join_store(p_store_id uuid)
RETURNS store_members LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public AS $$
DECLARE
  v_store business_stores;
  v_email text;
  v_domain text;
  v_member store_members;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'must be signed in to join a store';
  END IF;

  SELECT * INTO v_store FROM business_stores WHERE id = p_store_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'store not found'; END IF;
  IF v_store.status <> 'active' THEN RAISE EXCEPTION 'store is not accepting new members'; END IF;

  SELECT email INTO v_email FROM auth.users WHERE id = auth.uid();
  v_domain := split_part(v_email, '@', 2);

  IF cardinality(v_store.allowed_email_domains) > 0
     AND NOT (v_domain = ANY(v_store.allowed_email_domains)) THEN
    RAISE EXCEPTION 'email domain % is not allowed for this store', v_domain;
  END IF;

  INSERT INTO store_members (store_id, user_id, role)
  VALUES (p_store_id, auth.uid(), 'buyer')
  ON CONFLICT (store_id, user_id) DO UPDATE SET role = store_members.role
  RETURNING * INTO v_member;

  RETURN v_member;
END;
$$;
GRANT EXECUTE ON FUNCTION join_store(uuid) TO authenticated;

-- ── RLS ─────────────────────────────────────────────────────────────────────

ALTER TABLE business_stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_members ENABLE ROW LEVEL SECURITY;

-- business_stores: members and admins can read; only admins write.
CREATE POLICY business_stores_select_member ON business_stores
  FOR SELECT TO authenticated
  USING (
    is_admin()
    OR EXISTS (SELECT 1 FROM store_members sm WHERE sm.store_id = id AND sm.user_id = auth.uid())
    OR owner_user_id = auth.uid()
  );

CREATE POLICY business_stores_admin_all ON business_stores
  FOR ALL TO authenticated
  USING (is_admin()) WITH CHECK (is_admin());

-- store_products: same visibility rule as the parent store.
CREATE POLICY store_products_select_member ON store_products
  FOR SELECT TO authenticated
  USING (
    is_admin()
    OR EXISTS (SELECT 1 FROM store_members sm WHERE sm.store_id = store_products.store_id AND sm.user_id = auth.uid())
  );

CREATE POLICY store_products_admin_all ON store_products
  FOR ALL TO authenticated
  USING (is_admin()) WITH CHECK (is_admin());

-- store_members: a user always sees their own row; admins see everyone.
-- Inserts are blocked at the policy level — use join_store() function instead.
CREATE POLICY store_members_select_self_or_admin ON store_members
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR is_admin());

CREATE POLICY store_members_admin_all ON store_members
  FOR ALL TO authenticated
  USING (is_admin()) WITH CHECK (is_admin());

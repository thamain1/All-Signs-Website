/*
  # Design Studio Database Schema

  ## Overview
  This migration adds the complete Design Studio feature set to support:
  - Customer design creation and editing
  - Template library
  - Proof links for sharing and approval
  - Design versioning and assets management

  ## New Tables

  ### Design Management
  - `designs` - Customer design projects with canvas data
  - `design_versions` - Version history for designs
  - `design_assets` - Uploaded images and assets
  - `render_jobs` - Export job tracking

  ### Templates
  - `templates` - Pre-designed templates for products
  - `template_categories` - Template organization

  ### Proofing System
  - `proof_links` - Shareable proof links
  - `proof_comments` - Comments and approval workflow

  ## Security
  - All tables have RLS enabled
  - Users can only access their own designs
  - Templates are public-read when published
  - Proof links use token-based access

  ## Important Notes
  1. This is additive-only, does not modify Phase 1 tables
  2. All foreign keys reference existing tables where applicable
  3. Design JSON stores complete Fabric.js canvas state
*/

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

-- Add design_id column to cart_items and order_items (optional, for linking)
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

-- Create indexes for better query performance
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

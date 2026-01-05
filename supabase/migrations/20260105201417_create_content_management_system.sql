/*
  # Content Management System

  1. New Tables
    - `profiles`
      - `user_id` (uuid, primary key, references auth.users)
      - `role` (text, default 'user') - Values: 'user' or 'admin'
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `media_assets`
      - `id` (uuid, primary key)
      - `created_at` (timestamptz)
      - `created_by` (uuid, references auth.users)
      - `title` (text)
      - `alt_text` (text)
      - `tags` (text array)
      - `mime_type` (text)
      - `byte_size` (integer)
      - `storage_path` (text) - Path in Supabase Storage
      - `url` (text) - Public URL
      - `status` (text, default 'active') - Values: 'active' or 'archived'

    - `content_slots`
      - `id` (uuid, primary key)
      - `slot_key` (text, unique) - e.g., 'home.hero.background'
      - `draft_value` (jsonb) - Draft content including image refs and text
      - `published_value` (jsonb) - Currently published content
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      - `updated_by` (uuid, references auth.users)

    - `content_versions`
      - `id` (uuid, primary key)
      - `version` (integer)
      - `published_snapshot` (jsonb) - Full snapshot of all slot_key → published_value
      - `published_at` (timestamptz)
      - `published_by` (uuid, references auth.users)
      - `notes` (text)

  2. Security
    - Enable RLS on all tables
    - Profiles: users can read their own, only admins can modify roles
    - Media assets: admins can do everything, users can only read active assets
    - Content slots: everyone can read published_value, only admins can manage drafts
    - Content versions: admin-only access

  3. Important Notes
    - Admin role is stored in profiles table
    - All content changes go through draft → publish workflow
    - Rollback capability via content_versions snapshots
    - Media deletion is soft (archived status)
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create media_assets table
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

-- Create content_slots table
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

-- Create content_versions table
CREATE TABLE IF NOT EXISTS content_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  version integer NOT NULL,
  published_snapshot jsonb NOT NULL,
  published_at timestamptz DEFAULT now(),
  published_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  notes text DEFAULT ''
);

ALTER TABLE content_versions ENABLE ROW LEVEL SECURITY;

-- Create helper function to check if user is admin
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

-- Profiles RLS Policies
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

-- Media Assets RLS Policies
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

-- Content Slots RLS Policies
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

-- Content Versions RLS Policies
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

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_media_assets_status ON media_assets(status);
CREATE INDEX IF NOT EXISTS idx_media_assets_created_by ON media_assets(created_by);
CREATE INDEX IF NOT EXISTS idx_content_slots_slot_key ON content_slots(slot_key);
CREATE INDEX IF NOT EXISTS idx_content_versions_version ON content_versions(version);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- Insert default content slots for existing site areas
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

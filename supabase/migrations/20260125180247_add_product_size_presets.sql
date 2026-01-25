/*
  # Add Product Size Presets

  ## New Tables
  
  ### `product_size_presets`
  - `id` (uuid, primary key) - Unique identifier
  - `product_id` (uuid, foreign key) - Links to products table
  - `category_slug` (text) - Category identifier for grouping (e.g., 'yard-signs', 'banners')
  - `name` (text) - Display name (e.g., "Standard Yard Sign", "Large Banner")
  - `width` (numeric) - Width in inches
  - `height` (numeric) - Height in inches
  - `unit` (text) - Unit of measurement (default: 'inches')
  - `is_default` (boolean) - Whether this is the default/recommended size
  - `display_order` (integer) - Sort order in UI
  - `guidance_text` (text) - Helper text explaining when to use this size
  - `is_active` (boolean) - Whether this preset is available
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ## Security
  - Enable RLS on `product_size_presets` table
  - Public can view active presets
  - Only admins can manage presets
*/

-- Product Size Presets Table
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

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_product_size_presets_product ON product_size_presets(product_id);
CREATE INDEX IF NOT EXISTS idx_product_size_presets_category ON product_size_presets(category_slug);

-- Add viewing distance guidance table for legibility calculations
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

-- Insert default viewing distance guideline
INSERT INTO viewing_distance_guidelines (category_slug, guideline_text, inches_per_foot)
VALUES ('all', 'Recommended letter height: 1 inch per 10 feet of viewing distance', 0.1)
ON CONFLICT DO NOTHING;

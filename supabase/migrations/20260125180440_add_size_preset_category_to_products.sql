/*
  # Add Size Preset Category to Products

  ## Changes
  
  ### Products Table
  - Add `size_preset_category` (text) - References the category slug from sizePresets.ts
    This field determines which set of size presets to show for this product

  ## Notes
  - This is a non-breaking change that adds metadata to products
  - Existing products will have null values (no size presets)
  - Products can optionally specify a size preset category to enable size selection UI
*/

-- Add size preset category field to products
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'size_preset_category'
  ) THEN
    ALTER TABLE products ADD COLUMN size_preset_category text;
  END IF;
END $$;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_products_size_preset_category ON products(size_preset_category);

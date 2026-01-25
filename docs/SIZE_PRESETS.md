# Product Size Presets Feature

## Overview

The size presets feature provides standardized, industry-standard size options for various sign products, helping customers choose the right dimensions and preventing sizing mistakes.

## What's Included

### 1. **Comprehensive Size Libraries**
Presets for all major product categories:
- **Yard Signs (Coroplast)**: 12"×18", 18"×24" (default), 24"×36"
- **Yard Sign Riders**: 4"×24", 6"×18" (default), 6"×24"
- **Banners (Vinyl)**: 2'×4' through 4'×10', with 3'×6' as default
- **Event Backdrops**: 8'×8', 8'×10' (default), 10'×10'
- **Posters**: 11"×17", 18"×24" (default), 24"×36"
- **Foam Boards**: 20"×30" (default), 24"×36"
- **Rigid Signs**: 12"×18" through 48"×96"
- **Car Magnets**: 12"×18", 12"×24" (default), 18"×24"
- **Decals**: Rectangle and die-cut options
- **A-Frame Inserts**: 18"×24" (default), 24"×36"
- **Feather/Teardrop Flags**: Small (8'), Medium (10'), Large (12-14')

### 2. **Smart Guidance System**
Each size preset includes:
- **Default recommendations** (marked with ✅)
- **Usage guidance** explaining when to use each size
- **Compatibility notes** (e.g., "fits standard H-stakes")
- **Custom size warnings** for non-standard dimensions

### 3. **Legibility Calculator**
Built-in tool that helps customers determine appropriate text sizes:
- Rule of thumb: 1 inch letter height per 10 feet viewing distance
- Interactive calculator for custom viewing distances
- Real-time recommendations

## How to Use

### For Administrators

#### 1. Assign Size Presets to Products

When creating or editing a product in the admin panel:

1. Go to **Admin Dashboard** → **Products**
2. Create or edit a product
3. Select a **Size Preset Category** from the dropdown
4. Choose from categories like:
   - Yard Signs (Coroplast)
   - Banners (Vinyl)
   - Car Magnets
   - Die-Cut Stickers
   - And many more...
5. Optionally enable **Allow Custom Size** to let customers enter their own dimensions
6. Save the product

#### 2. Size Preset Fields

- **Size Preset Category**: Links to a predefined set of standard sizes
- **Allow Custom Size**: When checked, customers can enter custom dimensions in addition to presets
- **Min/Max Dimensions**: Still respected when custom sizing is enabled

### For Customers

When ordering a product with size presets:

1. Navigate to the product page
2. See the **Size Options** dropdown with standard sizes
3. Read the guidance text for each size to choose the best fit
4. Optionally select "Custom Size" if needed (and enabled by admin)
5. Use the **Legibility Guide** to determine appropriate text sizes
6. Enter viewing distance to calculate recommended letter height

## Technical Implementation

### Database Structure

#### Tables Created
- `product_size_presets`: Stores preset definitions (future use for custom presets)
- `viewing_distance_guidelines`: Stores legibility calculation rules

#### Product Schema Updates
- Added `size_preset_category` field to products table
- Non-breaking change: existing products work without size presets

### Components

#### `SizeSelector` Component
Location: `/src/components/SizeSelector.tsx`

Features:
- Dropdown with all available size presets
- Custom size inputs (when enabled)
- Guidance text for each preset
- Warning messages for custom sizes
- Legibility calculator with viewing distance input

#### Size Presets Utility
Location: `/src/lib/sizePresets.ts`

Exports:
- `STANDARD_SIZE_PRESETS`: Complete library of size definitions
- `getSizePresetsForCategory()`: Get presets for a specific category
- `getDefaultSizeForCategory()`: Get the default size for a category
- `calculateRecommendedLetterHeight()`: Calculate letter height for viewing distance
- `formatDimensions()`: Format dimensions for display

### Integration Points

The size selector is automatically used on:
- **Product Detail Pages**: When a product has a size_preset_category assigned
- **Design Editor**: Can be integrated for size selection during design creation

### Data Structure

Each size preset category includes:
```typescript
{
  categorySlug: string;           // Unique identifier
  categoryName: string;           // Display name
  presets: SizePreset[];         // Array of size options
  aspectRatioLocked?: boolean;   // Lock aspect ratio
  customSizeWarning?: string;    // Warning for custom sizes
}
```

Each size preset includes:
```typescript
{
  name: string;              // Display name (e.g., "18" × 24" (Standard)")
  width: number;             // Width in inches
  height: number;            // Height in inches
  unit: string;              // Measurement unit
  isDefault: boolean;        // Default selection
  displayOrder: number;      // Sort order
  guidanceText: string;      // Helper text
}
```

## Benefits

### For Customers
- **Eliminates guesswork** with industry-standard sizes
- **Prevents mistakes** with hardware compatibility notes
- **Saves time** with quick preset selection
- **Ensures readability** with legibility calculator
- **Professional results** following best practices

### For Business
- **Reduces support tickets** from sizing questions
- **Increases conversion** with clear guidance
- **Standardizes production** with common sizes
- **Material efficiency** with optimized dimensions
- **Professional appearance** with expert recommendations

## Future Enhancements

Potential additions:
- Save custom size presets per product
- Industry-specific preset libraries
- Bulk import of size presets
- Template size recommendations
- Price calculations based on preset tiers
- Visual size comparisons
- Integration with material waste calculator

## Best Practices

### For Admins
1. Always assign a size preset category to products when available
2. Enable custom sizing only when truly needed
3. Set appropriate min/max dimensions for custom sizes
4. Keep preset categories aligned with your product inventory

### For Customers
1. Start with standard presets before considering custom sizes
2. Use the legibility calculator for text-heavy designs
3. Pay attention to compatibility notes (e.g., H-stakes, frames)
4. Consider viewing distance when selecting sizes

## Support

For questions or issues with size presets:
- Check the guidance text for each size option
- Review the custom size warnings before proceeding
- Contact support if unsure about hardware compatibility
- Refer to resources page for detailed material guides

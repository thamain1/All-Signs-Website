# Size Preset Examples & Quick Start

## Quick Start Guide

Follow these steps to start using size presets immediately:

### Step 1: Create Product Categories

First, create categories that match your product types. Go to **Admin Dashboard → Products → Categories** and create:

1. **Yard Signs**
   - Name: Yard Signs
   - Slug: yard-signs
   - Description: Coroplast yard signs for outdoor use

2. **Banners**
   - Name: Vinyl Banners
   - Slug: banners
   - Description: Durable vinyl banners for indoor and outdoor use

3. **Vehicle Graphics**
   - Name: Vehicle Graphics
   - Slug: vehicle-graphics
   - Description: Car magnets and vehicle wraps

### Step 2: Create Products with Size Presets

Here are example products you can create with their size preset assignments:

#### Example 1: Standard Yard Sign

**Product Details:**
- Name: `Coroplast Yard Sign`
- Slug: `coroplast-yard-sign`
- Category: Yard Signs
- **Size Preset Category**: `yard-signs` ← Select "Yard Signs (Coroplast)"
- Allow Custom Size: ✓ (enabled)
- Production Days: 1-3 days

**Benefits:**
- Customers see 12"×18", 18"×24" (default), and 24"×36" options
- Built-in guidance: "18×24 fits standard H-stakes perfectly"
- Custom size warning if they choose non-standard dimensions

#### Example 2: Vinyl Banner

**Product Details:**
- Name: `Custom Vinyl Banner`
- Slug: `vinyl-banner`
- Category: Banners
- **Size Preset Category**: `banners` ← Select "Banners (Vinyl)"
- Allow Custom Size: ✓ (enabled)
- Production Days: 2-5 days

**Benefits:**
- Shows 7 standard banner sizes (2'×4' through 4'×10')
- Highlights 3'×6' as most popular
- Guidance like "Great for porches, fences, and events"

#### Example 3: Car Magnet

**Product Details:**
- Name: `Vehicle Door Magnet`
- Slug: `car-magnet`
- Category: Vehicle Graphics
- **Size Preset Category**: `car-magnets` ← Select "Car Magnets"
- Allow Custom Size: ☐ (disabled - force standard sizes)
- Production Days: 1-2 days

**Benefits:**
- Limited to 3 standard sizes: 12"×18", 12"×24" (default), 18"×24"
- No custom sizing to prevent ordering magnets that won't fit doors
- Clear guidance on which size fits which vehicle type

#### Example 4: Die-Cut Sticker

**Product Details:**
- Name: `Custom Die-Cut Sticker`
- Slug: `die-cut-sticker`
- Category: Decals
- **Size Preset Category**: `decals-diecut` ← Select "Die-Cut Stickers"
- Allow Custom Size: ✓ (enabled with warning)
- Production Days: 3-5 days

**Benefits:**
- Shows 7 size options from 3" to 12" (longest edge)
- 5" selected as default (most versatile)
- Warning: "Die-cut pricing based on longest edge dimension"

#### Example 5: Trade Show Backdrop

**Product Details:**
- Name: `Event Backdrop Banner`
- Slug: `event-backdrop`
- Category: Trade Show
- **Size Preset Category**: `event-backdrops` ← Select "Event Backdrops"
- Allow Custom Size: ☐ (disabled - standard sizes only)
- Production Days: 3-7 days

**Benefits:**
- Shows 8'×8', 8'×10' (default), and 10'×10'
- Standard sizes ensure compatibility with common display systems
- No custom sizing to prevent ordering incompatible sizes

## Available Size Preset Categories

When creating products, you can assign these preset categories:

### Sign Products
- `yard-signs` - Yard Signs (Coroplast)
- `yard-sign-riders` - Yard Sign Riders
- `rigid-signs` - Rigid Signs (PVC/ACM/Metal)
- `aframe-inserts` - A-Frame/Sandwich Board Inserts

### Banners & Flags
- `banners` - Banners (Vinyl)
- `event-backdrops` - Event Backdrops
- `feather-flags` - Feather Flags
- `teardrop-flags` - Teardrop Flags

### Print Products
- `posters` - Posters
- `foam-boards` - Foam Boards

### Vehicle Graphics
- `car-magnets` - Car Magnets

### Decals & Stickers
- `decals-rectangle` - Window/Glass Decals (Rectangle)
- `decals-diecut` - Die-Cut Stickers

## Testing the Feature

### As a Customer:

1. Visit a product page that has a size preset category assigned
2. Look for the "Size Options" section with a dropdown
3. Select different sizes and read the guidance text
4. Try the "Custom Size" option if enabled
5. Use the legibility calculator:
   - Enter viewing distance (e.g., 50 feet)
   - See recommended letter height (e.g., 5 inches)

### As an Admin:

1. Go to Admin Dashboard → Products
2. Edit an existing product or create a new one
3. Select a "Size Preset Category" from the dropdown
4. Save and view the product page to see the size selector
5. Toggle "Allow Custom Size" to see the different behaviors

## Real-World Usage Examples

### Scenario 1: Real Estate Agent Orders Yard Signs

Customer visits "Coroplast Yard Sign" product:
- Sees 18"×24" pre-selected (fits H-stakes)
- Reads: "Standard yard sign — fits H-stakes perfectly, most popular size"
- Quickly orders without sizing confusion
- Gets the right size for standard hardware

### Scenario 2: Small Business Orders Banner

Customer needs a banner for their storefront:
- Sees multiple sizes with clear descriptions
- Reads: "3'×6' - Great for porches, fences, and events — most popular size"
- Uses legibility calculator: 30 feet viewing distance = 3" letters
- Confidently selects appropriate size for their needs

### Scenario 3: Political Campaign Orders Custom Size

Customer needs a unique size for a specific location:
- Starts with standard 24"×36" preset
- Realizes they need slightly different dimensions
- Selects "Custom Size" option
- Enters 20"×30" with custom sizing enabled
- Sees warning about non-standard dimensions
- Proceeds with confidence, knowing it's non-standard

## Tips for Success

### For Best Customer Experience:

1. **Always assign size presets** to products where standard sizes exist
2. **Enable custom sizing sparingly** - only when truly needed
3. **Use clear product descriptions** that complement size guidance
4. **Set appropriate min/max values** for custom sizes
5. **Test the customer flow** before launching new products

### For Product Organization:

1. **Group related products** into appropriate categories
2. **Use consistent naming** (e.g., all yard signs start with "Yard Sign")
3. **Keep descriptions focused** on what makes each product unique
4. **Update production times** to match realistic timelines

### Common Patterns:

- **Standard-only products** (car magnets, A-frame inserts): Disable custom sizing
- **Flexible products** (banners, signs): Enable custom sizing with presets
- **Precision products** (die-cut stickers): Show presets but allow custom with warnings
- **Large format** (event backdrops): Standard sizes only for equipment compatibility

## Next Steps

1. Create your first product with size presets
2. Test the customer experience on the product page
3. Gather feedback from your first few orders
4. Adjust preset selections and custom size settings as needed
5. Expand to more products once comfortable with the system

## Support Resources

- **Full Documentation**: See `SIZE_PRESETS.md` for technical details
- **Admin Guide**: `ADMIN_SETUP.md` for general admin features
- **Content Management**: `CONTENT_ADMIN.md` for managing site content

## Troubleshooting

**Q: Size presets aren't showing on my product page**
- A: Make sure you selected a "Size Preset Category" in the product admin and saved

**Q: Custom size option isn't available**
- A: Enable "Allow Custom Size" checkbox in the product settings

**Q: I need a different set of sizes**
- A: Contact development to add new preset categories or use custom sizing

**Q: Guidance text seems wrong for my product**
- A: Use product description field to add product-specific notes

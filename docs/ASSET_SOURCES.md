# Asset Sources

This document provides attribution and source information for all stock images used in the All Signs NC website.

## Image Attribution

All images are sourced from **Lorem Picsum** (https://picsum.photos/), which provides free placeholder images from Unsplash. These images are free to use under the Unsplash License.

## Image Inventory

### Hero Images

| Filename | Dimensions | Usage | Original Source |
|----------|------------|-------|-----------------|
| `hero-print-studio-1600.webp` | 1600×900 | Homepage hero background (desktop) | Lorem Picsum |
| `hero-print-studio-1000.webp` | 1000×600 | Homepage hero background (mobile/tablet) | Lorem Picsum |

### Category Images

| Filename | Dimensions | Usage | Original Source |
|----------|------------|-------|-----------------|
| `category-banners-900.webp` | 900×600 | Banners category card | Lorem Picsum |
| `category-banners-600.webp` | 600×400 | Banners category card (small screens) | Lorem Picsum |
| `category-yard-signs-900.webp` | 900×600 | Yard Signs category card | Lorem Picsum |
| `category-yard-signs-600.webp` | 600×400 | Yard Signs category card (small screens) | Lorem Picsum |
| `category-rigid-signs-900.webp` | 900×600 | Rigid Signs category card | Lorem Picsum |
| `category-rigid-signs-600.webp` | 600×400 | Rigid Signs category card (small screens) | Lorem Picsum |
| `category-decals-900.webp` | 900×600 | Decals & Stickers category card | Lorem Picsum |
| `category-decals-600.webp` | 600×400 | Decals & Stickers category card (small screens) | Lorem Picsum |
| `category-vehicle-900.webp` | 900×600 | Vehicle Graphics category card | Lorem Picsum |
| `category-vehicle-600.webp` | 600×400 | Vehicle Graphics category card (small screens) | Lorem Picsum |
| `category-flags-900.webp` | 900×600 | Flags category card | Lorem Picsum |
| `category-flags-600.webp` | 600×400 | Flags category card (small screens) | Lorem Picsum |
| `category-trade-show-900.webp` | 900×600 | Trade Show category card | Lorem Picsum |
| `category-trade-show-600.webp` | 600×400 | Trade Show category card (small screens) | Lorem Picsum |

### Supporting Images

| Filename | Dimensions | Usage | Original Source |
|----------|------------|-------|-----------------|
| `chatgpt_image_jan_5,_2026,_01_37_40_pm.png` | Custom | Guarantee section header image | AI Generated |
| `about-quality.webp` | 800×600 | Quality/materials section (reserved) | Lorem Picsum |

## Image Format & Optimization

All images have been:
- Converted to WebP format for optimal performance
- Optimized at 85% quality
- Generated in multiple sizes for responsive loading
- Configured with proper `srcset` and `sizes` attributes for automatic selection

## Responsive Image Implementation

Images use the HTML `<picture>` element with:
- WebP format support via `<source>` tags
- Responsive sizing via `srcset` attribute
- Appropriate `sizes` attributes based on viewport width
- Fallback `<img>` tag for older browsers
- Descriptive `alt` text for accessibility
- `loading="lazy"` for performance (except hero images)

## License Information

**Lorem Picsum**: All photos published on Picsum are licensed under CC0 1.0 Universal (CC0 1.0) Public Domain Dedication. This means:
- You can copy, modify, and distribute the images, even for commercial purposes
- All without asking permission
- No attribution is required (though appreciated)

**Original Source**: Lorem Picsum aggregates images from Unsplash, which are provided under the Unsplash License (https://unsplash.com/license).

## Future Considerations

For production use, consider:
1. Replacing placeholder images with actual professional photography specific to the sign printing industry
2. Commissioning custom photography showcasing real products and facilities
3. Ensuring all images accurately represent the brand and product offerings
4. Maintaining consistent visual style across all imagery
5. Updating this documentation when images are replaced

## Notes

- All images are stored in `/public/images/stock/`
- Images are served directly from the public directory (no processing needed at runtime)
- WebP format provides ~30% smaller file sizes compared to JPEG while maintaining quality
- Responsive images ensure optimal performance across all devices

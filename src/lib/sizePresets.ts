export type SizePreset = {
  name: string;
  width: number;
  height: number;
  unit: string;
  isDefault: boolean;
  displayOrder: number;
  guidanceText: string;
};

export type CategorySizePresets = {
  categorySlug: string;
  categoryName: string;
  presets: SizePreset[];
  aspectRatioLocked?: boolean;
  customSizeWarning?: string;
};

export const STANDARD_SIZE_PRESETS: CategorySizePresets[] = [
  {
    categorySlug: 'yard-signs',
    categoryName: 'Yard Signs (Coroplast)',
    presets: [
      {
        name: '12" × 18" (Small)',
        width: 12,
        height: 18,
        unit: 'inches',
        isDefault: false,
        displayOrder: 1,
        guidanceText: 'Small yard or directional signs, perfect for close-range viewing',
      },
      {
        name: '18" × 24" (Standard)',
        width: 18,
        height: 24,
        unit: 'inches',
        isDefault: true,
        displayOrder: 2,
        guidanceText: 'Standard yard sign — fits H-stakes perfectly, most popular size',
      },
      {
        name: '24" × 36" (Large)',
        width: 24,
        height: 36,
        unit: 'inches',
        isDefault: false,
        displayOrder: 3,
        guidanceText: 'Large format for higher street visibility and impact',
      },
    ],
    aspectRatioLocked: true,
    customSizeWarning: 'Custom sizes may not fit standard H-stakes',
  },
  {
    categorySlug: 'yard-sign-riders',
    categoryName: 'Yard Sign Riders',
    presets: [
      {
        name: '4" × 24"',
        width: 4,
        height: 24,
        unit: 'inches',
        isDefault: false,
        displayOrder: 1,
        guidanceText: 'Narrow rider for phone numbers or web addresses',
      },
      {
        name: '6" × 18"',
        width: 6,
        height: 18,
        unit: 'inches',
        isDefault: true,
        displayOrder: 2,
        guidanceText: 'Standard rider size for additional messaging',
      },
      {
        name: '6" × 24"',
        width: 6,
        height: 24,
        unit: 'inches',
        isDefault: false,
        displayOrder: 3,
        guidanceText: 'Extended rider for more detailed information',
      },
    ],
  },
  {
    categorySlug: 'banners',
    categoryName: 'Banners (Vinyl)',
    presets: [
      {
        name: '2\' × 4\'',
        width: 24,
        height: 48,
        unit: 'inches',
        isDefault: false,
        displayOrder: 1,
        guidanceText: 'Compact banner for tables or small displays',
      },
      {
        name: '2\' × 6\'',
        width: 24,
        height: 72,
        unit: 'inches',
        isDefault: false,
        displayOrder: 2,
        guidanceText: 'Vertical banner for doors or narrow spaces',
      },
      {
        name: '2\' × 8\'',
        width: 24,
        height: 96,
        unit: 'inches',
        isDefault: false,
        displayOrder: 3,
        guidanceText: 'Tall vertical banner for entrances',
      },
      {
        name: '3\' × 6\' (Most Popular)',
        width: 36,
        height: 72,
        unit: 'inches',
        isDefault: true,
        displayOrder: 4,
        guidanceText: 'Great for porches, fences, and events — most popular size',
      },
      {
        name: '3\' × 10\'',
        width: 36,
        height: 120,
        unit: 'inches',
        isDefault: false,
        displayOrder: 5,
        guidanceText: 'Large vertical banner for maximum impact',
      },
      {
        name: '4\' × 8\'',
        width: 48,
        height: 96,
        unit: 'inches',
        isDefault: false,
        displayOrder: 6,
        guidanceText: 'Standard large banner for buildings and events',
      },
      {
        name: '4\' × 10\'',
        width: 48,
        height: 120,
        unit: 'inches',
        isDefault: false,
        displayOrder: 7,
        guidanceText: 'Extra large banner for high visibility',
      },
    ],
    customSizeWarning: 'Custom sizes available — consider grommets every 2 feet for support',
  },
  {
    categorySlug: 'event-backdrops',
    categoryName: 'Event Backdrops',
    presets: [
      {
        name: '8\' × 8\'',
        width: 96,
        height: 96,
        unit: 'inches',
        isDefault: false,
        displayOrder: 1,
        guidanceText: 'Square backdrop perfect for photo booths',
      },
      {
        name: '8\' × 10\'',
        width: 96,
        height: 120,
        unit: 'inches',
        isDefault: true,
        displayOrder: 2,
        guidanceText: 'Standard backdrop for events and trade shows',
      },
      {
        name: '10\' × 10\'',
        width: 120,
        height: 120,
        unit: 'inches',
        isDefault: false,
        displayOrder: 3,
        guidanceText: 'Large square backdrop for spacious displays',
      },
    ],
  },
  {
    categorySlug: 'posters',
    categoryName: 'Posters',
    presets: [
      {
        name: '11" × 17"',
        width: 11,
        height: 17,
        unit: 'inches',
        isDefault: false,
        displayOrder: 1,
        guidanceText: 'Tabloid size, great for flyers and handouts',
      },
      {
        name: '18" × 24"',
        width: 18,
        height: 24,
        unit: 'inches',
        isDefault: true,
        displayOrder: 2,
        guidanceText: 'Standard poster size for indoor displays',
      },
      {
        name: '24" × 36"',
        width: 24,
        height: 36,
        unit: 'inches',
        isDefault: false,
        displayOrder: 3,
        guidanceText: 'Large poster for maximum visibility',
      },
    ],
  },
  {
    categorySlug: 'foam-boards',
    categoryName: 'Foam Boards',
    presets: [
      {
        name: '20" × 30" (Most Popular)',
        width: 20,
        height: 30,
        unit: 'inches',
        isDefault: true,
        displayOrder: 1,
        guidanceText: 'Most popular size for presentations and displays',
      },
      {
        name: '24" × 36"',
        width: 24,
        height: 36,
        unit: 'inches',
        isDefault: false,
        displayOrder: 2,
        guidanceText: 'Large format for impactful presentations',
      },
    ],
  },
  {
    categorySlug: 'rigid-signs',
    categoryName: 'Rigid Signs (PVC/ACM/Metal)',
    presets: [
      {
        name: '12" × 18"',
        width: 12,
        height: 18,
        unit: 'inches',
        isDefault: false,
        displayOrder: 1,
        guidanceText: 'Small rigid sign for parking or directional use',
      },
      {
        name: '18" × 24"',
        width: 18,
        height: 24,
        unit: 'inches',
        isDefault: true,
        displayOrder: 2,
        guidanceText: 'Standard rigid sign for general purpose use',
      },
      {
        name: '24" × 36"',
        width: 24,
        height: 36,
        unit: 'inches',
        isDefault: false,
        displayOrder: 3,
        guidanceText: 'Large rigid sign for high visibility',
      },
      {
        name: '24" × 48"',
        width: 24,
        height: 48,
        unit: 'inches',
        isDefault: false,
        displayOrder: 4,
        guidanceText: 'Wide format for storefront or informational signs',
      },
      {
        name: '48" × 96" (4\' × 8\')',
        width: 48,
        height: 96,
        unit: 'inches',
        isDefault: false,
        displayOrder: 5,
        guidanceText: 'Full sheet size for building signs and billboards',
      },
    ],
  },
  {
    categorySlug: 'car-magnets',
    categoryName: 'Car Magnets',
    presets: [
      {
        name: '12" × 18"',
        width: 12,
        height: 18,
        unit: 'inches',
        isDefault: false,
        displayOrder: 1,
        guidanceText: 'Compact magnet for car doors',
      },
      {
        name: '12" × 24" (Common Default)',
        width: 12,
        height: 24,
        unit: 'inches',
        isDefault: true,
        displayOrder: 2,
        guidanceText: 'Standard car door magnet — fits most vehicles',
      },
      {
        name: '18" × 24"',
        width: 18,
        height: 24,
        unit: 'inches',
        isDefault: false,
        displayOrder: 3,
        guidanceText: 'Large magnet for trucks and vans',
      },
    ],
    customSizeWarning: 'Ensure size fits within flat surface area of vehicle door',
  },
  {
    categorySlug: 'decals-rectangle',
    categoryName: 'Window/Glass Decals (Rectangle)',
    presets: [
      {
        name: '12" × 12" (Square)',
        width: 12,
        height: 12,
        unit: 'inches',
        isDefault: false,
        displayOrder: 1,
        guidanceText: 'Small square decal for windows',
      },
      {
        name: '12" × 18"',
        width: 12,
        height: 18,
        unit: 'inches',
        isDefault: true,
        displayOrder: 2,
        guidanceText: 'Standard window decal size',
      },
      {
        name: '18" × 18" (Square)',
        width: 18,
        height: 18,
        unit: 'inches',
        isDefault: false,
        displayOrder: 3,
        guidanceText: 'Medium square decal',
      },
      {
        name: '24" × 24" (Square)',
        width: 24,
        height: 24,
        unit: 'inches',
        isDefault: false,
        displayOrder: 4,
        guidanceText: 'Large square decal for storefronts',
      },
      {
        name: '24" × 36"',
        width: 24,
        height: 36,
        unit: 'inches',
        isDefault: false,
        displayOrder: 5,
        guidanceText: 'Extra large window decal',
      },
    ],
  },
  {
    categorySlug: 'decals-diecut',
    categoryName: 'Die-Cut Stickers',
    presets: [
      {
        name: '3" (Longest Edge)',
        width: 3,
        height: 3,
        unit: 'inches',
        isDefault: false,
        displayOrder: 1,
        guidanceText: 'Small sticker for laptops and phones',
      },
      {
        name: '4" (Longest Edge)',
        width: 4,
        height: 4,
        unit: 'inches',
        isDefault: false,
        displayOrder: 2,
        guidanceText: 'Popular size for branding and giveaways',
      },
      {
        name: '5" (Longest Edge)',
        width: 5,
        height: 5,
        unit: 'inches',
        isDefault: true,
        displayOrder: 3,
        guidanceText: 'Versatile size for most applications',
      },
      {
        name: '6" (Longest Edge)',
        width: 6,
        height: 6,
        unit: 'inches',
        isDefault: false,
        displayOrder: 4,
        guidanceText: 'Medium sticker for visibility',
      },
      {
        name: '8" (Longest Edge)',
        width: 8,
        height: 8,
        unit: 'inches',
        isDefault: false,
        displayOrder: 5,
        guidanceText: 'Large sticker for bumpers and walls',
      },
      {
        name: '10" (Longest Edge)',
        width: 10,
        height: 10,
        unit: 'inches',
        isDefault: false,
        displayOrder: 6,
        guidanceText: 'Extra large for bold statements',
      },
      {
        name: '12" (Longest Edge)',
        width: 12,
        height: 12,
        unit: 'inches',
        isDefault: false,
        displayOrder: 7,
        guidanceText: 'Maximum size for die-cut stickers',
      },
    ],
    customSizeWarning: 'Die-cut pricing based on longest edge dimension',
  },
  {
    categorySlug: 'aframe-inserts',
    categoryName: 'A-Frame/Sandwich Board Inserts',
    presets: [
      {
        name: '18" × 24"',
        width: 18,
        height: 24,
        unit: 'inches',
        isDefault: true,
        displayOrder: 1,
        guidanceText: 'Standard A-frame insert — verify frame compatibility',
      },
      {
        name: '24" × 36"',
        width: 24,
        height: 36,
        unit: 'inches',
        isDefault: false,
        displayOrder: 2,
        guidanceText: 'Large A-frame insert — verify frame compatibility',
      },
    ],
    customSizeWarning: 'Must match your A-frame model dimensions',
  },
  {
    categorySlug: 'feather-flags',
    categoryName: 'Feather Flags',
    presets: [
      {
        name: 'Small (8\' Kit)',
        width: 24,
        height: 96,
        unit: 'inches',
        isDefault: false,
        displayOrder: 1,
        guidanceText: 'Compact flag for indoor use or limited space',
      },
      {
        name: 'Medium (10\' Kit)',
        width: 30,
        height: 120,
        unit: 'inches',
        isDefault: true,
        displayOrder: 2,
        guidanceText: 'Most popular size for sidewalk and event use',
      },
      {
        name: 'Large (12-14\' Kit)',
        width: 36,
        height: 144,
        unit: 'inches',
        isDefault: false,
        displayOrder: 3,
        guidanceText: 'Maximum visibility for outdoor events',
      },
    ],
    customSizeWarning: 'Size must match flag kit and pole system',
  },
  {
    categorySlug: 'teardrop-flags',
    categoryName: 'Teardrop Flags',
    presets: [
      {
        name: 'Small (8\' Kit)',
        width: 30,
        height: 96,
        unit: 'inches',
        isDefault: false,
        displayOrder: 1,
        guidanceText: 'Compact teardrop for indoor or close viewing',
      },
      {
        name: 'Medium (10\' Kit)',
        width: 36,
        height: 120,
        unit: 'inches',
        isDefault: true,
        displayOrder: 2,
        guidanceText: 'Standard teardrop flag for events',
      },
      {
        name: 'Large (12-14\' Kit)',
        width: 42,
        height: 144,
        unit: 'inches',
        isDefault: false,
        displayOrder: 3,
        guidanceText: 'Large teardrop for maximum impact',
      },
    ],
    customSizeWarning: 'Size must match flag kit and pole system',
  },
];

export const LEGIBILITY_GUIDELINE = {
  text: 'Recommended letter height: 1 inch per 10 feet of viewing distance',
  inchesPerFoot: 0.1,
  example: 'For viewing at 50 feet, use 5-inch tall letters',
};

export function getSizePresetsForCategory(categorySlug: string): CategorySizePresets | undefined {
  return STANDARD_SIZE_PRESETS.find((preset) => preset.categorySlug === categorySlug);
}

export function getDefaultSizeForCategory(categorySlug: string): SizePreset | undefined {
  const categoryPresets = getSizePresetsForCategory(categorySlug);
  return categoryPresets?.presets.find((preset) => preset.isDefault);
}

export function calculateRecommendedLetterHeight(viewingDistanceFeet: number): number {
  return viewingDistanceFeet * LEGIBILITY_GUIDELINE.inchesPerFoot;
}

export function formatDimensions(width: number, height: number, unit: string = 'inches'): string {
  if (unit === 'inches') {
    if (width >= 12 && height >= 12) {
      const widthFeet = Math.floor(width / 12);
      const heightFeet = Math.floor(height / 12);
      const widthInches = width % 12;
      const heightInches = height % 12;

      if (widthInches === 0 && heightInches === 0) {
        return `${widthFeet}' × ${heightFeet}'`;
      }
    }
    return `${width}" × ${height}"`;
  }
  return `${width} × ${height} ${unit}`;
}

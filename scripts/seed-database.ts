import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedDatabase() {
  console.log('Starting database seed...');

  const categories = [
    { name: 'Vinyl Banners', slug: 'banners', description: 'Durable vinyl banners for indoor and outdoor use', display_order: 1 },
    { name: 'Yard Signs', slug: 'yard-signs', description: 'Corrugated plastic signs perfect for lawns and events', display_order: 2 },
    { name: 'Rigid Signs', slug: 'rigid-signs', description: 'PVC, aluminum, acrylic, and foam board signs', display_order: 3 },
    { name: 'Decals & Stickers', slug: 'decals-stickers', description: 'Custom vinyl decals and sticker sheets', display_order: 4 },
    { name: 'Vehicle Graphics', slug: 'vehicle-graphics', description: 'Magnets, decals, and lettering for vehicles', display_order: 5 },
    { name: 'Flags', slug: 'flags', description: 'Feather flags, teardrop flags, and more', display_order: 6 },
    { name: 'Trade Show & Events', slug: 'trade-show', description: 'Retractable banners, backdrops, and table covers', display_order: 7 },
    { name: 'Accessories & Hardware', slug: 'accessories', description: 'Stakes, stands, frames, and mounting hardware', display_order: 8 },
  ];

  const { data: categoryData, error: catError } = await supabase
    .from('product_categories')
    .insert(categories)
    .select();

  if (catError) {
    console.error('Error inserting categories:', catError);
    return;
  }

  console.log(`Inserted ${categoryData.length} categories`);

  const products = [
    {
      category_id: categoryData[0].id,
      name: 'Standard Vinyl Banner',
      slug: 'standard-vinyl-banner',
      description: 'High-quality 13oz vinyl banner with vibrant full-color printing. Perfect for outdoor events, retail displays, and promotions. Weather-resistant and durable.',
      short_description: 'Durable 13oz vinyl with full-color printing',
      allows_custom_size: true,
      min_width: 12,
      max_width: 192,
      min_height: 12,
      max_height: 96,
      production_days_min: 2,
      production_days_max: 4,
    },
    {
      category_id: categoryData[0].id,
      name: 'Mesh Vinyl Banner',
      slug: 'mesh-vinyl-banner',
      description: 'Wind-resistant mesh banner with perforated design. Ideal for outdoor use in windy conditions. Full-color printing on durable mesh material.',
      short_description: 'Wind-resistant mesh material for outdoor use',
      allows_custom_size: true,
      min_width: 24,
      max_width: 192,
      min_height: 24,
      max_height: 96,
      production_days_min: 2,
      production_days_max: 4,
    },
    {
      category_id: categoryData[1].id,
      name: 'Coroplast Yard Sign',
      slug: 'coroplast-yard-sign',
      description: 'Lightweight and durable corrugated plastic sign. Weather-resistant and perfect for real estate, political campaigns, and event signage.',
      short_description: 'Lightweight corrugated plastic for lawns',
      allows_custom_size: false,
      production_days_min: 1,
      production_days_max: 3,
    },
    {
      category_id: categoryData[2].id,
      name: 'PVC Sign Board',
      slug: 'pvc-sign-board',
      description: 'Rigid PVC board with high-quality printing. Perfect for indoor and outdoor signage. Lightweight yet durable with excellent print quality.',
      short_description: 'Rigid PVC board for indoor and outdoor',
      allows_custom_size: true,
      min_width: 6,
      max_width: 96,
      min_height: 6,
      max_height: 48,
      production_days_min: 2,
      production_days_max: 5,
    },
    {
      category_id: categoryData[2].id,
      name: 'Aluminum Sign',
      slug: 'aluminum-sign',
      description: 'Heavy-duty aluminum sign with weather-resistant coating. Ideal for long-term outdoor use. Professional appearance with vibrant colors.',
      short_description: 'Heavy-duty aluminum for outdoor use',
      allows_custom_size: true,
      min_width: 6,
      max_width: 48,
      min_height: 6,
      max_height: 36,
      production_days_min: 3,
      production_days_max: 5,
    },
    {
      category_id: categoryData[3].id,
      name: 'Vinyl Decals',
      slug: 'vinyl-decals',
      description: 'Custom die-cut vinyl decals. Durable adhesive vinyl perfect for windows, walls, vehicles, and more. Available in any shape.',
      short_description: 'Custom die-cut adhesive vinyl',
      allows_custom_size: true,
      min_width: 2,
      max_width: 48,
      min_height: 2,
      max_height: 48,
      production_days_min: 2,
      production_days_max: 4,
    },
    {
      category_id: categoryData[4].id,
      name: 'Vehicle Magnets',
      slug: 'vehicle-magnets',
      description: 'Flexible magnetic signs for vehicles. Easy to apply and remove. Weather-resistant with vibrant full-color printing.',
      short_description: 'Flexible magnetic signs for vehicles',
      allows_custom_size: true,
      min_width: 12,
      max_width: 24,
      min_height: 12,
      max_height: 24,
      production_days_min: 2,
      production_days_max: 4,
    },
    {
      category_id: categoryData[5].id,
      name: 'Feather Flag',
      slug: 'feather-flag',
      description: 'Eye-catching feather flag with pole and base. Perfect for outdoor advertising and events. Durable polyester fabric with vibrant printing.',
      short_description: 'Eye-catching outdoor advertising flag',
      allows_custom_size: false,
      production_days_min: 3,
      production_days_max: 5,
    },
    {
      category_id: categoryData[6].id,
      name: 'Retractable Banner Stand',
      slug: 'retractable-banner-stand',
      description: 'Professional retractable banner with stand. Easy setup and portable. Perfect for trade shows, events, and retail displays.',
      short_description: 'Portable retractable stand with banner',
      allows_custom_size: false,
      production_days_min: 3,
      production_days_max: 5,
    },
  ];

  const { data: productData, error: prodError } = await supabase
    .from('products')
    .insert(products)
    .select();

  if (prodError) {
    console.error('Error inserting products:', prodError);
    return;
  }

  console.log(`Inserted ${productData.length} products`);

  const allOptions: any[] = [];
  const allPricingRules: any[] = [];

  productData.forEach((product) => {
    if (product.slug === 'standard-vinyl-banner') {
      allOptions.push(
        { product_id: product.id, option_type: 'material', name: 'Material', value: '13oz Vinyl', description: 'Standard weight for most applications', price_modifier: 0, is_default: true, display_order: 1 },
        { product_id: product.id, option_type: 'material', name: 'Material', value: '18oz Vinyl', description: 'Heavy-duty for extreme conditions', price_modifier: 15, is_default: false, display_order: 2 },
        { product_id: product.id, option_type: 'finishing', name: 'Finishing', value: 'Grommets', description: 'Metal grommets every 2 feet', price_modifier: 0, is_default: true, display_order: 1 },
        { product_id: product.id, option_type: 'finishing', name: 'Finishing', value: 'Pole Pockets', description: 'Pockets for pole mounting', price_modifier: 10, is_default: false, display_order: 2 },
        { product_id: product.id, option_type: 'finishing', name: 'Finishing', value: 'Hems Only', description: 'Reinforced edges without hardware', price_modifier: 5, is_default: false, display_order: 3 }
      );

      allPricingRules.push(
        { product_id: product.id, base_price: 0, price_per_sqft: 2.50, min_quantity: 1, max_quantity: 2, discount_percent: 0 },
        { product_id: product.id, base_price: 0, price_per_sqft: 2.25, min_quantity: 3, max_quantity: 5, discount_percent: 0 },
        { product_id: product.id, base_price: 0, price_per_sqft: 2.00, min_quantity: 6, max_quantity: null, discount_percent: 0 }
      );
    }

    if (product.slug === 'coroplast-yard-sign') {
      allOptions.push(
        { product_id: product.id, option_type: 'size', name: 'Size', value: '18" x 24"', description: 'Standard yard sign size', price_modifier: 0, is_default: true, display_order: 1 },
        { product_id: product.id, option_type: 'size', name: 'Size', value: '24" x 18"', description: 'Horizontal orientation', price_modifier: 0, is_default: false, display_order: 2 },
        { product_id: product.id, option_type: 'addon', name: 'Add-on', value: 'No Stakes', description: 'Sign only', price_modifier: 0, is_default: true, display_order: 1 },
        { product_id: product.id, option_type: 'addon', name: 'Add-on', value: 'With Stakes', description: 'Includes wire stakes', price_modifier: 3, is_default: false, display_order: 2 }
      );

      allPricingRules.push(
        { product_id: product.id, base_price: 9.99, price_per_sqft: 0, min_quantity: 1, max_quantity: 9, discount_percent: 0 },
        { product_id: product.id, base_price: 8.99, price_per_sqft: 0, min_quantity: 10, max_quantity: 24, discount_percent: 0 },
        { product_id: product.id, base_price: 7.99, price_per_sqft: 0, min_quantity: 25, max_quantity: null, discount_percent: 0 }
      );
    }

    if (product.slug === 'pvc-sign-board' || product.slug === 'aluminum-sign') {
      allOptions.push(
        { product_id: product.id, option_type: 'material', name: 'Thickness', value: '3mm', description: 'Standard thickness', price_modifier: 0, is_default: true, display_order: 1 },
        { product_id: product.id, option_type: 'material', name: 'Thickness', value: '6mm', description: 'Extra thick', price_modifier: 20, is_default: false, display_order: 2 },
        { product_id: product.id, option_type: 'finishing', name: 'Mounting', value: 'No Holes', description: 'No mounting holes', price_modifier: 0, is_default: true, display_order: 1 },
        { product_id: product.id, option_type: 'finishing', name: 'Mounting', value: 'Pre-drilled Holes', description: 'Corner mounting holes', price_modifier: 5, is_default: false, display_order: 2 }
      );

      const basePrice = product.slug === 'aluminum-sign' ? 3.50 : 2.75;
      allPricingRules.push(
        { product_id: product.id, base_price: 0, price_per_sqft: basePrice, min_quantity: 1, max_quantity: 2, discount_percent: 0 },
        { product_id: product.id, base_price: 0, price_per_sqft: basePrice - 0.25, min_quantity: 3, max_quantity: null, discount_percent: 0 }
      );
    }

    if (product.slug === 'vinyl-decals') {
      allOptions.push(
        { product_id: product.id, option_type: 'material', name: 'Vinyl Type', value: 'Standard Vinyl', description: '3-5 year outdoor durability', price_modifier: 0, is_default: true, display_order: 1 },
        { product_id: product.id, option_type: 'material', name: 'Vinyl Type', value: 'Premium Vinyl', description: '7+ year outdoor durability', price_modifier: 10, is_default: false, display_order: 2 },
        { product_id: product.id, option_type: 'finishing', name: 'Cut Type', value: 'Die Cut', description: 'Cut to exact shape', price_modifier: 0, is_default: true, display_order: 1 },
        { product_id: product.id, option_type: 'finishing', name: 'Cut Type', value: 'Kiss Cut', description: 'Sticker on backing', price_modifier: 5, is_default: false, display_order: 2 }
      );

      allPricingRules.push(
        { product_id: product.id, base_price: 0, price_per_sqft: 4.00, min_quantity: 1, max_quantity: 10, discount_percent: 0 },
        { product_id: product.id, base_price: 0, price_per_sqft: 3.50, min_quantity: 11, max_quantity: null, discount_percent: 0 }
      );
    }

    if (product.slug === 'vehicle-magnets') {
      allOptions.push(
        { product_id: product.id, option_type: 'size', name: 'Size', value: '12" x 18"', description: 'Standard car door size', price_modifier: 0, is_default: true, display_order: 1 },
        { product_id: product.id, option_type: 'size', name: 'Size', value: '18" x 24"', description: 'Large car door size', price_modifier: 10, is_default: false, display_order: 2 },
        { product_id: product.id, option_type: 'material', name: 'Magnet Strength', value: '30 mil', description: 'Standard magnetic strength', price_modifier: 0, is_default: true, display_order: 1 }
      );

      allPricingRules.push(
        { product_id: product.id, base_price: 29.99, price_per_sqft: 0, min_quantity: 1, max_quantity: 1, discount_percent: 0 },
        { product_id: product.id, base_price: 27.99, price_per_sqft: 0, min_quantity: 2, max_quantity: null, discount_percent: 0 }
      );
    }

    if (product.slug === 'feather-flag') {
      allOptions.push(
        { product_id: product.id, option_type: 'size', name: 'Size', value: '8.5ft Tall', description: 'Small feather flag', price_modifier: 0, is_default: true, display_order: 1 },
        { product_id: product.id, option_type: 'size', name: 'Size', value: '11.5ft Tall', description: 'Medium feather flag', price_modifier: 20, is_default: false, display_order: 2 },
        { product_id: product.id, option_type: 'size', name: 'Size', value: '15ft Tall', description: 'Large feather flag', price_modifier: 40, is_default: false, display_order: 3 },
        { product_id: product.id, option_type: 'addon', name: 'Base', value: 'Ground Stake', description: 'For grass/soft ground', price_modifier: 0, is_default: true, display_order: 1 },
        { product_id: product.id, option_type: 'addon', name: 'Base', value: 'Cross Base', description: 'For hard surfaces', price_modifier: 30, is_default: false, display_order: 2 }
      );

      allPricingRules.push(
        { product_id: product.id, base_price: 89.99, price_per_sqft: 0, min_quantity: 1, max_quantity: null, discount_percent: 0 }
      );
    }

    if (product.slug === 'retractable-banner-stand') {
      allOptions.push(
        { product_id: product.id, option_type: 'size', name: 'Size', value: '33" x 79"', description: 'Standard retractable size', price_modifier: 0, is_default: true, display_order: 1 },
        { product_id: product.id, option_type: 'size', name: 'Size', value: '47" x 79"', description: 'Wide retractable size', price_modifier: 40, is_default: false, display_order: 2 },
        { product_id: product.id, option_type: 'addon', name: 'Case', value: 'No Case', description: 'Stand only', price_modifier: 0, is_default: true, display_order: 1 },
        { product_id: product.id, option_type: 'addon', name: 'Case', value: 'With Carrying Case', description: 'Protective travel case', price_modifier: 25, is_default: false, display_order: 2 }
      );

      allPricingRules.push(
        { product_id: product.id, base_price: 149.99, price_per_sqft: 0, min_quantity: 1, max_quantity: 2, discount_percent: 0 },
        { product_id: product.id, base_price: 139.99, price_per_sqft: 0, min_quantity: 3, max_quantity: null, discount_percent: 0 }
      );
    }
  });

  if (allOptions.length > 0) {
    const { error: optError } = await supabase
      .from('product_options')
      .insert(allOptions);

    if (optError) {
      console.error('Error inserting options:', optError);
    } else {
      console.log(`Inserted ${allOptions.length} product options`);
    }
  }

  if (allPricingRules.length > 0) {
    const { error: priceError } = await supabase
      .from('pricing_rules')
      .insert(allPricingRules);

    if (priceError) {
      console.error('Error inserting pricing rules:', priceError);
    } else {
      console.log(`Inserted ${allPricingRules.length} pricing rules`);
    }
  }

  console.log('Database seed complete!');
}

seedDatabase().catch(console.error);

# All Signs NC — Complete Build Documentation

---

## Reconstruction Prompt

Use the following prompt to fully recreate this application from scratch:

> Build a full-stack e-commerce platform called **All Signs NC** for a custom signage and printing business. The site should be built with React 18, TypeScript, Vite, and Tailwind CSS for the frontend, and Supabase (PostgreSQL + Auth + Storage) for the backend. Use `react-router-dom` v7 for routing, `lucide-react` for all icons, and `fabric` v7 for the canvas-based design editor.
>
> The platform must include: a public storefront with product categories and detail pages, a shopping cart and checkout flow, a Fabric.js-powered design studio with auto-save and preflight checks, a template library, a proof-sharing system with token-based links and comment/approval workflow, customer account pages (orders, saved designs), an admin panel (product/category management, media library, content slots), and a content management system with draft/publish versioning and rollback. All database tables must use Supabase Row Level Security. Phone number contact info must only be visible to authenticated users. Use a professional green color theme (`#16a34a` primary). Use local stock images from `/images/stock/` served from the `public` folder for hero and category tile images. All admin access must be role-gated via a `profiles` table with a `role` column checked against `auth.uid()`.

---

## Table of Contents

1. [Technology Stack](#1-technology-stack)
2. [Project Setup](#2-project-setup)
3. [Environment Variables](#3-environment-variables)
4. [Directory Structure](#4-directory-structure)
5. [Database Schema](#5-database-schema)
6. [TypeScript Types](#6-typescript-types)
7. [Supabase Client](#7-supabase-client)
8. [Business Logic Libraries](#8-business-logic-libraries)
9. [Authentication & State Contexts](#9-authentication--state-contexts)
10. [Components](#10-components)
11. [Pages — Public](#11-pages--public)
12. [Pages — Account](#12-pages--account)
13. [Pages — Admin](#13-pages--admin)
14. [Routing](#14-routing)
15. [Tailwind Configuration](#15-tailwind-configuration)
16. [Vite Configuration](#16-vite-configuration)
17. [Key Behaviors & Business Rules](#17-key-behaviors--business-rules)
18. [Security Model](#18-security-model)
19. [Content Management System](#19-content-management-system)
20. [Design Studio](#20-design-studio)
21. [Admin Setup](#21-admin-setup)

---

## 1. Technology Stack

| Layer | Technology | Version |
|---|---|---|
| Frontend framework | React | ^18.3.1 |
| Language | TypeScript | ^5.5.3 |
| Build tool | Vite | ^5.4.2 |
| Styling | Tailwind CSS | ^3.4.1 |
| Routing | react-router-dom | ^7.11.0 |
| Icons | lucide-react | ^0.344.0 |
| Canvas editor | fabric | ^7.1.0 |
| PDF export | pdf-lib | ^1.17.1 |
| Database / Auth / Storage | Supabase (`@supabase/supabase-js`) | ^2.57.4 |
| Utilities | uuid, lodash.debounce, react-dropzone | latest |
| Form validation | zod | ^4.3.5 |

---

## 2. Project Setup

```bash
npm create vite@latest allsignsnc -- --template react-ts
cd allsignsnc
npm install @supabase/supabase-js react-router-dom lucide-react fabric pdf-lib lodash.debounce react-dropzone uuid zod dotenv
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

`index.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

`main.tsx`:
```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
```

---

## 3. Environment Variables

File: `.env`

```
VITE_SUPABASE_URL=https://<your-project>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-key>
```

Both variables must be prefixed with `VITE_` for Vite to expose them to the browser.

---

## 4. Directory Structure

```
src/
├── App.tsx                     # Root router, wraps AuthProvider + CartProvider
├── main.tsx                    # React entry point
├── index.css                   # Tailwind directives
├── vite-env.d.ts
├── types/
│   └── index.ts                # All shared TypeScript interfaces
├── lib/
│   ├── supabase.ts             # Singleton Supabase client
│   ├── adminUtils.ts           # Profile/role helpers
│   ├── contentResolver.ts      # CMS content fetching with cache
│   ├── contentSlots.ts         # Admin CMS CRUD + publish/rollback
│   ├── designStudio.ts         # Fabric.js canvas utilities
│   ├── mediaLibrary.ts         # Media upload/query/archive helpers
│   └── sizePresets.ts          # Per-category hardcoded size presets
├── contexts/
│   ├── AuthContext.tsx          # Auth state + profile
│   └── CartContext.tsx          # Cart state + CRUD
├── components/
│   ├── AdminGuard.tsx           # Role-gated route wrapper
│   ├── SizeSelector.tsx         # Interactive size picker component
│   └── Layout/
│       ├── Header.tsx
│       ├── Footer.tsx
│       └── Layout.tsx
└── pages/
    ├── Home.tsx
    ├── Login.tsx
    ├── Signup.tsx
    ├── Account.tsx
    ├── AccountDesigns.tsx
    ├── Cart.tsx
    ├── Checkout.tsx
    ├── Contact.tsx
    ├── CustomQuote.tsx
    ├── DesignEditor.tsx
    ├── OrderConfirmation.tsx
    ├── ProductCategory.tsx
    ├── ProductDetail.tsx
    ├── ProofView.tsx
    ├── Resources.tsx
    ├── TemplateLibrary.tsx
    └── admin/
        ├── Dashboard.tsx
        ├── Products.tsx
        ├── MediaLibrary.tsx
        └── ContentSlots.tsx

public/
└── images/
    ├── allsignslogo.jpg
    └── stock/
        ├── hero-print-studio-1000.webp
        ├── hero-print-studio-1600.webp
        ├── hero-print-studio-1000.jpg
        ├── hero-print-studio-1600.jpg
        ├── category-yard-signs-600.webp
        ├── category-yard-signs-900.webp
        ├── category-banners-600.webp
        ├── category-banners-900.webp
        ├── category-vehicle-600.webp
        ├── category-vehicle-900.webp
        ├── category-decals-600.webp
        ├── category-decals-900.webp
        ├── category-rigid-signs-600.webp
        ├── category-rigid-signs-900.webp
        ├── category-flags-600.webp
        ├── category-flags-900.webp
        ├── category-trade-show-600.webp
        ├── category-trade-show-900.webp
        ├── about-quality.webp
        ├── about-quality.jpg
        ├── about-craftsmanship.jpg
        └── about-craftsmanship.webp

supabase/
└── migrations/
    ├── 20260105180759_create_core_ecommerce_schema.sql
    ├── 20260105184412_create_design_studio_schema.sql
    ├── 20260105201417_create_content_management_system.sql
    ├── 20260105205655_add_storage_policies.sql
    ├── 20260105223144_add_storage_bucket_policies.sql
    ├── 20260105231230_allow_public_content_slots_access.sql
    ├── 20260125180247_add_product_size_presets.sql
    └── 20260125180440_add_size_preset_category_to_products.sql
```

---

## 5. Database Schema

Apply all migrations in chronological order using `supabase db push` or the MCP `apply_migration` tool.

### Migration 1 — Core Ecommerce Schema

**Tables:**

**`product_categories`**
- `id` uuid PK
- `name` text NOT NULL
- `slug` text UNIQUE NOT NULL
- `description` text
- `parent_id` uuid → product_categories(id)
- `image_url` text
- `display_order` integer DEFAULT 0
- `is_active` boolean DEFAULT true
- `created_at`, `updated_at` timestamptz

RLS: Public SELECT where `is_active = true`. Admin ALL.

**`products`**
- `id` uuid PK
- `category_id` uuid → product_categories(id) NOT NULL
- `name` text NOT NULL
- `slug` text UNIQUE NOT NULL
- `description`, `short_description` text
- `image_urls` text[] DEFAULT '{}'
- `is_active` boolean DEFAULT true
- `allows_custom_size` boolean DEFAULT false
- `min_width`, `max_width`, `min_height`, `max_height` numeric
- `production_days_min` integer DEFAULT 1
- `production_days_max` integer DEFAULT 5
- `seo_title`, `seo_description` text
- `created_at`, `updated_at` timestamptz

RLS: Public SELECT where `is_active = true`. Admin ALL.

**`product_options`**
- `id` uuid PK
- `product_id` uuid → products(id) ON DELETE CASCADE
- `option_type` text — values: `'material'`, `'size'`, `'finishing'`, `'addon'`
- `name`, `value` text NOT NULL
- `description` text
- `price_modifier` numeric DEFAULT 0
- `is_default` boolean DEFAULT false
- `display_order` integer DEFAULT 0
- `is_active` boolean DEFAULT true

RLS: Public SELECT where `is_active = true`. Admin ALL.

**`pricing_rules`**
- `id` uuid PK
- `product_id` uuid → products(id) ON DELETE CASCADE
- `material_option_id` uuid → product_options(id)
- `base_price` numeric DEFAULT 0
- `price_per_sqft` numeric DEFAULT 0
- `min_quantity` integer DEFAULT 1
- `max_quantity` integer
- `discount_percent` numeric DEFAULT 0
- `is_active` boolean DEFAULT true

RLS: Public SELECT where `is_active = true`. Admin ALL.

**`addresses`**
- `id` uuid PK
- `user_id` uuid → auth.users(id) ON DELETE CASCADE
- `address_type` text DEFAULT `'shipping'`
- `full_name`, `company`, `address_line1`, `address_line2`, `city`, `state`, `zip_code` text
- `country` text DEFAULT `'US'`
- `phone` text
- `is_default` boolean DEFAULT false

RLS: Authenticated users — SELECT/INSERT/UPDATE/DELETE own rows only (`auth.uid() = user_id`).

**`carts`**
- `id` uuid PK
- `user_id` uuid → auth.users(id)
- `session_id` text
- `promo_code` text
- `discount_amount` numeric DEFAULT 0

RLS: Authenticated SELECT/INSERT/UPDATE own rows.

**`cart_items`**
- `id` uuid PK
- `cart_id` uuid → carts(id) ON DELETE CASCADE
- `product_id` uuid → products(id)
- `design_id` uuid → designs(id) ON DELETE SET NULL *(added in migration 2)*
- `quantity` integer DEFAULT 1
- `width`, `height` numeric
- `selected_options` jsonb DEFAULT '{}'
- `unit_price`, `total_price` numeric NOT NULL
- `production_speed` text DEFAULT `'standard'`

RLS: Authenticated CRUD via EXISTS check on `carts.user_id = auth.uid()`.

**`orders`**
- `id` uuid PK
- `order_number` text UNIQUE NOT NULL
- `user_id` uuid → auth.users(id)
- `status` text DEFAULT `'pending'` — values: `pending`, `artwork_review`, `in_production`, `shipped`, `delivered`, `cancelled`
- `subtotal`, `discount_amount`, `shipping_cost`, `tax_amount`, `total_amount` numeric
- `promo_code` text
- `shipping_address`, `billing_address` jsonb
- `shipping_method`, `tracking_number`, `tracking_url`, `notes` text
- `estimated_production_date`, `estimated_delivery_date` date
- `shipped_date` timestamptz

RLS: Users SELECT/INSERT own. Admin SELECT/UPDATE all.

**`order_items`**
- `id` uuid PK
- `order_id` uuid → orders(id) ON DELETE CASCADE
- `product_id` uuid → products(id)
- `design_id` uuid → designs(id) ON DELETE SET NULL
- `product_name`, `production_speed` text
- `quantity` integer
- `width`, `height` numeric
- `selected_options` jsonb
- `unit_price`, `total_price` numeric

RLS: Users SELECT own (via orders). Admin SELECT all.

**`uploads`**
- `id` uuid PK
- `user_id`, `order_id`, `order_item_id` uuid refs
- `file_name`, `file_url` text NOT NULL
- `file_size` bigint, `file_type` text
- `status` text DEFAULT `'pending'` — values: `pending`, `approved`, `rejected`, `needs_revision`
- `admin_notes` text

RLS: Users SELECT/INSERT own. Admin SELECT/UPDATE all.

**`support_tickets`**
- `ticket_type` text — values: `pre_sales`, `design_help`, `order_issue`, `reprint_claim`
- `subject` text
- `status` text DEFAULT `'open'` — values: `open`, `in_progress`, `resolved`, `closed`
- `priority` text DEFAULT `'normal'` — values: `low`, `normal`, `high`, `urgent`

**`ticket_messages`**
- `ticket_id` uuid → support_tickets
- `user_id` uuid → auth.users
- `message` text
- `is_admin` boolean DEFAULT false

**`articles`**
- `category` text — values: `material_guide`, `file_setup`, `installation`, `turnaround`
- `content`, `excerpt`, `image_url` text
- `is_published` boolean DEFAULT false
- `published_at` timestamptz

**`promo_codes`**
- `code` text UNIQUE
- `discount_type` text — values: `percentage`, `fixed`, `free_shipping`
- `discount_value` numeric
- `min_order_amount`, `max_uses`, `current_uses` numeric/integer
- `valid_from`, `valid_until` timestamptz
- `is_active` boolean DEFAULT true

**Indexes created:**
`products(category_id)`, `products(slug)`, `product_options(product_id)`, `pricing_rules(product_id)`, `orders(user_id)`, `orders(order_number)`, `order_items(order_id)`, `uploads(user_id)`, `support_tickets(user_id)`, `articles(slug)`

---

### Migration 2 — Design Studio Schema

**`template_categories`** — name, slug, display_order, is_active

**`templates`**
- `product_type` text NOT NULL
- `tags` text[]
- `thumbnail_url` text
- `base_width_in`, `base_height_in` numeric NOT NULL
- `bleed_in` numeric DEFAULT 0.125
- `safe_zone_in` numeric DEFAULT 0.25
- `editor_json` jsonb NOT NULL *(Fabric.js canvas state)*
- `is_published` boolean DEFAULT false
- `usage_count` integer DEFAULT 0
- `created_by` uuid → auth.users

RLS: Public SELECT where `is_published = true`. Admin ALL.

**`designs`**
- `user_id` uuid → auth.users ON DELETE CASCADE
- `name` text DEFAULT `'Untitled Design'`
- `product_id` uuid → products
- `template_id` uuid → templates
- `product_type` text NOT NULL
- `variant_snapshot` jsonb NOT NULL *(snapshot of selected options at design creation)*
- `width_in`, `height_in`, `bleed_in`, `safe_zone_in` numeric
- `editor_json` jsonb NOT NULL
- `preview_png_url`, `print_pdf_url` text
- `preflight_json` jsonb DEFAULT `'{"checks":[],"warnings":[],"blockers":[],"passed":false}'`
- `status` text DEFAULT `'draft'`
- `last_edited_at` timestamptz

RLS: Users CRUD own. Admin SELECT/UPDATE all.

**`design_versions`**
- `design_id` uuid → designs ON DELETE CASCADE
- `version_number` integer NOT NULL
- UNIQUE(design_id, version_number)

RLS: Users SELECT/INSERT for own designs.

**`design_assets`**
- `design_id` uuid → designs ON DELETE CASCADE
- `user_id` uuid → auth.users ON DELETE CASCADE
- `file_name`, `file_type`, `file_url` text
- `file_size` bigint
- `width_px`, `height_px` integer
- `thumbnail_url` text

RLS: Users SELECT/INSERT/DELETE own.

**`render_jobs`**
- `design_id`, `user_id` uuid refs
- `job_type`, `status`, `output_url`, `error_message` text
- `metadata` jsonb
- `started_at`, `completed_at` timestamptz

RLS: Users SELECT/INSERT own. Admin SELECT all.

**`proof_links`**
- `design_id` uuid → designs ON DELETE CASCADE
- `order_id` uuid → orders ON DELETE SET NULL
- `token` text UNIQUE NOT NULL
- `title`, `message` text
- `expires_at` timestamptz
- `created_by` uuid → auth.users
- `view_count` integer DEFAULT 0
- `last_viewed_at` timestamptz

RLS: Users SELECT/INSERT own. Public SELECT where token is valid and not expired. Admin SELECT all.

**`proof_comments`**
- `proof_link_id` uuid → proof_links ON DELETE CASCADE
- `author_user_id` uuid → auth.users *(nullable for anonymous)*
- `author_name` text
- `comment` text NOT NULL
- `status` text DEFAULT `'comment'`
- `is_internal` boolean DEFAULT false

RLS: Public SELECT via valid proof link. Authenticated INSERT (any). Anonymous INSERT where `author_user_id IS NULL`. Admin ALL.

**`design_id` column added** to `cart_items` and `order_items` via conditional `DO $$ ... END $$` block.

---

### Migration 3 — Content Management System

**`profiles`**
- `user_id` uuid PK → auth.users ON DELETE CASCADE
- `role` text DEFAULT `'user'` CHECK IN (`'user'`, `'admin'`)
- `created_at`, `updated_at` timestamptz

RLS:
- Users SELECT/INSERT/UPDATE own (cannot change own role via UPDATE policy)
- Admins SELECT/UPDATE all

**`media_assets`**
- `created_by` uuid → auth.users ON DELETE SET NULL
- `title`, `alt_text` text
- `tags` text[]
- `mime_type` text NOT NULL
- `byte_size` integer NOT NULL
- `storage_path` text NOT NULL *(path in Supabase Storage)*
- `url` text NOT NULL *(public URL)*
- `status` text DEFAULT `'active'` CHECK IN (`'active'`, `'archived'`)

RLS: Authenticated SELECT where `status = 'active'`. Admins SELECT all, INSERT, UPDATE, DELETE.

**`content_slots`**
- `slot_key` text UNIQUE NOT NULL *(e.g. `home.hero.background`)*
- `draft_value` jsonb DEFAULT '{}'
- `published_value` jsonb DEFAULT '{}'
- `updated_by` uuid → auth.users ON DELETE SET NULL

RLS: Authenticated SELECT all. Admins INSERT/UPDATE/DELETE.

**`content_versions`**
- `version` integer NOT NULL
- `published_snapshot` jsonb NOT NULL *(full map of slot_key → published_value)*
- `published_at` timestamptz
- `published_by` uuid → auth.users ON DELETE SET NULL
- `notes` text DEFAULT ''

RLS: Admin-only SELECT/INSERT/UPDATE/DELETE.

**`is_admin()` helper function:**
```sql
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
```

**Default content slots inserted** (10 slots):
- `home.hero.background` — hero image with headline/subhead
- `home.categoryTile.yardSigns`
- `home.categoryTile.banners`
- `home.categoryTile.vehicle`
- `home.categoryTile.decals`
- `home.categoryTile.rigidSigns`
- `home.categoryTile.flags`
- `home.categoryTile.tradeShow`
- `about.quality.image`
- `about.craftsmanship.image`

Each slot value is a jsonb object with: `fallbackPath`, `alt`, optionally `headline`, `subhead`, `enabled`.

---

### Migration 4 & 5 — Storage Policies

Create a Supabase Storage bucket named `media-library` with:
- Public read access (anon + authenticated)
- Admin-only upload, update, delete

---

### Migration 6 — Public Content Slots Access

Allow `anon` role to SELECT from `content_slots` (needed for server-side rendering or unauthenticated homepage loads):

```sql
CREATE POLICY "Public can view published content slots"
  ON content_slots FOR SELECT
  TO anon
  USING (true);
```

---

### Migration 7 — Product Size Presets

```sql
CREATE TABLE IF NOT EXISTS product_size_presets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_slug text NOT NULL,
  label text NOT NULL,
  width_in numeric NOT NULL,
  height_in numeric NOT NULL,
  guidance_text text DEFAULT '',
  is_popular boolean DEFAULT false,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE product_size_presets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Size presets are viewable by everyone"
  ON product_size_presets FOR SELECT TO public USING (true);
CREATE POLICY "Admin can manage size presets"
  ON product_size_presets FOR ALL TO authenticated
  USING (auth.jwt()->>'role' = 'admin')
  WITH CHECK (auth.jwt()->>'role' = 'admin');
```

---

### Migration 8 — size_preset_category on Products

```sql
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'size_preset_category'
  ) THEN
    ALTER TABLE products ADD COLUMN size_preset_category text;
  END IF;
END $$;
```

---

## 6. TypeScript Types

File: `src/types/index.ts`

All interfaces used throughout the app. Key groupings:

**Commerce:**
```ts
interface Category { id, name, slug, description, parent_id, image_url, display_order, is_active }
interface Product { id, category_id, name, slug, description, short_description, image_urls, is_active, allows_custom_size, min_width, max_width, min_height, max_height, production_days_min, production_days_max, size_preset_category, seo_title, seo_description }
interface ProductOption { id, product_id, option_type, name, value, description, price_modifier, is_default, display_order }
interface PricingRule { id, product_id, material_option_id, base_price, price_per_sqft, min_quantity, max_quantity, discount_percent }
interface Cart { id, user_id, session_id, promo_code, discount_amount }
interface CartItem { id, cart_id, product_id, design_id, quantity, width, height, selected_options, unit_price, total_price, production_speed, product? }
interface Order { id, order_number, user_id, status, subtotal, discount_amount, shipping_cost, tax_amount, total_amount, promo_code, shipping_address, billing_address, shipping_method, estimated_production_date, estimated_delivery_date, tracking_number, notes }
interface OrderItem { id, order_id, product_id, design_id, product_name, quantity, width, height, selected_options, unit_price, total_price }
interface Address { id, user_id, address_type, full_name, company, address_line1, address_line2, city, state, zip_code, country, phone, is_default }
interface PromoCode { id, code, description, discount_type, discount_value, min_order_amount, max_uses, current_uses, valid_from, valid_until, is_active }
```

**Design Studio:**
```ts
interface Design { id, user_id, name, product_id, template_id, product_type, variant_snapshot, width_in, height_in, bleed_in, safe_zone_in, editor_json, preview_png_url, print_pdf_url, preflight_json, status, last_edited_at }
interface Template { id, name, slug, category_id, product_type, tags, thumbnail_url, base_width_in, base_height_in, bleed_in, safe_zone_in, editor_json, description, is_published, usage_count }
interface TemplateCategory { id, name, slug, description, display_order }
interface DesignAsset { id, design_id, user_id, file_name, file_type, file_size, file_url, width_px, height_px, thumbnail_url }
interface PreflightCheck { id, label, status, message, severity }
```

**Proofing:**
```ts
interface ProofLink { id, design_id, order_id, token, title, message, expires_at, created_by, view_count, last_viewed_at }
interface ProofComment { id, proof_link_id, author_user_id, author_name, comment, status, is_internal, created_at }
```

**Content:**
```ts
interface Article { id, title, slug, category, content, excerpt, image_url, is_published, published_at }
```

---

## 7. Supabase Client

File: `src/lib/supabase.ts`

```ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

---

## 8. Business Logic Libraries

### `src/lib/adminUtils.ts`

```ts
getUserProfile(userId?: string): Promise<{ user_id, role } | null>
isAdmin(): Promise<boolean>
ensureProfile(): Promise<void>   // creates profile row if missing
setUserRole(userId: string, role: 'user' | 'admin'): Promise<void>
```

- `getUserProfile` — queries `profiles` table, defaults to current user if no `userId` passed
- `isAdmin` — calls `getUserProfile`, checks `role === 'admin'`
- `ensureProfile` — upserts a `profiles` row with `role: 'user'` for the current user
- `setUserRole` — admin-only helper to update another user's role

### `src/lib/sizePresets.ts`

Hardcoded size presets for 14 product categories. Each category object contains an array of preset sizes with `label`, `width`, `height`, and `guidanceText`.

Supported categories (by slug key):
`yard-signs`, `banners`, `posters`, `flyers`, `business-cards`, `decals-stickers`, `vehicle-graphics`, `rigid-signs`, `flags`, `trade-show`, `window-graphics`, `floor-graphics`, `labels`, `postcards`

```ts
getSizePresetsForCategory(categorySlug: string): SizePreset[]
formatDimensions(width: number, height: number): string  // "24" × 18""
```

**Legibility rule built in:** 1 inch of letter height per 10 feet of viewing distance. Used in `SizeSelector` component to calculate readable font sizes.

### `src/lib/designStudio.ts`

All Fabric.js canvas operations:

```ts
createDefaultCanvas(canvasEl: HTMLCanvasElement, widthIn: number, heightIn: number, bleedIn?: number, safeZoneIn?: number): fabric.Canvas
exportCanvasToImage(canvas: fabric.Canvas): Promise<Blob>
exportCanvasToPDF(canvas: fabric.Canvas, widthIn: number, heightIn: number): Promise<Blob>
runPreflightChecks(canvas: fabric.Canvas, widthIn: number, heightIn: number): PreflightCheck[]
inchesToPixels(inches: number, dpi?: number): number   // default 150 DPI
pixelsToInches(pixels: number, dpi?: number): number
generateProofToken(): string   // crypto.randomUUID() based
```

**Canvas setup:**
- Displays a bleed zone (red dashed outline, 0.125" default)
- Displays a safe zone (green dashed outline, 0.25" default)
- Grid/ruler marks at 1" intervals

**Preflight checks:**
1. DPI — warns if effective resolution < 100 DPI, blocks if < 72 DPI
2. Safe zone — warns if any object extends outside safe zone boundary
3. Background — warns if canvas has transparent/white background (suggests full-bleed fill)

**Export:**
- PNG preview at 150 DPI using `canvas.toDataURL`
- Print PDF at 300 DPI using `pdf-lib`, embedded as JPEG page at exact inch dimensions

### `src/lib/contentResolver.ts`

Client-side CMS resolver with in-memory cache:

```ts
getContentSlot(slotKey: string, previewMode?: boolean): Promise<ContentSlotValue>
getAllSlots(previewMode?: boolean): Promise<Record<string, ContentSlotValue>>
setPreviewMode(enabled: boolean): void
invalidateCache(): void
```

**ContentSlotValue shape:**
```ts
{
  fallbackPath?: string;   // local path like /images/stock/hero.webp
  assetId?: string;        // media_assets.id reference
  url?: string;            // resolved at runtime from assetId
  alt?: string;
  headline?: string;
  subhead?: string;
  enabled?: boolean;
}
```

- When `previewMode = false` (default), reads `published_value`
- When `previewMode = true`, reads `draft_value`
- Cache is invalidated when preview mode changes
- If `assetId` is present, lazily resolves the URL from `media_assets`

### `src/lib/contentSlots.ts`

Admin-level CMS CRUD and version management:

```ts
listContentSlots(): Promise<ContentSlot[]>
getContentSlot(slotKey: string): Promise<ContentSlot | null>
updateDraftValue(slotKey: string, draftValue: object): Promise<void>
publishAll(notes?: string): Promise<void>    // copies draft_value → published_value for all slots, writes content_versions snapshot
listVersions(): Promise<ContentVersion[]>
rollbackToVersion(versionId: string): Promise<void>  // restores published_value from snapshot
```

### `src/lib/mediaLibrary.ts`

```ts
uploadMedia(file: File, title: string, altText?: string, tags?: string[]): Promise<MediaAsset>
listMedia(filters?: { status?, tags?, search? }): Promise<MediaAsset[]>
updateMediaAsset(id: string, updates: Partial<MediaAsset>): Promise<void>
archiveMediaAsset(id: string): Promise<void>     // sets status = 'archived'
deleteMediaAsset(id: string): Promise<void>      // hard deletes from storage + DB
```

**Upload logic:**
- 10 MB file size limit enforced client-side
- Only image MIME types accepted
- Uploads to Supabase Storage bucket `media-library`
- Inserts metadata row into `media_assets`
- Returns full asset object with public URL

---

## 9. Authentication & State Contexts

### `src/contexts/AuthContext.tsx`

Provides: `user`, `loading`, `profile`, `isAdmin`, `signUp`, `signIn`, `signOut`

```tsx
const AuthContext = createContext<AuthContextValue>(...);

export function AuthProvider({ children }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<{ role: string } | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) loadProfile(session.user.id);
      setLoading(false);
    });

    supabase.auth.onAuthStateChange((event, session) => {
      (async () => {
        setUser(session?.user ?? null);
        if (session?.user) {
          await ensureProfile();
          await loadProfile(session.user.id);
        } else {
          setProfile(null);
        }
      })();
    });
  }, []);

  const isAdmin = profile?.role === 'admin';
  // signUp: supabase.auth.signUp
  // signIn: supabase.auth.signInWithPassword
  // signOut: supabase.auth.signOut
}

export function useAuth() { return useContext(AuthContext); }
```

**Important:** `onAuthStateChange` callback is wrapped in an async IIFE `(async () => { ... })()` to avoid deadlocks with Supabase's synchronous event processing.

### `src/contexts/CartContext.tsx`

Provides: `cart`, `items`, `itemCount`, `subtotal`, `addToCart`, `updateCartItem`, `removeFromCart`, `clearCart`, `refreshCart`

```tsx
export function CartProvider({ children }) {
  const { user } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    if (user) loadOrCreateCart();
    else { setCart(null); setItems([]); }
  }, [user]);

  async function loadOrCreateCart() {
    let { data } = await supabase.from('carts').select('*').eq('user_id', user.id).maybeSingle();
    if (!data) {
      const { data: newCart } = await supabase.from('carts').insert({ user_id: user.id }).select().single();
      data = newCart;
    }
    setCart(data);
    loadItems(data.id);
  }

  // addToCart: inserts cart_item, recalculates totals
  // updateCartItem: updates quantity/options
  // removeFromCart: deletes cart_item
  // clearCart: deletes all cart_items for cart
}
```

`itemCount` = sum of all item quantities.
`subtotal` = sum of all `total_price` values.

Items are loaded with product join: `.select('*, product:products(*)')`.

---

## 10. Components

### `src/components/AdminGuard.tsx`

Wraps any route that requires admin access.

```tsx
export function AdminGuard({ children }) {
  const { user, loading, isAdmin } = useAuth();

  if (loading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/login" />;
  if (!isAdmin) return <AccessDeniedPage />;

  return <>{children}</>;
}
```

### `src/components/SizeSelector.tsx`

Props: `categorySlug`, `value`, `onChange`, `allowCustom?`, `product?`

Features:
- Loads presets from `getSizePresetsForCategory(categorySlug)`
- Displays preset buttons in a grid (popular presets highlighted)
- "Custom Size" tab with width/height inputs (respects product `min_width`, `max_width`, etc.)
- Legibility calculator: shows minimum readable letter height at given viewing distance
- Guidance text shown per preset
- Custom size warning if outside recommended range

### `src/components/Layout/Header.tsx`

- Sticky top navigation
- Logo (uses `allsignslogo.jpg`)
- "Products" dropdown showing all 7 categories
- Auth-aware right section: shows Login/Signup for guests, Account/Logout dropdown for users
- Cart icon with `itemCount` badge
- Mobile hamburger menu with animated chevron
- Active route highlighting

### `src/components/Layout/Footer.tsx`

4-column grid layout:
1. Brand + tagline + social icons (Facebook, Twitter, Instagram, LinkedIn)
2. Products links (7 categories)
3. Support links (Contact, Track Order, Shipping, Returns, File Setup, Guarantee, Resources)
4. Contact info:
   - **Phone number shown only when `user` is authenticated** (gated via `useAuth`)
   - Email (always visible): `support@allsignsnc.com`
   - Address: `123 Print Way, Charlotte, NC 28202`

Bottom bar: copyright + Privacy Policy / Terms of Service / About Us links.

### `src/components/Layout/Layout.tsx`

```tsx
export function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
```

---

## 11. Pages — Public

### `src/pages/Home.tsx`

Sections:
1. **Hero** — full-width image from `home.hero.background` content slot. Has headline, subhead, two CTAs ("Shop Products", "Design Online"). Uses `<picture>` with `.webp` srcset and `.jpg` fallback.
2. **Category Grid** — 8 category tiles loaded from CMS content slots, displayed in a responsive grid with hover zoom effects. Each links to `/products/<slug>`.
3. **Trust Badges** — 4 icons: Fast Turnaround, Quality Guarantee, Expert Support, Easy Ordering.
4. **How It Works** — 3 steps: Choose, Design, Deliver.
5. **CTA Banner** — "Ready to get started?" with links to products and custom quote.

Content resolution pattern:
```ts
const [heroSlot, setHeroSlot] = useState<ContentSlotValue | null>(null);
useEffect(() => {
  getContentSlot('home.hero.background').then(setHeroSlot);
}, []);
```

Image rendering:
```tsx
<img
  src={slot.url || slot.fallbackPath}
  alt={slot.alt}
/>
```

### `src/pages/ProductCategory.tsx`

Route: `/products/:slug`

- Fetches category by slug from `product_categories`
- Fetches active products in that category
- Renders hero with category image
- Product grid cards with image, name, short description, "View Options" CTA
- Empty state if no products found

### `src/pages/ProductDetail.tsx`

Route: `/products/:categorySlug/:productSlug`

- Fetches product + options + pricing rules
- Image gallery with thumbnail navigation
- Options selectors: material (radio buttons), finishing (radio buttons)
- Size selector using `SizeSelector` component if `allows_custom_size`
- Quantity input
- Production speed selector: Standard / Rush (+50%) / Same Day (+100%)
- Real-time price calculation based on size × sqft rate + base price + option modifiers
- Production date estimate shown
- "Add to Cart" button — creates/updates cart item in Supabase
- "Design Online" button — navigates to `/design-editor?product=<id>`

### `src/pages/Cart.tsx`

Route: `/cart`

- Lists all `items` from CartContext with product thumbnail, name, size, options
- Quantity +/- controls (calls `updateCartItem`)
- Remove button (calls `removeFromCart`)
- Order summary sidebar: subtotal, shipping TBD, estimated total
- Checkout CTA — disabled if cart is empty

### `src/pages/Checkout.tsx`

Route: `/checkout`

Form sections:
1. **Shipping Address** — full name, company, address line 1/2, city, state, zip, country, phone
2. **Shipping Method** — Standard (free, 5-7 days), Expedited ($15, 2-3 days), Overnight ($35, 1 day)
3. **Payment** — placeholder section (no real payment integration, just form UI)
4. **Order Summary sidebar** — itemized list from cart

On submit:
- Generates order number: `ASN-<timestamp>`
- Calculates estimated dates based on production days + shipping method
- Inserts `orders` row
- Inserts `order_items` rows from cart items
- Clears cart
- Navigates to `/order-confirmation/<orderId>`

### `src/pages/Contact.tsx`

Route: `/contact`

Two-column layout:
- Left: Contact info
  - **Phone** — only rendered when `user` is authenticated (`{user && <PhoneBlock />}`)
  - Email: `support@allsignsnc.com`
  - Address
  - Business hours (Mon-Fri 8AM-6PM, Sat 9AM-2PM, Sun Closed)
- Right: Message form (name, email, subject, message textarea, Send button — UI only)

### `src/pages/CustomQuote.tsx`

Route: `/custom-quote`

Lead capture form: name, email, phone, product type, size description, quantity, notes, file upload area. Submit is UI-only (no backend integration in current build).

### `src/pages/Resources.tsx`

Route: `/resources`

Guide cards for: File Setup Guidelines, Material Selection, Design Tips, Installation Guides.
FAQ accordion section below.

### `src/pages/TemplateLibrary.tsx`

Route: `/templates`

- Fetches `template_categories` and `templates` from Supabase
- Category filter tabs
- Template grid cards with thumbnail, name, product type badge, "Use Template" CTA
- "Start from Blank" card at top
- Navigates to `/design-editor?template=<id>` or `/design-editor?product=<productId>`

### `src/pages/ProofView.tsx`

Route: `/proof/:token`

- Fetches `proof_links` by token (public access)
- Displays design preview image
- Shows `proof_comments` for the link
- Comment form: name (if anonymous), comment text, status selector (comment / request change / approved)
- Approval banner if any comment has status `'approved'`
- View count incremented on load (upsert to `proof_links`)

### `src/pages/DesignEditor.tsx`

Route: `/design-editor`

Query params: `?product=<productId>` or `?template=<templateId>` or `?design=<designId>`

**Left panel:**
- Tools: Select, Add Text, Add Image, Add Rectangle
- When text selected: font family, font size, bold/italic, text color, fill color
- Layer controls: bring forward, send back, delete selected

**Center canvas:**
- Fabric.js canvas scaled to fit viewport
- Bleed zone overlay (red dashed)
- Safe zone overlay (green dashed)
- Zoom controls

**Top bar:**
- Design name (editable)
- Save status indicator (Saved / Saving... / Unsaved changes)
- Preflight check button with badge showing blocker/warning count
- Export to PDF
- Add to Cart

**Preflight drawer:**
- Lists all preflight checks from `runPreflightChecks()`
- Color-coded: green (pass), yellow (warning), red (blocker)

**Auto-save:**
```ts
const debouncedSave = useMemo(
  () => debounce(saveDesign, 3000),
  [design]
);
canvas.on('object:modified', debouncedSave);
canvas.on('object:added', debouncedSave);
```

Save persists `editor_json` (full Fabric.js state) to `designs` table.

### `src/pages/OrderConfirmation.tsx`

Route: `/order-confirmation/:orderId`

- Fetches order by ID
- Displays order number, items, shipping address, estimated dates
- Next steps: "Upload Artwork", "Design Online", "Track Order" CTAs

---

## 12. Pages — Account

### `src/pages/Login.tsx`

Route: `/login`

- Email + password form
- Calls `signIn` from AuthContext
- Error handling: invalid credentials, network error, email not confirmed
- Link to `/signup`
- Redirects to `/account` on success

### `src/pages/Signup.tsx`

Route: `/signup`

- Email + password + confirm password form
- Validates password minimum 6 characters and match
- Calls `signUp` from AuthContext
- On success, `ensureProfile()` creates profile row
- Redirects to `/account`

### `src/pages/Account.tsx`

Route: `/account` — requires authentication

- Greeting with user email
- Recent orders section (last 5 orders from `orders` table)
- Quick links: My Designs, My Orders, Shipping Addresses, Profile Settings

### `src/pages/AccountDesigns.tsx`

Route: `/account/designs` — requires authentication

- Fetches all `designs` for `auth.uid()`
- Design card grid: preview thumbnail, name, dimensions, last edited date, status badge
- Actions per card: "Edit Design", "Duplicate", "Reorder", "Delete"
- Duplicate: inserts new design row with same `editor_json`
- Delete: hard deletes from `designs` table

---

## 13. Pages — Admin

All admin pages are wrapped in `<AdminGuard>`.

### `src/pages/admin/Dashboard.tsx`

Route: `/admin`

Hub page with 5 cards:
- **Media Library** → `/admin/media` (active)
- **Content Slots** → `/admin/content` (active)
- **Products** → `/admin/products` (active)
- **Users** → coming soon
- **Settings** → coming soon

### `src/pages/admin/Products.tsx`

Route: `/admin/products`

Two tabs: **Products** and **Categories**.

**Products tab:**
- Table of all products (including inactive) with: name, category, status badge, edit/delete icons
- "Add Product" button opens `ProductFormModal`

**ProductFormModal fields:**
- Name, Slug (auto-generated from name), Description, Short Description
- Category (select from categories)
- Status toggle (Active / Inactive)
- Size preset category (select from 14 hardcoded options)
- `allows_custom_size` checkbox
- If custom size: min/max width and height inputs
- Production days min/max
- Image URLs (comma-separated)
- SEO title, SEO description

**Categories tab:**
- Table of all categories with name, slug, display order, status, edit/delete
- "Add Category" button opens `CategoryFormModal`

**CategoryFormModal fields:**
- Name, Slug, Description, Display Order, Status

### `src/pages/admin/MediaLibrary.tsx`

Route: `/admin/media`

Layout: sidebar (upload + filters) + main grid.

**Upload panel:**
- `react-dropzone` drag-drop zone accepting `image/*` only, max 10 MB
- Title and alt text inputs
- Tags input (comma-separated)
- Upload progress/error feedback

**Filter panel:**
- Search input (title, alt, tags)
- Status filter: All / Active / Archived

**Asset grid:**
- Thumbnails from `media_assets.url`
- Hover: shows title
- Click: opens edit panel

**Edit panel:**
- Title, alt text, tags inputs
- "Copy Asset ID" / "Copy URL" buttons
- Archive / Restore / Delete buttons
- Delete requires confirmation dialog

### `src/pages/admin/ContentSlots.tsx`

Route: `/admin/content`

Layout: slot list (left) + edit panel (right).

**Slot list:**
- Sorted by `slot_key`
- Shows preview thumbnail if image slot
- Active/draft indicators

**Edit panel:**
- Slot key label (read-only)
- Image source: "Use Fallback" or "Select from Media Library"
- Media library picker (modal, shows active assets)
- Alt text input
- Headline, Subhead inputs (if applicable)
- Enabled toggle
- "Save Draft" button

**Top controls:**
- Preview mode toggle (Draft / Published)
- "Publish All" button with notes input
- Version history dropdown → "Rollback" button per version

---

## 14. Routing

File: `src/App.tsx`

```tsx
<BrowserRouter>
  <AuthProvider>
    <CartProvider>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Layout><Home /></Layout>} />
        <Route path="/login" element={<Layout><Login /></Layout>} />
        <Route path="/signup" element={<Layout><Signup /></Layout>} />
        <Route path="/products/:slug" element={<Layout><ProductCategory /></Layout>} />
        <Route path="/products/:categorySlug/:productSlug" element={<Layout><ProductDetail /></Layout>} />
        <Route path="/cart" element={<Layout><Cart /></Layout>} />
        <Route path="/checkout" element={<Layout><Checkout /></Layout>} />
        <Route path="/order-confirmation/:orderId" element={<Layout><OrderConfirmation /></Layout>} />
        <Route path="/contact" element={<Layout><Contact /></Layout>} />
        <Route path="/custom-quote" element={<Layout><CustomQuote /></Layout>} />
        <Route path="/resources" element={<Layout><Resources /></Layout>} />
        <Route path="/templates" element={<Layout><TemplateLibrary /></Layout>} />
        <Route path="/design-editor" element={<Layout><DesignEditor /></Layout>} />
        <Route path="/proof/:token" element={<Layout><ProofView /></Layout>} />

        {/* Account (auth required) */}
        <Route path="/account" element={<Layout><Account /></Layout>} />
        <Route path="/account/designs" element={<Layout><AccountDesigns /></Layout>} />

        {/* Admin (admin role required) */}
        <Route path="/admin" element={<AdminGuard><Layout><Dashboard /></Layout></AdminGuard>} />
        <Route path="/admin/products" element={<AdminGuard><Layout><Products /></Layout></AdminGuard>} />
        <Route path="/admin/media" element={<AdminGuard><Layout><MediaLibrary /></Layout></AdminGuard>} />
        <Route path="/admin/content" element={<AdminGuard><Layout><ContentSlots /></Layout></AdminGuard>} />
      </Routes>
    </CartProvider>
  </AuthProvider>
</BrowserRouter>
```

---

## 15. Tailwind Configuration

File: `tailwind.config.js`

```js
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        green: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',   // primary brand color
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
        },
      },
    },
  },
  plugins: [],
};
```

Brand color throughout the app: `text-green-600`, `bg-green-600`, `border-green-600`, `focus:ring-green-600`, `hover:bg-green-700`.

---

## 16. Vite Configuration

File: `vite.config.ts`

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
    include: ['fabric'],
  },
});
```

`fabric` must be in `include` because it is a CommonJS module that needs pre-bundling. `lucide-react` is excluded from pre-bundling to avoid issues with its tree-shaking.

---

## 17. Key Behaviors & Business Rules

### Pricing Model

```
unit_price = base_price + (width_in × height_in / 144) × price_per_sqft + material_modifier + finishing_modifier
```

Production speed multipliers:
- `standard` → ×1.0
- `rush` → ×1.5
- `same_day` → ×2.0

Quantity tiers: `pricing_rules` rows have `min_quantity` / `max_quantity` ranges with `discount_percent`.

### Production Date Calculation

```
estimated_production_date = today + production_days_max + speed_factor_days
estimated_delivery_date = estimated_production_date + shipping_method_days
```

Shipping method days: Standard +7, Expedited +3, Overnight +1.

### Design Auto-Save

- Debounced 3000ms on any canvas `object:modified` or `object:added` event
- Saves `editor_json` (Fabric.js `canvas.toJSON()`) to `designs` table
- Generates PNG preview and saves to `preview_png_url` via `exportCanvasToImage()`

### Cart to Order Conversion

On checkout submit:
1. Generate `order_number = 'ASN-' + Date.now()`
2. Insert `orders` row with full shipping address JSON
3. For each `cart_item`, insert `order_items` row snapshotting `product_name`, `selected_options`, `unit_price`, `total_price`
4. Delete all `cart_items` for the cart

### Phone Number Visibility

Phone number (`1-800-ALL-SIGN`) is hidden from all public-facing surfaces. It is only rendered when `useAuth().user` is truthy. This applies to:
- `Footer.tsx` — phone row in Contact column
- `Contact.tsx` — phone block in Get In Touch section

---

## 18. Security Model

### Row Level Security Summary

| Table | Public | Authenticated (own) | Admin |
|---|---|---|---|
| product_categories | SELECT (active) | — | ALL |
| products | SELECT (active) | — | ALL |
| product_options | SELECT (active) | — | ALL |
| pricing_rules | SELECT (active) | — | ALL |
| addresses | — | CRUD | — |
| carts | — | SELECT/INSERT/UPDATE | — |
| cart_items | — | CRUD (via cart ownership) | — |
| orders | — | SELECT/INSERT | SELECT/UPDATE |
| order_items | — | SELECT (via order) | SELECT |
| uploads | — | SELECT/INSERT | SELECT/UPDATE |
| designs | — | CRUD | SELECT/UPDATE |
| templates | SELECT (published) | — | ALL |
| proof_links | SELECT (valid token) | SELECT/INSERT own | SELECT |
| proof_comments | SELECT (valid proof) | INSERT | ALL |
| profiles | — | SELECT/UPDATE own | SELECT/UPDATE all |
| media_assets | — | SELECT (active) | ALL |
| content_slots | SELECT (anon+auth) | — | INSERT/UPDATE/DELETE |
| content_versions | — | — | ALL |

### Admin Role Check Pattern

Three patterns are used, depending on context:

1. **JWT claim** (used in product/order tables — set via Supabase Auth hook or custom JWT):
   ```sql
   USING (auth.jwt()->>'role' = 'admin')
   ```

2. **`is_admin()` function** (used in CMS tables — checks `profiles.role`):
   ```sql
   USING (is_admin())
   ```

3. **Application-level** (TypeScript — `useAuth().isAdmin`):
   ```ts
   const isAdmin = profile?.role === 'admin';
   ```

### Setting Admin Role

To grant admin access, run directly in the Supabase SQL editor:
```sql
UPDATE profiles SET role = 'admin' WHERE user_id = '<user-uuid>';
```

Or use `adminUtils.setUserRole(userId, 'admin')` from an existing admin session.

---

## 19. Content Management System

The CMS is a lightweight draft/publish system built on top of Supabase.

### Workflow

```
Admin edits draft_value
        ↓
  Save Draft (updateDraftValue)
        ↓
  Preview in Draft mode
        ↓
  Publish All (publishAll)
        ↓
  Copies draft_value → published_value for all slots
  Writes content_versions snapshot
        ↓
  Public site reads published_value
```

### Slot Key Naming Convention

`<page>.<section>.<field>`

Examples:
- `home.hero.background`
- `home.categoryTile.yardSigns`
- `about.quality.image`

### Content Slot Value Shape

```json
{
  "fallbackPath": "/images/stock/hero-print-studio-1600.webp",
  "assetId": null,
  "url": null,
  "alt": "Professional printing studio",
  "headline": "Professional Signs & Banners",
  "subhead": "Custom printing solutions for your business",
  "enabled": true
}
```

When `assetId` is set, `contentResolver` fetches the URL from `media_assets` and populates `url` at runtime.

### Rollback

Each `publishAll()` call creates a snapshot in `content_versions`:
```json
{
  "version": 5,
  "published_snapshot": {
    "home.hero.background": { ... },
    "home.categoryTile.yardSigns": { ... }
  },
  "notes": "Updated hero for summer campaign"
}
```

`rollbackToVersion(versionId)` restores all slot `published_value`s from the snapshot.

---

## 20. Design Studio

The design studio is built on Fabric.js v7 and runs entirely in-browser.

### Canvas Initialization

```ts
const canvas = new fabric.Canvas(canvasEl, {
  width: inchesToPixels(widthIn + 2 * bleedIn),
  height: inchesToPixels(heightIn + 2 * bleedIn),
  backgroundColor: '#ffffff',
});

// Draw bleed rectangle (red dashed)
// Draw safe zone rectangle (green dashed)
// Both are non-selectable, non-evented overlays
```

DPI: 150 for editor display. The canvas dimensions are physical inches × 150 DPI.

### Text Tool

```ts
const text = new fabric.IText('Click to edit', {
  left: canvas.width / 2,
  top: canvas.height / 2,
  fontFamily: 'Arial',
  fontSize: 24,
  fill: '#000000',
  originX: 'center',
  originY: 'center',
});
canvas.add(text);
canvas.setActiveObject(text);
```

### Image Upload

1. User picks file via `<input type="file" accept="image/*">`
2. File read as DataURL
3. `fabric.Image.fromURL(dataUrl, (img) => { canvas.add(img); })`

### Export to PDF

```ts
async function exportCanvasToPDF(canvas, widthIn, heightIn) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([widthIn * 72, heightIn * 72]);  // 72 pts per inch
  const pngBytes = await fetch(canvas.toDataURL({ multiplier: 2 }))
    .then(r => r.arrayBuffer());
  const image = await pdfDoc.embedJpg(pngBytes);
  page.drawImage(image, { x: 0, y: 0, width: page.getWidth(), height: page.getHeight() });
  return await pdfDoc.save();
}
```

### Preflight Checks

| Check | Warning Threshold | Blocker Threshold |
|---|---|---|
| Effective DPI | < 150 | < 72 |
| Object in safe zone | Any object near edge | — |
| Background fill | White/transparent | — |

---

## 21. Admin Setup

### First-Time Admin Grant

1. Register an account via `/signup`
2. In Supabase Dashboard → SQL Editor, run:
   ```sql
   UPDATE profiles
   SET role = 'admin'
   WHERE user_id = (
     SELECT id FROM auth.users WHERE email = 'your@email.com'
   );
   ```
3. Sign out and sign back in
4. Navigate to `/admin`

### Storage Bucket Setup

In Supabase Dashboard → Storage:
1. Create bucket: `media-library`
2. Set to **Public** (allows public read)
3. Apply upload/update/delete policies for authenticated admins

Or apply via the storage migration SQL files in `supabase/migrations/`.

### Content Slot Seeding

Default content slots are inserted by Migration 3. If running manually:
```sql
INSERT INTO content_slots (slot_key, published_value) VALUES
  ('home.hero.background', '{"fallbackPath": "/images/stock/hero-print-studio-1600.webp", "alt": "Large format printing studio", "headline": "Professional Signs & Banners", "subhead": "Custom printing solutions for your business", "enabled": true}'),
  -- ... (see full migration file for all 10 slots)
ON CONFLICT (slot_key) DO NOTHING;
```

---

*Documentation generated 2026-05-05. Reflects the complete state of the All Signs NC codebase.*

# Content & Media Management System

This document explains how to use the admin content management system to manage images and site content without code changes.

## Overview

The content management system allows admins to:
- Upload and manage images in a media library
- Replace site images (hero, category tiles, etc.)
- Edit headlines and text content
- Preview changes before publishing
- Rollback to previous versions if needed

## Getting Started

### Creating Your First Admin User

1. Sign up for an account at `/signup` or log in at `/login`
2. Connect to your database using a SQL client or Supabase dashboard
3. Run the following SQL to make your account an admin:

```sql
-- First, find your user ID
SELECT id, email FROM auth.users WHERE email = 'your-email@example.com';

-- Then update your profile to admin role
UPDATE profiles
SET role = 'admin'
WHERE user_id = 'YOUR-USER-ID-HERE';
```

4. Log out and log back in
5. Navigate to `/admin` to access the admin dashboard

### Alternative: Granting Admin Access via Code

If you prefer, you can use the `setUserRole` function in the admin console:

```javascript
import { setUserRole } from './lib/adminUtils';

// Make a user an admin (requires you to already be an admin)
await setUserRole('user-id-here', 'admin');
```

## Admin Dashboard

Access the admin dashboard at `/admin`. From here you can:

- **Media Library** - Upload and manage images
- **Content Manager** - Edit content slots and publish changes

## Using the Media Library

### Uploading Images

1. Navigate to `/admin/media`
2. Click the "Upload Image" button
3. Select an image file (JPEG, PNG, WebP, or GIF)
4. The image will be uploaded to Supabase Storage and added to your media library

### Managing Images

- **Click on any image** to view and edit its details
- **Edit title and alt text** for SEO and accessibility
- **Add tags** to organize images (comma-separated)
- **Copy Asset ID** to reference the image in content slots
- **Copy URL** to use the image elsewhere
- **Archive** to hide an image without deleting it
- **Delete** to permanently remove an image (use with caution)

### Image Guidelines

For best results, use the following image specifications:

- **Hero Background**: 1600x900px or larger, WebP format recommended
- **Category Tiles**: 900x600px or 600x400px, WebP format recommended
- **File Size**: Keep under 1MB for optimal performance
- **Format**: WebP is preferred, but JPEG and PNG are also supported

## Managing Content Slots

### What are Content Slots?

Content slots are predefined areas on your site where you can change images and text. Each slot has:

- **Image Source** - Either a custom uploaded image or the original fallback image
- **Alt Text** - Accessibility text describing the image
- **Headline** - Main text (if applicable)
- **Subheadline** - Supporting text (if applicable)
- **Enabled/Disabled** - Toggle to show or hide content

### Available Content Slots

The following content slots are currently available:

- `home.hero.background` - Homepage hero background image and headline
- `home.categoryTile.banners` - Banners category tile image
- `home.categoryTile.yardSigns` - Yard Signs category tile image
- `home.categoryTile.rigidSigns` - Rigid Signs category tile image
- `home.categoryTile.decals` - Decals category tile image
- `home.categoryTile.vehicle` - Vehicle Graphics category tile image
- `home.categoryTile.flags` - Flags category tile image
- `home.categoryTile.tradeShow` - Trade Show category tile image

### Editing Content

1. Navigate to `/admin/content`
2. Click on any content slot to edit it
3. Make your changes:
   - **Select an image** from your media library or use the fallback
   - **Update alt text** for accessibility
   - **Edit headline and subheadline** text
   - **Toggle enabled/disabled** to show or hide the content

4. Changes are saved to **Draft** automatically

### Preview Mode

Before publishing, you can preview your changes:

1. Click the "Preview Draft" toggle in the content manager
2. Navigate to your site (e.g., the homepage) in a new tab
3. You'll see your draft changes instead of the published content
4. Turn off Preview Mode to see the published version

### Publishing Changes

When you're ready to make your changes live:

1. Review all your draft changes in the Content Manager
2. Click the "Publish All" button
3. Optionally add notes describing what you changed
4. Confirm to publish

All draft content will become the published content immediately.

### Rollback to Previous Version

If you need to undo your changes:

1. Click the "Versions" button in the Content Manager
2. Browse the version history
3. Click "Rollback" on any previous version
4. Confirm to restore that version

This will:
- Set both published and draft content to that version
- Allow you to republish if needed

## Best Practices

### Image Management

1. **Use descriptive titles** - Makes finding images easier later
2. **Always add alt text** - Improves SEO and accessibility
3. **Tag your images** - Use tags like "hero", "category", "seasonal" to organize
4. **Optimize before uploading** - Compress images to reduce file size
5. **Use WebP format** - Better compression and quality than JPEG

### Content Management

1. **Preview before publishing** - Always check how changes look on the site
2. **Add version notes** - Helps track what changed and why
3. **Don't disable critical slots** - Keep important content enabled
4. **Test on mobile** - Check how images and text look on smaller screens
5. **Keep backups** - The version system helps, but note major changes

### Safety Features

The system includes several safety features:

- **Fallback images** - If a slot is misconfigured, the original image displays
- **Draft/Publish workflow** - Changes don't go live until you publish
- **Version history** - You can always rollback to previous versions
- **RLS security** - Only admins can modify content
- **Soft delete** - Archiving doesn't permanently delete images

## Troubleshooting

### Can't Access Admin Area

- Verify your user has the `admin` role in the `profiles` table
- Try logging out and logging back in
- Check browser console for any error messages

### Image Won't Upload

- Ensure file size is under 10MB
- Check that file format is supported (JPEG, PNG, WebP, GIF)
- Verify Supabase Storage bucket is created and accessible
- Check browser console for error details

### Changes Not Appearing

- Make sure you clicked "Publish All" to publish changes
- Clear your browser cache and reload
- Check if the content slot is enabled
- Verify the image hasn't been archived

### Preview Mode Not Working

- Ensure you're logged in as an admin
- Try turning Preview Mode off and back on
- Clear the cache with `contentResolver.clearCache()` in console
- Check browser console for errors

## Technical Details

### Database Tables

- **profiles** - Stores user roles (user or admin)
- **media_assets** - Stores uploaded images and metadata
- **content_slots** - Stores draft and published content
- **content_versions** - Stores version history for rollback

### Storage

Images are stored in Supabase Storage in the `media-library` bucket. The bucket is automatically created when you upload your first image.

### Security

All content management operations are protected by Row Level Security (RLS) policies that:

- Allow only admins to upload and modify content
- Prevent unauthorized access to draft content
- Ensure data integrity and prevent data loss

### Content Resolver

The `contentResolver` utility:

- Loads content slots from the database
- Caches content for performance
- Provides fallbacks if content is missing
- Supports preview mode for admins

## Support

For technical issues or questions:

1. Check the browser console for error messages
2. Review the RLS policies in Supabase
3. Verify your admin role is set correctly
4. Check the version history for unexpected changes

## Future Enhancements

Potential future features:

- Scheduled publishing
- Multi-language content
- Content approval workflows
- Image cropping and editing
- Bulk operations
- User management interface

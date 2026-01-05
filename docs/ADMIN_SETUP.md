# Admin Setup Guide

This guide explains how to set up admin access and use the content management features.

## Creating Your First Admin User

After signing up for an account, you'll need to promote it to admin status using the database.

### Step 1: Sign Up
1. Go to `/signup` and create an account
2. Log in with your new account

### Step 2: Promote to Admin
Execute this SQL query in your Supabase SQL Editor, replacing the email with your account email:

```sql
-- Find your user ID
SELECT id, email FROM auth.users WHERE email = 'your-email@example.com';

-- Update your profile to admin
UPDATE profiles
SET role = 'admin', updated_at = now()
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'your-email@example.com');

-- If no profile exists, create one
INSERT INTO profiles (user_id, role)
SELECT id, 'admin'
FROM auth.users
WHERE email = 'your-email@example.com'
ON CONFLICT (user_id) DO UPDATE SET role = 'admin';
```

### Step 3: Access Admin Features
1. Log out and log back in
2. Click the user icon in the header
3. You should now see admin links in the dropdown

## Using the Media Library

### Uploading Images
1. Navigate to Admin > Media Library
2. Click "Upload Image"
3. Select an image file (JPEG, PNG, WebP, or GIF)
4. The image will be uploaded to Supabase Storage
5. You can edit the title, alt text, and tags after upload

### Storage Bucket
The first time you upload an image, a storage bucket called `media-library` will be created automatically. Storage policies have been configured to:
- Allow admin users to upload, update, and delete files
- Allow public read access so images display on your site

If uploads fail:
1. Ensure you're logged in as an admin user (check your profile role in database)
2. Check that your Supabase project has storage enabled
3. Verify the storage policies are in place (run the latest migration)
4. Check browser console for specific error messages
5. Try logging out and back in to refresh your session

## Using Content Slots

Content slots let you manage images and text used throughout the site without changing code.

### Editing a Slot
1. Navigate to Admin > Content Slots
2. Click on any content slot to edit it
3. Choose between:
   - **Fallback Image**: The default image included with the site
   - **Custom Upload**: An image you've uploaded to the Media Library

### Image Selection
When editing a slot, you'll see visual previews of all available images. Click on an image to select it. The large preview at the bottom shows how it will appear on the site.

### Draft and Publish Workflow
1. Changes are saved as drafts automatically
2. Drafts don't affect the live site
3. Click "Publish All" to make all draft changes live
4. This creates a version snapshot for rollback

### Preview Mode
- Toggle "Preview Draft" to see how changes will look before publishing
- This only affects your browser session
- Other users will still see the published version

## Troubleshooting

### Upload Failed Error
If you see "Failed to upload image. Please check console for details and ensure you have admin permissions":

1. **Check Admin Status**: Run this query to verify your role:
   ```sql
   SELECT u.email, p.role
   FROM auth.users u
   LEFT JOIN profiles p ON p.user_id = u.id
   WHERE u.email = 'your-email@example.com';
   ```
   If role is NULL or 'user', promote yourself to admin using the SQL in "Creating Your First Admin User" section.

2. **Create Missing Profile**: If you don't have a profile entry:
   ```sql
   INSERT INTO profiles (user_id, role)
   SELECT id, 'admin'
   FROM auth.users
   WHERE email = 'your-email@example.com'
   ON CONFLICT (user_id) DO UPDATE SET role = 'admin';
   ```

3. **Log Out and Back In**: After changing roles, you must log out and log back in for the change to take effect.

4. **Check Browser Console**: Look for specific error messages that might indicate the exact issue.

### Uploads Disappear
If uploaded images don't appear in the Media Library:
1. Check browser console for errors
2. Verify you're logged in as an admin user
3. Refresh the page after upload
4. Check the database to see if the record was created:
   ```sql
   SELECT * FROM media_assets ORDER BY created_at DESC LIMIT 5;
   ```

### Can't See Admin Links
If you don't see admin links in the header:
1. Verify your profile role is set to 'admin' in the database
2. Log out and log back in
3. Check browser console for authentication errors

### Images Don't Load
If images show as broken:
1. Check the Supabase Storage bucket is public
2. Verify the image URLs are correct in the database
3. Check browser network tab for failed requests
4. Try using fallback images instead

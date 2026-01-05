/*
  # Add Storage Bucket Policies for Media Library

  1. Storage Policies
    - Allow admins to upload files to media-library bucket
    - Allow admins to update files in media-library bucket
    - Allow admins to delete files from media-library bucket
    - Allow everyone (public) to read files from media-library bucket

  2. Important Notes
    - Storage policies use storage.foldername syntax
    - Public read access allows images to display on the site
    - Only admin users can upload/modify/delete files
*/

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admins can upload media" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update media" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete media" ON storage.objects;
DROP POLICY IF EXISTS "Public can view media" ON storage.objects;

-- Allow admins to upload/insert objects
CREATE POLICY "Admins can upload media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'media-library' AND
  is_admin()
);

-- Allow admins to update objects
CREATE POLICY "Admins can update media"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'media-library' AND is_admin())
WITH CHECK (bucket_id = 'media-library' AND is_admin());

-- Allow admins to delete objects
CREATE POLICY "Admins can delete media"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'media-library' AND is_admin());

-- Allow public read access to all media files
CREATE POLICY "Public can view media"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'media-library');

/*
  # Add Storage Bucket RLS Policies

  1. Storage Bucket Policies
    - Allow admins to create storage buckets
    - Allow admins to update storage buckets
    - Allow admins to delete storage buckets
    - Allow public to view bucket list

  2. Important Notes
    - This allows the media library to automatically create the bucket
    - Only admin users can manage buckets
*/

-- Allow admins to create buckets
CREATE POLICY "Admins can create buckets"
ON storage.buckets FOR INSERT
TO authenticated
WITH CHECK (is_admin());

-- Allow admins to update buckets
CREATE POLICY "Admins can update buckets"
ON storage.buckets FOR UPDATE
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- Allow admins to delete buckets
CREATE POLICY "Admins can delete buckets"
ON storage.buckets FOR DELETE
TO authenticated
USING (is_admin());

-- Allow anyone to view buckets (needed for checking if bucket exists)
CREATE POLICY "Anyone can view buckets"
ON storage.buckets FOR SELECT
TO public
USING (true);

/*
  # Allow Public Access to Content Slots

  1. Changes
    - Drop the existing SELECT policy that only allows authenticated users
    - Create a new policy that allows both authenticated AND anonymous users to read content slots
  
  2. Security
    - Public read access is safe for content_slots as this table contains only public-facing content
    - Write operations remain restricted to authenticated admin users only
*/

-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Anyone can view published content slots" ON content_slots;

-- Create new policy allowing both authenticated and anonymous users
CREATE POLICY "Public can view content slots"
  ON content_slots
  FOR SELECT
  TO authenticated, anon
  USING (true);

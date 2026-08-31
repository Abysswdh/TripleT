-- ============================================================================
-- 006_storage_buckets_avatars_banners.sql
-- Create `avatars` and `banners` public storage buckets with RLS policies
-- ============================================================================
-- Run in: Supabase Dashboard → SQL Editor → New Query → Run
-- ============================================================================

-- 1. Create public storage buckets for avatars & banners
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('avatars', 'avatars', true, 10485760, ARRAY['image/jpeg','image/png','image/gif','image/webp']),
  ('banners', 'banners', true, 15728640, ARRAY['image/jpeg','image/png','image/gif','image/webp'])
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 2. Drop existing policies to prevent naming conflicts
DROP POLICY IF EXISTS "Public can view avatars" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own avatars" ON storage.objects;

DROP POLICY IF EXISTS "Public can view banners" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload banners" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own banners" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own banners" ON storage.objects;

-- 3. Storage RLS Policies: `avatars`
-- Allow public (anyone) to view avatars
CREATE POLICY "Public can view avatars"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

-- Allow authenticated users to upload avatars
CREATE POLICY "Authenticated users can upload avatars"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'avatars');

-- Allow authenticated users to update/overwrite (upsert) avatars
CREATE POLICY "Users can update own avatars"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'avatars')
  WITH CHECK (bucket_id = 'avatars');

-- Allow authenticated users to delete avatars
CREATE POLICY "Users can delete own avatars"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'avatars');

-- 4. Storage RLS Policies: `banners`
-- Allow public (anyone) to view banners
CREATE POLICY "Public can view banners"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'banners');

-- Allow authenticated users to upload banners
CREATE POLICY "Authenticated users can upload banners"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'banners');

-- Allow authenticated users to update/overwrite (upsert) banners
CREATE POLICY "Users can update own banners"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'banners')
  WITH CHECK (bucket_id = 'banners');

-- Allow authenticated users to delete banners
CREATE POLICY "Users can delete own banners"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'banners');

-- ============================================================================
-- 005_add_profile_banner.sql
-- Add profile banner_url support mirroring avatar_url
-- ============================================================================
-- Execute in: Supabase Dashboard → SQL Editor → New Query → Run
-- ============================================================================

-- 1. Add banner_url column to public.users if not exists
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS banner_url TEXT;

-- Also add to client_profiles for symmetry if accessed directly
ALTER TABLE public.client_profiles ADD COLUMN IF NOT EXISTS banner_url TEXT;

-- 2. Update the handle_new_auth_user trigger to handle banner_url
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public, auth
LANGUAGE plpgsql
AS $$
DECLARE
  v_full_name TEXT;
  v_avatar_url TEXT;
  v_banner_url TEXT;
  v_role TEXT;
BEGIN
  -- Extract metadata safely
  v_full_name := COALESCE(NEW.raw_user_meta_data ->> 'full_name', '');
  v_avatar_url := COALESCE(NEW.raw_user_meta_data ->> 'avatar_url', '');
  v_banner_url := COALESCE(NEW.raw_user_meta_data ->> 'banner_url', NEW.raw_user_meta_data ->> 'cover_image', '');
  v_role := COALESCE(NEW.raw_user_meta_data ->> 'role', 'customer');

  -- First, delete any stale/orphaned public.users record with the same email but different ID
  IF NEW.email IS NOT NULL AND NEW.email != '' THEN
    DELETE FROM public.users WHERE email = NEW.email AND id != NEW.id;
  END IF;

  -- Insert or update user row in public.users
  INSERT INTO public.users (
    id,
    email,
    full_name,
    avatar_url,
    banner_url,
    role,
    is_active,
    is_verified,
    onboarding_completed,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    v_full_name,
    v_avatar_url,
    v_banner_url,
    v_role,
    true,
    false,
    false,
    now(),
    now()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = CASE WHEN public.users.full_name IS NULL OR public.users.full_name = '' THEN EXCLUDED.full_name ELSE public.users.full_name END,
    avatar_url = CASE WHEN public.users.avatar_url IS NULL OR public.users.avatar_url = '' THEN EXCLUDED.avatar_url ELSE public.users.avatar_url END,
    banner_url = CASE WHEN public.users.banner_url IS NULL OR public.users.banner_url = '' THEN EXCLUDED.banner_url ELSE public.users.banner_url END,
    updated_at = now();

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Never block auth user creation on trigger failure
  RAISE WARNING 'handle_new_auth_user notice: %', SQLERRM;
  RETURN NEW;
END;
$$;

-- 3. Ensure 'banners' storage bucket exists in storage.buckets
INSERT INTO storage.buckets (id, name, public)
VALUES ('banners', 'banners', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 4. Storage policies for 'banners' bucket
DO $$
BEGIN
  -- Public Read Policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Public read access on banners' AND tablename = 'objects'
  ) THEN
    CREATE POLICY "Public read access on banners"
      ON storage.objects FOR SELECT
      USING (bucket_id = 'banners');
  END IF;

  -- Authenticated Upload Policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users can upload banners' AND tablename = 'objects'
  ) THEN
    CREATE POLICY "Authenticated users can upload banners"
      ON storage.objects FOR INSERT
      TO authenticated
      WITH CHECK (bucket_id = 'banners');
  END IF;

  -- Authenticated Update Policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Users can update own banners' AND tablename = 'objects'
  ) THEN
    CREATE POLICY "Users can update own banners"
      ON storage.objects FOR UPDATE
      TO authenticated
      USING (bucket_id = 'banners');
  END IF;

  -- Authenticated Delete Policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Users can delete own banners' AND tablename = 'objects'
  ) THEN
    CREATE POLICY "Users can delete own banners"
      ON storage.objects FOR DELETE
      TO authenticated
      USING (bucket_id = 'banners');
  END IF;
END;
$$;

-- 5. Explicitly grant permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role, supabase_auth_admin;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role, supabase_auth_admin;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role, supabase_auth_admin;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO postgres, anon, authenticated, service_role, supabase_auth_admin;

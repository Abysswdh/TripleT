-- ============================================================================
-- 004_fix_auth_trigger.sql
-- Fix "Database error saving new user" during Supabase Auth Sign Up
-- ============================================================================
-- Execute in: Supabase Dashboard → SQL Editor → New Query → Run
-- ============================================================================

-- 1. Ensure public.users table exists with correct schema
CREATE TABLE IF NOT EXISTS public.users (
  id             UUID PRIMARY KEY,  -- matches auth.users.id
  email          VARCHAR(255) NOT NULL UNIQUE,
  full_name      VARCHAR(255),
  avatar_url     TEXT,
  bio            TEXT,
  role           VARCHAR(50) NOT NULL DEFAULT 'customer',
  phone          VARCHAR(30),
  location       VARCHAR(255),
  timezone       VARCHAR(100),
  is_active      BOOLEAN NOT NULL DEFAULT true,
  is_verified    BOOLEAN NOT NULL DEFAULT false,
  onboarding_completed BOOLEAN NOT NULL DEFAULT false,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Drop legacy trigger & function if any
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_auth_user();

-- 3. Create a bulletproof SECURITY DEFINER trigger function
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public, auth
LANGUAGE plpgsql
AS $$
DECLARE
  v_full_name TEXT;
  v_avatar_url TEXT;
  v_role TEXT;
BEGIN
  -- Extract metadata safely
  v_full_name := COALESCE(NEW.raw_user_meta_data ->> 'full_name', '');
  v_avatar_url := COALESCE(NEW.raw_user_meta_data ->> 'avatar_url', '');
  v_role := COALESCE(NEW.raw_user_meta_data ->> 'role', 'customer');

  -- First, delete any stale/orphaned public.users record with the same email but different ID (prevent unique constraint violation)
  IF NEW.email IS NOT NULL AND NEW.email != '' THEN
    DELETE FROM public.users WHERE email = NEW.email AND id != NEW.id;
  END IF;

  -- Insert or update user row in public.users
  INSERT INTO public.users (
    id,
    email,
    full_name,
    avatar_url,
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
    updated_at = now();

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Never block auth user creation on trigger failure
  RAISE WARNING 'handle_new_auth_user notice: %', SQLERRM;
  RETURN NEW;
END;
$$;

-- 4. Reattach the trigger to auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

-- 5. Explicitly grant permissions to all Supabase roles including supabase_auth_admin
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role, supabase_auth_admin;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role, supabase_auth_admin;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role, supabase_auth_admin;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO postgres, anon, authenticated, service_role, supabase_auth_admin;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres, anon, authenticated, service_role, supabase_auth_admin;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres, anon, authenticated, service_role, supabase_auth_admin;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON ROUTINES TO postgres, anon, authenticated, service_role, supabase_auth_admin;

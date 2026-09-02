-- ============================================================================
-- 009_dual_role_onboarding_flags.sql
-- Add independent onboarding completion flags for dual-role switching
-- ============================================================================
-- Execute in: Supabase Dashboard → SQL Editor → New Query → Run
--
-- Features:
-- 1. Add `freelancer_onboarded` and `client_onboarded` boolean flags to public.users
-- 2. Backfill existing users according to their active role & onboarding status
-- 3. Update auth user trigger defaults
-- ============================================================================

-- 1. Add columns to public.users
ALTER TABLE public.users 
  ADD COLUMN IF NOT EXISTS freelancer_onboarded BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS client_onboarded BOOLEAN NOT NULL DEFAULT false;

-- 2. Backfill existing users
UPDATE public.users
SET client_onboarded = true
WHERE (role = 'customer' OR role = 'client') AND onboarding_completed = true;

UPDATE public.users
SET freelancer_onboarded = true
WHERE role = 'freelancer' AND onboarding_completed = true;

-- 3. Update handle_new_auth_user function to support the flags safely
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
  v_default_avatar TEXT := 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80';
  v_default_banner TEXT := 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200&auto=format&fit=crop&q=80';
BEGIN
  v_full_name := COALESCE(NEW.raw_user_meta_data ->> 'full_name', '');
  
  v_avatar_url := COALESCE(NULLIF(NEW.raw_user_meta_data ->> 'avatar_url', ''), v_default_avatar);
  IF v_avatar_url NOT LIKE 'http%' THEN
    v_avatar_url := v_default_avatar;
  END IF;

  v_banner_url := COALESCE(NULLIF(NEW.raw_user_meta_data ->> 'banner_url', ''), v_default_banner);
  IF v_banner_url NOT LIKE 'http%' THEN
    v_banner_url := v_default_banner;
  END IF;

  v_role := COALESCE(NEW.raw_user_meta_data ->> 'role', 'customer');

  IF NEW.email IS NOT NULL AND NEW.email != '' THEN
    DELETE FROM public.users WHERE email = NEW.email AND id != NEW.id;
  END IF;

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
    freelancer_onboarded,
    client_onboarded,
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
    false,
    false,
    now(),
    now()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = CASE WHEN public.users.full_name IS NULL OR public.users.full_name = '' THEN EXCLUDED.full_name ELSE public.users.full_name END,
    avatar_url = CASE WHEN public.users.avatar_url IS NULL OR public.users.avatar_url = '' OR public.users.avatar_url NOT LIKE 'http%' THEN EXCLUDED.avatar_url ELSE public.users.avatar_url END,
    banner_url = CASE WHEN public.users.banner_url IS NULL OR public.users.banner_url = '' OR public.users.banner_url NOT LIKE 'http%' THEN EXCLUDED.banner_url ELSE public.users.banner_url END,
    updated_at = now();

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'handle_new_auth_user notice: %', SQLERRM;
  RETURN NEW;
END;
$$;

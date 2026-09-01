-- ============================================================================
-- 007_dual_role_unified_account.sql
-- Unified Dual-Role (Switch Mode) Architecture & Default Profile Media
-- ============================================================================
-- Execute in: Supabase Dashboard → SQL Editor → New Query → Run
--
-- Features:
-- 1. Anti-Self-Dealing Database Triggers for Proposals & Contracts
-- 2. Standardized Default Avatar & Banner for All Accounts
-- 3. Dual-Profile Auto-Initialization for New Users
-- 4. Data Backfill & Cleanup for Existing Accounts
-- 5. RLS policies ensuring full control over own freelancer & client profiles
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. ANTI SELF-DEALING TRIGGERS
-- ----------------------------------------------------------------------------

-- Function: Check that project owner cannot submit proposal to their own project
CREATE OR REPLACE FUNCTION public.check_proposal_anti_self_dealing()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_owner_id UUID;
BEGIN
  SELECT owner_id INTO v_owner_id FROM public.projects WHERE id = NEW.project_id;
  
  IF v_owner_id IS NOT NULL AND v_owner_id = NEW.freelancer_id THEN
    RAISE EXCEPTION 'Anti-Self-Dealing Error: You cannot submit a proposal to a project that you own (owner_id = %)', v_owner_id;
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_proposal_anti_self_dealing ON public.proposals;
CREATE TRIGGER trg_proposal_anti_self_dealing
  BEFORE INSERT OR UPDATE ON public.proposals
  FOR EACH ROW EXECUTE FUNCTION public.check_proposal_anti_self_dealing();


-- Function: Check that client and freelancer cannot be the same user on a contract
CREATE OR REPLACE FUNCTION public.check_contract_anti_self_dealing()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NEW.client_id = NEW.freelancer_id THEN
    RAISE EXCEPTION 'Anti-Self-Dealing Error: Client and Freelancer cannot be the same user on a contract (user_id = %)', NEW.client_id;
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_contract_anti_self_dealing ON public.contracts;
CREATE TRIGGER trg_contract_anti_self_dealing
  BEFORE INSERT OR UPDATE ON public.contracts
  FOR EACH ROW EXECUTE FUNCTION public.check_contract_anti_self_dealing();


-- ----------------------------------------------------------------------------
-- 2. AUTH USER SIGNUP TRIGGER (Standardized Default Profile Pic & Banner)
-- ----------------------------------------------------------------------------

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
  -- Extract metadata safely and provide standardized default media
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

  -- Delete any orphaned public.users record with the same email but different ID
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
    avatar_url = CASE WHEN public.users.avatar_url IS NULL OR public.users.avatar_url = '' OR public.users.avatar_url NOT LIKE 'http%' THEN EXCLUDED.avatar_url ELSE public.users.avatar_url END,
    banner_url = CASE WHEN public.users.banner_url IS NULL OR public.users.banner_url = '' OR public.users.banner_url NOT LIKE 'http%' THEN EXCLUDED.banner_url ELSE public.users.banner_url END,
    updated_at = now();

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'handle_new_auth_user notice: %', SQLERRM;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();


-- ----------------------------------------------------------------------------
-- 3. DUAL-PROFILE AUTO-INITIALIZATION TRIGGER
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.ensure_user_dual_profiles()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_display_name TEXT;
  v_default_banner TEXT := 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200&auto=format&fit=crop&q=80';
BEGIN
  v_display_name := COALESCE(NEW.full_name, split_part(NEW.email, '@', 1), 'User');

  -- 1. Ensure freelancer_profile row exists
  INSERT INTO public.freelancer_profiles (
    user_id,
    headline,
    hourly_rate,
    availability,
    skills,
    cover_image,
    rating,
    reviews_count,
    completed_projects
  )
  VALUES (
    NEW.id,
    'Digital Specialist',
    200000,
    'semi_full',
    ARRAY['UI/UX Design', 'Web Development'],
    v_default_banner,
    5.00,
    0,
    0
  )
  ON CONFLICT (user_id) DO NOTHING;

  -- 2. Ensure client_profile row exists
  INSERT INTO public.client_profiles (
    user_id,
    company_name,
    company_size,
    industry,
    banner_url,
    is_verified
  )
  VALUES (
    NEW.id,
    v_display_name,
    '1-10 Karyawan (UMKM)',
    'Teknologi & Bisnis',
    v_default_banner,
    false
  )
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'ensure_user_dual_profiles notice: %', SQLERRM;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_ensure_user_dual_profiles ON public.users;
CREATE TRIGGER trg_ensure_user_dual_profiles
  AFTER INSERT ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.ensure_user_dual_profiles();


-- ----------------------------------------------------------------------------
-- 4. DATA BACKFILL & CLEANUP FOR EXISTING USERS
-- ----------------------------------------------------------------------------

-- A. Clean up avatar_url and banner_url in public.users
UPDATE public.users
SET 
  avatar_url = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80'
WHERE avatar_url IS NULL OR avatar_url = '' OR avatar_url = 'avatar-1' OR avatar_url NOT LIKE 'http%';

UPDATE public.users
SET 
  banner_url = 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200&auto=format&fit=crop&q=80'
WHERE banner_url IS NULL OR banner_url = '' OR banner_url NOT LIKE 'http%';

-- B. Backfill freelancer_profiles for existing users missing them
INSERT INTO public.freelancer_profiles (
  user_id,
  headline,
  hourly_rate,
  availability,
  skills,
  cover_image,
  rating,
  reviews_count,
  completed_projects
)
SELECT 
  u.id,
  'Digital Specialist',
  200000,
  'semi_full',
  ARRAY['UI/UX Design', 'Web Development'],
  'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200&auto=format&fit=crop&q=80',
  5.00,
  0,
  0
FROM public.users u
LEFT JOIN public.freelancer_profiles fp ON fp.user_id = u.id
WHERE fp.id IS NULL
ON CONFLICT (user_id) DO NOTHING;

-- C. Backfill client_profiles for existing users missing them
INSERT INTO public.client_profiles (
  user_id,
  company_name,
  company_size,
  industry,
  banner_url,
  is_verified
)
SELECT 
  u.id,
  COALESCE(u.full_name, split_part(u.email, '@', 1), 'Perusahaan Klien'),
  '1-10 Karyawan (UMKM)',
  'Teknologi & Bisnis',
  'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200&auto=format&fit=crop&q=80',
  false
FROM public.users u
LEFT JOIN public.client_profiles cp ON cp.user_id = u.id
WHERE cp.id IS NULL
ON CONFLICT (user_id) DO NOTHING;


-- ----------------------------------------------------------------------------
-- 5. PERMISSIONS & RLS POLICIES FOR DUAL PROFILES
-- ----------------------------------------------------------------------------

-- freelancer_profiles RLS
ALTER TABLE public.freelancer_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view freelancer profiles" ON public.freelancer_profiles;
CREATE POLICY "Anyone can view freelancer profiles"
  ON public.freelancer_profiles FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Users can insert own freelancer profile" ON public.freelancer_profiles;
CREATE POLICY "Users can insert own freelancer profile"
  ON public.freelancer_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own freelancer profile" ON public.freelancer_profiles;
CREATE POLICY "Users can update own freelancer profile"
  ON public.freelancer_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);


-- client_profiles RLS
ALTER TABLE public.client_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view client profiles" ON public.client_profiles;
CREATE POLICY "Anyone can view client profiles"
  ON public.client_profiles FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Users can insert own client profile" ON public.client_profiles;
CREATE POLICY "Users can insert own client profile"
  ON public.client_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own client profile" ON public.client_profiles;
CREATE POLICY "Users can update own client profile"
  ON public.client_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Explicit Grants
GRANT ALL ON public.freelancer_profiles TO authenticated, anon, service_role;
GRANT ALL ON public.client_profiles TO authenticated, anon, service_role;

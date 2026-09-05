-- ============================================================================
-- 017_sync_portfolio_links_and_projects.sql
-- Synchronize Portfolio Links & Ensure Public Profile Visibility
-- ============================================================================

-- 1. Backfill existing auth.users raw_user_meta_data links into public.freelancer_profiles
UPDATE public.freelancer_profiles fp
SET 
  github_url = COALESCE(NULLIF(fp.github_url, ''), NULLIF(au.raw_user_meta_data ->> 'github_url', '')),
  linkedin_url = COALESCE(NULLIF(fp.linkedin_url, ''), NULLIF(au.raw_user_meta_data ->> 'linkedin_url', '')),
  portfolio_url = COALESCE(NULLIF(fp.portfolio_url, ''), NULLIF(au.raw_user_meta_data ->> 'portfolio_url', '')),
  updated_at = NOW()
FROM auth.users au
WHERE fp.user_id = au.id
  AND (
    (fp.github_url IS NULL AND au.raw_user_meta_data ->> 'github_url' IS NOT NULL) OR
    (fp.linkedin_url IS NULL AND au.raw_user_meta_data ->> 'linkedin_url' IS NOT NULL) OR
    (fp.portfolio_url IS NULL AND au.raw_user_meta_data ->> 'portfolio_url' IS NOT NULL)
  );

-- 2. Trigger function to auto-sync metadata links on auth.users update/insert
CREATE OR REPLACE FUNCTION public.sync_auth_user_portfolio_links()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_github TEXT;
  v_linkedin TEXT;
  v_portfolio TEXT;
BEGIN
  v_github := NULLIF(NEW.raw_user_meta_data ->> 'github_url', '');
  v_linkedin := NULLIF(NEW.raw_user_meta_data ->> 'linkedin_url', '');
  v_portfolio := NULLIF(NEW.raw_user_meta_data ->> 'portfolio_url', '');

  IF v_github IS NOT NULL OR v_linkedin IS NOT NULL OR v_portfolio IS NOT NULL THEN
    UPDATE public.freelancer_profiles
    SET 
      github_url = COALESCE(v_github, github_url),
      linkedin_url = COALESCE(v_linkedin, linkedin_url),
      portfolio_url = COALESCE(v_portfolio, portfolio_url),
      updated_at = NOW()
    WHERE user_id = NEW.id;
  END IF;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_auth_user_portfolio_links ON auth.users;
CREATE TRIGGER trg_sync_auth_user_portfolio_links
  AFTER INSERT OR UPDATE OF raw_user_meta_data ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.sync_auth_user_portfolio_links();

-- 3. Ensure portfolio_projects RLS policy allows public viewing
DROP POLICY IF EXISTS "Portfolio projects are publicly viewable" ON public.portfolio_projects;
CREATE POLICY "Portfolio projects are publicly viewable"
  ON public.portfolio_projects FOR SELECT
  TO anon, authenticated
  USING (true);

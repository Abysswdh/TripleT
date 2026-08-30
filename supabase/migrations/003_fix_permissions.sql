-- ============================================================================
-- Doable! — Fix Table Permissions & Grant Access
-- ============================================================================
-- Run this in: Supabase Dashboard → SQL Editor → New Query → Paste & Run
-- This solves the "permission denied for table projects" error by granting
-- table and schema permissions to Supabase's `authenticated` and `anon` roles.
-- ============================================================================

-- 1. Grant Schema Usage
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

-- 2. Grant Permissions on All Tables in Public Schema
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, service_role;

-- 3. Set Default Privileges for Future Tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON ROUTINES TO anon, authenticated, service_role;

-- 4. Ensure Users Table Allows Profile Creation & Upsert by Authenticated Users
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
CREATE POLICY "Users can insert own profile"
  ON public.users FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can view all users" ON public.users;
CREATE POLICY "Users can view all users"
  ON public.users FOR SELECT TO anon, authenticated
  USING (true);

-- 5. Allow Public Viewing of Open Projects & Talents for Visitors
DROP POLICY IF EXISTS "Anyone can view open projects" ON public.projects;
CREATE POLICY "Anyone can view open projects"
  ON public.projects FOR SELECT TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Anyone can view freelancer profiles" ON public.freelancer_profiles;
CREATE POLICY "Anyone can view freelancer profiles"
  ON public.freelancer_profiles FOR SELECT TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Anyone can view client profiles" ON public.client_profiles;
CREATE POLICY "Anyone can view client profiles"
  ON public.client_profiles FOR SELECT TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Milestones viewable by all" ON public.milestones;
CREATE POLICY "Milestones viewable by all"
  ON public.milestones FOR SELECT TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Project tasks viewable by all" ON public.project_tasks;
CREATE POLICY "Project tasks viewable by all"
  ON public.project_tasks FOR SELECT TO anon, authenticated
  USING (true);

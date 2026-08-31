-- ============================================================================
-- 005_add_username_to_users.sql
-- Add `username` column to `public.users` table
-- ============================================================================
-- Run in: Supabase Dashboard → SQL Editor → New Query → Run
-- ============================================================================

-- 1. Add username column to public.users table
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS username VARCHAR(100) UNIQUE;

-- 2. Create index for fast username search & lookup
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users (username);

-- 3. Backfill default usernames for existing users if any
UPDATE public.users
SET username = LOWER(REGEXP_REPLACE(SPLIT_PART(email, '@', 1), '[^a-zA-Z0-9_]', '', 'g'))
WHERE username IS NULL AND email IS NOT NULL AND email != '';

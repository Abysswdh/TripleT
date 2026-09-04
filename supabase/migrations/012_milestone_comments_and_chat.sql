-- ============================================================================
-- 012_milestone_comments_and_chat.sql
-- Create persistent milestone comments table, realtime support, and chat attachments bucket config
-- ============================================================================

-- 1. Create milestone_comments table
CREATE TABLE IF NOT EXISTS public.milestone_comments (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id    UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  milestone_id  VARCHAR(100) NOT NULL,
  author_id     UUID REFERENCES public.users(id) ON DELETE SET NULL,
  author_name   VARCHAR(255) NOT NULL,
  author_avatar TEXT,
  role          VARCHAR(20) NOT NULL DEFAULT 'client', -- 'client' or 'freelancer'
  content       TEXT DEFAULT '',
  image_url     TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for fast querying by project and milestone
CREATE INDEX IF NOT EXISTS idx_milestone_comments_query 
  ON public.milestone_comments (project_id, milestone_id, created_at ASC);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.milestone_comments ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view milestone comments
DROP POLICY IF EXISTS "Authenticated users can view milestone comments" ON public.milestone_comments;
CREATE POLICY "Authenticated users can view milestone comments"
  ON public.milestone_comments FOR SELECT TO authenticated
  USING (true);

-- Allow authenticated users to insert milestone comments
DROP POLICY IF EXISTS "Authenticated users can insert milestone comments" ON public.milestone_comments;
CREATE POLICY "Authenticated users can insert milestone comments"
  ON public.milestone_comments FOR INSERT TO authenticated
  WITH CHECK (true);

-- Allow authors to delete own comments
DROP POLICY IF EXISTS "Authors can delete milestone comments" ON public.milestone_comments;
CREATE POLICY "Authors can delete milestone comments"
  ON public.milestone_comments FOR DELETE TO authenticated
  USING (auth.uid() = author_id);

-- 3. Configure storage bucket for chat attachments
INSERT INTO storage.buckets (id, name, public)
VALUES ('chat-attachments', 'chat-attachments', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage policies for chat attachments
DROP POLICY IF EXISTS "Public can view chat attachments" ON storage.objects;
CREATE POLICY "Public can view chat attachments"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'chat-attachments');

DROP POLICY IF EXISTS "Authenticated users can upload chat attachments" ON storage.objects;
CREATE POLICY "Authenticated users can upload chat attachments"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'chat-attachments');

-- 4. Enable Supabase Realtime for instant multi-user messaging
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
      AND schemaname = 'public' 
      AND tablename = 'milestone_comments'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.milestone_comments;
  END IF;
END $$;

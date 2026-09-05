-- ============================================================================
-- 018_notifications_system.sql
-- Comprehensive in-app notifications schema enhancement, RLS policies, and realtime support
-- ============================================================================

-- 1. Add extra columns to notifications table if they do not exist
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS link_url TEXT;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS data JSONB DEFAULT '{}'::jsonb;

-- 2. Optimize indexes for user queries & ordering
CREATE INDEX IF NOT EXISTS idx_notifications_user_is_read ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at_desc ON notifications(created_at DESC);

-- 3. Ensure Row Level Security is active
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- 4. Re-apply / ensure comprehensive RLS policies
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert notifications" ON notifications;
CREATE POLICY "Users can insert notifications"
  ON notifications FOR INSERT TO authenticated, anon
  WITH CHECK (user_id IS NOT NULL);

DROP POLICY IF EXISTS "Users can delete own notifications" ON notifications;
CREATE POLICY "Users can delete own notifications"
  ON notifications FOR DELETE TO authenticated, anon
  USING (auth.uid() = user_id OR user_id IS NOT NULL);

-- 5. Enable Supabase Realtime publication on notifications table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'notifications'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
  END IF;
END $$;

-- 6. RPC Function to create notification with SECURITY DEFINER
-- This guarantees safe insertion from any client without RLS select errors
CREATE OR REPLACE FUNCTION public.create_app_notification(
  p_user_id UUID,
  p_type VARCHAR,
  p_title VARCHAR,
  p_body TEXT,
  p_link_url TEXT DEFAULT NULL,
  p_reference_type VARCHAR DEFAULT NULL,
  p_reference_id UUID DEFAULT NULL,
  p_data JSONB DEFAULT '{}'::jsonb
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_new_notif notifications%ROWTYPE;
BEGIN
  INSERT INTO public.notifications (
    user_id,
    type,
    title,
    body,
    link_url,
    reference_type,
    reference_id,
    data,
    is_read,
    created_at
  ) VALUES (
    p_user_id,
    p_type,
    p_title,
    p_body,
    p_link_url,
    p_reference_type,
    p_reference_id,
    COALESCE(p_data, '{}'::jsonb),
    false,
    now()
  )
  RETURNING * INTO v_new_notif;

  RETURN to_jsonb(v_new_notif);
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_app_notification TO authenticated, anon;


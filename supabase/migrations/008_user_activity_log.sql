-- ============================================================================
-- Doable! — Migration 008: User Activity Log (Heatmap & Streak Tracking)
-- ============================================================================
-- Run this in: Supabase Dashboard → SQL Editor → New Query → Paste & Run
-- ============================================================================

-- 1. Create user_activity_log table
CREATE TABLE IF NOT EXISTS user_activity_log (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type TEXT        NOT NULL,
  -- Supported types:
  --   'quiz_completed'        — passed a skill verification quiz
  --   'quiz_attempted'        — attempted but did not pass
  --   'proposal_submitted'    — submitted a project proposal
  --   'milestone_delivered'   — submitted a milestone deliverable
  --   'contract_completed'    — project marked as fully complete
  --   'profile_updated'       — updated profile / onboarding
  --   'daily_checkin'         — manual daily check-in
  metadata      JSONB       DEFAULT '{}',
  -- e.g. { "quiz_id": "q-nextjs", "score": 100, "xp_earned": 350 }
  occurred_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Index: fast lookup per user, sorted by date (for heatmap queries)
CREATE INDEX IF NOT EXISTS idx_activity_log_user_date
  ON user_activity_log (user_id, occurred_at DESC);

-- 3. Index: fast lookup by activity type
CREATE INDEX IF NOT EXISTS idx_activity_log_type
  ON user_activity_log (activity_type);

-- 4. Enable Row Level Security
ALTER TABLE user_activity_log ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies
-- Users can only insert their own activity
CREATE POLICY "Users can insert own activity"
  ON user_activity_log FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Anyone can read activity for heatmaps/streaks
CREATE POLICY "Anyone can read activity logs for heatmap"
  ON user_activity_log FOR SELECT
  USING (true);

-- 6. Helper view: daily contribution counts per user (last 16 weeks)
CREATE OR REPLACE VIEW user_daily_contributions AS
SELECT
  user_id,
  DATE(occurred_at AT TIME ZONE 'Asia/Jakarta') AS activity_date,
  COUNT(*)                                        AS contribution_count
FROM user_activity_log
WHERE occurred_at >= (now() - INTERVAL '16 weeks')
GROUP BY user_id, DATE(occurred_at AT TIME ZONE 'Asia/Jakarta');

-- 7. Grant access to the view
GRANT SELECT ON user_daily_contributions TO authenticated;

-- ============================================================================
-- Backfill: seed initial activity entries from existing quiz results
-- (This uses user_metadata XP as a proxy — runs only if table is empty)
-- ============================================================================
-- NOTE: Real backfill happens via the frontend service on first load.
-- ============================================================================

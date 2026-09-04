-- ============================================================================
-- 013_milestone_deliverables.sql
-- Add deliverable submission and review tracking columns to contract_milestones & milestones
-- ============================================================================

-- 1. Extend contract_milestones table
ALTER TABLE public.contract_milestones 
  ADD COLUMN IF NOT EXISTS deliverable_file_url TEXT,
  ADD COLUMN IF NOT EXISTS deliverable_note TEXT,
  ADD COLUMN IF NOT EXISTS is_submitted_for_review BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMPTZ;

-- 2. Extend milestones table
ALTER TABLE public.milestones 
  ADD COLUMN IF NOT EXISTS deliverable_file_url TEXT,
  ADD COLUMN IF NOT EXISTS deliverable_note TEXT,
  ADD COLUMN IF NOT EXISTS is_submitted_for_review BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS status VARCHAR(30) DEFAULT 'pending';

-- 3. Ensure milestones table has RLS policy allowing project participants (client & hired freelancer) to update
ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view project milestones" ON public.milestones;
CREATE POLICY "Public can view project milestones"
  ON public.milestones FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Participants can update milestones" ON public.milestones;
CREATE POLICY "Participants can update milestones"
  ON public.milestones FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.projects 
      WHERE projects.id = milestones.project_id 
        AND (projects.owner_id = auth.uid() OR projects.freelancer_id = auth.uid())
    )
  );

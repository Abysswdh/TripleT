-- ============================================================================
-- 016_project_tasks_rls.sql
-- Allow project participants (owner and assigned freelancer) to manage project_tasks
-- ============================================================================

ALTER TABLE public.project_tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Project tasks viewable by all" ON public.project_tasks;
CREATE POLICY "Project tasks viewable by all"
  ON public.project_tasks FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Project tasks insertable/updatable by project owner" ON public.project_tasks;
DROP POLICY IF EXISTS "Participants can manage project tasks" ON public.project_tasks;

CREATE POLICY "Participants can manage project tasks"
  ON public.project_tasks FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.projects 
      WHERE projects.id = project_tasks.project_id 
        AND (projects.owner_id = auth.uid() OR projects.freelancer_id = auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects 
      WHERE projects.id = project_tasks.project_id 
        AND (projects.owner_id = auth.uid() OR projects.freelancer_id = auth.uid())
    )
  );

-- ============================================================================
-- 017_comprehensive_gantt_tasks.sql
-- Add progress, priority, cancellation, and dependency support to project_tasks
-- ============================================================================

ALTER TABLE public.project_tasks
  ADD COLUMN IF NOT EXISTS progress INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS priority VARCHAR(20) DEFAULT 'medium',
  ADD COLUMN IF NOT EXISTS is_cancelled BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS cancel_reason TEXT,
  ADD COLUMN IF NOT EXISTS dependency_task_id UUID REFERENCES public.project_tasks(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS assignee_id UUID REFERENCES public.users(id) ON DELETE SET NULL;

-- Create index for dependency lookups and task filtering
CREATE INDEX IF NOT EXISTS idx_project_tasks_dependency ON public.project_tasks(dependency_task_id);
CREATE INDEX IF NOT EXISTS idx_project_tasks_status ON public.project_tasks(project_id, status);
CREATE INDEX IF NOT EXISTS idx_project_tasks_dates ON public.project_tasks(project_id, start_date, end_date);

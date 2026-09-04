-- 010_project_proposals_count_trigger.sql
-- Automatically update projects.proposals_count on INSERT / DELETE of proposals with SECURITY DEFINER
-- This fixes the issue where proposals submitted by freelancers were not reflected in proposals_count
-- because RLS prevents non-owners from updating the projects table.

-- 1. Trigger function with SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.update_project_proposals_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.projects
    SET proposals_count = (
      SELECT count(*) FROM public.proposals WHERE project_id = NEW.project_id
    )
    WHERE id = NEW.project_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.projects
    SET proposals_count = (
      SELECT count(*) FROM public.proposals WHERE project_id = OLD.project_id
    )
    WHERE id = OLD.project_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Drop if exists and create trigger
DROP TRIGGER IF EXISTS trg_update_project_proposals_count ON public.proposals;

CREATE TRIGGER trg_update_project_proposals_count
AFTER INSERT OR DELETE ON public.proposals
FOR EACH ROW
EXECUTE FUNCTION public.update_project_proposals_count();

-- 3. Synchronize existing proposals_count for all projects
UPDATE public.projects p
SET proposals_count = (
  SELECT count(*) FROM public.proposals WHERE project_id = p.id
);

-- ==========================================================
-- Migration 015: Reviews RLS policies & automatic rating trigger
-- ==========================================================

-- 1. Enable RLS on reviews
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing restrictive policies on reviews
DROP POLICY IF EXISTS "Reviews are publicly viewable" ON public.reviews;
DROP POLICY IF EXISTS "Contract participants can create reviews" ON public.reviews;
DROP POLICY IF EXISTS "Reviewers can update own reviews" ON public.reviews;
DROP POLICY IF EXISTS "Reviewers can delete own reviews" ON public.reviews;
DROP POLICY IF EXISTS "Contract participants can manage reviews" ON public.reviews;
DROP POLICY IF EXISTS "Reviews are viewable by everyone" ON public.reviews;
DROP POLICY IF EXISTS "Authenticated users can insert reviews" ON public.reviews;
DROP POLICY IF EXISTS "Authenticated users can update reviews" ON public.reviews;
DROP POLICY IF EXISTS "Authenticated users can delete reviews" ON public.reviews;

-- 3. Comprehensive policies for reviews
-- SELECT: anyone authenticated or anon can view public reviews
CREATE POLICY "Reviews are viewable by everyone"
  ON public.reviews FOR SELECT
  TO anon, authenticated
  USING (true);

-- INSERT: Authenticated users can insert reviews where they are reviewer or contract participant
CREATE POLICY "Authenticated users can insert reviews"
  ON public.reviews FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = reviewer_id
    OR EXISTS (
      SELECT 1 FROM public.contracts c
      JOIN public.projects p ON p.id = c.project_id
      WHERE c.id = reviews.contract_id
      AND (c.freelancer_id = auth.uid() OR p.owner_id = auth.uid())
    )
  );

-- UPDATE: Authenticated reviewers or contract participants can update their reviews
CREATE POLICY "Authenticated users can update reviews"
  ON public.reviews FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = reviewer_id
    OR EXISTS (
      SELECT 1 FROM public.contracts c
      JOIN public.projects p ON p.id = c.project_id
      WHERE c.id = reviews.contract_id
      AND (c.freelancer_id = auth.uid() OR p.owner_id = auth.uid())
    )
  )
  WITH CHECK (
    auth.uid() = reviewer_id
    OR EXISTS (
      SELECT 1 FROM public.contracts c
      JOIN public.projects p ON p.id = c.project_id
      WHERE c.id = reviews.contract_id
      AND (c.freelancer_id = auth.uid() OR p.owner_id = auth.uid())
    )
  );

-- DELETE: Reviewers can delete their reviews
CREATE POLICY "Authenticated users can delete reviews"
  ON public.reviews FOR DELETE
  TO authenticated
  USING (auth.uid() = reviewer_id);

-- 4. Automatic trigger to recalculate freelancer_profiles rating and reviews_count
CREATE OR REPLACE FUNCTION public.update_freelancer_rating_stats()
RETURNS TRIGGER AS $$
DECLARE
    target_freelancer_id UUID;
    avg_score NUMERIC(3, 2);
    total_revs INTEGER;
BEGIN
    IF (TG_OP = 'DELETE') THEN
        target_freelancer_id := OLD.reviewee_id;
    ELSE
        target_freelancer_id := NEW.reviewee_id;
    END IF;

    IF target_freelancer_id IS NOT NULL THEN
        SELECT COALESCE(ROUND(AVG(rating)::numeric, 1), 0), COUNT(*)
        INTO avg_score, total_revs
        FROM public.reviews
        WHERE reviewee_id = target_freelancer_id;

        UPDATE public.freelancer_profiles
        SET rating = avg_score,
            reviews_count = total_revs,
            updated_at = NOW()
        WHERE user_id = target_freelancer_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_update_freelancer_rating ON public.reviews;
CREATE TRIGGER trg_update_freelancer_rating
AFTER INSERT OR UPDATE OR DELETE ON public.reviews
FOR EACH ROW
EXECUTE FUNCTION public.update_freelancer_rating_stats();

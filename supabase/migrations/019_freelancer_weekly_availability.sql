-- ============================================================================
-- 019_freelancer_weekly_availability.sql
-- Add weekly_availability column to freelancer_profiles table
-- ============================================================================

ALTER TABLE freelancer_profiles 
ADD COLUMN IF NOT EXISTS weekly_availability VARCHAR(50) DEFAULT 'semi_full';

-- Backfill weekly_availability from existing availability column where possible
UPDATE freelancer_profiles
SET weekly_availability = CASE
  WHEN availability ILIKE '%part_time%' OR availability ILIKE '%< 15%' THEN 'part_time'
  WHEN availability ILIKE '%full_time%' OR availability ILIKE '%> 30%' THEN 'full_time'
  WHEN availability ILIKE '%flex%' THEN 'flexible'
  ELSE 'semi_full'
END
WHERE weekly_availability IS NULL OR weekly_availability = '';

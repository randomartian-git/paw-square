-- Drop the old constraint that doesn't include reported_user_id
ALTER TABLE public.reports DROP CONSTRAINT IF EXISTS report_target_check;
ALTER TABLE public.reports DROP CONSTRAINT IF EXISTS reports_has_target;

-- Create new constraint that includes reported_user_id
ALTER TABLE public.reports
ADD CONSTRAINT reports_has_target CHECK (
  post_id IS NOT NULL OR comment_id IS NOT NULL OR reported_user_id IS NOT NULL
);
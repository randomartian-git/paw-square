-- Add reported_user_id column to reports table for user reports
ALTER TABLE public.reports
ADD COLUMN reported_user_id UUID;

-- Add a check constraint to ensure at least one target is specified
ALTER TABLE public.reports
ADD CONSTRAINT reports_has_target CHECK (
  post_id IS NOT NULL OR comment_id IS NOT NULL OR reported_user_id IS NOT NULL
);
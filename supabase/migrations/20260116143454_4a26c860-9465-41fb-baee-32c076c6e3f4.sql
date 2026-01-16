-- Create reports table for reporting posts and comments
CREATE TABLE public.reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reporter_id UUID NOT NULL,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  resolved_by UUID,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT report_target_check CHECK (
    (post_id IS NOT NULL AND comment_id IS NULL) OR 
    (post_id IS NULL AND comment_id IS NOT NULL)
  )
);

-- Enable RLS
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Users can create reports
CREATE POLICY "Users can create reports"
ON public.reports
FOR INSERT
WITH CHECK (auth.uid() = reporter_id);

-- Users can view their own reports
CREATE POLICY "Users can view their own reports"
ON public.reports
FOR SELECT
USING (auth.uid() = reporter_id);

-- Moderators can view all reports
CREATE POLICY "Moderators can view all reports"
ON public.reports
FOR SELECT
USING (is_moderator_or_admin(auth.uid()));

-- Moderators can update reports (resolve them)
CREATE POLICY "Moderators can update reports"
ON public.reports
FOR UPDATE
USING (is_moderator_or_admin(auth.uid()));

-- Moderators can delete reports
CREATE POLICY "Moderators can delete reports"
ON public.reports
FOR DELETE
USING (is_moderator_or_admin(auth.uid()));
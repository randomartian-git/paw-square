-- Create ai_usage table for rate limiting
CREATE TABLE public.ai_usage (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.ai_usage ENABLE ROW LEVEL SECURITY;

-- Users can only view their own usage
CREATE POLICY "Users can view their own usage"
  ON public.ai_usage
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own usage (logged by edge function)
CREATE POLICY "Users can insert their own usage"
  ON public.ai_usage
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create index for efficient rate limit queries
CREATE INDEX idx_ai_usage_user_created ON public.ai_usage (user_id, created_at DESC);

-- Auto-cleanup old records (optional: records older than 24 hours)
CREATE OR REPLACE FUNCTION public.cleanup_old_ai_usage()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.ai_usage 
  WHERE created_at < now() - interval '24 hours';
  RETURN NEW;
END;
$$;

-- Trigger to periodically clean up (runs on each insert)
CREATE TRIGGER cleanup_ai_usage_trigger
  AFTER INSERT ON public.ai_usage
  FOR EACH STATEMENT
  EXECUTE FUNCTION public.cleanup_old_ai_usage();
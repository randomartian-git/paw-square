-- Create user_bans table for temporarily or permanently banning users
CREATE TABLE public.user_bans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  banned_by UUID NOT NULL,
  reason TEXT NOT NULL,
  is_permanent BOOLEAN NOT NULL DEFAULT false,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_bans ENABLE ROW LEVEL SECURITY;

-- Moderators and admins can view all bans
CREATE POLICY "Moderators can view all bans"
ON public.user_bans
FOR SELECT
TO authenticated
USING (public.is_moderator_or_admin(auth.uid()));

-- Moderators and admins can create bans
CREATE POLICY "Moderators can create bans"
ON public.user_bans
FOR INSERT
TO authenticated
WITH CHECK (public.is_moderator_or_admin(auth.uid()));

-- Moderators and admins can update bans
CREATE POLICY "Moderators can update bans"
ON public.user_bans
FOR UPDATE
TO authenticated
USING (public.is_moderator_or_admin(auth.uid()));

-- Moderators and admins can delete bans
CREATE POLICY "Moderators can delete bans"
ON public.user_bans
FOR DELETE
TO authenticated
USING (public.is_moderator_or_admin(auth.uid()));

-- Users can check their own ban status
CREATE POLICY "Users can view their own bans"
ON public.user_bans
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Create a function to check if a user is banned
CREATE OR REPLACE FUNCTION public.is_user_banned(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_bans
    WHERE user_id = _user_id
      AND (is_permanent = true OR expires_at > now())
  )
$$;
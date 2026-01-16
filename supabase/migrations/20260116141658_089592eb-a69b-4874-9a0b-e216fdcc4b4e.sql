-- Create enum for app roles
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Create index for efficient queries
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create security definer function to check if user is moderator or admin
CREATE OR REPLACE FUNCTION public.is_moderator_or_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('moderator', 'admin')
  )
$$;

-- RLS Policies for user_roles
-- Anyone can view roles (needed for UI to show moderator badges)
CREATE POLICY "Roles are viewable by everyone"
ON public.user_roles
FOR SELECT
USING (true);

-- Only admins and moderators can insert roles
CREATE POLICY "Moderators can assign roles"
ON public.user_roles
FOR INSERT
WITH CHECK (public.is_moderator_or_admin(auth.uid()));

-- Only admins can delete roles
CREATE POLICY "Admins can delete roles"
ON public.user_roles
FOR DELETE
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));

-- Insert the first moderator (tanishreddy.g6@gmail.com)
INSERT INTO public.user_roles (user_id, role)
VALUES ('2f6a9507-2d06-4be2-b6ed-8edd2c6cb740', 'moderator');

-- Add moderator check to allow post deletion by moderators
DROP POLICY IF EXISTS "Users can delete their own posts" ON public.posts;
CREATE POLICY "Users and moderators can delete posts"
ON public.posts
FOR DELETE
USING (auth.uid() = user_id OR public.is_moderator_or_admin(auth.uid()));

-- Add moderator check to allow comment deletion by moderators
DROP POLICY IF EXISTS "Users can delete their own comments" ON public.comments;
CREATE POLICY "Users and moderators can delete comments"
ON public.comments
FOR DELETE
USING (auth.uid() = user_id OR public.is_moderator_or_admin(auth.uid()));
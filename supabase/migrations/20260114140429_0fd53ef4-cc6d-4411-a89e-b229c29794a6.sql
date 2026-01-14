-- Drop the existing overly permissive SELECT policy on likes table
DROP POLICY IF EXISTS "Likes are viewable by everyone" ON public.likes;

-- Create a new restrictive policy: users can only view their own likes
CREATE POLICY "Users can view their own likes"
ON public.likes
FOR SELECT
USING (auth.uid() = user_id);
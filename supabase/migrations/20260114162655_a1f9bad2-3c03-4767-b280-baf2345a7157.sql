-- Add flair column to profiles table to store selected flairs
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS flair text[] DEFAULT '{}';

-- Add custom_flair column for user-created custom flairs
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS custom_flair text DEFAULT NULL;
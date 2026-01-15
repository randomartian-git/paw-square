-- Add media_caption and video_url columns to posts table
ALTER TABLE public.posts 
ADD COLUMN media_caption text,
ADD COLUMN video_url text;
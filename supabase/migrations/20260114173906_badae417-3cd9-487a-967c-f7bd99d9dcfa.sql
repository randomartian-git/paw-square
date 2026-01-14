-- Create a table for pet photos gallery
CREATE TABLE public.pet_photos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pet_id UUID NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  photo_url TEXT NOT NULL,
  caption TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.pet_photos ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Pet photos are viewable by everyone"
ON public.pet_photos
FOR SELECT
USING (true);

CREATE POLICY "Users can upload photos for their own pets"
ON public.pet_photos
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own pet photos"
ON public.pet_photos
FOR DELETE
USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_pet_photos_pet_id ON public.pet_photos(pet_id);
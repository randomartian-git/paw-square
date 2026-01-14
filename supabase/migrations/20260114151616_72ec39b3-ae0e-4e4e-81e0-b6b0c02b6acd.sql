-- Create storage bucket for pet photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('pet-photos', 'pet-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload their own pet photos
CREATE POLICY "Users can upload their pet photos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'pet-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow authenticated users to update their own pet photos
CREATE POLICY "Users can update their pet photos"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'pet-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow authenticated users to delete their own pet photos
CREATE POLICY "Users can delete their pet photos"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'pet-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow public read access to pet photos
CREATE POLICY "Pet photos are publicly viewable"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'pet-photos');
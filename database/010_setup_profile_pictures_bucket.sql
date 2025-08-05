-- Migration: Set up profile-pictures storage bucket and policies
-- This migration creates the profile-pictures storage bucket and sets up proper RLS policies

-- Create the profile-pictures bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-pictures', 'profile-pictures', true)
ON CONFLICT (id) DO NOTHING;

-- Policy to allow authenticated users to upload images to their own folder
CREATE POLICY "Users can upload profile pictures to their own folder"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'profile-pictures' 
  AND auth.role() = 'authenticated'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy to allow anyone to view profile pictures (since bucket is public)
CREATE POLICY "Anyone can view profile pictures"
ON storage.objects FOR SELECT
USING (bucket_id = 'profile-pictures');

-- Policy to allow users to update their own profile pictures
CREATE POLICY "Users can update their own profile pictures"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'profile-pictures' 
  AND auth.role() = 'authenticated'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy to allow users to delete their own profile pictures
CREATE POLICY "Users can delete their own profile pictures"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'profile-pictures' 
  AND auth.role() = 'authenticated'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

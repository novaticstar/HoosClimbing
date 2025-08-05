-- Migration: Fix storage policies to handle both posts and events folders
-- This migration drops existing policies and recreates them with proper folder structure support

-- Drop existing policies first
DROP POLICY IF EXISTS "Users can upload images to their own folder" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own images" ON storage.objects;

-- Policy to allow authenticated users to upload images to their own folders
CREATE POLICY "Users can upload images to their own folder"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'posts' 
  AND auth.role() = 'authenticated'
  AND (
    -- For posts: posts/{user_id}/filename (direct user folder)
    (auth.uid()::text = (storage.foldername(name))[1] AND (storage.foldername(name))[1] IS NOT NULL)
    OR
    -- For events: events/{user_id}/filename  
    ((storage.foldername(name))[1] = 'events' AND auth.uid()::text = (storage.foldername(name))[2])
  )
);

-- Policy to allow users to update their own images
CREATE POLICY "Users can update their own images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'posts' 
  AND auth.role() = 'authenticated'
  AND (
    -- For posts: posts/{user_id}/filename (direct user folder)
    (auth.uid()::text = (storage.foldername(name))[1] AND (storage.foldername(name))[1] IS NOT NULL)
    OR
    -- For events: events/{user_id}/filename  
    ((storage.foldername(name))[1] = 'events' AND auth.uid()::text = (storage.foldername(name))[2])
  )
);

-- Policy to allow users to delete their own images
CREATE POLICY "Users can delete their own images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'posts' 
  AND auth.role() = 'authenticated'
  AND (
    -- For posts: posts/{user_id}/filename (direct user folder)
    (auth.uid()::text = (storage.foldername(name))[1] AND (storage.foldername(name))[1] IS NOT NULL)
    OR
    -- For events: events/{user_id}/filename  
    ((storage.foldername(name))[1] = 'events' AND auth.uid()::text = (storage.foldername(name))[2])
  )
);

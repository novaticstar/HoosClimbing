-- Migration: Enhanced Comments System with Replies and Likes
-- This migration adds support for comment replies and comment likes
-- to create an Instagram/TikTok-style commenting system

-- Add image_url column to feed table for post images
-- Note: This will store the full URL or path to images in the 'posts' storage bucket
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'feed' AND column_name = 'image_url') THEN
    ALTER TABLE public.feed ADD COLUMN image_url TEXT;
  END IF;
END $$;

-- Add parent_comment_id to comments table for replies (nested comments)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'comments' AND column_name = 'parent_comment_id') THEN
    ALTER TABLE public.comments ADD COLUMN parent_comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Add likes count to comments table
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'comments' AND column_name = 'likes') THEN
    ALTER TABLE public.comments ADD COLUMN likes INTEGER DEFAULT 0;
  END IF;
END $$;

-- Create comment_likes table for tracking who liked which comments
CREATE TABLE IF NOT EXISTS public.comment_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Ensure one like per user per comment
  CONSTRAINT unique_comment_like UNIQUE (user_id, comment_id)
);

-- Enable RLS on comment_likes table
ALTER TABLE public.comment_likes ENABLE ROW LEVEL SECURITY;

-- Policies for comment_likes table
CREATE POLICY "Authenticated users can view comment likes"
  ON public.comment_likes FOR SELECT
  USING (TRUE);

CREATE POLICY "Users can like comments"
  ON public.comment_likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike comments"
  ON public.comment_likes FOR DELETE
  USING (auth.uid() = user_id);

-- Function to update comment like count
CREATE OR REPLACE FUNCTION public.update_comment_like_count()
RETURNS TRIGGER AS $$
BEGIN
  -- Update like count for the affected comment
  IF TG_OP = 'DELETE' THEN
    UPDATE public.comments
    SET likes = (
      SELECT COUNT(*) FROM public.comment_likes WHERE comment_id = OLD.comment_id
    ),
    updated_at = NOW()
    WHERE id = OLD.comment_id;
    RETURN OLD;
  ELSE
    UPDATE public.comments
    SET likes = (
      SELECT COUNT(*) FROM public.comment_likes WHERE comment_id = NEW.comment_id
    ),
    updated_at = NOW()
    WHERE id = NEW.comment_id;
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Triggers for comment like count updates
DROP TRIGGER IF EXISTS comment_likes_after_insert ON public.comment_likes;
CREATE TRIGGER comment_likes_after_insert
  AFTER INSERT ON public.comment_likes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_comment_like_count();

DROP TRIGGER IF EXISTS comment_likes_after_delete ON public.comment_likes;
CREATE TRIGGER comment_likes_after_delete
  AFTER DELETE ON public.comment_likes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_comment_like_count();

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS comment_likes_user_id_idx ON public.comment_likes(user_id);
CREATE INDEX IF NOT EXISTS comment_likes_comment_id_idx ON public.comment_likes(comment_id);
CREATE INDEX IF NOT EXISTS comments_parent_comment_id_idx ON public.comments(parent_comment_id);
CREATE INDEX IF NOT EXISTS comments_likes_idx ON public.comments(likes);

-- Add constraint to prevent replies to replies (max 2 levels deep like Instagram)
-- Note: We'll use a trigger instead of CHECK constraint since PostgreSQL doesn't allow subqueries in CHECK
ALTER TABLE public.comments 
DROP CONSTRAINT IF EXISTS no_nested_replies;

-- Create function to prevent nested replies beyond 2 levels
CREATE OR REPLACE FUNCTION public.prevent_deep_nesting()
RETURNS TRIGGER AS $$
BEGIN
  -- If this is a reply (has parent_comment_id)
  IF NEW.parent_comment_id IS NOT NULL THEN
    -- Check if the parent comment is already a reply
    IF EXISTS (
      SELECT 1 FROM public.comments 
      WHERE id = NEW.parent_comment_id 
      AND parent_comment_id IS NOT NULL
    ) THEN
      RAISE EXCEPTION 'Cannot reply to a reply. Maximum nesting level is 2.';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to enforce nesting rules
DROP TRIGGER IF EXISTS prevent_deep_nesting_trigger ON public.comments;
CREATE TRIGGER prevent_deep_nesting_trigger
  BEFORE INSERT OR UPDATE ON public.comments
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_deep_nesting();

-- Update existing RLS policies to handle replies
DROP POLICY IF EXISTS "Users can update their own comment" ON public.comments;
CREATE POLICY "Users can update their own comment"
  ON public.comments FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own comment" ON public.comments;
CREATE POLICY "Users can delete their own comment"
  ON public.comments FOR DELETE
  USING (auth.uid() = user_id);

-- Helper function to get full image URL from storage bucket
-- This assumes you have a 'posts' bucket set up in Supabase Storage
CREATE OR REPLACE FUNCTION public.get_post_image_url(image_path TEXT)
RETURNS TEXT AS $$
BEGIN
  IF image_path IS NULL OR image_path = '' THEN
    RETURN NULL;
  END IF;
  
  -- Return the full URL for the image in the posts bucket
  -- Updated with your Supabase project URL
  RETURN 'https://lszaovkgknpurhsjksqu.supabase.co/storage/v1/object/public/posts/' || image_path;
END;
$$ LANGUAGE plpgsql;

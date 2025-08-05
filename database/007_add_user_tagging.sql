-- Migration: Add User Tagging System
-- This migration adds support for tagging users in posts and comments

-- Create post_tags table for tagging users in posts
CREATE TABLE IF NOT EXISTS public.post_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES public.feed(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  tagged_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Ensure one tag per user per post
  CONSTRAINT unique_post_tag UNIQUE (post_id, user_id)
);

-- Create comment_tags table for tagging users in comments
CREATE TABLE IF NOT EXISTS public.comment_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  tagged_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Ensure one tag per user per comment
  CONSTRAINT unique_comment_tag UNIQUE (comment_id, user_id)
);

-- Enable RLS on tagging tables
ALTER TABLE public.post_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comment_tags ENABLE ROW LEVEL SECURITY;

-- Policies for post_tags
CREATE POLICY "Authenticated users can view post tags"
  ON public.post_tags FOR SELECT
  USING (TRUE);

CREATE POLICY "Users can tag others in posts"
  ON public.post_tags FOR INSERT
  WITH CHECK (auth.uid() = tagged_by);

CREATE POLICY "Users can remove their own tags"
  ON public.post_tags FOR DELETE
  USING (auth.uid() = tagged_by);

-- Policies for comment_tags
CREATE POLICY "Authenticated users can view comment tags"
  ON public.comment_tags FOR SELECT
  USING (TRUE);

CREATE POLICY "Users can tag others in comments"
  ON public.comment_tags FOR INSERT
  WITH CHECK (auth.uid() = tagged_by);

CREATE POLICY "Users can remove their own comment tags"
  ON public.comment_tags FOR DELETE
  USING (auth.uid() = tagged_by);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS post_tags_post_id_idx ON public.post_tags(post_id);
CREATE INDEX IF NOT EXISTS post_tags_user_id_idx ON public.post_tags(user_id);
CREATE INDEX IF NOT EXISTS post_tags_tagged_by_idx ON public.post_tags(tagged_by);

CREATE INDEX IF NOT EXISTS comment_tags_comment_id_idx ON public.comment_tags(comment_id);
CREATE INDEX IF NOT EXISTS comment_tags_user_id_idx ON public.comment_tags(user_id);
CREATE INDEX IF NOT EXISTS comment_tags_tagged_by_idx ON public.comment_tags(tagged_by);

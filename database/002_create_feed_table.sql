-- Migration: Create feed table and enable RLS
-- This migration creates the feed table and sets up Row Level Security
-- Run this in your Supabase SQL editor

-- Create feed table
create table if not exists public.feed (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users on delete cascade,
  title text not null,
  description text,
  likes integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable Row Level Security
alter table public.feed enable row level security;

-- Policy 1: Authenticated users can view feed
create policy "Authenticated users can view feed"
  on public.feed for select
  using (true);

-- Policy 2: Users can insert their own posts
create policy "Users can insert their own feed item"
  on public.feed for insert
  with check (auth.uid() = user_id);

-- Policy 3: Users can update their own posts (e.g. description, likes)
create policy "Users can update their own feed item"
  on public.feed for update
  using (auth.uid() = user_id);

-- Create function to handle updated_at timestamp
create or replace function public.handle_feed_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Create trigger to auto-update updated_at column
create trigger feed_updated_at
  before update on public.feed
  for each row
  execute function public.handle_feed_updated_at();

-- Indexes for feed table
create index if not exists feed_user_id_idx on public.feed(user_id);
create index if not exists feed_created_at_idx on public.feed(created_at);

-- Create comments table
create table if not exists public.comments (
  id uuid primary key default uuid_generate_v4(),
  post_id uuid references public.feed on delete cascade,
  user_id uuid references auth.users on delete cascade,
  text text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS on comments
alter table public.comments enable row level security;

-- Policy 1: Authenticated users can view all comments
create policy "Authenticated users can view comments"
  on public.comments for select
  using (true);

-- Policy 2: Users can comment on posts
create policy "Users can insert their own comment"
  on public.comments for insert
  with check (auth.uid() = user_id);

-- Policy 3: Users can edit their own comment
create policy "Users can update their own comment"
  on public.comments for update
  using (auth.uid() = user_id);

-- Function and trigger for comments.updated_at
create or replace function public.handle_comment_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger comments_updated_at
  before update on public.comments
  for each row
  execute function public.handle_comment_updated_at();

-- Indexes for comments
create index if not exists comments_post_id_idx on public.comments(post_id);
create index if not exists comments_user_id_idx on public.comments(user_id);
create index if not exists comments_created_at_idx on public.comments(created_at);
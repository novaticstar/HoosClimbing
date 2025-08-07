-- Migration: Create feed table and enable RLS
-- This migration creates the feed table and sets up Row Level Security
-- Run this in your Supabase SQL editor

-- Create feed table
create table if not exists public.feed (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles on delete cascade,
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
  user_id uuid references public.profiles on delete cascade,
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

-- Policy 4: Users can delete their own comments
create policy "Users can delete their own comment"
  on public.comments for delete
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

drop trigger if exists on_post_comment on public.comments;

create trigger on_post_comment
after insert on public.comments
for each row
execute procedure public.handle_post_comment_notification();

-- Indexes for comments
create index if not exists comments_post_id_idx on public.comments(post_id);
create index if not exists comments_user_id_idx on public.comments(user_id);
create index if not exists comments_created_at_idx on public.comments(created_at);

-- Create likes table
create table if not exists public.likes (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles on delete cascade,
  post_id uuid references public.feed on delete cascade,
  created_at timestamptz default now(),
  unique (user_id, post_id) -- ensures one like per user per post
);

-- Enable RLS on likes table
alter table public.likes enable row level security;

-- Policy 1: Authenticated users can view likes
create policy "Authenticated users can view likes"
  on public.likes for select
  using (true);

-- Policy 2: Users can insert their own like
create policy "Users can like a post"
  on public.likes for insert
  with check (auth.uid() = user_id);

-- Policy 3: Users can remove their own like
create policy "Users can unlike a post"
  on public.likes for delete
  using (auth.uid() = user_id);

-- Function to update like count on feed
create or replace function public.update_feed_like_count()
returns trigger as $$
begin
  update public.feed
  set likes = (
    select count(*) from public.likes where post_id = new.post_id
  ),
  updated_at = now()
  where id = new.post_id;
  return new;
end;
$$ language plpgsql;

-- Trigger: on insert (like added)
create trigger likes_after_insert
after insert on public.likes
for each row
execute function public.update_feed_like_count();

-- Trigger: on delete (like removed)
create trigger likes_after_delete
after delete on public.likes
for each row
execute function public.update_feed_like_count();

-- Create trigger to fire after a new like is inserted
drop trigger if exists on_post_like on public.likes;

create trigger on_post_like
after insert on public.likes
for each row
execute procedure public.handle_post_like_notification();

-- Indexes for fast lookup
create index if not exists likes_user_id_idx on public.likes(user_id);
create index if not exists likes_post_id_idx on public.likes(post_id);
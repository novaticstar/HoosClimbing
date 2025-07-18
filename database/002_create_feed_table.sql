-- Migration: Create feed table and enable RLS
-- This migration creates the feed table and sets up Row Level Security
-- Run this in your Supabase SQL editor

-- Create feed table
create table if not exists public.feed (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users on delete cascade,
  title text not null,
  content text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable Row Level Security
alter table public.feed enable row level security;

-- Policy 1: Authenticated users can view all feed items
create policy "Authenticated users can view feed"
  on public.feed for select
  using (auth.role() = 'authenticated');

-- Policy 2: Users can insert their own feed item
create policy "Users can insert their own feed item"
  on public.feed for insert
  with check (auth.uid() = user_id);

-- Policy 3: Users can update their own feed item
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

-- Create trigger to automatically update updated_at
create trigger feed_updated_at
  before update on public.feed
  for each row
  execute function public.handle_feed_updated_at();

-- Indexes for performance
create index if not exists feed_user_id_idx on public.feed(user_id);
create index if not exists feed_created_at_idx on public.feed(created_at desc);
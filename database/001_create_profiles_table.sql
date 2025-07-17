-- Migration: Create profiles table and enable RLS
-- This migration creates the profiles table and sets up Row Level Security
-- Run this in your Supabase SQL editor

-- Create profiles table
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique,
  full_name text,
  avatar_url text,
  bio text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable Row Level Security
alter table public.profiles enable row level security;

-- Create policies for profiles table
-- Policy 1: Public profiles are viewable by authenticated users
create policy "Public profiles are viewable by authenticated users"
  on public.profiles for select
  using (true);

-- Policy 2: Users can insert their own profile
create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Policy 3: Users can update their own profile
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Create function to handle updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Create trigger to automatically update updated_at
create trigger profiles_updated_at
  before update on public.profiles
  for each row
  execute function public.handle_updated_at();

-- Create index on username for faster lookups
create index if not exists profiles_username_idx on public.profiles(username);

-- Create index on created_at for sorting
create index if not exists profiles_created_at_idx on public.profiles(created_at);

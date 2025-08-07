-- Migration: Create notifications table and enable RLS
-- This migration creates the notifications table amd sets up Row Level Security
-- Run this in your Supabase SQL Editor

-- Create notifications table
create table if not exists public.notifications (
  id uuid primary key default uuid_generate_v4(),
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  sender_id uuid references public.profiles(id) on delete cascade,
  type text not null, -- 'like', 'comment', 'reply', etc.
  post_id uuid references public.feed(id),
  comment_id uuid references public.comments(id),
  read boolean default false,
  created_at timestamptz default now()
);

-- Enable Row Level Security
alter table public.notifications enable row level security;

-- Policy 1: Authenticated users can read their own notifications
create policy "Users can read their own notifications"
  on public.notifications
  for select
  using (auth.uid() = recipient_id);

 -- Policy 2: Allow users to create notifications for others
 create policy "Users can insert notifications for others"
   on public.notifications
   for insert
   with check (auth.uid() = sender_id);

 -- Policy 3: Allow users to mark their notifications as read
 create policy "Users can mark their notifications as read"
   on public.notifications
   for update
   using (auth.uid() = recipient_id)
   with check (auth.uid() = recipient_id);

 -- Create the function that inserts a notification when a post is liked
 create or replace function public.handle_post_like_notification()
 returns trigger as $$
 declare
   post_author uuid;
 begin
   -- Get the author of the post
   select user_id into post_author from public.feed where id = new.post_id;

   -- Don't notify if the liker is the author
   if post_author != new.user_id then
     insert into public.notifications (
       recipient_id,
       sender_id,
       type,
       post_id
     ) values (
       post_author,
       new.user_id,
       'like',
       new.post_id
     );
   end if;

   return new;
 end;
 $$ language plpgsql security definer;

 -- Create the function that insert a notification when a post has new comments
 create or replace function public.handle_post_comment_notification()
 returns trigger as $$
 declare
    post_author uuid;
 begin
    -- Get the author of the post
    select user_id into post_author from public.feed where id = new.post_id;

    -- Don't notify if the commenter is the author
    if post_author != new.user_id then
        insert into public.notifications (
            recipient_id,
            sender_id,
            type,
            post_id
        ) values (
            post_author,
            new.user_id,
            'comment',
            new.post_id
        );
    end if;

    return new;
 end;
 $$ language plpgsql security definer;


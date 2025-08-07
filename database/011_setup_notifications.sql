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

 -- Create the function and trigger that insert a notification when a comment is liked
 create or replace function public.handle_post_comment_like_notification()
 returns trigger as $$
 declare
    post_author uuid;
    linked_post_id uuid;
 begin
    select c.post_id into linked_post_id from public.comments c where c.id = new.comment_id;
    select f.user_id into post_author from public.feed f where f.id = linked_post_id;
    if post_author != new.user_id then
        insert into public.notifications (
            recipient_id,
            sender_id,
            type,
            post_id,
            comment_id
        ) values (
            post_author,
            new.user_id,
            'comment like',
            linked_post_id,
            new.comment_id
        );
    end if;
    return new;
end;
$$ language plpgsql security definer;

-- Create the function and trigger that insert a notification when a user is tagged in a post
create or replace function public.handle_post_tags_notification()
 returns trigger as $$
 begin
    if new.user_id != new.tagged_by then
        insert into public.notifications (
            recipient_id,
            sender_id,
            type,
            post_id
        ) values (
            new.user_id,
            new.tagged_by,
            'tag',
            new.post_id
        );
    end if;
    return new;
end;
$$ language plpgsql security definer;

-- Create function and trigger that insert notification when a user is tagged in a comment
create or replace function public.handle_post_comment_tag_notification()
 returns trigger as $$
 declare
    linked_post_id uuid;
 begin
    select post_id into linked_post_id from public.comments where id = new.comment_id;
    if new.user_id != new.tagged_by then
        insert into public.notifications (
            recipient_id,
            sender_id,
            type,
            post_id
        ) values (
            new.user_id,
            new.tagged_by,
            'comment tag',
            linked_post_id
        );
    end if;
    return new;
end;
$$ language plpgsql security definer;


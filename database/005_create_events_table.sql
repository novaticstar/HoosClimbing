-- Creates the events and attendance tables with RLS
-- Runs in Supabase SQL Editor

-- Create events table
create table if not exists public.events (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles on delete cascade,
  title text not null,
  description text,
  event_date timestamptz not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Add column for image link
alter table public.events
add column if not exists image_url text;

-- Add column for attendance count
alter table public.events
add column if not exists attendee_count integer default 0;

-- Enable RLS for events table
alter table public.events enable row level security;

-- Policy 1: Authenticated users can view all events
create policy "Authenticated users can view events"
  on public.events for select
  using (true);

-- Policy 2: Users can create their own events
create policy "Users can insert their own events"
  on public.events for insert
  with check (auth.uid() = user_id);

-- Policy 3: Users can update their own events
create policy "Users can update their own events"
  on public.events for update
  using (auth.uid() = user_id);

-- Policy 4: Users can delete their own events
create policy "Users can delete their own events"
  on public.events for delete
  using (auth.uid() = user_id);

-- Function and trigger to update updated_at column
create or replace function public.handle_event_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger event_updated_at
  before update on public.events
  for each row
  execute function public.handle_event_updated_at();

-- Function and triggers to update attendee_count column
create or replace function public.update_attendee_count()
returns trigger as $$
declare
  target_event_id uuid;
begin
  target_event_id := coalesce(new.event_id, old.event_id);
  update events
  set attendee_count = (
    select count(*) from event_attendance where event_id = target_event_id
  )
  where id = target_event_id;
  return new;
end;
$$ language plpgsql;

create trigger on_attend_insert
  after insert on event_attendance
  for each row execute function update_attendee_count();

create trigger on_attend_delete
  after delete on event_attendance
  for each row execute function update_attendee_count();

-- Indexes
create index if not exists events_user_id_idx on public.events(user_id);
create index if not exists events_event_date_idx on public.events(event_date);

-- Create event_attendance table
create table if not exists public.event_attendance (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles on delete cascade,
  event_id uuid references public.events on delete cascade,
  created_at timestamptz default now(),
  unique (user_id, event_id) -- one attendance record per user per event
);

-- Enable RLS for event_attendance table
alter table public.event_attendance enable row level security;

-- Policy 1: Authenticated users can view who is attending
create policy "Authenticated users can view attendance"
  on public.event_attendance for select
  using (true);

-- Policy 2: Users can attend an event
create policy "Users can attend an event"
  on public.event_attendance for insert
  with check (auth.uid() = user_id);

-- Policy 3: Users can remove themselves from attendance
create policy "Users can un-attend an event"
  on public.event_attendance for delete
  using (auth.uid() = user_id);

-- Indexes
create index if not exists event_attendance_user_id_idx on public.event_attendance(user_id);
create index if not exists event_attendance_event_id_idx on public.event_attendance(event_id);
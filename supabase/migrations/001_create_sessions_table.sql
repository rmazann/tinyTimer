-- =====================================================
-- TinyTimer Database Schema for Supabase
-- =====================================================
-- Run this script in Supabase Dashboard > SQL Editor
-- =====================================================

-- Sessions tablosu - Kullanıcı Pomodoro session'larını saklar
create table if not exists public.sessions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  session_number integer not null,
  session_name text,
  active_time integer not null default 0,  -- saniye cinsinden
  pause_time integer not null default 0,   -- saniye cinsinden
  extra_time integer not null default 0,   -- saniye cinsinden
  total_time integer not null default 0,   -- saniye cinsinden
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Index for faster queries
create index if not exists sessions_user_id_idx on public.sessions(user_id);
create index if not exists sessions_created_at_idx on public.sessions(created_at desc);

-- Row Level Security
alter table public.sessions enable row level security;

-- Kullanıcılar sadece kendi session'larını görebilir
create policy "Users can view their own sessions"
  on public.sessions for select
  using (auth.uid() = user_id);

-- Kullanıcılar sadece kendi session'larını oluşturabilir
create policy "Users can create their own sessions"
  on public.sessions for insert
  with check (auth.uid() = user_id);

-- Kullanıcılar sadece kendi session'larını güncelleyebilir
create policy "Users can update their own sessions"
  on public.sessions for update
  using (auth.uid() = user_id);

-- Kullanıcılar sadece kendi session'larını silebilir
create policy "Users can delete their own sessions"
  on public.sessions for delete
  using (auth.uid() = user_id);

-- Updated_at trigger
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger sessions_updated_at
  before update on public.sessions
  for each row execute function public.handle_updated_at();

-- ==========================================
-- PROFILES TABLE (User metadata)
-- ==========================================
create table if not exists public.profiles (
  id uuid references auth.users not null primary key,
  email text,
  username text,
  role text default 'user',
  saved_templates jsonb default '[]'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.profiles enable row level security;

-- Drop existing policies if running this multiple times to prevent errors
drop policy if exists "Users can view own profile" on profiles;
drop policy if exists "Users can update own profile" on profiles;

create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);

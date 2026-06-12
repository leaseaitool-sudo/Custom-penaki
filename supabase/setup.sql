-- Enable required extensions
create extension if not exists "uuid-ossp";
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
-- ==========================================
-- AUTH TRIGGERS
-- ==========================================

-- Trigger to automatically create a profile on signup
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, email, username)
  values (new.id, new.email, new.raw_user_meta_data->>'username');
  return new;
end;
$$ language plpgsql security definer;

-- Drop trigger if it exists before creating it
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
-- ==========================================
-- LEASES TABLE (AI Abstraction Data)
-- ==========================================
create table if not exists public.leases (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) not null,
  name text not null,
  status text not null,
  workflow_stage text,
  upload_date timestamp with time zone default timezone('utc'::text, now()),
  template_type text,
  template_config jsonb,
  abstracted_data jsonb,
  documents jsonb,
  processing_mode text default 'ai',
  chat_history jsonb default '[]'::jsonb
);

alter table public.leases enable row level security;

-- Drop existing policies if running this multiple times to prevent errors
drop policy if exists "Users can view own leases" on leases;
drop policy if exists "Users can insert own leases" on leases;
drop policy if exists "Users can update own leases" on leases;
drop policy if exists "Users can delete own leases" on leases;

create policy "Users can view own leases" on leases for select using (auth.uid() = user_id);
create policy "Users can insert own leases" on leases for insert with check (auth.uid() = user_id);
create policy "Users can update own leases" on leases for update using (auth.uid() = user_id);
create policy "Users can delete own leases" on leases for delete using (auth.uid() = user_id);
-- ==========================================
-- STORAGE BUCKET (For uploaded PDFs)
-- ==========================================

-- Insert the bucket safely (will fail silently if it already exists, which is fine)
insert into storage.buckets (id, name, public) 
values ('lease-documents', 'lease-documents', false)
on conflict (id) do nothing;

-- Drop existing policies if running this multiple times to prevent errors
drop policy if exists "Users can upload their own lease documents" on storage.objects;
drop policy if exists "Users can view their own lease documents" on storage.objects;

-- Create policies for storage
create policy "Users can upload their own lease documents" 
on storage.objects for insert 
with check ( bucket_id = 'lease-documents' and auth.uid()::text = (storage.foldername(name))[1] );

create policy "Users can view their own lease documents" 
on storage.objects for select 
using ( bucket_id = 'lease-documents' and auth.uid()::text = (storage.foldername(name))[1] );

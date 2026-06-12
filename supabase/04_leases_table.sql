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

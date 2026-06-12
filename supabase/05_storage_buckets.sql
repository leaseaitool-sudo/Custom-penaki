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

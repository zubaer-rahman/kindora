-- 1. Ensure the bucket exists and is public
insert into storage.buckets (id, name, public)
values ('chat-attachments', 'chat-attachments', true)
on conflict (id) do update set public = true;

-- 2. Allow Public Uploads
create policy "Allow Public Uploads"
on storage.objects for insert
to public
with check ( bucket_id = 'chat-attachments' );

-- 3. Allow Public Viewing
create policy "Allow Public Viewing"
on storage.objects for select
to public
using ( bucket_id = 'chat-attachments' );

-- 4. Allow Public Delete
create policy "Allow Public Delete"
on storage.objects for delete
to public
using ( bucket_id = 'chat-attachments' );

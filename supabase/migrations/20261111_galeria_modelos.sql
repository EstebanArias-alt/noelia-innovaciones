begin;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('galeria-modelos', 'galeria-modelos', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

create policy "galeria_modelos_lectura" on storage.objects
for select to anon, authenticated
using (bucket_id = 'galeria-modelos');

create policy "galeria_modelos_subida_admin" on storage.objects
for insert to authenticated
with check (
  bucket_id = 'galeria-modelos'
  and (select auth.uid()) = '5400f8da-6a41-4d50-b4b8-b3b9d249c81f'::uuid
);

commit;

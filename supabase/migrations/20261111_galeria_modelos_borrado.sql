create policy "galeria_modelos_borrado_admin" on storage.objects
for delete to authenticated
using (
  bucket_id = 'galeria-modelos'
  and (select auth.uid()) = '5400f8da-6a41-4d50-b4b8-b3b9d249c81f'::uuid
);

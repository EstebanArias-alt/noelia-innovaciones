-- Ejecutar una vez en el SQL Editor de Supabase. Puede repetirse sin perder estados.
begin;

alter table public.boletas add column if not exists entregada_at timestamptz;

create or replace function public.marcar_entrega_boleta(p_id uuid, p_entregada boolean)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare registro public.boletas;
begin
  if auth.uid() is distinct from '5400f8da-6a41-4d50-b4b8-b3b9d249c81f'::uuid then
    raise exception 'Sin permisos' using errcode = '42501';
  end if;
  if p_id is null or p_entregada is null then
    raise exception 'Estado de entrega inválido' using errcode = '22023';
  end if;
  update public.boletas
    set entregada_at = case when p_entregada then coalesce(entregada_at, now()) else null end
    where id = p_id returning * into registro;
  if not found then
    raise exception 'Boleta no encontrada' using errcode = 'P0002';
  end if;
  return to_jsonb(registro);
end;
$$;

revoke all on function public.marcar_entrega_boleta(uuid, boolean) from public, anon, authenticated;
grant execute on function public.marcar_entrega_boleta(uuid, boolean) to authenticated;
commit;

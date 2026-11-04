-- Ejecutar una vez desde el SQL Editor de Supabase con el rol postgres.
-- No modifica productos, imágenes, stock ni sus políticas.
begin;

create function public.total_boleta(p_datos jsonb)
returns numeric language sql immutable strict set search_path = '' as $$
  select coalesce(sum((l->>'cantidad')::numeric * round((l->>'precio')::numeric, 2)), 0)
  from jsonb_array_elements(p_datos->'lineas') as l;
$$;

create function public.datos_boleta_validos(p_datos jsonb)
returns boolean language plpgsql immutable set search_path = '' as $$
declare
  l jsonb;
  campo text;
  limite integer;
begin
  if p_datos is null or jsonb_typeof(p_datos) <> 'object' or length(p_datos::text) > 100000 then return false; end if;
  for campo, limite in select * from (values
    ('comercio',150),('direccion',250),('contacto',150),('identificacion',100),
    ('cliente',150),('documento',50),('numero',100),('fecha',10),('pago',50),('observaciones',2000)
  ) as campos(nombre, maximo) loop
    if jsonb_typeof(p_datos->campo) is distinct from 'string' or length(p_datos->>campo) > limite then return false; end if;
  end loop;
  if btrim(p_datos->>'comercio') = '' or btrim(p_datos->>'cliente') = '' or btrim(p_datos->>'numero') = '' then return false; end if;
  if (p_datos->>'fecha') !~ '^\d{4}-\d{2}-\d{2}$' or
     to_char((p_datos->>'fecha')::date, 'YYYY-MM-DD') <> p_datos->>'fecha' then return false; end if;
  if jsonb_typeof(p_datos->'lineas') is distinct from 'array' then return false; end if;
  if jsonb_array_length(p_datos->'lineas') not between 1 and 100 then return false; end if;
  for l in select * from jsonb_array_elements(p_datos->'lineas') loop
    if jsonb_typeof(l->'nombre') is distinct from 'string' or length(btrim(l->>'nombre')) = 0 or length(l->>'nombre') > 200 then return false; end if;
    if jsonb_typeof(l->'cantidad') is distinct from 'number' or jsonb_typeof(l->'precio') is distinct from 'number' then return false; end if;
    if (l->>'cantidad')::numeric not between 1 and 1000000 or trunc((l->>'cantidad')::numeric) <> (l->>'cantidad')::numeric then return false; end if;
    if (l->>'precio')::numeric not between 0.01 and 1000000000 or round((l->>'precio')::numeric, 2) <> (l->>'precio')::numeric then return false; end if;
  end loop;
  return public.total_boleta(p_datos) * 100 <= 9007199254740991;
exception when others then return false;
end;
$$;

create table public.boletas (
  id uuid primary key,
  created_at timestamptz not null default now(),
  datos jsonb not null check (public.datos_boleta_validos(datos)),
  cliente text generated always as (datos->>'cliente') stored,
  referencia text generated always as (datos->>'numero') stored,
  total numeric generated always as (public.total_boleta(datos)) stored,
  share_token uuid not null unique default gen_random_uuid(),
  compartible boolean not null default true
);
create index boletas_fecha_idx on public.boletas (created_at desc, id desc);
alter table public.boletas enable row level security;
revoke all on table public.boletas from public, anon, authenticated;
grant select on table public.boletas to authenticated;
grant update (compartible) on table public.boletas to authenticated;
create policy boletas_admin_lectura on public.boletas for select to authenticated
  using ((select auth.uid()) = '5400f8da-6a41-4d50-b4b8-b3b9d249c81f'::uuid);
create policy boletas_admin_revocar on public.boletas for update to authenticated
  using ((select auth.uid()) = '5400f8da-6a41-4d50-b4b8-b3b9d249c81f'::uuid)
  with check ((select auth.uid()) = '5400f8da-6a41-4d50-b4b8-b3b9d249c81f'::uuid and compartible = false);

-- Solo el administrador puede guardar. El id del borrador hace idempotentes los reintentos.
create function public.guardar_boleta(p_id uuid, p_datos jsonb)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare registro public.boletas;
begin
  if auth.uid() is distinct from '5400f8da-6a41-4d50-b4b8-b3b9d249c81f'::uuid then
    raise exception 'Sin permisos' using errcode = '42501';
  end if;
  if p_id is null or not public.datos_boleta_validos(p_datos) then
    raise exception 'Datos de boleta inválidos' using errcode = '22023';
  end if;
  insert into public.boletas (id, datos) values (p_id, p_datos) on conflict (id) do nothing;
  select * into registro from public.boletas where id = p_id;
  if registro.datos is distinct from p_datos then
    raise exception 'La boleta ya fue guardada con otros datos' using errcode = '22023';
  end if;
  return to_jsonb(registro);
end;
$$;

-- Acceso por token aleatorio: no permite listar ni buscar otras boletas.
-- No expone el token ni campos administrativos en la respuesta pública.
create function public.ver_boleta_compartida(p_token uuid)
returns jsonb language sql stable security definer set search_path = '' as $$
  select jsonb_build_object('id', b.id, 'created_at', b.created_at, 'datos', b.datos, 'total', b.total)
  from public.boletas b where b.share_token = p_token and b.compartible = true;
$$;
revoke all on function public.guardar_boleta(uuid, jsonb) from public, anon, authenticated;
grant execute on function public.guardar_boleta(uuid, jsonb) to authenticated;
revoke all on function public.ver_boleta_compartida(uuid) from public, anon, authenticated;
grant execute on function public.ver_boleta_compartida(uuid) to anon, authenticated;
revoke all on function public.total_boleta(jsonb), public.datos_boleta_validos(jsonb) from public, anon, authenticated;
-- Funciones puras necesarias al evaluar restricciones durante la revocación por el admin.
grant execute on function public.total_boleta(jsonb), public.datos_boleta_validos(jsonb) to authenticated;
commit;

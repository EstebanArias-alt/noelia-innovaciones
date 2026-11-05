begin;
alter table public.productos add column if not exists stock_colores jsonb;

-- El desglose y los totales se guardan juntos con los permisos actuales del producto.
create or replace function public.sincronizar_stock_colores()
returns trigger language plpgsql set search_path = '' as $$
declare
  fila jsonb;
  clave text;
  claves text[] := '{}';
  total numeric := 0;
  colores text[] := '{}';
begin
  if new.stock_colores is null then return new; end if;
  if jsonb_typeof(new.stock_colores) <> 'array' then
    raise exception 'Stock por color inválido';
  end if;
  if jsonb_array_length(new.stock_colores) not between 1 and 100 then
    raise exception 'Ingresá entre 1 y 100 colores';
  end if;
  for fila in select * from jsonb_array_elements(new.stock_colores) loop
    if jsonb_typeof(fila->'color') is distinct from 'string'
       or jsonb_typeof(fila->'cantidad') is distinct from 'number' then
      raise exception 'Cada color requiere nombre y cantidad';
    end if;
    clave := lower(btrim(fila->>'color'));
    if length(clave) not between 1 and 80 or clave = any(claves) then
      raise exception 'Los colores deben ser únicos y tener hasta 80 caracteres';
    end if;
    if (fila->>'cantidad')::numeric < 0
       or (fila->>'cantidad')::numeric <> trunc((fila->>'cantidad')::numeric) then
      raise exception 'El stock debe ser un entero desde 0';
    end if;
    total := total + (fila->>'cantidad')::numeric;
    if total > 2147483647 then raise exception 'Stock total fuera de rango'; end if;
    claves := array_append(claves, clave);
    colores := array_append(colores, btrim(fila->>'color'));
  end loop;
  new.cantidad_stock := total::integer;
  new.stock := total > 0;
  return new;
end;
$$;
drop trigger if exists productos_stock_colores on public.productos;
create trigger productos_stock_colores before insert or update on public.productos
for each row execute function public.sincronizar_stock_colores();
commit;

begin;
create or replace function public.datos_boleta_validos(p_datos jsonb)
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
  -- Campos nuevos opcionales: las boletas anteriores siguen siendo válidas.
  for campo, limite in select * from (values
    ('domicilio_cliente',250),('telefono_cliente',80),('autorizacion',100),
    ('tipo_tarjeta',80),('tiempo_entrega',200),('estado',50),('vendedor',150),('pautas_entrega',8000),
    ('pautas_armado',8000),('politicas_empresa',8000)
  ) as campos(nombre, maximo) loop
    if p_datos ? campo and (jsonb_typeof(p_datos->campo) is distinct from 'string' or length(p_datos->>campo) > limite) then return false; end if;
  end loop;
  if p_datos ? 'armar_domicilio' and jsonb_typeof(p_datos->'armar_domicilio') is distinct from 'boolean' then return false; end if;
  if p_datos ? 'flete' then
    if jsonb_typeof(p_datos->'flete') is distinct from 'number' then return false; end if;
    if (p_datos->>'flete')::numeric not between 0 and 1000000000 or round((p_datos->>'flete')::numeric,2) <> (p_datos->>'flete')::numeric then return false; end if;
  end if;
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
  if p_datos ? 'sena' then
    if jsonb_typeof(p_datos->'sena') is distinct from 'number' then return false; end if;
    if (p_datos->>'sena')::numeric < 0
       or round((p_datos->>'sena')::numeric, 2) <> (p_datos->>'sena')::numeric
       or (p_datos->>'sena')::numeric > public.total_boleta(p_datos) then return false; end if;
  end if;
  return public.total_boleta(p_datos) * 100 <= 9007199254740991;
exception when others then return false;
end;
$$;


commit;

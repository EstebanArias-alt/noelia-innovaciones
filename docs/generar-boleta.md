# Boletas: generación, historial y compartir

## Activación

1. Abrir el proyecto correcto en Supabase → SQL Editor → New query.
2. Ejecutar **una sola vez** el contenido de `supabase/migrations/20261104_boletas.sql`, con el rol postgres. La migración es transaccional y crea la tabla, funciones y permisos de boletas. No modifica productos, stock, imágenes ni sus políticas. Si ya fue aplicada, no repetirla.
3. Ejecutar después `supabase/migrations/20261104_boletas_entrega.sql` para habilitar los campos de entrega, armado, pautas y flete. Si ya aplicaste el primer SQL, ejecutar solo este segundo archivo. No reescribe las boletas anteriores.
4. Publicar esta rama en la web o probar con `npm install` y `npm start`.
5. Entrar a `/admin`, guardar una boleta y abrir “Ver historial de boletas”.

La migración usa el mismo UID de administrador que `admin-auth.guard.ts`. Si cambia el administrador, hay que actualizar tanto el guard como las políticas y la función `guardar_boleta` mediante una nueva migración. La clave pública de Supabase sigue siendo la existente: no agregar claves de servicio al frontend.

## Uso

- Completar comercio, cliente, referencia, fecha, medio de pago y al menos un producto. Dirección, contacto, identificación comercial/CUIT, documento y observaciones son opcionales.
- Completar autorización, estado, vendedor y elegir explícitamente Sí o No en “Armar en domicilio”. El estado es informativo y queda fijado al guardar, como el resto del comprobante. Domicilio y teléfono del cliente son opcionales.
- Indicar flete en ARS: 0 significa sin cargo; cualquier importe positivo se suma al total. El PDF separa subtotal de productos, flete y total.
- Las pautas de entrega, armado y políticas de la empresa están precargadas con el texto solicitado, con correcciones de ortografía y puntuación. Son editables antes de guardar (un renglón por pauta) y se copian a esa boleta. Se imprimen al pie del comprobante, en letra pequeña, con un diseño compacto para compartir la misma hoja A4 en boletas habituales. Las boletas anteriores que no tenían pautas no reciben este texto automáticamente.
- Copiar precio de contado o tarjeta y ajustar descripción/cantidad/precio para este comprobante. Los precios “consultar” deben completarse. Se admiten hasta 100 líneas.
- “Guardar boleta” registra una copia permanente en Supabase. Las boletas guardadas no se editan; los cambios posteriores en productos no alteran sus datos ni precios. Un doble clic o reintento tras un error no duplica el registro. Ante un resultado incierto, el borrador queda bloqueado para reintentar con el mismo contenido; “Nueva boleta” permite descartarlo con confirmación.
- “Abrir boleta para imprimir / PDF” funciona también antes de guardar, como vista previa. Una impresión del borrador no crea historial.
- Para otra venta, usar “Nueva boleta”. Los datos del comercio se conservan durante esa visita al panel; no se guardan como configuración global. Cada boleta guardada sí conserva sus propios datos comerciales.

## Dónde se guardan

Tabla `public.boletas` en la misma base de Supabase del catálogo. Contiene un identificador UUID, fecha de creación, copia JSON de datos comerciales/cliente/líneas, referencia y cliente para búsqueda, total calculado en PostgreSQL y estado/token del enlace. No se almacena un PDF binario: la vista y el PDF se reconstruyen a partir de esa copia de datos.

El historial `/admin/boletas` está protegido por el guard existente y por RLS en la base. Tiene búsqueda por cliente o referencia y paginación de 20 registros. Desde allí se vuelve a abrir, imprimir o guardar como PDF. El borrador sin guardar se pierde al salir del panel. No se registran ventas contables ni se descuenta stock. La referencia es interna y editable, no un correlativo fiscal. El comprobante indica “No válido como factura fiscal”.

## WhatsApp y correo

Después de guardar se puede copiar el enlace o abrir WhatsApp/correo con un mensaje preparado. El administrador elige el destinatario y confirma el envío en esa aplicación. No hay envío automático ni PDF adjunto automático.

El cliente abre `/boleta/<token-aleatorio>` sin iniciar sesión y puede ver su boleta y abrir la impresión para elegir “Guardar como PDF”. El enlace debe provenir de la web publicada: un enlace localhost no sirve fuera de la PC. El navegador debe permitir ventanas emergentes y tener una aplicación de correo configurada si se usa `mailto:`.

Cualquiera que tenga el enlace puede ver los datos de esa boleta. El historial permite desactivarlo permanentemente; no borra la boleta ni los archivos ya descargados, ni cierra vistas que ya estaban abiertas. No se habilita acceso anónimo a la tabla: una función con búsqueda exacta por UUID devuelve únicamente la boleta compartida y activa. No existe listado público. La página lleva noindex y no-referrer y no carga servicios externos para mostrar el comprobante.

## Diseño

Logo provisto en `public/logo/logo-boleta-noelia.png`, detalles dorados, fecha en casilleros, tabla enmarcada de cantidad/descripción/precio/importe, seis filas mínimas, total y espacios de firma. Diseño A4 con encabezados de tabla repetibles. Todos los textos se escapan antes de generar el HTML. La vista embebida del enlace está aislada en un iframe sin scripts. La impresión se abre como un documento HTML completo para que el logo cargue correctamente.

## Archivos

| Archivo | Responsabilidad |
| --- | --- |
| `components/generar-boleta/*` | Borrador, validación, guardado, reintentos y acceso a compartir. |
| `models/boleta-pautas.ts` | Textos iniciales de entrega, armado y políticas para las boletas nuevas. |
| `models/boleta.ts` | Tipos y cálculo/validación de importes y fechas. |
| `services/boletas.service.ts` | Guardar, listar, consultar enlace y revocar en Supabase. |
| `services/boleta-impresion.ts` | Diseño único compartido entre admin, historial y cliente. |
| `components/compartir-boleta/*` | Copiar enlace, WhatsApp y correo con texto codificado. |
| `pages/admin-boletas/*` | Historial protegido, búsqueda, paginación y revocación. |
| `pages/boleta-publica/*` | Vista por token, PDF desde impresión y estados de error. |
| `pages/admin/admin.component.*` | Generador y acceso al historial en el panel existente. |
| `app.routes.ts` | Ruta protegida del historial y ruta compartida con carga diferida. |
| `supabase/migrations/20261104_boletas.sql` | Tabla, validaciones, total, RLS y funciones. |
| `supabase/migrations/20261104_boletas_entrega.sql` | Amplía validaciones y total con flete; conserva compatibilidad con los registros anteriores. |
| `scripts/test-boletas*.mjs`, archivos `*.spec.ts` | Pruebas de lógica y PostgreSQL efímero; no usan datos reales. |

Las rutas de aplicación de la tabla son relativas a `src/app/`.

## Validación

`npm run build`, `npx tsc --project tsconfig.spec.json --noEmit` y `npm run test:boletas`.

La suite usa Jasmine en Node para lógica y PGlite (PostgreSQL efímero) para la migración y seguridad: anon sin acceso directo, usuario ajeno sin historial/guardado, admin autorizado, guardado idempotente, datos inmutables, validaciones, token y revocación. No conecta con Supabase real. La única dependencia nueva es PGlite de desarrollo, no se incluye en el sitio publicado.

Prueba de aceptación tras activar: guardar, recargar historial, buscar por cliente/referencia, abrir PDF, compartir enlace de la web publicada en ventana sin sesión y verificar que solo se ve esa boleta. Cambiar un producto y confirmar que el comprobante conserva el precio. Desactivar enlace y recargarlo para comprobar que deja de estar disponible. Revisar impresión A4 de varias páginas. Sin migración o sin conexión el admin debe mostrar un error conservando el borrador.

Verificación realizada en este cambio: compilación, tipado y ocho pruebas de lógica correctas; migración y pruebas de permisos correctas en PostgreSQL efímero. Flujo de navegador probado con respuestas de Supabase simuladas: guardado, historial, enlace sin sesión, logo, PDF A4 de una página y enlace revocado. La base de Supabase real sigue pendiente de activar mediante la migración.

Ampliación de entrega/armado: diez pruebas de lógica correctas, pruebas PostgreSQL de campos nuevos, flete, límites y conservación de datos históricos correctas. Flujo de navegador con datos simulados y PDF A4 revisado; el diseño actual integra las pautas al pie del comprobante. Ambas migraciones siguen pendientes de aplicar en el proyecto real si no se ejecutaron manualmente.

Diseño compacto actualizado: sin salto obligatorio de página ni encabezado o firmas duplicadas. Las boletas con pautas reducen espacios y filas vacías; mantienen los textos completos. Muchas líneas de productos, observaciones extensas o pautas personalizadas largas continúan en otra página sin recortar contenido. No requiere cambios en Supabase.

Verificado el diseño compacto en navegador con datos simulados: boleta con cliente, domicilio, teléfono, pago, autorización, estado, vendedor, armado, flete y todas las pautas predeterminadas en una sola hoja A4. PDF renderizado y revisado visualmente; compilación, tipado y diez pruebas de lógica correctas.

Datos comerciales precargados desde el sector marcado en la foto: Fábrica de sillones, De Tomás Lamas, Responsable monotributo; Gorriti N.º 670, 4600 San Salvador de Jujuy, Provincia de Jujuy; Cel. 388-4584857 / 388-4044893. El logo de Noelia reemplaza el sector tachado. Estos datos siguen siendo editables y solo se copian a boletas nuevas; no cambian las ya guardadas. No se incorporan CUIT ni datos de la zona no marcada. No requiere SQL adicional.


## Diseño aprobado (5 de noviembre)

La impresión y el enlace público usan el mismo diseño: datos comerciales a la izquierda, logo completo al centro, folio a la derecha, tabla con diez renglones mínimos y pautas compactas al pie. Las descripciones largas o documentos extensos pueden continuar en otra hoja; no se recortan.

Las boletas nuevas incluyen tipo de tarjeta, tiempo de entrega y seña. El saldo se calcula como total (productos + flete) menos seña. La seña no reduce el valor total de la venta. No puede ser negativa ni superar el total. Observaciones siempre tiene un espacio en el comprobante.

Aplicar `supabase/migrations/20261105_boletas_diseno.sql` después de las migraciones de boletas anteriores para validar los nuevos campos también en la base. No cambia boletas guardadas ni permisos. Las antiguas conservan su estado bajo “Estado (registro anterior)” y no se les inventan importes de seña o saldo. Su contenido comercial se conserva.

Validación: compilación Angular, 13 pruebas de lógica e impresión HTML y pruebas PostgreSQL de campos, límites, guardado y enlace público. La revisión final de impresión A4 en navegador queda pendiente en este entorno.

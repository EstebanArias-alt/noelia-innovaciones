# Generar boleta

## Integración elegida

El panel usa Angular 19 standalone, FormsModule y un listado obtenido con SupabaseService.getProductos(). El formulario de productos guarda primero el producto, termina la galería y vuelve a /admin. Se incorpora un componente standalone dentro de ese panel protegido por adminAuthGuard, reutilizando los productos cargados. No requiere dependencias ni migraciones y no interviene en guardar(), actualizarProducto(), crearProducto() ni guardarGaleriaProducto().

## Uso

1. Entrar a /admin y pulsar Generar boleta.
2. Completar comercio, cliente, referencia y fecha. Dirección, contacto, identificación comercial/CUIT y documento del cliente son opcionales.
3. Seleccionar productos y copiar precio de contado o tarjeta. Completar los precios “consultar”; ajustar descripción, cantidad y precio para este comprobante. Elegir medio de pago y observaciones.
4. Abrir la vista A4 y pulsar Imprimir / Guardar como PDF. En el diálogo del navegador elegir impresora o Guardar como PDF.

La referencia inicial es un UUID interno editable, no una numeración fiscal correlativa. Todos los importes son ARS. Los subtotales se redondean en centavos. Los textos se escapan antes de generar el HTML imprimible. El documento abierto conserva una copia de los datos al momento de generarlo.

Los datos comerciales son configurables en cada formulario; el nombre tiene valor inicial Noelia Innovaciones. El borrador permanece solamente mientras el componente esté montado. No se persisten datos de clientes, configuración ni historial; guardar el PDF antes de abandonar el panel. No se descuentan existencias ni se registran ventas. El comprobante indica “No válido como factura fiscal”.

## Archivos

| Archivo | Cambio |
| --- | --- |
| src/app/pages/admin/admin.component.ts | Importa el componente standalone. |
| src/app/pages/admin/admin.component.html | Muestra el generador al terminar la carga de productos. |
| src/app/components/generar-boleta/generar-boleta.component.ts | Borrador, selección y copia de precios, validación, cálculo e impresión aislada. |
| src/app/components/generar-boleta/generar-boleta.component.html | Campos editables y acciones. |
| src/app/components/generar-boleta/generar-boleta.component.css | Formulario adaptable a móviles. |
| src/app/components/generar-boleta/generar-boleta.component.spec.ts | Casos de precios ausentes, cantidades, redondeo, independencia del producto y escape de HTML. |

## Verificación manual

Probar producto antiguo sin precio de tarjeta, precio a consultar, varias líneas y cantidades, caracteres HTML en cliente y observaciones, quitar filas y ventanas emergentes bloqueadas. Verificar impresión A4 de varias páginas y guardado PDF. Volver a editar y guardar un producto: el flujo previo permanece intacto.

## Diseño del comprobante

Diseño inspirado en una boleta comercial: logo provisto en public/logo/logo-boleta-noelia.png, bordes y acentos dorados, encabezado con referencia y fecha en casilleros, datos del cliente, grilla de cantidad/descripción/precio/importe, seis filas mínimas, total destacado y espacios de firma. La referencia sigue siendo interna; no se inventan datos fiscales ni se marca el comprobante como pagado. El logo usa una URL absoluta basada en document.baseURI para cargar desde la pestaña de impresión.

# Stock por color

Aplicar una vez `supabase/migrations/20261105_stock_colores.sql` en Supabase SQL Editor antes de usar esta versión. No cambia las filas existentes ni los permisos.

En Admin → Editar producto → Stock y publicación, activar **Controlar stock por color**. Ingresar nombre y cantidad para cada color; 0 significa agotado. El total se calcula sumando las cantidades. Los colores del producto se sincronizan con las filas al guardar.

Los productos anteriores siguen usando su cantidad total hasta activar el desglose. No se distribuyen cantidades automáticamente: hay que contar cada color. Al desactivar el desglose se conserva su suma como stock general. El guardado sigue usando el flujo existente de productos, sin descontar automáticamente ventas o boletas.

La base valida nombres únicos, cantidades enteras no negativas y el límite del total. Un trigger mantiene cantidad_stock y stock consistentes al guardar el desglose.

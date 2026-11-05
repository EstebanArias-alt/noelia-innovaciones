export interface StockColor { color: string; cantidad: number | null; }

export interface CaracteristicaProducto {
  nombre: string;
  valor: string;
}

// Ignorar datos antiguos o incompletos al mostrarlos en la tienda.
export function normalizarCaracteristicas(datos: unknown): CaracteristicaProducto[] {
  if (!Array.isArray(datos)) return [];
  return datos.flatMap(item => {
    if (!item || typeof item.nombre !== 'string' || typeof item.valor !== 'string') return [];
    const nombre = item.nombre.trim();
    const valor = item.valor.trim();
    return nombre && valor ? [{ nombre, valor }] : [];
  });
}

export interface ProductoImagen {
  id: number;
  url: string;
  orden: number;
  principal: boolean;
  color?: string | null;
}

export interface Producto {
  id: number;
  slug: string;
  nombre: string;
  categoria: string;
  descripcion: string;

  precio?: number; // Precio de contado (campo existente).
  precio_tarjeta?: number | null;
  precioAnterior?: number;
  precio_anterior?: number;

  cuotas?: string;

  imagen?: string;
  imagenes?: string[];

  producto_imagenes?: ProductoImagen[];

  medidas?: string;
  colores?: string[] | string;
  material?: string;
  caracteristicas?: CaracteristicaProducto[] | null;

  stock_colores?: StockColor[] | null;
  stock?: boolean;
  // null indica que un producto anterior todavía no fue contado.
  cantidad_stock?: number | null;
  destacado?: boolean;
  oferta?: boolean;
  nuevo?: boolean;
}
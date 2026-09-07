export interface ProductoImagen {
  id: number;
  url: string;
  orden: number;
  principal: boolean;
}

export interface Producto {
  id: number;
  slug: string;
  nombre: string;
  categoria: string;
  descripcion: string;

  precio?: number;
  precioAnterior?: number;
  precio_anterior?: number;

  cuotas?: string;

  imagen?: string;
  imagenes?: string[];

  producto_imagenes?: ProductoImagen[];

  medidas?: string;
  colores?: string[] | string;
  material?: string;

  stock?: boolean;
  destacado?: boolean;
  oferta?: boolean;
  nuevo?: boolean;
}
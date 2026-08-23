export interface Producto {
  id: number;
  nombre: string;
  categoria: string;
  precio?: number;
  imagen: string;
  cuotas?: string;
  destacado?: boolean;
  oferta?: boolean;
  nuevo?: boolean;
}
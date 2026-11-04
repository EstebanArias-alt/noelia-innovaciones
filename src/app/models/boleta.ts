export interface LineaBoleta { nombre: string; cantidad: number | null; precio: number | null; }
export interface DatosBoleta {
  comercio: string; direccion: string; contacto: string; identificacion: string;
  cliente: string; documento: string; numero: string; fecha: string; pago: string;
  observaciones: string; lineas: LineaBoleta[];
}
export interface BoletaGuardada {
  id: string; created_at: string; datos: DatosBoleta; total: number;
  share_token: string; compartible: boolean;
}
export type BoletaPublica = Pick<BoletaGuardada, 'id' | 'created_at' | 'datos' | 'total'>;
export function subtotalBoleta(linea: LineaBoleta): number {
  return Math.round((linea.cantidad ?? 0) * Math.round((linea.precio ?? 0) * 100)) / 100;
}
export function totalBoleta(lineas: LineaBoleta[]): number {
  return lineas.reduce((suma, linea) => suma + Math.round(subtotalBoleta(linea) * 100), 0) / 100;
}
export function validarBoleta(datos: DatosBoleta): boolean {
  const fecha = new Date(datos.fecha + 'T12:00:00Z');
  const limites: [keyof Omit<DatosBoleta, 'lineas'>, number][] = [
    ['comercio', 150], ['direccion', 250], ['contacto', 150], ['identificacion', 100],
    ['cliente', 150], ['documento', 50], ['numero', 100], ['fecha', 10], ['pago', 50], ['observaciones', 2000]
  ];
  return limites.every(([campo, limite]) => typeof datos[campo] === 'string' && datos[campo].length <= limite) &&
    !!datos.comercio.trim() && !!datos.cliente.trim() && !!datos.numero.trim() &&
    /^\d{4}-\d{2}-\d{2}$/.test(datos.fecha) && !Number.isNaN(fecha.getTime()) &&
    fecha.toISOString().slice(0, 10) === datos.fecha &&
    datos.lineas.length > 0 && datos.lineas.length <= 100 &&
    datos.lineas.every(l => !!l.nombre.trim() && l.nombre.length <= 200 && Number.isInteger(l.cantidad) &&
      l.cantidad! > 0 && l.cantidad! <= 1000000 && l.precio != null &&
      Number.isFinite(l.precio) && l.precio > 0 && l.precio <= 1000000000 &&
      Math.round(l.precio * 100) > 0) &&
    Number.isSafeInteger(Math.round(totalBoleta(datos.lineas) * 100));
}

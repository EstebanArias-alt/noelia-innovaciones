export interface LineaBoleta { nombre: string; cantidad: number | null; precio: number | null; }
export interface DatosBoleta {
  comercio: string; direccion: string; contacto: string; identificacion: string;
  cliente: string; documento: string; numero: string; fecha: string; pago: string;
  observaciones: string; lineas: LineaBoleta[];
  // Opcionales para seguir leyendo las boletas anteriores sin alterar su contenido.
  domicilio_cliente?: string; telefono_cliente?: string;
  autorizacion?: string; estado?: string; vendedor?: string;
  flete?: number; armar_domicilio?: boolean;
  pautas_entrega?: string; pautas_armado?: string; politicas_empresa?: string;
}
export interface BoletaGuardada {
  id: string; created_at: string; datos: DatosBoleta; total: number;
  share_token: string; compartible: boolean;
}
export type BoletaPublica = Pick<BoletaGuardada, 'id' | 'created_at' | 'datos' | 'total'>;
export function subtotalBoleta(linea: LineaBoleta): number {
  return Math.round((linea.cantidad ?? 0) * Math.round((linea.precio ?? 0) * 100)) / 100;
}
export function totalBoleta(lineas: LineaBoleta[], flete = 0): number {
  return (lineas.reduce((suma, linea) => suma + Math.round(subtotalBoleta(linea) * 100), 0) + Math.round(flete * 100)) / 100;
}
export function validarBoleta(datos: DatosBoleta): boolean {
  const fecha = new Date(datos.fecha + 'T12:00:00Z');
  const limites: [keyof DatosBoleta, number][] = [
    ['comercio', 150], ['direccion', 250], ['contacto', 150], ['identificacion', 100],
    ['cliente', 150], ['documento', 50], ['numero', 100], ['fecha', 10], ['pago', 50], ['observaciones', 2000]
  ];
  const opcionales: [keyof DatosBoleta, number][] = [
    ['domicilio_cliente', 250], ['telefono_cliente', 80], ['autorizacion', 100],
    ['estado', 50], ['vendedor', 150], ['pautas_entrega', 8000],
    ['pautas_armado', 8000], ['politicas_empresa', 8000]
  ];
  return limites.every(([campo, limite]) => typeof datos[campo] === 'string' && (datos[campo] as string).length <= limite) &&
    opcionales.every(([campo, limite]) => datos[campo] === undefined ||
      (typeof datos[campo] === 'string' && (datos[campo] as string).length <= limite)) &&
    (datos.armar_domicilio === undefined || typeof datos.armar_domicilio === 'boolean') &&
    (datos.flete === undefined || (Number.isFinite(datos.flete) && datos.flete >= 0 && datos.flete <= 1000000000)) &&
    !!datos.comercio.trim() && !!datos.cliente.trim() && !!datos.numero.trim() &&
    /^\d{4}-\d{2}-\d{2}$/.test(datos.fecha) && !Number.isNaN(fecha.getTime()) &&
    fecha.toISOString().slice(0, 10) === datos.fecha &&
    datos.lineas.length > 0 && datos.lineas.length <= 100 &&
    datos.lineas.every(l => !!l.nombre.trim() && l.nombre.length <= 200 && Number.isInteger(l.cantidad) &&
      l.cantidad! > 0 && l.cantidad! <= 1000000 && l.precio != null &&
      Number.isFinite(l.precio) && l.precio > 0 && l.precio <= 1000000000 &&
      Math.round(l.precio * 100) > 0) &&
    Number.isSafeInteger(Math.round(totalBoleta(datos.lineas, datos.flete) * 100));
}

import { DatosBoleta, validarBoleta, totalBoleta } from './boleta';
describe('Datos de boletas', () => {
  const datos: DatosBoleta = { comercio: 'Noelia', direccion: '', contacto: '', identificacion: '',
    cliente: 'Ana', documento: '', numero: 'B1', fecha: '2026-11-04', pago: 'Efectivo', observaciones: '',
    lineas: [{ nombre: 'Mesa', cantidad: 1, precio: 100 }] };
  it('rechaza fechas inexistentes, precios ausentes y filas excesivas', () => {
    expect(validarBoleta(datos)).toBeTrue();
    expect(validarBoleta({ ...datos, fecha: '2026-02-31' })).toBeFalse();
    expect(validarBoleta({ ...datos, lineas: [{ nombre: 'A', cantidad: 1, precio: null }] })).toBeFalse();
    expect(validarBoleta({ ...datos, lineas: Array(101).fill(datos.lineas[0]) })).toBeFalse();
  });
  it('suma flete y valida los campos opcionales manteniendo las boletas anteriores', () => {
    expect(totalBoleta(datos.lineas, 25.15)).toBe(125.15);
    expect(validarBoleta({ ...datos, flete: 0, armar_domicilio: false })).toBeTrue();
    expect(validarBoleta({ ...datos, flete: -1 })).toBeFalse();
    expect(validarBoleta({ ...datos, pautas_entrega: 'x'.repeat(8001) })).toBeFalse();
    expect(validarBoleta(datos)).toBeTrue();
  });
  it('suma en centavos y no altera las líneas', () => {
    const lineas = [{ nombre: 'A', cantidad: 3, precio: 0.1 }, { nombre: 'B', cantidad: 1, precio: 0.2 }];
    expect(totalBoleta(lineas)).toBe(0.5); expect(lineas[0].precio).toBe(0.1);
  });
});

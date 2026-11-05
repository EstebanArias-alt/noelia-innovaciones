import { htmlBoleta } from './boleta-impresion';
import { DatosBoleta } from '../models/boleta';
describe('Diseño de boleta aprobado', () => {
  const datos: DatosBoleta = { comercio: 'Noelia', direccion: 'Juana Manuela Gorriti N.º 670', contacto: 'Teléfono', identificacion: 'Responsable monotributo', cliente: 'Ana', documento: '', numero: 'B1', fecha: '2026-11-05', pago: 'Tarjeta', observaciones: '<script>ejemplo</script>', tipo_tarjeta: 'Visa', tiempo_entrega: '10 días', sena: 20, flete: 10, lineas: [{ nombre: 'Mesa', cantidad: 1, precio: 100 }] };
  it('muestra subtotal, total y saldo sin descontar seña del valor de la compra', () => {
    const html = htmlBoleta(datos);
    expect(html).toContain('110,00'); expect(html).toContain('90,00');
    expect(html).toContain('Visa'); expect(html).toContain('10 días');
    expect(html).toContain('OBSERVACIÓN:'); expect(html).toContain('&lt;script&gt;');
    expect(html.indexOf('class="datos-comercio"')).toBeLessThan(html.indexOf('class="marca"'));
  });
  it('no inventa pagos para boletas anteriores y conserva su estado', () => {
    const html = htmlBoleta({ ...datos, sena: undefined, estado: 'Señado' });
    expect(html).toContain('Señado'); expect(html).not.toContain('<th>SALDO</th>');
  });
});

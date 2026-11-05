import { htmlBoleta } from '../../services/boleta-impresion';
import { GenerarBoletaComponent } from './generar-boleta.component';
import { BoletasService } from '../../services/boletas.service';
import { Producto } from '../../models/producto';

describe('GenerarBoletaComponent', () => {
  let component: GenerarBoletaComponent;
  beforeEach(() => { component = new GenerarBoletaComponent({} as BoletasService); });

  it('copia el precio elegido sin modificar el producto y deja consultar sin precio', () => {
    const producto = { id: 1, nombre: 'Sofá', precio: 100, precio_tarjeta: 120 } as Producto;
    component.productos = [producto];
    component.seleccionado = '1';
    component.tipoPrecio = 'tarjeta';
    component.agregar();
    component.lineas[0].precio = 150;
    expect(producto.precio_tarjeta).toBe(120);
    component.productos = [{ id: 2, nombre: 'Mesa' } as Producto];
    component.seleccionado = '2';
    component.agregar();
    expect(component.lineas[1].precio).toBeNull();
  });

  it('suma importes en centavos', () => {
    component.lineas = [{ nombre: 'A', cantidad: 3, precio: 0.1 }, { nombre: 'B', cantidad: 1, precio: 0.2 }];
    expect(component.total).toBe(0.5);
  });

  it('impide imprimir precios ausentes y cantidades fraccionarias', () => {
    const abrir = spyOn(window, 'open');
    component.comercio = 'Local'; component.cliente = 'Cliente'; component.numero = '1'; component.fecha = '2026-11-04';
    component.lineas = [{ nombre: 'A', cantidad: 1, precio: null }];
    component.imprimir();
    component.lineas[0] = { nombre: 'A', cantidad: 1.5, precio: 20 };
    component.imprimir();
    expect(abrir).not.toHaveBeenCalled();
    expect(component.error).toBeTruthy();
  });

  it('escapa los datos del cliente en el documento imprimible', () => {
    component.cliente = '<img src=x onerror=alert(1)>';
    component.numero = 'B-1'; component.fecha = '2026-11-04';
    component.lineas = [{ nombre: '<script>alert(1)</script>', cantidad: 1, precio: 10 }];
    const html = htmlBoleta({ comercio: component.comercio, direccion: '', contacto: '', identificacion: '',
      cliente: component.cliente, documento: '', numero: component.numero, fecha: component.fecha, pago: 'Efectivo',
      observaciones: '', lineas: component.lineas });
    expect(html).toContain('&lt;img');
    expect(html).toContain('&lt;script&gt;');
    expect(html).not.toContain('<img src=x');
    expect(html).toContain('logo-boleta-noelia.png');
    expect(html).toContain('BOLETA DE VENTA');
  });
});

describe('Guardado de boletas', () => {
  it('reintenta con el mismo id y contenido sin duplicar y bloquea doble clic', async () => {
    let terminar!: (valor: unknown) => void;
    const guardar = jasmine.createSpy('guardar').and.callFake(() => new Promise(resolve => { terminar = resolve; }));
    const component = new GenerarBoletaComponent({ guardar } as unknown as BoletasService);
    component.abrir(); component.cliente = 'Ana'; component.armarDomicilio = false;
    component.lineas = [{ nombre: 'Mesa', cantidad: 1, precio: 100 }];
    component.tipoTarjeta = 'Visa'; component.tiempoEntrega = '10 días'; component.sena = 25;
    expect(component.saldo).toBe(75);
    const intento = component.guardar();
    await component.guardar();
    expect(guardar).toHaveBeenCalledTimes(1);
    terminar(Promise.reject(new Error('Sin conexión')));
    await intento;
    expect(component.guardada).toBeNull();
    expect(component.pendiente?.cliente).toBe('Ana');
    const primerId = guardar.calls.first().args[0];
    const primerosDatos = guardar.calls.first().args[1];
    guardar.and.resolveTo({ id: primerId, datos: primerosDatos, compartible: true, share_token: 'token' });
    await component.guardar();
    expect(guardar.calls.mostRecent().args[0]).toBe(primerId);
    expect(guardar.calls.mostRecent().args[1]).toEqual(primerosDatos);
    expect(component.guardada?.datos.cliente).toBe('Ana');
    expect(component.guardada?.datos.sena).toBe(25);
    expect(component.guardada?.datos.tipo_tarjeta).toBe('Visa');
    expect(component.guardada?.datos.tiempo_entrega).toBe('10 días');
    await component.guardar();
    expect(guardar).toHaveBeenCalledTimes(2);
  });
});


describe('Impresión con entrega y armado', () => {
  it('muestra flete, estado, autorización, vendedor, elección de armado y escapa las pautas', () => {
    const datos = { comercio: 'Noelia', direccion: '', contacto: '', identificacion: '', cliente: 'Ana',
      documento: '', numero: 'B1', fecha: '2026-11-04', pago: 'Tarjeta', observaciones: '',
      lineas: [{ nombre: 'Mesa', cantidad: 1, precio: 100 }], flete: 25.15,
      autorizacion: 'AUT-42', estado: 'Señado', vendedor: 'Vendedor Uno', armar_domicilio: false,
      pautas_entrega: '<script>alert(1)</script>', pautas_armado: 'Armado', politicas_empresa: 'Política' };
    const html = htmlBoleta(datos);
    expect(html).toContain('AUT-42'); expect(html).toContain('Señado'); expect(html).toContain('Vendedor Uno');
    expect(html).toContain('125,15'); expect(html).toContain('25,15');
    expect(html).toContain('Armar en domicilio'); expect(html).toContain('class="condiciones"');
    expect(html).toContain('&lt;script&gt;'); expect(html).not.toContain('<script>');
    const antigua = htmlBoleta({ ...datos, flete: undefined, armar_domicilio: undefined,
      autorizacion: undefined, estado: undefined, vendedor: undefined, pautas_entrega: undefined,
      pautas_armado: undefined, politicas_empresa: undefined });
    expect(antigua).not.toContain('class="condiciones"');
    expect(antigua).toContain('Sin especificar');
  });
});

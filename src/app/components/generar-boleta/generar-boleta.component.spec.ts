import { GenerarBoletaComponent } from './generar-boleta.component';
import { Producto } from '../../models/producto';

describe('GenerarBoletaComponent', () => {
  let component: GenerarBoletaComponent;
  beforeEach(() => { component = new GenerarBoletaComponent(); });

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
    const escribir = jasmine.createSpy('write');
    spyOn(window, 'open').and.returnValue({ document: { write: escribir, close() {} }, focus() {} } as unknown as Window);
    component.cliente = '<img src=x onerror=alert(1)>';
    component.numero = 'B-1'; component.fecha = '2026-11-04';
    component.lineas = [{ nombre: '<script>alert(1)</script>', cantidad: 1, precio: 10 }];
    component.imprimir();
    const html = escribir.calls.mostRecent().args[0] as string;
    expect(html).toContain('&lt;img');
    expect(html).toContain('&lt;script&gt;');
    expect(html).not.toContain('<img');
  });
});

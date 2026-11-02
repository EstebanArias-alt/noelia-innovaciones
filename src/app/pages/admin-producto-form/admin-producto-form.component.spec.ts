import { ActivatedRoute, Router } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';
import { AdminProductoFormComponent } from './admin-producto-form.component';

describe('Cantidad de stock del producto', () => {
  let component: AdminProductoFormComponent;
  let service: jasmine.SpyObj<SupabaseService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(() => {
    service = jasmine.createSpyObj('SupabaseService', [
      'generarSlugUnico', 'crearProducto', 'actualizarProducto', 'getProductoPorId',
      'guardarGaleriaProducto', 'subirImagenProducto'
    ]);
    router = jasmine.createSpyObj('Router', ['navigate']);
    service.generarSlugUnico.and.resolveTo('colchon');
    service.crearProducto.and.resolveTo({ id: 1, slug: 'colchon' });
    service.actualizarProducto.and.resolveTo({ id: 1, slug: 'colchon' });
    router.navigate.and.resolveTo(true);
    service.guardarGaleriaProducto.and.resolveTo(true);
    component = new AdminProductoFormComponent(service, router, {
      snapshot: { paramMap: { get: () => '1' } }
    } as unknown as ActivatedRoute);
    component.nombre = 'Colchón';
  });

  for (const cantidad of [0, 1, 8]) {
    it(`guarda ${cantidad} unidades con su disponibilidad`, async () => {
      component.cantidadStock = cantidad;
      await component.guardar();
      expect(service.crearProducto).toHaveBeenCalledWith(jasmine.objectContaining({
        cantidad_stock: cantidad, stock: cantidad > 0
      }));
    });
  }

  for (const cantidad of [null, -1, 1.5, NaN, Infinity, 2147483648]) {
    it(`rechaza una cantidad inválida: ${cantidad}`, async () => {
      component.cantidadStock = cantidad;
      await component.guardar();
      expect(service.crearProducto).not.toHaveBeenCalled();
      expect(service.actualizarProducto).not.toHaveBeenCalled();
      expect(component.error).toBeTruthy();
    });
  }

  it('no inventa unidades para productos anteriores disponibles', async () => {
    service.getProductoPorId.and.resolveTo({ stock: true });
    await component.ngOnInit();
    expect(component.cantidadStock).toBeNull();
  });

  it('carga cero para productos anteriores sin stock', async () => {
    service.getProductoPorId.and.resolveTo({ stock: false });
    await component.ngOnInit();
    expect(component.cantidadStock).toBe(0);
  });

  it('conserva la cantidad guardada al abrir una edición', async () => {
    service.getProductoPorId.and.resolveTo({ stock: true, cantidad_stock: 8 });
    await component.ngOnInit();
    expect(component.cantidadStock).toBe(8);
  });

  it('actualiza a sin stock al editar la cantidad a cero', async () => {
    component.modoEdicion = true;
    component.productoId = 1;
    component.cantidadStock = 0;
    await component.guardar();
    expect(service.actualizarProducto).toHaveBeenCalledWith(1, jasmine.objectContaining({
      cantidad_stock: 0, stock: false
    }));
    expect(service.crearProducto).not.toHaveBeenCalled();
  });
  it('guarda los precios de contado y tarjeta por separado', async () => {
    component.cantidadStock = 5;
    component.precio = 90000;
    component.precioTarjeta = 117000;
    component.cuotas = '6 cuotas';
    await component.guardar();
    expect(service.crearProducto).toHaveBeenCalledWith(jasmine.objectContaining({
      precio: 90000, precio_tarjeta: 117000, cuotas: '6 cuotas', cantidad_stock: 5
    }));
  });

  it('conserva el precio existente y deja tarjeta vacía en productos anteriores', async () => {
    service.getProductoPorId.and.resolveTo({ precio: 90000, stock: true, cantidad_stock: 5 });
    await component.ngOnInit();
    expect(component.precio).toBe(90000);
    expect(component.precioTarjeta).toBeNull();
  });

  it('permite quitar el precio de tarjeta al editar', async () => {
    component.modoEdicion = true;
    component.productoId = 1;
    component.cantidadStock = 5;
    component.precioTarjeta = null;
    await component.guardar();
    expect(service.actualizarProducto).toHaveBeenCalledWith(1, jasmine.objectContaining({
      precio_tarjeta: null
    }));
  });

  for (const precio of [-1, 0, NaN, Infinity]) {
    it(`rechaza un precio de tarjeta inválido: ${precio}`, async () => {
      component.cantidadStock = 5;
      component.precioTarjeta = precio;
      await component.guardar();
      expect(service.crearProducto).not.toHaveBeenCalled();
      expect(component.error).toBeTruthy();
    });
  }

  it('ordena fotos guardadas y nuevas juntas sin separar la vista previa del archivo', () => {
    const archivo = new File(['foto'], 'nueva.jpg', { type: 'image/jpeg' });
    const guardada = { preview: 'https://ejemplo.test/a.jpg', nombre: 'Guardada',
      imagen: { id: 1, url: 'https://ejemplo.test/a.jpg', orden: 1, principal: true } };
    const nueva = { preview: 'blob:nueva', nombre: archivo.name, archivo };
    component.fotos = [guardada, nueva];
    component.moverFoto(1, 0);
    expect(component.fotos[0]).toBe(nueva);
    expect(component.fotos[0].archivo).toBe(archivo);
    expect(component.fotos[1]).toBe(guardada);
  });

  it('ignora movimientos fuera de los límites y durante el guardado', () => {
    component.fotos = [{ preview: 'a', nombre: 'A' }, { preview: 'b', nombre: 'B' }];
    component.moverFoto(0, -1);
    component.moverFoto(1, 2);
    expect(component.fotos[0].nombre).toBe('A');
    component.guardando = true;
    component.moverFoto(1, 0);
    expect(component.fotos[0].nombre).toBe('A');
  });

  it('guarda el orden completo de las fotos existentes', async () => {
    component.cantidadStock = 5;
    component.modoEdicion = true;
    component.productoId = 1;
    component.fotos = [2, 1].map(id => ({ preview: String(id), nombre: String(id),
      imagen: { id, url: String(id), orden: id, principal: id === 1 } }));
    await component.guardar();
    expect(service.guardarGaleriaProducto).toHaveBeenCalledWith(1, [2, 1], ['', '']);
    expect(router.navigate).toHaveBeenCalledWith(['/admin']);
  });

  it('conserva las fotos si falla el guardado del orden', async () => {
    component.cantidadStock = 5;
    service.guardarGaleriaProducto.and.resolveTo(false);
    await component.guardar();
    expect(router.navigate).not.toHaveBeenCalled();
    expect(component.guardando).toBeFalse();
    expect(component.error).toContain('no se pudo guardar el orden');
    expect(component.modoEdicion).toBeTrue();
    expect(component.productoId).toBe(1);
  });

  it('mantiene el color asociado a su foto después de moverla', async () => {
    component.cantidadStock = 5;
    component.modoEdicion = true;
    component.productoId = 1;
    component.fotos = [
      { preview: 'a', nombre: 'A', color: 'Negro', imagen: { id: 1, url: 'a', orden: 1, principal: true } },
      { preview: 'b', nombre: 'B', color: ' Blanco y negro ', imagen: { id: 2, url: 'b', orden: 2, principal: false } }
    ];
    component.moverFoto(1, 0);
    await component.guardar();
    expect(service.guardarGaleriaProducto).toHaveBeenCalledWith(1, [2, 1], ['Blanco y negro', 'Negro']);
  });

  it('agrega ejemplos sin duplicar ni reemplazar datos ya cargados', () => {
    component.caracteristicas = [{ nombre: 'Densidad', valor: '26 kg/m³' }];
    component.usarEjemplos('Colchones');
    component.usarEjemplos('Colchones');
    expect(component.caracteristicas.filter(item => item.nombre === 'Densidad').length).toBe(1);
    expect(component.caracteristicas[0].valor).toBe('26 kg/m³');
  });

  it('guarda solo las características completas y conserva las unidades', async () => {
    component.cantidadStock = 5;
    component.caracteristicas = [
      { nombre: ' Densidad ', valor: ' 26 kg/m³ ' },
      { nombre: 'Altura', valor: '' }, { nombre: '', valor: '' }
    ];
    await component.guardar();
    expect(service.crearProducto).toHaveBeenCalledWith(jasmine.objectContaining({
      caracteristicas: [{ nombre: 'Densidad', valor: '26 kg/m³' }]
    }));
  });

  it('rechaza características duplicadas y valores sin nombre', async () => {
    component.cantidadStock = 5;
    component.caracteristicas = [{ nombre: 'Densidad', valor: '26' }, { nombre: ' densidad ', valor: '30' }];
    await component.guardar();
    expect(service.crearProducto).not.toHaveBeenCalled();
    component.caracteristicas = [{ nombre: '', valor: '26 kg/m³' }];
    await component.guardar();
    expect(service.crearProducto).not.toHaveBeenCalled();
  });

});

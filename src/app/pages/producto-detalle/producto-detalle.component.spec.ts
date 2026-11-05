import { ActivatedRoute } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';
import { ProductoDetalleComponent } from './producto-detalle.component';

describe('Galería por color', () => {
  let component: ProductoDetalleComponent;
  let service: jasmine.SpyObj<SupabaseService>;

  beforeEach(async () => {
    service = jasmine.createSpyObj('SupabaseService', ['getProductoPorSlug', 'getProductos']);
    service.getProductos.and.resolveTo([]);
    service.getProductoPorSlug.and.resolveTo({
      id: 1, slug: 'mueble', nombre: 'Mueble', categoria: 'Varios', stock: true,
      colores: 'Negro, Blanco y negro, Beige',
      producto_imagenes: [
        { id: 1, url: 'negro-frente', orden: 1, principal: true, color: 'Negro' },
        { id: 2, url: 'negro-abierto', orden: 2, principal: false, color: ' negro ' },
        { id: 3, url: 'blanco-frente', orden: 3, principal: false, color: 'Blanco y negro' },
        { id: 4, url: 'detalle', orden: 4, principal: false, color: null }
      ]
    });
    component = new ProductoDetalleComponent({
      snapshot: { paramMap: { get: () => 'mueble' } }
    } as unknown as ActivatedRoute, service);
    await component.ngOnInit();
  });

  it('agrupa las vistas de un color sin duplicar nombres por mayúsculas o espacios', () => {
    expect(component.coloresConFoto).toEqual(['Negro', 'Blanco y negro']);
    expect(component.galeriaVisible.map(imagen => imagen.id)).toEqual([1, 2]);
  });

  it('cambia la foto y las miniaturas al elegir otro color', () => {
    component.seleccionarColor('Blanco y negro');
    expect(component.imagenSeleccionada).toBe('blanco-frente');
    expect(component.galeriaVisible.map(imagen => imagen.id)).toEqual([3]);
  });

  it('incluye todas las fotos al quitar el filtro, también las que no tienen color', () => {
    component.seleccionarColor('');
    expect(component.galeriaVisible.length).toBe(4);
    component.seleccionarImagen('detalle');
    expect(component.imagenSeleccionada).toBe('detalle');
    expect(component.colorDeImagen).toBe('');
  });

  it('no inventa una asociación para los colores anteriores sin fotos asignadas', () => {
    expect(component.coloresSinFoto).toEqual(['Beige']);
    component.seleccionarColor('Beige');
    expect(component.imagenSeleccionada).toBe('negro-frente');
  });

  it('incluye el color mostrado en la consulta de WhatsApp', () => {
    component.seleccionarColor('Blanco y negro');
    expect(decodeURIComponent(component.whatsappUrl)).toContain('Color: Blanco y negro');
  });
  it('integra medidas y material anteriores con las características nuevas', () => {
    component.producto!.medidas = '80 × 190 cm';
    component.producto!.material = 'Espuma';
    component.producto!.caracteristicas = [
      { nombre: 'Densidad', valor: '26 kg/m³' },
      { nombre: 'Altura', valor: '26 cm' },
      { nombre: 'Tipo de tela', valor: '' }
    ];
    expect(component.fichaTecnica).toEqual([
      { nombre: 'Medidas', valor: '80 × 190 cm' },
      { nombre: 'Material', valor: 'Espuma' },
      { nombre: 'Densidad', valor: '26 kg/m³' },
      { nombre: 'Altura', valor: '26 cm' }
    ]);
  });

  it('muestra cantidades por color y trata cero como agotado aunque haya stock general', () => {
    component.producto!.stock_colores = [{ color: ' negro ', cantidad: 0 }, { color: 'Blanco y negro', cantidad: 3 }];
    component.seleccionarColor('Negro');
    expect(component.cantidadSeleccionada).toBe(0);
    expect(component.disponibleSeleccionado).toBeFalse();
    expect(decodeURIComponent(component.whatsappUrl)).toContain('figura sin stock');
    component.seleccionarColor('Blanco y negro');
    expect(component.cantidadSeleccionada).toBe(3);
    expect(component.disponibleSeleccionado).toBeTrue();
  });

  it('permite seleccionar colores con stock aunque no tengan fotos', () => {
    component.producto!.stock_colores = [{ color: 'Beige', cantidad: 2 }];
    expect(component.coloresSeleccionables).toContain('Beige');
    component.seleccionarColor('Beige');
    expect(component.cantidadSeleccionada).toBe(2);
    expect(component.imagenSeleccionada).toBe('');
    expect(component.galeriaVisible).toEqual([]);
    expect(decodeURIComponent(component.whatsappUrl)).toContain('Color: Beige');
  });

  it('mantiene disponibilidad antigua y muestra total al quitar selección', () => {
    expect(component.disponibleSeleccionado).toBeTrue();
    component.producto!.cantidad_stock = 5;
    component.seleccionarColor('');
    expect(component.cantidadSeleccionada).toBe(5);
    expect(component.disponibleSeleccionado).toBeTrue();
  });

});

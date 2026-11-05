import {
  Component,
  OnInit,
  OnDestroy
} from '@angular/core';

import {
  FormsModule
} from '@angular/forms';

import {
  ActivatedRoute,
  Router
} from '@angular/router';

import {
  StockColor,
  ProductoImagen,
  CaracteristicaProducto,
  normalizarCaracteristicas
} from '../../models/producto';

import {
  SupabaseService
} from '../../services/supabase.service';


interface FotoProducto {
  preview: string;
  nombre: string;
  color?: string;
  imagen?: ProductoImagen;
  archivo?: File;
}

@Component({
  selector: 'app-admin-producto-form',
  standalone: true,

  imports: [
    FormsModule
  ],

  templateUrl:
    './admin-producto-form.component.html',

  styleUrl:
    './admin-producto-form.component.css'
})
export class AdminProductoFormComponent
  implements OnInit, OnDestroy {

  modoEdicion = false;

  productoId: number | null = null;

  cargando = false;
  guardando = false;

  error = '';


  /* ========================= */
  /* DATOS DEL PRODUCTO */
  /* ========================= */

  nombre = '';

  slug = '';

  categoria = 'Sofás';

  descripcion = '';

  precio: number | null = null;

  precioTarjeta: number | null = null;

  precioAnterior: number | null = null;

  cuotas = '';

  medidas = '';

  material = '';

  caracteristicas: CaracteristicaProducto[] = [];
  readonly ejemplosCaracteristicas: Record<string, string[]> = {
    Colchones: ['Densidad', 'Altura', 'Tipo de tela', 'Firmeza', 'Peso máximo recomendado'],
    Sillones: ['Tipo de tela', 'Relleno', 'Estructura', 'Cantidad de cuerpos'],
    Muebles: ['Terminación', 'Espesor de placa', 'Tipo de herrajes']
  };

  colores = '';
  stockPorColor = false;
  stockColores: StockColor[] = [];

  agregarStockColor(): void {
    this.stockColores.push({ color: '', cantidad: 0 });
  }

  get totalStockColores(): number {
    return this.stockColores.reduce((total, fila) => total + (fila.cantidad ?? 0), 0);
  }

  cambiarStockPorColor(): void {
    if (this.stockPorColor && !this.stockColores.length) {
      const colores = [...new Set(this.colores.split(',').map(c => c.trim()).filter(Boolean))];
      this.stockColores = (colores.length ? colores : ['']).map(color => ({ color, cantidad: null }));
    }
    if (!this.stockPorColor) this.cantidadStock = this.totalStockColores;
  }


  cantidadStock: number | null = 0;

  oferta = false;

  nuevo = false;

  destacado = false;


  categorias = [
    'Sofás',
    'Sillones',
    'Esquineros',
    'Living',
    'Mesas'
  ];


  /* ========================= */
  /* IMÁGENES */
  /* ========================= */

  fotos: FotoProducto[] = [];
  arrastrando: number | null = null;
  eliminandoFoto = false;
  anuncioFotos = '';

  get imagenesExistentes(): ProductoImagen[] {
    return this.fotos.flatMap(foto => foto.imagen ? [foto.imagen] : []);
  }

  ngOnDestroy(): void {
    for (const foto of this.fotos) {
      if (foto.archivo) URL.revokeObjectURL(foto.preview);
    }
  }

  constructor(
    private supabaseService:
      SupabaseService,

    private router:
      Router,

    private route:
      ActivatedRoute
  ) {}


  /* ========================= */
  /* INICIAR */
  /* ========================= */

  async ngOnInit():
    Promise<void> {

    const id =
      this.route.snapshot
        .paramMap
        .get('id');


    /* ========================= */
    /* NUEVO PRODUCTO */
    /* ========================= */

    if (!id) {
      return;
    }


    /* ========================= */
    /* MODO EDICIÓN */
    /* ========================= */

    this.modoEdicion = true;

    this.productoId =
      Number(id);


    if (
      Number.isNaN(
        this.productoId
      )
    ) {

      this.error =
        'El ID del producto no es válido.';

      return;

    }


    this.cargando = true;


    const producto =
      await this.supabaseService
        .getProductoPorId(
          this.productoId
        );


    this.cargando = false;


    if (!producto) {

      this.error =
        'No se pudo cargar el producto.';

      return;

    }


    /* ========================= */
    /* IMÁGENES EXISTENTES */
    /* ========================= */

    this.fotos = [...(producto.producto_imagenes ?? [])]
      .sort((a, b) => Number(b.principal) - Number(a.principal) || a.orden - b.orden)
      .map(imagen => ({ imagen, preview: imagen.url, nombre: 'Foto guardada', color: imagen.color ?? '' }));


    /* ========================= */
    /* CARGAR DATOS */
    /* ========================= */

    this.nombre =
      producto.nombre ?? '';


    this.slug =
      producto.slug ?? '';


    this.categoria =
      producto.categoria
      ?? 'Sofás';


    this.descripcion =
      producto.descripcion
      ?? '';


    this.precio =
      producto.precio
      ?? null;


    this.precioTarjeta = producto.precio_tarjeta ?? null;

    this.precioAnterior =
      producto.precio_anterior
      ?? null;


    this.cuotas =
      producto.cuotas
      ?? '';


    this.medidas =
      producto.medidas
      ?? '';


    this.material =
      producto.material
      ?? '';


    /* ========================= */
    /* COLORES */
    /* ========================= */

    if (
      Array.isArray(
        producto.colores
      )
    ) {

      this.colores =
        producto.colores
          .join(', ');

    } else {

      this.colores =
        producto.colores
        ?? '';

    }


    /* ========================= */
    /* ESTADOS */
    /* ========================= */

    this.stockPorColor = Array.isArray(producto.stock_colores) && producto.stock_colores.length > 0;
    this.stockColores = (producto.stock_colores ?? []).map((fila: StockColor) => ({ ...fila }));
    this.cantidadStock = producto.cantidad_stock
      ?? (producto.stock === false ? 0 : null);


    this.oferta =
      producto.oferta
      ?? false;


    this.nuevo =
      producto.nuevo
      ?? false;


    this.destacado =
      producto.destacado
      ?? false;

  }


  private claveCaracteristica(nombre: string): string {
    return nombre.trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  }

  agregarCaracteristica(): void {
    if (!this.guardando && this.caracteristicas.length < 30) {
      this.caracteristicas.push({ nombre: '', valor: '' });
    }
  }

  quitarCaracteristica(indice: number): void {
    if (!this.guardando) this.caracteristicas.splice(indice, 1);
  }

  usarEjemplos(tipo: string): void {
    if (this.guardando) return;
    const existentes = new Set(this.caracteristicas.map(item => this.claveCaracteristica(item.nombre)));
    for (const nombre of this.ejemplosCaracteristicas[tipo] ?? []) {
      if (!existentes.has(this.claveCaracteristica(nombre)) && this.caracteristicas.length < 30) {
        this.caracteristicas.push({ nombre, valor: '' });
        existentes.add(this.claveCaracteristica(nombre));
      }
    }
  }

  /* ========================= */
  /* SELECCIONAR IMÁGENES */
  /* ========================= */

  seleccionarImagenes(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || this.guardando || this.eliminandoFoto) return;
    this.error = '';
    for (const archivo of Array.from(input.files)) {
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(archivo.type)) {
        this.error = 'Solo se admiten imágenes JPG, PNG o WEBP.';
        continue;
      }
      this.fotos.push({ archivo, nombre: archivo.name, preview: URL.createObjectURL(archivo) });
    }
    // Permitir elegir el mismo archivo de nuevo y sumar otras tandas.
    input.value = '';
    this.anuncioFotos = `${this.fotos.length} fotos en total. La primera es la principal.`;
  }

  moverFoto(desde: number, hasta: number): void {
    if (this.guardando || this.eliminandoFoto || desde === hasta ||
        desde < 0 || hasta < 0 || desde >= this.fotos.length || hasta >= this.fotos.length) return;
    const [foto] = this.fotos.splice(desde, 1);
    this.fotos.splice(hasta, 0, foto);
    this.anuncioFotos = `Foto movida a la posición ${hasta + 1}. La primera es la principal.`;
  }

  iniciarArrastre(event: DragEvent, indice: number): void {
    if (this.guardando || this.eliminandoFoto) { event.preventDefault(); return; }
    this.arrastrando = indice;
    event.dataTransfer?.setData('text/plain', String(indice));
    if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move';
  }

  permitirSoltar(event: DragEvent): void {
    if (this.arrastrando !== null && !this.guardando && !this.eliminandoFoto) event.preventDefault();
  }

  soltarFoto(event: DragEvent, destino: number): void {
    event.preventDefault();
    if (this.arrastrando !== null) this.moverFoto(this.arrastrando, destino);
    this.arrastrando = null;
  }

  /* ========================= */
  /* GUARDAR PRODUCTO */
  /* ========================= */

  async guardar():
    Promise<void> {

    if (this.guardando || this.eliminandoFoto) return;

    this.error = '';

    if (this.stockPorColor) {
      const claves = this.stockColores.map(fila => fila.color.trim().toLocaleLowerCase('es'));
      if (!claves.length || claves.some(clave => !clave || clave.length > 80) ||
          new Set(claves).size !== claves.length || this.stockColores.length > 100 ||
          this.stockColores.some(fila => fila.cantidad === null || !Number.isInteger(fila.cantidad) || fila.cantidad < 0) ||
          this.totalStockColores > 2147483647) {
        this.error = 'Ingresá colores únicos y cantidades enteras desde 0. El total no puede superar 2147483647.';
        return;
      }
      this.cantidadStock = this.totalStockColores;
    }

    if (this.cantidadStock === null ||
        !Number.isInteger(this.cantidadStock) ||
        this.cantidadStock < 0 || this.cantidadStock > 2147483647) {
      this.error = 'Ingresá una cantidad de stock entera entre 0 y 2147483647.';
      return;
    }

    if ([this.precio, this.precioTarjeta, this.precioAnterior].some(
      valor => valor !== null && (!Number.isFinite(valor) || valor <= 0)
    )) {
      this.error = 'Los precios deben ser mayores que 0. Dejá el campo vacío si es a consultar.';
      return;
    }

    if (this.fotos.some(foto => (foto.color?.trim().length ?? 0) > 80)) {
      this.error = 'El nombre de color de cada foto admite hasta 80 caracteres.';
      return;
    }

    if (this.caracteristicas.length > 30 || this.caracteristicas.some(item =>
      item.nombre.trim().length > 80 || item.valor.trim().length > 1000
    )) {
      this.error = 'La ficha admite hasta 30 características, con un nombre de hasta 80 caracteres y un valor de hasta 1000.';
      return;
    }
    const filasConDatos = this.caracteristicas.filter(item => item.nombre.trim() || item.valor.trim());
    // Las filas de ejemplos sin valor se omiten; un valor siempre necesita nombre.
    if (filasConDatos.some(item => item.valor.trim() && !item.nombre.trim())) {
      this.error = 'Ingresá el nombre de cada característica que tenga un valor.';
      return;
    }
    const ficha = normalizarCaracteristicas(filasConDatos);
    const nombres = ficha.map(item => this.claveCaracteristica(item.nombre));
    if (new Set(nombres).size !== nombres.length ||
        (this.material.trim() && nombres.includes('material')) ||
        (this.medidas.trim() && nombres.includes('medidas'))) {
      this.error = 'Hay características repetidas. Usá una sola fila por dato; Material y Medidas ya tienen sus campos arriba.';
      return;
    }

    /* ========================= */
    /* VALIDAR NOMBRE */
    /* ========================= */

    if (
      !this.nombre.trim()
    ) {

      this.error =
        'Ingresá el nombre del producto.';

      return;

    }


    /* ========================= */
    /* GENERAR SLUG */
    /* SOLO AL CREAR */
    /* ========================= */

if (!this.modoEdicion) {

  const slugBase =
    this.crearSlug(
      this.nombre
    );

  this.slug =
    await this.supabaseService
      .generarSlugUnico(
        slugBase
      );

}


    /* ========================= */
    /* VALIDAR CATEGORÍA */
    /* ========================= */

    if (
      !this.categoria.trim()
    ) {

      this.error =
        'Ingresá una categoría.';

      return;

    }


    this.guardando = true;


    /* ========================= */
    /* OBJETO PRODUCTO */
    /* ========================= */

    const producto = {

      nombre:
        this.nombre.trim(),

      slug:
        this.slug,

      categoria:
        this.categoria.trim(),

      descripcion:
        this.descripcion.trim(),

      precio:
        this.precio,

      precio_tarjeta: this.precioTarjeta,

      precio_anterior:
        this.precioAnterior,

      cuotas:
        this.cuotas.trim(),

      medidas:
        this.medidas.trim(),

      material:
        this.material.trim(),

      caracteristicas: ficha,

      colores:
        this.stockPorColor ? this.stockColores.map(fila => fila.color.trim()).join(', ') : this.colores.trim(),

      stock_colores: this.stockPorColor ? this.stockColores.map(fila => ({ color: fila.color.trim(), cantidad: fila.cantidad })) : null,

      cantidad_stock: this.cantidadStock,

      stock: this.cantidadStock > 0,

      oferta:
        this.oferta,

      nuevo:
        this.nuevo,

      destacado:
        this.destacado

    };


    let resultado;


    /* ========================= */
    /* EDITAR */
    /* ========================= */

    if (
      this.modoEdicion &&
      this.productoId !== null
    ) {

      resultado =
        await this.supabaseService
          .actualizarProducto(
            this.productoId,
            producto
          );

    }


    /* ========================= */
    /* CREAR */
    /* ========================= */

    else {

      resultado =
        await this.supabaseService
          .crearProducto(
            producto
          );

    }


    if (!resultado) {

      this.guardando = false;

      this.error =
        'No se pudo guardar el producto.';

      return;

    }


    // Conservar el producto y las subidas completadas para reintentar sin duplicados.
    this.productoId = resultado.id;
    this.slug = resultado.slug;
    this.modoEdicion = true;

    try {
      let siguienteOrden = Math.max(0, ...this.imagenesExistentes.map(imagen => imagen.orden));
      for (const foto of this.fotos) {
        if (!foto.archivo) continue;
        const imagen = await this.supabaseService.subirImagenProducto(
          resultado.id, resultado.slug, foto.archivo, siguienteOrden++
        );
        if (!imagen) {
          this.error = `El producto se guardó, pero no se pudo subir "${foto.nombre}". Podés reintentar sin volver a seleccionar las fotos.`;
          return;
        }
        URL.revokeObjectURL(foto.preview);
        foto.preview = imagen.url;
        foto.imagen = imagen;
        foto.archivo = undefined;
      }

      const ordenGuardado = await this.supabaseService.guardarGaleriaProducto(
        resultado.id, this.imagenesExistentes.map(imagen => imagen.id),
        this.fotos.map(foto => foto.color?.trim() ?? '')
      );
      if (!ordenGuardado) {
        this.error = 'Las fotos se subieron, pero no se pudo guardar el orden y los colores. Reintentá guardar; si otra persona modificó las fotos, recargá el producto.';
        return;
      }
      await this.router.navigate(['/admin']);
    } catch {
      this.error = 'No se pudo terminar de guardar las fotos. Revisá la conexión y reintentá.';
    } finally {
      this.guardando = false;
    }
  }


  /* ========================= */
  /* CANCELAR */
  /* ========================= */

  cancelar(): void {

    this.router.navigate([
      '/admin'
    ]);

  }


  /* ========================= */
  /* CREAR SLUG */
  /* ========================= */

  private crearSlug(
    texto: string
  ): string {

    return texto

      .normalize('NFD')

      .replace(
        /[\u0300-\u036f]/g,
        ''
      )

      .toLowerCase()

      .trim()

      .replace(
        /[^a-z0-9]+/g,
        '-'
      )

      .replace(
        /^-+|-+$/g,
        ''
      );

  }


  async quitarFoto(indice: number): Promise<void> {
    if (this.guardando || this.eliminandoFoto) return;
    const foto = this.fotos[indice];
    if (!foto) return;
    if (foto.imagen) {
      if (!window.confirm('¿Eliminar esta foto guardada? Se eliminará inmediatamente.')) return;
      this.eliminandoFoto = true;
      try {
        const eliminado = await this.supabaseService.eliminarImagenProducto(foto.imagen);
        if (!eliminado) { this.error = 'No se pudo eliminar la imagen.'; return; }
        this.fotos.splice(indice, 1);
        if (foto.imagen.principal && this.imagenesExistentes.length > 0 && this.productoId !== null) {
          const principal = this.imagenesExistentes[0];
          const actualizado = await this.supabaseService.establecerImagenPrincipal(this.productoId, principal.id);
          this.imagenesExistentes.forEach(imagen => imagen.principal = actualizado && imagen.id === principal.id);
          if (!actualizado) this.error = 'La foto se eliminó. Guardá los cambios para establecer la nueva principal.';
        }
      } catch {
        this.error = 'No se pudo completar la eliminación. Recargá el producto para comprobar sus fotos.';
      } finally {
        this.eliminandoFoto = false;
      }
    } else {
      URL.revokeObjectURL(foto.preview);
      this.fotos.splice(indice, 1);
    }
    this.anuncioFotos = `${this.fotos.length} fotos en total.`;
  }
}

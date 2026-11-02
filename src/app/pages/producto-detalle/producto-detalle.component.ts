import {
  Component,
  OnInit
} from '@angular/core';

import {
  ActivatedRoute,
  RouterLink
} from '@angular/router';

import {
  DecimalPipe
} from '@angular/common';

import {
  Producto,
  ProductoImagen,
  CaracteristicaProducto,
  normalizarCaracteristicas
} from '../../models/producto';

import {
  SupabaseService
} from '../../services/supabase.service';

import {
  ProductCardComponent
} from '../../components/product-card/product-card.component';


@Component({
  selector: 'app-producto-detalle',
  standalone: true,

  imports: [
    DecimalPipe,
    RouterLink,
    ProductCardComponent
  ],

  templateUrl:
    './producto-detalle.component.html',

  styleUrl:
    './producto-detalle.component.css'
})
export class ProductoDetalleComponent
  implements OnInit {

  producto?: Producto;

  imagenSeleccionada = '';
  colorSeleccionado = '';
  galeria: ProductoImagen[] = [];

  cargando = true;

  productosRelacionados: Producto[] = [];


  constructor(
    private route: ActivatedRoute,
    private supabaseService: SupabaseService
  ) {}


  async ngOnInit(): Promise<void> {

    const slug =
      this.route.snapshot.paramMap.get(
        'slug'
      );

    if (!slug) {
      this.cargando = false;
      return;
    }


    const data =
      await this.supabaseService
        .getProductoPorSlug(slug);


    if (!data) {
      this.cargando = false;
      return;
    }


    this.producto =
      data as Producto;


    /* ========================= */
    /* COLORES */
    /* ========================= */

    if (
      typeof this.producto.colores === 'string'
    ) {

      this.producto.colores =
        this.producto.colores
          .split(',')
          .map(
            color => color.trim()
          )
          .filter(
            color => color.length > 0
          );

    }


    /* ========================= */
    /* IMÁGENES */
    /* ========================= */

    this.prepararImagenes();


    /* ========================= */
    /* PRODUCTOS RELACIONADOS */
    /* ========================= */

    await this.cargarRelacionados();


    this.cargando = false;

  }


  /* ========================= */
  /* PREPARAR IMÁGENES */
  /* ========================= */

  private prepararImagenes(): void {
    if (!this.producto) return;
    this.galeria = [...(this.producto.producto_imagenes ?? [])]
      .sort((a, b) => a.orden - b.orden);
    if (this.galeria.length === 0) {
      const urls = this.producto.imagenes?.length ? this.producto.imagenes :
        (this.producto.imagen ? [this.producto.imagen] : []);
      this.galeria = urls.map((url, i) => ({ id: -(i + 1), url, orden: i + 1, principal: i === 0 }));
    }
    const principal = this.galeria.find(imagen => imagen.principal) ?? this.galeria[0];
    this.imagenSeleccionada = principal?.url ?? '';
    this.colorSeleccionado = this.coloresConFoto.find(color =>
      this.claveColor(color) === this.claveColor(this.nombreColor(principal?.color))
    ) ?? '';
    this.producto.imagenes = this.galeria.map(imagen => imagen.url);
    this.producto.imagen = this.imagenSeleccionada;
  }

  private nombreColor(color?: string | null): string {
    return color?.trim() ?? '';
  }

  private claveColor(color: string): string {
    return color.trim().toLocaleLowerCase('es');
  }

  get coloresConFoto(): string[] {
    const colores = new Map<string, string>();
    for (const imagen of this.galeria) {
      const color = this.nombreColor(imagen.color);
      if (color && !colores.has(this.claveColor(color))) colores.set(this.claveColor(color), color);
    }
    return [...colores.values()];
  }

  get galeriaVisible(): ProductoImagen[] {
    return this.colorSeleccionado
      ? this.galeria.filter(imagen => this.claveColor(this.nombreColor(imagen.color)) === this.claveColor(this.colorSeleccionado))
      : this.galeria;
  }

  get coloresSinFoto(): string[] {
    const colores = this.producto?.colores;
    const lista = Array.isArray(colores) ? colores : (colores ?? '').split(',');
    const conFoto = new Set(this.coloresConFoto.map(color => this.claveColor(color)));
    return [...new Set(lista.map(color => color.trim()).filter(Boolean))]
      .filter(color => !conFoto.has(this.claveColor(color)));
  }

  get colorDeImagen(): string {
    return this.nombreColor(this.galeria.find(imagen => imagen.url === this.imagenSeleccionada)?.color);
  }

  seleccionarColor(color: string): void {
    if (!color) {
      this.colorSeleccionado = '';
      return;
    }
    const imagen = this.galeria.find(item => this.claveColor(this.nombreColor(item.color)) === this.claveColor(color));
    if (!imagen) return;
    this.colorSeleccionado = this.coloresConFoto.find(item => this.claveColor(item) === this.claveColor(color)) ?? '';
    this.imagenSeleccionada = imagen.url;
  }

  seleccionarImagen(imagen: string): void {
    if (this.galeriaVisible.some(item => item.url === imagen)) this.imagenSeleccionada = imagen;
  }

  /* ========================= */
  /* PRODUCTOS RELACIONADOS */
  /* ========================= */

  private async cargarRelacionados():
    Promise<void> {

    if (!this.producto) {
      return;
    }


    const productos =
      await this.supabaseService
        .getProductos();


    this.productosRelacionados =
      (productos as Producto[])
        .filter(
          producto =>
            producto.id !==
              this.producto!.id
            &&
            producto.categoria ===
              this.producto!.categoria
        )
        .sort(
          (a, b) =>
            Number(b.stock)
            -
            Number(a.stock)
        )
        .slice(0, 4);

  }


  get fichaTecnica(): CaracteristicaProducto[] {
    if (!this.producto) return [];
    const ficha: CaracteristicaProducto[] = [];
    if (this.producto.medidas?.trim()) ficha.push({ nombre: 'Medidas', valor: this.producto.medidas.trim() });
    if (this.producto.material?.trim()) ficha.push({ nombre: 'Material', valor: this.producto.material.trim() });
    const nombres = new Set(ficha.map(item => item.nombre.toLowerCase()));
    for (const item of normalizarCaracteristicas(this.producto.caracteristicas)) {
      const clave = item.nombre.toLowerCase();
      if (!nombres.has(clave)) { ficha.push(item); nombres.add(clave); }
    }
    return ficha;
  }

  /* ========================= */
  /* WHATSAPP */
  /* ========================= */

  get whatsappUrl(): string {

    if (!this.producto) {
      return '#';
    }


    const numero =
      '5493884605421';


    const precioContado = this.producto.precio
      ? `$${this.producto.precio.toLocaleString('es-AR')}` : 'Consultar';
    const precioTarjeta = this.producto.precio_tarjeta
      ? `$${this.producto.precio_tarjeta.toLocaleString('es-AR')}` : 'Consultar';
    const precio = `Contado: ${precioContado}\nCon tarjeta: ${precioTarjeta}` +
      (this.producto.cuotas ? `\nCuotas con tarjeta: ${this.producto.cuotas}` : '');

    const colorConsulta = this.colorDeImagen ? `🎨 Color: ${this.colorDeImagen}\n` : '';

    const enlace =
      `${window.location.origin}/producto/${this.producto.slug}`;


    const mensaje =
      this.producto.stock

        ? (
            `Hola Noelia Innovaciones 👋\n\n` +
            `Quisiera consultar por este producto:\n\n` +
            `🛋️ ${this.producto.nombre}\n` +
            `💰 ${precio}\n` +
            colorConsulta +
            `📦 Categoría: ${this.producto.categoria}\n\n` +
            `🔗 ${enlace}\n\n` +
            `¿Me podrían informar disponibilidad y formas de pago?`
          )

        : (
            `Hola Noelia Innovaciones 👋\n\n` +
            `Vi este producto pero figura sin stock:\n\n` +
            `🛋️ ${this.producto.nombre}\n` +
            `💰 ${precio}\n` +
            colorConsulta +
            `📦 Categoría: ${this.producto.categoria}\n\n` +
            `🔗 ${enlace}\n\n` +
            `¿Tienen fecha estimada de reposición o algún producto similar?`
          );


    return `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;

  }


  /* ========================= */
  /* DESCUENTO */
  /* ========================= */

  get porcentajeDescuento():
    number | null {

    if (!this.producto) {
      return null;
    }


    const precio =
      this.producto.precio;


    const precioAnterior =
      this.producto.precioAnterior
      ??
      this.producto.precio_anterior;


    if (
      !this.producto.oferta ||
      !precio ||
      !precioAnterior ||
      precioAnterior <= precio
    ) {

      return null;

    }


    return Math.round(
      (
        (precioAnterior - precio)
        /
        precioAnterior
      ) * 100
    );

  }

}
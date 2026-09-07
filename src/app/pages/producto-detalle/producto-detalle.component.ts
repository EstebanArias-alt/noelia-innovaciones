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
  Producto
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

    if (!this.producto) {
      return;
    }


    const imagenes =
      this.producto
        .producto_imagenes ?? [];


    if (imagenes.length > 0) {

      const ordenadas =
        [...imagenes].sort(
          (a, b) =>
            a.orden - b.orden
        );


      const principal =
        ordenadas.find(
          imagen =>
            imagen.principal
        );


      this.imagenSeleccionada =
        principal?.url
        ?? ordenadas[0].url;


      this.producto.imagenes =
        ordenadas.map(
          imagen =>
            imagen.url
        );


      this.producto.imagen =
        this.imagenSeleccionada;

      return;

    }


    this.imagenSeleccionada =
      this.producto.imagen
      ?? '';

  }


  /* ========================= */
  /* CAMBIAR IMAGEN */
  /* ========================= */

  seleccionarImagen(
    imagen: string
  ): void {

    this.imagenSeleccionada =
      imagen;

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


  /* ========================= */
  /* WHATSAPP */
  /* ========================= */

  get whatsappUrl(): string {

    if (!this.producto) {
      return '#';
    }


    const numero =
      '5493884605421';


    const precio =
      this.producto.precio

        ? `$${this.producto.precio
            .toLocaleString('es-AR')}`

        : 'Consultar precio';


    const enlace =
      `${window.location.origin}/producto/${this.producto.slug}`;


    const mensaje =
      this.producto.stock

        ? (
            `Hola Noelia Innovaciones 👋\n\n` +
            `Quisiera consultar por este producto:\n\n` +
            `🛋️ ${this.producto.nombre}\n` +
            `💰 ${precio}\n` +
            `📦 Categoría: ${this.producto.categoria}\n\n` +
            `🔗 ${enlace}\n\n` +
            `¿Me podrían informar disponibilidad y formas de pago?`
          )

        : (
            `Hola Noelia Innovaciones 👋\n\n` +
            `Vi este producto pero figura sin stock:\n\n` +
            `🛋️ ${this.producto.nombre}\n` +
            `💰 ${precio}\n` +
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
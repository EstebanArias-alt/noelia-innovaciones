import { Component, Input } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';

import { Producto } from '../../models/producto';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [
    DecimalPipe,
    RouterLink
  ],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.css'
})
export class ProductCardComponent {

  @Input({ required: true })
  producto!: Producto;


  get imagenPrincipal(): string {

    if (
      this.producto.producto_imagenes &&
      this.producto.producto_imagenes.length > 0
    ) {

      const principal =
        this.producto.producto_imagenes.find(
          imagen => imagen.principal
        );

      if (principal) {
        return principal.url;
      }

      const ordenadas =
        [...this.producto.producto_imagenes]
          .sort(
            (a, b) =>
              a.orden - b.orden
          );

      return ordenadas[0].url;

    }

    return this.producto.imagen
      ?? '/images/productos/sin-imagen.jpg';

  }


get whatsappUrl(): string {

  const numero = '5493884605421';

    const precioContado = this.producto.precio
      ? `$${this.producto.precio.toLocaleString('es-AR')}` : 'Consultar';
    const precioTarjeta = this.producto.precio_tarjeta
      ? `$${this.producto.precio_tarjeta.toLocaleString('es-AR')}` : 'Consultar';
    const precio = `Contado: ${precioContado}\nCon tarjeta: ${precioTarjeta}` +
      (this.producto.cuotas ? `\nCuotas con tarjeta: ${this.producto.cuotas}` : '');

  const enlace =
    `${window.location.origin}/producto/${this.producto.slug}`;

  const mensaje = this.producto.stock
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
        `💰 ${precio}\n\n` +
        `🔗 ${enlace}\n\n` +
        `¿Tienen fecha estimada de reposición o algún producto similar?`
      );

  return `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;

}

get porcentajeDescuento(): number | null {

  const precio = this.producto.precio;
  const precioAnterior =
    this.producto.precioAnterior ??
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
    ((precioAnterior - precio) / precioAnterior) * 100
  );

}

imagenError(event: Event): void {

  const imagen =
    event.target as HTMLImageElement;

  imagen.onerror = null;

  imagen.src =
    '/images/productos/sin-imagen.jpg';

}

}
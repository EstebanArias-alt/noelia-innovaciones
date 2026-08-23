import { Component, Input } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Producto } from '../../models/producto';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [DecimalPipe],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.css'
})
export class ProductCardComponent {

  @Input({ required: true })
  producto!: Producto;


  get whatsappUrl(): string {

    const numero = '5493884605421';

    const mensaje =
      `Hola Noelia Innovaciones, quisiera consultar por ${this.producto.nombre}.`;

    return `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;

  }

}
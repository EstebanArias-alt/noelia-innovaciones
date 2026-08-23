import { Component } from '@angular/core';

import { ProductCardComponent }
  from '../product-card/product-card.component';

import { PRODUCTOS }
  from '../../data/productos';

@Component({
  selector: 'app-ofertas',
  standalone: true,
  imports: [
    ProductCardComponent
  ],
  templateUrl: './ofertas.component.html',
  styleUrl: './ofertas.component.css'
})
export class OfertasComponent {

  ofertas =
    PRODUCTOS.filter(
      producto => producto.oferta
    );

}
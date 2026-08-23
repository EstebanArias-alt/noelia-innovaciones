import { Component } from '@angular/core';

import { ProductCardComponent }
  from '../product-card/product-card.component';

import { PRODUCTOS }
  from '../../data/productos';

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [
    ProductCardComponent
  ],
  templateUrl: './productos.component.html',
  styleUrl: './productos.component.css'
})
export class ProductosComponent {

  productosDestacados =
    PRODUCTOS.filter(
      producto => producto.destacado
    );

}
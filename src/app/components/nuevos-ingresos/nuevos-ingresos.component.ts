import { Component } from '@angular/core';

import { ProductCardComponent }
  from '../product-card/product-card.component';

import { PRODUCTOS }
  from '../../data/productos';

@Component({
  selector: 'app-nuevos-ingresos',
  standalone: true,
  imports: [
    ProductCardComponent
  ],
  templateUrl: './nuevos-ingresos.component.html',
  styleUrl: './nuevos-ingresos.component.css'
})
export class NuevosIngresosComponent {

  nuevos =
    PRODUCTOS.filter(
      producto => producto.nuevo
    );

}
import { Component, OnInit } from '@angular/core';

import { ProductCardComponent }
  from '../product-card/product-card.component';

import { SupabaseService }
  from '../../services/supabase.service';

import { Producto }
  from '../../models/producto';

@Component({
  selector: 'app-productos',
  standalone: true,

  imports: [
    ProductCardComponent
  ],

  templateUrl: './productos.component.html',
  styleUrl: './productos.component.css'
})
export class ProductosComponent implements OnInit {

  productosDestacados: Producto[] = [];

  cargando = true;


  constructor(
    private supabaseService: SupabaseService
  ) {}


  async ngOnInit(): Promise<void> {

    const productos =
      await this.supabaseService.getProductos();

    this.productosDestacados =
      productos
        .filter(
          producto =>
            producto.destacado === true &&
            producto.stock === true
        )
        .slice(0, 8);

    this.cargando = false;

  }

}
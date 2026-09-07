import { Component, OnInit } from '@angular/core';

import { ProductCardComponent }
  from '../product-card/product-card.component';

import { SupabaseService }
  from '../../services/supabase.service';

import { Producto }
  from '../../models/producto';

@Component({
  selector: 'app-ofertas',
  standalone: true,

  imports: [
    ProductCardComponent
  ],

  templateUrl: './ofertas.component.html',
  styleUrl: './ofertas.component.css'
})
export class OfertasComponent implements OnInit {

  ofertas: Producto[] = [];

  cargando = true;


  constructor(
    private supabaseService: SupabaseService
  ) {}


  async ngOnInit(): Promise<void> {

    const productos =
      await this.supabaseService.getProductos();

    this.ofertas =
      productos
        .filter(
          producto =>
            producto.oferta === true &&
            producto.stock === true
        )
        .slice(0, 8);

    this.cargando = false;

  }

}
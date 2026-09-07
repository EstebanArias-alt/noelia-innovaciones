import { Component, OnInit } from '@angular/core';

import { ProductCardComponent }
  from '../product-card/product-card.component';

import { SupabaseService }
  from '../../services/supabase.service';

import { Producto }
  from '../../models/producto';

@Component({
  selector: 'app-nuevos-ingresos',
  standalone: true,

  imports: [
    ProductCardComponent
  ],

  templateUrl: './nuevos-ingresos.component.html',
  styleUrl: './nuevos-ingresos.component.css'
})
export class NuevosIngresosComponent implements OnInit {

  nuevos: Producto[] = [];

  cargando = true;


  constructor(
    private supabaseService: SupabaseService
  ) {}


  async ngOnInit(): Promise<void> {

    const productos =
      await this.supabaseService.getProductos();

    this.nuevos =
      productos
        .filter(
          producto =>
            producto.nuevo === true &&
            producto.stock === true
        )
        .slice(0, 8);

    this.cargando = false;

  }

}
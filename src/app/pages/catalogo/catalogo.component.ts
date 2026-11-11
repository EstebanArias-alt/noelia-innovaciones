import {
  Component,
  OnInit,
} from '@angular/core';

import { FormsModule } from '@angular/forms';

import {
  ActivatedRoute,
  Router,
  RouterLink
} from '@angular/router';

import { ProductCardComponent }
  from '../../components/product-card/product-card.component';

import { Producto }
  from '../../models/producto';

import { SupabaseService }
  from '../../services/supabase.service';

@Component({
  selector: 'app-catalogo',
  standalone: true,
  imports: [
    ProductCardComponent,
    FormsModule,
    RouterLink
  ],
  templateUrl: './catalogo.component.html',
  styleUrl: './catalogo.component.css'
})
export class CatalogoComponent
  implements OnInit {

  productosOriginales: Producto[] = [];

  productos: Producto[] = [];

  categorias: string[] = ['Todos'];

  categoriaSeleccionada = 'Todos';

  ordenSeleccionado = 'default';

  busqueda = '';



  constructor(
    private supabaseService:
      SupabaseService,

    private route:
      ActivatedRoute,

    private router: Router
  ) {}


async ngOnInit(): Promise<void> {

  const data =
    await this.supabaseService
      .getProductos();

  this.productosOriginales =
    data as Producto[];


  const categoriasUnicas =
    this.productosOriginales
      .map(
        producto =>
          producto.categoria
      )
      .filter(
        categoria =>
          categoria &&
          categoria.trim() !== ''
      );


  this.categorias = [
    'Todos',
    ...new Set(categoriasUnicas)
  ];


  this.route.queryParamMap
    .subscribe(params => {

      this.busqueda =
        params.get('buscar') ?? '';

      const categoria = params.get('categoria')?.trim() || 'Todos';
      const clave = this.normalizarTexto(categoria);
      this.categoriaSeleccionada = this.categorias.find(
        nombre => this.normalizarTexto(nombre) === clave
      ) ?? categoria;
      this.aplicarFiltros();

    });

}


  filtrarCategoria(
    categoria: string
  ): void {

    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { categoria: categoria === 'Todos' ? null : categoria },
      queryParamsHandling: 'merge'
    });

  }


  ordenarProductos(): void {

    this.aplicarFiltros();

  }


  private aplicarFiltros(): void {

    let resultado =
      [...this.productosOriginales];


    /* ========================= */
    /* BÚSQUEDA */
    /* ========================= */

const termino =
  this.normalizarTexto(
    this.busqueda
  );

if (termino) {

  resultado =
    resultado.filter(producto => {

      const nombre =
        this.normalizarTexto(
          producto.nombre ?? ''
        );

      const categoria =
        this.normalizarTexto(
          producto.categoria ?? ''
        );

      const descripcion =
        this.normalizarTexto(
          producto.descripcion ?? ''
        );

      return (
        nombre.includes(termino) ||
        categoria.includes(termino) ||
        descripcion.includes(termino)
      );

    });


    }


    /* ========================= */
    /* CATEGORÍA */
    /* ========================= */

    if (
      this.categoriaSeleccionada
      !== 'Todos'
    ) {

      const claveCategoria = this.normalizarTexto(this.categoriaSeleccionada);
      resultado =
        resultado.filter(
          producto =>
            this.normalizarTexto(producto.categoria ?? '') === claveCategoria
        );

    }


    /* ========================= */
    /* ORDEN */
    /* ========================= */

    switch (
      this.ordenSeleccionado
    ) {

      case 'menor-precio':

        resultado.sort(
          (a, b) =>
            (a.precio ?? 0)
            -
            (b.precio ?? 0)
        );

        break;


      case 'mayor-precio':

        resultado.sort(
          (a, b) =>
            (b.precio ?? 0)
            -
            (a.precio ?? 0)
        );

        break;


      case 'nuevos':

        resultado.sort(
          (a, b) =>
            Number(b.nuevo)
            -
            Number(a.nuevo)
        );

        break;

    }


    this.productos = resultado;

  }

  private normalizarTexto(texto: string): string {

  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

}

limpiarBusqueda(): void {

  this.busqueda = '';

  this.router.navigate(
    ['/productos'],
    {
      queryParams: { buscar: null },
      queryParamsHandling: 'merge'
    }
  );

  this.aplicarFiltros();

}

}
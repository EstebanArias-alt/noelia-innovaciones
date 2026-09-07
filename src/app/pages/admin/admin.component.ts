import {
  Component,
  OnInit
} from '@angular/core';

import { Router } from '@angular/router';
import { DecimalPipe } from '@angular/common';

import { Producto } from '../../models/producto';
import { SupabaseService } from '../../services/supabase.service';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-admin',
  standalone: true,

  imports: [
    DecimalPipe,
     FormsModule
  ],

  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css'
})
export class AdminComponent implements OnInit {

  productos: Producto[] = [];

  cargando = true;

  busqueda = '';
  categoriaSeleccionada = 'Todas';
  estadoSeleccionado = 'Todos';

  actualizandoEstado:
  string | null = null;


  constructor(
    private supabaseService: SupabaseService,
    private router: Router
  ) {}


  async ngOnInit(): Promise<void> {

    const data =
      await this.supabaseService
        .getProductos();

    this.productos =
      data as Producto[];

    this.cargando = false;

  }


  imagenPrincipal(
    producto: Producto
  ): string {

    const imagenes =
      producto.producto_imagenes ?? [];

    const principal =
      imagenes.find(
        imagen => imagen.principal
      );

    return principal?.url
      ?? imagenes[0]?.url
      ?? '/images/productos/sin-imagen.jpg';

  }


  nuevoProducto(): void {

    this.router.navigate([
      '/admin/productos/nuevo'
    ]);

  }


  editarProducto(
    producto: Producto
  ): void {

    this.router.navigate([
      '/admin/productos',
      producto.id,
      'editar'
    ]);

  }


  async cerrarSesion(): Promise<void> {

    await this.supabaseService
      .cerrarSesion();

    await this.router.navigate([
      '/admin/login'
    ]);

  }

  eliminandoId: number | null = null;


async eliminarProducto(
  producto: Producto
): Promise<void> {

  const confirmar =
    window.confirm(
      `¿Seguro que querés eliminar "${producto.nombre}"?\n\nEsta acción no se puede deshacer.`
    );


  if (!confirmar) {
    return;
  }


  this.eliminandoId =
    producto.id;


  const eliminado =
    await this.supabaseService
      .eliminarProducto(producto);


  this.eliminandoId = null;


  if (!eliminado) {

    alert(
      'No se pudo eliminar el producto.'
    );

    return;
  }


  this.productos =
    this.productos.filter(
      item =>
        item.id !== producto.id
    );

}

get productosFiltrados() {
  return this.productos.filter(producto => {

    const coincideBusqueda =
      producto.nombre
        .toLowerCase()
        .includes(this.busqueda.toLowerCase());

    const coincideCategoria =
      this.categoriaSeleccionada === 'Todas' ||
      producto.categoria === this.categoriaSeleccionada;

    let coincideEstado = true;

    switch (this.estadoSeleccionado) {

      case 'Disponibles':
        coincideEstado = producto.stock === true;
        break;

      case 'Sin stock':
        coincideEstado = producto.stock === false;
        break;

      case 'En oferta':
        coincideEstado = producto.oferta === true;
        break;

      case 'Nuevos':
        coincideEstado = producto.nuevo === true;
        break;

      case 'Destacados':
        coincideEstado = producto.destacado === true;
        break;

    }

    return (
      coincideBusqueda &&
      coincideCategoria &&
      coincideEstado
    );
  });
}

get categoriasDisponibles() {
  const categorias =
    this.productos.map(
      producto => producto.categoria
    );

  return [
    'Todas',
    ...new Set(categorias)
  ];
}

async cambiarEstado(
  producto: Producto,
  campo: 'stock' | 'oferta' | 'nuevo' | 'destacado'
): Promise<void> {

  const clave =
    `${producto.id}-${campo}`;

  if (
    this.actualizandoEstado === clave
  ) {
    return;
  }

  const valorActual =
    Boolean(producto[campo]);

  const nuevoValor =
    !valorActual;

  this.actualizandoEstado =
    clave;

  const actualizado =
    await this.supabaseService
      .actualizarEstadoProducto(
        producto.id,
        campo,
        nuevoValor
      );

  this.actualizandoEstado =
    null;

  if (!actualizado) {

    alert(
      'No se pudo actualizar el producto.'
    );

    return;
  }

  producto[campo] =
    nuevoValor;

}

imagenError(event: Event): void {

  const imagen =
    event.target as HTMLImageElement;

  imagen.onerror = null;

  imagen.src =
    '/images/productos/sin-imagen.jpg';

}

get totalProductos(): number {
  return this.productos.length;
}

get totalDisponibles(): number {
  return this.productos.filter(
    producto => producto.stock
  ).length;
}

get totalSinStock(): number {
  return this.productos.filter(
    producto => !producto.stock
  ).length;
}

get totalOfertas(): number {
  return this.productos.filter(
    producto => producto.oferta
  ).length;
}

get totalDestacados(): number {
  return this.productos.filter(
    producto => producto.destacado
  ).length;
}



}
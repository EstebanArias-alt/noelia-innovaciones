import {
  Component,
  OnInit
} from '@angular/core';

import {
  FormsModule
} from '@angular/forms';

import {
  ActivatedRoute,
  Router
} from '@angular/router';

import {
  ProductoImagen
} from '../../models/producto';

import {
  SupabaseService
} from '../../services/supabase.service';


@Component({
  selector: 'app-admin-producto-form',
  standalone: true,

  imports: [
    FormsModule
  ],

  templateUrl:
    './admin-producto-form.component.html',

  styleUrl:
    './admin-producto-form.component.css'
})
export class AdminProductoFormComponent
  implements OnInit {

  modoEdicion = false;

  productoId: number | null = null;

  cargando = false;
  guardando = false;

  error = '';


  /* ========================= */
  /* DATOS DEL PRODUCTO */
  /* ========================= */

  nombre = '';

  slug = '';

  categoria = 'Sofás';

  descripcion = '';

  precio: number | null = null;

  precioAnterior: number | null = null;

  cuotas = '';

  medidas = '';

  material = '';

  colores = '';

  stock = true;

  oferta = false;

  nuevo = false;

  destacado = false;


  categorias = [
    'Sofás',
    'Sillones',
    'Esquineros',
    'Living',
    'Mesas'
  ];


  /* ========================= */
  /* IMÁGENES */
  /* ========================= */

  imagenesExistentes:
    ProductoImagen[] = [];

  imagenesSeleccionadas:
    File[] = [];

  previews:
    string[] = [];


  constructor(
    private supabaseService:
      SupabaseService,

    private router:
      Router,

    private route:
      ActivatedRoute
  ) {}


  /* ========================= */
  /* INICIAR */
  /* ========================= */

  async ngOnInit():
    Promise<void> {

    const id =
      this.route.snapshot
        .paramMap
        .get('id');


    /* ========================= */
    /* NUEVO PRODUCTO */
    /* ========================= */

    if (!id) {
      return;
    }


    /* ========================= */
    /* MODO EDICIÓN */
    /* ========================= */

    this.modoEdicion = true;

    this.productoId =
      Number(id);


    if (
      Number.isNaN(
        this.productoId
      )
    ) {

      this.error =
        'El ID del producto no es válido.';

      return;

    }


    this.cargando = true;


    const producto =
      await this.supabaseService
        .getProductoPorId(
          this.productoId
        );


    this.cargando = false;


    if (!producto) {

      this.error =
        'No se pudo cargar el producto.';

      return;

    }


    /* ========================= */
    /* IMÁGENES EXISTENTES */
    /* ========================= */

    this.imagenesExistentes =
      [
        ...(
          producto
            .producto_imagenes
          ?? []
        )
      ].sort(
        (a, b) =>
          a.orden - b.orden
      );


    /* ========================= */
    /* CARGAR DATOS */
    /* ========================= */

    this.nombre =
      producto.nombre ?? '';


    this.slug =
      producto.slug ?? '';


    this.categoria =
      producto.categoria
      ?? 'Sofás';


    this.descripcion =
      producto.descripcion
      ?? '';


    this.precio =
      producto.precio
      ?? null;


    this.precioAnterior =
      producto.precio_anterior
      ?? null;


    this.cuotas =
      producto.cuotas
      ?? '';


    this.medidas =
      producto.medidas
      ?? '';


    this.material =
      producto.material
      ?? '';


    /* ========================= */
    /* COLORES */
    /* ========================= */

    if (
      Array.isArray(
        producto.colores
      )
    ) {

      this.colores =
        producto.colores
          .join(', ');

    } else {

      this.colores =
        producto.colores
        ?? '';

    }


    /* ========================= */
    /* ESTADOS */
    /* ========================= */

    this.stock =
      producto.stock
      ?? true;


    this.oferta =
      producto.oferta
      ?? false;


    this.nuevo =
      producto.nuevo
      ?? false;


    this.destacado =
      producto.destacado
      ?? false;

  }


  /* ========================= */
  /* SELECCIONAR IMÁGENES */
  /* ========================= */

  seleccionarImagenes(
    event: Event
  ): void {

    const input = event.target as HTMLInputElement;


    if (!input.files) {
      return;
    }


    this.imagenesSeleccionadas =
      Array.from(
        input.files
      );


    this.previews = [];


    for (
      const archivo
      of this.imagenesSeleccionadas
    ) {

      const reader =
        new FileReader();


      reader.onload = () => {

        if (
          typeof reader.result
          === 'string'
        ) {

          this.previews.push(
            reader.result
          );

        }

      };


      reader.readAsDataURL(
        archivo
      );

    }

  }


  /* ========================= */
  /* GUARDAR PRODUCTO */
  /* ========================= */

  async guardar():
    Promise<void> {

    this.error = '';


    /* ========================= */
    /* VALIDAR NOMBRE */
    /* ========================= */

    if (
      !this.nombre.trim()
    ) {

      this.error =
        'Ingresá el nombre del producto.';

      return;

    }


    /* ========================= */
    /* GENERAR SLUG */
    /* SOLO AL CREAR */
    /* ========================= */

if (!this.modoEdicion) {

  const slugBase =
    this.crearSlug(
      this.nombre
    );

  this.slug =
    await this.supabaseService
      .generarSlugUnico(
        slugBase
      );

}


    /* ========================= */
    /* VALIDAR CATEGORÍA */
    /* ========================= */

    if (
      !this.categoria.trim()
    ) {

      this.error =
        'Ingresá una categoría.';

      return;

    }


    this.guardando = true;


    /* ========================= */
    /* OBJETO PRODUCTO */
    /* ========================= */

    const producto = {

      nombre:
        this.nombre.trim(),

      slug:
        this.slug,

      categoria:
        this.categoria.trim(),

      descripcion:
        this.descripcion.trim(),

      precio:
        this.precio,

      precio_anterior:
        this.precioAnterior,

      cuotas:
        this.cuotas.trim(),

      medidas:
        this.medidas.trim(),

      material:
        this.material.trim(),

      colores:
        this.colores.trim(),

      stock:
        this.stock,

      oferta:
        this.oferta,

      nuevo:
        this.nuevo,

      destacado:
        this.destacado

    };


    let resultado;


    /* ========================= */
    /* EDITAR */
    /* ========================= */

    if (
      this.modoEdicion &&
      this.productoId !== null
    ) {

      resultado =
        await this.supabaseService
          .actualizarProducto(
            this.productoId,
            producto
          );

    }


    /* ========================= */
    /* CREAR */
    /* ========================= */

    else {

      resultado =
        await this.supabaseService
          .crearProducto(
            producto
          );

    }


    if (!resultado) {

      this.guardando = false;

      this.error =
        'No se pudo guardar el producto.';

      return;

    }


    /* ========================= */
    /* SUBIR IMÁGENES */
    /* ========================= */

    if (
      this.imagenesSeleccionadas
        .length > 0
    ) {

      let ordenInicial = 0;


      if (
        this.imagenesExistentes
          .length > 0
      ) {

        ordenInicial =
          Math.max(
            ...this
              .imagenesExistentes
              .map(
                imagen =>
                  imagen.orden
              )
          );

      }


      for (
        let i = 0;
        i <
        this.imagenesSeleccionadas
          .length;
        i++
      ) {

        const archivo =
          this
            .imagenesSeleccionadas[i];


        const orden =
          ordenInicial + i;


        const imagenSubida =
          await this.supabaseService
            .subirImagenProducto(
              resultado.id,
              resultado.slug,
              archivo,
              orden
            );


        if (
          !imagenSubida
        ) {

          this.guardando =
            false;

          this.error =
            `El producto se guardó, pero no se pudo subir la imagen "${archivo.name}".`;

          return;

        }

      }

    }


    this.guardando = false;


    await this.router.navigate([
      '/admin'
    ]);

  }


  /* ========================= */
  /* CANCELAR */
  /* ========================= */

  cancelar(): void {

    this.router.navigate([
      '/admin'
    ]);

  }


  /* ========================= */
  /* CREAR SLUG */
  /* ========================= */

  private crearSlug(
    texto: string
  ): string {

    return texto

      .normalize('NFD')

      .replace(
        /[\u0300-\u036f]/g,
        ''
      )

      .toLowerCase()

      .trim()

      .replace(
        /[^a-z0-9]+/g,
        '-'
      )

      .replace(
        /^-+|-+$/g,
        ''
      );

  }


  /* ========================= */
  /* IMAGEN PRINCIPAL */
  /* ========================= */

  async hacerPrincipal(
    imagen: ProductoImagen
  ): Promise<void> {

    if (
      this.productoId === null
    ) {
      return;
    }


    const actualizado =
      await this.supabaseService
        .establecerImagenPrincipal(
          this.productoId,
          imagen.id
        );


    if (!actualizado) {

      this.error =
        'No se pudo cambiar la imagen principal.';

      return;

    }


    this.imagenesExistentes =
      this.imagenesExistentes
        .map(
          item => ({
            ...item,

            principal:
              item.id ===
              imagen.id
          })
        );

  }


  /* ========================= */
  /* ELIMINAR IMAGEN */
  /* ========================= */

  async eliminarImagen(
    imagen: ProductoImagen
  ): Promise<void> {

    const confirmar =
      window.confirm(
        '¿Seguro que querés eliminar esta imagen?'
      );


    if (!confirmar) {
      return;
    }


    const eraPrincipal =
      imagen.principal;


    const eliminado =
      await this.supabaseService
        .eliminarImagenProducto(
          imagen
        );


    if (!eliminado) {

      this.error =
        'No se pudo eliminar la imagen.';

      return;

    }


    this.imagenesExistentes =
      this.imagenesExistentes
        .filter(
          item =>
            item.id !==
            imagen.id
        );


    /* ========================= */
    /* SI ERA PRINCIPAL */
    /* ELEGIR OTRA */
    /* ========================= */

    if (
      eraPrincipal &&
      this.imagenesExistentes
        .length > 0 &&
      this.productoId !== null
    ) {

      const nuevaPrincipal =
        this
          .imagenesExistentes[0];


      const actualizado =
        await this.supabaseService
          .establecerImagenPrincipal(
            this.productoId,
            nuevaPrincipal.id
          );


      if (actualizado) {

        this.imagenesExistentes =
          this.imagenesExistentes
            .map(
              item => ({
                ...item,

                principal:
                  item.id ===
                  nuevaPrincipal.id
              })
            );

      }

    }

  }

}
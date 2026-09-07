import {
  ProductoImagen
} from '../models/producto';

import {
  Injectable
} from '@angular/core';

import {
  createClient,
  SupabaseClient
} from '@supabase/supabase-js';

import {
  environment
} from '../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class SupabaseService {

  supabase: SupabaseClient;


  constructor() {

    this.supabase =
      createClient(
        environment.supabaseUrl,
        environment.supabaseKey
      );

  }


  async getProductos() {

    const {
      data,
      error
    } =
      await this.supabase
        .from('productos')
        .select(`
          *,
          producto_imagenes (
            id,
            url,
            orden,
            principal
          )
        `)
        .order(
          'created_at',
          {
            ascending: false
          }
        );


    if (error) {

      console.error(
        'Error obteniendo productos:',
        error
      );

      return [];

    }


    return data ?? [];

  }


  async getProductoPorSlug(
    slug: string
  ) {

    const {
      data,
      error
    } =
      await this.supabase
        .from('productos')
        .select(`
          *,
          producto_imagenes (
            id,
            url,
            orden,
            principal
          )
        `)
        .eq(
          'slug',
          slug
        )
        .single();


    if (error) {

      console.error(
        'Error obteniendo producto:',
        error
      );

      return null;

    }


    return data;

  }


  async getProductoPorId(
    id: number
  ) {

    const {
      data,
      error
    } =
      await this.supabase
        .from('productos')
        .select(`
          *,
          producto_imagenes (
            id,
            url,
            orden,
            principal
          )
        `)
        .eq(
          'id',
          id
        )
        .single();


    if (error) {

      console.error(
        'Error obteniendo producto:',
        error
      );

      return null;

    }


    return data;

  }


  async crearProducto(
    producto: {
      nombre: string;
      slug: string;
      categoria: string;
      descripcion: string;
      precio: number | null;
      precio_anterior: number | null;
      cuotas: string;
      medidas: string;
      material: string;
      colores: string;
      stock: boolean;
      oferta: boolean;
      nuevo: boolean;
      destacado: boolean;
    }
  ) {

    const {
      data,
      error
    } =
      await this.supabase
        .from('productos')
        .insert(
          producto
        )
        .select()
        .single();


    if (error) {

      console.error(
        'Error creando producto:',
        error
      );

      return null;

    }


    return data;

  }


  async actualizarProducto(
    id: number,

    producto: {
      nombre: string;
      slug: string;
      categoria: string;
      descripcion: string;
      precio: number | null;
      precio_anterior: number | null;
      cuotas: string;
      medidas: string;
      material: string;
      colores: string;
      stock: boolean;
      oferta: boolean;
      nuevo: boolean;
      destacado: boolean;
    }
  ) {

    const {
      data,
      error
    } =
      await this.supabase
        .from('productos')
        .update(
          producto
        )
        .eq(
          'id',
          id
        )
        .select()
        .single();


    if (error) {

      console.error(
        'Error actualizando producto:',
        error
      );

      return null;

    }


    return data;

  }


  async subirImagenProducto(
    productoId: number,
    slug: string,
    archivo: File,
    orden: number
  ) {

    console.log(
      'INICIANDO SUBIDA:',
      {
        productoId,
        slug,
        archivo: archivo.name,
        orden
      }
    );


    const extension =
      archivo.name
        .split('.')
        .pop()
        ?.toLowerCase()
        ?? 'jpg';


    const nombreArchivo =
      `${Date.now()}-${orden}.${extension}`;


    const ruta =
      `${slug}/${nombreArchivo}`;


    console.log(
      'RUTA STORAGE:',
      ruta
    );


    const {
      data: uploadData,
      error: uploadError
    } =
      await this.supabase
        .storage
        .from('productos')
        .upload(
          ruta,
          archivo,
          {
            cacheControl: '3600',
            upsert: false
          }
        );


    console.log(
      'UPLOAD DATA:',
      uploadData
    );


    console.log(
      'UPLOAD ERROR:',
      uploadError
    );


    if (uploadError) {

      console.error(
        'Error subiendo imagen:',
        uploadError
      );

      return null;

    }


    const {
      data: urlData
    } =
      this.supabase
        .storage
        .from('productos')
        .getPublicUrl(
          ruta
        );


    const url =
      urlData.publicUrl;


    console.log(
      'URL PÚBLICA:',
      url
    );


    const esPrimeraImagen =
      orden === 0;


    const {
      data,
      error
    } =
      await this.supabase
        .from('producto_imagenes')
        .insert({

          producto_id:
            productoId,

          url,

          orden:
            orden + 1,

          principal:
            esPrimeraImagen

        })
        .select()
        .single();


    console.log(
      'DB IMAGEN DATA:',
      data
    );


    console.log(
      'DB IMAGEN ERROR:',
      error
    );


    if (error) {

      console.error(
        'Error guardando imagen:',
        error
      );


      const {
        error: removeError
      } =
        await this.supabase
          .storage
          .from('productos')
          .remove([
            ruta
          ]);


      if (removeError) {

        console.error(
          'No se pudo limpiar la imagen del Storage:',
          removeError
        );

      }


      return null;

    }


    return data;

  }


  async eliminarProducto(
    producto: any
  ): Promise<boolean> {

    try {

      const {
        data: imagenes,
        error: obtenerImagenesError
      } =
        await this.supabase
          .from('producto_imagenes')
          .select('*')
          .eq(
            'producto_id',
            producto.id
          );


      if (obtenerImagenesError) {

        console.error(
          'Error obteniendo imágenes:',
          obtenerImagenesError
        );

        return false;

      }


      if (
        imagenes &&
        imagenes.length > 0
      ) {

        const rutas =
          imagenes
            .map(
              (imagen: any) => {

                const parte =
                  '/storage/v1/object/public/productos/';


                const posicion =
                  imagen.url.indexOf(
                    parte
                  );


                if (
                  posicion === -1
                ) {
                  return null;
                }


                return decodeURIComponent(
                  imagen.url.substring(
                    posicion +
                    parte.length
                  )
                );

              }
            )
            .filter(
              (
                ruta
              ): ruta is string =>
                ruta !== null
            );


        if (
          rutas.length > 0
        ) {

          const {
            error: storageError
          } =
            await this.supabase
              .storage
              .from('productos')
              .remove(
                rutas
              );


          if (storageError) {

            console.error(
              'Error eliminando archivos:',
              storageError
            );

            return false;

          }

        }

      }


      const {
        error: imagenesError
      } =
        await this.supabase
          .from('producto_imagenes')
          .delete()
          .eq(
            'producto_id',
            producto.id
          );


      if (imagenesError) {

        console.error(
          'Error eliminando imágenes:',
          imagenesError
        );

        return false;

      }


      const {
        error: productoError
      } =
        await this.supabase
          .from('productos')
          .delete()
          .eq(
            'id',
            producto.id
          );


      if (productoError) {

        console.error(
          'Error eliminando producto:',
          productoError
        );

        return false;

      }


      return true;

    } catch (error) {

      console.error(
        'Error general eliminando producto:',
        error
      );

      return false;

    }

  }


  async iniciarSesion(
    email: string,
    password: string
  ) {

    const {
      data,
      error
    } =
      await this.supabase
        .auth
        .signInWithPassword({
          email,
          password
        });


    if (error) {

      console.error(
        'Error iniciando sesión:',
        error
      );


      return {
        usuario: null,
        error
      };

    }


    return {
      usuario: data.user,
      error: null
    };

  }


  async cerrarSesion() {

    const {
      error
    } =
      await this.supabase
        .auth
        .signOut();


    if (error) {

      console.error(
        'Error cerrando sesión:',
        error
      );

    }

  }


  async obtenerUsuario() {

    const {
      data: {
        user
      }
    } =
      await this.supabase
        .auth
        .getUser();


    return user;

  }

  

async establecerImagenPrincipal(
  productoId: number,
  imagenId: number
): Promise<boolean> {

  const {
    error: quitarPrincipalesError
  } =
    await this.supabase
      .from('producto_imagenes')
      .update({
        principal: false
      })
      .eq(
        'producto_id',
        productoId
      );


  if (quitarPrincipalesError) {

    console.error(
      'Error quitando imagen principal:',
      quitarPrincipalesError
    );

    return false;

  }


  const {
    error: principalError
  } =
    await this.supabase
      .from('producto_imagenes')
      .update({
        principal: true
      })
      .eq(
        'id',
        imagenId
      );


  if (principalError) {

    console.error(
      'Error estableciendo imagen principal:',
      principalError
    );

    return false;

  }


  return true;
}


async eliminarImagenProducto(
  imagen: ProductoImagen
): Promise<boolean> {

  try {

    const parte =
      '/storage/v1/object/public/productos/';


    const posicion =
      imagen.url.indexOf(
        parte
      );


    if (posicion === -1) {

      console.error(
        'No se pudo obtener la ruta de la imagen.'
      );

      return false;

    }


    const ruta =
      decodeURIComponent(
        imagen.url.substring(
          posicion + parte.length
        )
      );


    const {
      error: storageError
    } =
      await this.supabase
        .storage
        .from('productos')
        .remove([
          ruta
        ]);


    if (storageError) {

      console.error(
        'Error eliminando imagen del Storage:',
        storageError
      );

      return false;

    }


    const {
      error: dbError
    } =
      await this.supabase
        .from('producto_imagenes')
        .delete()
        .eq(
          'id',
          imagen.id
        );


    if (dbError) {

      console.error(
        'Error eliminando imagen de la tabla:',
        dbError
      );

      return false;

    }


    return true;

  } catch (error) {

    console.error(
      'Error eliminando imagen:',
      error
    );

    return false;

  }

}
async existeSlug(
  slug: string
): Promise<boolean> {

  const { data, error } =
    await this.supabase
      .from('productos')
      .select('id')
      .eq('slug', slug)
      .limit(1);

  if (error) {

    console.error(
      'Error verificando slug:',
      error
    );

    return false;
  }

  return (data?.length ?? 0) > 0;
}


async generarSlugUnico(
  slugBase: string
): Promise<string> {

  let slug = slugBase;
  let contador = 2;

  while (
    await this.existeSlug(slug)
  ) {

    slug =
      `${slugBase}-${contador}`;

    contador++;

  }

  return slug;
}

async actualizarEstadoProducto(
  id: number,
  campo: 'stock' | 'oferta' | 'nuevo' | 'destacado',
  valor: boolean
): Promise<boolean> {

  const { error } =
    await this.supabase
      .from('productos')
      .update({
        [campo]: valor
      })
      .eq('id', id);

  if (error) {

    console.error(
      'Error actualizando estado:',
      error
    );

    return false;
  }

  return true;
}




}
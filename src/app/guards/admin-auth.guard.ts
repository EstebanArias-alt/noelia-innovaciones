import {
  inject
} from '@angular/core';

import {
  CanActivateFn,
  Router
} from '@angular/router';

import {
  SupabaseService
} from '../services/supabase.service';


export const adminAuthGuard: CanActivateFn =
  async () => {

    const supabaseService =
      inject(SupabaseService);

    const router =
      inject(Router);


    // Obtener usuario actualmente logueado
    const usuario =
      await supabaseService
        .obtenerUsuario();


    // No hay sesión
    if (!usuario) {

      return router.createUrlTree([
        '/admin/login'
      ]);

    }


    // ===================================
    // ADMIN AUTORIZADO
    // ===================================

    const ADMIN_UID =
      '5400f8da-6a41-4d50-b4b8-b3b9d249c81f';


    // Hay sesión pero NO es el administrador
    if (
      usuario.id !== ADMIN_UID
    ) {

      console.warn(
        'Usuario sin permisos de administrador.'
      );


      await supabaseService
        .cerrarSesion();


      return router.createUrlTree([
        '/admin/login'
      ]);

    }


    // Es el administrador
    return true;

  };
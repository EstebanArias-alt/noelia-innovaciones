import { Routes } from '@angular/router';

import { HomeComponent }
  from './pages/home/home.component';

import { CatalogoComponent }
  from './pages/catalogo/catalogo.component';

import { ProductoDetalleComponent }
  from './pages/producto-detalle/producto-detalle.component';

  import {
  AdminLoginComponent
} from './pages/admin-login/admin-login.component';

import {
  AdminComponent
} from './pages/admin/admin.component';

import {
  adminAuthGuard
} from './guards/admin-auth.guard';

import {
  AdminProductoFormComponent
} from './pages/admin-producto-form/admin-producto-form.component';



export const routes: Routes = [

  {
  path: 'admin/productos/:id/editar',
  component: AdminProductoFormComponent,
  canActivate: [
    adminAuthGuard
  ]
},

  {
  path: 'admin',
  component: AdminComponent,
  canActivate: [
    adminAuthGuard
  ]
},

  {
  path: 'admin/login',
  component: AdminLoginComponent
},

{
  path: 'admin/productos/nuevo',
  component: AdminProductoFormComponent,
  canActivate: [
    adminAuthGuard
  ]
},

  {
    path: '',
    component: HomeComponent
  },

  {
    path: 'productos',
    component: CatalogoComponent
  },

  {
    path: 'producto/:slug',
    component: ProductoDetalleComponent
  },

  {
    path: '**',
    redirectTo: ''
  }

];
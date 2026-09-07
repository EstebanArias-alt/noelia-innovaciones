import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [
    FormsModule
  ],
  templateUrl: './admin-login.component.html',
  styleUrl: './admin-login.component.css'
})
export class AdminLoginComponent {

  email = '';
  password = '';

  cargando = false;
  error = '';

  constructor(
    private supabaseService: SupabaseService,
    private router: Router
  ) {}


  async iniciarSesion(): Promise<void> {

    this.error = '';

    if (!this.email || !this.password) {
      this.error = 'Completá el email y la contraseña.';
      return;
    }

    this.cargando = true;

    const resultado =
      await this.supabaseService.iniciarSesion(
        this.email,
        this.password
      );

    this.cargando = false;

    if (resultado.error) {
      this.error =
        'Email o contraseña incorrectos.';
      return;
    }

    console.log(
      'ADMIN LOGUEADO:',
      resultado.usuario
    );

    await this.router.navigate([
      '/admin'
    ]);

  }

}
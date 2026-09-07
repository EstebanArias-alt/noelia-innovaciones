import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    FormsModule
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {

  busqueda = '';

  constructor(
    private router: Router
  ) {}

  buscar(): void {

    const termino =
      this.busqueda.trim();

    if (!termino) {
      return;
    }

    this.router.navigate(
      ['/productos'],
      {
        queryParams: {
          buscar: termino
        }
      }
    );
  }

  

}
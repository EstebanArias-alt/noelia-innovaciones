import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FotoModelo, GaleriaModelosService } from '../../services/galeria-modelos.service';

@Component({
  selector: 'app-admin-galeria',
  imports: [RouterLink],
  templateUrl: './admin-galeria.component.html',
  styleUrl: './admin-galeria.component.css'
})
export class AdminGaleriaComponent implements OnInit {
  private readonly galeria = inject(GaleriaModelosService);
  fotos: FotoModelo[] = [];
  pendientes: File[] = [];
  subiendo = false;
  estado = '';
  error = '';

  async ngOnInit(): Promise<void> {
    await this.actualizar();
  }

  elegir(input: HTMLInputElement): void {
    this.pendientes = Array.from(input.files ?? []);
    this.estado = '';
    this.error = '';
    input.value = '';
  }

  async subir(): Promise<void> {
    if (this.subiendo || !this.pendientes.length) return;
    this.subiendo = true;
    this.error = '';
    const fallidas: File[] = [];
    let exitos = 0;
    try {
      for (const foto of this.pendientes) {
        this.estado = `Subiendo ${exitos + fallidas.length + 1} de ${this.pendientes.length}…`;
        try {
          await this.galeria.subir(foto);
          exitos++;
        } catch {
          fallidas.push(foto);
        }
      }
      this.pendientes = fallidas;
      this.estado = `${exitos} fotos subidas.`;
      if (fallidas.length) {
        this.error = `Quedaron ${fallidas.length} fotos pendientes. Revisá el tamaño y formato o reintentá la subida.`;
      }
      await this.actualizar();
    } finally {
      this.subiendo = false;
    }
  }

  private async actualizar(): Promise<void> {
    try {
      this.fotos = await this.galeria.listar();
    } catch {
      this.error = 'No se pudo abrir la galería. Revisá la conexión y la configuración en Supabase.';
    }
  }
}

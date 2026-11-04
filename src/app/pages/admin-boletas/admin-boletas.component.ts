import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BoletasService } from '../../services/boletas.service';
import { BoletaGuardada } from '../../models/boleta';
import { imprimirBoleta } from '../../services/boleta-impresion';
import { CompartirBoletaComponent } from '../../components/compartir-boleta/compartir-boleta.component';

@Component({
  selector: 'app-admin-boletas', standalone: true,
  imports: [FormsModule, CurrencyPipe, DatePipe, RouterLink, CompartirBoletaComponent],
  templateUrl: './admin-boletas.component.html', styleUrl: './admin-boletas.component.css'
})
export class AdminBoletasComponent implements OnInit {
  boletas: BoletaGuardada[] = [];
  cargando = false;
  error = '';
  pagina = 0;
  busqueda = '';
  campo: 'cliente' | 'referencia' = 'cliente';
  compartiendo: BoletaGuardada | null = null;
  revocando: string | null = null;
  constructor(private servicio: BoletasService) {}
  ngOnInit(): void { void this.cargar(0); }
  async cargar(pagina: number): Promise<void> {
    if (this.cargando) return;
    this.cargando = true; this.error = ''; this.compartiendo = null;
    try { this.boletas = await this.servicio.listar(pagina, this.campo, this.busqueda); this.pagina = pagina; }
    catch { this.error = 'No se pudo cargar el historial. Revisá la conexión y que se haya aplicado la configuración de boletas en Supabase.'; }
    finally { this.cargando = false; }
  }
  imprimir(boleta: BoletaGuardada): void {
    this.error = imprimirBoleta(boleta.datos) ? '' : 'Permití las ventanas emergentes para abrir la boleta.';
  }
  async revocar(boleta: BoletaGuardada): Promise<void> {
    if (this.revocando || !window.confirm('¿Desactivar el enlace de esta boleta? El cliente ya no podrá abrirlo. Los archivos que haya descargado se conservan.')) return;
    this.revocando = boleta.id; this.error = '';
    try { await this.servicio.revocar(boleta.id); boleta.compartible = false; }
    catch { this.error = 'No se pudo desactivar el enlace. Reintentá.'; }
    finally { this.revocando = null; }
  }
}

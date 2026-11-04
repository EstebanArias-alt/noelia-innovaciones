import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CurrencyPipe } from '@angular/common';
import { Producto } from '../../models/producto';

import { DatosBoleta, LineaBoleta, BoletaGuardada, validarBoleta, subtotalBoleta, totalBoleta } from '../../models/boleta';
import { BoletasService } from '../../services/boletas.service';
import { imprimirBoleta } from '../../services/boleta-impresion';
import { CompartirBoletaComponent } from '../compartir-boleta/compartir-boleta.component';

@Component({
  selector: 'app-generar-boleta',
  standalone: true,
  imports: [FormsModule, CurrencyPipe, CompartirBoletaComponent],
  templateUrl: './generar-boleta.component.html',
  styleUrl: './generar-boleta.component.css'
})
export class GenerarBoletaComponent {
  @Input() productos: Producto[] = [];
  @Output() guardado = new EventEmitter<void>();
  constructor(private boletas: BoletasService) {}
  guardando = false;
  guardada: BoletaGuardada | null = null;
  pendiente: DatosBoleta | null = null;
  private idBorrador = crypto.randomUUID();
  abierto = false;
  comercio = 'Noelia Innovaciones';
  direccion = '';
  contacto = '';
  identificacion = '';
  cliente = '';
  documento = '';
  numero = '';
  fecha = '';
  pago = 'Efectivo';
  observaciones = '';
  seleccionado = '';
  tipoPrecio = 'contado';
  lineas: LineaBoleta[] = [];
  error = '';

  abrir(): void {
    this.abierto = true;
    if (!this.fecha) {
      const hoy = new Date();
      this.fecha = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`;
      this.numero = `B-${crypto.randomUUID()}`;
    }
  }

  agregar(): void {
    const producto = this.productos.find(p => String(p.id) === this.seleccionado);
    if (!producto) return;
    const precio = this.tipoPrecio === 'tarjeta' ? producto.precio_tarjeta : producto.precio;
    this.lineas.push({ nombre: producto.nombre, cantidad: 1, precio: precio ?? null });
    this.seleccionado = '';
    this.error = '';
  }

  subtotal(linea: LineaBoleta): number {
    return subtotalBoleta(linea);
  }

  get total(): number {
    return totalBoleta(this.lineas);
  }

  private datos(): DatosBoleta {
    return {
      comercio: this.comercio, direccion: this.direccion, contacto: this.contacto,
      identificacion: this.identificacion, cliente: this.cliente, documento: this.documento,
      numero: this.numero, fecha: this.fecha, pago: this.pago,
      observaciones: this.observaciones,
      lineas: this.lineas.map(l => ({ ...l, precio: l.precio == null ? null : Math.round(l.precio * 100) / 100 }))
    };
  }

  private validar(): boolean {
    if (!validarBoleta(this.datos())) {
      this.error = 'Completá comercio, cliente, referencia, fecha válida y entre 1 y 100 productos con cantidad entera positiva y precio mayor a cero (hasta dos decimales).';
      return false;
    }
    this.error = '';
    return true;
  }

  async guardar(): Promise<void> {
    if (this.guardando || this.guardada || !this.validar()) return;
    this.guardando = true;
    // La misma clave y el mismo contenido permiten reintentar sin duplicar boletas.
    this.pendiente ??= this.datos();
    try {
      this.guardada = await this.boletas.guardar(this.idBorrador, this.pendiente);
      this.guardado.emit();
    } catch {
      this.error = 'No se pudo confirmar el guardado. Revisá la conexión y la configuración de boletas en Supabase y reintentá. El borrador se conserva.';
    } finally {
      this.guardando = false;
    }
  }

  nueva(): void {
    if (!this.guardada && (this.lineas.length || this.pendiente) &&
        !window.confirm('¿Descartar este borrador y comenzar una nueva boleta?')) return;
    this.guardada = null; this.pendiente = null; this.idBorrador = crypto.randomUUID();
    this.cliente = ''; this.documento = ''; this.numero = ''; this.fecha = '';
    this.observaciones = ''; this.lineas = []; this.error = ''; this.seleccionado = '';
    this.abrir();
  }

  imprimir(): void {
    if (!this.guardada && !this.validar()) return;
    if (!imprimirBoleta(this.guardada?.datos ?? this.pendiente ?? this.datos())) {
      this.error = 'Permití las ventanas emergentes para imprimir la boleta.';
    }
  }
}

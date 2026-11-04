import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CurrencyPipe } from '@angular/common';
import { Producto } from '../../models/producto';

interface LineaBoleta { nombre: string; cantidad: number | null; precio: number | null; }

@Component({
  selector: 'app-generar-boleta',
  standalone: true,
  imports: [FormsModule, CurrencyPipe],
  templateUrl: './generar-boleta.component.html',
  styleUrl: './generar-boleta.component.css'
})
export class GenerarBoletaComponent {
  @Input() productos: Producto[] = [];
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
    return Math.round((linea.cantidad ?? 0) * Math.round((linea.precio ?? 0) * 100)) / 100;
  }

  get total(): number {
    return this.lineas.reduce((suma, linea) => suma + Math.round(this.subtotal(linea) * 100), 0) / 100;
  }

  imprimir(): void {
    this.error = '';
    if (!this.comercio.trim() || !this.cliente.trim() || !this.numero.trim() ||
        !/^\d{4}-\d{2}-\d{2}$/.test(this.fecha) || !this.lineas.length ||
        this.lineas.some(l => !l.nombre.trim() || !Number.isInteger(l.cantidad) ||
          l.cantidad! <= 0 || l.cantidad! > 1000000 || l.precio == null ||
          !Number.isFinite(l.precio) || l.precio <= 0 || l.precio > 1000000000) ||
        !Number.isSafeInteger(Math.round(this.total * 100))) {
      this.error = 'Completá comercio, cliente, referencia, fecha y al menos un producto con cantidad entera positiva y precio mayor a cero.';
      return;
    }
    const ventana = window.open('', '_blank');
    if (!ventana) {
      this.error = 'Permití las ventanas emergentes para imprimir la boleta.';
      return;
    }
    // Escapar todos los datos editables antes de construir el documento aislado.
    const escapar = (valor: string) => valor.replace(/[&<>"']/g, caracter =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[caracter]!));
    const moneda = (valor: number) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(valor);
    const texto = (valor: string) => escapar(valor).replace(/\n/g, '<br>');
    ventana.document.write(`<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Boleta ${escapar(this.numero)}</title><style>
      @page { size: A4; margin: 16mm; } body { font: 14px Arial,sans-serif; color: #222; margin: 24px; }
      h1 { font-size: 24px; } table { width: 100%; border-collapse: collapse; margin-top: 24px; }
      th,td { padding: 10px; border-bottom: 1px solid #ddd; text-align: right; overflow-wrap: anywhere; }
      th:first-child,td:first-child { text-align: left; } tr { break-inside: avoid; } thead { display: table-header-group; }
      .total { font-size: 20px; text-align: right; } p { overflow-wrap: anywhere; } footer { margin-top: 32px; }
      button { padding: 12px; } @media print { button { display: none; } body { margin: 0; } }
      </style></head><body><button onclick="window.print()">Imprimir / Guardar como PDF</button>
      <h1>${escapar(this.comercio)}</h1>
      <p>${[this.direccion, this.contacto, this.identificacion].filter(v => v.trim()).map(texto).join('<br>')}</p>
      <h2>Boleta — comprobante interno</h2><p>Referencia: ${escapar(this.numero)}<br>Fecha: ${escapar(this.fecha.split('-').reverse().join('/'))}</p>
      <p>Cliente: ${escapar(this.cliente)}${this.documento.trim() ? '<br>Documento: ' + escapar(this.documento) : ''}<br>Medio de pago: ${escapar(this.pago)}</p>
      <table><thead><tr><th>Producto</th><th>Cantidad</th><th>Precio unitario</th><th>Subtotal</th></tr></thead><tbody>
      ${this.lineas.map(l => `<tr><td>${escapar(l.nombre)}</td><td>${l.cantidad}</td><td>${moneda(l.precio!)}</td><td>${moneda(this.subtotal(l))}</td></tr>`).join('')}
      </tbody></table><p class="total">Total: ${moneda(this.total)}</p>
      ${this.observaciones.trim() ? `<p>Observaciones: ${texto(this.observaciones)}</p>` : ''}
      <footer>Comprobante interno. No válido como factura fiscal. Importes expresados en pesos argentinos.</footer></body></html>`);
    ventana.document.close();
    ventana.opener = null;
    ventana.focus();
  }
}

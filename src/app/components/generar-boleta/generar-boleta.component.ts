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
    const logo = escapar(new URL('logo/logo-boleta-noelia.png', document.baseURI).href);
    ventana.document.write(`<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Boleta ${escapar(this.numero)}</title><style>
      @page { size: A4; margin: 12mm; }
      * { box-sizing: border-box; }
      body { font: 12px Arial,sans-serif; color: #25231e; margin: 0; background: #eee; }
      .acciones { max-width: 186mm; margin: 18px auto; }
      button { padding: 12px 20px; border: 0; border-radius: 6px; background: #29251d; color: white; cursor: pointer; }
      .papel { max-width: 186mm; margin: 0 auto 24px; padding: 10mm; background: white; border-top: 5px solid #b18b45; }
      .cabecera { display: table; width: 100%; margin-bottom: 20px; }
      .marca,.folio { display: table-cell; vertical-align: middle; }
      .marca { width: 56%; padding-right: 18px; }
      .logo { width: 150px; height: 105px; object-fit: contain; display: block; margin-bottom: 8px; }
      h1 { font-size: 15px; margin: 0 0 6px; letter-spacing: 1px; text-transform: uppercase; }
      .datos-comercio { font-size: 11px; line-height: 1.6; }
      .folio { width: 44%; }
      .recuadro { border: 2px solid #8b703d; border-radius: 8px; overflow: hidden; text-align: center; }
      .tipo { font-size: 16px; font-weight: bold; padding: 13px 8px; background: #f4efe5; border-bottom: 1px solid #8b703d; letter-spacing: 1px; }
      .referencia { padding: 12px 8px; font-size: 12px; overflow-wrap: anywhere; }
      .referencia strong { display: block; color: #806027; margin-top: 6px; }
      .fecha { width: 100%; border-collapse: collapse; margin-top: 10px; table-layout: fixed; text-align: center; }
      .fecha td,.fecha th { border: 1px solid #8b703d; padding: 6px; }
      .fecha th { background: #f4efe5; font-size: 9px; letter-spacing: 1px; }
      .cliente { border: 1px solid #8b703d; border-radius: 6px; padding: 12px; margin-bottom: 16px; line-height: 1.8; }
      .etiqueta { font-weight: bold; margin-right: 6px; }
      .detalle { border-collapse: collapse; width: 100%; table-layout: fixed; }
      .detalle th,.detalle td { border: 1px solid #8b703d; padding: 10px 8px; overflow-wrap: anywhere; }
      .detalle th { background: #f4efe5; font-size: 10px; letter-spacing: .5px; text-transform: uppercase; }
      .detalle td { vertical-align: top; }
      .cantidad { width: 10%; text-align: center; }
      .descripcion { width: 46%; text-align: left; }
      .importe { width: 22%; text-align: right; font-variant-numeric: tabular-nums; }
      .vacia td { height: 32px; }
      thead { display: table-header-group; } tr { break-inside: avoid; }
      .cierre { margin-top: 14px; break-inside: avoid; }
      .total { margin-left: auto; width: 55%; border: 2px solid #8b703d; padding: 14px; text-align: right; background: #f4efe5; }
      .total span { font-size: 11px; letter-spacing: 1px; margin-right: 12px; }
      .total strong { font-size: 21px; }
      .observaciones { margin: 18px 0; line-height: 1.6; }
      .firmas { display: table; width: 100%; margin-top: 44px; text-align: center; font-size: 10px; color: #655d50; }
      .firma { display: table-cell; width: 50%; padding: 0 20px; }
      .firma span { display: block; border-top: 1px solid #8b703d; padding-top: 8px; }
      footer { margin-top: 24px; border-top: 1px solid #d9ccb5; padding-top: 12px; text-align: center; font-size: 9px; line-height: 1.7; }
      .gracias { font-size: 12px; color: #806027; margin-bottom: 5px; }
      p { overflow-wrap: anywhere; } .datos-comercio,.cliente { overflow-wrap: anywhere; }
      @media print { .acciones { display: none; } body { background: white; } .papel { margin: 0; max-width: none; padding: 0; border-top-width: 4px; padding-top: 7mm; } * { print-color-adjust: exact; -webkit-print-color-adjust: exact; } }
      @media screen and (max-width: 600px) { body { min-width: 680px; } }
      </style></head><body><div class="acciones"><button id="imprimir" onclick="window.print()">Imprimir / Guardar como PDF</button></div>
      <main class="papel"><header class="cabecera"><div class="marca">
      <img class="logo" src="${logo}" alt="Noelia Innovaciones" onerror="this.hidden=true">
      <h1>${escapar(this.comercio)}</h1>
      <div class="datos-comercio">${[this.direccion, this.contacto, this.identificacion].filter(v => v.trim()).map(texto).join('<br>')}</div>
      </div><div class="folio"><div class="recuadro"><div class="tipo">BOLETA DE VENTA</div>
      <div class="referencia">COMPROBANTE INTERNO<strong>N.º ${escapar(this.numero)}</strong></div></div>
      <table class="fecha" aria-label="Fecha"><tr><th>DÍA</th><th>MES</th><th>AÑO</th></tr><tr>${this.fecha.split('-').reverse().map(parte => `<td>${escapar(parte)}</td>`).join('')}</tr></table>
      </div></header>
      <section class="cliente"><div><span class="etiqueta">Señor/a:</span>${escapar(this.cliente)}</div>
      ${this.documento.trim() ? `<div><span class="etiqueta">Documento:</span>${escapar(this.documento)}</div>` : ''}
      <div><span class="etiqueta">Medio de pago:</span>${escapar(this.pago)}</div></section>
      <table class="detalle"><thead><tr><th class="cantidad">Cant.</th><th class="descripcion">Descripción</th><th class="importe">P. unitario</th><th class="importe">Importe</th></tr></thead><tbody>
      ${this.lineas.map(l => `<tr><td class="cantidad">${l.cantidad}</td><td>${escapar(l.nombre)}</td><td class="importe">${moneda(l.precio!)}</td><td class="importe">${moneda(this.subtotal(l))}</td></tr>`).join('')}
      ${Array.from({ length: Math.max(0, 6 - this.lineas.length) }, () => '<tr class="vacia" aria-hidden="true"><td></td><td></td><td></td><td></td></tr>').join('')}
      </tbody></table><section class="cierre"><div class="total"><span>TOTAL ARS</span><strong>${moneda(this.total)}</strong></div>
      ${this.observaciones.trim() ? `<p class="observaciones"><span class="etiqueta">Observaciones:</span>${texto(this.observaciones)}</p>` : ''}
      <div class="firmas"><div class="firma"><span>Firma / Aclaración</span></div><div class="firma"><span>Recibí conforme</span></div></div>
      <footer><div class="gracias">Gracias por elegirnos</div>Comprobante interno. No válido como factura fiscal.<br>Importes expresados en pesos argentinos.</footer></section></main></body></html>`);
    ventana.document.close();
    ventana.opener = null;
    ventana.focus();
  }
}

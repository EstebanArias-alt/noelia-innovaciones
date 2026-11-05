import { DatosBoleta, subtotalBoleta, totalBoleta } from '../models/boleta';

export function htmlBoleta(datos: DatosBoleta): string {
  const escapar = (valor: string) => valor.replace(/[&<>"']/g, caracter =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[caracter]!));
  const texto = (valor: string) => escapar(valor).replace(/\n/g, '<br>');
  const moneda = (valor: number) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(valor);
  const logo = escapar(new URL('logo/logo-boleta-noelia.png', document.baseURI).href);
  const total = totalBoleta(datos.lineas, datos.flete);
  const sena = datos.sena ?? 0;
  const saldo = Math.round((total - sena) * 100) / 100;
  const pauta = (titulo: string, contenido?: string) => contenido?.trim()
    ? `<span class="grupo-pautas"><strong>${titulo}:</strong> ${contenido.split(/\r?\n/).map(v => v.trim()).filter(Boolean).map(v => `• ${escapar(v)}`).join(' ')}</span> ` : '';
  const condiciones = pauta('PAUTAS DE ENTREGA', datos.pautas_entrega) +
    pauta('ARMADO A DOMICILIO', datos.pautas_armado) + pauta('POLÍTICAS', datos.politicas_empresa);
  const casilla = (activa: boolean) => `<span class="casilla">${activa ? 'X' : '&nbsp;'}</span>`;
  const fila = (etiqueta: string, valor: string) => `<tr><th>${etiqueta}</th><td>${valor}</td></tr>`;
  return `<!doctype html><html lang="es"><head><meta charset="utf-8">
  <meta name="robots" content="noindex, nofollow, noarchive"><meta name="referrer" content="no-referrer">
  <title>Boleta ${escapar(datos.numero)}</title><style>
  @page { size: A4; margin: 9mm; }
  * { box-sizing: border-box; }
  body { margin: 0; background: #eee; color: #171717; font: 10px Arial,sans-serif; }
  .acciones { max-width: 192mm; margin: 16px auto; }
  button { padding: 12px 20px; background: #222; color: white; border: 0; cursor: pointer; }
  .papel { width: 192mm; min-height: 277mm; margin: 0 auto 20px; background: white; border: 1px solid #b48a3c; padding: 4mm; display: flex; flex-direction: column; }
  .cabecera { display: grid; grid-template-columns: 29% 39% 32%; align-items: center; margin-bottom: 6mm; min-height: 35mm; }
  .datos-comercio { text-align: center; padding: 2mm; font-size: 9px; line-height: 1.6; overflow-wrap: anywhere; }
  .marca { border-left: 1px solid #b48a3c; border-right: 1px solid #b48a3c; text-align: center; }
  .logo { width: 44mm; height: 34mm; object-fit: contain; clip-path: inset(7% 0 2% 0); }
  .folio { padding-left: 3mm; }
  .recuadro { border: 1px solid #997435; text-align: center; }
  .tipo { padding: 6px; background: #f4efe5; font-size: 14px; font-weight: bold; border-bottom: 1px solid #997435; }
  .referencia { padding: 6px; font-size: 9px; overflow-wrap: anywhere; }
  .referencia strong { display: block; margin-top: 5px; }
  table { border-collapse: collapse; width: 100%; table-layout: fixed; }
  .fecha { margin-top: 4px; text-align: center; }
  .fecha th,.fecha td { border: 1px solid #997435; padding: 3px; }
  .fecha th { background: #f4efe5; font-size: 8px; }
  .cliente { border: 1px solid #997435; padding: 6px; margin-bottom: 5mm; display: grid; grid-template-columns: 1fr 1fr; gap: 5px 12px; line-height: 1.4; overflow-wrap: anywhere; }
  .etiqueta { font-weight: bold; margin-right: 6px; }
  .detalle th,.detalle td { border: 1px solid #997435; padding: 5px; overflow-wrap: anywhere; }
  .detalle th { background: #f4efe5; text-transform: uppercase; }
  .cantidad { width: 9%; text-align: center; }
  .descripcion { width: 49%; text-align: left; }
  .importe { width: 21%; text-align: right; font-variant-numeric: tabular-nums; }
  .vacia td { height: 6mm; }
  thead { display: table-header-group; } tr { break-inside: avoid; }
  .cierre { break-inside: avoid; margin-top: 5mm; }
  .resumen { display: grid; grid-template-columns: 59% 38%; gap: 3%; align-items: start; }
  .operacion th,.operacion td,.totales th,.totales td { border: 1px solid #997435; padding: 5px; text-align: left; overflow-wrap: anywhere; }
  .operacion th { width: 48%; text-transform: uppercase; font-size: 9px; background: #f4efe5; }
  .totales th { width: 45%; text-transform: uppercase; }
  .totales td { text-align: right; }
  .total { background: #e4c574; font-weight: bold; font-size: 14px; }
  .saldo { font-weight: bold; }
  .casilla { display: inline-block; border: 1px solid #555; width: 10px; height: 10px; line-height: 9px; font-size: 9px; text-align: center; }
  .observaciones { margin-top: 3mm; border: 1px solid #997435; min-height: 12mm; padding: 5px; line-height: 1.5; overflow-wrap: anywhere; }
  .firmas { display: flex; justify-content: space-between; gap: 16mm; margin: 9mm 8mm 5mm; text-align: center; font-size: 9px; break-inside: avoid; }
  .firma { width: 50%; border-top: 1px solid #555; padding-top: 4px; }
  .pie { margin-top: auto; padding-top: 3mm; }
  .condiciones { border-top: 1px solid #b48a3c; border-bottom: 1px solid #b48a3c; padding: 5px 0; font-size: 6.7pt; line-height: 1.2; text-align: left; overflow-wrap: anywhere; }
  .grupo-pautas strong { break-after: avoid; }
  footer { padding-top: 4mm; text-align: center; font-size: 8px; }
  @media print { .acciones { display: none; } body { background: white; } .papel { width: auto; margin: 0; } * { print-color-adjust: exact; -webkit-print-color-adjust: exact; } }
  @media screen and (max-width: 750px) { body { min-width: 740px; } }
  </style></head><body><div class="acciones"><button onclick="window.print()">Imprimir / Guardar como PDF</button></div>
  <main class="papel"><header class="cabecera">
    <div class="datos-comercio">${[datos.direccion, datos.contacto, datos.identificacion].filter(v => v.trim()).map(texto).join('<br>')}</div>
    <div class="marca"><img class="logo" src="${logo}" alt="${escapar(datos.comercio)}" onerror="this.hidden=true"></div>
    <div class="folio"><div class="recuadro"><div class="tipo">BOLETA DE VENTA</div><div class="referencia">COMPROBANTE INTERNO<strong>N.º ${escapar(datos.numero)}</strong></div></div>
    <table class="fecha" aria-label="Fecha"><tr><th>DÍA</th><th>MES</th><th>AÑO</th></tr><tr>${datos.fecha.split('-').reverse().map(v => `<td>${escapar(v)}</td>`).join('')}</tr></table></div>
  </header>
  <section class="cliente"><div><span class="etiqueta">Cliente:</span>${escapar(datos.cliente)}</div><div><span class="etiqueta">Documento:</span>${escapar(datos.documento || '—')}</div><div><span class="etiqueta">Domicilio:</span>${escapar(datos.domicilio_cliente || '—')}</div><div><span class="etiqueta">Teléfono:</span>${escapar(datos.telefono_cliente || '—')}</div></section>
  <table class="detalle"><thead><tr><th class="cantidad">Cant.</th><th class="descripcion">Detalle</th><th class="importe">P. unitario</th><th class="importe">Importe</th></tr></thead><tbody>
  ${datos.lineas.map(l => `<tr><td class="cantidad">${l.cantidad}</td><td>${escapar(l.nombre)}</td><td class="importe">${moneda(l.precio!)}</td><td class="importe">${moneda(subtotalBoleta(l))}</td></tr>`).join('')}
  ${Array.from({ length: Math.max(0, 10 - datos.lineas.length) }, () => '<tr class="vacia" aria-hidden="true"><td></td><td></td><td></td><td></td></tr>').join('')}
  </tbody></table>
  <section class="cierre"><div class="resumen"><table class="operacion" aria-label="Datos de la operación"><tbody>
  ${fila('Modo de pago', escapar(datos.pago))}${fila('N.º de autorización', escapar(datos.autorizacion || '—'))}
  ${fila('Tipo de tarjeta', escapar(datos.tipo_tarjeta || '—'))}
  ${datos.estado ? fila('Estado (registro anterior)', escapar(datos.estado)) : ''}
  ${fila('Vendedor', escapar(datos.vendedor || '—'))}${fila('Armar en domicilio', datos.armar_domicilio === undefined ? 'Sin especificar' : `${casilla(datos.armar_domicilio)} SÍ &nbsp; ${casilla(!datos.armar_domicilio)} NO`)}
  ${fila('Tiempo de entrega', escapar(datos.tiempo_entrega || '—'))}
  </tbody></table><table class="totales" aria-label="Importes"><tbody>
  ${fila('Subtotal', moneda(totalBoleta(datos.lineas)))}${fila('Flete', moneda(datos.flete ?? 0))}
  <tr class="total"><th>TOTAL</th><td>${moneda(total)}</td></tr>
  ${datos.sena !== undefined ? fila('Seña', moneda(sena)) + `<tr class="saldo"><th>SALDO</th><td>${moneda(saldo)}</td></tr>` : ''}
  </tbody></table></div>
  <div class="observaciones"><span class="etiqueta">OBSERVACIÓN:</span>${texto(datos.observaciones)}</div>
  <div class="firmas"><div class="firma">FIRMA DEL CLIENTE</div><div class="firma">FIRMA / ACLARACIÓN DEL VENDEDOR</div></div></section>
  <div class="pie">${condiciones ? `<section class="condiciones" aria-label="Pautas y políticas">${condiciones}</section>` : ''}
  <footer>Comprobante interno sin validez fiscal · Importes expresados en pesos argentinos.</footer></div>
  </main></body></html>`;
}

export function imprimirBoleta(datos: DatosBoleta): boolean {
  const ventana = window.open('', '_blank');
  if (!ventana) return false;
  // Navegar al documento completo permite cargar el logo antes de imprimir.
  const url = URL.createObjectURL(new Blob([htmlBoleta(datos)], { type: 'text/html;charset=utf-8' }));
  ventana.opener = null;
  ventana.location.replace(url);
  window.setTimeout(() => URL.revokeObjectURL(url), 60000);
  return true;
}

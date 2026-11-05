import { DatosBoleta, subtotalBoleta, totalBoleta } from '../models/boleta';

export function htmlBoleta(datos: DatosBoleta): string {
    // Escapar todos los datos editables antes de construir el documento aislado.
    const escapar = (valor: string) => valor.replace(/[&<>"']/g, caracter =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[caracter]!));
    const moneda = (valor: number) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(valor);
    const texto = (valor: string) => escapar(valor).replace(/\n/g, '<br>');
    const logo = escapar(new URL('logo/logo-boleta-noelia.png', document.baseURI).href);
    const pautas = (titulo: string, contenido?: string) => {
      const items = (contenido ?? '').split(/\r?\n/).map(l => l.trim()).filter(Boolean);
      return items.length ? `<section class="grupo-pautas"><h3>${titulo}</h3><ul>${items.map(item => `<li>${escapar(item)}</li>`).join('')}</ul></section>` : '';
    };
    const condiciones = pautas('PAUTAS DE ENTREGAS', datos.pautas_entrega) +
      pautas('PAUTAS DE ARMADO A DOMICILIO', datos.pautas_armado) +
      pautas('POLÍTICAS DE LA EMPRESA', datos.politicas_empresa);
    const casilla = (activa: boolean) => `<span class="casilla">${activa ? 'X' : '&nbsp;'}</span>`;
    return `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="robots" content="noindex, nofollow, noarchive"><meta name="referrer" content="no-referrer"><title>Boleta ${escapar(datos.numero)}</title><style>
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
      .operacion { width: 100%; border-collapse: collapse; margin: 16px 0; table-layout: fixed; }
      .operacion td { border: 1px solid #8b703d; width: 50%; padding: 9px; vertical-align: top; overflow-wrap: anywhere; }
      .operacion .etiqueta { display: block; font-size: 9px; text-transform: uppercase; margin-bottom: 5px; color: #655d50; }
      .casilla { display: inline-block; width: 12px; height: 12px; border: 1px solid #8b703d; font-size: 10px; text-align: center; line-height: 10px; margin-right: 4px; }
      .desglose { margin: 8px 0 8px auto; width: 55%; display: flex; justify-content: space-between; gap: 12px; }
      .condiciones { margin-top: 10px; border-top: 3px solid #b18b45; padding-top: 18px; }
      .condiciones h2 { font-size: 17px; margin: 0 0 8px; }
      .condiciones .referencia-pautas { font-size: 10px; line-height: 1.6; margin-bottom: 18px; }
      .grupo-pautas h3 { font-size: 12px; background: #f4efe5; border-left: 3px solid #b18b45; padding: 8px; margin: 16px 0 8px; }
      .grupo-pautas ul { padding-left: 19px; margin: 0; }
      .grupo-pautas li { font-size: 11px; line-height: 1.65; margin-bottom: 10px; overflow-wrap: anywhere; }
      .grupo-pautas li, .grupo-pautas h3 { break-inside: avoid; }
      .grupo-pautas h3 { break-after: avoid; }
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
      @media print { .acciones { display: none; } body { background: white; } .papel { margin: 0; max-width: none; padding: 7mm 1mm 0; border-top-width: 4px; } * { print-color-adjust: exact; -webkit-print-color-adjust: exact; } }
      .con-pautas .cabecera { margin-bottom: 10px; }
      .con-pautas .logo { width: 110px; height: 72px; margin-bottom: 4px; }
      .con-pautas h1 { font-size: 13px; margin-bottom: 3px; }
      .con-pautas .datos-comercio { font-size: 9px; line-height: 1.4; }
      .con-pautas .tipo { font-size: 14px; padding: 8px; }
      .con-pautas .referencia { padding: 7px; font-size: 10px; }
      .con-pautas .fecha { margin-top: 6px; }
      .con-pautas .fecha td,.con-pautas .fecha th { padding: 4px; }
      .con-pautas .cliente { display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); gap: 3px 12px; padding: 8px; margin-bottom: 10px; line-height: 1.5; font-size: 10px; }
      .con-pautas .operacion { margin: 10px 0; font-size: 10px; }
      .con-pautas .operacion td { padding: 6px; }
      .con-pautas .operacion .etiqueta { display: inline; font-size: 8.5px; margin-bottom: 0; }
      .con-pautas .detalle { font-size: 10px; }
      .con-pautas .detalle th,.con-pautas .detalle td { padding: 6px; }
      .con-pautas .vacia td { height: 20px; }
      .con-pautas .cierre { margin-top: 8px; }
      .con-pautas .desglose { margin-top: 3px; margin-bottom: 3px; font-size: 10px; }
      .con-pautas .total { padding: 8px; }
      .con-pautas .total strong { font-size: 17px; }
      .con-pautas .observaciones { margin: 8px 0; font-size: 10px; line-height: 1.4; }
      .con-pautas .condiciones { border-top-width: 1px; padding-top: 6px; break-inside: avoid; }
      .con-pautas .condiciones h2 { font-size: 10px; margin: 0 0 4px; }
      .con-pautas .grupo-pautas h3 { font-size: 8.5px; padding: 3px 5px; margin: 5px 0 3px; }
      .con-pautas .grupo-pautas ul { padding-left: 13px; }
      .con-pautas .grupo-pautas li { font-size: 8.5px; line-height: 1.35; margin-bottom: 3px; }
      .con-pautas .firmas { margin-top: 20px; font-size: 9px; break-inside: avoid; }
      .con-pautas .firma span { padding-top: 5px; }
      .con-pautas footer { margin-top: 10px; padding-top: 6px; font-size: 8px; line-height: 1.4; }
      .con-pautas .gracias { font-size: 10px; margin-bottom: 2px; }
      @media screen and (max-width: 600px) { body { min-width: 680px; } }
      </style></head><body><div class="acciones"><button id="imprimir" onclick="window.print()">Imprimir / Guardar como PDF</button></div>
      <main class="papel${condiciones ? ' con-pautas' : ''}"><header class="cabecera"><div class="marca">
      <img class="logo" src="${logo}" alt="Noelia Innovaciones" onerror="this.hidden=true">
      <h1>${escapar(datos.comercio)}</h1>
      <div class="datos-comercio">${[datos.identificacion, datos.direccion, datos.contacto].filter(v => v.trim()).map(texto).join('<br>')}</div>
      </div><div class="folio"><div class="recuadro"><div class="tipo">BOLETA DE VENTA</div>
      <div class="referencia">COMPROBANTE INTERNO<strong>N.º ${escapar(datos.numero)}</strong></div></div>
      <table class="fecha" aria-label="Fecha"><tr><th>DÍA</th><th>MES</th><th>AÑO</th></tr><tr>${datos.fecha.split('-').reverse().map(parte => `<td>${escapar(parte)}</td>`).join('')}</tr></table>
      </div></header>
      <section class="cliente"><div><span class="etiqueta">Señor/a:</span>${escapar(datos.cliente)}</div>
      ${datos.documento.trim() ? `<div><span class="etiqueta">Documento:</span>${escapar(datos.documento)}</div>` : ''}
      ${datos.domicilio_cliente?.trim() ? `<div><span class="etiqueta">Domicilio:</span>${escapar(datos.domicilio_cliente)}</div>` : ''}
      ${datos.telefono_cliente?.trim() ? `<div><span class="etiqueta">Teléfono:</span>${escapar(datos.telefono_cliente)}</div>` : ''}
      <div><span class="etiqueta">Modo de pago:</span>${escapar(datos.pago)}</div></section>
      ${[datos.autorizacion, datos.estado, datos.vendedor, datos.armar_domicilio].some(v => v !== undefined && v !== '') ? `
      <table class="operacion" aria-label="Datos de la operación"><tbody>
        <tr><td><span class="etiqueta">Número de autorización</span>${escapar(datos.autorizacion || '—')}</td><td><span class="etiqueta">Estado</span>${escapar(datos.estado || '—')}</td></tr>
        <tr><td><span class="etiqueta">Vendedor</span>${escapar(datos.vendedor || '—')}</td><td><span class="etiqueta">Armar en domicilio</span>${datos.armar_domicilio === undefined ? 'Sin especificar' : `${casilla(datos.armar_domicilio)} SÍ &nbsp;&nbsp; ${casilla(!datos.armar_domicilio)} NO`}</td></tr>
      </tbody></table>` : ''}
      <table class="detalle"><thead><tr><th class="cantidad">Cant.</th><th class="descripcion">Descripción</th><th class="importe">P. unitario</th><th class="importe">Importe</th></tr></thead><tbody>
      ${datos.lineas.map(l => `<tr><td class="cantidad">${l.cantidad}</td><td>${escapar(l.nombre)}</td><td class="importe">${moneda(l.precio!)}</td><td class="importe">${moneda(subtotalBoleta(l))}</td></tr>`).join('')}
      ${Array.from({ length: Math.max(0, (condiciones ? 4 : 6) - datos.lineas.length) }, () => '<tr class="vacia" aria-hidden="true"><td></td><td></td><td></td><td></td></tr>').join('')}
      </tbody></table><section class="cierre">
      ${datos.flete !== undefined ? `<div class="desglose"><span>Subtotal productos</span><strong>${moneda(totalBoleta(datos.lineas))}</strong></div><div class="desglose"><span>Flete</span><strong>${datos.flete === 0 ? 'SIN CARGO' : moneda(datos.flete)}</strong></div>` : ''}
      <div class="total"><span>TOTAL ARS</span><strong>${moneda(totalBoleta(datos.lineas, datos.flete))}</strong></div>
      ${datos.observaciones.trim() ? `<p class="observaciones"><span class="etiqueta">Observaciones:</span>${texto(datos.observaciones)}</p>` : ''}
      </section>
      ${condiciones ? `<section class="condiciones"><h2>Condiciones de entrega y armado</h2>${condiciones}</section>` : ''}
      <div class="firmas"><div class="firma"><span>Firma / Aclaración</span></div><div class="firma"><span>Recibí conforme</span></div></div>
      <footer><div class="gracias">Gracias por elegirnos</div>Comprobante interno. No válido como factura fiscal.<br>Importes expresados en pesos argentinos.</footer>
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

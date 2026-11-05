import { Component, Input } from '@angular/core';
import { BoletaGuardada } from '../../models/boleta';

@Component({
  selector: 'app-compartir-boleta', standalone: true,
  template: `
    @if (boleta.compartible) {
      <p>Cualquiera que reciba este enlace podrá ver esta boleta. Podés desactivarlo desde el historial.</p>
      <label>Enlace de la boleta<input readonly [value]="enlace" (focus)="seleccionar($event)"></label>
      <div class="acciones">
        <button type="button" (click)="copiar()">Copiar enlace</button>
        <a [href]="whatsapp" target="_blank" rel="noopener noreferrer">Compartir por WhatsApp</a>
        <a [href]="correo">Compartir por correo</a>
      </div>
      <p>Se abre un mensaje con el enlace para que elijas el destinatario y lo envíes.</p>
      @if (local) { <p>Para compartir con el cliente usá la web publicada: localhost solo funciona en tu equipo.</p> }
      @if (mensaje) { <p role="status">{{ mensaje }}</p> }
    } @else { <p>Enlace desactivado. La boleta sigue disponible en el historial.</p> }
  `,
  styles: [`:host{display:block;margin:16px 0;padding:16px;border:1px solid #d9ccb5;border-radius:8px}p{line-height:1.5}input{display:block;width:100%;box-sizing:border-box;padding:10px;margin:6px 0 14px}.acciones{display:flex;flex-wrap:wrap;gap:12px;align-items:center}button,a{padding:10px;border:1px solid #8b703d;border-radius:6px;background:white;color:#493918;font:inherit;text-decoration:none;cursor:pointer}`]
})
export class CompartirBoletaComponent {
  @Input({ required: true }) boleta!: BoletaGuardada;
  mensaje = '';
  get enlace(): string { return new URL('boleta/' + this.boleta.share_token, document.baseURI).href; }
  get local(): boolean { return ['localhost', '127.0.0.1', '[::1]'].includes(window.location.hostname); }
  get texto(): string { return `Hola, te compartimos tu boleta ${this.boleta.datos.numero} de ${this.boleta.datos.comercio}: ${this.enlace}`; }
  get whatsapp(): string { return 'https://wa.me/?text=' + encodeURIComponent(this.texto); }
  get correo(): string {
    return 'mailto:?subject=' + encodeURIComponent('Boleta ' + this.boleta.datos.numero) + '&body=' + encodeURIComponent(this.texto);
  }
  seleccionar(event: Event): void { (event.target as HTMLInputElement).select(); }
  async copiar(): Promise<void> {
    try { await navigator.clipboard.writeText(this.enlace); this.mensaje = 'Enlace copiado.'; }
    catch { this.mensaje = 'Seleccioná el enlace y copialo manualmente.'; }
  }
}

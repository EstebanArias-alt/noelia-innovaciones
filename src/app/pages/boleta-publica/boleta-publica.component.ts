import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeHtml, Meta } from '@angular/platform-browser';
import { BoletasService } from '../../services/boletas.service';
import { BoletaPublica } from '../../models/boleta';
import { htmlBoleta, imprimirBoleta } from '../../services/boleta-impresion';

@Component({
  selector: 'app-boleta-publica', standalone: true,
  template: `<main>
    @if (cargando) {<p role="status">Cargando boleta…</p>}
    @if (error) {<p role="alert">{{ error }}</p><button type="button" (click)="cargar()">Reintentar</button>}
    @if (boleta) {
      <h1>Tu boleta de {{ boleta.datos.comercio }}</h1>
      <button type="button" (click)="imprimir()">Abrir para imprimir / Guardar PDF</button>
      <p>En la vista de impresión, elegí “Guardar como PDF” para descargarla.</p>
      <iframe title="Vista de la boleta" sandbox="" referrerpolicy="no-referrer" [style.height.px]="altoVista" [srcdoc]="vista"></iframe>
    }
  </main>`,
  styles: [`main{max-width:900px;margin:24px auto;padding:16px;font:16px Arial,sans-serif}h1{font-size:22px}button{padding:12px 18px;background:#29251d;color:white;border:0;border-radius:6px;cursor:pointer}iframe{width:100%;height:1000px;border:1px solid #ddd;margin-top:16px}p{line-height:1.5}[role=alert]{color:#a32020}`]
})
export class BoletaPublicaComponent implements OnInit, OnDestroy {
  boleta: BoletaPublica | null = null;
  vista: SafeHtml = '';
  altoVista = 1000;
  cargando = true;
  error = '';
  constructor(private route: ActivatedRoute, private servicio: BoletasService,
    private sanitizer: DomSanitizer, private meta: Meta) {}
  ngOnInit(): void {
    this.meta.updateTag({ name: 'robots', content: 'noindex, nofollow, noarchive' });
    this.meta.updateTag({ name: 'referrer', content: 'no-referrer' });
    void this.cargar();
  }
  ngOnDestroy(): void {
    this.meta.removeTag('name="robots"'); this.meta.removeTag('name="referrer"');
  }
  async cargar(): Promise<void> {
    this.cargando = true; this.error = ''; this.boleta = null;
    try {
      this.boleta = await this.servicio.publica(this.route.snapshot.paramMap.get('token') ?? '');
      if (!this.boleta) { this.error = 'Esta boleta no está disponible o su enlace fue desactivado.'; return; }
      this.altoVista = [this.boleta.datos.pautas_entrega, this.boleta.datos.pautas_armado, this.boleta.datos.politicas_empresa].some(v => v?.trim()) ? 2100 : 1100;
      // HTML propio con todos los datos escapados; iframe sin scripts ni acceso al sitio.
      this.vista = this.sanitizer.bypassSecurityTrustHtml(htmlBoleta(this.boleta.datos)
        .replace('<div class="acciones">', '<div class="acciones" style="display:none">'));
    } catch { this.error = 'No se pudo cargar la boleta. Revisá tu conexión e intentá de nuevo.'; }
    finally { this.cargando = false; }
  }
  imprimir(): void {
    if (this.boleta && !imprimirBoleta(this.boleta.datos)) this.error = 'Permití las ventanas emergentes para abrir la impresión.';
  }
}

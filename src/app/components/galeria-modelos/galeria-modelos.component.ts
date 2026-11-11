import { Component, ElementRef, inject, OnInit, viewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FotoModelo, GaleriaModelosService } from '../../services/galeria-modelos.service';

@Component({
  selector: 'app-galeria-modelos',
  templateUrl: './galeria-modelos.component.html',
  styleUrl: './galeria-modelos.component.css'
})
export class GaleriaModelosComponent implements OnInit {
  private readonly galeria = inject(GaleriaModelosService);
  private readonly parametros = inject(ActivatedRoute).snapshot.queryParamMap;
  private readonly visor = viewChild<ElementRef<HTMLDialogElement>>('visor');

  readonly demo = this.parametros.get('galeria-demo') === '1';
  fotos: FotoModelo[] = [];
  seleccion?: FotoModelo;
  limite = 8;

  async ngOnInit(): Promise<void> {
    if (this.demo) {
      this.fotos = Array.from({ length: 6 }, (_, i) => ({
        referencia: `ejemplo-${i + 1}`,
        url: `/images/galeria/trabajo-${i + 1}.jpg`
      }));
    } else {
      try {
        this.fotos = await this.galeria.listar();
      } catch {
        return;
      }
    }

    const foto = this.fotos.find(item => item.referencia === this.parametros.get('modelo'));
    if (foto) this.abrir(foto);
  }

  abrir(foto: FotoModelo): void {
    this.seleccion = foto;
    const dialogo = this.visor()?.nativeElement;
    if (dialogo && !dialogo.open) dialogo.showModal();
  }

  get whatsappUrl(): string {
    if (!this.seleccion) return '';
    const enlace = new URL('/', window.location.origin);
    enlace.searchParams.set('modelo', this.seleccion.referencia);
    if (this.demo) enlace.searchParams.set('galeria-demo', '1');
    const mensaje = `Hola, quisiera consultar el precio y la disponibilidad de este modelo: ${enlace.href}`;
    return `https://wa.me/5493884605421?text=${encodeURIComponent(mensaje)}`;
  }
}

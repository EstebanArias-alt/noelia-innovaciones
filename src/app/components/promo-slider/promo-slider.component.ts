import {
  Component,
  OnDestroy,
  OnInit
} from '@angular/core';

@Component({
  selector: 'app-promo-slider',
  standalone: true,
  imports: [],
  templateUrl: './promo-slider.component.html',
  styleUrl: './promo-slider.component.css'
})
export class PromoSliderComponent
  implements OnInit, OnDestroy {

  banners = [
    {
      imagen: '/images/banners/banner-1.png',
      titulo: 'Renová tu living',
      subtitulo:
        'Diseño, comodidad y calidad para tu hogar',
      boton: 'Ver productos'
    },

    {
      imagen: '/images/banners/banner-2.png',
      titulo: 'Sofás para cada espacio',
      subtitulo:
        'Encontrá el modelo ideal para tu hogar',
      boton: 'Ver sofás'
    },

    {
      imagen: '/images/banners/banner-3.png',
      titulo: 'Consultá nuestras promociones',
      subtitulo:
        'Opciones para renovar tus ambientes',
      boton: 'Consultar'
    }
  ];

  currentIndex = 0;

  private intervalId?: ReturnType<typeof setInterval>;


  ngOnInit(): void {

    this.intervalId = setInterval(() => {

      this.next();

    }, 5000);

  }


  ngOnDestroy(): void {

    if (this.intervalId) {
      clearInterval(this.intervalId);
    }

  }


  next(): void {

    this.currentIndex =
      (this.currentIndex + 1)
      % this.banners.length;

  }


  previous(): void {

    this.currentIndex =
      (
        this.currentIndex
        - 1
        + this.banners.length
      )
      % this.banners.length;

  }


  goTo(index: number): void {

    this.currentIndex = index;

  }

}
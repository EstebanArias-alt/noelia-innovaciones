import { Component } from '@angular/core';
import { GaleriaModelosComponent } from '../../components/galeria-modelos/galeria-modelos.component';

import { HeaderComponent } from '../../components/header/header.component';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { PromoBarComponent } from '../../components/promo-bar/promo-bar.component';
import { PromoSliderComponent } from '../../components/promo-slider/promo-slider.component';

import { CategoriasComponent } from '../../components/categorias/categorias.component';
import { ProductosComponent } from '../../components/productos/productos.component';
import { NosotrosComponent } from '../../components/nosotros/nosotros.component';
import { GaleriaComponent } from '../../components/galeria/galeria.component';
import { ContactoComponent } from '../../components/contacto/contacto.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { WhatsappButtonComponent } from '../../components/whatsapp-button/whatsapp-button.component';
import { OfertasComponent } from '../../components/ofertas/ofertas.component';
import { NuevosIngresosComponent }from '../../components/nuevos-ingresos/nuevos-ingresos.component';
import { BannerPromocionalComponent }from '../../components/banner-promocional/banner-promocional.component';
import { ContactoNewsletterComponent }from '../../components/contacto-newsletter/contacto-newsletter.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    HeaderComponent,
    NavbarComponent,
    PromoBarComponent,
    PromoSliderComponent,
    OfertasComponent,
    NuevosIngresosComponent,
    BannerPromocionalComponent,
    ContactoNewsletterComponent,

    CategoriasComponent,
    ProductosComponent,
    NosotrosComponent,
    GaleriaComponent,
    GaleriaModelosComponent,
    ContactoComponent,
    FooterComponent,
    WhatsappButtonComponent
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {}
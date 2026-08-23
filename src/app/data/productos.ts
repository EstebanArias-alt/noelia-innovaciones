import { Producto } from '../models/producto';

export const PRODUCTOS: Producto[] = [
  {
    id: 1,
    nombre: 'Sofá Roma',
    categoria: 'Sofás',
    precio: 850000,
    imagen: '/images/productos/sofa-roma.jpg',
    cuotas: '12 cuotas sin interés',
    destacado: true,
     oferta: true
  },
  {
    id: 2,
    nombre: 'Sofá Dubai',
    categoria: 'Sofás',
    precio: 920000,
    imagen: '/images/productos/sofa-dubai.jpg',
    cuotas: '12 cuotas sin interés',
    destacado: true,
    nuevo: true
  },
  {
    id: 3,
    nombre: 'Sillón Verona',
    categoria: 'Sillones',
    precio: 430000,
    imagen: '/images/productos/sillon-verona.jpg',
    cuotas: '6 cuotas sin interés',
    destacado: true,
    nuevo: true
  },
  {
    id: 4,
    nombre: 'Esquinero Milano',
    categoria: 'Esquineros',
    precio: 1150000,
    imagen: '/images/productos/esquinero-milano.jpg',
    cuotas: '12 cuotas sin interés',
    destacado: true,
    oferta: true
  },
  {
    id: 5,
    nombre: 'Juego de Living Premium',
    categoria: 'Living',
    precio: 1350000,
    imagen: '/images/productos/living-premium.jpg',
    cuotas: '12 cuotas sin interés',
    destacado: true,
     oferta: true
  }
];
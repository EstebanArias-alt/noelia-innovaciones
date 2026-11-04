import { CompartirBoletaComponent } from './compartir-boleta.component';
import { BoletaGuardada } from '../../models/boleta';
describe('Compartir boleta', () => {
  it('codifica el enlace y texto en WhatsApp y correo sin enviar automáticamente', () => {
    const component = new CompartirBoletaComponent();
    component.boleta = { share_token: '123', datos: { numero: 'B&1', comercio: 'Noelia & más' } } as BoletaGuardada;
    expect(component.enlace).toContain('/boleta/123');
    const wa = new URL(component.whatsapp);
    expect(wa.hostname).toBe('wa.me');
    expect(wa.searchParams.get('text')).toBe(component.texto);
    expect(component.correo).toContain(encodeURIComponent('Boleta B&1'));
  });
});

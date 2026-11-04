import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { BoletaGuardada, BoletaPublica, DatosBoleta } from '../models/boleta';

@Injectable({ providedIn: 'root' })
export class BoletasService {
  constructor(private conexion: SupabaseService) {}

  async guardar(id: string, datos: DatosBoleta): Promise<BoletaGuardada> {
    const resultado = await this.conexion.supabase.rpc('guardar_boleta', { p_id: id, p_datos: datos });
    if (resultado.error || !resultado.data) throw resultado.error ?? new Error('Sin resultado');
    return resultado.data as BoletaGuardada;
  }

  async listar(pagina: number, campo: 'cliente' | 'referencia', busqueda: string): Promise<BoletaGuardada[]> {
    let consulta = this.conexion.supabase.from('boletas').select('*')
      .order('created_at', { ascending: false }).order('id', { ascending: false });
    if (busqueda.trim()) {
      const literal = busqueda.trim().replace(/[\\%_]/g, c => '\\' + c);
      consulta = consulta.ilike(campo, '%' + literal + '%');
    }
    const { data, error } = await consulta.range(pagina * 20, pagina * 20 + 19);
    if (error) throw error;
    return (data ?? []) as BoletaGuardada[];
  }

  async publica(token: string): Promise<BoletaPublica | null> {
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(token)) return null;
    const { data, error } = await this.conexion.supabase.rpc('ver_boleta_compartida', { p_token: token });
    if (error) throw error;
    return data as BoletaPublica | null;
  }

  async revocar(id: string): Promise<void> {
    const { data, error } = await this.conexion.supabase.from('boletas')
      .update({ compartible: false }).eq('id', id).select('id').single();
    if (error || !data) throw error ?? new Error('No se pudo revocar');
  }
}

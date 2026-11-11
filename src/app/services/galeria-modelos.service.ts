import { inject, Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';

export interface FotoModelo {
  referencia: string;
  url: string;
}

const extensiones: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp'
};

export const MAX_FOTO_MODELO = 5 * 1024 * 1024;

@Injectable({ providedIn: 'root' })
export class GaleriaModelosService {
  private readonly fotos = inject(SupabaseService).supabase.storage.from('galeria-modelos');

  async listar(): Promise<FotoModelo[]> {
    const fotos: FotoModelo[] = [];
    const limite = 100;
    for (let offset = 0; ; offset += limite) {
      const { data, error } = await this.fotos.list('', {
        limit: limite, offset, sortBy: { column: 'created_at', order: 'desc' }
      });
      if (error) throw error;
      for (const archivo of data) {
        if (!archivo.id) continue;
        fotos.push({
          referencia: archivo.name,
          url: this.fotos.getPublicUrl(archivo.name).data.publicUrl
        });
      }
      if (data.length < limite) return fotos;
    }
  }

  async borrar(referencia: string): Promise<void> {
    const { data, error } = await this.fotos.remove([referencia]);
    if (error) throw error;
    if (!data?.length) throw new Error('Supabase no confirmó el borrado.');
  }

  async subir(archivo: File): Promise<void> {
    const extension = extensiones[archivo.type];
    if (!extension || archivo.size === 0 || archivo.size > MAX_FOTO_MODELO) {
      throw new Error('Usá una foto JPG, PNG o WebP de hasta 5 MB.');
    }
    const { error } = await this.fotos.upload(
      `${crypto.randomUUID()}.${extension}`, archivo, { contentType: archivo.type }
    );
    if (error) throw error;
  }
}

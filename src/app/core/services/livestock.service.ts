import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Livestock } from '../../shared/models/livestock.model';

@Injectable({ providedIn: 'root' })
export class LivestockService {
  private readonly table = 'livestock';

  constructor(private supabase: SupabaseService) {}

  async getAll(): Promise<Livestock[]> {
    const { data, error } = await this.supabase.client.from(this.table).select('*');
    if (error) throw error;
    return data || [];
  }

  async getById(id: string): Promise<Livestock> {
    const { data, error } = await this.supabase.client.from(this.table).select('*').eq('id', id).single();
    if (error) throw error;
    return data;
  }

  async create(livestock: Partial<Livestock>): Promise<Livestock> {
    const { data, error } = await this.supabase.client.from(this.table).insert(livestock).select().single();
    if (error) throw error;
    return data;
  }

  async update(id: string, livestock: Partial<Livestock>): Promise<Livestock> {
    const { data, error } = await this.supabase.client.from(this.table).update(livestock).eq('id', id).select().single();
    if (error) throw error;
    return data;
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase.client.from(this.table).delete().eq('id', id);
    if (error) throw error;
  }
}

import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Custodian } from '../../shared/models/custodian.model';

@Injectable({
  providedIn: 'root'
})
export class CustodianService {
  private readonly TABLE = 'custodians';

  constructor(private supabase: SupabaseService) {}

  async getAll(): Promise<Custodian[]> {
    const { data, error } = await this.supabase.client
      .from(this.TABLE)
      .select('*')
      .order('name');
    if (error) throw error;
    return data || [];
  }

  async getActive(): Promise<Custodian[]> {
    const { data, error } = await this.supabase.client
      .from(this.TABLE)
      .select('*')
      .eq('status', 'active')
      .order('name');
    if (error) throw error;
    return data || [];
  }

  async create(custodian: Partial<Custodian>): Promise<Custodian> {
    const { data, error } = await this.supabase.client
      .from(this.TABLE)
      .insert([custodian])
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async update(id: string, updates: Partial<Custodian>): Promise<Custodian> {
    const { data, error } = await this.supabase.client
      .from(this.TABLE)
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase.client
      .from(this.TABLE)
      .delete()
      .eq('id', id);
    if (error) throw error;
  }
}
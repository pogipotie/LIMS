import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { AuthService } from './auth.service';
import { Livestock } from '../../shared/models/livestock.model';

@Injectable({ providedIn: 'root' })
export class LivestockService {
  private readonly table = 'livestock';

  constructor(private supabase: SupabaseService, private authService: AuthService) {}

  async getAll(): Promise<Livestock[]> {
    const role = await this.authService.getUserRole();
    const session = await this.supabase.client.auth.getSession();
    const userId = session.data.session?.user.id;

    let query = this.supabase.client
      .from(this.table)
      .select(`
        *,
        custodian:user_roles!livestock_custodian_user_fkey (
          user_id,
          full_name,
          role
        )
      `)
      .order('created_at', { ascending: false });

    // If the user is a custodian, they should only see their own assigned animals
    if (role === 'custodian' && userId) {
      query = query.eq('custodian_id', userId);
    }

    const { data, error } = await query;
    if (error) throw error;
    
    // Map full_name to name for UI compatibility
    return (data || []).map(item => ({
      ...item,
      custodian: item.custodian ? { ...item.custodian, name: item.custodian.full_name } : null
    }));
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

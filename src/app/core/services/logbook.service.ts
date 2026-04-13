import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Logbook } from '../../shared/models/logbook.model';

@Injectable({
  providedIn: 'root'
})
export class LogbookService {
  private readonly TABLE = 'logbooks';

  constructor(private supabase: SupabaseService) {}

  async getAll(): Promise<Logbook[]> {
    const { data, error } = await this.supabase.client
      .from(this.TABLE)
      .select(`
        *,
        livestock:livestock_id (
          id,
          tag_number,
          category,
          name
        )
      `)
      .order('log_date', { ascending: false })
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  async getByLivestock(livestockId: string): Promise<Logbook[]> {
    const { data, error } = await this.supabase.client
      .from(this.TABLE)
      .select('*')
      .eq('livestock_id', livestockId)
      .order('log_date', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  async create(log: Partial<Logbook>): Promise<Logbook> {
    const user = await this.supabase.client.auth.getUser();
    if (user.data.user) {
      log.recorded_by = user.data.user.id;
    }
    
    const { data, error } = await this.supabase.client
      .from(this.TABLE)
      .insert([log])
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
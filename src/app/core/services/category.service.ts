import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Category } from '../../shared/models/category.model';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private readonly table = 'livestock_categories';

  constructor(private supabase: SupabaseService) {}

  async getAll(): Promise<Category[]> {
    const { data, error } = await this.supabase.client
      .from(this.table)
      .select('*')
      .order('name');
    if (error) throw error;
    return data || [];
  }

  async create(category: Partial<Category>): Promise<Category> {
    const { data, error } = await this.supabase.client
      .from(this.table)
      .insert(category)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async update(id: string, category: Partial<Category>): Promise<Category> {
    const { data, error } = await this.supabase.client
      .from(this.table)
      .update(category)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase.client
      .from(this.table)
      .delete()
      .eq('id', id);
    if (error) throw error;
  }
}

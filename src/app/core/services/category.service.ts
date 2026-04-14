import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Category } from '../../shared/models/category.model';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private readonly table = 'livestock_categories';
  private categoriesCache: Category[] | null = null; // Memory Cache

  constructor(private supabase: SupabaseService) {}

  async getAll(forceRefresh = false): Promise<Category[]> {
    if (this.categoriesCache && !forceRefresh) {
      return this.categoriesCache; // Return cached data instantly (0 network requests)
    }

    const { data, error } = await this.supabase.client
      .from(this.table)
      .select('*')
      .order('name');
    if (error) throw error;
    
    this.categoriesCache = data || [];
    return this.categoriesCache;
  }

  clearCache() {
    this.categoriesCache = null;
  }

  async create(category: Partial<Category>): Promise<Category> {
    const { data, error } = await this.supabase.client
      .from(this.table)
      .insert(category)
      .select()
      .single();
    if (error) throw error;
    this.clearCache(); // Invalidate cache so next read gets fresh data
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
    this.clearCache();
    return data;
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase.client
      .from(this.table)
      .delete()
      .eq('id', id);
    if (error) throw error;
    this.clearCache();
  }
}

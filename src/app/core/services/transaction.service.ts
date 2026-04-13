import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Transaction } from '../../shared/models/transaction.model';

@Injectable({ providedIn: 'root' })
export class TransactionService {
  private readonly table = 'transactions';

  constructor(private supabase: SupabaseService) {}

  async getAll(): Promise<Transaction[]> {
    const { data, error } = await this.supabase.client.from(this.table).select('*, livestock(*)');
    if (error) throw error;
    return data || [];
  }

  async create(transaction: Partial<Transaction>): Promise<Transaction> {
    const { data, error } = await this.supabase.client.from(this.table).insert(transaction).select().single();
    if (error) throw error;
    return data;
  }

  async getByType(type: string): Promise<Transaction[]> {
    const { data, error } = await this.supabase.client.from(this.table).select('*').eq('type', type);
    if (error) throw error;
    return data || [];
  }
}

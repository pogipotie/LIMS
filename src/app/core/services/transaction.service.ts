import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Transaction } from '../../shared/models/transaction.model';

@Injectable({ providedIn: 'root' })
export class TransactionService {
  private readonly table = 'transactions';

  constructor(private supabase: SupabaseService) {}

  async getAll(): Promise<Transaction[]> {
    const { data, error } = await this.supabase.client
      .from(this.table)
      .select('*, livestock(*)')
      .order('transaction_date', { ascending: false });
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

  async uploadDocument(file: File): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}_${new Date().getTime()}.${fileExt}`;
    const filePath = `transaction_docs/${fileName}`;

    const { error: uploadError } = await this.supabase.client.storage
      .from('documents')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = this.supabase.client.storage
      .from('documents')
      .getPublicUrl(filePath);

    return data.publicUrl;
  }

  async updateValidationStatus(id: string, status: 'approved' | 'rejected'): Promise<void> {
    const user = await this.supabase.client.auth.getUser();
    const userId = user.data.user?.id;

    const { error } = await this.supabase.client.from(this.table).update({
      validation_status: status,
      validated_by: userId,
      validation_date: new Date().toISOString()
    }).eq('id', id);

    if (error) throw error;
  }
}

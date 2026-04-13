export interface Transaction {
  id: string;
  livestock_id: string;
  type: 'birth' | 'purchase' | 'sale' | 'death' | 'transfer_in' | 'transfer_out';
  transaction_date: Date | string;
  amount?: number;
  notes?: string;
  validation_status?: 'pending' | 'approved' | 'rejected';
  document_url?: string;
  validated_by?: string;
  validation_date?: Date | string;
  livestock?: any; // To hold joined data
}

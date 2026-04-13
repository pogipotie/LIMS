export interface Transaction {
  id: string;
  livestock_id: string;
  type: 'birth' | 'purchase' | 'sale' | 'death' | 'transfer_in' | 'transfer_out';
  transaction_date: Date | string;
  amount?: number;
  notes?: string;
  livestock?: any; // To hold joined data
}

export interface Custodian {
  id: string;
  name: string;
  department?: string;
  contact_info?: string;
  status: 'active' | 'inactive';
  created_at?: Date;
}
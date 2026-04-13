export interface Livestock {
  id: string;
  tag_number?: string;
  name?: string;
  category: string;
  gender: 'male' | 'female';
  birth_date: string | Date;
  status: 'active' | 'deceased' | 'sold' | 'transferred_out';
  custodian_id?: string;
  custodian?: any; // Joined data
  created_at?: Date;
  updated_at?: Date;
}

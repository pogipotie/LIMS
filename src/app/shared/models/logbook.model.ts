export interface Logbook {
  id: string;
  livestock_id: string;
  log_date: Date | string;
  health_status: 'healthy' | 'sick' | 'injured' | 'under_observation';
  record_type?: 'Routine Check' | 'Vaccination' | 'Treatment' | 'Deworming' | 'Other';
  weight_kg?: number;
  treatment?: string;
  remarks?: string;
  recorded_by?: string;
  created_at?: Date;
  livestock?: any; // joined data
  recorder?: any; // joined user data
}
export interface Logbook {
  id: string;
  livestock_id: string;
  log_date: Date | string;
  health_status: 'healthy' | 'sick' | 'injured' | 'under_observation';
  remarks?: string;
  recorded_by?: string;
  created_at?: Date;
  livestock?: any; // joined data
  recorder?: any; // joined user data
}
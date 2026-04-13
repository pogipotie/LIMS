import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';

@Injectable({ providedIn: 'root' })
export class UserService {
  constructor(private supabase: SupabaseService) {}

  async getAllUsers(): Promise<any[]> {
    // We fetch from user_roles and join with auth.users (if possible, but Supabase restricts auth schema).
    // Instead, we'll fetch just the user_roles and we can see their IDs and Roles.
    // For a real production app, you'd use an Edge Function with Service Key to get emails.
    // For now, we will just fetch the roles we have.
    const { data, error } = await this.supabase.client
      .from('user_roles')
      .select('*');
    if (error) throw error;
    return data || [];
  }

  async createStaffUser(email: string, password: string): Promise<void> {
    // Call the custom Postgres function we created
    const { error } = await this.supabase.client.rpc('create_staff_user', {
      email: email,
      password: password
    });
    
    if (error) throw error;
  }

  async deleteUser(userId: string): Promise<void> {
    const { error } = await this.supabase.client.rpc('delete_user', {
      target_user_id: userId
    });
    if (error) throw error;
  }

  async updateUserRole(userId: string, newRole: string): Promise<void> {
    const { error } = await this.supabase.client.rpc('update_user_role', {
      target_user_id: userId,
      new_role: newRole
    });
    if (error) throw error;
  }
}
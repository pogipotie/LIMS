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
    // We are switching to the standard Supabase Auth API to avoid GoTrue schema corruption.
    // This will respect the "Confirm Email" setting in your Supabase Dashboard.
    const { data, error } = await this.supabase.client.auth.signUp({
      email: email,
      password: password,
    });
    
    if (error) {
      throw error;
    }

    // When the user signs up, the 004_rbac_schema.sql trigger will automatically
    // create a 'staff' role entry in public.user_roles for them!
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
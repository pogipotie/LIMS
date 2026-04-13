import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { environment } from '../../../environments/environment';
import { createClient } from '@supabase/supabase-js';

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

  async sendPasswordResetEmail(email: string): Promise<void> {
    const { error } = await this.supabase.client.auth.resetPasswordForEmail(email);
    if (error) throw error;
  }

  async verifyAndResetPassword(email: string, otp: string, newPassword: string): Promise<void> {
    // Create a temporary client that doesn't persist the session.
    // This ensures the admin's current session isn't overwritten when the OTP is verified.
    const tempClient = createClient(environment.supabaseUrl, environment.supabaseKey, {
      auth: { persistSession: false, autoRefreshToken: false }
    });

    // Verify the OTP the staff member received
    const { error: verifyError } = await tempClient.auth.verifyOtp({
      email,
      token: otp,
      type: 'recovery'
    });

    if (verifyError) throw verifyError;

    // Once verified, the tempClient is authenticated as the staff member.
    // We can now update their password.
    const { error: updateError } = await tempClient.auth.updateUser({
      password: newPassword
    });

    // Sign out the temp client just to be clean
    await tempClient.auth.signOut();

    if (updateError) throw updateError;
  }
}
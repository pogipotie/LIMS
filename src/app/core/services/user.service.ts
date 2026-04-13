import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { environment } from '../../../environments/environment';
import { createClient } from '@supabase/supabase-js';

@Injectable({ providedIn: 'root' })
export class UserService {
  constructor(private supabase: SupabaseService) {}

  async getAllUsers(): Promise<any[]> {
    // Attempt to use the new RPC that joins user_roles with auth.users to get email & confirmation status
    const { data, error } = await this.supabase.client.rpc('get_users_with_status');
    
    if (error) {
      console.warn('RPC get_users_with_status failed. Falling back to user_roles table.', error);
      // Fallback for older setups before the migration
      const { data: fallbackData, error: fallbackError } = await this.supabase.client
        .from('user_roles')
        .select('*');
      if (fallbackError) throw fallbackError;
      return fallbackData || [];
    }
    
    return data || [];
  }

  async createUserAccount(email: string, password: string, fullName: string, role: string): Promise<void> {
    const { data, error } = await this.supabase.client.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          full_name: fullName,
          role: role
        }
      }
    });
    
    if (error) {
      throw error;
    }
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

  async resendConfirmationEmail(email: string): Promise<void> {
    const { error } = await this.supabase.client.auth.resend({
      type: 'signup',
      email: email,
    });
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
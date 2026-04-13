import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentRole: 'admin' | 'staff' | 'custodian' | null = null;

  constructor(private supabaseService: SupabaseService, private router: Router) {
    this.initRole();
  }

  private async initRole() {
    const { data: { session } } = await this.session;
    if (session?.user) {
      await this.fetchRole(session.user.id);
    }
  }

  get session() {
    return this.supabaseService.client.auth.getSession();
  }

  async getUserRole(): Promise<'admin' | 'staff' | 'custodian'> {
    if (this.currentRole) return this.currentRole;
    
    const { data: { session } } = await this.session;
    if (!session?.user) return 'staff';

    return await this.fetchRole(session.user.id);
  }

  private async fetchRole(userId: string): Promise<'admin' | 'staff' | 'custodian'> {
    try {
      const { data, error } = await this.supabaseService.client
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .single();
        
      if (error || !data) {
        this.currentRole = 'staff'; // Default to staff if no role found
      } else {
        this.currentRole = data.role as 'admin' | 'staff' | 'custodian';
      }
    } catch (e) {
      this.currentRole = 'staff';
    }
    return this.currentRole;
  }

  async signIn(email: string, password: string) {
    const { data, error } = await this.supabaseService.client.auth.signInWithPassword({ email, password });
    if (error) throw error;
    if (data.user) {
      await this.fetchRole(data.user.id);
    }
    return data;
  }

  async signOut() {
    this.currentRole = null;
    await this.supabaseService.client.auth.signOut();
    this.router.navigate(['/auth/login']);
  }

  onAuthStateChange(callback: (event: any, session: any) => void) {
    return this.supabaseService.client.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        await this.fetchRole(session.user.id);
      } else {
        this.currentRole = null;
      }
      callback(event, session);
    });
  }
}

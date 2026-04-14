import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentRole: 'admin' | 'staff' | 'custodian' | null = null;
  public cachedSession: any = null;

  constructor(private supabaseService: SupabaseService, private router: Router) {
    this.initRole();
  }

  private async initRole() {
    const { data: { session } } = await this.session;
    this.cachedSession = session;
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
    window.location.href = '/auth/login'; // Force a full page reload to clear all states/caches
  }

  onAuthStateChange(callback: (event: any, session: any) => void) {
    return this.supabaseService.client.auth.onAuthStateChange((event, session) => {
      this.cachedSession = session;
      
      // SUPABASE BUG FIX: We must NOT 'await' database calls inside the onAuthStateChange hook!
      // Doing so locks the internal Supabase client and causes all future API calls to hang forever.
      // We use setTimeout(..., 0) to push the fetchRole call outside the current execution lock.
      if (session?.user) {
        setTimeout(() => {
          this.fetchRole(session.user.id).catch(console.error);
        }, 0);
      } else {
        this.currentRole = null;
      }
      
      // Fire the callback synchronously
      callback(event, session);
    });
  }
}

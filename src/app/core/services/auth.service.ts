import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private supabaseService: SupabaseService, private router: Router) {}

  get session() {
    return this.supabaseService.client.auth.getSession();
  }

  async signIn(email: string, password: string) {
    const { data, error } = await this.supabaseService.client.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  }

  async signOut() {
    await this.supabaseService.client.auth.signOut();
    this.router.navigate(['/auth/login']);
  }

  onAuthStateChange(callback: (event: any, session: any) => void) {
    return this.supabaseService.client.auth.onAuthStateChange(callback);
  }
}

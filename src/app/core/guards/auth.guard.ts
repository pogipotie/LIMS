import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  async canActivate(): Promise<boolean> {
    // 1. Use the fast, synchronous cached session first to prevent Supabase getSession() locks 
    // that happen during background token refreshes after being idle
    let session = this.authService.cachedSession;
    
    // 2. Fallback to async fetch only if cache is completely empty (e.g. hard refresh)
    if (!session) {
      const { data, error } = await this.authService.session;
      session = data?.session;
      
      if (error || !session) {
        this.router.navigate(['/auth/login']);
        return false;
      }
    }
    
    // 3. Check if session has expired
    const sessionExpiresAt = session?.expires_at;
    if (sessionExpiresAt) {
      const now = Math.floor(Date.now() / 1000);
      // Add a 60-second buffer to preemptively log out if it's about to expire
      if (now > sessionExpiresAt - 60) {
        console.warn('Session expired or about to expire. Redirecting to login.');
        await this.authService.signOut();
        return false;
      }
    }

    return true;
  }
}

import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  async canActivate(): Promise<boolean> {
    const { data: { session }, error } = await this.authService.session;
    
    if (error || !session) {
      this.router.navigate(['/auth/login']);
      return false;
    }
    
    // Check if session has expired
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

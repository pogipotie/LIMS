import { Component, OnInit, OnDestroy } from '@angular/core';

import { RouterOutlet, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { SidebarComponent } from './shared/components/sidebar/sidebar.component';
import { MatSidenavModule } from '@angular/material/sidenav';
import { AuthService } from './core/services/auth.service';
import { ThemeService } from './core/services/theme.service';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent, SidebarComponent, MatSidenavModule],
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class App implements OnInit, OnDestroy {
  title = 'LIMS';
  isLoggedIn = false;
  sidebarCollapsed = false;
  isMobile = false;
  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private themeService: ThemeService, // Injected to initialize theme on startup
    private breakpointObserver: BreakpointObserver,
    private router: Router
  ) {}

  async ngOnInit() {
    const { data: { session } } = await this.authService.session;
    this.isLoggedIn = !!session;

    this.authService.onAuthStateChange(async (event, session) => {
      this.isLoggedIn = !!session;
      
      // Force redirect to login if session expires while they are staring at the dashboard
      if (event === 'TOKEN_REFRESHED' && !session) {
         this.router.navigate(['/auth/login']);
      } else if (event === 'SIGNED_OUT') {
         this.router.navigate(['/auth/login']);
      }
    });

    this.breakpointObserver
      .observe([Breakpoints.Handset, Breakpoints.Tablet])
      .pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        this.isMobile = result.matches;
        if (this.isMobile) {
          this.sidebarCollapsed = false; // Disable collapsed mode on mobile
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggleSidebar(sidenav: any) {
    if (this.isMobile) {
      sidenav.toggle();
    } else {
      this.sidebarCollapsed = !this.sidebarCollapsed;
    }
  }
}

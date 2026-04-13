import { Component, OnInit } from '@angular/core';

import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { SidebarComponent } from './shared/components/sidebar/sidebar.component';
import { MatSidenavModule } from '@angular/material/sidenav';
import { AuthService } from './core/services/auth.service';
import { ThemeService } from './core/services/theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent, SidebarComponent, MatSidenavModule],
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class App implements OnInit {
  title = 'LIMS';
  isLoggedIn = false;
  sidebarCollapsed = false;

  constructor(
    private authService: AuthService,
    private themeService: ThemeService // Injected to initialize theme on startup
  ) {}

  async ngOnInit() {
    const { data: { session } } = await this.authService.session;
    this.isLoggedIn = !!session;

    this.authService.onAuthStateChange((_event, session) => {
      this.isLoggedIn = !!session;
    });
  }

  toggleSidebar() {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }
}

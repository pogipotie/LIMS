import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatSelectModule } from '@angular/material/select';
import { ThemeService, AppTheme } from '../../core/services/theme.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule, MatCardModule, MatFormFieldModule,
    MatIconModule, MatDividerModule, MatSelectModule
  ],
  template: `
    <div class="page-container">
      <div class="welcome-header">
        <div>
          <h1 class="mat-display-1" style="margin:0; font-weight: 600; color: var(--primary-color, #3f51b5);">Global Settings</h1>
          <p class="text-muted">Manage global configuration, theming, and system preferences.</p>
        </div>
      </div>

      <div class="settings-grid">
        
        <!-- Global App Settings (Theme) -->
        <mat-card class="settings-card">
          <mat-card-header class="custom-card-header">
            <div mat-card-avatar class="header-icon"><mat-icon>palette</mat-icon></div>
            <mat-card-title>Application Theme</mat-card-title>
          </mat-card-header>
          <mat-divider></mat-divider>
          
          <mat-card-content class="settings-content">
            <p class="settings-desc">Choose a global color theme for the LIMS dashboard and components.</p>
            
            <mat-form-field appearance="outline" class="full-width theme-selector">
              <mat-label>Select Theme</mat-label>
              <mat-select [value]="currentTheme" (selectionChange)="changeTheme($event.value)">
                <mat-option *ngFor="let theme of availableThemes" [value]="theme.value">
                  <div class="theme-option">
                    <div class="theme-color-dot" [style.background-color]="theme.color"></div>
                    {{ theme.label }}
                  </div>
                </mat-option>
              </mat-select>
            </mat-form-field>
          </mat-card-content>
        </mat-card>

        <!-- Spacer for future settings -->
        <div style="width: 100%;"></div>

      </div>
    </div>
  `,
  styles: [`
    .page-container { padding: 24px; max-width: 1400px; margin: 0 auto; background-color: #f8f9fa; min-height: calc(100vh - 64px); }
    .welcome-header { margin-bottom: 32px; }
    .text-muted { color: #7f8c8d; margin-top: 8px; font-size: 1.1rem; }
    
    .settings-grid { display: grid; grid-template-columns: 1fr 2fr; gap: 24px; margin-bottom: 24px; }
    @media (max-width: 960px) { .settings-grid { grid-template-columns: 1fr; } }
    
    .settings-card { border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.04) !important; overflow: hidden; }
    .custom-card-header { padding: 20px; align-items: center; background-color: white; }
    .header-icon { display: flex; justify-content: center; align-items: center; background-color: rgba(var(--primary-color-rgb, 63, 81, 181), 0.1); border-radius: 50%; color: var(--primary-color); margin-right: 16px; }
    
    .settings-content { padding: 24px !important; }
    .settings-desc { color: #7f8c8d; margin-bottom: 20px; font-size: 1rem; }
    .theme-selector { margin-bottom: -1.25em; }
    .full-width { width: 100%; }
    
    .theme-option { display: flex; align-items: center; gap: 12px; }
    .theme-color-dot { width: 16px; height: 16px; border-radius: 50%; box-shadow: 0 2px 4px rgba(0,0,0,0.2); }
  `]
})
export class SettingsComponent {
  availableThemes: any[] = [];
  currentTheme: AppTheme = 'indigo-pink';

  constructor(private themeService: ThemeService) {
    this.availableThemes = this.themeService.availableThemes;
    this.currentTheme = this.themeService.currentTheme();
  }

  changeTheme(theme: AppTheme) {
    this.themeService.setTheme(theme);
    this.currentTheme = theme;
  }
}
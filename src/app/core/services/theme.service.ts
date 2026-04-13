import { Injectable, signal } from '@angular/core';

export type AppTheme = 'indigo-pink' | 'deeppurple-amber' | 'pink-bluegrey' | 'purple-green';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly THEME_KEY = 'lims_theme';
  
  // Available themes to choose from
  readonly availableThemes = [
    { value: 'indigo-pink', label: 'Indigo & Pink (Default)', color: '#3f51b5' },
    { value: 'deeppurple-amber', label: 'Deep Purple & Amber', color: '#673ab7' },
    { value: 'pink-bluegrey', label: 'Pink & Blue-Grey', color: '#e91e63' },
    { value: 'purple-green', label: 'Purple & Green', color: '#9c27b0' }
  ];

  // Signal holding the current theme string
  currentTheme = signal<AppTheme>('indigo-pink');

  constructor() {
    this.loadTheme();
  }

  private loadTheme() {
    const savedTheme = localStorage.getItem(this.THEME_KEY) as AppTheme;
    if (savedTheme && this.availableThemes.find(t => t.value === savedTheme)) {
      this.setTheme(savedTheme);
    } else {
      this.setTheme('indigo-pink'); // Default
    }
  }

  setTheme(themeName: AppTheme) {
    this.currentTheme.set(themeName);
    localStorage.setItem(this.THEME_KEY, themeName);
    
    // Remove all old theme classes
    const classList = document.body.classList;
    this.availableThemes.forEach(theme => {
      classList.remove(`${theme.value}-theme`);
    });
    
    // Add new theme class to body
    classList.add(`${themeName}-theme`);
  }
}
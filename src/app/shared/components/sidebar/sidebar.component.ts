import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, MatListModule, RouterModule, MatDividerModule, MatIconModule, MatTooltipModule],
  template: `
    <div class="sidebar-wrapper">
      <mat-nav-list [class.collapsed]="isCollapsed">
        <a mat-list-item routerLink="/dashboard" routerLinkActive="active-link" [matTooltip]="isCollapsed ? 'Dashboard' : ''" matTooltipPosition="right">
          <mat-icon matListItemIcon>dashboard</mat-icon>
          <span matListItemTitle *ngIf="!isCollapsed">Dashboard</span>
        </a>
        <a mat-list-item routerLink="/livestock" routerLinkActive="active-link" [matTooltip]="isCollapsed ? 'Livestock' : ''" matTooltipPosition="right">
          <mat-icon matListItemIcon>pets</mat-icon>
          <span matListItemTitle *ngIf="!isCollapsed">Livestock</span>
        </a>
        <a mat-list-item routerLink="/transactions" routerLinkActive="active-link" [matTooltip]="isCollapsed ? 'Transactions' : ''" matTooltipPosition="right">
          <mat-icon matListItemIcon>receipt_long</mat-icon>
          <span matListItemTitle *ngIf="!isCollapsed">Transactions</span>
        </a>
        <a mat-list-item routerLink="/inventory" routerLinkActive="active-link" [matTooltip]="isCollapsed ? 'Inventory' : ''" matTooltipPosition="right">
          <mat-icon matListItemIcon>inventory_2</mat-icon>
          <span matListItemTitle *ngIf="!isCollapsed">Inventory</span>
        </a>
        <a mat-list-item routerLink="/reports" routerLinkActive="active-link" [matTooltip]="isCollapsed ? 'Reports' : ''" matTooltipPosition="right">
          <mat-icon matListItemIcon>analytics</mat-icon>
          <span matListItemTitle *ngIf="!isCollapsed">Reports</span>
        </a>
        <a mat-list-item routerLink="/data-management" routerLinkActive="active-link" [matTooltip]="isCollapsed ? 'Data Management' : ''" matTooltipPosition="right">
          <mat-icon matListItemIcon>storage</mat-icon>
          <span matListItemTitle *ngIf="!isCollapsed">Data Management</span>
        </a>
        
        <mat-divider></mat-divider>
        <div class="sidebar-subheader" *ngIf="!isCollapsed">System</div>
        
        <a mat-list-item routerLink="/categories" routerLinkActive="active-link" [matTooltip]="isCollapsed ? 'Manage Categories' : ''" matTooltipPosition="right">
          <mat-icon matListItemIcon>category</mat-icon>
          <span matListItemTitle *ngIf="!isCollapsed">Manage Categories</span>
        </a>
        <a mat-list-item routerLink="/settings" routerLinkActive="active-link" [matTooltip]="isCollapsed ? 'Global Settings' : ''" matTooltipPosition="right">
          <mat-icon matListItemIcon>settings</mat-icon>
          <span matListItemTitle *ngIf="!isCollapsed">Global Settings</span>
        </a>
      </mat-nav-list>

      <div class="sidebar-footer" [class.collapsed]="isCollapsed">
        <mat-divider></mat-divider>
        <mat-nav-list>
          <a mat-list-item (click)="logout()" class="logout-btn" [matTooltip]="isCollapsed ? 'Logout' : ''" matTooltipPosition="right">
            <mat-icon matListItemIcon color="warn">logout</mat-icon>
            <span matListItemTitle *ngIf="!isCollapsed" class="logout-text">Logout</span>
          </a>
        </mat-nav-list>
      </div>
    </div>
  `,
  styles: [`
    .sidebar-wrapper {
      display: flex;
      flex-direction: column;
      height: 100%;
      justify-content: space-between;
    }
    
    mat-nav-list { 
      padding-top: 8px; 
    }
    
    /* Styling for the list items */
    a[mat-list-item] { 
      margin: 4px 8px;
      border-radius: 8px;
      transition: all 0.2s ease-in-out;
      color: #34495e;
    }
    
    a[mat-list-item]:hover { 
      background-color: rgba(0,0,0,0.04); 
    }
    
    /* Active Link Styling */
    .active-link {
      background-color: rgba(var(--primary-color-rgb, 63, 81, 181), 0.1) !important;
      color: var(--primary-color) !important;
      font-weight: 500;
    }
    .active-link mat-icon {
      color: var(--primary-color) !important;
    }
    
    .sidebar-subheader {
      padding: 16px 16px 8px 24px;
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #95a5a6;
      font-weight: 600;
    }
    
    mat-divider { margin: 8px 0; }
    
    /* Collapsed State Overrides */
    .collapsed a[mat-list-item] {
      padding: 0;
      margin: 8px auto;
      width: 48px;
      height: 48px;
      border-radius: 0; /* Removed circle */
      display: flex;
      justify-content: center;
      align-items: center;
      background-color: transparent !important;
      border-bottom: 3px solid transparent; /* Invisible line by default */
      transition: border-color 0.2s ease-in-out;
    }

    .collapsed a[mat-list-item]:hover {
      background-color: transparent !important;
      border-bottom: 3px solid rgba(0,0,0,0.15) !important; /* Grey underline on hover */
    }

    .collapsed a[mat-list-item].active-link {
      background-color: transparent !important;
      border-bottom: 3px solid var(--primary-color) !important; /* Colored underline for active */
    }
    
    /* Center the icon perfectly */
    .collapsed ::ng-deep .mdc-list-item__content {
      display: flex !important;
      justify-content: center !important;
      align-items: center !important;
      padding: 0 !important;
      margin: 0 !important;
      width: 100% !important;
      height: 100% !important;
    }
    
    .collapsed ::ng-deep .mat-mdc-list-item-icon {
      margin: 0 !important;
      padding: 0 !important;
      display: flex !important;
      justify-content: center !important;
      align-items: center !important;
      width: 24px !important;
      height: 24px !important;
    }
    
    .collapsed mat-icon {
      margin: 0 !important;
      display: block !important;
      width: 24px !important;
      height: 24px !important;
    }
    
    /* Logout styling */
    .logout-btn { cursor: pointer; }
    .logout-text { color: #c62828; font-weight: 500; }
    .logout-btn:hover { background-color: rgba(244, 67, 54, 0.08) !important; }
  `]
})
export class SidebarComponent {
  @Input() isCollapsed = false;

  constructor(private authService: AuthService) {}

  async logout() {
    await this.authService.signOut();
  }
}

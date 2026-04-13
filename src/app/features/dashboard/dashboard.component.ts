import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { LivestockService } from '../../core/services/livestock.service';
import { TransactionService } from '../../core/services/transaction.service';
import { LogbookService } from '../../core/services/logbook.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, MatCardModule, MatIconModule, MatButtonModule, MatDividerModule],
  template: `
    <div class="dashboard-container">
      <div class="welcome-header">
        <div>
          <h1 class="mat-display-1" style="margin:0; font-weight: 600; color: #2c3e50;">Dashboard Overview</h1>
          <p class="text-muted">{{ isCustodian ? 'Here is what\\'s happening with your assigned herd.' : 'Here is what\\'s happening with your livestock today.' }}</p>
        </div>
        <div class="header-actions" *ngIf="!isCustodian">
          <button mat-flat-button color="primary" routerLink="/transactions/add" class="add-btn">
            <mat-icon>add</mat-icon> Record Transaction
          </button>
        </div>
      </div>
      
      <div class="stats-grid">
        <!-- Active Livestock -->
        <mat-card class="stat-card">
          <div class="stat-icon-wrapper bg-primary-light">
            <mat-icon color="primary">pets</mat-icon>
          </div>
          <div class="stat-content">
            <p class="stat-title">{{ isCustodian ? 'Assigned Livestock' : 'Active Livestock' }}</p>
            <h2 class="stat-value">{{ totalActiveLivestock }}</h2>
          </div>
        </mat-card>

        <!-- Admin/Staff Stats -->
        <ng-container *ngIf="!isCustodian">
          <!-- Total Transactions -->
          <mat-card class="stat-card">
            <div class="stat-icon-wrapper bg-accent-light">
              <mat-icon color="accent">receipt_long</mat-icon>
            </div>
            <div class="stat-content">
              <p class="stat-title">Total Transactions</p>
              <h2 class="stat-value">{{ totalTransactions }}</h2>
            </div>
          </mat-card>

          <!-- Total Deceased -->
          <mat-card class="stat-card">
            <div class="stat-icon-wrapper bg-warn-light">
              <mat-icon color="warn">warning</mat-icon>
            </div>
            <div class="stat-content">
              <p class="stat-title">Total Deceased</p>
              <h2 class="stat-value">{{ totalDeceased }}</h2>
            </div>
          </mat-card>
          
          <!-- Monthly Additions -->
          <mat-card class="stat-card">
            <div class="stat-icon-wrapper bg-success-light">
              <mat-icon class="text-success">trending_up</mat-icon>
            </div>
            <div class="stat-content">
              <p class="stat-title">Additions This Month</p>
              <h2 class="stat-value">{{ monthlyAdditions }}</h2>
            </div>
          </mat-card>
        </ng-container>

        <!-- Custodian Stats -->
        <ng-container *ngIf="isCustodian">
          <!-- Sick/Injured Animals -->
          <mat-card class="stat-card">
            <div class="stat-icon-wrapper bg-warn-light">
              <mat-icon color="warn">healing</mat-icon>
            </div>
            <div class="stat-content">
              <p class="stat-title">Health Alerts</p>
              <h2 class="stat-value" [style.color]="sickLivestock > 0 ? '#c62828' : ''">{{ sickLivestock }}</h2>
            </div>
          </mat-card>

          <!-- Logbooks This Week -->
          <mat-card class="stat-card">
            <div class="stat-icon-wrapper bg-success-light">
              <mat-icon class="text-success">book</mat-icon>
            </div>
            <div class="stat-content">
              <p class="stat-title">Logs This Week</p>
              <h2 class="stat-value">{{ weeklyLogs }}</h2>
            </div>
          </mat-card>
        </ng-container>
      </div>

      <!-- Compliance Alerts (Admin Only) -->
      <div *ngIf="!isCustodian && pendingMortalities > 0" class="alert-banner">
        <mat-icon color="warn">warning_amber</mat-icon>
        <div class="alert-content">
          <strong>Attention required:</strong> There are {{pendingMortalities}} mortality reports pending validation or missing document attachments that are over 3 days old.
        </div>
        <button mat-flat-button color="warn" routerLink="/transactions">Review Now</button>
      </div>

      <div class="main-content-grid">
        <!-- Recent Activity -->
        <mat-card class="activity-card">
          <mat-card-header class="custom-card-header">
            <div mat-card-avatar class="header-icon"><mat-icon>history</mat-icon></div>
            <mat-card-title>{{ isCustodian ? 'Recent Health Logs' : 'Recent Activity' }}</mat-card-title>
            <mat-card-subtitle>{{ isCustodian ? 'Latest medical entries for your herd' : 'Latest transactions across your farm' }}</mat-card-subtitle>
          </mat-card-header>
          <mat-divider></mat-divider>
          <mat-card-content>
            <div *ngIf="recentActivity.length === 0" class="empty-state">
              <mat-icon>history_toggle_off</mat-icon>
              <p>No recent activity to show.</p>
            </div>
            
            <div class="timeline" *ngIf="recentActivity.length > 0">
              <div class="timeline-item" *ngFor="let t of recentActivity">
                <div class="timeline-icon" [ngClass]="isCustodian ? t.health_status : t.type">
                  <mat-icon>{{ isCustodian ? getLogbookIcon(t.record_type) : getTransactionIcon(t.type) }}</mat-icon>
                </div>
                <div class="timeline-content">
                  <div class="timeline-header">
                    <strong class="timeline-title">{{ isCustodian ? (t.record_type || 'Routine Check') : (t.type || '').replace('_', ' ') | uppercase }}</strong>
                    <span class="timeline-date">{{ (isCustodian ? t.log_date : t.transaction_date) | date:'MMM d, y, h:mm a':'+0800' }}</span>
                  </div>
                  <p class="timeline-body">
                    Livestock: <strong>{{ t.livestock?.tag_number || 'N/A' }}</strong> ({{ t.livestock?.category }})
                    <span *ngIf="!isCustodian && t.amount"> &bull; <span class="amount-text">{{ t.amount | currency }}</span></span>
                    <span *ngIf="isCustodian && t.weight_kg"> &bull; <span class="amount-text">{{ t.weight_kg }} kg</span></span>
                  </p>
                  <p class="timeline-notes" *ngIf="isCustodian && t.treatment"><mat-icon inline style="font-size: 14px; width: 14px; height: 14px;">medical_services</mat-icon> <strong>Treatment:</strong> {{ t.treatment }}</p>
                  <p class="timeline-notes" *ngIf="!isCustodian && t.notes"><mat-icon inline>notes</mat-icon> {{ t.notes }}</p>
                  <p class="timeline-notes" *ngIf="isCustodian && t.remarks"><mat-icon inline>notes</mat-icon> {{ t.remarks }}</p>
                </div>
              </div>
            </div>
          </mat-card-content>
          <mat-divider></mat-divider>
          <mat-card-actions align="end" class="card-actions">
            <button mat-button color="primary" [routerLink]="isCustodian ? '/logbooks' : '/transactions'">View All {{ isCustodian ? 'Logs' : 'Transactions' }}</button>
          </mat-card-actions>
        </mat-card>

        <!-- Quick Links -->
        <div class="side-panel">
          <mat-card class="quick-links-card">
            <mat-card-header class="custom-card-header">
              <div mat-card-avatar class="header-icon"><mat-icon>bolt</mat-icon></div>
              <mat-card-title>Quick Actions</mat-card-title>
            </mat-card-header>
            <mat-divider></mat-divider>
            <mat-card-content class="quick-links-content">
              <button *ngIf="!isCustodian" mat-stroked-button color="primary" class="full-width-btn" routerLink="/livestock/add">
                <mat-icon>add_circle_outline</mat-icon> Add New Livestock
              </button>
              <button *ngIf="isCustodian" mat-stroked-button color="primary" class="full-width-btn" routerLink="/logbooks">
                <mat-icon>post_add</mat-icon> Create Health Log
              </button>
              <button *ngIf="!isCustodian" mat-stroked-button color="accent" class="full-width-btn" routerLink="/inventory">
                <mat-icon>inventory_2</mat-icon> View Inventory Summary
              </button>
              <button mat-stroked-button class="full-width-btn text-success" routerLink="/reports">
                <mat-icon>picture_as_pdf</mat-icon> Generate {{ isCustodian ? 'Weekly' : 'Monthly' }} Report
              </button>
            </mat-card-content>
          </mat-card>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container { padding: 24px; max-width: 1400px; margin: 0 auto; background-color: #f8f9fa; min-height: calc(100vh - 64px); }
    .welcome-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; }
    .text-muted { color: #7f8c8d; margin-top: 8px; font-size: 1.1rem; }
    .add-btn { padding: 8px 24px; font-size: 1.1rem; border-radius: 8px; }
    
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 24px; margin-bottom: 32px; }
    .stat-card { display: flex; flex-direction: row; align-items: center; padding: 24px; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.04) !important; transition: transform 0.2s; }
    .stat-card:hover { transform: translateY(-5px); box-shadow: 0 8px 25px rgba(0,0,0,0.08) !important; }
    
    .stat-icon-wrapper { width: 64px; height: 64px; border-radius: 50%; display: flex; justify-content: center; align-items: center; margin-right: 20px; }
    .stat-icon-wrapper mat-icon { transform: scale(1.5); }
    .bg-primary-light { background-color: rgba(var(--primary-color-rgb, 63, 81, 181), 0.1); }
    .bg-accent-light { background-color: rgba(255, 64, 129, 0.1); }
    .bg-warn-light { background-color: rgba(244, 67, 54, 0.1); }
    .bg-success-light { background-color: rgba(76, 175, 80, 0.1); }
    .text-success { color: #4caf50; }
    
    .stat-content { display: flex; flex-direction: column; }
    .stat-title { margin: 0; color: #7f8c8d; font-size: 0.9rem; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px; }
    .stat-value { margin: 4px 0 0 0; font-size: 2.2rem; font-weight: 700; color: #2c3e50; line-height: 1; }
    
    .main-content-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 24px; }
    @media (max-width: 960px) { .main-content-grid { grid-template-columns: 1fr; } }
    
    .activity-card, .quick-links-card { border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.04) !important; }
    .custom-card-header { padding: 20px; align-items: center; }
    .header-icon { display: flex; justify-content: center; align-items: center; background-color: #ecf0f1; border-radius: 50%; color: #7f8c8d; }
    .card-actions { padding: 12px 24px; }
    
    /* Timeline Styles */
    .timeline { margin-top: 24px; padding-left: 10px; }
    .timeline-item { display: flex; margin-bottom: 24px; position: relative; }
    .timeline-item::before { content: ''; position: absolute; left: 19px; top: 40px; bottom: -24px; width: 2px; background-color: #e0e0e0; }
    .timeline-item:last-child::before { display: none; }
    
    .timeline-icon { width: 40px; height: 40px; border-radius: 50%; display: flex; justify-content: center; align-items: center; z-index: 1; margin-right: 20px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
    .timeline-icon mat-icon { font-size: 20px; width: 20px; height: 20px; }
    .timeline-icon.birth, .timeline-icon.purchase, .timeline-icon.transfer_in { background-color: #4caf50; color: white; }
    .timeline-icon.death, .timeline-icon.sale, .timeline-icon.transfer_out { background-color: #f44336; color: white; }
    .timeline-icon.healthy { background-color: #4caf50; color: white; }
    .timeline-icon.sick, .timeline-icon.injured { background-color: #f44336; color: white; }
    .timeline-icon.under_observation { background-color: #ff9800; color: white; }
    
    .timeline-content { flex: 1; background: white; border: 1px solid #f0f0f0; padding: 16px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.02); transition: background-color 0.2s; }
    .timeline-content:hover { background-color: #fafafa; }
    .timeline-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
    .timeline-title { font-size: 1.1rem; color: #2c3e50; }
    .timeline-date { color: #95a5a6; font-size: 0.85rem; font-weight: 500; }
    .timeline-body { margin: 0; color: #34495e; font-size: 0.95rem; }
    .amount-text { color: #27ae60; font-weight: 600; }
    .timeline-notes { margin: 8px 0 0 0; font-size: 0.85rem; color: #7f8c8d; display: flex; align-items: center; gap: 4px; font-style: italic; }
    
    .empty-state { padding: 40px; text-align: center; color: #95a5a6; }
    .empty-state mat-icon { font-size: 48px; width: 48px; height: 48px; margin-bottom: 16px; opacity: 0.5; }
    
    /* Quick Links */
    .quick-links-content { padding: 24px; }
    .full-width-btn { width: 100%; margin-bottom: 16px; padding: 8px 16px; display: flex; justify-content: flex-start; text-align: left; border-radius: 8px; }
    .full-width-btn:last-child { margin-bottom: 0; }
    .full-width-btn mat-icon { margin-right: 12px; }

    /* Alerts */
    .alert-banner { background-color: #fff3e0; border-left: 4px solid #ff9800; padding: 16px 24px; display: flex; align-items: center; border-radius: 8px; margin-bottom: 24px; gap: 16px; box-shadow: 0 4px 10px rgba(255, 152, 0, 0.1); }
    .alert-content { flex: 1; color: #e65100; font-size: 1rem; }
    .alert-content strong { font-weight: 600; }

    @media (max-width: 600px) {
      .dashboard-container { padding: 16px; }
      .welcome-header { flex-direction: column; align-items: flex-start; gap: 16px; }
      .header-actions { width: 100%; }
      .add-btn { width: 100%; display: flex; justify-content: center; align-items: center; }
      .stats-grid { grid-template-columns: 1fr; gap: 16px; }
      .timeline-header { flex-direction: column; align-items: flex-start; }
      .timeline-item::before { left: 19px; }
    }
  `]
})
export class DashboardComponent implements OnInit {
  totalActiveLivestock = 0;
  totalTransactions = 0;
  totalDeceased = 0;
  monthlyAdditions = 0;
  recentActivity: any[] = [];
  pendingMortalities = 0;
  
  isCustodian = false;
  sickLivestock = 0;
  weeklyLogs = 0;

  constructor(
    private livestockService: LivestockService,
    private transactionService: TransactionService,
    private logbookService: LogbookService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    try {
      const role = await this.authService.getUserRole();
      this.isCustodian = role === 'custodian';

      if (this.isCustodian) {
        const [livestock, logbooks] = await Promise.all([
          this.livestockService.getAll(),
          this.logbookService.getAll()
        ]);
        
        this.totalActiveLivestock = livestock.filter(l => l.status === 'active').length;
        
        // Filter sick livestock
        const activeLivestockIds = livestock.filter(l => l.status === 'active').map(l => l.id);
        const recentLogs = logbooks.filter(l => activeLivestockIds.includes(l.livestock_id));
        
        // Find animals currently marked as sick or injured
        const sickIds = new Set(recentLogs.filter(l => l.health_status === 'sick' || l.health_status === 'injured').map(l => l.livestock_id));
        this.sickLivestock = sickIds.size;
        
        // Weekly logs
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        this.weeklyLogs = logbooks.filter(l => new Date(l.log_date) >= oneWeekAgo).length;
        
        this.recentActivity = logbooks
          .sort((a, b) => new Date(b.log_date).getTime() - new Date(a.log_date).getTime())
          .slice(0, 5);

      } else {
        // Fetch data concurrently for faster dashboard loading
        const [livestock, transactions] = await Promise.all([
          this.livestockService.getAll(),
          this.transactionService.getAll()
        ]);
        
        this.totalActiveLivestock = livestock.filter(l => l.status === 'active').length;
        this.totalDeceased = livestock.filter(l => l.status === 'deceased').length;

        this.totalTransactions = transactions.length;
        
        // Check for pending mortalities > 3 days old
        const threeDaysAgo = new Date();
        threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
        
        this.pendingMortalities = transactions.filter(t => 
          t.type === 'death' && 
          (t.validation_status === 'pending' || !t.document_url) &&
          new Date(t.transaction_date) <= threeDaysAgo
        ).length;

        // Calculate additions this month (births, purchases, transfer_in)
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        this.monthlyAdditions = transactions.filter(t => {
          const tDate = new Date(t.transaction_date);
          const isAddition = ['birth', 'purchase', 'transfer_in'].includes(t.type);
          return isAddition && tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear;
        }).length;
        
        // Sort by date descending and grab the top 5
        this.recentActivity = transactions
          .sort((a, b) => new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime())
          .slice(0, 5);
      }

      this.cdr.detectChanges();
    } catch (e) {
      console.error('Error loading dashboard stats', e);
    }
  }
  
  getTransactionIcon(type: string): string {
    switch(type) {
      case 'birth': return 'child_care';
      case 'purchase': return 'shopping_cart';
      case 'sale': return 'payments';
      case 'death': return 'warning';
      case 'transfer_in': return 'arrow_downward';
      case 'transfer_out': return 'arrow_upward';
      default: return 'receipt_long';
    }
  }

  getLogbookIcon(type: string): string {
    switch(type) {
      case 'Vaccination': return 'vaccines';
      case 'Treatment': return 'medical_services';
      case 'Deworming': return 'medication';
      default: return 'fact_check';
    }
  }
}

import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { InventoryService } from '../../../../core/services/inventory.service';

@Component({
  selector: 'app-inventory-summary',
  standalone: true,
  imports: [CommonModule, RouterModule, MatCardModule, MatIconModule, MatButtonModule, MatDividerModule, MatProgressSpinnerModule],
  template: `
    <div class="page-container">
      <div class="welcome-header">
        <div>
          <h1 class="mat-display-1" style="margin:0; font-weight: 600; color: #2c3e50;">Inventory Summary</h1>
          <p class="text-muted">Real-time breakdown of your livestock additions and deductions.</p>
        </div>
        <div class="header-actions">
          <button mat-stroked-button color="primary" routerLink="/reports" class="add-btn">
            <mat-icon>picture_as_pdf</mat-icon> Generate Report
          </button>
        </div>
      </div>

      <div *ngIf="loading" class="spinner-container">
        <mat-spinner diameter="40"></mat-spinner>
      </div>

      <div class="content-grid" *ngIf="!loading && inventoryData">
        
        <!-- Left Column: The Formula Breakdown -->
        <div class="formula-column">
          <mat-card class="breakdown-card">
            <mat-card-header class="custom-card-header">
              <div mat-card-avatar class="header-icon"><mat-icon>calculate</mat-icon></div>
              <mat-card-title>Inventory Calculation</mat-card-title>
            </mat-card-header>
            <mat-divider></mat-divider>
            
            <mat-card-content class="formula-content">
              
              <!-- Beginning -->
              <div class="formula-row neutral">
                <div class="formula-label">
                  <mat-icon>play_circle_outline</mat-icon> Beginning Inventory
                </div>
                <div class="formula-value">{{ inventoryData.beginningInventory }}</div>
              </div>
              
              <div class="formula-section-title text-success">Additions (+)</div>
              <div class="formula-row addition">
                <div class="formula-label">Births</div>
                <div class="formula-value">{{ inventoryData.births }}</div>
              </div>
              <div class="formula-row addition">
                <div class="formula-label">Purchases</div>
                <div class="formula-value">{{ inventoryData.purchases }}</div>
              </div>
              <div class="formula-row addition">
                <div class="formula-label">Transfers In</div>
                <div class="formula-value">{{ inventoryData.transfersIn }}</div>
              </div>

              <div class="formula-section-title text-danger">Deductions (-)</div>
              <div class="formula-row deduction">
                <div class="formula-label">Sales</div>
                <div class="formula-value">{{ inventoryData.sales }}</div>
              </div>
              <div class="formula-row deduction">
                <div class="formula-label">Deaths</div>
                <div class="formula-value">{{ inventoryData.deaths }}</div>
              </div>
              <div class="formula-row deduction">
                <div class="formula-label">Transfers Out</div>
                <div class="formula-value">{{ inventoryData.transfersOut }}</div>
              </div>

            </mat-card-content>
          </mat-card>
        </div>

        <!-- Right Column: The Grand Total -->
        <div class="total-column">
          <mat-card class="total-card">
            <div class="total-content">
              <mat-icon class="total-icon">inventory_2</mat-icon>
              <h3>Calculated Ending Inventory</h3>
              <h1 class="total-number">{{ inventoryData.endingInventory }}</h1>
              <p class="total-subtitle">Total active animals across the farm</p>
            </div>
          </mat-card>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .page-container { padding: 24px; max-width: 1400px; margin: 0 auto; background-color: #f8f9fa; min-height: calc(100vh - 64px); }
    .welcome-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; }
    .text-muted { color: #7f8c8d; margin-top: 8px; font-size: 1.1rem; }
    .add-btn { padding: 8px 24px; font-size: 1.1rem; border-radius: 8px; height: auto; min-height: 48px; display: inline-flex; justify-content: center; align-items: center; }
    
    .spinner-container { display: flex; justify-content: center; margin-top: 100px; }

    .content-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 24px; }
    @media (max-width: 960px) { .content-grid { grid-template-columns: 1fr; } }
    
    .breakdown-card { border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.04) !important; }
    .custom-card-header { padding: 20px; align-items: center; }
    .header-icon { display: flex; justify-content: center; align-items: center; background-color: #ecf0f1; border-radius: 50%; color: #7f8c8d; }
    
    .formula-content { padding: 0 !important; }
    .formula-section-title { padding: 16px 24px 8px 24px; font-weight: 600; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 1px; background: #fafafa; border-top: 1px solid #f0f0f0; border-bottom: 1px solid #f0f0f0;}
    .text-success { color: #2e7d32; }
    .text-danger { color: #c62828; }
    
    .formula-row { display: flex; justify-content: space-between; align-items: center; padding: 16px 24px; border-bottom: 1px solid #f5f5f5; transition: background-color 0.2s; }
    .formula-row:hover { background-color: #fcfcfc; }
    .formula-row:last-child { border-bottom: none; }
    .formula-label { display: flex; align-items: center; gap: 8px; font-size: 1.05rem; color: #34495e; }
    .formula-label mat-icon { font-size: 20px; width: 20px; height: 20px; color: #95a5a6; }
    .formula-value { font-size: 1.2rem; font-weight: 600; font-family: monospace; }
    
    .formula-row.addition .formula-value { color: #2e7d32; }
    .formula-row.addition .formula-value::before { content: '+ '; opacity: 0.5; font-weight: normal; }
    
    .formula-row.deduction .formula-value { color: #c62828; }
    .formula-row.deduction .formula-value::before { content: '- '; opacity: 0.5; font-weight: normal; }
    
    .formula-row.neutral .formula-value { color: var(--primary-color); }

    /* Total Card Styling */
    .total-card { border-radius: 16px; box-shadow: 0 8px 30px rgba(var(--primary-color-rgb, 63, 81, 181), 0.15) !important; background: linear-gradient(135deg, var(--primary-color) 0%, var(--accent-color) 100%); color: white; height: 100%; display: flex; align-items: center; justify-content: center; text-align: center; }
    .total-content { padding: 40px 20px; }
    .total-icon { font-size: 64px; width: 64px; height: 64px; margin-bottom: 24px; opacity: 0.8; }
    .total-content h3 { margin: 0 0 16px 0; font-weight: 400; opacity: 0.9; font-size: 1.2rem; text-transform: uppercase; letter-spacing: 1px; }
    .total-number { font-size: 6rem; font-weight: 700; margin: 0; line-height: 1; text-shadow: 0 4px 10px rgba(0,0,0,0.2); }
    .total-subtitle { margin: 16px 0 0 0; opacity: 0.7; font-size: 0.9rem; }

    @media (max-width: 600px) {
      .page-container { padding: 16px; }
      .welcome-header { flex-direction: column; align-items: flex-start; gap: 16px; }
      .header-actions { width: 100%; }
      .add-btn { width: 100%; display: flex; justify-content: center; align-items: center; white-space: normal; text-align: center; }
      .total-number { font-size: 4rem; }
    }
  `]
})
export class InventorySummaryComponent implements OnInit {
  inventoryData: any = null;
  loading: boolean = true;

  constructor(
    private inventoryService: InventoryService,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    try {
      this.inventoryData = await this.inventoryService.calculateEndingInventory();
    } catch (e) {
      console.error('Error calculating inventory', e);
    } finally {
      this.loading = false;
      this.cdr.detectChanges(); // Force Angular to update the UI immediately
    }
  }
}

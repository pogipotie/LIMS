import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ReportService } from '../../../../core/services/report.service';

@Component({
  selector: 'app-monthly-report',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatCardModule,
    MatFormFieldModule, MatSelectModule, MatButtonModule,
    MatIconModule, MatProgressSpinnerModule
  ],
  template: `
    <div class="page-container">
      <div class="welcome-header">
        <div>
          <h1 class="mat-display-1" style="margin:0; font-weight: 600; color: #2c3e50;">Monthly Reports</h1>
          <p class="text-muted">Generate and export historical data for your farm.</p>
        </div>
      </div>

      <mat-card class="filter-card">
        <form [formGroup]="filterForm" (ngSubmit)="generateReport()" class="filter-form">
          <mat-form-field appearance="outline" class="form-select">
            <mat-label>Select Year</mat-label>
            <mat-select formControlName="year">
              <mat-option *ngFor="let y of years" [value]="y">{{y}}</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline" class="form-select">
            <mat-label>Select Month</mat-label>
            <mat-select formControlName="month">
              <mat-option *ngFor="let m of months; let i = index" [value]="i">{{m}}</mat-option>
            </mat-select>
          </mat-form-field>

          <button mat-flat-button color="primary" type="submit" [disabled]="loading" class="generate-btn">
            <mat-icon>analytics</mat-icon> Generate Report
          </button>
        </form>
      </mat-card>

      <div *ngIf="loading" class="spinner-container">
        <mat-spinner diameter="40"></mat-spinner>
      </div>

      <div class="report-wrapper" *ngIf="reportData && !loading">
        <mat-card class="report-preview">
          <mat-card-header class="custom-card-header">
            <div class="header-title-section">
              <div mat-card-avatar class="header-icon"><mat-icon>assessment</mat-icon></div>
              <div>
                <mat-card-title>Report Preview</mat-card-title>
                <mat-card-subtitle>Summary of all additions and deductions</mat-card-subtitle>
              </div>
            </div>
            <button mat-flat-button color="accent" (click)="exportPDF()" class="export-btn">
              <mat-icon>picture_as_pdf</mat-icon> Export to PDF
            </button>
          </mat-card-header>
          
          <mat-card-content class="report-content">
            <div class="summary-section">
              <div class="summary-stat">
                <mat-icon color="primary">pets</mat-icon>
                <div class="stat-text">
                  <span class="stat-label">Active Inventory at End of Month</span>
                  <span class="stat-value">{{ reportData.totalLivestock }}</span>
                </div>
              </div>
            </div>
            
            <div class="metrics-grid">
              <!-- Additions -->
              <div class="metric-box addition">
                <div class="metric-header">
                  <mat-icon>child_care</mat-icon>
                  <h4>Births</h4>
                </div>
                <p>{{ reportData.metrics.births }}</p>
              </div>
              <div class="metric-box addition">
                <div class="metric-header">
                  <mat-icon>shopping_cart</mat-icon>
                  <h4>Purchases</h4>
                </div>
                <p>{{ reportData.metrics.purchases }}</p>
              </div>
              <div class="metric-box addition">
                <div class="metric-header">
                  <mat-icon>arrow_downward</mat-icon>
                  <h4>Transfers In</h4>
                </div>
                <p>{{ reportData.metrics.transfersIn }}</p>
              </div>
              
              <!-- Deductions -->
              <div class="metric-box deduction">
                <div class="metric-header">
                  <mat-icon>payments</mat-icon>
                  <h4>Sales</h4>
                </div>
                <p>{{ reportData.metrics.sales }}</p>
              </div>
              <div class="metric-box deduction">
                <div class="metric-header">
                  <mat-icon>warning</mat-icon>
                  <h4>Deaths</h4>
                </div>
                <p>{{ reportData.metrics.deaths }}</p>
              </div>
              <div class="metric-box deduction">
                <div class="metric-header">
                  <mat-icon>arrow_upward</mat-icon>
                  <h4>Transfers Out</h4>
                </div>
                <p>{{ reportData.metrics.transfersOut }}</p>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .page-container { padding: 24px; max-width: 1400px; margin: 0 auto; background-color: #f8f9fa; min-height: calc(100vh - 64px); }
    .welcome-header { margin-bottom: 32px; }
    .text-muted { color: #7f8c8d; margin-top: 8px; font-size: 1.1rem; }
    
    .filter-card { border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.04) !important; margin-bottom: 32px; padding: 24px; }
    .filter-form { display: flex; gap: 24px; align-items: center; flex-wrap: wrap; }
    .form-select { flex: 1; min-width: 200px; margin-bottom: -1.25em; }
    .generate-btn { padding: 8px 24px; font-size: 1.05rem; border-radius: 8px; height: 50px; }
    
    .spinner-container { display: flex; justify-content: center; margin-top: 100px; }
    
    .report-wrapper { animation: fadeIn 0.3s ease-in-out; }
    .report-preview { border-radius: 16px; box-shadow: 0 8px 30px rgba(0,0,0,0.08) !important; overflow: hidden; }
    
    .custom-card-header { padding: 24px; background-color: white; border-bottom: 1px solid #f0f0f0; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; }
    .header-title-section { display: flex; align-items: center; }
    .header-icon { display: flex; justify-content: center; align-items: center; background-color: rgba(var(--primary-color-rgb, 63, 81, 181), 0.1); border-radius: 50%; color: var(--primary-color); margin-right: 16px; }
    .export-btn { padding: 4px 20px; border-radius: 8px; }
    
    .report-content { padding: 32px 24px !important; background-color: #fafafa; }
    
    .summary-section { margin-bottom: 32px; display: flex; justify-content: center; }
    .summary-stat { display: flex; align-items: center; gap: 16px; background: white; padding: 20px 40px; border-radius: 16px; box-shadow: 0 4px 15px rgba(0,0,0,0.03); border: 1px solid #e0e0e0; }
    .summary-stat mat-icon { font-size: 40px; width: 40px; height: 40px; }
    .stat-text { display: flex; flex-direction: column; }
    .stat-label { font-size: 0.9rem; color: #7f8c8d; text-transform: uppercase; letter-spacing: 1px; font-weight: 600; }
    .stat-value { font-size: 2.5rem; font-weight: 700; color: #2c3e50; line-height: 1.2; }
    
    .metrics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 24px; }
    
    .metric-box { padding: 24px; border-radius: 12px; background: white; box-shadow: 0 4px 15px rgba(0,0,0,0.03); transition: transform 0.2s; }
    .metric-box:hover { transform: translateY(-3px); }
    .metric-header { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
    .metric-header mat-icon { opacity: 0.7; }
    .metric-header h4 { margin: 0; font-size: 1.1rem; font-weight: 600; color: #34495e; }
    .metric-box p { margin: 0; font-size: 2.5rem; font-weight: 700; }
    
    .addition { border-top: 4px solid #4caf50; }
    .addition p { color: #2e7d32; }
    .addition mat-icon { color: #2e7d32; }
    
    .deduction { border-top: 4px solid #f44336; }
    .deduction p { color: #c62828; }
    .deduction mat-icon { color: #c62828; }
    
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

    @media (max-width: 600px) {
      .page-container { padding: 16px; }
      .filter-form { flex-direction: column; align-items: stretch; gap: 16px; }
      .form-select { margin-bottom: 0; }
      .generate-btn { width: 100%; }
      .export-btn { width: 100%; }
      .custom-card-header { flex-direction: column; align-items: flex-start; }
      .metrics-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class MonthlyReportComponent implements OnInit {
  filterForm: FormGroup;
  loading = false;
  reportData: any = null;

  years: number[] = [];
  months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  constructor(
    private fb: FormBuilder,
    private reportService: ReportService,
    private cdr: ChangeDetectorRef
  ) {
    const currentYear = new Date().getFullYear();
    for (let i = currentYear - 5; i <= currentYear; i++) {
      this.years.push(i);
    }
    
    this.filterForm = this.fb.group({
      year: [currentYear],
      month: [new Date().getMonth()]
    });
  }

  ngOnInit() {
    this.generateReport();
  }

  async generateReport() {
    this.loading = true;
    try {
      const { year, month } = this.filterForm.value;
      this.reportData = await this.reportService.generateMonthlyReport(year, month);
    } catch (e) {
      console.error('Error generating report', e);
    } finally {
      this.loading = false;
      this.cdr.detectChanges(); // Force UI update immediately
    }
  }

  exportPDF() {
    if (this.reportData) {
      this.reportService.exportToPDF(this.reportData);
    }
  }
}

import { Component, OnInit, ChangeDetectorRef, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';
import { LogbookService } from '../../core/services/logbook.service';
import { LivestockService } from '../../core/services/livestock.service';
import { Logbook } from '../../shared/models/logbook.model';
import { Livestock } from '../../shared/models/livestock.model';

@Component({
  selector: 'app-logbooks',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatCardModule, MatFormFieldModule,
    MatInputModule, MatButtonModule, MatIconModule, MatTableModule,
    MatDividerModule, MatProgressSpinnerModule, MatTooltipModule, MatSelectModule
  ],
  template: `
    <div class="page-container">
      <div class="welcome-header">
        <div>
          <h1 class="mat-display-1" style="margin:0; font-weight: 600; color: var(--primary-color, #3f51b5);">Health Logbook</h1>
          <p class="text-muted">Record daily health checkups and observations for livestock.</p>
        </div>
      </div>

      <div class="content-grid">
        <!-- Add New Logbook Form -->
        <div class="form-column">
          <mat-card class="form-card">
            <mat-card-header class="custom-card-header">
              <div mat-card-avatar class="header-icon"><mat-icon>add_box</mat-icon></div>
              <mat-card-title>New Entry</mat-card-title>
            </mat-card-header>
            <mat-divider></mat-divider>
            
            <mat-card-content class="form-content">
              <form [formGroup]="logbookForm" (ngSubmit)="addLogbook()">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Select Livestock</mat-label>
                  <mat-select formControlName="livestock_id" required>
                    <mat-option *ngFor="let l of activeLivestock" [value]="l.id">
                      {{l.tag_number || 'No Tag'}} - {{l.name || 'Unnamed'}} ({{l.category}})
                    </mat-option>
                  </mat-select>
                </mat-form-field>
                
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Health Status</mat-label>
                  <mat-select formControlName="health_status" required>
                    <mat-option value="healthy">Healthy</mat-option>
                    <mat-option value="under_observation">Under Observation</mat-option>
                    <mat-option value="sick">Sick</mat-option>
                    <mat-option value="injured">Injured</mat-option>
                  </mat-select>
                </mat-form-field>

                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Remarks / Notes</mat-label>
                  <textarea matInput formControlName="remarks" placeholder="Any medical actions or notes..." rows="3"></textarea>
                </mat-form-field>

                <div class="form-actions">
                  <button mat-flat-button color="primary" type="submit" class="full-width-btn" [disabled]="logbookForm.invalid || isSubmitting">
                    <mat-icon>save</mat-icon> {{ isSubmitting ? 'Saving...' : 'Save Log' }}
                  </button>
                </div>
              </form>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Logbooks Table -->
        <div class="table-column">
          <mat-card class="table-card">
            <mat-card-header class="custom-card-header">
              <div mat-card-avatar class="header-icon"><mat-icon>history</mat-icon></div>
              <mat-card-title>Recent Logs</mat-card-title>
            </mat-card-header>
            <mat-divider></mat-divider>
            
            <div *ngIf="loading" class="spinner-container">
              <mat-spinner diameter="40"></mat-spinner>
            </div>

            <div class="table-responsive" *ngIf="!loading">
              <table mat-table [dataSource]="dataSource" class="custom-table">
                
                <ng-container matColumnDef="date">
                  <th mat-header-cell *matHeaderCellDef> Date </th>
                  <td mat-cell *matCellDef="let element"> {{element.log_date | date:'mediumDate'}} </td>
                </ng-container>

                <ng-container matColumnDef="livestock">
                  <th mat-header-cell *matHeaderCellDef> Livestock </th>
                  <td mat-cell *matCellDef="let element">
                     <strong>{{element.livestock?.tag_number || 'N/A'}}</strong><br>
                     <small class="text-muted">{{element.livestock?.name || element.livestock?.category}}</small>
                  </td>
                </ng-container>
                
                <ng-container matColumnDef="status">
                  <th mat-header-cell *matHeaderCellDef> Status </th>
                  <td mat-cell *matCellDef="let element">
                    <span class="status-badge" [ngClass]="element.health_status">{{element.health_status | uppercase | slice:0:15}}</span>
                  </td>
                </ng-container>

                <ng-container matColumnDef="remarks">
                  <th mat-header-cell *matHeaderCellDef> Remarks </th>
                  <td mat-cell *matCellDef="let element">
                     {{ element.remarks ? (element.remarks | slice:0:30) + (element.remarks.length > 30 ? '...' : '') : '-' }}
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: displayedColumns;" class="table-row"></tr>
                
                <tr class="mat-row" *matNoDataRow>
                  <td class="mat-cell empty-state" colspan="4">
                     <p>No logbook entries found.</p>
                  </td>
                </tr>
              </table>
            </div>
          </mat-card>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-container { padding: 24px; max-width: 1400px; margin: 0 auto; background-color: #f8f9fa; min-height: calc(100vh - 64px); }
    .welcome-header { margin-bottom: 32px; }
    .text-muted { color: #7f8c8d; margin-top: 8px; font-size: 1.1rem; }
    
    .content-grid { display: grid; grid-template-columns: 1fr 2fr; gap: 24px; }
    @media (max-width: 960px) { 
      .content-grid { grid-template-columns: 1fr; } 
    }
    
    .form-card, .table-card { border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.04) !important; overflow: hidden; }
    .custom-card-header { padding: 20px; align-items: center; background-color: white; }
    .header-icon { display: flex; justify-content: center; align-items: center; background-color: rgba(var(--primary-color-rgb, 63, 81, 181), 0.1); border-radius: 50%; color: var(--primary-color); margin-right: 16px; }

    .form-content { padding: 24px !important; }
    .full-width { width: 100%; margin-bottom: 16px; }
    .form-actions { display: flex; gap: 12px; }
    .full-width-btn { flex: 1; padding: 8px; font-size: 1.05rem; border-radius: 8px; height: 48px; }
    
    .spinner-container { display: flex; justify-content: center; padding: 40px; }
    
    .table-responsive { overflow-x: auto; }
    .custom-table { width: 100%; }
    th.mat-header-cell { font-size: 0.95rem; font-weight: 600; color: #34495e; background-color: #fafafa; padding: 16px; }
    td.mat-cell { padding: 16px; border-bottom: 1px solid #f0f0f0; font-size: 0.95rem; color: #2c3e50; }
    .table-row:hover { background-color: #f8f9fa; }
    
    .status-badge { padding: 4px 8px; border-radius: 12px; font-size: 0.75rem; font-weight: bold; }
    .status-badge.healthy { background: #e8f5e9; color: #2e7d32; }
    .status-badge.sick { background: #ffebee; color: #c62828; }
    .status-badge.injured { background: #fff3e0; color: #e65100; }
    .status-badge.under_observation { background: #e3f2fd; color: #ef6c00; }

    .empty-state { text-align: center; padding: 40px 20px; color: #95a5a6; }

    @media (max-width: 600px) {
      .page-container { padding: 16px; }
      .welcome-header { margin-bottom: 16px; }
    }
  `]
})
export class LogbooksComponent implements OnInit {
  logbookForm: FormGroup;
  displayedColumns: string[] = ['date', 'livestock', 'status', 'remarks'];
  dataSource = new MatTableDataSource<Logbook>([]);
  activeLivestock: Livestock[] = [];
  loading = true;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private logbookService: LogbookService,
    private livestockService: LivestockService,
    private cdr: ChangeDetectorRef
  ) {
    this.logbookForm = this.fb.group({
      livestock_id: ['', Validators.required],
      health_status: ['healthy', Validators.required],
      remarks: ['']
    });
  }

  async ngOnInit() {
    await Promise.all([
      this.loadLivestock(),
      this.loadLogbooks()
    ]);
  }

  async loadLivestock() {
    try {
      const data = await this.livestockService.getAll();
      this.activeLivestock = data.filter(l => l.status === 'active');
    } catch (e) {
      console.error('Error loading livestock', e);
    }
  }

  async loadLogbooks() {
    this.loading = true;
    try {
      const data = await this.logbookService.getAll();
      this.dataSource.data = data;
    } catch (e) {
      console.error('Error loading logbooks', e);
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  async addLogbook() {
    if (this.logbookForm.valid) {
      this.isSubmitting = true;
      try {
        const formValue = this.logbookForm.value;
        if (!formValue.remarks) delete formValue.remarks;
        
        await this.logbookService.create(formValue);
        this.logbookForm.reset({ health_status: 'healthy' });
        Object.keys(this.logbookForm.controls).forEach(key => {
          this.logbookForm.get(key)?.setErrors(null);
        });
        
        await this.loadLogbooks();
      } catch (e: any) {
        console.error('Error creating logbook', e);
        alert('Failed to save logbook entry.');
      } finally {
        this.isSubmitting = false;
        this.cdr.detectChanges();
      }
    }
  }
}
import { Component, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { LivestockService } from '../../../../core/services/livestock.service';
import { Livestock } from '../../../../shared/models/livestock.model';

@Component({
  selector: 'app-livestock-records',
  standalone: true,
  imports: [
    CommonModule, MatTableModule, MatCardModule, MatInputModule, 
    MatFormFieldModule, MatIconModule, MatPaginatorModule, 
    MatSortModule, MatChipsModule, MatButtonModule, MatTooltipModule
  ],
  template: `
    <div class="page-container">
      <div class="welcome-header">
        <div>
          <h1 class="mat-display-1" style="margin:0; font-weight: 600; color: #2c3e50;">Data Management</h1>
          <p class="text-muted">Global, searchable view of all livestock records.</p>
        </div>
      </div>

      <mat-card class="table-card">
        <div class="table-header">
          <mat-form-field appearance="outline" class="search-bar">
            <mat-label>Global Search</mat-label>
            <mat-icon matPrefix color="primary" class="search-icon">search</mat-icon>
            <input matInput (keyup)="applyFilter($event)" placeholder="Search Tag No, Category, or Status" #input>
          </mat-form-field>
          <div class="table-controls">
             <button mat-icon-button color="primary" matTooltip="Refresh Data" (click)="loadData()">
                <mat-icon>refresh</mat-icon>
             </button>
          </div>
        </div>

        <div class="table-responsive">
          <table mat-table [dataSource]="dataSource" matSort class="custom-table">
            
            <ng-container matColumnDef="tag_number">
              <th mat-header-cell *matHeaderCellDef mat-sort-header> Tag No. </th>
              <td mat-cell *matCellDef="let element"> 
                <strong class="tag-text">{{element.tag_number || 'N/A'}}</strong> 
              </td>
            </ng-container>

            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef mat-sort-header> Name </th>
              <td mat-cell *matCellDef="let element"> 
                 <div class="name-cell">
                    <mat-icon class="avatar-icon" color="primary">pets</mat-icon>
                    <span>{{element.name || 'Unnamed'}}</span>
                 </div>
              </td>
            </ng-container>

            <ng-container matColumnDef="category">
              <th mat-header-cell *matHeaderCellDef mat-sort-header> Category </th>
              <td mat-cell *matCellDef="let element"> 
                 <mat-chip-set>
                    <mat-chip [disableRipple]="true" class="category-chip">{{element.category}}</mat-chip>
                 </mat-chip-set>
              </td>
            </ng-container>

            <ng-container matColumnDef="gender">
              <th mat-header-cell *matHeaderCellDef mat-sort-header> Gender </th>
              <td mat-cell *matCellDef="let element">
                <div class="gender-cell" [ngClass]="element.gender">
                  <mat-icon [inline]="true">{{ element.gender === 'male' ? 'male' : 'female' }}</mat-icon>
                  <span>{{element.gender | titlecase}}</span>
                </div>
              </td>
            </ng-container>
            
            <ng-container matColumnDef="age">
              <th mat-header-cell *matHeaderCellDef mat-sort-header> Birth Date </th>
              <td mat-cell *matCellDef="let element" class="date-text"> 
                {{element.birth_date | date:'mediumDate'}} 
              </td>
            </ng-container>

            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef mat-sort-header> Status </th>
              <td mat-cell *matCellDef="let element"> 
                <span class="status-badge" [ngClass]="element.status">{{element.status.replace('_', ' ')}}</span>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;" class="table-row"></tr>

            <!-- Row shown when there is no matching data. -->
            <tr class="mat-row" *matNoDataRow>
              <td class="mat-cell empty-state" colspan="6">
                 <mat-icon class="empty-icon">search_off</mat-icon>
                 <p *ngIf="input.value">No records found matching "{{input.value}}"</p>
                 <p *ngIf="!input.value">No livestock records found.</p>
              </td>
            </tr>
          </table>
        </div>

        <mat-paginator [pageSizeOptions]="[10, 25, 50, 100]" aria-label="Select page of records"></mat-paginator>
      </mat-card>
    </div>
  `,
  styles: [`
    .page-container { padding: 24px; max-width: 1400px; margin: 0 auto; background-color: #f8f9fa; min-height: calc(100vh - 64px); }
    .welcome-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; }
    .text-muted { color: #7f8c8d; margin-top: 8px; font-size: 1.1rem; }
    
    .table-card { border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.04) !important; padding: 0; overflow: hidden; }
    .table-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px 0 24px; background: white; }
    .search-bar { width: 100%; max-width: 400px; }
    .search-icon { margin-right: 8px; }
    
    .table-responsive { overflow-x: auto; }
    .custom-table { width: 100%; }
    
    /* Table Styling overrides */
    th.mat-header-cell { font-size: 0.95rem; font-weight: 600; color: #34495e; background-color: #f8f9fa; text-transform: uppercase; letter-spacing: 0.5px; padding: 16px; }
    td.mat-cell { padding: 16px; border-bottom: 1px solid #f0f0f0; font-size: 0.95rem; color: #2c3e50; }
    .table-row { transition: background-color 0.2s ease; }
    .table-row:hover { background-color: #f8f9fa; }
    
    /* Specific Column Styles */
    .tag-text { color: #3f51b5; font-family: monospace; font-size: 1.05rem; }
    .name-cell { display: flex; align-items: center; gap: 12px; font-weight: 500; }
    .avatar-icon { background: #e8eaf6; padding: 8px; border-radius: 50%; color: #3f51b5; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; }
    
    .category-chip { background-color: #f1f2f6 !important; color: #2c3e50 !important; font-weight: 500; border: 1px solid #dfe4ea; }
    
    .gender-cell { display: flex; align-items: center; gap: 4px; font-weight: 500; }
    .gender-cell.male { color: #1976d2; }
    .gender-cell.female { color: #c2185b; }
    
    .date-text { color: #7f8c8d; }
    
    /* Status Badges */
    .status-badge { padding: 6px 12px; border-radius: 20px; font-size: 0.85em; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; display: inline-block; text-align: center; min-width: 80px; }
    .status-badge.active { background: #e8f5e9; color: #2e7d32; border: 1px solid #c8e6c9; }
    .status-badge.deceased { background: #ffebee; color: #c62828; border: 1px solid #ffcdd2; }
    .status-badge.sold { background: #e3f2fd; color: #1565c0; border: 1px solid #bbdefb; }
    .status-badge.transferred_out { background: #fff3e0; color: #ef6c00; border: 1px solid #ffe0b2; }

    /* Empty State */
    .empty-state { text-align: center; padding: 60px 20px; color: #95a5a6; }
    .empty-icon { font-size: 48px; width: 48px; height: 48px; margin-bottom: 16px; opacity: 0.5; }
    .empty-state p { font-size: 1.1rem; margin: 0; }
  `]
})
export class LivestockRecordsComponent implements OnInit {
  displayedColumns: string[] = ['tag_number', 'name', 'category', 'gender', 'age', 'status'];
  dataSource: MatTableDataSource<Livestock>;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private livestockService: LivestockService,
    private cdr: ChangeDetectorRef
  ) {
    this.dataSource = new MatTableDataSource<Livestock>([]);
  }

  async ngOnInit() {
    await this.loadData();
  }

  async loadData() {
    try {
      const data = await this.livestockService.getAll();
      this.dataSource.data = data;
      
      // Setup sorting and pagination after data load
      setTimeout(() => {
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      });
      
      this.cdr.detectChanges(); // Force UI update immediately
    } catch (e) {
      console.error(e);
    }
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
}

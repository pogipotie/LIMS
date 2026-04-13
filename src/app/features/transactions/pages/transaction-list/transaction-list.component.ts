import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TransactionService } from '../../../../core/services/transaction.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Transaction } from '../../../../shared/models/transaction.model';

@Component({
  selector: 'app-transaction-confirm-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <div class="dialog-container">
      <div class="dialog-header" [ngClass]="data.isError ? 'bg-warn-light' : 'bg-primary-light'">
        <div class="icon-circle" [ngClass]="data.isError ? 'warn-glow' : 'primary-glow'">
          <mat-icon [color]="data.isError ? 'warn' : 'primary'">{{ data.icon || (data.isError ? 'error_outline' : 'help_outline') }}</mat-icon>
        </div>
        <h2 mat-dialog-title class="dialog-title">{{ data.title }}</h2>
      </div>
      
      <mat-dialog-content class="dialog-content">
        <p class="primary-text">{{ data.message }}</p>
      </mat-dialog-content>
      
      <mat-dialog-actions class="dialog-actions">
        <button *ngIf="data.showCancel" mat-stroked-button mat-dialog-close class="action-btn">Cancel</button>
        <button mat-flat-button [color]="data.isError ? 'warn' : 'primary'" [mat-dialog-close]="true" class="action-btn">
          {{ data.confirmText || 'OK' }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .dialog-container { overflow: hidden; }
    .dialog-header { display: flex; flex-direction: column; align-items: center; padding: 32px 24px 16px; background: linear-gradient(to bottom, #f8f9fa, white); }
    .bg-warn-light { background: linear-gradient(to bottom, #fff5f5, white); }
    .bg-primary-light { background: linear-gradient(to bottom, #e8eaf6, white); }
    .icon-circle { width: 64px; height: 64px; border-radius: 50%; background: #f0f0f0; display: flex; justify-content: center; align-items: center; margin-bottom: 16px; }
    .icon-circle mat-icon { font-size: 32px; width: 32px; height: 32px; }
    .warn-glow { background: #ffebee; box-shadow: 0 0 20px rgba(244, 67, 54, 0.2); border: 4px solid white; }
    .primary-glow { background: #e8eaf6; box-shadow: 0 0 20px rgba(63, 81, 181, 0.2); border: 4px solid white; }
    .dialog-title { margin: 0; font-size: 1.5rem; font-weight: 600; color: #2c3e50; text-align: center; }
    .dialog-content { padding: 0 32px 24px !important; text-align: center; overflow: hidden; }
    .primary-text { font-size: 1.1rem; color: #34495e; margin-bottom: 12px; line-height: 1.5; }
    .dialog-actions { padding: 16px 32px 32px !important; display: flex; gap: 16px; justify-content: center; margin-bottom: 0; }
    .action-btn { padding: 8px 24px; font-size: 1rem; border-radius: 8px; height: 48px; min-width: 120px; }
  `]
})
export class TransactionConfirmDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<TransactionConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { title: string, message: string, isError?: boolean, showCancel?: boolean, confirmText?: string, icon?: string }
  ) {}
}

@Component({
  selector: 'app-transaction-list',
  standalone: true,
  imports: [
    CommonModule, RouterModule, MatTableModule, MatButtonModule, 
    MatIconModule, MatCardModule, MatInputModule, MatFormFieldModule,
    MatPaginatorModule, MatSortModule, MatTooltipModule, MatDialogModule
  ],
  template: `
    <div class="page-container">
      <div class="welcome-header">
        <div>
          <h1 class="mat-display-1" style="margin:0; font-weight: 600; color: #2c3e50;">Transaction Logs</h1>
          <p class="text-muted">Review all historical events, sales, and purchases.</p>
        </div>
        <div class="header-actions">
          <button mat-flat-button color="primary" routerLink="add" class="add-btn">
            <mat-icon>add_circle_outline</mat-icon> Record Transaction
          </button>
        </div>
      </div>

      <mat-card class="table-card">
        <div class="table-header">
          <mat-form-field appearance="outline" class="search-bar">
            <mat-label>Search Transactions</mat-label>
            <mat-icon matPrefix color="primary" class="search-icon">search</mat-icon>
            <input matInput (keyup)="applyFilter($event)" placeholder="Search by type, tag, or notes" #input>
          </mat-form-field>
          <div class="table-controls">
             <button mat-icon-button color="primary" matTooltip="Refresh Data" (click)="loadTransactions()">
                <mat-icon>refresh</mat-icon>
             </button>
          </div>
        </div>

        <div class="table-responsive">
          <table mat-table [dataSource]="dataSource" matSort class="custom-table">
            
            <!-- Date Column -->
            <ng-container matColumnDef="date">
              <th mat-header-cell *matHeaderCellDef mat-sort-header> Date </th>
              <td mat-cell *matCellDef="let element" class="date-text"> 
                {{element.transaction_date | date:'MMM d, y, h:mm a':'+0800'}} 
              </td>
            </ng-container>

            <!-- Livestock Column -->
            <ng-container matColumnDef="livestock">
              <th mat-header-cell *matHeaderCellDef> Livestock </th>
              <td mat-cell *matCellDef="let element"> 
                 <div class="name-cell" *ngIf="element.livestock">
                    <mat-icon class="avatar-icon" color="primary">pets</mat-icon>
                    <div>
                      <strong class="tag-text">{{element.livestock.tag_number || 'No Tag'}}</strong>
                      <div class="category-text">{{element.livestock.category}}</div>
                    </div>
                 </div>
                 <div class="name-cell" *ngIf="!element.livestock">
                    <mat-icon class="avatar-icon" style="color:#95a5a6">help_outline</mat-icon>
                    <span style="color:#95a5a6">Unknown Animal</span>
                 </div>
              </td>
            </ng-container>

            <!-- Type Column -->
            <ng-container matColumnDef="type">
              <th mat-header-cell *matHeaderCellDef mat-sort-header> Event Type </th>
              <td mat-cell *matCellDef="let element"> 
                <div class="type-badge-container">
                  <mat-icon class="type-icon" [ngClass]="element.type">{{ getTransactionIcon(element.type) }}</mat-icon>
                  <span class="type-badge" [ngClass]="element.type">{{element.type.replace('_', ' ')}}</span>
                </div>
              </td>
            </ng-container>

            <!-- Amount Column -->
            <ng-container matColumnDef="amount">
              <th mat-header-cell *matHeaderCellDef mat-sort-header> Amount </th>
              <td mat-cell *matCellDef="let element"> 
                 <span *ngIf="element.amount" class="amount-text" [ngClass]="{'positive': isAddition(element.type), 'negative': !isAddition(element.type) && element.type !== 'death'}">
                    {{ element.amount | currency }}
                 </span>
                 <span *ngIf="!element.amount" style="color: #bdc3c7;">-</span>
              </td>
            </ng-container>
            
            <!-- Notes Column -->
            <ng-container matColumnDef="notes">
              <th mat-header-cell *matHeaderCellDef> Notes </th>
              <td mat-cell *matCellDef="let element" class="notes-cell"> 
                {{element.notes || '-'}} 
              </td>
            </ng-container>

            <!-- Status & Docs Column -->
            <ng-container matColumnDef="validation">
              <th mat-header-cell *matHeaderCellDef> Status </th>
              <td mat-cell *matCellDef="let element">
                <div style="display: flex; flex-direction: column; gap: 4px; align-items: flex-start;">
                  <span class="validation-badge" [ngClass]="element.validation_status || 'approved'">
                    {{element.validation_status || 'approved' | uppercase}}
                  </span>
                  <a *ngIf="element.document_url" [href]="element.document_url" target="_blank" class="doc-link">
                    <mat-icon inline>attach_file</mat-icon> View Doc
                  </a>
                </div>
              </td>
            </ng-container>

            <!-- Actions Column -->
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef class="actions-header"> Actions </th>
              <td mat-cell *matCellDef="let element" class="actions-cell">
                <button *ngIf="isAdmin && element.validation_status === 'pending'" 
                        mat-flat-button color="primary" 
                        class="approve-btn"
                        (click)="approve(element.id)">
                  Approve
                </button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <!-- FIXED: Proper matRowDef mapping to prevent duplicate header rendering -->
            <tr mat-row *matRowDef="let row; columns: displayedColumns;" class="table-row"></tr>
            
            <!-- Row shown when there is no matching data. -->
            <tr class="mat-row" *matNoDataRow>
              <td class="mat-cell empty-state" [attr.colspan]="displayedColumns.length">
                 <mat-icon class="empty-icon">search_off</mat-icon>
                 <p *ngIf="input.value">No transactions found matching "{{input.value}}"</p>
                 <p *ngIf="!input.value">No transactions have been recorded yet.</p>
              </td>
            </tr>
          </table>
        </div>

        <mat-paginator [pageSizeOptions]="[10, 25, 50, 100]" aria-label="Select page of transactions"></mat-paginator>
      </mat-card>
    </div>
  `,
  styles: [`
    .page-container { padding: 24px; max-width: 1400px; margin: 0 auto; background-color: #f8f9fa; min-height: calc(100vh - 64px); }
    .welcome-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; }
    .text-muted { color: #7f8c8d; margin-top: 8px; font-size: 1.1rem; }
    .add-btn { padding: 8px 24px; font-size: 1.1rem; border-radius: 8px; }
    
    .table-card { border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.04) !important; padding: 0; overflow: hidden; }
    .table-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px 0 24px; background: white; }
    .search-bar { width: 100%; max-width: 400px; }
    .search-icon { margin-right: 8px; }
    
    .table-responsive { overflow-x: auto; }
    .custom-table { width: 100%; }
    
    @media (max-width: 600px) {
      .page-container { padding: 16px; }
      .welcome-header { flex-direction: column; align-items: flex-start; gap: 16px; }
      .header-actions { width: 100%; }
      .add-btn { width: 100%; display: flex; justify-content: center; align-items: center; white-space: normal; text-align: center; }
      .table-header { flex-direction: column; align-items: stretch; padding: 16px 16px 0 16px; }
      .search-bar { max-width: 100%; }
      .table-controls { align-self: flex-end; }
    }
    
    /* Table Styling overrides */
    th.mat-header-cell { font-size: 0.95rem; font-weight: 600; color: #34495e; background-color: #f8f9fa; text-transform: uppercase; letter-spacing: 0.5px; padding: 16px; }
    td.mat-cell { padding: 16px; border-bottom: 1px solid #f0f0f0; font-size: 0.95rem; color: #2c3e50; }
    .table-row { transition: background-color 0.2s ease; }
    .table-row:hover { background-color: #f8f9fa; }
    
    /* Specific Column Styles */
    .date-text { color: #7f8c8d; font-weight: 500; }
    
    .name-cell { display: flex; align-items: center; gap: 12px; }
    .avatar-icon { background: rgba(var(--primary-color-rgb, 63, 81, 181), 0.1); padding: 8px; border-radius: 50%; color: var(--primary-color); width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; }
    .tag-text { color: var(--primary-color); font-family: monospace; font-size: 1.05rem; }
    .category-text { font-size: 0.8rem; color: #7f8c8d; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 2px; }
    
    .type-badge-container { display: flex; align-items: center; gap: 8px; }
    .type-icon { font-size: 18px; width: 18px; height: 18px; }
    .type-icon.birth, .type-icon.purchase, .type-icon.transfer_in { color: #2e7d32; }
    .type-icon.death, .type-icon.sale, .type-icon.transfer_out { color: #c62828; }
    
    .status-badge { padding: 4px 10px; border-radius: 12px; font-size: 0.85em; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
    .status-badge.birth, .status-badge.purchase, .status-badge.transfer_in { background: #e8f5e9; color: #2e7d32; }
    .status-badge.death, .status-badge.sale, .status-badge.transfer_out { background: #ffebee; color: #c62828; }

    .amount-text { font-weight: 600; font-size: 1.05rem; }
    .amount-text.positive { color: #2e7d32; }
    .amount-text.negative { color: #c62828; }
    
    .notes-cell { max-width: 200px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: #7f8c8d; font-style: italic; }

    /* Validation Status Badges */
    .validation-badge { padding: 4px 8px; border-radius: 6px; font-size: 0.75rem; font-weight: 700; letter-spacing: 0.5px; }
    .validation-badge.approved { background: #e8f5e9; color: #2e7d32; border: 1px solid #c8e6c9; }
    .validation-badge.pending { background: #fff3e0; color: #ef6c00; border: 1px solid #ffe0b2; }
    .validation-badge.rejected { background: #ffebee; color: #c62828; border: 1px solid #ffcdd2; }
    .doc-link { font-size: 0.8rem; color: var(--primary-color); text-decoration: none; display: flex; align-items: center; gap: 2px; font-weight: 500; }
    .doc-link:hover { text-decoration: underline; }
    .approve-btn { line-height: 28px !important; font-size: 0.8rem; padding: 0 12px; }

    /* Empty State */
    .empty-state { text-align: center; padding: 60px 20px; color: #95a5a6; }
    .empty-icon { font-size: 48px; width: 48px; height: 48px; margin-bottom: 16px; opacity: 0.5; }
    .empty-state p { font-size: 1.1rem; margin: 0; }
  `]
})
export class TransactionListComponent implements OnInit {
  displayedColumns: string[] = ['date', 'livestock', 'type', 'amount', 'validation', 'notes', 'actions'];
  dataSource: MatTableDataSource<Transaction>;
  isAdmin = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private transactionService: TransactionService, private authService: AuthService, private dialog: MatDialog) {
    this.dataSource = new MatTableDataSource<Transaction>([]);
    
    // Custom filter predicate to search nested livestock object
    this.dataSource.filterPredicate = (data: Transaction, filter: string) => {
      const dataStr = Object.keys(data).reduce((currentTerm: string, key: string) => {
        // Handle nested livestock object
        if (key === 'livestock' && data.livestock) {
           return currentTerm + (data.livestock.tag_number || '') + (data.livestock.category || '');
        }
        // Handle regular properties
        return currentTerm + (data as any)[key] + '◬';
      }, '').toLowerCase();
      
      const transformedFilter = filter.trim().toLowerCase();
      return dataStr.indexOf(transformedFilter) != -1;
    };
  }

  async ngOnInit() {
    const role = await this.authService.getUserRole();
    this.isAdmin = role === 'admin';
    if (!this.isAdmin) {
      this.displayedColumns = this.displayedColumns.filter(c => c !== 'actions');
    }
    await this.loadTransactions();
  }

  async loadTransactions() {
    try {
      const data = await this.transactionService.getAll();
      this.dataSource.data = data;
      // Setup sorting and pagination after data load
      setTimeout(() => {
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      });
    } catch (error) {
      console.error('Error loading transactions:', error);
    }
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
  
  async approve(id: string) {
    const dialogRef = this.dialog.open(TransactionConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Approve Transaction?',
        message: 'Are you sure you want to approve this transaction?',
        showCancel: true,
        confirmText: 'Approve',
        icon: 'check_circle_outline',
        isError: false
      }
    });

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result) {
        try {
          await this.transactionService.updateValidationStatus(id, 'approved');
          await this.loadTransactions(); // Refresh
        } catch (err) {
          console.error('Failed to approve transaction', err);
          this.dialog.open(TransactionConfirmDialogComponent, {
            width: '400px',
            data: {
              title: 'Error',
              message: 'Failed to approve the transaction. Please try again.',
              isError: true,
              showCancel: false,
              confirmText: 'Close'
            }
          });
        }
      }
    });
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
  
  isAddition(type: string): boolean {
    return ['birth', 'purchase', 'transfer_in'].includes(type);
  }
}

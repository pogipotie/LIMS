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
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule, MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { LivestockService } from '../../../../core/services/livestock.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Livestock } from '../../../../shared/models/livestock.model';
import { CategoryService } from '../../../../core/services/category.service';
import { UserService } from '../../../../core/services/user.service';
import { Category } from '../../../../shared/models/category.model';
import { Custodian } from '../../../../shared/models/custodian.model';

import { MatSlideToggleModule } from '@angular/material/slide-toggle';

// --- Edit Livestock Dialog Component ---
@Component({
  selector: 'app-edit-livestock-dialog',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatFormFieldModule, 
    MatInputModule, MatButtonModule, MatDialogModule, MatSelectModule
  ],
  template: `
    <h2 mat-dialog-title>Edit Livestock</h2>
    <mat-dialog-content>
      <form [formGroup]="editForm" class="dialog-form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Tag Number</mat-label>
          <input matInput formControlName="tag_number">
        </mat-form-field>
        
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Name</mat-label>
          <input matInput formControlName="name">
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Category</mat-label>
          <mat-select formControlName="category">
            <mat-option *ngFor="let cat of data.categories" [value]="cat.name">{{cat.name}}</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Gender</mat-label>
          <mat-select formControlName="gender">
            <mat-option value="male">Male</mat-option>
            <mat-option value="female">Female</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Assign Custodian</mat-label>
          <mat-select formControlName="custodian_id">
            <mat-option [value]="null">-- None (Unassigned) --</mat-option>
            <mat-option *ngFor="let cus of data.custodians" [value]="cus.user_id">{{cus.full_name}} (Farm Worker)</mat-option>
          </mat-select>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-flat-button color="primary" [disabled]="editForm.invalid" (click)="save()">Save Changes</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .dialog-form { display: flex; flex-direction: column; gap: 16px; width: 100%; padding-top: 16px; box-sizing: border-box; }
    .full-width { width: 100%; }
  `]
})
export class EditLivestockDialogComponent {
  editForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<EditLivestockDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { livestock: Livestock, categories: Category[], custodians: any[] }
  ) {
    this.editForm = this.fb.group({
      tag_number: [data.livestock.tag_number || ''],
      name: [data.livestock.name || ''],
      category: [data.livestock.category, Validators.required],
      gender: [data.livestock.gender, Validators.required],
      custodian_id: [data.livestock.custodian_id || null]
    });
  }

  save() {
    if (this.editForm.valid) {
      this.dialogRef.close({
        id: this.data.livestock.id,
        ...this.editForm.value
      });
    }
  }
}

// --- Delete Confirmation Dialog Component ---
@Component({
  selector: 'app-delete-livestock-dialog',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatDialogModule, MatIconModule],
  template: `
    <div class="delete-dialog-container">
      <div class="dialog-header bg-warn-light">
        <div class="icon-circle warn-glow">
          <mat-icon color="warn">warning_amber</mat-icon>
        </div>
        <h2 mat-dialog-title class="dialog-title">Delete Livestock?</h2>
      </div>
      
      <mat-dialog-content class="dialog-content">
        <p class="primary-text">
          You are about to permanently delete <strong>{{ data.tag_number ? data.tag_number : 'this animal' }} {{ data.name ? '(' + data.name + ')' : '' }}</strong>.
        </p>
        <div class="warning-box">
          <mat-icon class="info-icon">info</mat-icon>
          <p class="secondary-text">
            All related transactions and logbook entries will also be deleted. This cannot be undone.
          </p>
        </div>
      </mat-dialog-content>
      <mat-dialog-actions class="dialog-actions">
        <button mat-stroked-button mat-dialog-close class="action-btn">Cancel</button>
        <button mat-flat-button color="warn" [mat-dialog-close]="true" class="action-btn delete-btn">
          <mat-icon>delete_forever</mat-icon> Yes, Delete
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .delete-dialog-container { overflow: hidden; }
    .dialog-header { display: flex; flex-direction: column; align-items: center; padding: 32px 24px 16px; background: linear-gradient(to bottom, #fff5f5, white); }
    .icon-circle { width: 64px; height: 64px; border-radius: 50%; background: #ffebee; display: flex; justify-content: center; align-items: center; margin-bottom: 16px; }
    .icon-circle mat-icon { font-size: 32px; width: 32px; height: 32px; }
    .warn-glow { box-shadow: 0 0 20px rgba(244, 67, 54, 0.2); border: 4px solid white; }
    .dialog-title { margin: 0; font-size: 1.5rem; font-weight: 600; color: #2c3e50; }
    .dialog-content { padding: 0 32px 24px !important; text-align: center; overflow: hidden; }
    .primary-text { font-size: 1.1rem; color: #34495e; margin-bottom: 24px; line-height: 1.5; }
    .warning-box { background: #fff8e1; border-radius: 8px; padding: 12px 16px; display: flex; align-items: flex-start; gap: 12px; text-align: left; }
    .info-icon { color: #f57c00; font-size: 20px; width: 20px; height: 20px; flex-shrink: 0; margin-top: 2px; }
    .secondary-text { margin: 0; font-size: 0.9rem; color: #e65100; line-height: 1.4; word-break: break-word; }
    .dialog-actions { padding: 16px 32px 32px !important; display: flex; gap: 16px; justify-content: center; margin-bottom: 0; }
    .action-btn { padding: 8px 24px; font-size: 1rem; border-radius: 8px; height: 48px; min-width: 140px; }
    .delete-btn { box-shadow: 0 4px 12px rgba(244, 67, 54, 0.2); }
    @media (max-width: 600px) {
      .dialog-content { padding: 0 16px 24px !important; }
      .dialog-actions { flex-direction: column; padding: 16px 16px 24px !important; }
      .action-btn { width: 100%; }
    }
  `]
})
export class DeleteLivestockDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<DeleteLivestockDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { tag_number?: string, name?: string }
  ) {}
}

@Component({
  selector: 'app-livestock-list',
  standalone: true,
  imports: [
    CommonModule, RouterModule, MatTableModule, MatButtonModule, 
    MatIconModule, MatCardModule, MatInputModule, MatFormFieldModule,
    MatPaginatorModule, MatSortModule, MatTooltipModule, MatChipsModule, MatDialogModule, MatSlideToggleModule
  ],
  template: `
    <div class="page-container">
      <div class="welcome-header">
        <div>
          <h1 class="mat-display-1" style="margin:0; font-weight: 600; color: #2c3e50;">Livestock Inventory</h1>
          <p class="text-muted">Manage, filter, and track all animals currently in your system.</p>
        </div>
        <div class="header-actions">
          <button *ngIf="!isCustodian" mat-flat-button color="primary" routerLink="add" class="add-btn">
            <mat-icon>add_circle_outline</mat-icon> Add New Livestock
          </button>
        </div>
      </div>

      <mat-card class="table-card">
        <div class="table-header">
          <mat-form-field appearance="outline" class="search-bar">
            <mat-label>Search Livestock</mat-label>
            <mat-icon matPrefix color="primary" class="search-icon">search</mat-icon>
            <input matInput (keyup)="applyFilter($event)" placeholder="Search by Tag No, Name, or Category" #input>
          </mat-form-field>
          <div class="table-controls">
             <mat-slide-toggle color="primary" [checked]="showInactive" (change)="toggleStatus($event)" style="margin-right: 16px;">
               Show Derecognized
             </mat-slide-toggle>
             <button mat-icon-button color="primary" matTooltip="Refresh Data" (click)="loadLivestock()">
                <mat-icon>refresh</mat-icon>
             </button>
          </div>
        </div>

        <div class="table-responsive">
          <table mat-table [dataSource]="dataSource" matSort class="custom-table">
            
            <!-- Tag Number Column -->
            <ng-container matColumnDef="tag_number">
              <th mat-header-cell *matHeaderCellDef mat-sort-header> Tag No. </th>
              <td mat-cell *matCellDef="let element"> 
                <strong class="tag-text">{{element.tag_number || 'N/A'}}</strong> 
              </td>
            </ng-container>

            <!-- Name Column -->
            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef mat-sort-header> Name </th>
              <td mat-cell *matCellDef="let element"> 
                 <div class="name-cell">
                    <mat-icon class="avatar-icon" color="primary">pets</mat-icon>
                    <span>{{element.name || 'Unnamed'}}</span>
                 </div>
              </td>
            </ng-container>

            <!-- Category Column -->
            <ng-container matColumnDef="category">
              <th mat-header-cell *matHeaderCellDef mat-sort-header> Category & Status </th>
              <td mat-cell *matCellDef="let element"> 
                <div style="display: flex; flex-direction: column; gap: 4px; align-items: flex-start;">
                  <mat-chip-set>
                    <mat-chip [disableRipple]="true" class="category-chip">{{element.category}}</mat-chip>
                  </mat-chip-set>
                  <span *ngIf="element.status && element.status !== 'active'" 
                        class="status-badge" [ngClass]="element.status">
                    {{element.status | uppercase}}
                  </span>
                </div>
              </td>
            </ng-container>

            <!-- Custodian Column -->
            <ng-container matColumnDef="custodian">
              <th mat-header-cell *matHeaderCellDef mat-sort-header> Custodian </th>
              <td mat-cell *matCellDef="let element" class="date-text"> 
                {{element.custodian?.name || 'Unassigned'}} 
              </td>
            </ng-container>

            <!-- Gender Column -->
            <ng-container matColumnDef="gender">
              <th mat-header-cell *matHeaderCellDef mat-sort-header> Gender </th>
              <td mat-cell *matCellDef="let element">
                <div class="gender-cell" [ngClass]="element.gender">
                  <mat-icon [inline]="true">{{ element.gender === 'male' ? 'male' : 'female' }}</mat-icon>
                  <span>{{element.gender | titlecase}}</span>
                </div>
              </td>
            </ng-container>
            
            <!-- Age/Birth Date Column -->
            <ng-container matColumnDef="age">
              <th mat-header-cell *matHeaderCellDef mat-sort-header> Birth Date </th>
              <td mat-cell *matCellDef="let element" class="date-text"> 
                {{element.birth_date | date:'mediumDate'}} 
              </td>
            </ng-container>

            <!-- Status Column -->
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef mat-sort-header> Status </th>
              <td mat-cell *matCellDef="let element"> 
                <span class="status-badge" [ngClass]="element.status">{{element.status.replace('_', ' ')}}</span>
              </td>
            </ng-container>

            <!-- Actions Column -->
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef class="actions-header"> Actions </th>
              <td mat-cell *matCellDef="let element" class="actions-cell">
                <button *ngIf="isAdmin" mat-icon-button color="primary" (click)="edit(element)" matTooltip="Edit Record">
                  <mat-icon>edit</mat-icon>
                </button>
                <button *ngIf="isAdmin" mat-icon-button color="warn" (click)="delete(element)" matTooltip="Delete Record">
                  <mat-icon>delete_outline</mat-icon>
                </button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;" class="table-row"></tr>
            
            <!-- Row shown when there is no matching data. -->
            <tr class="mat-row" *matNoDataRow>
              <td class="mat-cell empty-state" colspan="7">
                 <mat-icon class="empty-icon">search_off</mat-icon>
                 <p>No livestock records found matching "{{input.value}}"</p>
              </td>
            </tr>
          </table>
        </div>

        <mat-paginator [pageSizeOptions]="[10, 25, 50, 100]" aria-label="Select page of livestock"></mat-paginator>
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
    
    .table-responsive { overflow-x: auto; }
    
    @media (max-width: 600px) {
      .page-container { padding: 16px; }
      .welcome-header { flex-direction: column; align-items: flex-start; gap: 16px; }
      .header-actions { width: 100%; }
      .add-btn { width: 100%; display: flex; justify-content: center; align-items: center; white-space: normal; text-align: center; }
      .table-header { flex-direction: column; align-items: stretch; padding: 16px 16px 0 16px; }
      .search-bar { max-width: 100%; }
      .table-controls { align-self: flex-end; }
    }
    
    .custom-table { width: 100%; }
    
    /* Table Styling overrides */
    th.mat-header-cell { font-size: 0.95rem; font-weight: 600; color: #34495e; background-color: #f8f9fa; text-transform: uppercase; letter-spacing: 0.5px; padding: 16px; }
    td.mat-cell { padding: 16px; border-bottom: 1px solid #f0f0f0; font-size: 0.95rem; color: #2c3e50; }
    .table-row { transition: background-color 0.2s ease; }
    .table-row:hover { background-color: #f8f9fa; }
    
    /* Specific Column Styles */
    .tag-text { color: var(--primary-color); font-family: monospace; font-size: 1.05rem; }
    .name-cell { display: flex; align-items: center; gap: 12px; font-weight: 500; }
    .avatar-icon { background: rgba(var(--primary-color-rgb, 63, 81, 181), 0.1); padding: 8px; border-radius: 50%; color: var(--primary-color); width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; }
    
    .category-chip { background-color: #e8eaf6; color: #3f51b5; font-weight: 600; font-size: 0.8rem; letter-spacing: 0.5px; }
    .gender-icon { width: 18px; height: 18px; font-size: 18px; margin-right: 4px; }
    
    .gender-cell { display: flex; align-items: center; gap: 4px; font-weight: 500; }
    .gender-cell.male { color: #1976d2; }
    .gender-cell.female { color: #c2185b; }
    
    .date-text { color: #7f8c8d; }
    
    .actions-header { text-align: center !important; }
    .actions-cell { text-align: center; }

    /* Status Badges */
    .status-badge { padding: 4px 8px; border-radius: 6px; font-size: 0.75rem; font-weight: 700; letter-spacing: 0.5px; display: inline-block; text-align: center; min-width: 80px; }
    .status-badge.active { background: #e8f5e9; color: #2e7d32; border: 1px solid #c8e6c9; }
    .status-badge.deceased { background: #ffebee; color: #c62828; border: 1px solid #ffcdd2; }
    .status-badge.sold { background: #fff3e0; color: #ef6c00; border: 1px solid #ffe0b2; }
    .status-badge.transferred { background: #e0f7fa; color: #00695c; border: 1px solid #b2dfdb; }

    .custodian-badge { background-color: #e0f2f1; color: #00796b; padding: 6px 12px; border-radius: 16px; font-size: 0.85rem; font-weight: 500; display: inline-flex; align-items: center; }

    /* Empty State */
    .empty-state { text-align: center; padding: 60px 20px; color: #95a5a6; }
    .empty-icon { font-size: 48px; width: 48px; height: 48px; margin-bottom: 16px; opacity: 0.5; }
    .empty-state p { font-size: 1.1rem; margin: 0; }
  `]
})
export class LivestockListComponent implements OnInit {
  displayedColumns: string[] = ['tag_number', 'name', 'category', 'custodian', 'gender', 'age', 'status', 'actions'];
  dataSource = new MatTableDataSource<Livestock>([]);
  allLivestock: Livestock[] = [];
  categories: Category[] = [];
  custodians: any[] = [];
  showInactive = false;
  isAdmin = false;
  isCustodian = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private livestockService: LivestockService,
    private authService: AuthService,
    private categoryService: CategoryService,
    private userService: UserService,
    private dialog: MatDialog
  ) {}

  async ngOnInit() {
    const role = await this.authService.getUserRole();
    this.isAdmin = role === 'admin';
    this.isCustodian = role === 'custodian';
    if (!this.isAdmin) {
      this.displayedColumns = this.displayedColumns.filter(c => c !== 'actions');
    }
    
    try {
      const [categories, users] = await Promise.all([
        this.categoryService.getAll(),
        this.userService.getAllUsers()
      ]);
      this.categories = categories;
      this.custodians = users.filter(u => u.role === 'custodian' || u.role === 'admin');
    } catch (e) {
      console.error('Failed to load filter data', e);
    }

    await this.loadLivestock();
  }

  async loadLivestock() {
    try {
      this.allLivestock = await this.livestockService.getAll();
      this.filterActive();
    } catch (error) {
      console.error('Error loading livestock:', error);
    }
  }

  toggleStatus(event: any) {
    this.showInactive = event.checked;
    this.filterActive();
  }

  filterActive() {
    if (this.showInactive) {
      this.dataSource.data = this.allLivestock;
    } else {
      this.dataSource.data = this.allLivestock.filter(animal => !animal.status || animal.status === 'active');
    }
    
    setTimeout(() => {
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  async edit(livestock: Livestock) {
    try {
      const [categories, custodians] = await Promise.all([
        this.categoryService.getAll(),
        this.userService.getAllUsers()
      ]);
      const validCustodians = custodians.filter(u => u.role === 'custodian' || u.role === 'admin');

      const dialogRef = this.dialog.open(EditLivestockDialogComponent, {
        width: '95vw',
        maxWidth: '400px',
        data: {
          livestock,
          categories: categories,
          custodians: validCustodians
        }
      });

      dialogRef.afterClosed().subscribe(async (result) => {
        if (result) {
          try {
            await this.livestockService.update(result.id, {
              tag_number: result.tag_number,
              name: result.name,
              category: result.category,
              gender: result.gender,
              custodian_id: result.custodian_id
            });
            await this.loadLivestock();
          } catch (e) {
            console.error('Error updating livestock:', e);
            alert('Failed to update livestock record.');
          }
        }
      });
    } catch (e) {
      console.error('Failed to load form data for edit modal', e);
      alert('Failed to open edit modal.');
    }
  }

  delete(livestock: Livestock) {
    if (confirm(`Are you sure you want to delete ${livestock.tag_number}?`)) {
      this.livestockService.delete(livestock.id)
        .then(() => this.loadLivestock())
        .catch(err => {
          console.error('Error deleting livestock:', err);
          alert('Failed to delete livestock.');
        });
    }
  }
}

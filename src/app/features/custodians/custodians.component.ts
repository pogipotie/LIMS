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
import { MatDialogModule, MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { CustodianService } from '../../core/services/custodian.service';
import { Custodian } from '../../shared/models/custodian.model';

// --- Edit Custodian Dialog Component ---
@Component({
  selector: 'app-edit-custodian-dialog',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatFormFieldModule, 
    MatInputModule, MatButtonModule, MatDialogModule, MatSelectModule
  ],
  template: `
    <h2 mat-dialog-title>Edit Custodian</h2>
    <mat-dialog-content>
      <form [formGroup]="editForm" class="dialog-form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Name</mat-label>
          <input matInput formControlName="name">
          <mat-error *ngIf="editForm.get('name')?.hasError('required')">Name is required</mat-error>
        </mat-form-field>
        
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Department</mat-label>
          <input matInput formControlName="department">
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Contact Info</mat-label>
          <input matInput formControlName="contact_info">
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Status</mat-label>
          <mat-select formControlName="status">
            <mat-option value="active">Active</mat-option>
            <mat-option value="inactive">Inactive</mat-option>
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
export class EditCustodianDialogComponent {
  editForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<EditCustodianDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Custodian
  ) {
    this.editForm = this.fb.group({
      name: [data.name, Validators.required],
      department: [data.department || ''],
      contact_info: [data.contact_info || ''],
      status: [data.status || 'active', Validators.required]
    });
  }

  save() {
    if (this.editForm.valid) {
      this.dialogRef.close({
        id: this.data.id,
        ...this.editForm.value
      });
    }
  }
}

// --- Delete Confirmation Dialog Component ---
@Component({
  selector: 'app-delete-custodian-dialog',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatDialogModule, MatIconModule],
  template: `
    <div class="delete-dialog-container">
      <div class="dialog-header bg-warn-light">
        <div class="icon-circle warn-glow">
          <mat-icon color="warn">warning_amber</mat-icon>
        </div>
        <h2 mat-dialog-title class="dialog-title">Delete Custodian?</h2>
      </div>
      
      <mat-dialog-content class="dialog-content">
        <p class="primary-text">
          You are about to permanently delete <strong>"{{ data.name }}"</strong>.
        </p>
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
export class DeleteCustodianDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<DeleteCustodianDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { name: string }
  ) {}
}

@Component({
  selector: 'app-custodians',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatCardModule, MatFormFieldModule,
    MatInputModule, MatButtonModule, MatIconModule, MatTableModule,
    MatDividerModule, MatProgressSpinnerModule, MatTooltipModule, MatDialogModule, MatSelectModule
  ],
  template: `
    <div class="page-container">
      <div class="welcome-header">
        <div>
          <h1 class="mat-display-1" style="margin:0; font-weight: 600; color: var(--primary-color, #3f51b5);">Manage Custodians</h1>
          <p class="text-muted">Register end-users, property custodians, and project in-charge personnel.</p>
        </div>
      </div>

      <div class="content-grid">
        <!-- Add New Custodian Form -->
        <div class="form-column">
          <mat-card class="form-card">
            <mat-card-header class="custom-card-header">
              <div mat-card-avatar class="header-icon"><mat-icon>person_add</mat-icon></div>
              <mat-card-title>Register Custodian</mat-card-title>
            </mat-card-header>
            <mat-divider></mat-divider>
            
            <mat-card-content class="form-content">
              <form [formGroup]="custodianForm" (ngSubmit)="addCustodian()">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Full Name</mat-label>
                  <input matInput formControlName="name" placeholder="e.g. Dr. Jane Doe">
                  <mat-error *ngIf="custodianForm.get('name')?.hasError('required')">Name is required</mat-error>
                </mat-form-field>
                
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Department/Project</mat-label>
                  <input matInput formControlName="department" placeholder="e.g. Agriculture Dept">
                </mat-form-field>

                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Contact Info</mat-label>
                  <input matInput formControlName="contact_info" placeholder="Email or Phone">
                </mat-form-field>

                <div class="form-actions">
                  <button mat-flat-button color="primary" type="submit" class="full-width-btn" [disabled]="custodianForm.invalid || isSubmitting">
                    <mat-icon>save</mat-icon> {{ isSubmitting ? 'Saving...' : 'Register Custodian' }}
                  </button>
                </div>
              </form>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Custodians Table -->
        <div class="table-column">
          <mat-card class="table-card">
            <mat-card-header class="custom-card-header">
              <div mat-card-avatar class="header-icon"><mat-icon>group</mat-icon></div>
              <mat-card-title>Registered Custodians</mat-card-title>
            </mat-card-header>
            <mat-divider></mat-divider>
            
            <div *ngIf="loading" class="spinner-container">
              <mat-spinner diameter="40"></mat-spinner>
            </div>

            <div class="table-responsive" *ngIf="!loading">
              <table mat-table [dataSource]="dataSource" class="custom-table">
                
                <ng-container matColumnDef="name">
                  <th mat-header-cell *matHeaderCellDef> Name </th>
                  <td mat-cell *matCellDef="let element"> <strong>{{element.name}}</strong> </td>
                </ng-container>

                <ng-container matColumnDef="department">
                  <th mat-header-cell *matHeaderCellDef> Department </th>
                  <td mat-cell *matCellDef="let element" class="text-muted"> {{element.department || '-'}} </td>
                </ng-container>
                
                <ng-container matColumnDef="status">
                  <th mat-header-cell *matHeaderCellDef> Status </th>
                  <td mat-cell *matCellDef="let element">
                    <span class="status-badge" [ngClass]="element.status">{{element.status | uppercase}}</span>
                  </td>
                </ng-container>

                <ng-container matColumnDef="actions">
                  <th mat-header-cell *matHeaderCellDef class="actions-header"> Actions </th>
                  <td mat-cell *matCellDef="let element" class="actions-cell">
                    <button mat-icon-button color="primary" (click)="editCustodian(element)" matTooltip="Edit Custodian">
                      <mat-icon>edit</mat-icon>
                    </button>
                    <button mat-icon-button color="warn" (click)="deleteCustodian(element.id, element.name)" matTooltip="Delete Custodian">
                      <mat-icon>delete_outline</mat-icon>
                    </button>
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: displayedColumns;" class="table-row"></tr>
                
                <tr class="mat-row" *matNoDataRow>
                  <td class="mat-cell empty-state" colspan="4">
                     <p>No custodians found.</p>
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
    .actions-header { text-align: center !important; width: 80px; }
    .actions-cell { text-align: center; }
    
    .status-badge { padding: 4px 8px; border-radius: 12px; font-size: 0.75rem; font-weight: bold; }
    .status-badge.active { background: #e8f5e9; color: #2e7d32; }
    .status-badge.inactive { background: #ffebee; color: #c62828; }

    .empty-state { text-align: center; padding: 40px 20px; color: #95a5a6; }

    @media (max-width: 600px) {
      .page-container { padding: 16px; }
      .welcome-header { margin-bottom: 16px; }
    }
  `]
})
export class CustodiansComponent implements OnInit {
  custodianForm: FormGroup;
  displayedColumns: string[] = ['name', 'department', 'status', 'actions'];
  dataSource = new MatTableDataSource<Custodian>([]);
  loading = true;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private custodianService: CustodianService,
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog
  ) {
    this.custodianForm = this.fb.group({
      name: ['', Validators.required],
      department: [''],
      contact_info: ['']
    });
  }

  async ngOnInit() {
    await this.loadCustodians();
  }

  async loadCustodians() {
    this.loading = true;
    try {
      const data = await this.custodianService.getAll();
      this.dataSource.data = data;
    } catch (e) {
      console.error('Error loading custodians', e);
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  editCustodian(custodian: Custodian) {
    const dialogRef = this.dialog.open(EditCustodianDialogComponent, {
      width: '95vw',
      maxWidth: '400px',
      data: custodian
    });

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result) {
        try {
          this.loading = true;
          await this.custodianService.update(result.id, {
            name: result.name,
            department: result.department,
            contact_info: result.contact_info,
            status: result.status
          });
          await this.loadCustodians();
        } catch (e: any) {
          console.error('Error updating custodian', e);
          alert('Failed to update custodian.');
        } finally {
          this.loading = false;
          this.cdr.detectChanges();
        }
      }
    });
  }

  async addCustodian() {
    if (this.custodianForm.valid) {
      this.isSubmitting = true;
      try {
        const formValue = this.custodianForm.value;
        if (!formValue.department) delete formValue.department;
        if (!formValue.contact_info) delete formValue.contact_info;
        
        await this.custodianService.create(formValue);
        this.custodianForm.reset();
        Object.keys(this.custodianForm.controls).forEach(key => {
          this.custodianForm.get(key)?.setErrors(null);
        });
        
        await this.loadCustodians();
      } catch (e: any) {
        console.error('Error creating custodian', e);
        alert('Failed to save custodian.');
      } finally {
        this.isSubmitting = false;
        this.cdr.detectChanges();
      }
    }
  }

  deleteCustodian(id: string, name: string) {
    const dialogRef = this.dialog.open(DeleteCustodianDialogComponent, {
      width: '95vw',
      maxWidth: '450px',
      data: { name }
    });

    dialogRef.afterClosed().subscribe(async (confirmed) => {
      if (confirmed) {
        try {
          this.loading = true;
          await this.custodianService.delete(id);
          await this.loadCustodians();
        } catch (e) {
          console.error('Error deleting custodian', e);
          alert('Failed to delete custodian.');
        } finally {
          this.loading = false;
          this.cdr.detectChanges();
        }
      }
    });
  }
}
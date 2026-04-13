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
import { CategoryService } from '../../core/services/category.service';
import { Category } from '../../shared/models/category.model';

// --- Edit Category Dialog Component ---
@Component({
  selector: 'app-edit-category-dialog',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatFormFieldModule, 
    MatInputModule, MatButtonModule, MatDialogModule
  ],
  template: `
    <h2 mat-dialog-title>Edit Category</h2>
    <mat-dialog-content>
      <form [formGroup]="editForm" class="dialog-form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Category Name</mat-label>
          <input matInput formControlName="name">
          <mat-error *ngIf="editForm.get('name')?.hasError('required')">Name is required</mat-error>
        </mat-form-field>
        
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Description</mat-label>
          <textarea matInput formControlName="description" rows="3"></textarea>
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
export class EditCategoryDialogComponent {
  editForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<EditCategoryDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Category
  ) {
    this.editForm = this.fb.group({
      name: [data.name, Validators.required],
      description: [data.description || '']
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
  selector: 'app-delete-confirm-dialog',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatDialogModule, MatIconModule],
  template: `
    <div class="delete-dialog-container">
      <div class="dialog-header bg-warn-light">
        <div class="icon-circle warn-glow">
          <mat-icon color="warn">warning_amber</mat-icon>
        </div>
        <h2 mat-dialog-title class="dialog-title">Delete Category?</h2>
      </div>
      
      <mat-dialog-content class="dialog-content">
        <p class="primary-text">
          You are about to permanently delete the <strong>"{{ data.name }}"</strong> category.
        </p>
        <div class="warning-box">
          <mat-icon class="info-icon">info</mat-icon>
          <p class="secondary-text">
            Existing livestock assigned to this category will not be deleted, but their category field may appear empty until re-assigned.
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
    
    .warning-box { display: flex; gap: 12px; align-items: flex-start; background: #f8f9fa; padding: 16px; border-radius: 8px; border-left: 4px solid #95a5a6; text-align: left; }
    .info-icon { color: #95a5a6; font-size: 20px; width: 20px; height: 20px; margin-top: 2px; }
    .secondary-text { margin: 0; font-size: 0.9rem; color: #7f8c8d; line-height: 1.4; }
    
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
export class DeleteConfirmDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<DeleteConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { name: string }
  ) {}
}

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatCardModule, MatFormFieldModule,
    MatInputModule, MatButtonModule, MatIconModule, MatTableModule,
    MatDividerModule, MatProgressSpinnerModule, MatTooltipModule, MatDialogModule
  ],
  template: `
    <div class="page-container">
      <div class="welcome-header">
        <div>
          <h1 class="mat-display-1" style="margin:0; font-weight: 600; color: var(--primary-color, #3f51b5);">Manage Categories</h1>
          <p class="text-muted">Create and manage custom livestock categories.</p>
        </div>
      </div>

      <div class="content-grid">
        <!-- Add New Category Form -->
        <div class="form-column">
          <mat-card class="form-card">
            <mat-card-header class="custom-card-header">
              <div mat-card-avatar class="header-icon"><mat-icon>add_box</mat-icon></div>
              <mat-card-title>Add Livestock Category</mat-card-title>
            </mat-card-header>
            <mat-divider></mat-divider>
            
            <mat-card-content class="form-content">
              <form [formGroup]="categoryForm" (ngSubmit)="addCategory()">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Category Name</mat-label>
                  <input matInput formControlName="name" placeholder="e.g. Mature (Ram)">
                  <mat-error *ngIf="categoryForm.get('name')?.hasError('required')">Name is required</mat-error>
                </mat-form-field>
                
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Description (Optional)</mat-label>
                  <textarea matInput formControlName="description" rows="2" placeholder="Brief description..."></textarea>
                </mat-form-field>

                <div class="form-actions">
                  <button mat-flat-button color="primary" type="submit" class="full-width-btn" [disabled]="categoryForm.invalid || isSubmitting">
                    <mat-icon>save</mat-icon> {{ isSubmitting ? 'Saving...' : 'Save Category' }}
                  </button>
                </div>
              </form>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Categories Table -->
        <div class="table-column">
          <mat-card class="table-card">
            <mat-card-header class="custom-card-header">
              <div mat-card-avatar class="header-icon"><mat-icon>list</mat-icon></div>
              <mat-card-title>Active Categories</mat-card-title>
            </mat-card-header>
            <mat-divider></mat-divider>
            
            <div *ngIf="loading" class="spinner-container">
              <mat-spinner diameter="40"></mat-spinner>
            </div>

            <div class="table-responsive" *ngIf="!loading">
              <table mat-table [dataSource]="dataSource" class="custom-table">
                
                <!-- Name Column -->
                <ng-container matColumnDef="name">
                  <th mat-header-cell *matHeaderCellDef> Name </th>
                  <td mat-cell *matCellDef="let element"> <strong>{{element.name}}</strong> </td>
                </ng-container>

                <!-- Description Column -->
                <ng-container matColumnDef="description">
                  <th mat-header-cell *matHeaderCellDef> Description </th>
                  <td mat-cell *matCellDef="let element" class="text-muted"> {{element.description || '-'}} </td>
                </ng-container>

                <!-- Actions Column -->
                <ng-container matColumnDef="actions">
                  <th mat-header-cell *matHeaderCellDef class="actions-header"> Actions </th>
                  <td mat-cell *matCellDef="let element" class="actions-cell">
                    <button mat-icon-button color="primary" (click)="editCategory(element)" matTooltip="Edit Category">
                      <mat-icon>edit</mat-icon>
                    </button>
                    <button mat-icon-button color="warn" (click)="deleteCategory(element.id, element.name)" matTooltip="Delete Category">
                      <mat-icon>delete_outline</mat-icon>
                    </button>
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: displayedColumns;" class="table-row"></tr>
                
                <tr class="mat-row" *matNoDataRow>
                  <td class="mat-cell empty-state" colspan="3">
                     <p>No custom categories found.</p>
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
    
    .empty-state { text-align: center; padding: 40px 20px; color: #95a5a6; }

    @media (max-width: 600px) {
      .page-container { padding: 16px; }
      .welcome-header { margin-bottom: 16px; }
    }
  `]
})
export class CategoriesComponent implements OnInit {
  categoryForm: FormGroup;
  displayedColumns: string[] = ['name', 'description', 'actions'];
  dataSource = new MatTableDataSource<Category>([]);
  loading = true;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private categoryService: CategoryService,
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog
  ) {
    this.categoryForm = this.fb.group({
      name: ['', Validators.required],
      description: ['']
    });
  }

  async ngOnInit() {
    await this.loadCategories();
  }

  async loadCategories() {
    this.loading = true;
    try {
      const data = await this.categoryService.getAll();
      this.dataSource.data = data;
    } catch (e) {
      console.error('Error loading categories', e);
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  editCategory(category: Category) {
    const dialogRef = this.dialog.open(EditCategoryDialogComponent, {
      width: '95vw',
      maxWidth: '400px',
      data: category
    });

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result) {
        try {
          this.loading = true;
          await this.categoryService.update(result.id, {
            name: result.name,
            description: result.description
          });
          await this.loadCategories();
        } catch (e: any) {
          console.error('Error updating category', e);
          if (e.code === '23505') {
            alert('A category with this name already exists.');
          } else {
            alert('Failed to update category.');
          }
        } finally {
          this.loading = false;
          this.cdr.detectChanges();
        }
      }
    });
  }

  async addCategory() {
    if (this.categoryForm.valid) {
      this.isSubmitting = true;
      try {
        const formValue = this.categoryForm.value;
        if (!formValue.description) delete formValue.description;
        
        await this.categoryService.create(formValue);
        this.categoryForm.reset();
        Object.keys(this.categoryForm.controls).forEach(key => {
          this.categoryForm.get(key)?.setErrors(null);
        });
        
        await this.loadCategories();
      } catch (e: any) {
        console.error('Error creating category', e);
        if (e.code === '23505') {
          alert('A category with this name already exists.');
        } else {
          alert('Failed to save category.');
        }
      } finally {
        this.isSubmitting = false;
        this.cdr.detectChanges();
      }
    }
  }

  deleteCategory(id: string, name: string) {
    const dialogRef = this.dialog.open(DeleteConfirmDialogComponent, {
      width: '95vw',
      maxWidth: '450px',
      data: { name }
    });

    dialogRef.afterClosed().subscribe(async (confirmed) => {
      if (confirmed) {
        try {
          this.loading = true;
          await this.categoryService.delete(id);
          await this.loadCategories();
        } catch (e) {
          console.error('Error deleting category', e);
          alert('Failed to delete category.');
        } finally {
          this.loading = false;
          this.cdr.detectChanges();
        }
      }
    });
  }
}

import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { LivestockService } from '../../../../core/services/livestock.service';
import { CategoryService } from '../../../../core/services/category.service';
import { CustodianService } from '../../../../core/services/custodian.service';
import { Category } from '../../../../shared/models/category.model';
import { Custodian } from '../../../../shared/models/custodian.model';

@Component({
  selector: 'app-add-livestock',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterModule, MatCardModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatDatepickerModule, MatNativeDateModule, MatButtonModule, MatIconModule
  ],
  template: `
    <div class="page-container">
      <div class="header">
        <button mat-icon-button routerLink=".."><mat-icon>arrow_back</mat-icon></button>
        <h2>Add New Livestock</h2>
      </div>

      <mat-card class="form-container">
        <mat-card-content>
          <form [formGroup]="livestockForm" (ngSubmit)="onSubmit()">
            
            <div class="form-row">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Tag Number</mat-label>
                <input matInput formControlName="tag_number" placeholder="e.g. TAG-001">
                <mat-hint>Optional but recommended</mat-hint>
              </mat-form-field>
              
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Name (Optional)</mat-label>
                <input matInput formControlName="name" placeholder="e.g. Bessie">
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Category</mat-label>
                <mat-select formControlName="category">
                  <mat-option *ngFor="let cat of categories" [value]="cat.name">{{cat.name}}</mat-option>
                </mat-select>
                <mat-error *ngIf="livestockForm.get('category')?.hasError('required')">Category is required</mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Gender</mat-label>
                <mat-select formControlName="gender">
                  <mat-option value="male">Male</mat-option>
                  <mat-option value="female">Female</mat-option>
                </mat-select>
                <mat-error *ngIf="livestockForm.get('gender')?.hasError('required')">Gender is required</mat-error>
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Birth Date</mat-label>
                <input matInput [matDatepicker]="picker" formControlName="birth_date">
                <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
                <mat-datepicker #picker></mat-datepicker>
                <mat-error *ngIf="livestockForm.get('birth_date')?.hasError('required')">Birth date is required</mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Assign Custodian</mat-label>
                <mat-select formControlName="custodian_id">
                  <mat-option [value]="null">-- None (Unassigned) --</mat-option>
                  <mat-option *ngFor="let cus of custodians" [value]="cus.id">{{cus.name}} ({{cus.department}})</mat-option>
                </mat-select>
                <mat-hint>Project In-Charge / End-User</mat-hint>
              </mat-form-field>
            </div>

            <div class="actions">
              <button mat-button type="button" routerLink="..">Cancel</button>
              <button mat-raised-button color="primary" type="submit" [disabled]="livestockForm.invalid || loading">
                {{ loading ? 'Saving...' : 'Save Livestock' }}
              </button>
            </div>

          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .page-container { padding: 20px; }
    .header { display: flex; align-items: center; margin-bottom: 20px; gap: 10px; }
    .header h2 { margin: 0; }
    .form-container { max-width: 800px; margin: 0 auto; padding: 20px; }
    .form-row { display: flex; gap: 20px; }
    .full-width { width: 100%; margin-bottom: 15px; }
    .actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px; }

    @media (max-width: 600px) {
      .form-row { flex-direction: column; gap: 0; }
      .actions { flex-direction: column; }
      .actions button { width: 100%; margin-bottom: 8px; }
    }
  `]
})
export class AddLivestockComponent implements OnInit {
  livestockForm: FormGroup;
  loading = false;
  categories: Category[] = [];
  custodians: Custodian[] = [];

  constructor(
    private fb: FormBuilder,
    private livestockService: LivestockService,
    private categoryService: CategoryService,
    private custodianService: CustodianService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.livestockForm = this.fb.group({
      tag_number: [''],
      name: [''],
      category: ['', Validators.required],
      gender: ['', Validators.required],
      birth_date: [new Date(), Validators.required],
      custodian_id: [null]
    });
  }

  async ngOnInit() {
    try {
      [this.categories, this.custodians] = await Promise.all([
        this.categoryService.getAll(),
        this.custodianService.getActive()
      ]);
    } catch (e) {
      console.error('Failed to load form data', e);
    } finally {
      this.cdr.detectChanges();
    }
  }

  async onSubmit() {
    if (this.livestockForm.valid) {
      this.loading = true;
      try {
        const formValue = { ...this.livestockForm.value };
        
        // Supabase expects YYYY-MM-DD format for DATE columns
        const dateObj = new Date(formValue.birth_date);
        formValue.birth_date = dateObj.toISOString().split('T')[0];
        
        // Explicitly format null values properly
        if (!formValue.tag_number) delete formValue.tag_number;
        if (!formValue.name) delete formValue.name;

        await this.livestockService.create(formValue);
        this.router.navigate(['/livestock']);
      } catch (error: any) {
        console.error('Error creating livestock:', error);
        alert('Failed to save. Make sure the tag number is unique if provided.');
      } finally {
        this.loading = false;
      }
    }
  }
}

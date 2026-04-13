import { Component, OnInit } from '@angular/core';
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
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { TransactionService } from '../../../../core/services/transaction.service';
import { LivestockService } from '../../../../core/services/livestock.service';
import { Livestock } from '../../../../shared/models/livestock.model';
import { TransactionConfirmDialogComponent } from '../transaction-list/transaction-list.component';

@Component({
  selector: 'app-add-transaction',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterModule, MatCardModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatDatepickerModule, MatNativeDateModule, MatButtonModule, MatIconModule, MatDialogModule
  ],
  template: `
    <div class="page-container">
      <div class="header">
        <button mat-icon-button routerLink=".."><mat-icon>arrow_back</mat-icon></button>
        <h2>Record Transaction</h2>
      </div>

      <mat-card class="form-container">
        <mat-card-content>
          <form [formGroup]="transactionForm" (ngSubmit)="onSubmit()">
            
            <div class="form-row">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Select Livestock</mat-label>
                <mat-select formControlName="livestock_id">
                  <mat-option *ngFor="let animal of activeLivestock" [value]="animal.id">
                    {{animal.tag_number || 'No Tag'}} - {{animal.category}}
                  </mat-option>
                </mat-select>
                <mat-error *ngIf="transactionForm.get('livestock_id')?.hasError('required')">Livestock is required</mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Transaction Type</mat-label>
                <mat-select formControlName="type">
                  <mat-option *ngFor="let type of transactionTypes" [value]="type.value">{{type.label}}</mat-option>
                </mat-select>
                <mat-error *ngIf="transactionForm.get('type')?.hasError('required')">Type is required</mat-error>
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Transaction Date</mat-label>
                <input matInput [matDatepicker]="picker" formControlName="transaction_date">
                <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
                <mat-datepicker #picker></mat-datepicker>
                <mat-error *ngIf="transactionForm.get('transaction_date')?.hasError('required')">Date is required</mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Amount (₱)</mat-label>
                <input matInput type="number" formControlName="amount" placeholder="0.00">
                <mat-hint>Optional. Use for purchases/sales.</mat-hint>
              </mat-form-field>
            </div>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Notes</mat-label>
              <textarea matInput formControlName="notes" rows="3" placeholder="Add any relevant notes here..."></textarea>
            </mat-form-field>

            <div class="file-upload-container">
              <label class="file-upload-label">Supporting Document (Optional)</label>
              <div class="file-upload-box">
                <input type="file" (change)="onFileSelected($event)" accept="image/*,.pdf" #fileInput style="display: none;">
                <button mat-stroked-button type="button" color="primary" (click)="fileInput.click()">
                  <mat-icon>upload_file</mat-icon> Choose File
                </button>
                <span class="file-name" *ngIf="selectedFile">{{selectedFile.name}}</span>
                <span class="file-name text-muted" *ngIf="!selectedFile">No file chosen (e.g. Vet Certificate, ICS)</span>
              </div>
            </div>

            <div class="actions">
              <button mat-button type="button" routerLink="..">Cancel</button>
              <button mat-raised-button color="primary" type="submit" [disabled]="transactionForm.invalid || loading">
                {{ loading ? 'Saving...' : 'Save Transaction' }}
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
    
    .file-upload-container { margin-bottom: 20px; }
    .file-upload-label { display: block; font-size: 0.95rem; font-weight: 500; color: #34495e; margin-bottom: 8px; }
    .file-upload-box { display: flex; align-items: center; gap: 12px; padding: 12px; border: 1px dashed #bdc3c7; border-radius: 8px; background-color: #fafafa; }
    .file-name { font-size: 0.9rem; color: #2c3e50; }
    .text-muted { color: #95a5a6; }
    
    .actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px; }

    @media (max-width: 600px) {
      .form-row { flex-direction: column; gap: 0; }
      .actions { flex-direction: column; }
      .actions button { width: 100%; margin-bottom: 8px; }
    }
  `]
})
export class AddTransactionComponent implements OnInit {
  transactionForm: FormGroup;
  loading = false;
  activeLivestock: Livestock[] = [];
  selectedFile: File | null = null;
  
  transactionTypes = [
    { value: 'birth', label: 'Birth' },
    { value: 'purchase', label: 'Purchase' },
    { value: 'sale', label: 'Sale' },
    { value: 'death', label: 'Death' },
    { value: 'transfer_in', label: 'Transfer In' },
    { value: 'transfer_out', label: 'Transfer Out' }
  ];

  constructor(
    private fb: FormBuilder,
    private transactionService: TransactionService,
    private livestockService: LivestockService,
    private router: Router,
    private dialog: MatDialog
  ) {
    this.transactionForm = this.fb.group({
      livestock_id: ['', Validators.required],
      type: ['', Validators.required],
      transaction_date: [new Date(), Validators.required],
      amount: [null],
      notes: ['']
    });
  }

  async ngOnInit() {
    try {
      const allLivestock = await this.livestockService.getAll();
      this.activeLivestock = allLivestock;
    } catch (e) {
      console.error('Error loading livestock', e);
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    }
  }

  async onSubmit() {
    if (this.transactionForm.valid) {
      this.loading = true;
      try {
        const formValue = { ...this.transactionForm.value };
        
        // Format Date
        const dateObj = new Date(formValue.transaction_date);
        formValue.transaction_date = dateObj.toISOString().split('T')[0];
        
        if (!formValue.amount) delete formValue.amount;
        if (!formValue.notes) delete formValue.notes;
        
        // Handle File Upload
        if (this.selectedFile) {
          try {
            const url = await this.transactionService.uploadDocument(this.selectedFile);
            formValue.document_url = url;
          } catch (uploadErr) {
            console.error('File upload failed:', uploadErr);
            this.dialog.open(TransactionConfirmDialogComponent, {
              width: '400px',
              data: {
                title: 'Upload Warning',
                message: 'File upload failed. Transaction will be saved without document.',
                isError: true,
                showCancel: false,
                confirmText: 'OK'
              }
            });
          }
        }
        
        // By default, transactions are pending validation from Property Office
        formValue.validation_status = 'pending';

        await this.transactionService.create(formValue);
        this.router.navigate(['/transactions']);
      } catch (error: any) {
        console.error('Error creating transaction:', error);
        this.dialog.open(TransactionConfirmDialogComponent, {
          width: '400px',
          data: {
            title: 'Error',
            message: 'Failed to save transaction. Please try again.',
            isError: true,
            showCancel: false,
            confirmText: 'Close'
          }
        });
      } finally {
        this.loading = false;
      }
    }
  }
}

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
import { TransactionService } from '../../../../core/services/transaction.service';
import { LivestockService } from '../../../../core/services/livestock.service';
import { Livestock } from '../../../../shared/models/livestock.model';

@Component({
  selector: 'app-add-transaction',
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
    .actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px; }
  `]
})
export class AddTransactionComponent implements OnInit {
  transactionForm: FormGroup;
  loading = false;
  activeLivestock: Livestock[] = [];
  
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
    private router: Router
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
      // Fetch ALL livestock for transactions (because a transaction could be a birth or purchase 
      // where the animal isn't fully "active" yet, or we might be editing a past transaction)
      const allLivestock = await this.livestockService.getAll();
      this.activeLivestock = allLivestock;
    } catch (e) {
      console.error('Error loading livestock', e);
    }
  }

  async onSubmit() {
    if (this.transactionForm.valid) {
      this.loading = true;
      try {
        const formValue = { ...this.transactionForm.value };
        
        // Supabase expects YYYY-MM-DD format for DATE columns
        const dateObj = new Date(formValue.transaction_date);
        formValue.transaction_date = dateObj.toISOString().split('T')[0];
        
        if (!formValue.amount) delete formValue.amount;
        if (!formValue.notes) delete formValue.notes;

        await this.transactionService.create(formValue);
        this.router.navigate(['/transactions']);
      } catch (error: any) {
        console.error('Error creating transaction:', error);
        alert('Failed to save transaction.');
      } finally {
        this.loading = false;
      }
    }
  }
}

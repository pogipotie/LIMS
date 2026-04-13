import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatDividerModule } from '@angular/material/divider';
import { UserService } from '../../core/services/user.service';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatCardModule, MatFormFieldModule,
    MatInputModule, MatButtonModule, MatIconModule, MatTableModule, MatDividerModule
  ],
  template: `
    <div class="page-container">
      <div class="welcome-header">
        <h1 class="mat-display-1" style="margin:0; font-weight: 600; color: var(--primary-color);">System Users</h1>
        <p class="text-muted">Manage staff accounts and permissions.</p>
      </div>

      <div class="content-grid">
        <!-- Add User Form -->
        <div class="form-column">
          <mat-card class="form-card">
            <mat-card-header class="custom-card-header">
              <div mat-card-avatar class="header-icon"><mat-icon>person_add</mat-icon></div>
              <mat-card-title>Create Staff Account</mat-card-title>
            </mat-card-header>
            <mat-divider></mat-divider>
            
            <mat-card-content class="form-content">
              <form [formGroup]="userForm" (ngSubmit)="createUser()">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Email Address</mat-label>
                  <input matInput type="email" formControlName="email" placeholder="staff@university.edu" required>
                  <mat-error *ngIf="userForm.get('email')?.hasError('email')">Please enter a valid email</mat-error>
                </mat-form-field>
                
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Password</mat-label>
                  <input matInput type="password" formControlName="password" required>
                  <mat-hint>Must be at least 6 characters.</mat-hint>
                </mat-form-field>

                <div class="form-actions" style="margin-top: 20px;">
                  <button mat-flat-button color="primary" type="submit" class="full-width-btn" [disabled]="userForm.invalid || isSubmitting">
                    <mat-icon>person_add</mat-icon> {{ isSubmitting ? 'Creating...' : 'Create Account' }}
                  </button>
                </div>
              </form>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Users List -->
        <div class="table-column">
          <mat-card class="table-card">
            <mat-card-header class="custom-card-header">
              <div mat-card-avatar class="header-icon"><mat-icon>group</mat-icon></div>
              <mat-card-title>Registered Accounts</mat-card-title>
            </mat-card-header>
            <mat-divider></mat-divider>
            
            <div class="table-responsive">
              <table mat-table [dataSource]="users" class="custom-table">
                
                <ng-container matColumnDef="id">
                  <th mat-header-cell *matHeaderCellDef> User ID </th>
                  <td mat-cell *matCellDef="let element"> <span style="font-family: monospace;">{{element.user_id | slice:0:8}}...</span> </td>
                </ng-container>

                <ng-container matColumnDef="role">
                  <th mat-header-cell *matHeaderCellDef> Role </th>
                  <td mat-cell *matCellDef="let element">
                    <span class="role-badge" [ngClass]="element.role">{{element.role | uppercase}}</span>
                  </td>
                </ng-container>

                <ng-container matColumnDef="date">
                  <th mat-header-cell *matHeaderCellDef> Created </th>
                  <td mat-cell *matCellDef="let element" class="text-muted"> {{element.created_at | date}} </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: displayedColumns;" class="table-row"></tr>
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
    @media (max-width: 960px) { .content-grid { grid-template-columns: 1fr; } }
    .form-card, .table-card { border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.04) !important; overflow: hidden; }
    .custom-card-header { padding: 20px; align-items: center; background-color: white; }
    .header-icon { display: flex; justify-content: center; align-items: center; background-color: rgba(var(--primary-color-rgb, 63, 81, 181), 0.1); border-radius: 50%; color: var(--primary-color); margin-right: 16px; }
    .form-content { padding: 24px !important; }
    .full-width { width: 100%; margin-bottom: 8px; }
    .full-width-btn { width: 100%; padding: 8px; font-size: 1.05rem; border-radius: 8px; height: 48px; }
    .custom-table { width: 100%; }
    th.mat-header-cell { font-size: 0.95rem; font-weight: 600; color: #34495e; background-color: #fafafa; padding: 16px; }
    td.mat-cell { padding: 16px; border-bottom: 1px solid #f0f0f0; font-size: 0.95rem; color: #2c3e50; }
    .role-badge { padding: 4px 8px; border-radius: 12px; font-size: 0.75rem; font-weight: bold; }
    .role-badge.admin { background: #e8eaf6; color: #3f51b5; border: 1px solid #c5cae9; }
    .role-badge.staff { background: #e0f2f1; color: #00796b; border: 1px solid #b2dfdb; }
    @media (max-width: 600px) { .page-container { padding: 16px; } }
  `]
})
export class UsersComponent implements OnInit {
  userForm: FormGroup;
  isSubmitting = false;
  users: any[] = [];
  displayedColumns: string[] = ['id', 'role', 'date'];

  constructor(private fb: FormBuilder, private userService: UserService) {
    this.userForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  async ngOnInit() {
    await this.loadUsers();
  }

  async loadUsers() {
    try {
      this.users = await this.userService.getAllUsers();
    } catch (e) {
      console.error('Failed to load users', e);
    }
  }

  async createUser() {
    if (this.userForm.valid) {
      this.isSubmitting = true;
      try {
        const { email, password } = this.userForm.value;
        await this.userService.createStaffUser(email, password);
        alert('Staff account created successfully!');
        this.userForm.reset();
        Object.keys(this.userForm.controls).forEach(key => {
          this.userForm.get(key)?.setErrors(null);
        });
        await this.loadUsers();
      } catch (error: any) {
        console.error('Error creating user:', error);
        alert('Failed to create account. Make sure you ran the 006 SQL migration in Supabase.');
      } finally {
        this.isSubmitting = false;
      }
    }
  }
}
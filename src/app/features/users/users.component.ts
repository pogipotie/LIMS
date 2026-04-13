import { Component, OnInit, Inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatDividerModule } from '@angular/material/divider';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule, MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UserService } from '../../core/services/user.service';
import { AuthService } from '../../core/services/auth.service';
import { SupabaseService } from '../../core/services/supabase.service';
import { ResetPasswordDialogComponent } from './components/reset-password-dialog/reset-password-dialog.component';

@Component({
  selector: 'app-delete-user-dialog',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatDialogModule, MatIconModule],
  template: `
    <div class="delete-dialog-container">
      <div class="dialog-header bg-warn-light">
        <div class="icon-circle warn-glow">
          <mat-icon color="warn">warning_amber</mat-icon>
        </div>
        <h2 mat-dialog-title class="dialog-title">Delete System User?</h2>
      </div>
      
      <mat-dialog-content class="dialog-content">
        <p class="primary-text">
          You are about to permanently delete the user ID: <strong>{{ data.userId | slice:0:8 }}...</strong>
        </p>
        <p class="secondary-text" style="color: #e65100; font-size: 0.9rem;">
          This action will immediately revoke their access to the system. This cannot be undone.
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
    .primary-text { font-size: 1.1rem; color: #34495e; margin-bottom: 12px; line-height: 1.5; }
    .dialog-actions { padding: 16px 32px 32px !important; display: flex; gap: 16px; justify-content: center; margin-bottom: 0; }
    .action-btn { padding: 8px 24px; font-size: 1rem; border-radius: 8px; height: 48px; min-width: 140px; }
    .delete-btn { box-shadow: 0 4px 12px rgba(244, 67, 54, 0.2); }
  `]
})
export class DeleteUserDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<DeleteUserDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { userId: string }
  ) {}
}

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatCardModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatButtonModule, MatIconModule, MatTableModule, 
    MatDividerModule, MatMenuModule, MatDialogModule
  ],
  template: `
    <div class="page-container">
      <div class="welcome-header">
        <h1 class="mat-display-1" style="margin:0; font-weight: 600; color: var(--primary-color);">System Users</h1>
        <p class="text-muted">Manage staff and custodian accounts.</p>
      </div>

      <div class="content-grid">
        <!-- Add User Form -->
        <div class="form-column">
          <mat-card class="form-card">
            <mat-card-header class="custom-card-header">
              <div mat-card-avatar class="header-icon"><mat-icon>person_add</mat-icon></div>
              <mat-card-title>Create User Account</mat-card-title>
            </mat-card-header>
            <mat-divider></mat-divider>
            
            <mat-card-content class="form-content">
              <div *ngIf="errorMessage" class="error-banner">
                <mat-icon>error_outline</mat-icon>
                <span>{{ errorMessage }}</span>
              </div>
              <div *ngIf="successMessage" class="success-banner">
                <mat-icon>check_circle_outline</mat-icon>
                <span>{{ successMessage }}</span>
              </div>

              <form [formGroup]="userForm" (ngSubmit)="createUser()">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Account Role</mat-label>
                  <mat-select formControlName="role" required>
                    <mat-option value="staff">Staff (Office Encoder)</mat-option>
                    <mat-option value="custodian">Custodian (Farm Worker)</mat-option>
                  </mat-select>
                </mat-form-field>

                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Full Name</mat-label>
                  <input matInput type="text" formControlName="fullName" placeholder="John Doe" required>
                  <mat-error *ngIf="userForm.get('fullName')?.hasError('required')">Full name is required</mat-error>
                </mat-form-field>

                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Email Address</mat-label>
                  <input matInput type="email" formControlName="email" placeholder="staff@university.edu" required>
                  <mat-error *ngIf="userForm.get('email')?.hasError('email')">Please enter a valid email</mat-error>
                </mat-form-field>
                
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Password</mat-label>
                  <input matInput [type]="hidePassword ? 'password' : 'text'" formControlName="password" required>
                  <button mat-icon-button matSuffix (click)="hidePassword = !hidePassword" [attr.aria-label]="'Hide password'" [attr.aria-pressed]="hidePassword" type="button">
                    <mat-icon>{{hidePassword ? 'visibility_off' : 'visibility'}}</mat-icon>
                  </button>
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
                
                <ng-container matColumnDef="name">
                  <th mat-header-cell *matHeaderCellDef> Name </th>
                  <td mat-cell *matCellDef="let element">
                    <div style="display: flex; align-items: center; gap: 8px;">
                      <span style="font-weight: 600; color: #2c3e50;">{{element.full_name || 'No Name'}}</span>
                    </div>
                    <div style="font-size: 0.85rem; color: #7f8c8d; margin-top: 4px; display: flex; align-items: center; gap: 4px;">
                      <mat-icon style="font-size: 14px; width: 14px; height: 14px;">email</mat-icon>
                      {{element.email || (element.user_id | slice:0:8) + '...'}}
                    </div>
                  </td>
                </ng-container>

                <ng-container matColumnDef="status">
                  <th mat-header-cell *matHeaderCellDef> Status </th>
                  <td mat-cell *matCellDef="let element">
                    <span *ngIf="element.email_confirmed_at !== null && element.email_confirmed_at !== undefined" class="status-chip verified" title="Email Verified"><mat-icon>check_circle</mat-icon> Verified</span>
                    <span *ngIf="element.email !== undefined && (element.email_confirmed_at === null || element.email_confirmed_at === undefined)" class="status-chip pending" title="Pending Email Confirmation"><mat-icon>schedule</mat-icon> Pending</span>
                    <span *ngIf="element.email === undefined" class="text-muted" style="font-size: 0.8rem;">Unknown</span>
                  </td>
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

                <ng-container matColumnDef="actions">
                  <th mat-header-cell *matHeaderCellDef style="text-align: right;"> Actions </th>
                  <td mat-cell *matCellDef="let element" style="text-align: right;">
                    <button mat-icon-button [matMenuTriggerFor]="menu" *ngIf="element.user_id !== currentUserId">
                      <mat-icon>more_vert</mat-icon>
                    </button>
                    <mat-menu #menu="matMenu">
                      <button mat-menu-item (click)="changeRole(element.user_id, element.role === 'admin' ? 'staff' : 'admin')">
                        <mat-icon>swap_horiz</mat-icon>
                        <span>Make {{element.role === 'admin' ? 'Staff' : 'Admin'}}</span>
                      </button>

                      <!-- If Email is Verified: Show Reset Password -->
                      <button mat-menu-item *ngIf="element.email_confirmed_at !== null && element.email_confirmed_at !== undefined" (click)="resetPassword(element.user_id)">
                        <mat-icon color="primary">vpn_key</mat-icon>
                        <span>Reset Password</span>
                      </button>

                      <!-- If Email is Pending: Show Resend Confirmation -->
                      <button mat-menu-item *ngIf="element.email !== undefined && (element.email_confirmed_at === null || element.email_confirmed_at === undefined)" (click)="resendConfirmation(element.email)">
                        <mat-icon color="accent" style="color: #ff9800;">mark_email_unread</mat-icon>
                        <span>Resend Confirmation</span>
                      </button>

                      <button mat-menu-item (click)="deleteUser(element.user_id)" style="color: #c62828;">
                        <mat-icon color="warn">delete_outline</mat-icon>
                        <span>Delete Account</span>
                      </button>
                    </mat-menu>
                    <span *ngIf="element.user_id === currentUserId" class="text-muted" style="font-size: 0.8rem; padding-right: 12px;">(You)</span>
                  </td>
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
    .role-badge.custodian { background: #fff3e0; color: #e65100; border: 1px solid #ffe0b2; }
    .error-banner { background-color: #fde8e8; color: #c81e1e; padding: 12px 16px; border-radius: 6px; display: flex; align-items: flex-start; gap: 12px; margin-bottom: 20px; font-size: 0.9rem; line-height: 1.4; word-break: break-word; }
    .error-banner mat-icon { font-size: 20px; width: 20px; height: 20px; flex-shrink: 0; margin-top: 2px; }
    .success-banner { background-color: #def7ec; color: #03543f; padding: 12px 16px; border-radius: 6px; display: flex; align-items: flex-start; gap: 12px; margin-bottom: 20px; font-size: 0.9rem; line-height: 1.4; word-break: break-word; }
    .success-banner mat-icon { font-size: 20px; width: 20px; height: 20px; flex-shrink: 0; margin-top: 2px; }
    .status-chip { display: inline-flex; align-items: center; gap: 4px; padding: 2px 8px; border-radius: 12px; font-size: 0.7rem; font-weight: 600; letter-spacing: 0.5px; text-transform: uppercase; }
    .status-chip mat-icon { font-size: 12px; width: 12px; height: 12px; }
    .status-chip.verified { background-color: #e6f4ea; color: #1e8e3e; border: 1px solid #ceead6; }
    .status-chip.pending { background-color: #fef7e0; color: #e67c73; border: 1px solid #fde293; }
    @media (max-width: 600px) { .page-container { padding: 16px; } }
  `]
})
export class UsersComponent implements OnInit {
  userForm: FormGroup;
  isSubmitting = false;
  hidePassword = true;
  errorMessage = '';
  successMessage = '';
  users: any[] = [];
  displayedColumns: string[] = ['name', 'status', 'role', 'date', 'actions'];
  currentUserId: string | null = null;

  constructor(
    private fb: FormBuilder, 
    private userService: UserService,
    private authService: AuthService,
    private supabase: SupabaseService,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef
  ) {
    this.userForm = this.fb.group({
      role: ['staff', Validators.required],
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  async ngOnInit() {
    const session = await this.authService.session;
    this.currentUserId = session.data.session?.user.id || null;
    await this.loadUsers();
  }

  async loadUsers() {
    try {
      this.users = await this.userService.getAllUsers();
      console.log('Loaded users data:', this.users); // Temporary debug log to check data
    } catch (e) {
      console.error('Failed to load users', e);
    } finally {
      this.cdr.detectChanges(); // Force UI update
    }
  }

  async changeRole(userId: string, newRole: string) {
    if (confirm(`Are you sure you want to change this user's role to ${newRole.toUpperCase()}?`)) {
      try {
        await this.userService.updateUserRole(userId, newRole);
        await this.loadUsers();
      } catch (error) {
        console.error('Error changing role:', error);
        alert('Failed to change user role.');
      }
    }
  }

  async resendConfirmation(email: string) {
    this.errorMessage = '';
    this.successMessage = '';
    this.cdr.detectChanges();
    try {
      await this.userService.resendConfirmationEmail(email);
      this.successMessage = `Confirmation email successfully resent to ${email}`;
      
      // Auto dismiss
      setTimeout(() => {
        this.successMessage = '';
        this.cdr.detectChanges();
      }, 4000);
    } catch (error: any) {
      console.error('Error resending confirmation:', error);
      
      if (error.code === 'over_email_send_rate_limit' || error.message?.includes('rate limit')) {
        this.errorMessage = 'Too many requests. Please wait a moment before trying to resend the confirmation email.';
      } else {
        this.errorMessage = 'Failed to resend confirmation email: ' + (error.message || 'Unknown error');
      }
    } finally {
      this.cdr.detectChanges();
    }
  }

  async resetPassword(userId: string) {
    // First, we need to fetch the email of the user since we only have user_id from user_roles
    // Supabase JS doesn't let us easily query auth.users from frontend unless we use an edge function
    // But we can try to fetch the email from a custom RPC or ask the admin for it if we don't have it.
    // To make it seamless, let's create a quick RPC to get user email by ID.
    try {
      const { data: userEmail, error } = await this.supabase.client.rpc('get_user_email_by_id', {
        p_user_id: userId
      });

      if (error || !userEmail) {
        throw new Error('Could not retrieve user email. Make sure the 008 SQL migration is run.');
      }

      this.dialog.open(ResetPasswordDialogComponent, {
        width: '95vw',
        maxWidth: '450px',
        data: { email: userEmail }
      });
    } catch (err: any) {
      console.error(err);
      alert(err.message);
    }
  }

  deleteUser(userId: string) {
    const dialogRef = this.dialog.open(DeleteUserDialogComponent, {
      width: '95vw',
      maxWidth: '450px',
      data: { userId }
    });

    dialogRef.afterClosed().subscribe(async (confirmed) => {
      if (confirmed) {
        try {
          await this.userService.deleteUser(userId);
          await this.loadUsers();
        } catch (error) {
          console.error('Error deleting user:', error);
          alert('Failed to delete the user. Make sure you ran the 007 SQL migration.');
        }
      }
    });
  }

  async createUser() {
    if (this.userForm.valid) {
      this.errorMessage = '';
      this.successMessage = '';
      this.isSubmitting = true;
      this.cdr.detectChanges(); // Force UI update
      
      try {
        const { fullName, email, password, role } = this.userForm.value;
        await this.userService.createUserAccount(email, password, fullName, role);
        
        this.successMessage = 'User account created! Please remind them to check their inbox to confirm their email.';
        this.userForm.reset({ role: 'staff' });
        Object.keys(this.userForm.controls).forEach(key => {
          this.userForm.get(key)?.setErrors(null);
        });
        await this.loadUsers();
        
        // Clear success message after 4 seconds
        setTimeout(() => {
          this.successMessage = '';
          this.cdr.detectChanges();
        }, 4000);
      } catch (error: any) {
        console.error('Error creating user:', error);
        
        let errorMsg = 'An unknown error occurred';
        if (typeof error === 'string') {
          errorMsg = error;
        } else if (error && typeof error === 'object') {
          if (error.message) {
            try {
              const parsed = JSON.parse(error.message);
              errorMsg = parsed.message || error.message;
              error = parsed; 
            } catch (e) {
              errorMsg = error.message;
            }
          }
        }

        if (error.code === 'over_email_send_rate_limit' || errorMsg.includes('rate limit')) {
          this.errorMessage = 'Too many requests. Please wait a moment before trying to create another account.';
        } else {
          this.errorMessage = 'Failed to create account: ' + errorMsg;
        }
      } finally {
        this.isSubmitting = false;
        this.cdr.detectChanges(); // Force UI update
      }
    }
  }
}
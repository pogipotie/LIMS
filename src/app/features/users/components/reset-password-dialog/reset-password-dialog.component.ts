import { Component, Inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { UserService } from '../../../../core/services/user.service';

@Component({
  selector: 'app-reset-password-dialog',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatDialogModule, MatButtonModule, 
    MatFormFieldModule, MatInputModule, MatIconModule
  ],
  template: `
    <div class="reset-dialog-container">
      <div class="dialog-header">
        <div class="icon-circle">
          <mat-icon color="primary">vpn_key</mat-icon>
        </div>
        <h2 mat-dialog-title>Reset Password</h2>
      </div>

      <mat-dialog-content>
        <div *ngIf="errorMessage" class="error-banner">
          <mat-icon>error_outline</mat-icon>
          <span>{{ errorMessage }}</span>
        </div>
        <div *ngIf="successMessage" class="success-banner">
          <mat-icon>check_circle_outline</mat-icon>
          <span>{{ successMessage }}</span>
        </div>

        <div *ngIf="step === 1" class="step-content">
          <p>Send a password reset email to:</p>
          <p class="email-highlight">{{ data.email }}</p>
          <p class="helper-text">The staff member will receive an 8-digit confirmation code. They must provide this code to you to proceed.</p>
        </div>

        <div *ngIf="step === 2" class="step-content">
          <p class="helper-text mb-4">Enter the confirmation code sent to the staff member's email, along with their new password.</p>
          
          <form [formGroup]="resetForm">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Confirmation Code (OTP)</mat-label>
              <input matInput formControlName="otp" placeholder="12345678" required>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>New Password</mat-label>
              <input matInput [type]="hidePassword ? 'password' : 'text'" formControlName="newPassword" required>
              <button mat-icon-button matSuffix (click)="hidePassword = !hidePassword" type="button">
                <mat-icon>{{hidePassword ? 'visibility_off' : 'visibility'}}</mat-icon>
              </button>
            </mat-form-field>
          </form>
        </div>
      </mat-dialog-content>

      <mat-dialog-actions align="center" class="dialog-actions">
        <button mat-stroked-button mat-dialog-close [disabled]="isSubmitting">Cancel</button>
        
        <button *ngIf="step === 1" mat-flat-button color="primary" (click)="sendResetCode()" [disabled]="isSubmitting">
          {{ isSubmitting ? 'Sending...' : 'Send Reset Code' }}
        </button>

        <button *ngIf="step === 2" mat-flat-button color="primary" (click)="verifyAndReset()" [disabled]="isSubmitting || resetForm.invalid">
          {{ isSubmitting ? 'Resetting...' : 'Confirm & Reset' }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .reset-dialog-container { overflow: hidden; }
    .dialog-header { display: flex; flex-direction: column; align-items: center; padding: 24px 24px 8px; }
    .icon-circle { width: 56px; height: 56px; border-radius: 50%; background: #e8eaf6; display: flex; justify-content: center; align-items: center; margin-bottom: 16px; }
    .icon-circle mat-icon { font-size: 28px; width: 28px; height: 28px; }
    .email-highlight { font-weight: 600; color: #3f51b5; font-size: 1.1rem; text-align: center; margin: 8px 0; }
    .helper-text { color: #666; font-size: 0.9rem; text-align: center; line-height: 1.4; }
    .mb-4 { margin-bottom: 16px; }
    .step-content { padding: 8px 16px; display: flex; flex-direction: column; align-items: center; }
    .full-width { width: 100%; margin-bottom: 8px; }
    .dialog-actions { padding: 16px 24px 24px; gap: 12px; margin-bottom: 0; }
    form { width: 100%; }
    .error-banner { background-color: #fde8e8; color: #c81e1e; padding: 12px 16px; border-radius: 6px; display: flex; align-items: flex-start; gap: 12px; margin: 0 16px 16px; font-size: 0.9rem; line-height: 1.4; word-break: break-word; }
    .error-banner mat-icon { font-size: 20px; width: 20px; height: 20px; flex-shrink: 0; margin-top: 2px; }
    .success-banner { background-color: #def7ec; color: #03543f; padding: 12px 16px; border-radius: 6px; display: flex; align-items: flex-start; gap: 12px; margin: 0 16px 16px; font-size: 0.9rem; line-height: 1.4; word-break: break-word; }
    .success-banner mat-icon { font-size: 20px; width: 20px; height: 20px; flex-shrink: 0; margin-top: 2px; }
  `]
})
export class ResetPasswordDialogComponent {
  step = 1;
  isSubmitting = false;
  hidePassword = true;
  errorMessage = '';
  successMessage = '';
  
  resetForm: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<ResetPasswordDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { email: string },
    private fb: FormBuilder,
    private userService: UserService,
    private cdr: ChangeDetectorRef
  ) {
    this.resetForm = this.fb.group({
      otp: ['', [Validators.required, Validators.minLength(8)]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  async sendResetCode() {
    this.errorMessage = '';
    this.successMessage = '';
    this.isSubmitting = true;
    this.cdr.detectChanges(); // Force UI update
    try {
      await this.userService.sendPasswordResetEmail(this.data.email);
      this.step = 2; // Move to verification step
      this.successMessage = 'Reset code sent successfully!';
      this.cdr.detectChanges(); // Force UI update
      setTimeout(() => {
        this.successMessage = '';
        this.cdr.detectChanges();
      }, 3000); // Clear after 3 seconds
    } catch (error: any) {
      console.error('Error sending reset email:', error);
      
      // Handle the error object properly whether it's a string or an object with a message property
      let errorMsg = 'An unknown error occurred';
      if (typeof error === 'string') {
        errorMsg = error;
      } else if (error && typeof error === 'object') {
        // Sometimes Supabase errors are nested or stringified JSON
        if (error.message) {
          try {
            // Try to parse if it's stringified JSON
            const parsed = JSON.parse(error.message);
            errorMsg = parsed.message || error.message;
            error = parsed; // update the error object so the code check below works
          } catch (e) {
            errorMsg = error.message;
          }
        }
      }

      if (error.code === 'over_email_send_rate_limit' || errorMsg.includes('rate limit')) {
        this.errorMessage = 'Too many requests. Please wait a moment before trying again.';
      } else {
        this.errorMessage = 'Failed to send reset code: ' + errorMsg;
      }
      this.cdr.detectChanges(); // Force UI update
    } finally {
      this.isSubmitting = false;
      this.cdr.detectChanges(); // Force UI update
    }
  }

  async verifyAndReset() {
    if (this.resetForm.invalid) return;

    this.errorMessage = '';
    this.successMessage = '';
    this.isSubmitting = true;
    this.cdr.detectChanges(); // Force UI update
    try {
      const { otp, newPassword } = this.resetForm.value;
      await this.userService.verifyAndResetPassword(this.data.email, otp, newPassword);
      this.successMessage = 'Password successfully reset!';
      this.cdr.detectChanges(); // Force UI update
      
      // Delay closing so the user can see the success message
      setTimeout(() => {
        this.dialogRef.close(true);
      }, 1500);
    } catch (error: any) {
      console.error('Error verifying OTP/resetting password:', error);
      
      let errorMsg = error.message;
      if (error.code === 'otp_expired' || error.message.includes('Token has expired or is invalid')) {
        errorMsg = 'The confirmation code you entered is invalid or has expired. Please double-check the code or request a new one.';
      }
      
      this.errorMessage = errorMsg;
      this.cdr.detectChanges(); // Force UI update
    } finally {
      this.isSubmitting = false;
      this.cdr.detectChanges(); // Force UI update
    }
  }
}
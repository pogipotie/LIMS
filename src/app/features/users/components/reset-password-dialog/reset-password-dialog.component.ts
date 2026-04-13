import { Component, Inject } from '@angular/core';
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
        <div *ngIf="step === 1" class="step-content">
          <p>Send a password reset email to:</p>
          <p class="email-highlight">{{ data.email }}</p>
          <p class="helper-text">The staff member will receive a 6-digit confirmation code. They must provide this code to you to proceed.</p>
        </div>

        <div *ngIf="step === 2" class="step-content">
          <p class="helper-text mb-4">Enter the confirmation code sent to the staff member's email, along with their new password.</p>
          
          <form [formGroup]="resetForm">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Confirmation Code (OTP)</mat-label>
              <input matInput formControlName="otp" placeholder="123456" required>
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
  `]
})
export class ResetPasswordDialogComponent {
  step = 1;
  isSubmitting = false;
  hidePassword = true;
  
  resetForm: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<ResetPasswordDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { email: string },
    private fb: FormBuilder,
    private userService: UserService
  ) {
    this.resetForm = this.fb.group({
      otp: ['', [Validators.required, Validators.minLength(6)]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  async sendResetCode() {
    this.isSubmitting = true;
    try {
      await this.userService.sendPasswordResetEmail(this.data.email);
      this.step = 2; // Move to verification step
    } catch (error: any) {
      console.error('Error sending reset email:', error);
      alert('Failed to send reset code: ' + error.message);
    } finally {
      this.isSubmitting = false;
    }
  }

  async verifyAndReset() {
    if (this.resetForm.invalid) return;

    this.isSubmitting = true;
    try {
      const { otp, newPassword } = this.resetForm.value;
      await this.userService.verifyAndResetPassword(this.data.email, otp, newPassword);
      alert('Password successfully reset!');
      this.dialogRef.close(true);
    } catch (error: any) {
      console.error('Error verifying OTP/resetting password:', error);
      alert('Failed to reset password: ' + error.message);
    } finally {
      this.isSubmitting = false;
    }
  }
}
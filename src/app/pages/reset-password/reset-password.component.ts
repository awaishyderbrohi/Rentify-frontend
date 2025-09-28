import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

// Custom validator for password confirmation
function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('newPassword');
  const confirmPassword = control.get('confirmPassword');

  if (!password || !confirmPassword) {
    return null;
  }

  return password.value === confirmPassword.value ? null : { passwordMismatch: true };
}

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">

      <!-- Background Pattern -->
      <div class="absolute inset-0 overflow-hidden pointer-events-none">

      </div>

      <div class="max-w-md w-full space-y-8 relative z-10">

        <!-- Header -->
        <div class="text-center">
          <h2 class="text-3xl font-bold text-gray-900 mb-2">Change Password</h2>
          <p class="text-gray-600">Create a new secure password for your account</p>
        </div>

        <!-- Change Password Form Card -->
        <div class="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-8">

          <!-- Success Message -->
          <div
            *ngIf="changeSuccess()"
            class="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div class="flex items-center">
              <svg class="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <p class="text-green-700 text-sm">Password has been changed successfully!</p>
            </div>
          </div>

          <!-- Error Message -->
          <div
            *ngIf="changeError()"
            class="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div class="flex items-center">
              <svg class="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <p class="text-red-700 text-sm">{{ changeError() }}</p>
            </div>
          </div>

          <!-- Token Invalid Message -->
          <div
            *ngIf="tokenInvalid()"
            class="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div class="flex items-center">
              <svg class="w-5 h-5 text-yellow-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z"/>
              </svg>
              <p class="text-yellow-700 text-sm">This reset link is invalid or has expired. Please request a new password reset.</p>
            </div>
          </div>

          <!-- Change Password Form -->
          <form [formGroup]="changePasswordForm" (ngSubmit)="onSubmit()" class="space-y-6" *ngIf="!tokenInvalid()">

            <!-- New Password Field -->
            <div>
              <label for="newPassword" class="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                  </svg>
                </div>
                <input
                  id="newPassword"
                  [type]="showNewPassword() ? 'text' : 'password'"
                  formControlName="newPassword"
                  placeholder="Enter your new password"
                  [class]="'w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all duration-200 ' + (isNewPasswordInvalid ? 'border-red-500 focus:ring-red-500' : 'border-gray-300')"
                  [disabled]="isLoading() || changeSuccess()">
                <button
                  type="button"
                  (click)="toggleNewPasswordVisibility()"
                  class="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <svg *ngIf="!showNewPassword()" class="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                  </svg>
                  <svg *ngIf="showNewPassword()" class="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"/>
                  </svg>
                </button>
              </div>
              <p *ngIf="isNewPasswordInvalid" class="mt-2 text-sm text-red-600">
                {{ newPasswordErrorMessage }}
              </p>

              <!-- Password Strength Indicator -->
              <div *ngIf="changePasswordForm.get('newPassword')?.value" class="mt-2">
                <div class="text-xs text-gray-600 mb-1">Password strength:</div>
                <div class="flex space-x-1">
                  <div [class]="'h-1 w-1/4 rounded ' + (passwordStrength() >= 1 ? 'bg-red-500' : 'bg-gray-200')"></div>
                  <div [class]="'h-1 w-1/4 rounded ' + (passwordStrength() >= 2 ? 'bg-yellow-500' : 'bg-gray-200')"></div>
                  <div [class]="'h-1 w-1/4 rounded ' + (passwordStrength() >= 3 ? 'bg-blue-500' : 'bg-gray-200')"></div>
                  <div [class]="'h-1 w-1/4 rounded ' + (passwordStrength() >= 4 ? 'bg-green-500' : 'bg-gray-200')"></div>
                </div>
                <div class="text-xs mt-1" [class]="passwordStrength() >= 3 ? 'text-green-600' : 'text-gray-500'">
                  {{ getPasswordStrengthText() }}
                </div>
              </div>
            </div>

            <!-- Confirm Password Field -->
            <div>
              <label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-2">
                Confirm New Password
              </label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
                <input
                  id="confirmPassword"
                  [type]="showConfirmPassword() ? 'text' : 'password'"
                  formControlName="confirmPassword"
                  placeholder="Confirm your new password"
                  [class]="'w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all duration-200 ' + (isConfirmPasswordInvalid ? 'border-red-500 focus:ring-red-500' : 'border-gray-300')"
                  [disabled]="isLoading() || changeSuccess()">
                <button
                  type="button"
                  (click)="toggleConfirmPasswordVisibility()"
                  class="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <svg *ngIf="!showConfirmPassword()" class="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                  </svg>
                  <svg *ngIf="showConfirmPassword()" class="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"/>
                  </svg>
                </button>
              </div>
              <p *ngIf="isConfirmPasswordInvalid" class="mt-2 text-sm text-red-600">
                {{ confirmPasswordErrorMessage }}
              </p>
            </div>

            <!-- Password Requirements -->
            <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div class="flex items-start">
                <svg class="w-5 h-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <div class="text-sm text-blue-700">
                  <p class="font-medium mb-1">Password requirements:</p>
                  <ul class="space-y-1 text-blue-600">
                    <li [class]="hasMinLength() ? 'text-green-600' : ''">
                      <span class="mr-1">{{ hasMinLength() ? '✓' : '•' }}</span>
                      At least 8 characters long
                    </li>
                    <li [class]="hasUppercase() ? 'text-green-600' : ''">
                      <span class="mr-1">{{ hasUppercase() ? '✓' : '•' }}</span>
                      Contains uppercase letter
                    </li>
                    <li [class]="hasLowercase() ? 'text-green-600' : ''">
                      <span class="mr-1">{{ hasLowercase() ? '✓' : '•' }}</span>
                      Contains lowercase letter
                    </li>
                    <li [class]="hasNumber() ? 'text-green-600' : ''">
                      <span class="mr-1">{{ hasNumber() ? '✓' : '•' }}</span>
                      Contains number
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <!-- Submit Button -->
            <button
              type="submit"
              [disabled]="changePasswordForm.invalid || isLoading() || changeSuccess()"
              class="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-white bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-900 hover:to-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]">

              <svg
                *ngIf="isLoading()"
                class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                fill="none"
                viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>

              <span *ngIf="!isLoading() && !changeSuccess()">Change Password</span>
              <span *ngIf="isLoading()">Changing Password...</span>
              <span *ngIf="changeSuccess()">Password Changed!</span>
            </button>
          </form>

          <!-- Alternative Actions -->
          <div class="mt-6 space-y-4">

            <!-- Divider -->
            <div class="relative">
              <div class="absolute inset-0 flex items-center">
                <div class="w-full border-t border-gray-300"></div>
              </div>
              <div class="relative flex justify-center text-sm">
                <span class="px-2 bg-white text-gray-500">Need help?</span>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex flex-col space-y-2">
              <button
                (click)="onBackToLogin()"
                type="button"
                class="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-all duration-200 hover:shadow-md">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
                </svg>
                Back to Login
              </button>

              <button
                *ngIf="tokenInvalid()"
                (click)="onRequestNewReset()"
                type="button"
                class="w-full flex items-center justify-center px-4 py-3 border border-slate-300 rounded-lg text-slate-700 bg-slate-50 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-all duration-200 hover:shadow-md">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                </svg>
                Request New Reset Link
              </button>
            </div>
          </div>
        </div>

        <!-- Additional Help -->
        <div class="text-center">
          <p class="text-sm text-gray-600 mb-2">Still having trouble?</p>
          <button
            (click)="onContactSupport()"
            type="button"
            class="inline-flex items-center text-sm text-slate-600 hover:text-slate-800 transition-colors">
            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
            </svg>
            Contact Support
          </button>
        </div>

      </div>
    </div>

    <style>
      @keyframes blob {
        0% {
          transform: translate(0px, 0px) scale(1);
        }
        33% {
          transform: translate(30px, -50px) scale(1.1);
        }
        66% {
          transform: translate(-20px, 20px) scale(0.9);
        }
        100% {
          transform: translate(0px, 0px) scale(1);
        }
      }

      .animate-blob {
        animation: blob 7s infinite;
      }

      .animation-delay-2000 {
        animation-delay: 2s;
      }

      .animation-delay-4000 {
        animation-delay: 4s;
      }
    </style>
  `
})
export class ChangePasswordComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  // Signals for component state
  changeSuccess = signal(false);
  changeError = signal('');
  tokenInvalid = signal(false);
  isLoading = signal(false);
  showNewPassword = signal(false);
  showConfirmPassword = signal(false);

  changePasswordForm: FormGroup;
  resetToken: string = '';

  constructor() {
    this.changePasswordForm = this.fb.group({
      newPassword: ['', [
        Validators.required,
        Validators.minLength(8),
        this.passwordStrengthValidator.bind(this)
      ]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: passwordMatchValidator });
  }

  ngOnInit(): void {
    // Get token from route params
    this.route.params.subscribe(params => {
      this.resetToken = params['token'];
      if (!this.resetToken) {
        this.tokenInvalid.set(true);
        return;
      }

      // Validate token (you would typically make an API call here)
      this.validateToken();
    });
  }

  // Custom password strength validator
  passwordStrengthValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.value;
    if (!password) return null;

    const hasMinLength = password.length >= 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);

    const errors: ValidationErrors = {};

    if (!hasMinLength) errors['minLength'] = true;
    if (!hasUppercase) errors['uppercase'] = true;
    if (!hasLowercase) errors['lowercase'] = true;
    if (!hasNumber) errors['number'] = true;

    return Object.keys(errors).length > 0 ? errors : null;
  }

  // Password strength calculation
  passwordStrength = signal(0);

  calculatePasswordStrength(): void {
    const password = this.changePasswordForm.get('newPassword')?.value || '';
    let strength = 0;

    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^A-Za-z\d]/.test(password)) strength++;

    this.passwordStrength.set(Math.min(strength, 4));
  }

  getPasswordStrengthText(): string {
    const strength = this.passwordStrength();
    switch (strength) {
      case 0:
      case 1: return 'Weak';
      case 2: return 'Fair';
      case 3: return 'Good';
      case 4: return 'Strong';
      default: return '';
    }
  }

  // Password requirement checks
  hasMinLength(): boolean {
    const password = this.changePasswordForm.get('newPassword')?.value || '';
    return password.length >= 8;
  }

  hasUppercase(): boolean {
    const password = this.changePasswordForm.get('newPassword')?.value || '';
    return /[A-Z]/.test(password);
  }

  hasLowercase(): boolean {
    const password = this.changePasswordForm.get('newPassword')?.value || '';
    return /[a-z]/.test(password);
  }

  hasNumber(): boolean {
    const password = this.changePasswordForm.get('newPassword')?.value || '';
    return /\d/.test(password);
  }

  // Form validation helpers
  get isNewPasswordInvalid(): boolean {
    const control = this.changePasswordForm.get('newPassword');
    return !!(control?.invalid && (control?.dirty || control?.touched));
  }

  get newPasswordErrorMessage(): string {
    const control = this.changePasswordForm.get('newPassword');
    if (control?.errors) {
      if (control.errors['required']) return 'New password is required';
      if (control.errors['minLength']) return 'Password must be at least 8 characters';
      if (control.errors['uppercase']) return 'Password must contain uppercase letter';
      if (control.errors['lowercase']) return 'Password must contain lowercase letter';
      if (control.errors['number']) return 'Password must contain a number';
    }
    return '';
  }

  get isConfirmPasswordInvalid(): boolean {
    const control = this.changePasswordForm.get('confirmPassword');
    return !!(control?.invalid && (control?.dirty || control?.touched)) ||
           !!(this.changePasswordForm.errors?.['passwordMismatch'] && control?.dirty);
  }

  get confirmPasswordErrorMessage(): string {
    const control = this.changePasswordForm.get('confirmPassword');
    if (control?.errors?.['required']) return 'Please confirm your password';
    if (this.changePasswordForm.errors?.['passwordMismatch']) return 'Passwords do not match';
    return '';
  }

  // Toggle password visibility
  toggleNewPasswordVisibility(): void {
    this.showNewPassword.set(!this.showNewPassword());
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword.set(!this.showConfirmPassword());
  }

  // Validate token (mock implementation)
  validateToken(): void {
    // In a real app, you would make an API call to validate the token
    // For now, we'll simulate a valid token unless it's 'invalid'
    if (this.resetToken === 'invalid' || this.resetToken === 'expired') {
      this.tokenInvalid.set(true);
    }
  }

  // Form submission
  onSubmit(): void {
    if (this.changePasswordForm.valid && !this.isLoading()) {
      this.isLoading.set(true);
      this.changeError.set('');

      // Simulate API call
      setTimeout(() => {
        try {
          // Mock API call to change password
          const formData = this.changePasswordForm.value;

          // Simulate success
          console.log('Changing password with:', {
            token: this.resetToken,
            newPassword: formData.newPassword
          });

          this.changeSuccess.set(true);
          this.isLoading.set(false);

          // Redirect to login after success
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);

        } catch (error) {
          this.changeError.set('Failed to change password. Please try again.');
          this.isLoading.set(false);
        }
      }, 2000);
    }

    // Update password strength on every change
    this.calculatePasswordStrength();
  }

  // Navigation methods
  onBackToLogin(): void {
    this.router.navigate(['/login']);
  }

  onRequestNewReset(): void {
    this.router.navigate(['/forgot-password']);
  }

  onContactSupport(): void {
    // Implement contact support functionality
    console.log('Contact support clicked');
    // You could open a modal, navigate to support page, or mailto link
  }
}

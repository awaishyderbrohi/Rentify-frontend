import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl:'./forget.component.html',
  styleUrl:'./forget.component.css'
})
export class ForgetComponent {
  private fb = new FormBuilder();

  // Signals for reactive state management
  isLoading = signal(false);
  resetSuccess = signal(false);
  resetError = signal<string | null>(null);

  // Reactive form
  forgotPasswordForm: FormGroup;

  constructor(private router:Router) {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  // Computed properties for form validation
  get isEmailInvalid(): boolean {
    const emailControl = this.forgotPasswordForm.get('email');
    return !!(emailControl?.invalid && emailControl?.touched);
  }

  get emailErrorMessage(): string {
    const emailControl = this.forgotPasswordForm.get('email');

    if (emailControl?.errors?.['required']) {
      return 'Email is required';
    }

    if (emailControl?.errors?.['email']) {
      return 'Please enter a valid email address';
    }

    return '';
  }

  // Form submission handler
  onSubmit(): void {
    if (this.forgotPasswordForm.invalid) {
      this.markAllFieldsAsTouched();
      return;
    }

    if (this.isLoading() || this.resetSuccess()) {
      return;
    }

    this.resetError.set(null);
    this.isLoading.set(true);

    const email = this.forgotPasswordForm.get('email')?.value;

    // Simulate API call to send reset email
    this.sendPasswordResetEmail(email).then(() => {
      this.isLoading.set(false);
      this.resetSuccess.set(true);
      this.resetError.set(null);
    }).catch((error) => {
      this.isLoading.set(false);
      this.resetError.set(error.message || 'Failed to send reset email. Please try again.');
    });
  }

  // Simulate password reset email API call
  private sendPasswordResetEmail(email: string): Promise<void> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simulate different scenarios
        if (email === 'test@error.com') {
          reject(new Error('Email address not found'));
        } else {
          resolve();
        }
      }, 2000);
    });
  }

  // Navigation methods
  onBackToLogin(): void {
    this.router.navigate(['/login']);
  }

  onContactSupport(): void {
    // In a real app, open support chat or navigate to support page
    console.log('Opening support');
    // Open support chat, email, or navigate to support page
  }

  // Helper method to mark all form fields as touched
  private markAllFieldsAsTouched(): void {
    Object.keys(this.forgotPasswordForm.controls).forEach(key => {
      this.forgotPasswordForm.get(key)?.markAsTouched();
    });
  }

  // Reset form method (useful for testing or programmatic reset)
  resetForm(): void {
    this.forgotPasswordForm.reset();
    this.isLoading.set(false);
    this.resetSuccess.set(false);
    this.resetError.set(null);
  }

  // Method to try again after success
  tryAgain(): void {
    this.resetSuccess.set(false);
    this.resetError.set(null);
    this.forgotPasswordForm.get('email')?.setValue('');
  }
}

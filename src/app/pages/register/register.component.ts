import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { ToasterService } from '../../services/toaster/toaster.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  signupForm!: FormGroup;
  isLoading = false;
  showPassword = false;
  globalError = '';

  constructor(private fb: FormBuilder,private router:Router,private authService:AuthService,private toaster:ToasterService) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  private initializeForm(): void {
    this.signupForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', [Validators.required, this.phoneValidator]],
      password: ['', [Validators.required, this.passwordValidator]],
      terms: [false, [Validators.requiredTrue]]
    });
  }

  // Custom validators
  private phoneValidator(control: AbstractControl): {[key: string]: any} | null {
    if (!control.value) return null;

    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    const cleanPhone = control.value.replace(/[\s\-\(\)]/g, '');

    return phoneRegex.test(cleanPhone) ? null : { 'invalidPhone': true };
  }

  private passwordValidator(control: AbstractControl): {[key: string]: any} | null {
    if (!control.value) return null;

    const password = control.value;
    const minLength = password.length >= 8;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    const valid = minLength && hasUpper && hasLower && hasNumber && hasSpecial;
    return valid ? null : { 'weakPassword': true };
  }

  // Form control getters for template
  get firstName() { return this.signupForm.get('firstName'); }
  get lastName() { return this.signupForm.get('lastName'); }
  get email() { return this.signupForm.get('email'); }
  get phoneNumber() { return this.signupForm.get('phoneNumber'); }
  get password() { return this.signupForm.get('password'); }
  get terms() { return this.signupForm.get('terms'); }

  // Password visibility toggle
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  // Error message getters
  getFieldError(fieldName: string): string {
    const field = this.signupForm.get(fieldName);
    if (!field || !field.errors || !field.touched) return '';

    const errors = field.errors;

    if (errors['required']) return `${this.getFieldDisplayName(fieldName)} is required`;
    if (errors['minlength']) return `${this.getFieldDisplayName(fieldName)} must be at least ${errors['minlength'].requiredLength} characters`;
    if (errors['email']) return 'Please enter a valid email address';
    if (errors['invalidPhone']) return 'Please enter a valid phone number';
    if (errors['weakPassword']) return 'Password must meet all requirements';

    return '';
  }

  private getFieldDisplayName(fieldName: string): string {
    const displayNames: { [key: string]: string } = {
      firstName: 'First name',
      lastName: 'Last name',
      email: 'Email',
      phoneNumber: 'Phone number',
      password: 'Password'
    };
    return displayNames[fieldName] || fieldName;
  }

  async onSubmit(): Promise<void> {
  if (this.signupForm.invalid || this.isLoading) {
    this.markAllFieldsAsTouched();
    return;
  }

  this.isLoading = true;
  this.globalError = '';

  const userData = this.signupForm.value;

  this.authService.registeration(userData).subscribe({
    next: (res) => {
      if (res.status === 'CREATED') {
        this.toaster.show('User Registration Completed', 'success');

        this.signupForm.reset(); // ✅ Reset only on success
      }
      this.isLoading = false; // ✅ Stop loader after success
    },
    error: (error) => {
  // Check if backend returned a specific error message
  if (error.error && error.error.error) {
    this.globalError = error.error.error; // ✅ Shows: "email already exists"
  } else if (error.error && error.error.message) {
    this.globalError = error.error.message;
  } else {
    this.globalError = 'Registration failed. Please try again.';
  }
  console.error('Registration error:', error);
  this.isLoading = false;
}
  });
}


  private markAllFieldsAsTouched(): void {
    Object.keys(this.signupForm.controls).forEach(key => {
      this.signupForm.get(key)?.markAsTouched();
    });
  }

  private simulateApiCall(userData: any): Promise<void> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simulate random success/failure for demo
        if (Math.random() > 0.1) {
          resolve();
        } else {
          reject(new Error('Simulated API error'));
        }
      }, 2000);
    });
  }

  // Social auth handlers
  handleGoogleSignup(): void {
    console.log('Google signup initiated');
    // Implement Google OAuth signup
  }

  handleFacebookSignup(): void {
    console.log('Facebook signup initiated');
    // Implement Facebook OAuth signup
  }

  // Navigation handlers
  handleSignIn(): void {
    console.log('Navigate to sign in');
    // Navigate to login page using Router
    this.router.navigate(['/login']);
  }

  handleBackToHome(): void {
    console.log('Navigate to home');
    // Navigate to home page using Router
    // this.router.navigate(['/']);
  }

  // Helper methods for template
  hasFieldError(fieldName: string): boolean {
    const field = this.signupForm.get(fieldName);
    return !!(field && field.errors && field.touched);
  }

  getFieldClasses(fieldName: string): string {
    const baseClasses = 'w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 transition-all duration-200';
    const passwordClasses = fieldName === 'password' ? 'pr-12' : 'pr-4';

    if (this.hasFieldError(fieldName)) {
      return `${baseClasses} ${passwordClasses} border-red-500 focus:ring-red-500 focus:border-red-500`;
    }

    return `${baseClasses} ${passwordClasses} border-gray-300 focus:ring-slate-500 focus:border-slate-500`;
  }
}

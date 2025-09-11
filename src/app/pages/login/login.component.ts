import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';

import { ToasterService } from '../../services/toaster/toaster.service';

interface LoginForm {
  email: string;
  password: string;
  rememberMe: boolean;
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;

  // Signals for reactive state management
  isLoading = signal(false);
  showPassword = signal(false);
  loginError = signal<string | null>(null);
  isFormSubmitted = signal(false);

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private toaster:ToasterService,
    private authService:AuthService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  private initializeForm(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });
  }

  get emailControl() {
    return this.loginForm.get('email');
  }

  get passwordControl() {
    return this.loginForm.get('password');
  }

  get isEmailInvalid(): boolean {
    return !!(this.emailControl?.invalid && (this.emailControl?.dirty || this.emailControl?.touched || this.isFormSubmitted()));
  }

  get isPasswordInvalid(): boolean {
    return !!(this.passwordControl?.invalid && (this.passwordControl?.dirty || this.passwordControl?.touched || this.isFormSubmitted()));
  }

  get emailErrorMessage(): string {
    if (this.emailControl?.hasError('required')) {
      return 'Email is required';
    }
    if (this.emailControl?.hasError('email')) {
      return 'Please enter a valid email address';
    }
    return '';
  }

  get passwordErrorMessage(): string {
    if (this.passwordControl?.hasError('required')) {
      return 'Password is required';
    }
    if (this.passwordControl?.hasError('minlength')) {
      return 'Password must be at least 6 characters long';
    }
    return '';
  }

  togglePasswordVisibility(): void {
    this.showPassword.update(value => !value);
  }

  async onSubmit(): Promise<void> {
    this.isFormSubmitted.set(true);
    this.loginError.set(null);

    if (this.loginForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.isLoading.set(true);

    this.authService.login(this.loginForm.value).subscribe({
        next:()=>{
          this.router.navigate(['user/profile'])
        },
        error:(error)=>{
          this.handleLoginError("Invalid Credentials"),
          this.isLoading.set(false);
        },
        complete:()=> {
          this.toaster.show("Login success","success");
          this.isLoading.set(false);
        }
      });

  }



  private handleLoginError(error: any): void {
    console.error('Login error:', error);

    if (error) {
      this.loginError.set(error);
    } else {
      this.loginError.set('An unexpected error occurred. Please try again.');
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.loginForm.controls).forEach(key => {
      const control = this.loginForm.get(key);
      control?.markAsTouched();
    });
  }

  onForgotPassword(): void {
    console.log('Forgot password clicked');
    // Navigate to forgot password page
    this.router.navigate(['/forgot-password']);
  }

  onSignUp(): void {
    console.log('Sign up clicked');
    // Navigate to sign up page
    this.router.navigate(['/register']);
  }

  onGoogleLogin(): void {
    console.log('Google login clicked');
    // Implement Google OAuth login
    this.loginError.set(null);
    this.isLoading.set(true);

    // Simulate Google login
    setTimeout(() => {
      this.isLoading.set(false);
      // Handle Google login response
    }, 1000);
  }

  onFacebookLogin(): void {
    console.log('Facebook login clicked');
    // Implement Facebook OAuth login
    this.loginError.set(null);
    this.isLoading.set(true);

    // Simulate Facebook login
    setTimeout(() => {
      this.isLoading.set(false);
      // Handle Facebook login response
    }, 1000);
  }

  onBackToHome(): void {
    this.router.navigate(['/']);
  }
}

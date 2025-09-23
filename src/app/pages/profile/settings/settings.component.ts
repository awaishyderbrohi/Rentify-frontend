import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Subject, takeUntil, interval, Subscription } from 'rxjs';
import { AuthService } from '../../../services/auth/auth.service';
import { ToasterService } from '../../../services/toaster/toaster.service';
import { User } from '../../../models/User.model';



@Component({
  selector: 'app-profile-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="space-y-8">
      <div>
        <h2 class="text-2xl font-bold text-gray-900 mb-2">Account Settings</h2>
        <p class="text-gray-600">Manage your personal information and security preferences</p>
      </div>

      <!-- Personal Information -->
      <div class="border border-gray-200 rounded-xl p-8">
        <h3 class="text-lg font-semibold text-gray-900 mb-6">Personal Information</h3>
        <form [formGroup]="profileForm" (ngSubmit)="onSubmit()">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- First Name -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">First Name</label>
              <input
                type="text"
                formControlName="firstName"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                [class.border-red-300]="profileForm.get('firstName')?.invalid && profileForm.get('firstName')?.touched"
                [class.focus:ring-red-500]="profileForm.get('firstName')?.invalid && profileForm.get('firstName')?.touched"
                [class.focus:border-red-500]="profileForm.get('firstName')?.invalid && profileForm.get('firstName')?.touched"
              />
              <p *ngIf="profileForm.get('firstName')?.invalid && profileForm.get('firstName')?.touched"
                 class="mt-2 text-sm text-red-600">First name is required</p>
            </div>

            <!-- Last Name -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
              <input
                type="text"
                formControlName="lastName"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                [class.border-red-300]="profileForm.get('lastName')?.invalid && profileForm.get('lastName')?.touched"
                [class.focus:ring-red-500]="profileForm.get('lastName')?.invalid && profileForm.get('lastName')?.touched"
                [class.focus:border-red-500]="profileForm.get('lastName')?.invalid && profileForm.get('lastName')?.touched"
              />
              <p *ngIf="profileForm.get('lastName')?.invalid && profileForm.get('lastName')?.touched"
                 class="mt-2 text-sm text-red-600">Last name is required</p>
            </div>

            <!-- Email -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                formControlName="email"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                [class.border-red-300]="profileForm.get('email')?.invalid && profileForm.get('email')?.touched"
                [class.focus:ring-red-500]="profileForm.get('email')?.invalid && profileForm.get('email')?.touched"
                [class.focus:border-red-500]="profileForm.get('email')?.invalid && profileForm.get('email')?.touched"
              />
              <p *ngIf="profileForm.get('email')?.invalid && profileForm.get('email')?.touched"
                 class="mt-2 text-sm text-red-600">Valid email is required</p>
            </div>

            <!-- Phone -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
              <input
                type="tel"
                formControlName="phoneNumber"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="+1 (555) 123-4567"
              />
            </div>
             <!-- Bio -->
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-2">Bio</label>
              <textarea
                formControlName="bio"
                rows="4"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                placeholder="Tell us about yourself..."
              ></textarea>
            </div>

            <!-- Date of Birth -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
              <input
                type="date"
                formControlName="dateOfBirth"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>

            <!-- Gender -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Gender</label>
              <select
                formControlName="gender"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value="">Select Gender</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
                <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
              </select>
            </div>

            <!-- Location Address -->
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-2">Address</label>
              <input
                type="text"
                formControlName="address"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Your full address"
              />
            </div>

            <!-- City and State -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">City</label>
              <input
                type="text"
                formControlName="city"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Your city"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">State/Province</label>
              <input
                type="text"
                formControlName="state"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Your state/province"
              />
            </div>



            <!-- Website -->
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-2">Website</label>
              <input
                type="url"
                formControlName="website"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="https://example.com"
              />
            </div>
          </div>

          <div class="flex justify-end pt-6 border-t border-gray-200 mt-8">
            <button
              type="submit"
              class="inline-flex items-center px-6 py-3 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              [disabled]="profileForm.invalid || isLoading"
            >
              <div *ngIf="isLoading" class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
              {{ isLoading ? 'Updating...' : 'Update Profile' }}
            </button>
          </div>
        </form>
      </div>

      <!-- Security Settings -->
      <div class="border border-gray-200 rounded-xl p-8">
        <h3 class="text-lg font-semibold text-gray-900 mb-6">Security Settings</h3>
        <div class="space-y-4">
          <div class="flex items-center justify-between p-6 border border-gray-200 rounded-lg">
            <div class="flex items-center space-x-4">
              <div class="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"></path>
                </svg>
              </div>
              <div>
                <p class="font-medium text-gray-900">Change Password</p>
                <p class="text-sm text-gray-600">Update your account password</p>
              </div>
            </div>
            <button class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              Change
            </button>
          </div>

          <!-- Email Verification Status -->
          <!-- Not Verified - Show countdown or verify button -->
          <div *ngIf="!user?.emailVerified" class="flex items-center justify-between p-6 border border-yellow-200 bg-yellow-50 rounded-lg">
            <div class="flex items-center space-x-4">
              <div class="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                <svg class="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z"></path>
                </svg>
              </div>
              <div>
                <p class="font-medium text-yellow-800">Email Not Verified</p>
                <p class="text-sm text-yellow-700">
                  <span *ngIf="!isVerificationEmailSent">Verify your email to rent/rent-out equipment</span>
                  <span *ngIf="isVerificationEmailSent && verificationCountdown > 0">Email sent! You can resend in {{ getCountdownText() }}</span>
                  <span *ngIf="isVerificationEmailSent && verificationCountdown <= 0">You can now resend the verification email</span>
                </p>
              </div>
            </div>
            <button
              (click)="handleVerificationEmail()"
              [disabled]="isVerificationEmailSent && verificationCountdown > 0"
              class="px-4 py-2 text-sm font-medium transition-colors rounded-lg"
              [class]="(isVerificationEmailSent && verificationCountdown > 0)
                ? 'text-yellow-600 bg-yellow-200 border border-yellow-300 cursor-not-allowed opacity-50'
                : 'text-yellow-800 bg-yellow-100 border border-yellow-300 hover:bg-yellow-200'"
            >
              <span *ngIf="!isVerificationEmailSent || verificationCountdown <= 0">Verify Now</span>
              <span *ngIf="isVerificationEmailSent && verificationCountdown > 0">{{ getCountdownText() }}</span>
            </button>
          </div>

          <!-- Email Verified - Show success state -->
          <div *ngIf="user?.emailVerified" class="flex items-center justify-between p-6 border border-green-200 bg-green-50 rounded-lg">
            <div class="flex items-center space-x-4">
              <div class="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <div>
                <p class="font-medium text-green-800">Email Verified</p>
                <p class="text-sm text-green-700">Your email address has been verified successfully</p>
              </div>
            </div>
            <div class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
              Verified
            </div>
          </div>
        </div>
      </div>

      <!-- Account Actions -->
      <div class="border border-gray-200 rounded-xl p-8">
        <h3 class="text-lg font-semibold text-gray-900 mb-6">Account Actions</h3>
        <button
          (click)="logout()"
          class="w-full inline-flex items-center justify-center px-6 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
        >
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
          </svg>
          Sign Out
        </button>
      </div>
    </div>
  `
})
export class ProfileSettingsComponent implements OnInit, OnDestroy {
  @Input() user: User | null = null;

  profileForm: FormGroup;
  isLoading = false;

  // Email verification timer properties
  isVerificationEmailSent = false;
  verificationCountdown = 0;
  private countdownSubscription: Subscription | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private fb: FormBuilder,
    private http: HttpClient,
    private toaster: ToasterService
  ) {
    this.profileForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: [''],
      bio: [''],
      address: [''],
      city: [''],
      state: [''],
      website: [''],
      dateOfBirth: [''],
      gender: [''],
      profession: [''],
      company: [''],
      // Social Media
      facebook: [''],
      linkedin: [''],
      instagram: [''],
      twitter: [''],
      // Emergency Contact
      emergencyContactName: [''],
      emergencyContactRelationship: [''],
      emergencyContactPhone: ['']
    });
  }

  ngOnInit() {
    if (this.user) {
      this.populateForm(this.user);

      // Reset verification email state if user becomes verified
      if (this.user.emailVerified) {
        this.resetVerificationState();
      }
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.stopCountdown();
  }

  populateForm(user: User) {
    this.profileForm.patchValue({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      phoneNumber: user.phoneNumber || '',
      bio: user.bio || '',
      address: user.address?.street || '',
      city: user.address?.city || '',
      state: user.address?.state || '',
      website: user.website || '',
      dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
      gender: user.gender || '',

    });
  }

  onSubmit() {
    if (this.profileForm.valid) {
      this.isLoading = true;

      const formData = this.profileForm.value;

      // Structure the data to match the User type
      const updateData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        bio: formData.bio,
        website: formData.website,
        dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth) : undefined,
        gender: formData.gender || undefined,
        address: {
          street: formData.address,
          city: formData.city,
          state: formData.state,
        },
      };

      // Update profile via API
      this.http.put(`${this.authService.BASE_URL}/users/profile`, updateData, {
        withCredentials: true
      }).subscribe({
        next: (updatedUser: any) => {
          this.user = updatedUser;
          this.authService.loadUser(); // Refresh user in AuthService
          this.isLoading = false;
          this.toaster.show('Profile updated successfully!', 'success');
        },
        error: (error) => {
          this.isLoading = false;
          this.toaster.show(error.error?.message || 'Failed to update profile. Please try again.', 'error');
        }
      });
    }
  }

  handleVerificationEmail() {
    if (this.isVerificationEmailSent && this.verificationCountdown > 0) {
      return; // Don't send if countdown is active
    }

    // Send verification email API call
    this.authService.sendVerificationEmail().subscribe({
      next: () => {
        this.toaster.show("Verification email sent! Please check your inbox", 'info');
        this.startCountdown();
      },
      error: (error) => {
        this.toaster.show(error.error?.message || 'Failed to send verification email. Please try again.', 'error');
      }
    });
  }

  private startCountdown() {
    this.isVerificationEmailSent = true;
    this.verificationCountdown = 60; // 1 minute = 60 seconds

    this.countdownSubscription = interval(1000).subscribe(() => {
      this.verificationCountdown--;

      if (this.verificationCountdown <= 0) {
        this.resetVerificationState();
      }
    });
  }

  private stopCountdown() {
    if (this.countdownSubscription) {
      this.countdownSubscription.unsubscribe();
      this.countdownSubscription = null;
    }
  }

  private resetVerificationState() {
    this.stopCountdown();
    this.isVerificationEmailSent = false;
    this.verificationCountdown = 0;
  }

  getCountdownText(): string {
    const minutes = Math.floor(this.verificationCountdown / 60);
    const seconds = this.verificationCountdown % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  logout() {
    this.authService.logout();
  }
}

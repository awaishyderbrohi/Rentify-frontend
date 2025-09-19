import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject, takeUntil, interval, Subscription } from 'rxjs';
import { AuthService } from '../../services/auth/auth.service';
import { User } from '../../models/User.model';
import { UsersService } from '../../services/users/users.service';
import { ToasterService } from '../../services/toaster/toaster.service';
import { MyListingsComponent } from "./my-listings/my-listings.component";
import { MessagesComponent } from "./messages/messages.component";
import { EarningsComponent } from "./earnings/earnings.component";


@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MyListingsComponent, MessagesComponent, EarningsComponent],
  templateUrl: `./profile.component.html`
})
export class ProfileComponent implements OnInit, OnDestroy {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  user: User | null = null;
  profileForm: FormGroup;
  activeSection = 'profile';
  isEditMode = false;
  isLoading = false;
  successMessage = '';
  errorMessage = '';
  imageError = '';
  isUploading = false;

  // Email verification timer properties
  isVerificationEmailSent = false;
  verificationCountdown = 0;
  private countdownSubscription: Subscription | null = null;

  private destroy$ = new Subject<void>();

  menuItems = [
    { id: 'profile', label: 'Profile', icon: 'user' },
    { id: 'listings', label: 'My Listings', icon: 'package' },
    { id: 'rentals', label: 'My Rentals', icon: 'calendar' },
    { id: 'favorites', label: 'Favorites', icon: 'heart' },
    { id: 'messages', label: 'Messages', icon: 'message' },
    { id: 'earnings', label: 'Earnings', icon: 'dollar' },
    { id: 'settings', label: 'Settings', icon: 'settings' }
  ];

  constructor(
    private authService: AuthService,
    private userService: UsersService,
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute,
    private toaster:ToasterService
  ) {
    this.profileForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      bio: [''],
      avatar: [''],
      location: [''],
      website: ['']
    });
  }

  ngOnInit() {
    // Subscribe to route changes to update active section
    this.route.url.pipe(takeUntil(this.destroy$)).subscribe(segments => {
      const section = segments.length > 0 ? segments[0].path : 'profile';
      this.activeSection = this.isValidSection(section) ? section : 'profile';
    });

    // Subscribe to user data
    this.getUserData();

    if (!this.user) {
      this.authService.loadUser();
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.stopCountdown();
  }

  getUserData(){
        this.authService.user$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.user = user;
        if (user) {
          this.populateForm(user);
          // Reset verification email state if user becomes verified
          if (user.emailVerified) {
            this.resetVerificationState();
          }
        }
      });
  }

  navigateToSection(section: string) {
    this.router.navigate([section], { relativeTo: this.route });
    this.clearMessages();
  }

  setActiveSection(section: string) {
    this.activeSection = section;
    this.clearMessages();
  }

  isValidSection(section: string): boolean {
    return this.menuItems.some(item => item.id === section);
  }

  populateForm(user: User) {
    this.profileForm.patchValue({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      phone: user.phoneNumber || '',
      bio: user.bio || '',
      avatar: user.profilePicUrl || '',
      location: user.location || '',
    });
  }

  toggleEditMode() {
    this.isEditMode = !this.isEditMode;
    this.activeSection = "settings"
    this.clearMessages();

    if (this.isEditMode && this.user) {
      this.populateForm(this.user);
    }
  }

  handleImageClick() {
    this.fileInput.nativeElement.click();
  }

  handleImageChange(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      this.imageError = 'Please select a valid image file (JPEG, PNG, GIF, or WebP)';
      return;
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      this.imageError = 'Image size must be less than 5MB';
      return;
    }

    this.imageError = '';
    this.isUploading = true;

    // Here you would implement your image upload logic
    this.userService.uploadProfileImage(file).subscribe({
      next: () => {
        this.isUploading = false;
        this.successMessage = 'Profile image updated successfully!';
        setTimeout(() => {
        window.location.reload();   // Refresh page
        }, 1000);
      },
      error: () => {
        this.isUploading = false;
        this.errorMessage = 'Failed to upload image. Please try again.';
      }
    });
  }

  handleVerificationEmail() {
    if (this.isVerificationEmailSent && this.verificationCountdown > 0) {
      return; // Don't send if countdown is active
    }

    // Send verification email API call
    this.authService.sendVerificationEmail().subscribe({
      next: () => {
        this.successMessage = 'Verification email sent! Please check your inbox.';
        this.toaster.show("Verification email sent! Please check your inbox",'info')
        this.startCountdown();
        setTimeout(() => this.clearMessages(), 3000);
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Failed to send verification email. Please try again.';
        setTimeout(() => this.clearMessages(), 5000);
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
    // Implement logout logic here
    this.authService.logout();
  }

  onSubmit() {
    if (this.profileForm.valid) {
      this.isLoading = true;
      this.clearMessages();

      const formData = this.profileForm.value;

      // Update profile via API
      this.http.put(`${this.authService.BASE_URL}/users/profile`, formData, {
        withCredentials: true
      }).subscribe({
        next: (updatedUser: any) => {
          this.user = updatedUser;
          this.authService.loadUser(); // Refresh user in AuthService
          this.isLoading = false;
          this.successMessage = 'Profile updated successfully!';
          setTimeout(() => this.clearMessages(), 3000);
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.error?.message || 'Failed to update profile. Please try again.';
          setTimeout(() => this.clearMessages(), 5000);
        }
      });
    }
  }

  getInitials(): string {
    if (!this.user) return 'U';
    const firstName = this.user.firstName || '';
    const lastName = this.user.lastName || '';
    return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  clearMessages() {
    this.successMessage = '';
    this.errorMessage = '';
    this.imageError = '';
  }

  getIconSvg(iconName: string): string {
    const icons: { [key: string]: string } = {
      user: 'stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"',
      package: 'stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"',
      calendar: 'stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"',
      heart: 'stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"',
      message: 'stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"',
      dollar: 'stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"',
      settings: 'stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"'
    };

    return icons[iconName] || icons['user'];
  }
}

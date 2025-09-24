import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-email-verification-banner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      *ngIf="isVisible"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm animate-fade-in"
      (click)="onBackdropClick($event)"
    >
      <div
        class="bg-base-100 rounded-2xl shadow-2xl border border-base-300 p-8 max-w-md w-full mx-4 transform transition-all duration-300 ease-out animate-scale-in"
        (click)="$event.stopPropagation()"
      >
        <!-- Header Section -->
        <div class="text-center mb-6">
          <div class="w-16 h-16 mx-auto mb-4 bg-warning bg-opacity-10 rounded-full flex items-center justify-center">
            <svg
              class="w-8 h-8 text-warning"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h2 class="text-2xl font-bold text-base-content mb-2">
            Email Verification Required
          </h2>
          <p class="text-base-content opacity-70 text-sm leading-relaxed">
            Please verify your email address first to access equipment listing features and maintain account security.
          </p>
        </div>

        <!-- Action Buttons -->
        <div class="space-y-3">
          <button
            class="btn btn-primary w-full text-white font-medium hover:shadow-lg transition-all duration-200"
            (click)="onVerifyEmail()"
          >
            <svg
              class="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            Verify Email Address
          </button>

          <button
            class="btn btn-ghost w-full font-medium hover:bg-base-200 transition-all duration-200"
            (click)="onResendEmail()"
          >
            <svg
              class="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Resend Verification Email
          </button>
        </div>

        <!-- Close Button -->
        <button
          class="absolute top-4 right-4 btn btn-ghost btn-sm btn-circle hover:bg-base-200 transition-all duration-200"
          (click)="onClose()"
          aria-label="Close"
        >
          <svg
            class="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <!-- Footer -->
        <div class="mt-6 pt-4 border-t border-base-300">
          <p class="text-xs text-base-content opacity-60 text-center">
            Need help? Contact our
            <a href="mailto:support@company.com" class="link link-primary">support team</a>
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @keyframes fade-in {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }

    @keyframes scale-in {
      from {
        opacity: 0;
        transform: scale(0.9) translateY(20px);
      }
      to {
        opacity: 1;
        transform: scale(1) translateY(0);
      }
    }

    .animate-fade-in {
      animation: fade-in 0.2s ease-out;
    }

    .animate-scale-in {
      animation: scale-in 0.3s ease-out;
    }

    /* Ensure backdrop blur works across browsers */
    .backdrop-blur-sm {
      backdrop-filter: blur(4px);
      -webkit-backdrop-filter: blur(4px);
    }
  `]
})
export class EmailVerificationBannerComponent implements OnInit, OnDestroy {
  @Input() isVisible: boolean = false;
  @Input() allowBackdropClose: boolean = true;
  @Input() userEmail: string = '';

  @Output() verifyEmailClicked = new EventEmitter<void>();
  @Output() resendEmailClicked = new EventEmitter<void>();
  @Output() closeClicked = new EventEmitter<void>();

  ngOnInit() {
    // Prevent body scroll when modal is open
    if (this.isVisible) {
      document.body.style.overflow = 'hidden';
    }
  }

  ngOnDestroy() {
    // Restore body scroll
    document.body.style.overflow = '';
  }

  ngOnChanges() {
    // Handle body scroll when visibility changes
    if (this.isVisible) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }

  onVerifyEmail() {
    this.verifyEmailClicked.emit();
  }

  onResendEmail() {
    this.resendEmailClicked.emit();
  }

  onClose() {
    document.body.style.overflow = '';
    this.closeClicked.emit();
  }

  onBackdropClick(event: Event) {
    if (this.allowBackdropClose && event.target === event.currentTarget) {
      this.onClose();
    }
  }
}

// Usage Example Component
@Component({
  selector: 'app-usage-example',
  standalone: true,
  imports: [CommonModule, EmailVerificationBannerComponent],
  template: `
    <div class="p-8">
      <h1 class="text-3xl font-bold mb-4">Equipment Listing</h1>
      <button
        class="btn btn-primary mb-4"
        (click)="showBanner()"
      >
        Try to List Equipment
      </button>

      <app-email-verification-banner
        [isVisible]="bannerVisible"
        [userEmail]="currentUserEmail"
        [allowBackdropClose]="true"
        (verifyEmailClicked)="handleVerifyEmail()"
        (resendEmailClicked)="handleResendEmail()"
        (closeClicked)="handleCloseBanner()"
      ></app-email-verification-banner>
    </div>
  `
})
export class UsageExampleComponent {
  bannerVisible = false;
  currentUserEmail = 'user@example.com';

  showBanner() {
    this.bannerVisible = true;
  }

  handleVerifyEmail() {
    console.log('Redirecting to email verification...');
    // Redirect to verification page or open email client
    this.bannerVisible = false;
  }

  handleResendEmail() {
    console.log('Resending verification email...');
    // Call your API to resend verification email
    // Show success toast or notification
  }

  handleCloseBanner() {
    this.bannerVisible = false;
  }
}

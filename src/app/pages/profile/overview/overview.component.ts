import { Component, OnInit, ViewChild, ElementRef, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { User } from '../../../models/User.model';
import { UsersService } from '../../../services/users/users.service';
import { ToasterService } from '../../../services/toaster/toaster.service';
import { ListingsService } from '../../../services/listings/listings.service';
import { Listing } from '../my-listings/my-listings.component';

@Component({
  selector: 'app-profile-overview',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-8">
      <!-- Profile Header -->
      <div class="border border-gray-200 rounded-xl p-8">
        <div class="flex items-start space-x-8">
          <!-- Avatar Section -->
          <div class="relative group flex-shrink-0">
            <div class="w-32 h-32 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 p-1">
              <div class="w-full h-full rounded-full border-4 border-white relative overflow-hidden">
                <img
                  *ngIf="user?.profilePicUrl; else initials"
                  [src]="user?.profilePicUrl"
                  [alt]="user?.firstName + ' ' + user?.lastName"
                  class="w-full h-full object-cover cursor-pointer group-hover:brightness-75 transition-all duration-200"
                  (click)="handleImageClick()"
                />
                <ng-template #initials>
                  <div class="w-full h-full bg-gray-100 flex items-center justify-center text-2xl font-bold text-gray-600 cursor-pointer group-hover:bg-gray-200 transition-colors"
                       (click)="handleImageClick()">
                    {{ getInitials() }}
                  </div>
                </ng-template>
              </div>

              <!-- Loading spinner overlay -->
              <div *ngIf="isUploading"
                   class="absolute inset-0 w-32 h-32 rounded-full bg-black bg-opacity-50 flex items-center justify-center">
                <div class="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent"></div>
              </div>

              <!-- Hover overlay -->
              <div *ngIf="!isUploading"
                   class="absolute inset-0 w-32 h-32 rounded-full bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer"
                   (click)="handleImageClick()">
                <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
              </div>

              <!-- Hidden file input -->
              <input
                #fileInput
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                (change)="handleImageChange($event)"
                class="hidden"
                [disabled]="isUploading"
              />
            </div>
          </div>

          <div class="flex-1">
            <div class="flex items-center justify-between mb-4">
              <div>
                <h2 class="text-2xl font-bold text-gray-900 mb-1">{{ user?.firstName }} {{ user?.lastName }}</h2>
                <p class="text-gray-600">{{ user?.email }}</p>
              </div>
              <button
                class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
                (click)="onEditProfile()">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                </svg>
                Edit Profile
              </button>
            </div>

            <!-- Image Error Alert -->
            <div *ngIf="imageError" class="mb-4 p-4 rounded-lg bg-red-50 border border-red-200">
              <div class="flex items-center">
                <svg class="w-5 h-5 text-red-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <span class="text-red-800 text-sm font-medium">{{ imageError }}</span>
              </div>
            </div>

            <div class="flex flex-wrap items-center gap-6 mb-6 text-sm text-gray-600">
              <div *ngIf="user?.createdAt" class="flex items-center space-x-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
                <span>Member since {{ user?.createdAt}}</span>
              </div>
              <div *ngIf="user?.nICVerified" class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                </svg>
                Verified
              </div>
            </div>

            <div class="flex flex-wrap items-center gap-8 mb-6 text-sm">
              <div *ngIf="user?.totalRating" class="flex items-center space-x-2">
                <svg class="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
                </svg>
                <span class="font-semibold text-gray-900">{{ user?.totalRating }}</span>
                <span class="text-gray-600">({{ user?.totalReviews }} reviews)</span>
              </div>
              <div *ngIf="user?.responseRate" class="text-gray-600">
                Response rate: <span class="font-semibold text-gray-900">{{ user?.responseRate }}%</span>
              </div>
            </div>

            <p *ngIf="user?.bio" class="text-gray-700 leading-relaxed">{{ user?.bio }}</p>
          </div>
        </div>
      </div>

      <!-- Contact Information -->
      <div class="border border-gray-200 rounded-xl p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-6">Contact Information</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="flex items-start space-x-4">
            <div class="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
              <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
              </svg>
            </div>
            <div>
              <p class="text-sm font-medium text-gray-500 mb-1">Email</p>
              <p class="text-sm text-gray-900">{{ user?.email }}</p>
            </div>
          </div>
          <div *ngIf="user?.phoneNumber" class="flex items-start space-x-4">
            <div class="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
              <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
              </svg>
            </div>
            <div>
              <p class="text-sm font-medium text-gray-500 mb-1">Phone</p>
              <p class="text-sm text-gray-900">{{ user?.phoneNumber }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Statistics -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div class="border border-gray-200 rounded-xl p-6 text-center">
          <div class="text-3xl font-bold text-gray-900 mb-1">{{stats.rented}}</div>
          <div class="text-sm text-gray-600">Total Rentals</div>
        </div>
        <div class="border border-gray-200 rounded-xl p-6 text-center">
          <div class="text-3xl font-bold text-gray-900 mb-1">$7,600</div>
          <div class="text-sm text-gray-600">Total Earnings</div>
        </div>
        <div class="border border-gray-200 rounded-xl p-6 text-center">
          <div class="text-3xl font-bold text-gray-900 mb-1">{{stats.active}}</div>
          <div class="text-sm text-gray-600">Active Listings</div>
        </div>
        <div class="border border-gray-200 rounded-xl p-6 text-center">
          <div class="text-3xl font-bold text-gray-900 mb-1">{{ user?.totalRating || '' }}</div>
          <div class="text-sm text-gray-600">Average Rating</div>
        </div>
      </div>
    </div>
  `
})
export class ProfileOverviewComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  @Input() user: User | null = null;

  listings:Listing[] = [];
  stats = {
    total: 0,
    active: 0,
    rented: 0,
    inactive: 0
  };

  imageError = '';
  isUploading = false;

  constructor(
    private userService: UsersService,
    private toaster: ToasterService,
    private listingsService:ListingsService
  ) {}

  ngOnInit() {
    // Component initialization logic
    this.listingsService.getAllUserListings().subscribe({
    next: (res) => {
      // Make sure you're accessing the correct property from response
      this.listings = res.t || res.t || res; // Adjust based on your API response structure
      this.updateStats();
    },
    error: (error) => {
      console.error('Error loading listings:', error);

    }
  });
  }


  updateStats() {
  this.stats.total = this.listings.length;
  this.stats.active = this.listings.filter(l => l.status === 'ACTIVE').length;
  this.stats.rented = this.listings.filter(l => l.status === 'RENTED').length;
  this.stats.inactive = this.listings.filter(l => l.status === 'INACTIVE').length;
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

    // Upload image
    this.userService.uploadProfileImage(file).subscribe({
      next: () => {
        this.isUploading = false;
        this.toaster.show('Profile image updated successfully!', 'success');
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      },
      error: () => {
        this.isUploading = false;
        this.toaster.show('Failed to upload image. Please try again.', 'error');
      }
    });
  }

  onEditProfile() {
    // Emit event to parent component to navigate to settings
    // You can use Output() decorator and EventEmitter for this
    window.dispatchEvent(new CustomEvent('navigate-to-settings'));
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
}

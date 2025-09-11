import { Component, signal, computed, OnInit, Input, NgModule } from '@angular/core';
import { CommonModule, NgFor } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';

interface RentalImage {
  url: string;
  alt: string;
  id: string;
}

interface RentalItem {
  id: string;
  title: string;
  description: string;
  dailyRate: number;
  weeklyRate?: number;
  monthlyRate?: number;
  securityDeposit: number;
  category: string;
  condition: string;
  brand?: string;
  model?: string;
  images: RentalImage[];
  tags: string[];
  address: string;
  city: string;
  area?: string;
  phone: string;
  email?: string;
  pickupAvailable: boolean;
  deliveryAvailable: boolean;
  deliveryRadius: number; // in km
  deliveryFee?: number;
  minRentalDays: number;
  maxRentalDays: number;
  availability: {
    startDate: string;
    endDate: string;
    unavailableDates: string[];
  };
  owner: {
    name: string;
    avatar?: string;
    memberSince: string;
    rating: number;
    totalRatings: number;
    isVerified: boolean;
  };
  listedDate: string;
  totalRentals: number;
  views: number;
  isActive: boolean;
  specifications?: { [key: string]: string };
}

interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  message: string;
  timestamp: string;
  type: 'text' | 'image' | 'system';
  isRead: boolean;
}

interface BookingForm {
  startDate: string;
  endDate: string;
  totalDays: number;
  renterName: string;
  renterPhone: string;
  renterEmail?: string;
  specialRequests?: string;
}

@Component({
  selector: 'app-rental-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  template: `
    <div class="min-h-screen bg-slate-50">
      <!-- Navigation breadcrumb -->
      <div class="bg-white border-b border-slate-200">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav class="flex items-center space-x-2 text-sm">
            <button class="text-blue-600 hover:text-blue-800 font-medium">Home</button>
            <svg class="w-4 h-4 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"/>
            </svg>
            <button class="text-blue-600 hover:text-blue-800 font-medium">{{ getCategoryLabel(rentalItem.category) }}</button>
            <svg class="w-4 h-4 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"/>
            </svg>
            <span class="text-slate-600 truncate">{{ rentalItem.title }}</span>
          </nav>
        </div>
      </div>

      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">

          <!-- Left Column: Images and Details -->
          <div class="lg:col-span-2 space-y-6">

            <!-- Main Product Images -->
            <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <!-- Main Image Display -->
              <div class="relative">
                <div class="aspect-square bg-slate-100">
                  <img [src]="selectedImage().url"
                       [alt]="selectedImage().alt"
                       class="w-full h-full object-cover" />
                </div>

                <!-- Image Navigation Arrows -->
                <button *ngIf="rentalItem.images.length > 1"
                        (click)="previousImage()"
                        class="absolute left-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-black bg-opacity-50 hover:bg-opacity-75 text-white rounded-full flex items-center justify-center transition-all">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                  </svg>
                </button>

                <button *ngIf="rentalItem.images.length > 1"
                        (click)="nextImage()"
                        class="absolute right-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-black bg-opacity-50 hover:bg-opacity-75 text-white rounded-full flex items-center justify-center transition-all">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                  </svg>
                </button>

                <!-- Image Counter -->
                <div *ngIf="rentalItem.images.length > 1"
                     class="absolute bottom-4 right-4 bg-black bg-opacity-75 text-white px-3 py-1 rounded-full text-sm">
                  {{ currentImageIndex() + 1 }} / {{ rentalItem.images.length }}
                </div>

                <!-- Status Badges -->
                <div class="absolute top-4 left-4 flex flex-col gap-2">
                  <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 border border-green-200">
                    Available for Rent
                  </span>
                  <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
                        [class]="getConditionBadgeClass(rentalItem.condition)">
                    {{ rentalItem.condition | titlecase }} Condition
                  </span>
                </div>

                <!-- Favorite Button -->
                <button (click)="toggleFavorite()"
                        class="absolute top-4 right-4 w-10 h-10 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full flex items-center justify-center transition-all shadow-md">
                  <svg class="w-5 h-5 transition-colors"
                       [class]="isFavorited() ? 'text-red-500 fill-current' : 'text-slate-400'"
                       fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                  </svg>
                </button>
              </div>

              <!-- Thumbnail Gallery -->
              <div *ngIf="rentalItem.images.length > 1" class="p-4 bg-slate-50">
                <div class="flex space-x-3 overflow-x-auto pb-2">
                  <button *ngFor="let image of rentalItem.images; let i = index"
                          (click)="selectImage(i)"
                          class="flex-shrink-0 w-16 h-16 bg-white rounded-lg border-2 overflow-hidden transition-all"
                          [class]="i === currentImageIndex() ? 'border-blue-500' : 'border-slate-200 hover:border-slate-300'">
                    <img [src]="image.url" [alt]="image.alt" class="w-full h-full object-cover" />
                  </button>
                </div>
              </div>
            </div>

            <!-- Rental Details Section -->
            <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
              <div class="space-y-6">

                <!-- Product Title and Category -->
                <div>
                  <div class="flex items-center justify-between mb-4">
                    <h1 class="text-3xl font-bold text-slate-900 leading-tight">{{ rentalItem.title }}</h1>
                    <button class="text-slate-400 hover:text-slate-600 transition-colors">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"/>
                      </svg>
                    </button>
                  </div>

                  <div class="flex flex-wrap items-center gap-3 mb-6">
                    <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200">
                      {{ getCategoryLabel(rentalItem.category) }}
                    </span>
                    <span class="text-slate-500 text-sm">•</span>
                    <span class="text-slate-500 text-sm">{{ rentalItem.views }} views</span>
                    <span class="text-slate-500 text-sm">•</span>
                    <span class="text-slate-500 text-sm">{{ rentalItem.totalRentals }} times rented</span>
                    <span class="text-slate-500 text-sm">•</span>
                    <span class="text-slate-500 text-sm">Listed {{ getTimeAgo(rentalItem.listedDate) }}</span>
                  </div>
                </div>

                <!-- Rental Rates Section -->
                <div class="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
                  <h3 class="text-lg font-semibold text-slate-900 mb-4">Rental Rates</h3>
                  <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div class="text-center p-4 bg-white rounded-lg border border-green-200">
                      <div class="text-2xl font-bold text-slate-900">PKR {{ rentalItem.dailyRate | number:'1.0-0' }}</div>
                      <div class="text-sm text-slate-600">Per Day</div>
                    </div>
                    <div *ngIf="rentalItem.weeklyRate" class="text-center p-4 bg-white rounded-lg border border-green-200">
                      <div class="text-2xl font-bold text-slate-900">PKR {{ rentalItem.weeklyRate | number:'1.0-0' }}</div>
                      <div class="text-sm text-slate-600">Per Week</div>
                      <div class="text-xs text-green-600 font-medium">Save {{ getWeeklySavings() }}%</div>
                    </div>
                    <div *ngIf="rentalItem.monthlyRate" class="text-center p-4 bg-white rounded-lg border border-green-200">
                      <div class="text-2xl font-bold text-slate-900">PKR {{ rentalItem.monthlyRate | number:'1.0-0' }}</div>
                      <div class="text-sm text-slate-600">Per Month</div>
                      <div class="text-xs text-green-600 font-medium">Save {{ getMonthlySavings() }}%</div>
                    </div>
                  </div>
                  <div class="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div class="flex items-center justify-between">
                      <span class="text-sm font-medium text-blue-900">Security Deposit:</span>
                      <span class="text-sm font-bold text-blue-900">PKR {{ rentalItem.securityDeposit | number:'1.0-0' }}</span>
                    </div>
                    <div class="text-xs text-blue-700 mt-1">Refundable upon return in good condition</div>
                  </div>
                </div>

                <!-- Rental Terms -->
                <div class="bg-slate-50 rounded-xl p-6 border border-slate-200">
                  <h3 class="text-lg font-semibold text-slate-900 mb-4">Rental Terms</h3>
                  <div class="grid grid-cols-2 gap-4 text-sm">
                    <div class="flex justify-between py-2">
                      <span class="text-slate-600">Minimum Rental:</span>
                      <span class="font-medium text-slate-900">{{ rentalItem.minRentalDays }} day(s)</span>
                    </div>
                    <div class="flex justify-between py-2">
                      <span class="text-slate-600">Maximum Rental:</span>
                      <span class="font-medium text-slate-900">{{ rentalItem.maxRentalDays }} day(s)</span>
                    </div>
                    <div class="flex justify-between py-2">
                      <span class="text-slate-600">Delivery Radius:</span>
                      <span class="font-medium text-slate-900">{{ rentalItem.deliveryRadius }} km</span>
                    </div>
                    <div class="flex justify-between py-2">
                      <span class="text-slate-600">Delivery Fee:</span>
                      <span class="font-medium text-slate-900">PKR {{ rentalItem.deliveryFee || 'Free' }}</span>
                    </div>
                  </div>
                </div>

                <!-- Specifications -->
                <div *ngIf="rentalItem.specifications" class="space-y-3">
                  <h3 class="text-lg font-semibold text-slate-900">Specifications</h3>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div *ngFor="let spec of getSpecificationEntries()" class="flex justify-between py-2 border-b border-slate-100">
                      <span class="font-medium text-slate-700">{{ spec.key | titlecase }}:</span>
                      <span class="text-slate-600">{{ spec.value }}</span>
                    </div>
                  </div>
                </div>

                <!-- Description -->
                <div class="space-y-3">
                  <h3 class="text-xl font-semibold text-slate-900">Description</h3>
                  <p class="text-slate-600 leading-relaxed whitespace-pre-line">{{ rentalItem.description }}</p>
                </div>

                <!-- Tags -->
                <div *ngIf="rentalItem.tags.length > 0" class="space-y-3">
                  <h3 class="text-lg font-semibold text-slate-900">Tags</h3>
                  <div class="flex flex-wrap gap-2">
                    <span *ngFor="let tag of rentalItem.tags"
                          class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 cursor-pointer transition-colors">
                      #{{ tag }}
                    </span>
                  </div>
                </div>

                <!-- Availability Options -->
                <div class="space-y-3">
                  <h3 class="text-lg font-semibold text-slate-900">Availability Options</h3>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div *ngIf="rentalItem.pickupAvailable"
                         class="flex items-center p-4 bg-green-50 border border-green-200 rounded-lg">
                      <svg class="w-5 h-5 text-green-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"/>
                      </svg>
                      <div>
                        <div class="text-sm font-semibold text-green-800">Pickup Available</div>
                        <div class="text-xs text-green-600">Collect from owner's location</div>
                      </div>
                    </div>

                    <div *ngIf="rentalItem.deliveryAvailable"
                         class="flex items-center p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <svg class="w-5 h-5 text-blue-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/>
                        <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1V8a1 1 0 00-1-1h-3z"/>
                      </svg>
                      <div>
                        <div class="text-sm font-semibold text-blue-800">Delivery Available</div>
                        <div class="text-xs text-blue-600">Within {{ rentalItem.deliveryRadius }}km radius</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Similar Rentals -->
            <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
              <h3 class="text-xl font-semibold text-slate-900 mb-6">Similar Rentals</h3>
              <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div *ngFor="let similar of similarRentals"
                     class="group cursor-pointer">
                  <div class="aspect-square bg-slate-100 rounded-lg overflow-hidden mb-3">
                    <img [src]="similar.image" [alt]="similar.title"
                         class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" />
                  </div>
                  <h4 class="text-sm font-medium text-slate-900 line-clamp-2 mb-1">{{ similar.title }}</h4>
                  <p class="text-sm font-bold text-green-600">PKR {{ similar.dailyRate | number:'1.0-0' }}/day</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Right Column: Booking and Owner Info -->
          <div class="space-y-6">

            <!-- Booking Widget -->
            <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sticky top-4">
              <h3 class="text-lg font-semibold text-slate-900 mb-4">Book This Item</h3>

              <form [formGroup]="bookingForm" (ngSubmit)="submitBooking()">
                <div class="space-y-4">
                  <!-- Date Selection -->
                  <div class="grid grid-cols-2 gap-3">
                    <div>
                      <label class="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
                      <input type="date"
                             formControlName="startDate"
                             [min]="getMinDate()"
                             class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-sm" />
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-slate-700 mb-1">End Date</label>
                      <input type="date"
                             formControlName="endDate"
                             [min]="bookingForm.get('startDate')?.value"
                             class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-sm" />
                    </div>
                  </div>

                  <!-- Rental Summary -->
                  <div *ngIf="getRentalSummary()" class="bg-slate-50 rounded-lg p-4 border border-slate-200">
                    <h4 class="font-medium text-slate-900 mb-3">Rental Summary</h4>
                    <div class="space-y-2 text-sm">
                      <div class="flex justify-between">
                        <span class="text-slate-600">Duration:</span>
                        <span class="font-medium">{{ getRentalSummary()?.totalDays }} day(s)</span>
                      </div>
                      <div class="flex justify-between">
                        <span class="text-slate-600">Rate:</span>
                        <span class="font-medium">PKR {{ getRentalSummary()?.dailyRate | number:'1.0-0' }}/day</span>
                      </div>
                      <div class="flex justify-between">
                        <span class="text-slate-600">Subtotal:</span>
                        <span class="font-medium">PKR {{ getRentalSummary()?.subtotal | number:'1.0-0' }}</span>
                      </div>
                      <div class="flex justify-between">
                        <span class="text-slate-600">Security Deposit:</span>
                        <span class="font-medium">PKR {{ rentalItem.securityDeposit | number:'1.0-0' }}</span>
                      </div>
                      <div class="border-t border-slate-300 pt-2 flex justify-between">
                        <span class="font-semibold text-slate-900">Total:</span>
                        <span class="font-bold text-slate-900">PKR {{ getRentalSummary()?.total | number:'1.0-0' }}</span>
                      </div>
                    </div>
                  </div>

                  <!-- Renter Information -->
                  <div class="space-y-3">
                    <input type="text"
                           formControlName="renterName"
                           placeholder="Your full name"
                           class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-sm" />
                    <input type="tel"
                           formControlName="renterPhone"
                           placeholder="Your phone number"
                           class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-sm" />
                    <input type="email"
                           formControlName="renterEmail"
                           placeholder="Your email (optional)"
                           class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-sm" />
                    <textarea formControlName="specialRequests"
                              rows="3"
                              placeholder="Any special requests or notes..."
                              class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors resize-none text-sm"></textarea>
                  </div>

                  <button type="submit"
                          [disabled]="bookingForm.invalid || isLoadingBooking()"
                          class="w-full flex items-center justify-center px-4 py-3 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-lg transition-colors font-medium">
                    <svg *ngIf="isLoadingBooking()" class="animate-spin w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span *ngIf="!isLoadingBooking()">Request Booking</span>
                    <span *ngIf="isLoadingBooking()">Processing...</span>
                  </button>
                </div>
              </form>

              <!-- Chat Button -->
              <div class="mt-4 pt-4 border-t border-slate-200">
                <button (click)="openChatDrawer()"
                        class="w-full flex items-center justify-center px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium">
                  <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                  </svg>
                  Chat with Owner
                  <span *ngIf="unreadMessages() > 0" class="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                    {{ unreadMessages() }}
                  </span>
                </button>
              </div>
            </div>

            <!-- Owner Information -->
            <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h3 class="text-lg font-semibold text-slate-900 mb-4">Owner Information</h3>

              <div class="flex items-center space-x-4 mb-4">
                <div class="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                  <span class="text-white font-semibold text-lg">{{ getInitials(rentalItem.owner.name) }}</span>
                </div>
                <div class="flex-1">
                  <div class="flex items-center space-x-2">
                    <h4 class="font-semibold text-slate-900">{{ rentalItem.owner.name }}</h4>
                    <div *ngIf="rentalItem.owner.isVerified"
                         class="inline-flex items-center">
                      <svg class="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                      </svg>
                    </div>
                  </div>
                  <div class="text-sm text-slate-600">Member since {{ rentalItem.owner.memberSince }}</div>
                </div>
              </div>

              <!-- Rating -->
              <div class="flex items-center mb-4">
                <div class="flex items-center space-x-1">
                  <span *ngFor="let star of [1,2,3,4,5]"
                        class="text-lg"
                        [class]="star <= rentalItem.owner.rating ? 'text-yellow-400' : 'text-slate-300'">
                    ★
                  </span>
                </div>
                <span class="ml-2 text-sm font-medium text-slate-700">{{ rentalItem.owner.rating }}/5</span>
                <span class="ml-1 text-sm text-slate-500">({{ rentalItem.owner.totalRatings }} reviews)</span>
              </div>

              <!-- Quick Actions -->
              <div class="grid grid-cols-1 gap-3">
                <button class="flex items-center justify-center px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors text-sm font-medium">
                  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                  </svg>
                  View Owner Profile
                </button>
                <button class="flex items-center justify-center px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors text-sm font-medium">
                  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
                  </svg>
                  More Items by Owner
                </button>
              </div>
            </div>

            <!-- Location Information -->
            <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h3 class="text-lg font-semibold text-slate-900 mb-4">Location</h3>

              <div class="space-y-3">
                <div class="flex items-start space-x-3">
                  <svg class="w-5 h-5 text-slate-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"/>
                  </svg>
                  <div>
                    <div class="font-medium text-slate-900">{{ rentalItem.city }}<span *ngIf="rentalItem.area">, {{ rentalItem.area }}</span></div>
                    <div class="text-sm text-slate-600 mt-1">{{ rentalItem.address }}</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Safety Tips for Rentals -->
            <div class="bg-amber-50 rounded-2xl border border-amber-200 p-6">
              <div class="flex items-start space-x-3">
                <svg class="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                </svg>
                <div>
                  <h4 class="text-sm font-semibold text-amber-800 mb-2">Rental Safety Tips</h4>
                  <ul class="text-xs text-amber-700 space-y-1">
                    <li>• Inspect the item thoroughly before accepting</li>
                    <li>• Take photos/videos at pickup and return</li>
                    <li>• Read rental terms and conditions carefully</li>
                    <li>• Keep all communication within the platform</li>
                    <li>• Report any issues immediately</li>
                  </ul>
                </div>
              </div>
            </div>

            <!-- Report Listing -->
            <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <button (click)="toggleReportForm()"
                      class="flex items-center text-sm text-red-600 hover:text-red-800 transition-colors">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"/>
                </svg>
                Report this listing
              </button>

              <div *ngIf="showReportForm()" class="mt-4 space-y-3">
                <textarea [(ngModel)]="reportMessage"
                          rows="3"
                          placeholder="Describe the issue with this listing..."
                          class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors resize-none text-sm"></textarea>
                <div class="flex gap-2">
                  <button (click)="submitReport()"
                          class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors">
                    Submit Report
                  </button>
                  <button (click)="toggleReportForm()"
                          class="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Recently Viewed Rentals -->
        <div class="mt-12 bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <h3 class="text-xl font-semibold text-slate-900 mb-6">Recently Viewed Rentals</h3>
          <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            <div *ngFor="let recent of recentlyViewed"
                 class="group cursor-pointer">
              <div class="aspect-square bg-slate-100 rounded-lg overflow-hidden mb-3">
                <img [src]="recent.image" [alt]="recent.title"
                     class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" />
              </div>
              <h4 class="text-sm font-medium text-slate-900 line-clamp-2 mb-1">{{ recent.title }}</h4>
              <p class="text-sm font-bold text-green-600">PKR {{ recent.dailyRate | number:'1.0-0' }}/day</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Chat Drawer Overlay -->
      <div *ngIf="isChatOpen()"
           (click)="closeChatDrawer()"
           class="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"></div>

      <!-- Chat Drawer -->
      <div class="fixed right-0 top-0 h-full w-96 bg-white shadow-2xl transform transition-transform duration-300 z-50"
           [class.translate-x-0]="isChatOpen()"
           [class.translate-x-full]="!isChatOpen()">

        <!-- Chat Header -->
        <div class="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50">
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
              <span class="text-white font-semibold text-sm">{{ getInitials(rentalItem.owner.name) }}</span>
            </div>
            <div>
              <h3 class="font-semibold text-slate-900">{{ rentalItem.owner.name }}</h3>
              <p class="text-xs text-slate-500">{{ rentalItem.title | slice:0:30 }}...</p>
            </div>
          </div>
          <button (click)="closeChatDrawer()"
                  class="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <svg class="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <!-- Chat Messages -->
        <div class="flex-1 h-0 p-4 space-y-4 overflow-y-auto"
             style="height: calc(100vh - 140px);">
          <div *ngFor="let message of chatMessages(); trackBy: trackMessage"
               class="flex"
               [class.justify-end]="message.senderId === 'current-user'">
            <div class="max-w-xs lg:max-w-md"
                 [class]="message.senderId === 'current-user' ? 'order-1' : 'order-2'">

              <!-- Message Bubble -->
              <div class="px-4 py-2 rounded-2xl text-sm"
                   [class]="message.senderId === 'current-user'
                     ? 'bg-blue-500 text-white ml-2'
                     : 'bg-slate-100 text-slate-900 mr-2'">
                <p>{{ message.message }}</p>
              </div>

              <!-- Timestamp -->
              <div class="text-xs text-slate-500 mt-1 px-2"
                   [class]="message.senderId === 'current-user' ? 'text-right' : 'text-left'">
                {{ formatMessageTime(message.timestamp) }}
              </div>
            </div>
          </div>

          <!-- Typing Indicator -->
          <div *ngIf="isOwnerTyping()" class="flex justify-start">
            <div class="max-w-xs">
              <div class="bg-slate-100 px-4 py-2 rounded-2xl mr-2">
                <div class="flex space-x-1">
                  <div class="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                  <div class="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
                  <div class="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Chat Input -->
        <div class="p-4 border-t border-slate-200">
          <form (ngSubmit)="sendChatMessage()" class="flex space-x-2">
            <input type="text"
                   [(ngModel)]="newMessage"
                   name="newMessage"
                   placeholder="Type your message..."
                   class="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
                   [disabled]="isSendingMessage()" />
            <button type="submit"
                    [disabled]="!newMessage.trim() || isSendingMessage()"
                    class="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white rounded-lg transition-colors flex-shrink-0">
              <svg *ngIf="!isSendingMessage()" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
              </svg>
              <svg *ngIf="isSendingMessage()" class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </button>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    @keyframes bounce {
      0%, 80%, 100% {
        transform: scale(0);
      } 40% {
        transform: scale(1);
      }
    }

    .animate-bounce {
      animation: bounce 1.4s infinite ease-in-out both;
    }
  `]
})
export class RentalPageComponent implements OnInit {
  private fb = new FormBuilder();

  // Signals
  currentImageIndex = signal(0);
  isFavorited = signal(false);
  isLoadingBooking = signal(false);
  showReportForm = signal(false);
  isChatOpen = signal(false);
  chatMessages = signal<ChatMessage[]>([]);
  unreadMessages = signal(0);
  isOwnerTyping = signal(false);
  isSendingMessage = signal(false);

  // Data properties
  reportMessage = '';
  newMessage = '';

  // Forms
  bookingForm!: FormGroup;

  // Mock rental item data
  rentalItem: RentalItem = {
    id: 'rental_123',
    title: 'Professional DSLR Camera - Canon EOS R5 with 24-70mm Lens',
    description: `High-end professional DSLR camera perfect for photography enthusiasts, content creators, and professionals.

Perfect for:
- Wedding photography
- Portrait sessions
- Travel photography
- Content creation
- Video recording

Included in rental:
- Canon EOS R5 Body
- Canon RF 24-70mm f/2.8L IS USM Lens
- 2x Batteries + Charger
- 64GB Memory Card
- Camera Bag
- Lens Cleaning Kit
- Tripod (upon request)

Features:
- 45MP Full-Frame CMOS Sensor
- 8K Video Recording
- In-body Image Stabilization
- Dual Memory Card Slots
- Weather-sealed construction

The camera is in excellent condition and professionally maintained. Perfect for capturing life's special moments with stunning quality.

Delivery available within 15km radius. Professional guidance provided for first-time users.`,
    dailyRate: 3500,
    weeklyRate: 20000,
    monthlyRate: 70000,
    securityDeposit: 25000,
    category: 'photography',
    condition: 'excellent',
    brand: 'Canon',
    model: 'EOS R5',
    images: [
      { url: 'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=800', alt: 'Canon EOS R5 with lens', id: 'img1' },
      { url: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800', alt: 'Camera accessories', id: 'img2' },
      { url: 'https://images.unsplash.com/photo-1521651201144-634f700b36ef?w=800', alt: 'Camera in action', id: 'img3' },
      { url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800', alt: 'Complete kit', id: 'img4' }
    ],
    tags: ['dslr', 'canon', 'photography', 'professional', 'video', '8k', 'full-frame'],
    address: 'Clifton Block 9, near Dolmen Mall',
    city: 'Karachi',
    area: 'Clifton',
    phone: '+923001234567',
    email: 'photographer@example.com',
    pickupAvailable: true,
    deliveryAvailable: true,
    deliveryRadius: 15,
    deliveryFee: 500,
    minRentalDays: 1,
    maxRentalDays: 30,
    availability: {
      startDate: '2025-08-30',
      endDate: '2025-12-31',
      unavailableDates: ['2025-09-15', '2025-09-16', '2025-10-25']
    },
    owner: {
      name: 'Sarah Ahmed',
      memberSince: 'January 2023',
      rating: 4.9,
      totalRatings: 89,
      isVerified: true
    },
    listedDate: '2025-08-15T10:00:00Z',
    totalRentals: 156,
    views: 2341,
    isActive: true,
    specifications: {
      'Sensor': '45MP Full-Frame CMOS',
      'Video': '8K30p, 4K120p',
      'ISO Range': '100-51,200',
      'Stabilization': '8-stop In-body IS',
      'Memory Cards': 'CFexpress + SD',
      'Battery Life': '320 shots',
      'Weight': '650g (body only)',
      'Connectivity': 'Wi-Fi, Bluetooth, USB-C'
    }
  };

  // Mock similar rentals
  similarRentals = [
    {
      title: 'Sony A7 IV Mirrorless Camera',
      dailyRate: 3000,
      image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400'
    },
    {
      title: 'Nikon D850 DSLR Camera',
      dailyRate: 2800,
      image: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400'
    },
    {
      title: 'Canon EOS R6 Camera Body',
      dailyRate: 2500,
      image: 'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=400'
    },
    {
      title: 'Fujifilm X-T5 Camera',
      dailyRate: 2200,
      image: 'https://images.unsplash.com/photo-1521651201144-634f700b36ef?w=400'
    }
  ];

  // Mock recently viewed
  recentlyViewed = [
    {
      title: 'MacBook Pro M2 16" Laptop',
      dailyRate: 2000,
      image: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=400'
    },
    {
      title: 'Gaming PC Setup RTX 4090',
      dailyRate: 1500,
      image: 'https://images.unsplash.com/photo-1587831990711-23ca6441447b?w=400'
    },
    {
      title: 'iPhone 15 Pro Max',
      dailyRate: 800,
      image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400'
    },
    {
      title: 'DJI Mavic Air 2 Drone',
      dailyRate: 1200,
      image: 'https://images.unsplash.com/photo-1507582020474-9a35b7d455d9?w=400'
    },
    {
      title: 'Professional Lighting Kit',
      dailyRate: 900,
      image: 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=400'
    },
    {
      title: 'Portable Sound System',
      dailyRate: 600,
      image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400'
    }
  ];

  // Categories mapping
  categories = [
    { value: 'electronics', label: 'Electronics' },
    { value: 'photography', label: 'Photography Equipment' },
    { value: 'vehicles', label: 'Vehicles' },
    { value: 'furniture', label: 'Furniture' },
    { value: 'appliances', label: 'Home Appliances' },
    { value: 'sports', label: 'Sports Equipment' },
    { value: 'tools', label: 'Tools & Machinery' },
    { value: 'events', label: 'Event Supplies' },
    { value: 'other', label: 'Other' }
  ];

  constructor() {
    this.initializeForms();
    this.initializeChatMessages();
  }

  ngOnInit() {
    // Simulate incrementing view count
    this.rentalItem.views++;
  }

  private initializeForms() {
    this.bookingForm = this.fb.group({
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      renterName: ['', Validators.required],
      renterPhone: ['', [Validators.required, Validators.pattern(/^[+]?[0-9]{10,15}$/)]],
      renterEmail: ['', [Validators.email]],
      specialRequests: ['']
    });
  }

  private initializeChatMessages() {
    // Mock chat messages
    const mockMessages: ChatMessage[] = [
      {
        id: '1',
        senderId: 'owner-123',
        senderName: 'Sarah Ahmed',
        message: 'Hi! Thanks for your interest in my Canon EOS R5. How can I help you?',
        timestamp: '2025-08-30T09:00:00Z',
        type: 'text',
        isRead: true
      },
      {
        id: '2',
        senderId: 'current-user',
        senderName: 'You',
        message: 'Hello! I\'m interested in renting this camera for a wedding shoot next weekend. Is it available?',
        timestamp: '2025-08-30T09:15:00Z',
        type: 'text',
        isRead: true
      },
      {
        id: '3',
        senderId: 'owner-123',
        senderName: 'Sarah Ahmed',
        message: 'Yes, it should be available! Let me check the exact dates. The camera comes with everything shown in the listing. Have you used a Canon R5 before?',
        timestamp: '2025-08-30T09:20:00Z',
        type: 'text',
        isRead: false
      }
    ];

    this.chatMessages.set(mockMessages);
    this.unreadMessages.set(mockMessages.filter(m => !m.isRead && m.senderId !== 'current-user').length);
  }

  // Computed properties
  selectedImage = computed(() => {
    return this.rentalItem.images[this.currentImageIndex()] || this.rentalItem.images[0];
  });

  // Image navigation
  nextImage() {
    this.currentImageIndex.update(index =>
      index >= this.rentalItem.images.length - 1 ? 0 : index + 1
    );
  }

  previousImage() {
    this.currentImageIndex.update(index =>
      index <= 0 ? this.rentalItem.images.length - 1 : index - 1
    );
  }

  selectImage(index: number) {
    this.currentImageIndex.set(index);
  }

  // Favorites
  toggleFavorite() {
    this.isFavorited.update(fav => !fav);
  }

  // Helper methods
  getCategoryLabel(value: string): string {
    const category = this.categories.find(cat => cat.value === value);
    return category ? category.label : value;
  }

  getConditionBadgeClass(condition: string): string {
    const classes = {
      'new': 'bg-emerald-100 text-emerald-800 border-emerald-200',
      'excellent': 'bg-blue-100 text-blue-800 border-blue-200',
      'good': 'bg-green-100 text-green-800 border-green-200',
      'fair': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'poor': 'bg-orange-100 text-orange-800 border-orange-200'
    };
    return classes[condition as keyof typeof classes] || 'bg-gray-100 text-gray-800 border-gray-200';
  }

  getTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'today';
    if (diffDays === 1) return 'yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  getSpecificationEntries(): {key: string, value: string}[] {
    if (!this.rentalItem.specifications) return [];
    return Object.entries(this.rentalItem.specifications).map(([key, value]) => ({key, value}));
  }

  getMinDate(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  getWeeklySavings(): number {
    if (!this.rentalItem.weeklyRate) return 0;
    const dailyTotal = this.rentalItem.dailyRate * 7;
    const savings = ((dailyTotal - this.rentalItem.weeklyRate) / dailyTotal) * 100;
    return Math.round(savings);
  }

  getMonthlySavings(): number {
    if (!this.rentalItem.monthlyRate) return 0;
    const dailyTotal = this.rentalItem.dailyRate * 30;
    const savings = ((dailyTotal - this.rentalItem.monthlyRate) / dailyTotal) * 100;
    return Math.round(savings);
  }

  getRentalSummary() {
    const startDate = this.bookingForm.get('startDate')?.value;
    const endDate = this.bookingForm.get('endDate')?.value;

    if (!startDate || !endDate) return null;

    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = end.getTime() - start.getTime();
    const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (totalDays <= 0) return null;

    let rate = this.rentalItem.dailyRate;
    let subtotal = totalDays * rate;

    // Apply weekly/monthly rates if beneficial
    if (this.rentalItem.weeklyRate && totalDays >= 7) {
      const weeks = Math.floor(totalDays / 7);
      const remainingDays = totalDays % 7;
      subtotal = (weeks * this.rentalItem.weeklyRate) + (remainingDays * this.rentalItem.dailyRate);
    }

    if (this.rentalItem.monthlyRate && totalDays >= 30) {
      const months = Math.floor(totalDays / 30);
      const remainingDays = totalDays % 30;
      subtotal = (months * this.rentalItem.monthlyRate) + (remainingDays * this.rentalItem.dailyRate);
    }

    return {
      totalDays,
      dailyRate: rate,
      subtotal,
      total: subtotal + this.rentalItem.securityDeposit
    };
  }

  // Booking submission
  async submitBooking() {
    if (this.bookingForm.invalid) return;

    this.isLoadingBooking.set(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));

      const bookingData = {
        ...this.bookingForm.value,
        itemId: this.rentalItem.id,
        summary: this.getRentalSummary(),
        timestamp: new Date().toISOString()
      };

      console.log('Booking submitted:', bookingData);

      // Add system message to chat
      const systemMessage: ChatMessage = {
        id: Date.now().toString(),
        senderId: 'system',
        senderName: 'System',
        message: `Booking request submitted for ${this.getRentalSummary()?.totalDays} day(s). The owner will respond shortly.`,
        timestamp: new Date().toISOString(),
        type: 'system',
        isRead: true
      };

      this.chatMessages.update(messages => [...messages, systemMessage]);

      // Reset form
      this.bookingForm.reset();

      // Show success message
      alert('Booking request submitted successfully! The owner will contact you soon.');

      // Open chat drawer to continue communication
      this.openChatDrawer();

    } catch (error) {
      console.error('Failed to submit booking:', error);
      alert('Failed to submit booking. Please try again.');
    } finally {
      this.isLoadingBooking.set(false);
    }
  }

  // Chat functionality
  openChatDrawer() {
    this.isChatOpen.set(true);
    // Mark messages as read when opening chat
    this.chatMessages.update(messages =>
      messages.map(m => ({ ...m, isRead: true }))
    );
    this.unreadMessages.set(0);
  }

  closeChatDrawer() {
    this.isChatOpen.set(false);
  }

  async sendChatMessage() {
    const messageText = this.newMessage.trim();
    if (!messageText || this.isSendingMessage()) return;

    this.isSendingMessage.set(true);

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      senderId: 'current-user',
      senderName: 'You',
      message: messageText,
      timestamp: new Date().toISOString(),
      type: 'text',
      isRead: true
    };

    // Add message immediately
    this.chatMessages.update(messages => [...messages, newMessage]);
    this.newMessage = '';

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Simulate owner typing
      this.isOwnerTyping.set(true);

      // Simulate owner response after a delay
      setTimeout(() => {
        this.isOwnerTyping.set(false);

        const ownerResponse: ChatMessage = {
          id: (Date.now() + 1).toString(),
          senderId: 'owner-123',
          senderName: this.rentalItem.owner.name,
          message: this.generateOwnerResponse(messageText),
          timestamp: new Date().toISOString(),
          type: 'text',
          isRead: true
        };

        this.chatMessages.update(messages => [...messages, ownerResponse]);
      }, 2000);

    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      this.isSendingMessage.set(false);
    }
  }

  private generateOwnerResponse(userMessage: string): string {
    const message = userMessage.toLowerCase();

    if (message.includes('available') || message.includes('book')) {
      return "Yes, the camera is available for those dates! I can also provide a quick tutorial if you're new to this model.";
    } else if (message.includes('price') || message.includes('rate')) {
      return "The rates are as shown - PKR 3,500/day with great discounts for weekly and monthly rentals. Security deposit is fully refundable.";
    } else if (message.includes('delivery')) {
      return "I offer free delivery within 10km, and PKR 500 for up to 15km. I can also arrange pickup if that works better for you.";
    } else if (message.includes('condition') || message.includes('working')) {
      return "The camera is in excellent condition and professionally maintained. I test everything before each rental. You'll love the image quality!";
    } else {
      return "Thanks for your message! I'm here to help with any questions about the camera or rental process. Feel free to ask anything!";
    }
  }

  formatMessageTime(timestamp: string): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString();
  }

  trackMessage(index: number, message: ChatMessage): string {
    return message.id;
  }

  // Report functionality
  toggleReportForm() {
    this.showReportForm.update(show => !show);
    if (!this.showReportForm()) {
      this.reportMessage = '';
    }
  }

  async submitReport() {
    if (!this.reportMessage.trim()) return;

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      console.log('Report submitted:', {
        itemId: this.rentalItem.id,
        message: this.reportMessage,
        timestamp: new Date().toISOString()
      });

      this.showReportForm.set(false);
      this.reportMessage = '';

      alert('Report submitted successfully. We will review it shortly.');

    } catch (error) {
      console.error('Failed to submit report:', error);
      alert('Failed to submit report. Please try again.');
    }
  }
}

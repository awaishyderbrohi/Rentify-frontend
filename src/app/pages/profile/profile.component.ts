import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { Subject, takeUntil, filter } from 'rxjs';
import { AuthService } from '../../services/auth/auth.service';
import { User } from '../../models/User.model';

import { Listing, MyListingsComponent } from "./my-listings/my-listings.component";
import { MessagesComponent } from "./messages/messages.component";
import { EarningsComponent } from "./earnings/earnings.component";
import { ProfileOverviewComponent } from './overview/overview.component';
import { ProfileSettingsComponent } from './settings/settings.component';
import { ListingsService } from '../../services/listings/listings.service';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule,ProfileOverviewComponent,ProfileSettingsComponent,MyListingsComponent,MessagesComponent,EarningsComponent],
  template: `
    <div class="min-h-screen">
      <div class="max-w-7xl mx-auto px-6 py-8">
        <!-- Header -->
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900 mb-2">User Dashboard</h1>
          <p class="text-gray-600">Manage your listings & profile information</p>
        </div>

        <div class="flex gap-8">
          <!-- Sidebar Navigation -->
          <div class="w-72 flex-shrink-0">
            <div class="border border-gray-200 rounded-xl p-2">
              <nav class="space-y-1">
                <button
                  *ngFor="let item of menuItems"
                  (click)="setActiveSection(item.id)"
                  class="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200 text-sm font-medium"
                  [class]="activeSection === item.id
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path [innerHTML]="getIconSvg(item.icon)"></path>
                  </svg>
                  <span>{{ item.label }}</span>
                </button>
              </nav>
            </div>
          </div>

          <!-- Main Content -->
          <div class="flex-1">
            <!-- Profile Overview Section -->
            <div *ngIf="activeSection === 'overview'">
              <app-profile-overview [user]="user"></app-profile-overview>
            </div>

            <!-- Settings Section -->
            <div *ngIf="activeSection === 'settings'">
              <app-profile-settings [user]="user"></app-profile-settings>
            </div>

            <!-- Listings Section -->
            <div *ngIf="activeSection === 'listings'" class="space-y-8">
              <app-my-listings></app-my-listings>
            </div>

            <!-- Messages Section -->
            <div *ngIf="activeSection === 'messages'" class="space-y-8">
              <app-messages></app-messages>
            </div>

            <!-- Earnings Section -->
            <div *ngIf="activeSection === 'earnings'" class="space-y-8">
              <app-earnings-section/>
            </div>

            <!-- Other sections placeholder -->
            <div *ngIf="!['overview', 'settings','listings','messages','earnings'].includes(activeSection)" class="border border-gray-200 rounded-xl p-12">
              <div class="text-center text-gray-500">
                <svg class="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                </svg>
                <h3 class="text-lg font-medium text-gray-900 mb-2">{{ activeSection.charAt(0).toUpperCase() + activeSection.slice(1) }}</h3>
                <p class="text-gray-600">This section is coming soon...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ProfileComponent implements OnInit, OnDestroy {
  user: User | null = null;
  activeSection = 'overview'; // Default section

  private destroy$ = new Subject<void>();
  listings:Listing[]=[];

  menuItems = [
    { id: 'overview', label: 'Profile', icon: 'user' },
    { id: 'listings', label: 'My Listings', icon: 'package' },
    { id: 'rentals', label: 'My Rentals', icon: 'calendar' },
    { id: 'messages', label: 'Messages', icon: 'message' },
    { id: 'earnings', label: 'Earnings', icon: 'dollar' },
    { id: 'settings', label: 'Settings', icon: 'settings' }
  ];

  constructor(
    private authService: AuthService,
    private listingsService:ListingsService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  // Listen for custom navigation event from child components
  @HostListener('window:navigate-to-settings', ['$event'])
  onNavigateToSettings() {
    this.navigateToSection('settings');
  }

  ngOnInit() {
    // Subscribe to router events to get current route
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.updateActiveSectionFromRoute();
      });

    // Also check initial route
    this.updateActiveSectionFromRoute();


    // Subscribe to user data
    this.getUserData();

    if (!this.user) {
      this.authService.loadUser();
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private updateActiveSectionFromRoute() {
    // Get the last segment of the current route
    const urlSegments = this.router.url.split('/');
    const lastSegment = urlSegments[urlSegments.length - 1];

    // Handle query parameters and fragments
    const section = lastSegment.split('?')[0].split('#')[0];

    // Validate if it's a valid section
    if (this.isValidSection(section)) {
      this.activeSection = section;
    } else {
      // If invalid or empty, default to overview
      this.activeSection = 'overview';
    }
  }

  getUserData() {
    this.authService.user$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.user = user;
      });
  }

  navigateToSection(section: string) {
    if (this.isValidSection(section)) {
      this.router.navigate(['/profile', section]);
    }
  }

  setActiveSection(section: string) {
    // Navigate to the section instead of just setting the activeSection
    this.navigateToSection(section);
  }

  isValidSection(section: string): boolean {
    return this.menuItems.some(item => item.id === section);
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

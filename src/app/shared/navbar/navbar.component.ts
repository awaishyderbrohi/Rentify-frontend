import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit, OnDestroy, signal, ElementRef, ViewChild } from '@angular/core';
import { User } from '../../models/User.model';
import { Category } from '../../models/Category.model';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth/auth.service';
import { LocationService } from '../../services/location/location.service';
import { Observable, Subject, debounceTime, distinctUntilChanged, switchMap, of } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

export interface SearchParams {
  product: string;
  location: {
    search: string;
    latitude?: number;
    longitude?: number;
    placeId?: string;
  };
}

export interface LocationSuggestion {
  place_id: string;
  display_name: string;
  lat: string;
  lon: string;
  address?: {
    city?: string;
    state?: string;
    country?: string;
  };
}

@Component({
  selector: 'app-navbar',
  imports: [CommonModule, FormsModule],
  standalone:true,
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit, OnDestroy {
  @ViewChild('locationInput', { static: false }) locationInput!: ElementRef<HTMLInputElement>;

  // Signals for reactive state management
  isMobileMenuOpen = signal(false);
  isCategoriesDropdownOpen = signal(false);
  isUserDropdownOpen = signal(false);
  isEmailBannerVisible = signal(false);
  isLocationDropdownOpen = signal(false);
  searchQuery = signal('');
  locationQuery = signal('');
  locationSuggestions = signal<LocationSuggestion[]>([]);
  selectedLocation = signal<LocationSuggestion | null>(null);
  isLoadingLocationSuggestions = signal(false);

  user$!: Observable<User | null>;
  private destroy$ = new Subject<void>();
  private locationSearchSubject = new Subject<string>();

  categories: Category[] = [
  {
    id: 'printers',
    name: 'Printers & Scanners',
    icon: 'M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z',
    color: 'blue'
  },
  {
    id: 'photography',
    name: 'Photography & Video',
    icon: 'M3 9a2 2 0 012-2h.93l.82-1.64A2 2 0 018.93 4h6.14a2 2 0 011.82 1.36L17.07 7H18a2 2 0 012 2v9a2 2 0 01-2 2H6a2 2 0 01-2-2V9z',
    color: 'purple'
  },
  {
    id: 'vehicles',
    name: 'Cars & Bikes',
    icon: 'M19 17h2c.6 0 1-.4 1-1s-.4-1-1-1h-2v2zm-7-6l.94-2.06L15 8l-2.06-.94L12 5l-.94 2.06L9 8l2.06.94L12 11z',
    color: 'orange'
  },
  {
    id: 'tools',
    name: 'Tools & Equipments',
    icon: 'M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z',
    color: 'green'
  },
  {
    id: 'audio',
    name: 'Audio & Music',
    icon: 'M15.536 5.464a9 9 0 010 12.728M12.879 8.121a5 5 0 010 7.758M9.5 12a2.5 2.5 0 01-5 0 2.5 2.5 0 015 0z',
    color: 'red'
  },
  {
    id: 'computing',
    name: 'Computing & Tech',
    icon: 'M9 3v2.01A6 6 0 003 11v6a2 2 0 002 2h14a2 2 0 002-2v-6a6 6 0 00-6-5.99V3a1 1 0 10-2 0v2H11V3a1 1 0 10-2 0z',
    color: 'teal'
  },
  {
    id: 'electronics',
    name: 'Electronics',
    icon: 'M13 10V3L4 14h7v7l9-11h-7z',
    color: 'cyan'
  },
  {
    id: 'books',
    name: 'Books & Education',
    icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
    color: 'yellow'
  },
  {
    id: 'home',
    name: 'Home & Garden',
    icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
    color: 'pink'
  },
  {
    id: 'sports',
    name: 'Sports',
    icon: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
    color: 'indigo'
  },
  {
    id: 'other',
    name: 'Other',
    icon: 'M19 11H5m14-7l2 2-2 2M5 21l2-2-2-2',
    color: 'gray'
  }
];

  constructor(
    private router: Router,
    private auth: AuthService,
    private locationService: LocationService
  ) {}

  ngOnInit(): void {
    // Assign after constructor initializes
    this.user$ = this.auth.user$;
    // Load user data on component initialization
    this.auth.loadUser();

    // Setup location search debouncing
    this.setupLocationSearch();

    // Get user's current location
    this.getCurrentLocation();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupLocationSearch(): void {
    this.locationSearchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(query => {
        if (query.length < 2) {
          return of([]);
        }
        this.isLoadingLocationSuggestions.set(true);
        return this.locationService.searchLocations(query);
      }),
      takeUntil(this.destroy$)
    ).subscribe({
      next: (suggestions) => {
        this.locationSuggestions.set(suggestions);
        this.isLoadingLocationSuggestions.set(false);
        this.isLocationDropdownOpen.set(suggestions.length > 0);
      },
      error: (error) => {
        console.error('Location search error:', error);
        this.locationSuggestions.set([]);
        this.isLoadingLocationSuggestions.set(false);
        this.isLocationDropdownOpen.set(false);
      }
    });
  }

  private getCurrentLocation(): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          this.locationService.reverseGeocode(latitude, longitude).subscribe({
            next: (location: LocationSuggestion | null) => {
              if (location) {
                this.selectedLocation.set(location);
                this.locationQuery.set(this.formatLocationDisplay(location));
              }
            },
            error: (error) => {
              console.error('Reverse geocoding error:', error);
            }
          });
        },
        (error) => {
          console.error('Geolocation error:', error);
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 300000 }
      );
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;

    // Close categories dropdown if clicking outside
    if (!target.closest('.categories-dropdown-container')) {
      this.isCategoriesDropdownOpen.set(false);
    }

    // Close user dropdown if clicking outside
    if (!target.closest('.user-dropdown-container')) {
      this.isUserDropdownOpen.set(false);
    }

    // Close location dropdown if clicking outside
    if (!target.closest('.location-dropdown-container')) {
      this.isLocationDropdownOpen.set(false);
    }

    // Close mobile menu if clicking on backdrop
    if (target.classList.contains('mobile-backdrop')) {
      this.closeMobileMenu();
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(): void {
    // Close mobile menu on window resize
    if (window.innerWidth >= 1024) {
      this.closeMobileMenu();
    }
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen.update(value => !value);
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen.set(false);
  }

  toggleCategoriesDropdown(): void {
    this.isCategoriesDropdownOpen.update(value => !value);
  }

  toggleUserDropdown(): void {
    this.isUserDropdownOpen.update(value => !value);
  }

  onLocationInputChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    const value = target.value;
    this.locationQuery.set(value);

    if (value !== this.formatLocationDisplay(this.selectedLocation())) {
      this.selectedLocation.set(null);
    }

    this.locationSearchSubject.next(value);
  }

  onLocationSuggestionClick(suggestion: LocationSuggestion): void {
    this.selectedLocation.set(suggestion);
    this.locationQuery.set(this.formatLocationDisplay(suggestion));
    this.isLocationDropdownOpen.set(false);
    this.locationSuggestions.set([]);
  }

  onLocationInputFocus(): void {
    const query = this.locationQuery();
    if (query.length >= 2 && this.locationSuggestions().length > 0) {
      this.isLocationDropdownOpen.set(true);
    }
  }

  clearLocation(): void {
    this.selectedLocation.set(null);
    this.locationQuery.set('');
    this.isLocationDropdownOpen.set(false);
    this.locationSuggestions.set([]);
    if (this.locationInput) {
      this.locationInput.nativeElement.focus();
    }
  }

  formatLocationDisplay(location: LocationSuggestion | null): string {
    if (!location) return '';

    const parts = location.display_name.split(', ');
    // Return city, state format or first 2 parts
    return parts.slice(0, 2).join(', ');
  }

  getInitials(name: any): any {
    if (!name) return 'U';

    const words = name.trim().split(' ');
    if (words.length === 1) {
      return words[0].charAt(0).toUpperCase();
    }

    return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
  }

  onSearch(): void {
    const productQuery = this.searchQuery();
    const selectedLoc = this.selectedLocation();

    if (!productQuery.trim()) {
      console.warn('Search query is empty');
      return;
    }

    const searchParams: SearchParams = {
      product: productQuery,
      location: {
        search: this.locationQuery(),
        latitude: selectedLoc ? parseFloat(selectedLoc.lat) : undefined,
        longitude: selectedLoc ? parseFloat(selectedLoc.lon) : undefined,
        placeId: selectedLoc ? selectedLoc.place_id : undefined
      }
    };

    console.log('Search params:', searchParams);
    this.closeMobileMenu();

    // Navigate to search results with parameters
    this.router.navigate(['/search'],
      {
      queryParams: {
        q: searchParams.product,
        location: searchParams.location.search,
        lat: searchParams.location.latitude,
        lng: searchParams.location.longitude,
      }
    }
  );
  }

  OnLogo(): void {
    this.router.navigate(['']);
  }

  onCategoryClick(category: Category): void {
    console.log('Category clicked:', category);
    this.isCategoriesDropdownOpen.set(false);
    this.closeMobileMenu();

    // Navigate to category page with location if selected
    const selectedLoc = this.selectedLocation();
    const queryParams: any = { category: category.id };

    if (selectedLoc) {
      queryParams.location = this.locationQuery();
      queryParams.lat = parseFloat(selectedLoc.lat);
      queryParams.lng = parseFloat(selectedLoc.lon);
    }

    this.router.navigate(['/products/category', category.id]);
  }

  onLogin(): void {
    console.log('Login clicked');
    this.router.navigate(['/login']);
    this.closeMobileMenu();
  }

  onListEquipment(): void {
    console.log('List equipment clicked');
    this.router.navigate(['list-equipment']);
    this.closeMobileMenu();
  }

  onForBusiness(): void {
    console.log('For business clicked');
    this.closeMobileMenu();
    this.router.navigate(['/business']);
  }

  onHowItWorks(): void {
    console.log('How it works clicked');
    this.router.navigate(['/how-it-works']);
  }

  // User Profile Menu Actions
  onProfile(): void {
    console.log('Profile clicked');
    this.isUserDropdownOpen.set(false);
    this.closeMobileMenu();
    this.router.navigate(['/profile']);
  }

  onMyRentals(): void {
    console.log('My rentals clicked');
    this.isUserDropdownOpen.set(false);
    this.closeMobileMenu();
    this.router.navigate(['/profile/rentals']);
  }

  onMyListings(): void {
    console.log('My listings clicked');
    this.isUserDropdownOpen.set(false);
    this.closeMobileMenu();
    this.router.navigate(['/profile/listings']);
  }

  onSettings(): void {
    console.log('Settings clicked');
    this.isUserDropdownOpen.set(false);
    this.closeMobileMenu();
    this.router.navigate(['/profile/settings']);
  }

  onLogout(): void {
    console.log('Logout clicked');
    this.isUserDropdownOpen.set(false);
    this.closeMobileMenu();
    this.logout();
  }

  dismissEmailBanner(): void {
    this.isEmailBannerVisible.set(false);
  }

  onVerifyEmail(): void {
    console.log('Verify email clicked');
    // Implement email verification logic here
  }

  getCategoryIconColor(color: string): string {
    const colorMap: { [key: string]: string } = {
      'blue': 'bg-blue-100 text-blue-600',
      'green': 'bg-green-100 text-green-600',
      'purple': 'bg-purple-100 text-purple-600',
      'orange': 'bg-orange-100 text-orange-600',
      'red': 'bg-red-100 text-red-600'
    };
    return colorMap[color] || 'bg-gray-100 text-gray-600';
  }

  logout(): void {
    console.log('Logging out...');

    this.auth.logout().subscribe({
      next: () => {
        console.log('Logout successful');
        this.router.navigate(['/']);
      },
      error: (error) => {
        console.error('Logout failed:', error);
        this.router.navigate(['/']);
      }
    });
  }

  /**
   * TrackBy function for location suggestions to improve performance
   */
  trackLocationSuggestion(index: number, item: LocationSuggestion): string {
    return item.place_id;
  }
}

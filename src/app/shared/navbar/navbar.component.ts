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
      id: 'tools',
      name: 'Tools & Equipment',
      icon: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z',
      color: 'blue'
    },
    {
      id: 'electronics',
      name: 'Electronics',
      icon: 'M13 10V3L4 14h7v7l9-11h-7z',
      color: 'green'
    },
    {
      id: 'vehicles',
      name: 'Vehicles',
      icon: 'M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M10.5 4L12 2l1.5 2M21 10l-2-2m-14 2l-2-2',
      color: 'purple'
    },
    {
      id: 'furniture',
      name: 'Furniture',
      icon: 'M3 7V5a2 2 0 012-2h2m-4 4h16M3 7l1 12a2 2 0 002 2h8a2 2 0 002-2l1-12M7 7v6m4-6v6m4-6v6',
      color: 'orange'
    },
    {
      id: 'sports',
      name: 'Sports & Recreation',
      icon: 'M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12z',
      color: 'red'
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
    //   {
    //   queryParams: {
    //     q: searchParams.product,
    //     location: searchParams.location.search,
    //     lat: searchParams.location.latitude,
    //     lng: searchParams.location.longitude,
    //     placeId: searchParams.location.placeId
    //   }
    // }
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

    this.router.navigate(['/category', category.id], { queryParams });
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
    this.router.navigate(['/user/profile']);
  }

  onMyRentals(): void {
    console.log('My rentals clicked');
    this.isUserDropdownOpen.set(false);
    this.closeMobileMenu();
    this.router.navigate(['/my-rentals']);
  }

  onMyListings(): void {
    console.log('My listings clicked');
    this.isUserDropdownOpen.set(false);
    this.closeMobileMenu();
    this.router.navigate(['/my-listings']);
  }

  onSettings(): void {
    console.log('Settings clicked');
    this.isUserDropdownOpen.set(false);
    this.closeMobileMenu();
    this.router.navigate(['/settings']);
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

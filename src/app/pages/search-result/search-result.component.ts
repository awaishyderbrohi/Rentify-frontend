import { Component, OnInit, OnDestroy, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { ListingsService } from '../../services/listings/listings.service';
import { ToasterService } from '../../services/toaster/toaster.service';

interface LocationCoordinates {
  lat: number;
  lng: number;
}

interface DeliveryOptions {
  pickup: boolean;
  delivery: boolean;
  deliveryRadius?: number;
  deliveryFee?: number;
}

interface UserProfile {
  id: string;
  name: string;
  profilePicUrl: string;
  isVerified: boolean;
  isBusiness: boolean;
  rating: number;
  totalReviews: number;
  specialization?: string;
}

interface Listing {
  id: string;
  title: string;
  category: string;
  description: string;
  price: number;
  priceType: string;
  address: string;
  city: string;
  area: string;
  coordinates?: LocationCoordinates;
  phone: string;
  email: string[];
  deliveryOptions: DeliveryOptions;
  agreeToTerms: boolean;
  images: string[];
  status: 'active' | 'inactive' | 'rented';
  views: number;
  favorites: number;
  createdAt: string;
  updatedAt: string;
  availability: boolean;
  rentedUntil?: string;
  distance?: number;
  user: UserProfile;
}

interface FilterOptions {
  category: string[];
  priceRange: { min: number; max: number };
  location: string;
  radius: number;
  deliveryOptions: string[];
}

interface SortOption {
  key: string;
  label: string;
  direction: 'asc' | 'desc';
}

interface SearchParams {
  query: string;
  location: string;
  category?: string;
  page: number;
  limit: number;
  sort: string;
  filters: Partial<FilterOptions>;
}

@Component({
  selector: 'app-search-results',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule],
  templateUrl: './search-result.component.html',
  styleUrls: ['./search-result.component.css']
})
export class SearchResultsComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private listingsService = inject(ListingsService);
  private toaster = inject(ToasterService);

  // Signals for reactive state management
  searchResults = signal<Listing[]>([]);
  isLoading = signal(false);
  currentPage = signal(1);
  totalItems = signal(0);
  itemsPerPage = 12;
  viewMode = signal<'grid' | 'list'>('grid');

  // Search and filter state
  searchQuery = '';
  locationQuery = '';
  currentSort = 'relevance_desc';
  selectedRadius = 0;
  priceRange = { min: 0, max: 10000 };

  selectedFilters = signal<FilterOptions>({
    category: [],
    priceRange: { min: 0, max: 10000 },
    location: '',
    radius: 0,
    deliveryOptions: []
  });

  currentParams = signal<SearchParams>({
    query: '',
    location: '',
    category: '',
    page: 1,
    limit: 12,
    sort: 'relevance_desc',
    filters: {}
  });

  // Available options for filters
  popularCategories = ['electronics', 'furniture', 'vehicles', 'tools', 'clothing'];

  availableCategories = signal([
    { key: 'electronics', label: 'Electronics', count: 145 },
    { key: 'furniture', label: 'Furniture', count: 89 },
    { key: 'vehicles', label: 'Vehicles', count: 234 },
    { key: 'tools', label: 'Tools & Equipment', count: 67 },
    { key: 'clothing', label: 'Clothing & Fashion', count: 123 },
    { key: 'sports', label: 'Sports & Recreation', count: 78 },
    { key: 'books', label: 'Books & Media', count: 45 },
    { key: 'home', label: 'Home & Garden', count: 156 }
  ]);

  sortOptions: SortOption[] = [
    { key: 'relevance', label: 'Most Relevant', direction: 'desc' },
    { key: 'price', label: 'Price: Low to High', direction: 'asc' },
    { key: 'price', label: 'Price: High to Low', direction: 'desc' },
    { key: 'created', label: 'Newest First', direction: 'desc' },
    { key: 'created', label: 'Oldest First', direction: 'asc' },
    { key: 'distance', label: 'Distance: Near to Far', direction: 'asc' },
    { key: 'views', label: 'Most Popular', direction: 'desc' }
  ];

  // Computed properties
  totalPages = computed(() => Math.ceil(this.totalItems() / this.itemsPerPage));

  foundPriceRange = computed(() => {
    const results = this.searchResults();
    if (results.length === 0) return { min: 0, max: 0 };
    const prices = results.map(r => r.price);
    return {
      min: Math.min(...prices),
      max: Math.max(...prices)
    };
  });

  paginatedResults = computed(() => {
    const results = this.searchResults();
    const startIndex = (this.currentPage() - 1) * this.itemsPerPage;
    return results.slice(startIndex, startIndex + this.itemsPerPage);
  });

  private destroy$ = new Subject<void>();

  ngOnInit() {
    // Initialize from route params
    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe(params => {
      this.searchQuery = params['q'] || '';
      this.locationQuery = params['location'] || '';
      this.currentPage.set(parseInt(params['page']) || 1);

      if (params['category']) {
        this.selectedFilters.update(f => ({
          ...f,
          category: [params['category']]
        }));
      }

      this.performSearch();
    });

    // Load view mode preference
    const savedViewMode = localStorage.getItem('viewMode') as 'grid' | 'list';
    if (savedViewMode) {
      this.viewMode.set(savedViewMode);
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  performSearch() {
    this.isLoading.set(true);

    const searchParams: SearchParams = {
      query: this.searchQuery,
      location: this.locationQuery,
      page: this.currentPage(),
      limit: this.itemsPerPage,
      sort: this.currentSort,
      filters: this.selectedFilters()
    };

    this.currentParams.set(searchParams);

    // Simulate API call - replace with actual service call
    setTimeout(() => {
      this.searchResults.set(this.generateMockResults());
      this.totalItems.set(247); // Mock total
      this.isLoading.set(false);
    }, 800);

    // Update URL
    this.updateUrl();
  }

  private generateMockResults(): Listing[] {
    // Mock data generation with user profiles
    const mockUsers: UserProfile[] = [
      {
        id: '1',
        name: 'Ahmed Khan',
        profilePicUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
        isVerified: true,
        isBusiness: false,
        rating: 4.9,
        totalReviews: 23,
        specialization: 'Tech Enthusiast'
      },
      {
        id: '2',
        name: 'Sarah Ahmed',
        profilePicUrl: 'https://images.unsplash.com/photo-1494790108755-2616b612b830?w=40&h=40&fit=crop&crop=face',
        isVerified: true,
        isBusiness: true,
        rating: 4.7,
        totalReviews: 156,
        specialization: 'Furniture Store'
      },
      {
        id: '3',
        name: 'Ali Hassan',
        profilePicUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face',
        isVerified: true,
        isBusiness: false,
        rating: 5.0,
        totalReviews: 87,
        specialization: 'Pro Photographer'
      }
    ];

    const mockListings: Listing[] = [
      {
        id: '1',
        title: 'MacBook Pro 13" M2 Chip - Like New Condition',
        category: 'electronics',
        description: 'Barely used MacBook Pro with M2 chip. Perfect for work and creative projects. Comes with original charger and box.',
        price: 85,
        priceType: 'daily',
        address: '123 Tech Street',
        city: 'Karachi',
        area: 'Clifton',
        coordinates: { lat: 24.8607, lng: 67.0011 },
        phone: '+92-300-1234567',
        email: ['owner@example.com'],
        deliveryOptions: { pickup: true, delivery: true, deliveryRadius: 15, deliveryFee: 50 },
        agreeToTerms: true,
        images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500'],
        status: 'active',
        views: 145,
        favorites: 32,
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z',
        availability: true,
        distance: 2.5,
        user: mockUsers[0]
      },
      {
        id: '2',
        title: 'Ergonomic Office Chair - Premium Quality',
        category: 'furniture',
        description: 'Professional ergonomic office chair with lumbar support. Great for long working hours.',
        price: 25,
        priceType: 'daily',
        address: '456 Office Avenue',
        city: 'Karachi',
        area: 'DHA',
        coordinates: { lat: 24.8615, lng: 67.0099 },
        phone: '+92-300-2345678',
        email: ['furniture@example.com'],
        deliveryOptions: { pickup: true, delivery: false },
        agreeToTerms: true,
        images: ['https://images.unsplash.com/photo-1541558869434-2840d308329a?w=500'],
        status: 'active',
        views: 89,
        favorites: 18,
        createdAt: '2024-01-14T14:30:00Z',
        updatedAt: '2024-01-14T14:30:00Z',
        availability: true,
        distance: 5.2,
        user: mockUsers[1]
      },
      {
        id: '3',
        title: 'Canon EOS R6 Professional Camera',
        category: 'electronics',
        description: 'Brand new Canon EOS R6 with kit lens. Perfect for photography enthusiasts and professionals.',
        price: 120,
        priceType: 'daily',
        address: '789 Camera Road',
        city: 'Karachi',
        area: 'Gulshan',
        coordinates: { lat: 24.8607, lng: 67.0011 },
        phone: '+92-300-3456789',
        email: ['camera@example.com'],
        deliveryOptions: { pickup: true, delivery: true, deliveryRadius: 25, deliveryFee: 75 },
        agreeToTerms: true,
        images: ['https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=500'],
        status: 'active',
        views: 234,
        favorites: 67,
        createdAt: '2024-01-13T09:15:00Z',
        updatedAt: '2024-01-13T09:15:00Z',
        availability: true,
        distance: 8.7,
        user: mockUsers[2]
      }
    ];

    return mockListings;
  }

  // Filter and sort methods
  toggleFilter(type: keyof FilterOptions, value: string) {
    this.selectedFilters.update(filters => {
      const currentValues = filters[type] as string[];
      const newValues = currentValues.includes(value)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value];

      return { ...filters, [type]: newValues };
    });
    this.performSearch();
  }

  toggleQuickFilter(type: keyof FilterOptions, value: string) {
    this.toggleFilter(type, value);
  }

  removeFilter(type: keyof FilterOptions, value: string) {
    this.selectedFilters.update(filters => {
      const currentValues = filters[type] as string[];
      const newValues = currentValues.filter(v => v !== value);
      return { ...filters, [type]: newValues };
    });
    this.performSearch();
  }

  clearAllFilters() {
    this.selectedFilters.set({
      category: [],
      priceRange: { min: 0, max: 10000 },
      location: '',
      radius: 0,
      deliveryOptions: []
    });
    this.priceRange = { min: 0, max: 10000 };
    this.selectedRadius = 0;
    this.performSearch();
  }

  // Event handlers
  onSearchChange(event: any) {
    this.searchQuery = event.target.value;
  }

  onLocationChange(event: any) {
    this.locationQuery = event.target.value;
  }

  onSortChange() {
    this.performSearch();
  }

  onPriceRangeChange() {
    this.selectedFilters.update(f => ({
      ...f,
      priceRange: { ...this.priceRange }
    }));
    this.performSearch();
  }

  onRadiusChange() {
    this.selectedFilters.update(f => ({
      ...f,
      radius: this.selectedRadius
    }));
    this.performSearch();
  }

  // View and navigation methods
  setViewMode(mode: 'grid' | 'list') {
    this.viewMode.set(mode);
    localStorage.setItem('viewMode', mode);
  }

  goToPage(page: number) {
    this.currentPage.set(page);
    this.performSearch();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  getVisiblePages(): number[] {
    const current = this.currentPage();
    const total = this.totalPages();
    const delta = 2;

    let start = Math.max(1, current - delta);
    let end = Math.min(total, current + delta);

    if (end - start < 2 * delta) {
      start = Math.max(1, end - 2 * delta);
      end = Math.min(total, start + 2 * delta);
    }

    const pages = [];
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }

  navigateToProduct(id: string) {
    this.router.navigate(['/product', id]);
  }

  // Utility methods
  hasActiveFilters(): boolean {
    const filters = this.selectedFilters();
    return filters.category.length > 0 ||
           filters.deliveryOptions.length > 0 ||
           filters.priceRange.min > 0 ||
           filters.priceRange.max < 10000;
  }

  getActiveFilters() {
    const filters = this.selectedFilters();
    const active: { type: string; value: string; label: string; }[] = [];

    filters.category.forEach(cat => {
      const category = this.availableCategories().find(c => c.key === cat);
      if (category) {
        active.push({ type: 'category', value: cat, label: category.label });
      }
    });

    filters.deliveryOptions.forEach(option => {
      active.push({
        type: 'deliveryOptions',
        value: option,
        label: option === 'pickup' ? 'Pickup Available' : 'Delivery Available'
      });
    });

    return active;
  }

  getStatusBadgeClass(status: string): string {
    const classes = {
      'active': 'bg-green-100 text-green-700',
      'rented': 'bg-yellow-100 text-yellow-700',
      'inactive': 'bg-gray-100 text-gray-700'
    };
    return classes[status as keyof typeof classes] || 'bg-gray-100 text-gray-700';
  }

  getUserBadgeText(user: UserProfile): string {
    if (user.isBusiness) {
      return `Business seller • ${user.rating} rating`;
    }
    if (user.isVerified) {
      return `Verified • ${user.rating} rating`;
    }
    if (user.specialization) {
      return `${user.specialization} • ${user.rating} rating`;
    }
    return `${user.rating} rating`;
  }

  private updateUrl() {
    const queryParams: any = {};

    if (this.searchQuery) queryParams.q = this.searchQuery;
    if (this.locationQuery) queryParams.location = this.locationQuery;
    if (this.currentPage() > 1) queryParams.page = this.currentPage();

    const filters = this.selectedFilters();
    if (filters.category.length === 1) queryParams.category = filters.category[0];

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: 'merge'
    });
  }
}

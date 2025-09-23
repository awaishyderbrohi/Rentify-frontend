import { Component, OnInit, OnDestroy, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { ListingsService } from '../../services/listings/listings.service';
import { ToasterService } from '../../services/toaster/toaster.service';
import { User } from '../../models/User.model';
import { Listing } from '../profile/my-listings/my-listings.component';

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
  private allResults = signal<Listing[]>([]); // Store all results from API
  isLoading = signal(false);
  currentPage = signal(1);
  totalItems = signal(0);
  itemsPerPage = 12;
  viewMode = signal<'grid' | 'list'>('grid');

  // Search and filter state
  searchQuery = '';
  locationQuery = '';
  latitude = 0;
  longitude = 0;
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

  // Computed properties for filtered and sorted results
  searchResults = computed(() => {
    let results = [...this.allResults()];
    const filters = this.selectedFilters();

    // Apply category filter
    if (filters.category.length > 0) {
      results = results.filter(listing =>
        filters.category.includes(listing.category?.toLowerCase() || '')
      );
    }

    // Apply price range filter
    if (filters.priceRange.min > 0 || filters.priceRange.max < 10000) {
      results = results.filter(listing =>
        listing.price >= filters.priceRange.min &&
        listing.price <= filters.priceRange.max
      );
    }

    // Apply delivery options filter
    if (filters.deliveryOptions.length > 0) {
      results = results.filter(listing => {
        const hasPickup = filters.deliveryOptions.includes('pickup') &&
                          listing.deliveryOptions?.pickup;
        const hasDelivery = filters.deliveryOptions.includes('delivery') &&
                           listing.deliveryOptions?.delivery;
        return hasPickup || hasDelivery;
      });
    }

    // Apply sorting
    results = this.applySorting(results, this.currentSort);

    return results;
  });

  totalPages = computed(() => Math.ceil(this.searchResults().length / this.itemsPerPage));

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

  constructor(private listingService: ListingsService) {}
  private destroy$ = new Subject<void>();

  ngOnInit() {
    // Initialize from route params
    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe(params => {
      this.searchQuery = params['q'] || '';
      this.locationQuery = params['location'] || '';
      this.latitude = params['lat'] || 0;
      this.longitude = params['lng'] || 0;
      this.currentPage.set(parseInt(params['page']) || 1);

      if (params['category']) {
        this.selectedFilters.update(f => ({
          ...f,
          category: [params['category']]
        }));
      }

      // Update price range and radius from params if available
      if (params['minPrice'] || params['maxPrice']) {
        const min = parseInt(params['minPrice']) || 0;
        const max = parseInt(params['maxPrice']) || 10000;
        this.priceRange = { min, max };
        this.selectedFilters.update(f => ({
          ...f,
          priceRange: { min, max }
        }));
      }

      if (params['radius']) {
        this.selectedRadius = parseInt(params['radius']) || 0;
        this.selectedFilters.update(f => ({
          ...f,
          radius: this.selectedRadius
        }));
      }

      this.performSearch();

      console.log(this.searchQuery);
      console.log(this.latitude);
      console.log(this.locationQuery);
      console.log("longitude", this.longitude);
      console.log("current page", this.currentPage());
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

    this.listingService.search(this.searchQuery, this.locationQuery, this.latitude, this.longitude, this.currentPage()).subscribe({
      next: (res) => {
        console.log("search result: ", res.t.content);
        this.allResults.set(res.t.content); // Store all results
        this.totalItems.set(res.t.totalElements); // Keep original total from backend
        this.isLoading.set(false);
      },
      error: (err) => {
        console.log(err.message);
        this.isLoading.set(false);
      }
    });

    // Update URL
    this.updateUrl();
  }

  private applySorting(results: Listing[], sortKey: string): Listing[] {
    const [key, direction] = sortKey.split('_');

    return results.sort((a, b) => {
      let comparison = 0;

      switch (key) {
        case 'price':
          comparison = a.price - b.price;
          break;
        case 'created':
          comparison = new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
          break;
        case 'views':
          comparison = (a.views || 0) - (b.views || 0);
          break;

      }

      return direction === 'desc' ? -comparison : comparison;
    });
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

    // Reset to first page when applying filters
    this.currentPage.set(1);
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

    this.currentPage.set(1);
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
    this.currentPage.set(1);
  }

  // Event handlers
  onSearchChange(event: any) {
    this.searchQuery = event.target.value;
  }

  onLocationChange(event: any) {
    this.locationQuery = event.target.value;
  }

  onSortChange() {
    this.currentPage.set(1);
    // No need for performSearch() - computed property handles sorting
  }

  onPriceRangeChange() {
    this.selectedFilters.update(f => ({
      ...f,
      priceRange: { ...this.priceRange }
    }));
    this.currentPage.set(1);
  }

  onRadiusChange() {
    this.selectedFilters.update(f => ({
      ...f,
      radius: this.selectedRadius
    }));

    this.currentPage.set(1);
  }

  // View and navigation methods
  setViewMode(mode: 'grid' | 'list') {
    this.viewMode.set(mode);
    localStorage.setItem('viewMode', mode);
  }

  goToPage(page: number) {
    this.currentPage.set(page);
    // No need to call performSearch() - pagination works on filtered results
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
    this.router.navigate(['/products', id]);
  }

  // Utility methods
  hasActiveFilters(): boolean {
    const filters = this.selectedFilters();
    return filters.category.length > 0 ||
           filters.deliveryOptions.length > 0 ||
           filters.priceRange.min > 0 ||
           filters.priceRange.max < 10000 ||
           filters.radius > 0;
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

    if (filters.priceRange.min > 0 || filters.priceRange.max < 10000) {
      active.push({
        type: 'priceRange',
        value: 'price',
        label: `$${filters.priceRange.min} - $${filters.priceRange.max}`
      });
    }

    if (filters.radius > 0) {
      active.push({
        type: 'radius',
        value: 'radius',
        label: `Within ${filters.radius}km`
      });
    }

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

  getUserBadgeText(user: User): string {
    if (user.nICVerified) {
      return `Verified • ${user.ratingCount} rating`;
    }
    return `${user.ratingCount} rating`;
  }

  private updateUrl() {
    const queryParams: any = {};

    if (this.searchQuery) queryParams.q = this.searchQuery;
    if (this.locationQuery) queryParams.location = this.locationQuery;
    if (this.currentPage() > 1) queryParams.page = this.currentPage();

    const filters = this.selectedFilters();

    if (filters.category.length === 1) {
      queryParams.category = filters.category[0];
    } else if (filters.category.length > 1) {
      queryParams.categories = filters.category.join(',');
    }

    if (filters.priceRange.min > 0) queryParams.minPrice = filters.priceRange.min;
    if (filters.priceRange.max < 10000) queryParams.maxPrice = filters.priceRange.max;
    if (filters.radius > 0) queryParams.radius = filters.radius;

    if (filters.deliveryOptions.length > 0) {
      queryParams.delivery = filters.deliveryOptions.join(',');
    }

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: 'merge'
    });
  }
}

import { Component, OnInit, OnDestroy, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
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


interface FilterOptions {
  condition: string[];
  priceRange: { min: number; max: number };
  brand: string[];
  deliveryOptions: string[];
  priceType: string[];
  tags: string[];
}

interface SortOption {
  key: string;
  label: string;
  direction: 'asc' | 'desc';
}

interface Category {
  value: string;
  label: string;
}

interface CategoryInfo {
  key: string;
  name: string;
  description: string;
  icon: string;
  totalItems: number;
}

@Component({
  selector: 'app-products-by-category',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule],
  templateUrl: './category-products.component.html',
  styleUrls: ['./category-products.component.css']
})
export class ProductsByCategoryComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private listingsService = inject(ListingsService);
  private toaster = inject(ToasterService);

  // Signals for reactive state management
  private allResults = signal<Listing[]>([]);
  isLoading = signal(false);
  currentPage = signal(1);
  totalItems = signal(0);
  itemsPerPage = 12;
  viewMode = signal<'grid' | 'list'>('grid');

  // Category and filter state
  currentCategory = signal('');
  categoryInfo = signal<CategoryInfo | null>(null);
  currentSort = 'created_desc';
  selectedRadius = 0;
  priceRange = { min: 0, max: 50000 };

  selectedFilters = signal<FilterOptions>({
    condition: [],
    priceRange: { min: 0, max: 50000 },
    brand: [],
    deliveryOptions: [],
    priceType: [],
    tags: []
  });

  // Your specific categories
  categories: Category[] = [
    { value: 'printers', label: "Printers & Scanners" },
    { value: 'photography', label: 'Photography & Video' },
    { value: 'vehicles', label: "Cars & Bikes" },
    { value: 'tools', label: 'Tools & Equipments' },
    { value: 'audio', label: 'Audio & Music' },
    { value: 'computing', label: 'Computing & Tech' },
    { value: 'books', label: 'Books & Education' },
    { value: 'home', label: 'Home & Garden' },
    { value: 'sports', label: 'Sports' },
    { value: 'other', label: 'Other' }
  ];

  // Category info mapping
  categoryInfoMap: Record<string, CategoryInfo> = {
    printers: {
      key: 'printers',
      name: 'Printers & Scanners',
      description: 'Printers, scanners, and office printing equipment',
      icon: 'M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z',
      totalItems: 0
    },
    photography: {
      key: 'photography',
      name: 'Photography & Video',
      description: 'Cameras, lenses, video equipment, and photography gear',
      icon: 'M3 9a2 2 0 012-2h.93l.82-1.64A2 2 0 018.93 4h6.14a2 2 0 011.82 1.36L17.07 7H18a2 2 0 012 2v9a2 2 0 01-2 2H6a2 2 0 01-2-2V9z',
      totalItems: 0
    },
    vehicles: {
      key: 'vehicles',
      name: 'Cars & Bikes',
      description: 'Cars, motorcycles, bicycles, and vehicle parts',
      icon: 'M19 17h2c.6 0 1-.4 1-1s-.4-1-1-1h-2v2zm-7-6l.94-2.06L15 8l-2.06-.94L12 5l-.94 2.06L9 8l2.06.94L12 11z',
      totalItems: 0
    },
    tools: {
      key: 'tools',
      name: 'Tools & Equipments',
      description: 'Power tools, hand tools, construction equipment',
      icon: 'M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z',
      totalItems: 0
    },
    audio: {
      key: 'audio',
      name: 'Audio & Music',
      description: 'Speakers, headphones, musical instruments, audio equipment',
      icon: 'M15.536 5.464a9 9 0 010 12.728M12.879 8.121a5 5 0 010 7.758M9.5 12a2.5 2.5 0 01-5 0 2.5 2.5 0 015 0z',
      totalItems: 0
    },
    computing: {
      key: 'computing',
      name: 'Computing & Tech',
      description: 'Laptops, desktops, tablets, phones, and tech accessories',
      icon: 'M9 3v2.01A6 6 0 003 11v6a2 2 0 002 2h14a2 2 0 002-2v-6a6 6 0 00-6-5.99V3a1 1 0 10-2 0v2H11V3a1 1 0 10-2 0z',
      totalItems: 0
    },
    books: {
      key: 'books',
      name: 'Books & Education',
      description: 'Books, textbooks, educational materials, and stationery',
      icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
      totalItems: 0
    },
    home: {
      key: 'home',
      name: 'Home & Garden',
      description: 'Home appliances, garden tools, furniture, and household items',
      icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
      totalItems: 0
    },
    electronics: {
      key: 'electronics',
      name: 'Electronics',
      description: 'Electronics',
      icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
      totalItems: 0
    },
    sports: {
      key: 'sports',
      name: 'Sports',
      description: 'Sports equipment, fitness gear, and recreational items',
      icon: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
      totalItems: 0
    },
    other: {
      key: 'other',
      name: 'Other',
      description: 'Miscellaneous items and general products',
      icon: 'M19 11H5m14-7l2 2-2 2M5 21l2-2-2-2',
      totalItems: 0
    }
  };

  private destroy$ = new Subject<void>();

  // Available filter options (computed based on current results)
  availableConditions = computed(() => {
    const conditions = new Set<string>();
    this.allResults().forEach(listing => {
      if (listing.condition) conditions.add(listing.condition);
    });
    return Array.from(conditions).map(condition => ({
      key: condition,
      label: condition.charAt(0).toUpperCase() + condition.slice(1),
      count: this.allResults().filter(l => l.condition === condition).length
    }));
  });

  availableBrands = computed(() => {
    const brands = new Set<string>();
    this.allResults().forEach(listing => {
      if (listing.brand) brands.add(listing.brand);
    });
    return Array.from(brands).map(brand => ({
      key: brand,
      label: brand,
      count: this.allResults().filter(l => l.brand === brand).length
    })).slice(0, 20);
  });

  availablePriceTypes = computed(() => {
    const priceTypes = new Set<string>();
    this.allResults().forEach(listing => {
      if (listing.priceType) priceTypes.add(listing.priceType);
    });
    return Array.from(priceTypes).map(priceType => ({
      key: priceType,
      label: priceType.charAt(0).toUpperCase() + priceType.slice(1),
      count: this.allResults().filter(l => l.priceType === priceType).length
    }));
  });

  availableTags = computed(() => {
    const tags = new Set<string>();
    this.allResults().forEach(listing => {
      listing.tags?.forEach(tag => tags.add(tag));
    });
    return Array.from(tags).map(tag => ({
      key: tag,
      label: tag.charAt(0).toUpperCase() + tag.slice(1),
      count: this.allResults().filter(l => l.tags?.includes(tag)).length
    })).slice(0, 15);
  });

  sortOptions: SortOption[] = [
    { key: 'created', label: 'Newest First', direction: 'desc' },
    { key: 'created', label: 'Oldest First', direction: 'asc' },
    { key: 'price', label: 'Price: Low to High', direction: 'asc' },
    { key: 'price', label: 'Price: High to Low', direction: 'desc' },
    { key: 'views', label: 'Most Popular', direction: 'desc' },
    { key: 'rating', label: 'Highest Rated', direction: 'desc' },
    { key: 'title', label: 'Alphabetical A-Z', direction: 'asc' },
    { key: 'title', label: 'Alphabetical Z-A', direction: 'desc' }
  ];

  // Computed properties for filtered and sorted results
  filteredResults = computed(() => {
    let results = [...this.allResults()];
    const filters = this.selectedFilters();

    // Apply condition filter
    if (filters.condition.length > 0) {
      results = results.filter(listing =>
        filters.condition.includes(listing.condition?.toLowerCase() || '')
      );
    }

    // Apply brand filter
    if (filters.brand.length > 0) {
      results = results.filter(listing =>
        filters.brand.includes(listing.brand?.toLowerCase() || '')
      );
    }

    // Apply price range filter
    if (filters.priceRange.min > 0 || filters.priceRange.max < 50000) {
      results = results.filter(listing =>
        listing.price >= filters.priceRange.min &&
        listing.price <= filters.priceRange.max
      );
    }

    // Apply price type filter
    if (filters.priceType.length > 0) {
      results = results.filter(listing =>
        filters.priceType.includes(listing.priceType?.toLowerCase() || '')
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

    // Apply tags filter
    if (filters.tags.length > 0) {
      results = results.filter(listing =>
        filters.tags.some(tag => listing.tags?.includes(tag))
      );
    }

    // Apply sorting
    results = this.applySorting(results, this.currentSort);

    return results;
  });

  totalPages = computed(() => Math.ceil(this.filteredResults().length / this.itemsPerPage));

  foundPriceRange = computed(() => {
    const results = this.filteredResults();
    if (results.length === 0) return { min: 0, max: 0 };
    const prices = results.map(r => r.price);
    return {
      min: Math.min(...prices),
      max: Math.max(...prices)
    };
  });

  paginatedResults = computed(() => {
    const results = this.filteredResults();
    const startIndex = (this.currentPage() - 1) * this.itemsPerPage;
    return results.slice(startIndex, startIndex + this.itemsPerPage);
  });

  ngOnInit() {
    // Get category from route
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      const category = params['category'];
      if (category && this.categoryInfoMap[category]) {
        this.currentCategory.set(category);
        this.categoryInfo.set(this.categoryInfoMap[category]);
        this.loadCategoryProducts();
      } else {
        // Invalid category, redirect to home or show error
        this.router.navigate(['/']);
      }
    });

    // Handle query params for filters
    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe(params => {
      this.currentPage.set(parseInt(params['page']) || 1);

      // Update filters from params if available
      if (params['minPrice'] || params['maxPrice']) {
        const min = parseInt(params['minPrice']) || 0;
        const max = parseInt(params['maxPrice']) || 50000;
        this.priceRange = { min, max };
        this.selectedFilters.update(f => ({
          ...f,
          priceRange: { min, max }
        }));
      }

      if (params['condition']) {
        const conditions = params['condition'].split(',');
        this.selectedFilters.update(f => ({
          ...f,
          condition: conditions
        }));
      }

      if (params['brand']) {
        const brands = params['brand'].split(',');
        this.selectedFilters.update(f => ({
          ...f,
          brand: brands
        }));
      }

      if (params['sort']) {
        this.currentSort = params['sort'];
      }
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

  loadCategoryProducts() {
    this.isLoading.set(true);

    // Call your listings service to get products by category
    this.listingsService.getProductsByCategory(this.currentCategory(), this.currentPage()).subscribe({
      next: (res) => {
        console.log("category products: ", res.t.content);
        this.allResults.set(res.t.content );
        this.totalItems.set(res.t.totalElements);

        // Update category info with actual count
        if (this.categoryInfo()) {
          this.categoryInfo.update(info => info ? { ...info, totalItems: this.totalItems() } : null);
        }

        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading category products:', err);
        this.isLoading.set(false);
      }
    });

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
        case 'rating':
          comparison = (a.rating || 0) - (b.rating || 0);
          break;
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        default:
          comparison = 0;
      }

      return direction === 'desc' ? -comparison : comparison;
    });
  }

  // Filter methods
  toggleFilter(type: keyof FilterOptions, value: string) {
    this.selectedFilters.update(filters => {
      const currentValues = filters[type] as string[];
      const newValues = currentValues.includes(value)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value];

      return { ...filters, [type]: newValues };
    });

    this.currentPage.set(1);
    this.updateUrl();
  }

  clearAllFilters() {
    this.selectedFilters.set({
      condition: [],
      priceRange: { min: 0, max: 50000 },
      brand: [],
      deliveryOptions: [],
      priceType: [],
      tags: []
    });
    this.priceRange = { min: 0, max: 50000 };
    this.currentPage.set(1);
    this.updateUrl();
  }

  // Event handlers
  onSortChange() {
    this.currentPage.set(1);
    this.updateUrl();
  }

  onPriceRangeChange() {
    this.selectedFilters.update(f => ({
      ...f,
      priceRange: { ...this.priceRange }
    }));
    this.currentPage.set(1);
    this.updateUrl();
  }

  // View methods
  setViewMode(mode: 'grid' | 'list') {
    this.viewMode.set(mode);
    localStorage.setItem('viewMode', mode);
  }

  goToPage(page: number) {
    this.currentPage.set(page);
    this.updateUrl();
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
    return filters.condition.length > 0 ||
           filters.brand.length > 0 ||
           filters.deliveryOptions.length > 0 ||
           filters.priceType.length > 0 ||
           filters.tags.length > 0 ||
           filters.priceRange.min > 0 ||
           filters.priceRange.max < 50000;
  }

  getActiveFilters() {
    const filters = this.selectedFilters();
    const active: { type: string; value: string; label: string; }[] = [];

    filters.condition.forEach(condition => {
      const conditionItem = this.availableConditions().find(c => c.key === condition);
      if (conditionItem) {
        active.push({ type: 'condition', value: condition, label: conditionItem.label });
      }
    });

    filters.brand.forEach(brand => {
      active.push({ type: 'brand', value: brand, label: brand });
    });

    filters.priceType.forEach(priceType => {
      const priceTypeItem = this.availablePriceTypes().find(p => p.key === priceType);
      if (priceTypeItem) {
        active.push({ type: 'priceType', value: priceType, label: priceTypeItem.label });
      }
    });

    filters.deliveryOptions.forEach(option => {
      active.push({
        type: 'deliveryOptions',
        value: option,
        label: option === 'pickup' ? 'Pickup Available' : 'Delivery Available'
      });
    });

    filters.tags.forEach(tag => {
      active.push({ type: 'tags', value: tag, label: tag });
    });

    if (filters.priceRange.min > 0 || filters.priceRange.max < 50000) {
      active.push({
        type: 'priceRange',
        value: 'price',
        label: `Rs${filters.priceRange.min} - Rs${filters.priceRange.max}`
      });
    }

    return active;
  }

  getStatusBadgeClass(status: string): string {
    const classes = {
      'ACTIVE': 'badge-success',
      'RENTED': 'badge-warning',
      'INACTIVE': 'badge-neutral'
    };
    return classes[status as keyof typeof classes] || 'badge-neutral';
  }

  getUserBadgeText(user: User): string {
    if (user.nICVerified) {
      return `Verified • ${user.ratingCount} reviews`;
    }
    return `${user.ratingCount} reviews`;
  }

  private updateUrl() {
    const queryParams: any = {};

    if (this.currentPage() > 1) queryParams.page = this.currentPage();

    const filters = this.selectedFilters();

    if (filters.condition.length > 0) {
      queryParams.condition = filters.condition.join(',');
    }

    if (filters.brand.length > 0) {
      queryParams.brand = filters.brand.join(',');
    }

    if (filters.priceRange.min > 0) queryParams.minPrice = filters.priceRange.min;
    if (filters.priceRange.max < 50000) queryParams.maxPrice = filters.priceRange.max;

    if (filters.deliveryOptions.length > 0) {
      queryParams.delivery = filters.deliveryOptions.join(',');
    }

    if (filters.priceType.length > 0) {
      queryParams.priceType = filters.priceType.join(',');
    }

    if (filters.tags.length > 0) {
      queryParams.tags = filters.tags.join(',');
    }

    if (this.currentSort !== 'created_desc') {
      queryParams.sort = this.currentSort;
    }

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: 'merge'
    });
  }
}

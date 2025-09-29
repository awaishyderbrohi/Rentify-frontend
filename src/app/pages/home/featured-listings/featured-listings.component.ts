import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Camera, Wrench, Car, Headphones, Trophy, Grid3X3, ListStart } from 'lucide-angular';
import { ListingsService } from '../../../services/listings/listings.service';
import { Listing } from '../../profile/my-listings/my-listings.component';
import { Router } from '@angular/router';

interface CategoryItem {
  name: string;
  icon: any;
}

@Component({
  selector: 'app-featured-listings',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './featured-listings.html',
  styles: [`
    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .group:hover .group-hover\\:scale-110 {
      transform: scale(1.1);
    }

    .group:hover .group-hover\\:translate-x-1 {
      transform: translateX(0.25rem);
    }

    .card:hover {
      transform: translateY(-4px);
    }

    .badge-lg {
      @apply text-sm font-semibold;
    }

    .btn-sm {
      @apply text-xs;
    }

    .avatar {
      @apply flex-shrink-0;
    }

    /* Custom badge styles matching the hero section */
    .badge {
      @apply rounded-lg;
    }

    /* Smooth transitions */
    .transition-all {
      transition-property: all;
      transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    }

    /* Hover effects */
    .group:hover .group-hover\\:scale-105 {
      transform: scale(1.05);
    }

    /* Loading spinner */
    .loading {
      @apply inline-block animate-spin rounded-full border-4 border-solid border-current border-r-transparent;
    }

    .loading-lg {
      @apply h-10 w-10;
    }
  `]
})
export class FeaturedListingsComponent implements OnInit {
  selectedCategory = 'All';
  listings: Listing[] = [];
  loading = false;
  error: string | null = null;

  // Categories with Lucide icons
  categories: CategoryItem[] = [
    { name: 'Top Products', icon: Grid3X3 },
    // { name: 'Photography', icon: Camera },
    // { name: 'Tools', icon: Wrench },
    // { name: 'Vehicles', icon: Car },
    // { name: 'Audio', icon: Headphones },
    // { name: 'Sports', icon: Trophy }
  ];

  constructor(
    private listingsService: ListingsService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadRandomListings();
  }

  loadRandomListings(): void {
    this.loading = true;
    this.error = null;

    this.listingsService.getRandomItems(8).subscribe({
      next: (response) => {
        console.log('Full API Response:', response);

        // Check different possible response structures
        if (response && response.t && Array.isArray(response.t)) {
          this.listings = response.t;
          console.log('Using response.t:', this.listings.length, 'items');
        } else {
          console.warn('Unexpected response structure. Full response:', response);
          if (response) {
            console.warn('Response keys:', Object.keys(response));
          }
          this.listings = [];
        }

        console.log(`Loaded ${this.listings.length} listings`);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading listings:', error);
        this.error = 'Failed to load listings. Please try again.';
        this.listings = [];
        this.loading = false;
      }
    });
  }

  get getAllListings(): Listing[] {
    if (!this.listings || !Array.isArray(this.listings)) {
      console.log('No listings array available');
      return [];
    }

    // Filter out any invalid listings but be more lenient
    const validListings = this.listings.filter(listing => {
      const isValid = listing && listing.id && listing.title;

      if (!isValid) {
        console.log('Invalid listing found:', listing);
      }

      return isValid;
    });

    console.log(`Returning ${validListings.length} valid listings out of ${this.listings.length} total`);
    return validListings;
  }

  selectCategory(category: string): void {
    this.selectedCategory = category;
    // Add category filtering logic here if needed
  }

  getBadgeClass(status: string): string {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'RENTED':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'INACTIVE':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  }

  trackByCategory(index: number, category: CategoryItem): string {
    return category.name;
  }

  trackByListing(index: number, listing: Listing): string {
    return listing.id || index.toString();
  }

  goToListing(id: string): void {
    if (id) {
      this.router.navigate(['/products/', id]);
    }
  }

  // Helper methods for safe data access
  getListingImage(listing: Listing): string {
    if (listing.images && listing.images.length > 0 && listing.images[0]) {
      return listing.images[0];
    }
    return '/assets/images/placeholder-equipment.jpg';
  }

  getUserName(listing: Listing): string {
    if (listing.user) {
      const firstName = listing.user.firstName || '';
      const lastName = listing.user.lastName || '';
      const fullName = `${firstName} ${lastName}`.trim();
      return fullName || 'Anonymous User';
    }
    return 'Anonymous User';
  }

  getAddress(listing: Listing): string {
    const parts = [];

    if (listing.area) parts.push(listing.area);
    if (listing.city) parts.push(listing.city);
    if (listing.address && !parts.some(part => part.includes(listing.address))) {
      parts.unshift(listing.address);
    }

    return parts.length > 0 ? parts.join(', ') : 'Location not specified';
  }

  getStatusBadgeText(listing: Listing): string {
    switch (listing.status) {
      case 'ACTIVE': return 'Available';
      case 'RENTED': return 'Rented';
      case 'INACTIVE': return 'Unavailable';
      default: return listing.status || 'Unknown';
    }
  }

  getUserProfileImage(listing: Listing): string {
    if (listing.user && listing.user.profilePicUrl) {
      return listing.user.profilePicUrl;
    }
    return '/assets/images/default-avatar.jpg';
  }

  isUserVerified(listing: Listing): boolean {
    return !!(listing.user && listing.user.nICVerified);
  }

  getDeliveryInfo(listing: Listing): string {
    const delivery = listing.deliveryOptions;
    if (!delivery) return 'Contact for details';

    const options = [];
    if (delivery.pickup) options.push('Pickup');
    if (delivery.delivery) options.push('Delivery');

    return options.length > 0 ? options.join(' • ') : 'Contact for details';
  }

  hasRating(listing: Listing): boolean {
    return !!(listing.rating && listing.rating > 0);
  }

  getRating(listing: Listing): number {
    return listing.rating || 0;
  }

  getReviewCount(listing: Listing): number {
    return listing.reviewCount || 0;
  }
}

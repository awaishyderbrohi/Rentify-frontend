import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { identity, Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../../services/auth/auth.service';
import { ListingsService } from '../../../services/listings/listings.service';
import { FormsModule } from '@angular/forms';
import { ToasterService } from '../../../services/toaster/toaster.service';
import { ConfirmationService } from '../../../shared/services/delete-confirmation.service';
import { User } from '../../../models/User.model';

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

export interface Listing {
  relevanceScore: number;
  distance: number;
  id: string;
  title: string;
  category: string;
  condition: string;
  description: string;
  price: number;
  priceType: string;
  brand: string;
  model: string;
  address: string;
  city: string;
  area: string;
  coordinates?: LocationCoordinates;
  phone: string;
  email: string[];
  deliveryOptions: DeliveryOptions;
  agreeToTerms: boolean;
  images: string[];
  // Additional fields for listing management
  status: 'ACTIVE' | 'RENTED' | 'INACTIVE';
  views: number;
  favorites: number;
  createdAt: string;
  updatedAt: string;
  availability: boolean;
  rentedUntil?: string;
  rating?:number;
  reviewCount?:number;
  tags:string[];
  user:User
}

@Component({
  selector: 'app-my-listings',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: `./my-listings.component.html`,
  styles: [`
    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  `]
})
export class MyListingsComponent implements OnInit, OnDestroy {
    private confirmationService = inject(ConfirmationService);


  listings: Listing[] = [];
  filteredListings: Listing[] = [];
  isLoading = true;
  viewMode: 'grid' | 'list' = 'grid';
  searchTerm = '';
  statusFilter = '';
  categoryFilter = '';
  openDropdown: string | null = null;

  stats = {
    total: 0,
    active: 0,
    rented: 0,
    inactive: 0
  };

  private destroy$ = new Subject<void>();

  constructor(
    private router:Router,
    private authService: AuthService,
    private listingsService: ListingsService,
    private toaster:ToasterService
  ) {}

  ngOnInit() {
    this.loadListings();

    // Close dropdown when clicking outside
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.relative')) {
        this.openDropdown = null;
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadListings() {
  this.isLoading = true;

  this.listingsService.getAllUserListings().subscribe({
    next: (res) => {
      // Make sure you're accessing the correct property from response
      this.listings = res.t || res.t || res; // Adjust based on your API response structure
      this.filteredListings = [...this.listings];
      this.updateStats();
      this.isLoading = false;
    },
    error: (error) => {
      console.error('Error loading listings:', error);
      this.isLoading = false;
      this.toaster.show('Error loading listings', 'error');
    }
  });
}


updateStats() {
  this.stats.total = this.listings.length;
  this.stats.active = this.listings.filter(l => l.status === 'ACTIVE').length;
  this.stats.rented = this.listings.filter(l => l.status === 'RENTED').length;
  this.stats.inactive = this.listings.filter(l => l.status === 'INACTIVE').length;
}

  filterListings() {
    this.filteredListings = this.listings.filter(listing => {
      const matchesSearch = !this.searchTerm ||
        listing.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        listing.description.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        listing.brand.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        listing.model.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchesStatus = !this.statusFilter || listing.status === this.statusFilter;
      const matchesCategory = !this.categoryFilter || listing.category === this.categoryFilter;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }

  toggleDropdown(listingId: string) {
    this.openDropdown = this.openDropdown === listingId ? null : listingId;
  }

  createNewListing() {
    this.router.navigate(['/list-equipment'])
  }

  editListing(listingId: string) {
    // Navigate to edit listing page
    console.log('Edit listing:', listingId);
    this.openDropdown = null;
  }



  toggleListingStatus(listingId: string) {
    const listing = this.listings.find(l => l.id === listingId);
    if (listing) {
      listing.status = listing.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      this.updateStats();
      this.filterListings();
    }
    this.openDropdown = null;
  }

  deleteListing(listingId: string) {
    if (confirm('Are you sure you want to delete this listing? This action cannot be undone.')) {
      this.listingsService.deleteListingById(listingId).subscribe({
        next:(res)=>{
          this.toaster.show("Listing deleted successfully!",'success');
          this.updateStats();
          this.filterListings();
        },

        error:(error)=>{
          this.toaster.show("internal server error",'error')}
      })

    }
    this.openDropdown = null;
  }

  goToProduct(id:string){
    this.router.navigate(['/products',id])
  }

  getStatusBadgeClass(status: string): string {
    const classes = {
      'ACTIVE': 'bg-green-100 text-green-800',
      'RENTED': 'bg-yellow-100 text-yellow-800',
      'INACTIVE': 'bg-gray-100 text-gray-800'
    };
    return classes[status as keyof typeof classes] || classes['INACTIVE'];
  }

 getStatusText(status: string): string {
  const texts = {
    'ACTIVE': 'ACTIVE',
    'RENTED': 'RENTED',
    'INACTIVE': 'INACTIVE'
  };
  return texts[status as keyof typeof texts] || 'Unknown';
}

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.ceil(diffDays / 30)} months ago`;

    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  // Helper method to get delivery options display text
  getDeliveryOptionsText(deliveryOptions: DeliveryOptions): string {
    const options: string[] = [];
    if (deliveryOptions.pickup) options.push('Pickup');
    if (deliveryOptions.delivery) {
      const deliveryText = deliveryOptions.deliveryFee
        ? `Delivery ($${deliveryOptions.deliveryFee})`
        : 'Delivery';
      options.push(deliveryText);
    }
    return options.length > 0 ? options.join(', ') : 'Contact seller';
  }

  changeStatus(id:string,status:string){
      this.listingsService.changeListingStatus(id,status).subscribe({
        next:(res)=>{

        },
        error:(error)=>{
          console.log(error.message);
        }
      })
  }


}

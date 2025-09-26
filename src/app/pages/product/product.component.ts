import { Component, OnInit, OnDestroy, inject, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { ListingsService } from '../../services/listings/listings.service';
import { AuthService } from '../../services/auth/auth.service';
import { ToasterService } from '../../services/toaster/toaster.service';
import { User } from '../../models/User.model';
import { Listing } from '../profile/my-listings/my-listings.component';

// Declare Leaflet types
declare global {
  interface Window {
    L: any;
  }
}

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

interface BookingRequest {
  startDate: string;
  endDate: string;
  message?: string;
  deliveryOption: 'pickup' | 'delivery';
  totalAmount: number;
}

@Component({
  selector: 'app-product-page',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.css'],
})
export class ProductPageComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('mapContainer', { static: false }) mapContainer!: ElementRef;

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private listingsService = inject(ListingsService);
  private authService = inject(AuthService);
  private toaster = inject(ToasterService);

  listing: Listing | null = null;
  isLoading = true;
  selectedImageIndex = 0;
  showContactInfo = false;
  isFavorited = false;
  isMapLoaded = false;
  getRentalCost = 0;

  // Leaflet map related properties
  private map: any;
  private marker: any = null;

  // Booking form
  showBookingForm = false;
  bookingRequest: BookingRequest = {
    startDate: '',
    endDate: '',
    message: '',
    deliveryOption: 'pickup',
    totalAmount: 0
  };

  // Related products
  relatedProducts: Listing[] = [];

  private destroy$ = new Subject<void>();

  ngOnInit() {
    this.loadLeafletScript();
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      if (params['id']) {
        this.loadProduct(params['id']);
      }
    });
  }

  ngAfterViewInit() {
    // Initialize map after view is initialized
    if (this.listing && this.listing.coordinates && window.L) {
      setTimeout(() => {
        this.initializeMap();
      }, 100);
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();

    // Clean up map resources
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
  }

  private loadLeafletScript() {
    // Check if Leaflet is already loaded
    if (window.L) {
      return;
    }

    // Load Leaflet CSS
    const cssLink = document.createElement('link');
    cssLink.rel = 'stylesheet';
    cssLink.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    cssLink.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
    cssLink.crossOrigin = '';
    document.head.appendChild(cssLink);

    // Load Leaflet JS
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
    script.crossOrigin = '';
    script.async = true;

    script.onload = () => {
      if (this.listing?.coordinates && this.mapContainer) {
        setTimeout(() => {
          this.initializeMap();
        }, 100);
      }
    };

    document.head.appendChild(script);
  }

  loadProduct(id: string) {
    this.isLoading = true;

    this.listingsService.getListingById(id).subscribe({
      next: (res) => {
        this.listing = res.t;
        this.isLoading = false;
        this.loadRelatedProducts();
        this.checkIfFavorited();
        this.incrementViewCount();

        // Initialize map if coordinates are available and Leaflet is loaded
        if (this.listing?.coordinates && this.mapContainer && window.L) {
          setTimeout(() => {
            this.initializeMap();
          }, 100);
        }
      },
      error: (error) => {
        this.toaster.show('Product not found', 'error');
        this.router.navigate(['/']);
        this.isLoading = false;
      }
    });
  }

  refreshPage() {
    this.router.navigate([this.router.url])
      .then(() => {
        // Page refreshed
      });
  }

  private initializeMap() {
    if (!this.listing?.coordinates || !this.mapContainer || !window.L) {
      this.isMapLoaded = true;
      return;
    }

    try {
      const { lat, lng } = this.listing.coordinates;

      // Create map instance
      this.map = window.L.map(this.mapContainer.nativeElement, {
        center: [lat, lng],
        zoom: 15,
        zoomControl: true,
        scrollWheelZoom: true,
        doubleClickZoom: true,
        boxZoom: true,
        keyboard: true,
        dragging: true,
        touchZoom: true
      });

      // Add OpenStreetMap tile layer (free)
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
      }).addTo(this.map);

      // Create custom marker icon
      const customIcon = window.L.divIcon({
        className: 'custom-marker',
        html: `
          <div style="
            background: #ef4444;
            width: 30px;
            height: 30px;
            border-radius: 50% 50% 50% 0;
            border: 3px solid white;
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
            transform: rotate(-45deg);
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <div style="
              background: white;
              width: 8px;
              height: 8px;
              border-radius: 50%;
              transform: rotate(45deg);
            "></div>
          </div>
        `,
        iconSize: [30, 30],
        iconAnchor: [15, 30],
        popupAnchor: [0, -30]
      });

      // Create marker
      this.marker = window.L.marker([lat, lng], {
        icon: customIcon
      }).addTo(this.map);

      // Create popup content
      const popupContent = `
        <div style="padding: 8px; max-width: 250px; font-family: system-ui, sans-serif;">
          <h3 style="font-weight: 600; color: #1f2937; margin: 0 0 8px 0; font-size: 16px; line-height: 1.3;">${this.listing.title}</h3>
          <p style="margin: 4px 0; font-size: 14px; color: #6b7280;">${this.listing.area}, ${this.listing.city}</p>
          <p style="margin: 4px 0; font-size: 12px; color: #9ca3af; line-height: 1.3;">${this.listing.address}</p>
          <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #e5e7eb;">
            <span style="font-weight: 600; color: #3b82f6; font-size: 14px;">Rs${this.listing.price}</span>
            <span style="color: #6b7280; font-size: 12px;"> / ${this.listing.priceType}</span>
          </div>
        </div>
      `;

      // Bind popup to marker
      this.marker.bindPopup(popupContent);

      // Add a circle to show approximate area (optional)
      const circle = window.L.circle([lat, lng], {
        color: '#3b82f6',
        fillColor: '#3b82f6',
        fillOpacity: 0.1,
        radius: 500, // 500 meters
        weight: 2
      }).addTo(this.map);

      this.isMapLoaded = true;

      // Ensure map renders properly
      setTimeout(() => {
        this.map.invalidateSize();
      }, 250);

    } catch (error) {
      console.error('Error initializing Leaflet map:', error);
      this.isMapLoaded = true;
    }
  }

  openInMaps() {
    if (!this.listing?.coordinates) return;

    const { lat, lng } = this.listing.coordinates;
    const address = encodeURIComponent(this.listing.address);

    // Try to detect device/browser and open appropriate map app
    if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
      // iOS - try Apple Maps first, fallback to Google Maps
      window.open(`maps://maps.apple.com/maps?daddr=${lat},${lng}&ll=`);
    } else if (/Android/.test(navigator.userAgent)) {
      // Android - open Google Maps
      window.open(`geo:${lat},${lng}?q=${lat},${lng}(${address})`);
    } else {
      // Desktop - open OpenStreetMap in browser
      window.open(`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}&zoom=15&layers=M`);
    }
  }

  loadRelatedProducts() {
    if (!this.listing) return;

    this.listingsService.getRelatedItems(this.listing.id)
      .subscribe({
        next: (res) => {
          this.relatedProducts = res.t;
        },
        error: (error) => {
          console.error('Error loading related products:', error);
        }
      });

    // Temporary mock data
    this.relatedProducts = [];
  }

  checkIfFavorited() {
    // Implementation for checking if favorited
  }

  incrementViewCount() {
    if (!this.listing) return;
    // Implementation for incrementing view count
  }

  selectImage(index: number) {
    this.selectedImageIndex = index;
  }

  nextImage() {
    if (!this.listing?.images.length) return;
    this.selectedImageIndex = (this.selectedImageIndex + 1) % this.listing.images.length;
  }

  prevImage() {
    if (!this.listing?.images.length) return;
    this.selectedImageIndex = this.selectedImageIndex === 0
      ? this.listing.images.length - 1
      : this.selectedImageIndex - 1;
  }

  showContact() {
    if (!this.authService.isLoggedIn()) {
      this.toaster.show('Please login to view contact information', 'warning');
      this.router.navigate(['/login']);
      return;
    }
    this.showContactInfo = true;
  }

  openBookingForm() {
    if (!this.authService.isLoggedIn()) {
      this.toaster.show('Please login to book this item', 'warning');
      this.router.navigate(['/login']);
      return;
    }

    if (this.listing?.status !== 'ACTIVE') {
      this.toaster.show('This item is not available for booking', 'info');
      return;
    }

    let currentUser = this.authService.getCurrentUser();

    if (!currentUser.emailVerified) {
      this.toaster.show("Please verify your email Address first", 'info');
      return;
    }
    this.showBookingForm = true;
    this.resetBookingForm();
  }

  resetBookingForm() {
    this.bookingRequest = {
      startDate: '',
      endDate: '',
      message: '',
      deliveryOption: 'pickup',
      totalAmount: 0
    };
  }

  calculateTotal() {
    if (!this.listing || !this.bookingRequest.startDate || !this.bookingRequest.endDate) {
      this.bookingRequest.totalAmount = 0;
      return;
    }

    const start = new Date(this.bookingRequest.startDate);
    const end = new Date(this.bookingRequest.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let total = 0;
    if (this.listing.priceType === 'daily') {
      total = this.listing.price * diffDays;
    } else if (this.listing.priceType === 'weekly') {
      total = this.listing.price * Math.ceil(diffDays / 7);
    } else if (this.listing.priceType === 'monthly') {
      total = this.listing.price * Math.ceil(diffDays / 30);
    }

    // Add delivery fee if delivery is selected
    if (this.bookingRequest.deliveryOption === 'delivery' &&
      this.listing.deliveryOptions.deliveryFee) {
      total += this.listing.deliveryOptions.deliveryFee;
    }

    this.bookingRequest.totalAmount = total;
  }

  submitBookingRequest() {
    if (!this.listing) return;

    if (!this.bookingRequest.startDate || !this.bookingRequest.endDate) {
      this.toaster.show('Please select rental dates', 'warning');
      return;
    }

    if (new Date(this.bookingRequest.startDate) >= new Date(this.bookingRequest.endDate)) {
      this.toaster.show('End date must be after start date', 'warning');
      return;
    }

    // Temporary success simulation
    this.toaster.show('Booking request sent successfully!', 'success');
    this.showBookingForm = false;
    this.resetBookingForm();
  }

  shareProduct() {
    if (navigator.share) {
      navigator.share({
        title: this.listing?.title,
        text: this.listing?.description,
        url: window.location.href
      }).catch(console.error);
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href).then(() => {
        this.toaster.show('Link copied to clipboard!', 'success');
      }).catch(() => {
        alert(`Share this link: ${window.location.href}`);
      });
    }
  }

  reportListing() {
    if (!this.authService.isLoggedIn()) {
      this.toaster.show('Please login to report this listing', 'warning');
      return;
    }

    const reason = prompt('Please provide a reason for reporting this listing:');

    if (reason) {
      setTimeout(() => {
        this.toaster.show('Report submitted successfully. Thank you for helping keep our platform safe.', 'success');
        console.log('Listing reported:', {
          listingId: this.listing?.id,
          reason: reason,
          reportedAt: new Date().toISOString()
        });
      }, 500);
    }
  }

  getStatusBadgeClass(status: string): string {
    const classes = {
      'active': 'bg-green-100 text-green-800',
      'rented': 'bg-yellow-100 text-yellow-800',
      'inactive': 'bg-gray-100 text-gray-800'
    };
    return classes[status as keyof typeof classes] || classes['inactive'];
  }

  getDeliveryOptionsText(deliveryOptions: DeliveryOptions): string {
    const options: string[] = [];
    if (deliveryOptions.pickup) options.push('Pickup available');
    if (deliveryOptions.delivery) {
      const deliveryText = deliveryOptions.deliveryFee
        ? `Delivery available (Rs${deliveryOptions.deliveryFee})`
        : 'Delivery available';
      options.push(deliveryText);
    }
    return options.length > 0 ? options.join(' • ') : 'Contact seller for delivery options';
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  navigateToProduct(productId: string) {
    this.router.navigate(['/products', productId]).then(() => {
      window.location.reload();
    });
  }

  get minDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  get minEndDate(): string {
    if (!this.bookingRequest.startDate) return this.minDate;
    const startDate = new Date(this.bookingRequest.startDate);
    startDate.setDate(startDate.getDate() + 1);
    return startDate.toISOString().split('T')[0];
  }

  getRentalDuration() { }

  navigateUserProfile() {
    this.router.navigate(["/users", this.listing?.user.id]);
  }
}

import { Component, OnInit, OnDestroy, inject, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { ListingsService } from '../../services/listings/listings.service';
import { AuthService } from '../../services/auth/auth.service';
import { ToasterService } from '../../services/toaster/toaster.service';
import { User } from '../../models/User.model';

// Declare Google Maps types
declare global {
  interface Window {
    google: any;
    initGoogleMap: () => void;
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

interface Listing {
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
  status: 'ACTIVE' | 'INACTIVE' | 'RENTED';
  views: number;
  favorites: number;
  createdAt: string;
  updatedAt: string;
  availability: boolean;
  rentedUntil?: string;
  // Additional seller info
  user?:User;
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

  // Google Maps related properties
  private map: google.maps.Map | undefined;
  private marker: google.maps.Marker | null = null;
  private infoWindow: google.maps.InfoWindow | null = null;

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
    this.loadGoogleMapsScript();
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      if (params['id']) {
        this.loadProduct(params['id']);
      }
    });
  }

  ngAfterViewInit() {
    // Initialize map after view is initialized
    if (this.listing && this.listing.coordinates && window.google) {
      setTimeout(() => {
        this.initializeMap();
      }, 100);
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();

    // Clean up map resources
    if (this.marker) {
      this.marker.setMap(null);
    }
    if (this.infoWindow) {
      this.infoWindow.close();
    }

  }

  private loadGoogleMapsScript() {
    // Check if Google Maps script is already loaded
    if (window.google && window.google.maps) {
      return;
    }

    // Create script element
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=YOUR_GOOGLE_MAPS_API_KEY&libraries=geometry,places`;
    script.async = true;
    script.defer = true;

    // Set up callback function
    window.initGoogleMap = () => {
      if (this.listing?.coordinates && this.mapContainer) {
        this.initializeMap();
      }
    };

    script.onload = () => {
      window.initGoogleMap();
    };

    document.head.appendChild(script);
  }

  loadProduct(id: string) {
    this.isLoading = true;

    this.listingsService.getListingById(id).subscribe({
      next: (res) => {
        this.listing = res.t; // Assuming the API returns data in a 'data' property
        this.isLoading = false;
        this.loadRelatedProducts();
        this.checkIfFavorited();
        this.incrementViewCount();

        // Initialize map if coordinates are available and Google Maps is loaded
        if (this.listing?.coordinates && this.mapContainer && window.google) {
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

  private initializeMap() {
    if (!this.listing?.coordinates || !this.mapContainer || !window.google) {
      this.isMapLoaded = true;
      return;
    }

    try {
      const { lat, lng } = this.listing.coordinates;

      // Map options
      const mapOptions: google.maps.MapOptions = {
        center: { lat, lng },
        zoom: 15,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        zoomControl: true,
        streetViewControl: true,
        fullscreenControl: false,
        mapTypeControl: false,
        gestureHandling: 'cooperative',
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          }
        ]
      };

      // Create map instance
      this.map = new google.maps.Map(this.mapContainer.nativeElement, mapOptions);

      // Create marker
      this.marker = new google.maps.Marker({
        position: { lat, lng },
        map: this.map,
        title: this.listing.title,
        animation: google.maps.Animation.DROP,
        icon: {
          url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
          scaledSize: new google.maps.Size(32, 32),
          origin: new google.maps.Point(0, 0),
          anchor: new google.maps.Point(16, 32)
        }
      });

      // Create info window
      this.infoWindow = new google.maps.InfoWindow({
        content: `
          <div style="padding: 12px; max-width: 250px;">
            <h3 style="font-weight: 600; color: #1f2937; margin: 0 0 8px 0; font-size: 16px;">${this.listing.title}</h3>
            <p style="margin: 4px 0; font-size: 14px; color: #6b7280;">${this.listing.area}, ${this.listing.city}</p>
            <p style="margin: 4px 0; font-size: 12px; color: #9ca3af;">${this.listing.address}</p>
            <div style="margin-top: 8px;">
              <span style="font-weight: 600; color: #3b82f6; font-size: 14px;">$${this.listing.price}</span>
              <span style="color: #6b7280; font-size: 12px;"> / ${this.listing.priceType}</span>
            </div>
          </div>
        `
      });

      // Add click event to marker
      this.marker.addListener('click', () => {
        if (this.infoWindow && this.marker) {
          this.infoWindow.open(this.map, this.marker);
        }
      });

      // Add circle to show approximate area
      const circle = new google.maps.Circle({
        strokeColor: '#3b82f6',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#3b82f6',
        fillOpacity: 0.1,
        map: this.map,
        center: { lat, lng },
        radius: 500 // 500 meters
      });

      this.isMapLoaded = true;

      // Ensure map renders properly
      google.maps.event.addListenerOnce(this.map, 'idle', () => {
        google.maps.event.trigger(this.map!, 'resize');
      });

    } catch (error) {
      console.error('Error initializing Google Maps:', error);
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
      window.open(`maps://maps.google.com/maps?daddr=${lat},${lng}&amp;ll=`);
    } else if (/Android/.test(navigator.userAgent)) {
      // Android - open Google Maps
      window.open(`geo:${lat},${lng}?q=${lat},${lng}(${address})`);
    } else {
      // Desktop - open Google Maps in browser
      window.open(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`);
    }
  }

  loadRelatedProducts() {
    if (!this.listing) return;

    // Simulate loading related products - replace with actual API call
    // this.listingsService.getRelatedListings(this.listing.category, this.listing.id)
    //   .subscribe({
    //     next: (products) => {
    //       this.relatedProducts = products.slice(0, 4);
    //     },
    //     error: (error) => {
    //       console.error('Error loading related products:', error);
    //     }
    //   });

    // Temporary mock data
    this.relatedProducts = [];
  }

  checkIfFavorited() {
    // if (!this.listing || !this.authService.isAuthenticated()) return;

    // Check if user has favorited this listing
    // this.listingsService.isFavorited(this.listing.id).subscribe({
    //   next: (favorited) => {
    //     this.isFavorited = favorited;
    //   }
    // });
  }

  incrementViewCount() {
    if (!this.listing) return;

    // this.listingsService.incrementViews(this.listing.id).subscribe();
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

  toggleFavorite() {
    // if (!this.authService.isAuthenticated()) {
    //   this.toaster.show('Please login to add favorites', 'warning');
    //   this.router.navigate(['/login']);
    //   return;
    // }

    // if (!this.listing) return;

    // if (this.isFavorited) {
      // this.listingsService.removeFavorite(this.listing.id).subscribe({
      //   next: () => {
      //     this.isFavorited = false;
      //     this.toaster.show('Removed from favorites', 'success');
      //   }
      // });
    //   this.isFavorited = false;
    //   this.toaster.show('Removed from favorites', 'success');
    // } else {
      // this.listingsService.addFavorite(this.listing.id).subscribe({
      //   next: () => {
      //     this.isFavorited = true;
      //     this.toaster.show('Added to favorites', 'success');
      //   }
      // });
      this.isFavorited = true;
      this.toaster.show('Added to favorites', 'success');
    // }
  }

  showContact() {
    // if (!this.authService.isAuthenticated()) {
    //   this.toaster.show('Please login to view contact information', 'warning');
    //   this.router.navigate(['/login']);
    //   return;
    // }
    this.showContactInfo = true;
  }

  openBookingForm() {
    // if (!this.authService.isAuthenticated()) {
    //   this.toaster.show('Please login to book this item', 'warning');
    //   this.router.navigate(['/login']);
    //   return;
    // }

    if (this.listing?.status !== 'ACTIVE') {
      this.toaster.show('This item is not available for booking', 'warning');
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

    // this.listingsService.createBookingRequest({
    //   ...this.bookingRequest,
    //   listingId: this.listing.id
    // }).subscribe({
    //   next: () => {
    //     this.toaster.show('Booking request sent successfully!', 'success');
    //     this.showBookingForm = false;
    //     this.resetBookingForm();
    //   },
    //   error: (error) => {
    //     this.toaster.show('Failed to send booking request', 'error');
    //   }
    // });

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
        // If clipboard access fails, show the URL in an alert
        alert(`Share this link: ${window.location.href}`);
      });
    }
  }

  reportListing() {
    // if (!this.authService.isAuthenticated()) {
    //   this.toaster.show('Please login to report this listing', 'warning');
    //   return;
    // }

    // Simulate report submission
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
        ? `Delivery available ($${deliveryOptions.deliveryFee})`
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
    this.router.navigate(['/product', productId]);
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
}

import { Component, signal, computed, OnInit, ViewChild, ElementRef, AfterViewInit, OnDestroy, NgZone, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { ListingsService } from '../../services/listings/listings.service';
import { ToasterService } from '../../services/toaster/toaster.service';
import { User } from '../../models/User.model';
import { AuthService } from '../../services/auth/auth.service';
import { last, takeUntil } from 'rxjs';

// Interfaces
export interface ProductImage {
  file: File;
  preview: string;
  id: string;
}

export interface Category {
  value: string;
  label: string;
}

export interface LocationCoordinates {
  lat: number;
  lng: number;
}

export interface DeliveryOptions {
  pickupAvailable: boolean;
  deliveryAvailable: boolean;
  shippingAvailable: boolean;
}

export interface ProductFormData {
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
  email: string;
  deliveryOptions: DeliveryOptions;
  agreeToTerms: boolean;
  images: File[]
}

interface SubmissionResult {
  success: boolean;
  message?: string;
  listingId?: string;
}

// Leaflet types
declare global {
  interface Window {
    L: any;
  }
}

@Component({
  selector: 'app-product-listing-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: `./list-equipment.component.html`,
  styleUrl: `./list-equipment.component.css`,
})
export class ProductListingFormComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('mapContainer') mapContainer!: ElementRef;

  private fb = new FormBuilder();
  private map: any;
  private marker: any;
  private mapInitializationAttempted = false;
  private leafletLoaded = false;
  user: User = {};

  // Signals
  currentStep = signal(1);
  isLoading = signal(false);
  isLoadingLocation = signal(false);
  mapInitialized = signal(false);
  submitSuccess = signal(false);
  submitError = signal<string | null>(null);
  productImages = signal<ProductImage[]>([]);
  tags = signal<string[]>([]);
  selectedCoordinates = signal<LocationCoordinates | null>(null);

  // Form
  productForm!: FormGroup;

  // Data
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

  cities: string[] = [
    'Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad',
    'Multan', 'Peshawar', 'Quetta', 'Sialkot', 'Gujranwala',
    'Hyderabad', 'Bahawalpur', 'Sargodha', 'Sukkur', 'Larkana'
  ];

  // City coordinates for Pakistan cities
  private cityCoordinates: { [key: string]: LocationCoordinates } = {
    'Karachi': { lat: 24.8607, lng: 67.0011 },
    'Lahore': { lat: 31.5204, lng: 74.3587 },
    'Islamabad': { lat: 33.6844, lng: 73.0479 },
    'Rawalpindi': { lat: 33.5651, lng: 73.0169 },
    'Faisalabad': { lat: 31.4504, lng: 73.1350 },
    'Multan': { lat: 30.1575, lng: 71.5249 },
    'Peshawar': { lat: 34.0151, lng: 71.5249 },
    'Quetta': { lat: 30.1798, lng: 66.9750 },
    'Sialkot': { lat: 32.4945, lng: 74.5229 },
    'Gujranwala': { lat: 32.1877, lng: 74.1945 },
    'Hyderabad': { lat: 25.3960, lng: 68.3578 },
    'Bahawalpur': { lat: 29.4000, lng: 71.6833 },
    'Sargodha': { lat: 32.0836, lng: 72.6711 },
    'Sukkur': { lat: 27.7000, lng: 68.8500 },
    'Larkana': { lat: 27.5590, lng: 68.2120 }
  };

  constructor(
    private ngZone: NgZone,
    private authService: AuthService,
    private listingService: ListingsService,
    private toasterService: ToasterService,
    private cdr: ChangeDetectorRef
  ) {
    this.initializeForm();
  }

  ngOnInit() {
    // Load Leaflet CSS immediately
    this.loadLeafletCSS();
    // Load Leaflet script
    this.loadLeafletScript();

    // Subscribe to user data
    this.authService.user$
      .pipe()
      .subscribe(user => {
        this.user = user;
      });

    if (!this.user) {
      this.authService.loadUser();
    }
  }

  ngAfterViewInit() {
    // Additional check after view init
    if (this.leafletLoaded && this.currentStep() === 4) {
      setTimeout(() => {
        this.initializeMapIfReady();
      }, 100);
    }
  }

  ngOnDestroy() {
    if (this.map) {
      try {
        this.map.remove();
      } catch (error) {
        console.error('Error removing map:', error);
      }
    }
  }

  private loadLeafletCSS(): void {
    // Check if CSS is already loaded
    if (document.querySelector('link[href*="leaflet"]')) {
      return;
    }

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
    link.crossOrigin = '';
    document.head.appendChild(link);
  }

  private loadLeafletScript(): void {
    // Check if already loaded
    if (window.L) {
      this.leafletLoaded = true;
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
    script.crossOrigin = '';

    script.onload = () => {
      this.leafletLoaded = true;
      console.log('Leaflet script loaded successfully');

      // If we're on step 4 and have the map container, initialize the map
      if (this.currentStep() === 4 && this.mapContainer) {
        setTimeout(() => {
          this.initializeMapIfReady();
        }, 100);
      }
    };

    script.onerror = (error) => {
      console.error('Failed to load Leaflet script:', error);
    };

    document.head.appendChild(script);
  }

  private initializeMapIfReady(): void {
    if (!this.leafletLoaded || !window.L || !this.mapContainer || this.mapInitializationAttempted) {
      return;
    }

    this.initializeMap();
  }

  private initializeMap(): void {
    if (this.mapInitializationAttempted) {
      return;
    }

    this.mapInitializationAttempted = true;

    try {
      const container = this.mapContainer.nativeElement;
      if (!container) {
        console.error('Map container not found');
        return;
      }

      // Clear any existing map instance
      container.innerHTML = '';

      // Default to Pakistan center
      const defaultCenter: LocationCoordinates = { lat: 30.3753, lng: 69.3451 };

      // Initialize map
      this.map = window.L.map(container, {
        center: [defaultCenter.lat, defaultCenter.lng],
        zoom: 6,
        scrollWheelZoom: true,
        attributionControl: true,
        zoomControl: true,
        doubleClickZoom: true,
        dragging: true,
        tap: true,
        touchZoom: true
      });

      // Add tile layer
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(this.map);

      // Add click event listener
      this.map.on('click', (e: any) => {
        this.ngZone.run(() => {
          this.setMapMarker(e.latlng.lat, e.latlng.lng);
        });
      });

      // Handle map ready event
      this.map.whenReady(() => {
        this.ngZone.run(() => {
          this.mapInitialized.set(true);
          console.log('Map initialized successfully');
          this.cdr.detectChanges();
        });

        // Force resize after ready
        setTimeout(() => {
          if (this.map) {
            this.map.invalidateSize();
          }
        }, 100);
      });

      // Force initial resize
      setTimeout(() => {
        if (this.map) {
          this.map.invalidateSize();
        }
      }, 200);

    } catch (error) {
      console.error('Error initializing map:', error);
      this.mapInitialized.set(false);
      this.mapInitializationAttempted = false; // Allow retry
    }
  }

  private setMapMarker(lat: number, lng: number): void {
    if (!this.map || !window.L) return;

    try {
      // Remove existing marker
      if (this.marker) {
        this.map.removeLayer(this.marker);
      }

      // Create custom icon
      const customIcon = window.L.divIcon({
        className: 'custom-map-marker',
        html: `
          <div style="
            background: #ef4444;
            width: 25px;
            height: 25px;
            border-radius: 50% 50% 50% 0;
            border: 2px solid white;
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
            transform: rotate(-45deg);
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <div style="
              background: white;
              width: 6px;
              height: 6px;
              border-radius: 50%;
              transform: rotate(45deg);
            "></div>
          </div>
        `,
        iconSize: [25, 25],
        iconAnchor: [12, 25],
        popupAnchor: [0, -25]
      });

      // Add new marker
      this.marker = window.L.marker([lat, lng], { icon: customIcon })
        .addTo(this.map)
        .bindPopup('Your product location')
        .openPopup();

      // Update coordinates
      this.selectedCoordinates.set({ lat, lng });
      console.log('Marker set at:', { lat, lng });

    } catch (error) {
      console.error('Error setting marker:', error);
    }
  }

  private centerMapOnCity(cityName: string): void {
    const coords = this.cityCoordinates[cityName];
    if (coords && this.map) {
      try {
        this.map.setView([coords.lat, coords.lng], 12);
        setTimeout(() => {
          if (this.map) {
            this.map.invalidateSize();
          }
        }, 100);
      } catch (error) {
        console.error('Error centering map on city:', error);
      }
    }
  }

  private initializeForm(): void {
    this.productForm = this.fb.group({
      // Step 1: Basic Information
      title: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(100)]],
      category: ['', Validators.required],
      condition: ['', Validators.required],

      // Step 2: Details & Pricing
      description: ['', [Validators.required, Validators.minLength(20), Validators.maxLength(1000)]],
      price: ['', [Validators.required, Validators.min(1)]],
      priceType: ['fixed'],
      brand: [''],
      model: [''],

      // Step 4: Location & Contact
      address: ['', [Validators.required, Validators.minLength(10)]],
      city: ['', Validators.required],
      area: [''],
      phone: ['', [Validators.required, Validators.pattern(/^[+]?[0-9]{10,15}$/)]],
      email: ['', [Validators.email]],
      pickupAvailable: [false],
      deliveryAvailable: [false],
      shippingAvailable: [false],

      // Step 5: Terms
      agreeToTerms: [false, Validators.requiredTrue]
    });
  }

  // Event handlers
  async onCityChange(): Promise<void> {
    const selectedCity = this.productForm.get('city')?.value;
    if (selectedCity && this.cityCoordinates[selectedCity] && this.map) {
      this.centerMapOnCity(selectedCity);
    }
  }

  async getCurrentLocation(): Promise<void> {
    if (!navigator.geolocation) {
      this.toasterService.show('Geolocation is not supported by this browser.', 'error');
      return;
    }

    this.isLoadingLocation.set(true);

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 60000
        });
      });

      const { latitude, longitude } = position.coords;

      // Initialize map if not already done
      if (!this.mapInitialized() && this.leafletLoaded) {
        await new Promise(resolve => {
          this.initializeMap();
          setTimeout(resolve, 500);
        });
      }

      if (this.map) {
        this.map.setView([latitude, longitude], 15);
        this.setMapMarker(latitude, longitude);
        this.toasterService.show('Location found successfully!', 'success');
      }

    } catch (error) {
      console.error('Error getting location:', error);
      this.toasterService.show('Unable to retrieve your location. Please click on the map to set your location manually.', 'warning');
    } finally {
      this.isLoadingLocation.set(false);
    }
  }

  clearLocation(): void {
    if (this.marker && this.map) {
      try {
        this.map.removeLayer(this.marker);
        this.marker = null;
      } catch (error) {
        console.error('Error removing marker:', error);
      }
    }
    this.selectedCoordinates.set(null);
  }

  // Helper method for category labels
  getCategoryLabel(value: string): string {
    const category = this.categories.find(cat => cat.value === value);
    return category ? category.label : value;
  }

  // Step navigation
  async nextStep(): Promise<void> {
    if (this.isCurrentStepValid()) {
      const newStep = Math.min(this.currentStep() + 1, 5);
      this.currentStep.set(newStep);

      // Initialize map when reaching step 4
      if (newStep === 4) {
        // Wait for Angular to render the step
        setTimeout(() => {
          if (this.leafletLoaded && !this.mapInitializationAttempted) {
            this.initializeMapIfReady();
          }
        }, 200);
      }
    } else {
      // Mark fields as touched to show validation errors
      this.markCurrentStepFieldsAsTouched();
    }
  }

  previousStep(): void {
    this.currentStep.update(step => Math.max(step - 1, 1));
  }

  private markCurrentStepFieldsAsTouched(): void {
    const step = this.currentStep();

    switch (step) {
      case 1:
        ['title', 'category', 'condition'].forEach(field => {
          this.productForm.get(field)?.markAsTouched();
        });
        break;
      case 2:
        ['description', 'price'].forEach(field => {
          this.productForm.get(field)?.markAsTouched();
        });
        break;
      case 4:
        ['address', 'city', 'phone'].forEach(field => {
          this.productForm.get(field)?.markAsTouched();
        });
        if (this.productForm.get('email')?.value) {
          this.productForm.get('email')?.markAsTouched();
        }
        break;
      case 5:
        this.productForm.get('agreeToTerms')?.markAsTouched();
        break;
    }
  }

  // Step validation
  isCurrentStepValid(): boolean {
    const step = this.currentStep();

    switch (step) {
      case 1:
        return !!(this.productForm.get('title')?.valid &&
          this.productForm.get('category')?.valid &&
          this.productForm.get('condition')?.valid);
      case 2:
        return !!(this.productForm.get('description')?.valid &&
          this.productForm.get('price')?.valid);
      case 3:
        return this.productImages().length > 0;
      case 4:
        return !!(this.productForm.get('address')?.valid &&
          this.productForm.get('city')?.valid &&
          this.productForm.get('phone')?.valid &&
          (!this.productForm.get('email')?.value || this.productForm.get('email')?.valid));
      case 5:
        return !!(this.productForm.valid && this.productImages().length > 0);
      default:
        return true;
    }
  }

  // Form validation helpers
  isFieldInvalid(fieldName: string): boolean {
    const field = this.productForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.productForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) return `${this.getFieldLabel(fieldName)} is required`;
      if (field.errors['email']) return 'Please enter a valid email address';
      if (field.errors['pattern']) {
        if (fieldName === 'phone') return 'Please enter a valid phone number (10-15 digits)';
        return 'Invalid format';
      }
      if (field.errors['minlength']) {
        const requiredLength = field.errors['minlength'].requiredLength;
        return `${this.getFieldLabel(fieldName)} must be at least ${requiredLength} characters`;
      }
      if (field.errors['maxlength']) {
        const requiredLength = field.errors['maxlength'].requiredLength;
        return `${this.getFieldLabel(fieldName)} cannot exceed ${requiredLength} characters`;
      }
      if (field.errors['min']) return 'Price must be greater than 0';
    }
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      'title': 'Product title',
      'category': 'Category',
      'condition': 'Condition',
      'description': 'Description',
      'price': 'Price',
      'address': 'Address',
      'city': 'City',
      'phone': 'Phone number',
      'email': 'Email',
      'agreeToTerms': 'Terms agreement'
    };
    return labels[fieldName] || fieldName;
  }

  dismissed = false;

  dismiss() {
    this.dismissed = true;
  }

  // Image handling methods remain the same
  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.processFiles(input.files);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();

    if (event.dataTransfer?.files) {
      this.processFiles(event.dataTransfer.files);
    }
  }

  private processFiles(files: FileList): void {
    const maxFiles = 8;
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

    for (let i = 0; i < files.length && this.productImages().length < maxFiles; i++) {
      const file = files[i];

      if (!allowedTypes.includes(file.type)) {
        continue;
      }

      if (file.size > maxSize) {
        continue;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          const productImage: ProductImage = {
            file: file,
            preview: e.target.result as string,
            id: this.generateId()
          };

          this.productImages.update(images => [...images, productImage]);
        }
      };
      reader.readAsDataURL(file);
    }
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
  }

  removeImage(index: number): void {
    this.productImages.update(images => images.filter((_, i) => i !== index));
  }

  // Tag handling
  addTag(event: Event): void {
    event.preventDefault();
    const keyboardEvent = event as KeyboardEvent;
    const input = keyboardEvent.target as HTMLInputElement;
    const value = input.value.trim();

    if (value && !this.tags().includes(value) && this.tags().length < 10) {
      this.tags.update(tags => [...tags, value]);
      input.value = '';
    }
  }

  removeTag(index: number): void {
    this.tags.update(tags => tags.filter((_, i) => i !== index));
  }

  // Form submission
  async onSubmit(): Promise<void> {
    if (this.productForm.invalid || this.productImages().length === 0) {
      return;
    }

    this.isLoading.set(true);
    this.submitError.set(null);

    try {
      if (this.user?.emailVerified) {
        const deliveryOptions: DeliveryOptions = {
          pickupAvailable: this.productForm.get('pickupAvailable')?.value || false,
          deliveryAvailable: this.productForm.get('deliveryAvailable')?.value || false,
          shippingAvailable: this.productForm.get('shippingAvailable')?.value || false
        };

        const formData: ProductFormData = {
          ...this.productForm.value,
          coordinates: this.selectedCoordinates(),
          deliveryOptions,
          images: this.productImages().map(img => img.file)
        };

        this.listingService.createListing(formData).subscribe({
          next: (res) => {
            console.log('Product listed successfully:', res);
            this.toasterService.show("Product listed successfully", "success");
            this.submitSuccess.set(true);
            this.resetForm();
          },
          error: (err) => {
            console.error('Product listing failed:', err);
            this.toasterService.show("Product listing failed", 'error');
            this.submitError.set('Failed to list the product. Please try again.');
          }
        }).add(() => {
          this.isLoading.set(false);
        });
      } else {
        this.toasterService.show("To List Equipment You Must verify your email first!", 'warning');
        throw new Error('To List Equipment You Must verify your email first!');
      }

    } catch (error) {
      this.submitError.set(error instanceof Error ? error.message : 'Failed to publish listing. Please try again.');
    } finally {
      this.isLoading.set(false);
    }
  }

  private resetForm(): void {
    // Reset after showing success message for 3 seconds
    setTimeout(() => {
      this.currentStep.set(1);
      this.productForm.reset();
      this.productForm.patchValue({
        priceType: 'fixed',
        pickupAvailable: false,
        deliveryAvailable: false,
        shippingAvailable: false,
        agreeToTerms: false
      });
      this.productImages.set([]);
      this.tags.set([]);
      this.selectedCoordinates.set(null);
      this.submitSuccess.set(false);
      this.submitError.set(null);
      this.mapInitializationAttempted = false;

      // Clear map marker
      if (this.marker && this.map) {
        try {
          this.map.removeLayer(this.marker);
          this.marker = null;
        } catch (error) {
          console.error('Error removing marker on reset:', error);
        }
      }
    }, 3000);
  }
}

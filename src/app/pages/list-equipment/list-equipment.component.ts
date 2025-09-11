import { Component, signal, computed, OnInit, ViewChild, ElementRef, AfterViewInit, OnDestroy, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { ListingsService } from '../../services/listings/listings.service';
import { ToasterService } from '../../services/toaster/toaster.service';
import { User } from '../../models/User.model';
import { AuthService } from '../../services/auth/auth.service';
import { takeUntil } from 'rxjs';
import { Users } from 'lucide-angular';

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
  images:File[]
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
  private  user: User | null = null;

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
    { value: 'electronics', label: 'Electronics' },
    { value: 'vehicles', label: 'Vehicles' },
    { value: 'property', label: 'Property' },
    { value: 'fashion', label: 'Fashion & Beauty' },
    { value: 'home-garden', label: 'Home & Garden' },
    { value: 'sports', label: 'Sports & Outdoor' },
    { value: 'books', label: 'Books & Education' },
    { value: 'services', label: 'Services' },
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

  constructor(private ngZone: NgZone,
    private authService: AuthService,
    private listingService:ListingsService,
    private toasterService:ToasterService) {
    this.initializeForm();
  }

  ngOnInit() {
    // Ensure Leaflet CSS is loaded
    this.loadLeafletCSS();


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
    // Load Leaflet after view is initialized
    this.loadLeafletScript();
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
    if (document.querySelector('link[href*="leaflet.css"]')) {
      return;
    }

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.css';
    document.head.appendChild(link);
  }

  private loadLeafletScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Check if already loaded
      if (window.L) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js';

      script.onload = () => {
        this.ngZone.run(() => {
          console.log('Leaflet script loaded successfully');
          resolve();
        });
      };

      script.onerror = (error) => {
        console.error('Failed to load Leaflet script:', error);
        reject(new Error('Failed to load Leaflet'));
      };

      document.head.appendChild(script);
    });
  }

  private async initializeMap(): Promise<void> {
    if (this.mapInitializationAttempted || !window.L || !this.mapContainer) {
      return;
    }

    this.mapInitializationAttempted = true;

    try {
      // Wait for DOM element to be ready
      await new Promise(resolve => setTimeout(resolve, 100));

      const container = this.mapContainer.nativeElement;
      if (!container) {
        throw new Error('Map container not found');
      }

      // Default to Pakistan center
      const defaultCenter: LocationCoordinates = { lat: 30.3753, lng: 69.3451 };

      // Initialize map outside Angular zone for performance
      this.ngZone.runOutsideAngular(() => {
        this.map = window.L.map(container, {
          center: [defaultCenter.lat, defaultCenter.lng],
          zoom: 6,
          scrollWheelZoom: true,
          attributionControl: true
        });

        // Add tile layer
        window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '© OpenStreetMap contributors'
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
          });
        });
      });

      // Force resize after initialization
      setTimeout(() => {
        if (this.map) {
          this.map.invalidateSize();
        }
      }, 200);

    } catch (error) {
      console.error('Error initializing map:', error);
      this.ngZone.run(() => {
        this.mapInitialized.set(false);
      });
    }
  }

  private setMapMarker(lat: number, lng: number): void {
    if (!this.map || !window.L) return;

    try {
      // Remove existing marker
      if (this.marker) {
        this.map.removeLayer(this.marker);
      }

      // Add new marker
      this.marker = window.L.marker([lat, lng])
        .addTo(this.map)
        .bindPopup('Your product location')
        .openPopup();

      // Update coordinates in Angular zone
      this.selectedCoordinates.set({ lat, lng });

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
      alert('Geolocation is not supported by this browser.');
      return;
    }

    this.isLoadingLocation.set(true);

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        });
      });

      const { latitude, longitude } = position.coords;

      if (this.map) {
        this.map.setView([latitude, longitude], 15);
        this.setMapMarker(latitude, longitude);
      }

    } catch (error) {
      console.error('Error getting location:', error);
      alert('Unable to retrieve your location. Please click on the map to set your location manually.');
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
      if (newStep === 4 && !this.mapInitializationAttempted) {
        // Wait for Angular to render the step
        setTimeout(async () => {
          try {
            await this.loadLeafletScript();
            await this.initializeMap();
          } catch (error) {
            console.error('Error initializing map on step 4:', error);
          }
        }, 150);
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

  // Image handling
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
      // Simulate API call with realistic delay
      await new Promise(resolve => setTimeout(resolve, 2500));

      const deliveryOptions: DeliveryOptions = {
        pickupAvailable: this.productForm.get('pickupAvailable')?.value || false,
        deliveryAvailable: this.productForm.get('deliveryAvailable')?.value || false,
        shippingAvailable: this.productForm.get('shippingAvailable')?.value || false
      };

      const formData: ProductFormData = {
        ...this.productForm.value,
        coordinates: this.selectedCoordinates(),
        deliveryOptions,
        images: this.productImages().map(img => img.file),
        tags: this.tags(),
        timestamp: new Date().toISOString()
      };

      console.log('Product listing data:', formData);

      if(this.user?.emailVerified){
        this.listingService.createListing(formData).subscribe({
    next: (res) => {
      console.log('✅ Product listed successfully:', res);
      this.toasterService.show("Product listed successfully","success")
      this.submitSuccess.set(true);
      this.resetForm();
    },
    error: (err) => {
      console.error('❌ Product listing failed:', err);
      this.toasterService.show("Product listing failed:",'error');
      this.submitError.set('Failed to list the product. Please try again.');
    }
  }).add(() => {
    this.isLoading.set(false);
  });
    }else{
      this.toasterService.show("To List Equipment You Must verify your email first!",'warning');
      throw new Error('To List Equipment You Must verify your email first!');
    }

      // // Simulate potential API errors occasionally
      // if (Math.random() < 0.1) { // 10% chance of error
      //   throw new Error('Network error occurred. Please try again.');
      // }

      const result: SubmissionResult = {
        success: true,
        message: 'Product listed successfully',
        listingId: this.generateId()
      };

      this.submitSuccess.set(true);
      this.resetForm();

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

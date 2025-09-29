
export interface Report {
  id: string;
  type: 'user' | 'listing';
  reportedId: string;
  reportedBy: {
    id: string;
    firstName: string;
    lastName: string;
  };
  reason: string;
  description: string;
  status: 'pending' | 'resolved' | 'dismissed';
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
  reportedEntity?: any;
  screenshots?: string[];
}

export interface Screenshot {
  id: string;
  file: File;
  preview: string;
}

// report-form.component.ts
import { Component, signal, computed, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';


@Component({
  selector: 'app-report-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-slate-50 py-8 px-4">

      <!-- Loading State -->
      <div *ngIf="isLoading()" class="max-w-2xl mx-auto text-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-700 mx-auto"></div>
        <p class="text-slate-600 mt-4">Loading report form...</p>
      </div>

      <!-- Error State -->
      <div *ngIf="errorMessage()" class="max-w-2xl mx-auto">
        <div class="bg-red-50 border border-red-200 rounded-md p-4">
          <div class="flex">
            <svg class="text-red-400 mr-3 w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path>
            </svg>
            <div>
              <h4 class="text-sm font-medium text-red-800">Error</h4>
              <p class="text-sm text-red-700 mt-1">{{ errorMessage() }}</p>
            </div>
          </div>
          <div class="mt-4">
            <button
              (click)="navigateBack()"
              class="bg-red-100 text-red-800 px-4 py-2 rounded-md hover:bg-red-200 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>

      <!-- Report Form -->
      <div *ngIf="!isLoading() && !errorMessage()" class="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto border border-slate-200">
        <div class="flex items-center justify-between mb-6">
          <div class="flex items-center gap-3">
            <div class="text-slate-600">
              <svg *ngIf="reportType() === 'user'" class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"></path>
              </svg>
              <svg *ngIf="reportType() === 'listing'" class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path>
              </svg>
            </div>
            <h2 class="text-2xl font-bold text-slate-800">
              Report {{ reportType() === 'user' ? 'User' : 'Listing' }}
            </h2>
          </div>
          <button
            (click)="navigateBack()"
            class="text-slate-500 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 rounded"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <!-- Entity Info Display -->
        <div class="bg-slate-50 rounded-lg p-4 mb-6 border border-slate-200">
          <h3 class="text-sm font-medium text-slate-700 mb-2">Reporting:</h3>
          <div class="flex items-center gap-3">
            <div class="text-slate-500">
              <svg *ngIf="reportType() === 'user'" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"></path>
              </svg>
              <svg *ngIf="reportType() === 'listing'" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path>
              </svg>
            </div>
            <div>
              <p class="text-slate-800 font-medium">{{ reportType() === 'user' ? 'User' : 'Listing' }}: {{ reportedId() }}</p>
              <p class="text-slate-600 text-sm">{{ reportType() === 'user' ? 'User Profile' : 'Equipment Listing' }}</p>
            </div>
          </div>
        </div>

        <div class="space-y-6">

          <!-- Priority Selection -->
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">
              Priority Level
            </label>
            <div class="flex gap-4">
              <label *ngFor="let priority of priorities" class="flex items-center">
                <input
                  type="radio"
                  [value]="priority"
                  [(ngModel)]="formData().priority"
                  (ngModelChange)="updateFormData('priority', $event)"
                  class="mr-2 text-slate-600 focus:ring-slate-500"
                />
                <span class="capitalize" [ngClass]="{
                  'text-red-600 font-medium': priority === 'high',
                  'text-amber-600': priority === 'medium',
                  'text-emerald-600': priority === 'low'
                }">
                  {{ priority }}
                </span>
              </label>
            </div>
          </div>

          <!-- Description -->
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">
              Detailed Description *
            </label>
            <textarea
              [(ngModel)]="formData().description"
              (ngModelChange)="updateFormData('description', $event)"
              rows="4"
              placeholder="Please provide details about why you're reporting this {{ reportType() }}..."
              class="w-full p-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-slate-500 focus:border-slate-500 text-slate-900"
            ></textarea>
          </div>

          <!-- Screenshot Upload -->
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">
              Screenshots (Optional)
            </label>
            <div class="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-slate-500 transition-colors">
              <svg class="mx-auto text-slate-400 mb-2 w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
              </svg>
              <p class="text-sm text-slate-600 mb-2">
                Upload screenshots as evidence (JPG, PNG, GIF)
              </p>
              <input
                type="file"
                multiple
                accept="image/*"
                (change)="handleFileUpload($event)"
                class="hidden"
                #fileInput
              />
              <button
                type="button"
                (click)="fileInput.click()"
                class="inline-block bg-slate-50 text-slate-700 px-4 py-2 rounded-md cursor-pointer hover:bg-slate-100 transition-colors border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
              >
                Choose Files
              </button>
            </div>
          </div>

          <!-- Screenshot Preview -->
          <div *ngIf="screenshots().length > 0">
            <h4 class="font-medium text-slate-700 mb-2">Uploaded Screenshots:</h4>
            <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div *ngFor="let screenshot of screenshots()" class="relative">
                <img
                  [src]="screenshot.preview"
                  alt="Screenshot"
                  class="w-full h-24 object-cover rounded-md border border-slate-300"
                />
                <button
                  type="button"
                  (click)="removeScreenshot(screenshot.id)"
                  class="absolute -top-2 -right-2 bg-slate-600 text-white rounded-full p-1 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
                >
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <!-- Warning Message -->
          <div class="bg-amber-50 border border-amber-200 rounded-md p-4">
            <div class="flex">
              <svg class="text-amber-400 mr-3 w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
              </svg>
              <div>
                <h4 class="text-sm font-medium text-amber-800">Important</h4>
                <p class="text-sm text-amber-700 mt-1">
                  False reports may result in action against your account. Please ensure your report is accurate and made in good faith.
                </p>
              </div>
            </div>
          </div>

          <!-- Submit Buttons -->
          <div class="flex gap-4 pt-4">
            <button
              type="button"
              (click)="navigateBack()"
              class="flex-1 px-6 py-3 border border-slate-300 text-slate-700 rounded-md hover:bg-slate-50 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
            >
              Cancel
            </button>
            <button
              type="button"
              (click)="handleSubmit()"
              [disabled]="!isFormValid() || isSubmitting()"
              class="flex-1 px-6 py-3 bg-slate-700 text-white rounded-md hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
            >
              <span *ngIf="!isSubmitting()">Submit Report</span>
              <span *ngIf="isSubmitting()" class="flex items-center justify-center">
                <svg class="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Submitting...
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class ReportFormComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  // Signals for reactive state
  reportedId = signal<string>('');
  reportType = signal<'user' | 'listing'>('listing');
  isLoading = signal(true);
  errorMessage = signal<string>('');
  isSubmitting = signal(false);
  screenshots = signal<Screenshot[]>([]);
  formData = signal({
    reason: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high'
  });

  priorities: ('low' | 'medium' | 'high')[] = ['low', 'medium', 'high'];

  listingReasons = [
    'Inappropriate content',
    'Misleading information',
    'Scam or fraud',
    'Duplicate listing',
    'Wrong category',
    'Illegal activity',
    'Spam',
    'Other'
  ];

  userReasons = [
    'Harassment or bullying',
    'Inappropriate behavior',
    'Fake profile',
    'Spam messages',
    'Scam attempts',
    'Impersonation',
    'Threatening behavior',
    'Other'
  ];

  isFormValid = computed(() => {
    const data = this.formData();
    return !!(data.reason && data.description.trim());
  });

  ngOnInit() {
    // Get parameters from URL - report/:type/:id
    this.route.params.subscribe(params => {
      const id = params['id'];        // Extract ID from URL path
      const type = params['type'];    // Extract TYPE from URL path

      console.log('URL Parameters:', { id, type }); // Debug log

      if (!id || !type) {
        this.errorMessage.set('Missing required parameters. URL format: /report/:type/:id');
        this.isLoading.set(false);
        return;
      }

      if (type !== 'user' && type !== 'listing') {
        this.errorMessage.set('Invalid type parameter. Must be either "user" or "listing".');
        this.isLoading.set(false);
        return;
      }

      // Set the extracted values
      this.reportedId.set(id);
      this.reportType.set(type);
      this.isLoading.set(false);

      console.log('Report Form Initialized:', {
        reportedId: this.reportedId(),
        reportType: this.reportType()
      });
    });
  }

  updateFormData(field: string, value: any) {
    this.formData.update(current => ({
      ...current,
      [field]: value
    }));
  }

  handleFileUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;

    const files = Array.from(input.files);
    const newScreenshots: Screenshot[] = files.map(file => ({
      id: Date.now() + Math.random() + '',
      file,
      preview: URL.createObjectURL(file)
    }));

    this.screenshots.update(current => [...current, ...newScreenshots]);
    input.value = ''; // Reset input
  }

  removeScreenshot(id: string) {
    this.screenshots.update(current => {
      const screenshot = current.find(s => s.id === id);
      if (screenshot) {
        URL.revokeObjectURL(screenshot.preview);
      }
      return current.filter(s => s.id !== id);
    });
  }

  async handleSubmit() {
    if (!this.isFormValid() || this.isSubmitting()) return;

    this.isSubmitting.set(true);

    try {
      const data = this.formData();
      const reportData: Report = {
        id: `report_${Date.now()}`,
        type: this.reportType(),
        reportedId: this.reportedId(),
        reportedBy: {
          id: 'user_current',
          firstName: 'Current',
          lastName: 'User'
        },
        reason: data.reason,
        description: data.description,
        status: 'pending',
        priority: data.priority,
        createdAt: new Date(),
        screenshots: this.screenshots().map(s => s.file.name)
      };

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      console.log('Report submitted:', reportData);

      // Show success message and navigate
      alert(`${this.reportType() === 'user' ? 'User' : 'Listing'} report submitted successfully!`);

      this.resetForm();
      this.navigateBack();
    } catch (error) {
      console.error('Error submitting report:', error);
      alert('Failed to submit report. Please try again.');
    } finally {
      this.isSubmitting.set(false);
    }
  }

  getCurrentUrl() {
    return typeof window !== 'undefined' ? window.location.href : 'N/A';
  }

  navigateBack() {
    // Navigate back to previous page or to a default route
    this.router.navigate(['/']);
  }

  private resetForm() {
    this.formData.set({
      reason: '',
      description: '',
      priority: 'medium'
    });

    // Clean up object URLs
    this.screenshots().forEach(screenshot => {
      URL.revokeObjectURL(screenshot.preview);
    });
    this.screenshots.set([]);
  }
}



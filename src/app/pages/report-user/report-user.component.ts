import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

interface ReportCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
}

interface ReportableEntity {
  id: string;
  name: string;
  type: 'user' | 'listing';
  details?: any;
}

interface ReportSubmission {
  reportType: 'user' | 'listing';
  entityId: string;
  category: string;
  reason: string;
  description: string;
  evidence?: File[];
  priority: 'low' | 'medium' | 'high';
}

@Component({
  selector: 'app-report-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  template: `
    <div class="min-h-screen bg-gray-50">
      <!-- Header -->
      <div class="bg-white border-b border-gray-200">
        <div class="max-w-4xl mx-auto px-6 py-6">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-2xl font-semibold text-gray-900">Submit a Report</h1>
              <p class="mt-1 text-gray-600">Help us maintain a safe and trustworthy platform</p>
            </div>
            <button
              (click)="goBack()"
              class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
              </svg>
              Back
            </button>
          </div>
        </div>
      </div>

      <div class="max-w-4xl mx-auto px-6 py-8">
        <!-- Progress Indicator -->
        <div class="mb-8">
          <div class="flex items-center justify-between">
            @for (step of steps; track step.id; let i = $index) {
              <div class="flex items-center" [class.flex-1]="i < steps.length - 1">
                <div class="flex items-center">
                  <div
                    class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors"
                    [class.bg-blue-600]="currentStep() >= step.id"
                    [class.text-white]="currentStep() >= step.id"
                    [class.bg-gray-200]="currentStep() < step.id"
                    [class.text-gray-600]="currentStep() < step.id"
                  >
                    @if (currentStep() > step.id) {
                      <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                      </svg>
                    } @else {
                      {{ step.id }}
                    }
                  </div>
                  <span class="ml-2 text-sm font-medium" [class.text-blue-600]="currentStep() >= step.id" [class.text-gray-500]="currentStep() < step.id">
                    {{ step.name }}
                  </span>
                </div>
                @if (i < steps.length - 1) {
                  <div class="flex-1 h-0.5 mx-4" [class.bg-blue-600]="currentStep() > step.id" [class.bg-gray-200]="currentStep() <= step.id"></div>
                }
              </div>
            }
          </div>
        </div>

        <form [formGroup]="reportForm" (ngSubmit)="onSubmit()">
          <!-- Step 1: Report Type Selection -->
          @if (currentStep() === 1) {
            <div class="bg-white rounded-xl border border-gray-200 p-8">
              <div class="text-center mb-8">
                <h2 class="text-xl font-semibold text-gray-900 mb-2">What would you like to report?</h2>
                <p class="text-gray-600">Select the type of issue you're experiencing</p>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div
                  class="relative rounded-lg border-2 p-6 cursor-pointer transition-all hover:shadow-md"
                  [class.border-blue-500]="selectedReportType() === 'user'"
                  [class.bg-blue-50]="selectedReportType() === 'user'"
                  [class.border-gray-200]="selectedReportType() !== 'user'"
                  (click)="selectReportType('user')"
                >
                  <div class="flex items-center">
                    <div class="flex-shrink-0">
                      <div class="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                        <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                        </svg>
                      </div>
                    </div>
                    <div class="ml-4">
                      <h3 class="text-lg font-medium text-gray-900">Report a User</h3>
                      <p class="text-gray-600">Report inappropriate behavior, fraud, or policy violations</p>
                    </div>
                  </div>
                  @if (selectedReportType() === 'user') {
                    <div class="absolute top-4 right-4">
                      <svg class="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                      </svg>
                    </div>
                  }
                </div>

                <div
                  class="relative rounded-lg border-2 p-6 cursor-pointer transition-all hover:shadow-md"
                  [class.border-blue-500]="selectedReportType() === 'listing'"
                  [class.bg-blue-50]="selectedReportType() === 'listing'"
                  [class.border-gray-200]="selectedReportType() !== 'listing'"
                  (click)="selectReportType('listing')"
                >
                  <div class="flex items-center">
                    <div class="flex-shrink-0">
                      <div class="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                        <svg class="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                        </svg>
                      </div>
                    </div>
                    <div class="ml-4">
                      <h3 class="text-lg font-medium text-gray-900">Report a Listing</h3>
                      <p class="text-gray-600">Report misleading descriptions, unsafe items, or fake listings</p>
                    </div>
                  </div>
                  @if (selectedReportType() === 'listing') {
                    <div class="absolute top-4 right-4">
                      <svg class="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                      </svg>
                    </div>
                  }
                </div>
              </div>

              @if (selectedReportType()) {
                <div class="flex justify-end mt-8">
                  <button
                    type="button"
                    (click)="nextStep()"
                    class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Continue
                  </button>
                </div>
              }
            </div>
          }

          <!-- Step 2: Entity Selection -->
          @if (currentStep() === 2) {
            <div class="bg-white rounded-xl border border-gray-200 p-8">
              <div class="mb-6">
                <h2 class="text-xl font-semibold text-gray-900 mb-2">
                  Select {{ selectedReportType() === 'user' ? 'User' : 'Listing' }} to Report
                </h2>
                <p class="text-gray-600">Search and select the {{ selectedReportType() }} you want to report</p>
              </div>

              <!-- Search -->
              <div class="mb-6">
                <div class="relative">
                  <input
                    type="text"
                    placeholder="Search {{ selectedReportType() === 'user' ? 'users' : 'listings' }}..."
                    class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    [(ngModel)]="searchTerm"
                    [ngModelOptions]="{standalone: true}"
                    (input)="searchEntities()"
                  />
                  <svg class="absolute left-3 top-3.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                  </svg>
                </div>
              </div>

              <!-- Entity List -->
              <div class="space-y-3 max-h-80 overflow-y-auto">
                @for (entity of filteredEntities(); track entity.id) {
                  <div
                    class="flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-all hover:bg-gray-50"
                    [class.border-blue-500]="selectedEntityId() === entity.id"
                    [class.bg-blue-50]="selectedEntityId() === entity.id"
                    [class.border-gray-200]="selectedEntityId() !== entity.id"
                    (click)="selectEntity(entity.id)"
                  >
                    <div class="flex items-center">
                      <div class="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                        @if (selectedReportType() === 'user') {
                          <svg class="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"></path>
                          </svg>
                        } @else {
                          <svg class="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4z"></path>
                            <path fill-rule="evenodd" d="M3 8h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm5 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" clip-rule="evenodd"></path>
                          </svg>
                        }
                      </div>
                      <div>
                        <p class="font-medium text-gray-900">{{ entity.name }}</p>
                        @if (entity.details) {
                          <p class="text-sm text-gray-500">{{ entity.details }}</p>
                        }
                      </div>
                    </div>
                    @if (selectedEntityId() === entity.id) {
                      <svg class="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                      </svg>
                    }
                  </div>
                }
              </div>

              @if (selectedEntityId()) {
                <div class="flex justify-between mt-8">
                  <button
                    type="button"
                    (click)="previousStep()"
                    class="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    (click)="nextStep()"
                    class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Continue
                  </button>
                </div>
              }
            </div>
          }

          <!-- Step 3: Report Details -->
          @if (currentStep() === 3) {
            <div class="bg-white rounded-xl border border-gray-200 p-8">
              <div class="mb-6">
                <h2 class="text-xl font-semibold text-gray-900 mb-2">Report Details</h2>
                <p class="text-gray-600">Please provide detailed information about the issue</p>
              </div>

              <div class="space-y-6">
                <!-- Report Category -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-3">
                    Report Category <span class="text-red-500">*</span>
                  </label>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    @for (category of getReportCategories(); track category.id) {
                      <div
                        class="relative rounded-lg border p-4 cursor-pointer transition-all hover:shadow-sm"
                        [class.border-blue-500]="reportForm.get('category')?.value === category.id"
                        [class.bg-blue-50]="reportForm.get('category')?.value === category.id"
                        [class.border-gray-200]="reportForm.get('category')?.value !== category.id"
                        (click)="selectCategory(category.id)"
                      >
                        <div class="flex items-start">
                          <span class="text-2xl mr-3">{{ category.icon }}</span>
                          <div>
                            <h4 class="font-medium text-gray-900">{{ category.name }}</h4>
                            <p class="text-sm text-gray-500">{{ category.description }}</p>
                          </div>
                        </div>
                        @if (reportForm.get('category')?.value === category.id) {
                          <div class="absolute top-3 right-3">
                            <svg class="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                            </svg>
                          </div>
                        }
                      </div>
                    }
                  </div>
                </div>

                <!-- Reason -->
                <div>
                  <label for="reason" class="block text-sm font-medium text-gray-700 mb-2">
                    Brief Summary <span class="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="reason"
                    formControlName="reason"
                    placeholder="Brief description of the issue"
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    [class.border-red-300]="reportForm.get('reason')?.invalid && reportForm.get('reason')?.touched"
                  />
                  @if (reportForm.get('reason')?.invalid && reportForm.get('reason')?.touched) {
                    <p class="mt-1 text-sm text-red-600">Please provide a brief summary</p>
                  }
                </div>

                <!-- Description -->
                <div>
                  <label for="description" class="block text-sm font-medium text-gray-700 mb-2">
                    Detailed Description <span class="text-red-500">*</span>
                  </label>
                  <textarea
                    id="description"
                    formControlName="description"
                    rows="6"
                    placeholder="Please provide as much detail as possible about what happened, when it occurred, and any relevant context that would help us understand the situation."
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    [class.border-red-300]="reportForm.get('description')?.invalid && reportForm.get('description')?.touched"
                  ></textarea>
                  <div class="flex justify-between mt-1">
                    @if (reportForm.get('description')?.invalid && reportForm.get('description')?.touched) {
                      <p class="text-sm text-red-600">Please provide a detailed description (minimum 50 characters)</p>
                    } @else {
                      <p class="text-sm text-gray-500">Minimum 50 characters required</p>
                    }
                    <p class="text-sm text-gray-400">{{ reportForm.get('description')?.value?.length || 0 }}/1000</p>
                  </div>
                </div>

                <!-- Priority -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-3">
                    Priority Level <span class="text-red-500">*</span>
                  </label>
                  <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                    @for (priority of priorities; track priority.value) {
                      <div
                        class="relative rounded-lg border p-4 cursor-pointer transition-all hover:shadow-sm"
                        [class.border-blue-500]="reportForm.get('priority')?.value === priority.value"
                        [class.bg-blue-50]="reportForm.get('priority')?.value === priority.value"
                        [class.border-gray-200]="reportForm.get('priority')?.value !== priority.value"
                        (click)="selectPriority(priority.value)"
                      >
                        <div class="text-center">
                          <div class="w-8 h-8 mx-auto mb-2 rounded-full flex items-center justify-center" [class]="priority.color">
                            <span class="text-lg">{{ priority.icon }}</span>
                          </div>
                          <h4 class="font-medium text-gray-900">{{ priority.label }}</h4>
                          <p class="text-xs text-gray-500 mt-1">{{ priority.description }}</p>
                        </div>
                        @if (reportForm.get('priority')?.value === priority.value) {
                          <div class="absolute top-2 right-2">
                            <svg class="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                            </svg>
                          </div>
                        }
                      </div>
                    }
                  </div>
                </div>

                <!-- File Upload -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Evidence (Optional)
                  </label>
                  <div
                    class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer"
                    (click)="fileInput.click()"
                    (dragover)="onDragOver($event)"
                    (drop)="onDrop($event)"
                  >
                    <input
                      #fileInput
                      type="file"
                      multiple
                      accept="image/*,.pdf,.doc,.docx"
                      class="hidden"
                      (change)="onFileSelect($event)"
                    />
                    <svg class="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                    <div class="mt-4">
                      <p class="text-sm text-gray-600">
                        <span class="font-medium">Click to upload</span> or drag and drop
                      </p>
                      <p class="text-xs text-gray-500">PNG, JPG, PDF, DOC up to 10MB each</p>
                    </div>
                  </div>

                  @if (selectedFiles().length > 0) {
                    <div class="mt-4">
                      <h4 class="text-sm font-medium text-gray-700 mb-2">Selected Files:</h4>
                      <div class="space-y-2">
                        @for (file of selectedFiles(); track $index) {
                          <div class="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <span class="text-sm text-gray-600">{{ file.name }}</span>
                            <button
                              type="button"
                              (click)="removeFile($index)"
                              class="text-red-500 hover:text-red-700"
                            >
                              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                              </svg>
                            </button>
                          </div>
                        }
                      </div>
                    </div>
                  }
                </div>
              </div>

              <div class="flex justify-between mt-8">
                <button
                  type="button"
                  (click)="previousStep()"
                  class="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Back
                </button>
                <button
                  type="button"
                  (click)="nextStep()"
                  [disabled]="!reportForm.valid"
                  class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  Review Report
                </button>
              </div>
            </div>
          }

          <!-- Step 4: Review & Submit -->
          @if (currentStep() === 4) {
            <div class="bg-white rounded-xl border border-gray-200 p-8">
              <div class="mb-6">
                <h2 class="text-xl font-semibold text-gray-900 mb-2">Review Your Report</h2>
                <p class="text-gray-600">Please review the information before submitting</p>
              </div>

              <div class="space-y-6">
                <!-- Report Summary -->
                <div class="bg-gray-50 rounded-lg p-6">
                  <h3 class="font-medium text-gray-900 mb-4">Report Summary</h3>
                  <dl class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <dt class="text-sm font-medium text-gray-500">Report Type</dt>
                      <dd class="text-sm text-gray-900 capitalize">{{ selectedReportType() }}</dd>
                    </div>
                    <div>
                      <dt class="text-sm font-medium text-gray-500">Target</dt>
                      <dd class="text-sm text-gray-900">{{ getSelectedEntityName() }}</dd>
                    </div>
                    <div>
                      <dt class="text-sm font-medium text-gray-500">Category</dt>
                      <dd class="text-sm text-gray-900">{{ getCategoryName() }}</dd>
                    </div>
                    <div>
                      <dt class="text-sm font-medium text-gray-500">Priority</dt>
                      <dd class="text-sm text-gray-900 capitalize">{{ reportForm.get('priority')?.value }}</dd>
                    </div>
                    <div class="md:col-span-2">
                      <dt class="text-sm font-medium text-gray-500">Summary</dt>
                      <dd class="text-sm text-gray-900">{{ reportForm.get('reason')?.value }}</dd>
                    </div>
                    <div class="md:col-span-2">
                      <dt class="text-sm font-medium text-gray-500">Description</dt>
                      <dd class="text-sm text-gray-900">{{ reportForm.get('description')?.value }}</dd>
                    </div>
                    @if (selectedFiles().length > 0) {
                      <div class="md:col-span-2">
                        <dt class="text-sm font-medium text-gray-500">Evidence</dt>
                        <dd class="text-sm text-gray-900">
                          {{ selectedFiles().length }} file(s) attached
                        </dd>
                      </div>
                    }
                  </dl>
                </div>

                <!-- Terms and Conditions -->
                <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div class="flex">
                    <div class="flex-shrink-0">
                      <svg class="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                      </svg>
                    </div>
                    <div class="ml-3">
                      <h3 class="text-sm font-medium text-yellow-800">Important Notice</h3>
                      <div class="mt-2 text-sm text-yellow-700">
                        <ul class="list-disc pl-5 space-y-1">
                          <li>False reports may result in account suspension</li>
                          <li>We investigate all reports thoroughly and may contact you for additional information</li>
                          <li>Response time varies based on priority level (High: 24h, Medium: 72h, Low: 1 week)</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="flex items-center">
                  <input
                    id="terms"
                    type="checkbox"
                    formControlName="acceptTerms"
                    class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label for="terms" class="ml-2 block text-sm text-gray-900">
                    I confirm that the information provided is accurate and I agree to the
                    <a href="#" class="text-blue-600 hover:text-blue-500">Terms of Service</a> and
                    <a href="#" class="text-blue-600 hover:text-blue-500">Community Guidelines</a>
                    <span class="text-red-500">*</span>
                  </label>
                </div>
              </div>

              <div class="flex justify-between mt-8">
                <button
                  type="button"
                  (click)="previousStep()"
                  class="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Back
                </button>
                <button
                  type="submit"
                  [disabled]="!reportForm.valid || isSubmitting()"
                  class="px-8 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center"
                >
                  @if (isSubmitting()) {
                    <svg class="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  } @else {
                    Submit Report
                  }
                </button>
              </div>
            </div>
          }
        </form>

        <!-- Success State -->
        @if (isSubmitted()) {
          <div class="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <svg class="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h2 class="text-xl font-semibold text-gray-900 mb-2">Report Submitted Successfully</h2>
            <p class="text-gray-600 mb-6">
              Thank you for helping keep our platform safe. We've received your report and will investigate the matter.
            </p>
            <div class="bg-gray-50 rounded-lg p-4 mb-6">
              <p class="text-sm font-medium text-gray-900 mb-2">Report ID: #{{ reportId() }}</p>
              <p class="text-sm text-gray-600">
                Expected response time: {{ getExpectedResponseTime() }}
              </p>
            </div>
            <div class="space-y-3">
              <button
                (click)="submitAnotherReport()"
                class="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Submit Another Report
              </button>
              <button
                (click)="goToDashboard()"
                class="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        }
      </div>
    </div>
  `
})
export class ReportPageComponent implements OnInit {
  reportForm: FormGroup;
  currentStep = signal(1);
  selectedReportType = signal<'user' | 'listing' | null>(null);
  selectedEntityId = signal<string | null>(null);
  selectedFiles = signal<File[]>([]);
  isSubmitting = signal(false);
  isSubmitted = signal(false);
  reportId = signal<string | null>(null);
  searchTerm = '';

  // Mock data
  mockUsers: ReportableEntity[] = [
    { id: '1', name: 'Ahmed Khan', type: 'user', details: 'ahmed.khan@example.com' },
    { id: '2', name: 'Fatima Ali', type: 'user', details: 'fatima.ali@example.com' },
    { id: '3', name: 'Hassan Sheikh', type: 'user', details: 'hassan.sheikh@example.com' },
    { id: '4', name: 'Sara Ahmed', type: 'user', details: 'sara.ahmed@example.com' }
  ];

  mockListings: ReportableEntity[] = [
    { id: '1', name: 'Professional DSLR Camera Kit', type: 'listing', details: 'Electronics • Rs150/day' },
    { id: '2', name: 'Power Drill Set', type: 'listing', details: 'Tools • Rs75/day' },
    { id: '3', name: 'Mountain Bike - Trek 2024', type: 'listing', details: 'Vehicles • Rs200/day' },
    { id: '4', name: 'Gaming Console PS5', type: 'listing', details: 'Electronics • Rs300/day' },
    { id: '5', name: 'Leather Sofa Set', type: 'listing', details: 'Furniture • Rs120/day' }
  ];

  filteredEntities = computed(() => {
    const entities = this.selectedReportType() === 'user' ? this.mockUsers : this.mockListings;
    if (!this.searchTerm) return entities;
    return entities.filter(entity =>
      entity.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      entity.details?.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  });

  steps = [
    { id: 1, name: 'Type' },
    { id: 2, name: 'Select' },
    { id: 3, name: 'Details' },
    { id: 4, name: 'Review' }
  ];

  userReportCategories: ReportCategory[] = [
    { id: 'harassment', name: 'Harassment', description: 'Threatening, bullying, or abusive behavior', icon: '🚫' },
    { id: 'fraud', name: 'Fraud/Scam', description: 'Fraudulent activity or scamming attempts', icon: '⚠️' },
    { id: 'inappropriate', name: 'Inappropriate Content', description: 'Offensive language or inappropriate content', icon: '🔞' },
    { id: 'fake_profile', name: 'Fake Profile', description: 'Impersonation or fake account', icon: '🎭' },
    { id: 'spam', name: 'Spam', description: 'Unsolicited messages or spam content', icon: '📧' },
    { id: 'other', name: 'Other', description: 'Other policy violations', icon: '❓' }
  ];

  listingReportCategories: ReportCategory[] = [
    { id: 'misleading', name: 'Misleading Description', description: 'Item different from description', icon: '📝' },
    { id: 'fake_listing', name: 'Fake Listing', description: 'Item doesn\'t exist or is not available', icon: '🚯' },
    { id: 'unsafe', name: 'Safety Concerns', description: 'Item poses safety risks or hazards', icon: '⚡' },
    { id: 'stolen', name: 'Stolen Item', description: 'Suspected stolen or illegal item', icon: '🚔' },
    { id: 'price_gouging', name: 'Price Gouging', description: 'Unreasonably high pricing', icon: '💰' },
    { id: 'other', name: 'Other', description: 'Other listing violations', icon: '❓' }
  ];

  priorities = [
    {
      value: 'low',
      label: 'Low',
      icon: '🟢',
      description: '1 week response',
      color: 'bg-green-100'
    },
    {
      value: 'medium',
      label: 'Medium',
      icon: '🟡',
      description: '3 days response',
      color: 'bg-yellow-100'
    },
    {
      value: 'high',
      label: 'High',
      icon: '🔴',
      description: '24h response',
      color: 'bg-red-100'
    }
  ];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.reportForm = this.fb.group({
      reportType: ['', Validators.required],
      entityId: ['', Validators.required],
      category: ['', Validators.required],
      reason: ['', [Validators.required, Validators.minLength(10)]],
      description: ['', [Validators.required, Validators.minLength(50), Validators.maxLength(1000)]],
      priority: ['medium', Validators.required],
      acceptTerms: [false, Validators.requiredTrue]
    });
  }

  ngOnInit() {
    // Check for route parameters to pre-populate form
    this.route.queryParams.subscribe(params => {
      if (params['type'] && params['id']) {
        this.selectedReportType.set(params['type']);
        this.selectedEntityId.set(params['id']);
        this.currentStep.set(3);
        this.reportForm.patchValue({
          reportType: params['type'],
          entityId: params['id']
        });
      }
    });
  }

  selectReportType(type: 'user' | 'listing') {
    this.selectedReportType.set(type);
    this.reportForm.patchValue({ reportType: type });
  }

  selectEntity(entityId: string) {
    this.selectedEntityId.set(entityId);
    this.reportForm.patchValue({ entityId });
  }

  selectCategory(categoryId: string) {
    this.reportForm.patchValue({ category: categoryId });
  }

  selectPriority(priority: string) {
    this.reportForm.patchValue({ priority });
  }

  searchEntities() {
    // Filter logic is handled by computed signal
  }

  nextStep() {
    if (this.currentStep() < 4) {
      this.currentStep.set(this.currentStep() + 1);
    }
  }

  previousStep() {
    if (this.currentStep() > 1) {
      this.currentStep.set(this.currentStep() - 1);
    }
  }

  getReportCategories(): ReportCategory[] {
    return this.selectedReportType() === 'user' ? this.userReportCategories : this.listingReportCategories;
  }

  getSelectedEntityName(): string {
    const entities = this.selectedReportType() === 'user' ? this.mockUsers : this.mockListings;
    const entity = entities.find(e => e.id === this.selectedEntityId());
    return entity?.name || '';
  }

  getCategoryName(): string {
    const categories = this.getReportCategories();
    const category = categories.find(c => c.id === this.reportForm.get('category')?.value);
    return category?.name || '';
  }

  getExpectedResponseTime(): string {
    const priority = this.reportForm.get('priority')?.value;
    const priorityObj = this.priorities.find(p => p.value === priority);
    return priorityObj?.description || '';
  }

  onFileSelect(event: any) {
    const files = Array.from(event.target.files) as File[];
    this.addFiles(files);
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    const files = Array.from(event.dataTransfer?.files || []) as File[];
    this.addFiles(files);
  }

  addFiles(files: File[]) {
    const validFiles = files.filter(file => {
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      const maxSize = 10 * 1024 * 1024; // 10MB
      return validTypes.includes(file.type) && file.size <= maxSize;
    });

    const currentFiles = this.selectedFiles();
    const newFiles = [...currentFiles, ...validFiles].slice(0, 5); // Max 5 files
    this.selectedFiles.set(newFiles);
  }

  removeFile(index: number) {
    const files = this.selectedFiles();
    files.splice(index, 1);
    this.selectedFiles.set([...files]);
  }

  onSubmit() {
    if (this.reportForm.valid && !this.isSubmitting()) {
      this.isSubmitting.set(true);

      // Simulate API call
      setTimeout(() => {
        const reportId = 'RPT' + Math.random().toString(36).substr(2, 9).toUpperCase();
        this.reportId.set(reportId);
        this.isSubmitting.set(false);
        this.isSubmitted.set(true);

        // Log the report data (in real app, this would be sent to API)
        console.log('Report submitted:', {
          ...this.reportForm.value,
          files: this.selectedFiles()
        });
      }, 2000);
    }
  }

  submitAnotherReport() {
    // Reset form and state
    this.reportForm.reset();
    this.currentStep.set(1);
    this.selectedReportType.set(null);
    this.selectedEntityId.set(null);
    this.selectedFiles.set([]);
    this.isSubmitted.set(false);
    this.reportId.set(null);
    this.searchTerm = '';

    // Reset form with default values
    this.reportForm.patchValue({
      priority: 'medium',
      acceptTerms: false
    });
  }

  goBack() {
    window.history.back();
  }

  goToDashboard() {
    this.router.navigate(['/dashboard']);
  }
}

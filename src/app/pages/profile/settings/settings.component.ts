import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Subject, takeUntil, interval, Subscription } from 'rxjs';
import { AuthService } from '../../../services/auth/auth.service';
import { ToasterService } from '../../../services/toaster/toaster.service';
import { User } from '../../../models/User.model';



@Component({
  selector: 'app-profile-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="space-y-8">
      <div>
        <h2 class="text-2xl font-bold text-gray-900 mb-2">Account Settings</h2>
        <p class="text-gray-600">Manage your personal information and security preferences</p>
      </div>

      <!-- Personal Information -->
      <div class="border border-gray-200 rounded-xl p-8">
        <h3 class="text-lg font-semibold text-gray-900 mb-6">Personal Information</h3>
        <form [formGroup]="profileForm" (ngSubmit)="onSubmit()">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- First Name -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">First Name</label>
              <input
                type="text"
                formControlName="firstName"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                [class.border-red-300]="profileForm.get('firstName')?.invalid && profileForm.get('firstName')?.touched"
                [class.focus:ring-red-500]="profileForm.get('firstName')?.invalid && profileForm.get('firstName')?.touched"
                [class.focus:border-red-500]="profileForm.get('firstName')?.invalid && profileForm.get('firstName')?.touched"
              />
              <p *ngIf="profileForm.get('firstName')?.invalid && profileForm.get('firstName')?.touched"
                 class="mt-2 text-sm text-red-600">First name is required</p>
            </div>

            <!-- Last Name -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
              <input
                type="text"
                formControlName="lastName"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                [class.border-red-300]="profileForm.get('lastName')?.invalid && profileForm.get('lastName')?.touched"
                [class.focus:ring-red-500]="profileForm.get('lastName')?.invalid && profileForm.get('lastName')?.touched"
                [class.focus:border-red-500]="profileForm.get('lastName')?.invalid && profileForm.get('lastName')?.touched"
              />
              <p *ngIf="profileForm.get('lastName')?.invalid && profileForm.get('lastName')?.touched"
                 class="mt-2 text-sm text-red-600">Last name is required</p>
            </div>

            <!-- Email -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                formControlName="email"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                [class.border-red-300]="profileForm.get('email')?.invalid && profileForm.get('email')?.touched"
                [class.focus:ring-red-500]="profileForm.get('email')?.invalid && profileForm.get('email')?.touched"
                [class.focus:border-red-500]="profileForm.get('email')?.invalid && profileForm.get('email')?.touched"
              />
              <p *ngIf="profileForm.get('email')?.invalid && profileForm.get('email')?.touched"
                 class="mt-2 text-sm text-red-600">Valid email is required</p>
            </div>

            <!-- Phone -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
              <input
                type="tel"
                formControlName="phoneNumber"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="+1 (555) 123-4567"
              />
            </div>
             <!-- Bio -->
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-2">Bio</label>
              <textarea
                formControlName="bio"
                rows="4"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                placeholder="Tell us about yourself..."
              ></textarea>
            </div>

            <!-- Date of Birth -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
              <input
                type="date"
                formControlName="dateOfBirth"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>

            <!-- Gender -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Gender</label>
              <select
                formControlName="gender"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value="">Select Gender</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
                <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
              </select>
            </div>

            <!-- Location Address -->
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-2">Address</label>
              <input
                type="text"
                formControlName="address"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Your full address"
              />
            </div>

            <!-- City and State -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">City</label>
              <input
                type="text"
                formControlName="city"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Your city"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">State/Province</label>
              <input
                type="text"
                formControlName="state"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Your state/province"
              />
            </div>

            <!-- Website -->
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-2">Website</label>
              <input
                type="url"
                formControlName="website"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="https://example.com"
              />
            </div>
          </div>

          <div class="flex justify-end pt-6 border-t border-gray-200 mt-8">
            <button
              type="submit"
              class="inline-flex items-center px-6 py-3 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              [disabled]="profileForm.invalid || isLoading"
            >
              <div *ngIf="isLoading" class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
              {{ isLoading ? 'Updating...' : 'Update Profile' }}
            </button>
          </div>
        </form>
      </div>

      <!-- Payment Information -->
      <div class="border border-gray-200 rounded-xl p-8">
        <h3 class="text-lg font-semibold text-gray-900 mb-6">Payment Information</h3>

        <!-- Tab Navigation -->
        <div class="border-b border-gray-200 mb-6">
          <nav class="-mb-px flex space-x-8">
            <button
              type="button"
              (click)="activePaymentTab = 'bank'"
              [class]="activePaymentTab === 'bank'
                ? 'border-blue-500 text-blue-600 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors'"
            >
              <div class="flex items-center space-x-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                </svg>
                <span>Bank Account</span>
              </div>
            </button>

            <button
              type="button"
              (click)="activePaymentTab = 'wallet'"
              [class]="activePaymentTab === 'wallet'
                ? 'border-blue-500 text-blue-600 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors'"
            >
              <div class="flex items-center space-x-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
                <span>Digital Wallet</span>
              </div>
            </button>
          </nav>
        </div>

        <!-- Bank Account Tab Content -->
        <div *ngIf="activePaymentTab === 'bank'">
          <form [formGroup]="bankForm" (ngSubmit)="onSubmitBankPayment()">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Account Number -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Bank Account Number</label>
                <input
                  type="text"
                  formControlName="accountNumber"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  [class.border-red-300]="bankForm.get('accountNumber')?.invalid && bankForm.get('accountNumber')?.touched"
                  [class.focus:ring-red-500]="bankForm.get('accountNumber')?.invalid && bankForm.get('accountNumber')?.touched"
                  [class.focus:border-red-500]="bankForm.get('accountNumber')?.invalid && bankForm.get('accountNumber')?.touched"
                  placeholder="Enter your bank account number"
                />
                <p *ngIf="bankForm.get('accountNumber')?.invalid && bankForm.get('accountNumber')?.touched"
                   class="mt-2 text-sm text-red-600">
                  <span *ngIf="bankForm.get('accountNumber')?.errors?.['required']">Account number is required</span>
                  <span *ngIf="bankForm.get('accountNumber')?.errors?.['minlength']">Account number must be at least 8 characters</span>
                  <span *ngIf="bankForm.get('accountNumber')?.errors?.['pattern']">Please enter a valid account number (numbers only)</span>
                </p>
              </div>

              <!-- Account Holder Name -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Account Holder Name</label>
                <input
                  type="text"
                  formControlName="accountHolderName"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Full name as per bank account"
                  [class.border-red-300]="bankForm.get('accountHolderName')?.invalid && bankForm.get('accountHolderName')?.touched"
                  [class.focus:ring-red-500]="bankForm.get('accountHolderName')?.invalid && bankForm.get('accountHolderName')?.touched"
                  [class.focus:border-red-500]="bankForm.get('accountHolderName')?.invalid && bankForm.get('accountHolderName')?.touched"
                />
                <p *ngIf="bankForm.get('accountHolderName')?.invalid && bankForm.get('accountHolderName')?.touched"
                   class="mt-2 text-sm text-red-600">Account holder name is required</p>
              </div>

              <!-- Bank Name -->
              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-2">Bank Name</label>
                <div class="relative">
                  <select
                    formControlName="bankName"
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors appearance-none"
                    [class.border-red-300]="bankForm.get('bankName')?.invalid && bankForm.get('bankName')?.touched"
                    [class.focus:ring-red-500]="bankForm.get('bankName')?.invalid && bankForm.get('bankName')?.touched"
                    [class.focus:border-red-500]="bankForm.get('bankName')?.invalid && bankForm.get('bankName')?.touched"
                  >
                    <option value="">Select Bank</option>
                    <!-- Big 5 Banks -->
                    <optgroup label="Big 5 Banks">
                      <option value="HBL">Habib Bank Limited (HBL)</option>
                      <option value="UBL">United Bank Limited (UBL)</option>
                      <option value="MCB">MCB Bank Limited</option>
                      <option value="NBP">National Bank of Pakistan (NBP)</option>
                      <option value="ABL">Allied Bank Limited (ABL)</option>
                    </optgroup>

                    <!-- Other Commercial Banks -->
                    <optgroup label="Commercial Banks">
                      <option value="BAFL">Bank Alfalah Limited</option>
                      <option value="BAL">Bank AL Habib Limited</option>
                      <option value="BAHL">Bank Al-Habib Limited</option>
                      <option value="FABL">Faysal Bank Limited</option>
                      <option value="KASB">KASB Bank Limited</option>
                      <option value="MEBL">Meezan Bank Limited</option>
                      <option value="SNBL">Soneri Bank Limited</option>
                      <option value="SILK">Silk Bank Limited</option>
                      <option value="SUMB">Summit Bank Limited</option>
                      <option value="JSBL">JS Bank Limited</option>
                      <option value="BOP">Bank of Punjab (BOP)</option>
                      <option value="BOK">Bank of Khyber (BOK)</option>
                      <option value="AKBL">Askari Bank Limited</option>
                      <option value="ZTBL">Zarai Taraqiati Bank Limited</option>
                      <option value="SMBL">SME Bank Limited</option>
                    </optgroup>

                    <!-- Islamic Banks -->
                    <optgroup label="Islamic Banks">
                      <option value="BIPL">BankIslami Pakistan Limited</option>
                      <option value="MEBL">Meezan Bank Limited</option>
                      <option value="AIBFL">Al Baraka Bank (Pakistan) Limited</option>
                      <option value="DIBPL">Dubai Islamic Bank Pakistan Limited</option>
                    </optgroup>

                    <!-- Foreign Banks -->
                    <optgroup label="Foreign Banks">
                      <option value="SCBPL">Standard Chartered Bank (Pakistan) Limited</option>
                      <option value="CITIBANK">Citibank N.A.</option>
                      <option value="HSBC">HSBC Bank Middle East Limited</option>
                      <option value="BARC">Barclays Bank PLC</option>
                      <option value="BNPP">BNP Paribas</option>
                      <option value="INDUSTRIAL">Industrial and Commercial Bank of China</option>
                    </optgroup>

                    <!-- Microfinance Banks -->
                    <optgroup label="Microfinance Banks">
                      <option value="FMFB">First MicroFinance Bank Limited</option>
                      <option value="KMBL">Khushhali Microfinance Bank Limited</option>
                      <option value="TAMEER">Tameer Microfinance Bank Limited</option>
                      <option value="TGBL">Telenor Microfinance Bank Limited</option>
                      <option value="ADVANS">Advans Pakistan Microfinance Bank Limited</option>
                    </optgroup>

                    <!-- Others -->
                    <optgroup label="Others">
                      <option value="OTHER">Other Bank</option>
                    </optgroup>
                  </select>
                  <!-- Custom dropdown arrow -->
                  <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg class="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                    </svg>
                  </div>
                </div>
                <p *ngIf="bankForm.get('bankName')?.invalid && bankForm.get('bankName')?.touched"
                   class="mt-2 text-sm text-red-600">Please select your bank</p>

                <!-- Show text input for "Other Bank" option -->
                <div *ngIf="bankForm.get('bankName')?.value === 'OTHER'" class="mt-3">
                  <input
                    type="text"
                    formControlName="customBankName"
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Enter your bank name"
                    [class.border-red-300]="bankForm.get('customBankName')?.invalid && bankForm.get('customBankName')?.touched"
                    [class.focus:ring-red-500]="bankForm.get('customBankName')?.invalid && bankForm.get('customBankName')?.touched"
                    [class.focus:border-red-500]="bankForm.get('customBankName')?.invalid && bankForm.get('customBankName')?.touched"
                  />
                  <p *ngIf="bankForm.get('customBankName')?.invalid && bankForm.get('customBankName')?.touched"
                     class="mt-2 text-sm text-red-600">Bank name is required</p>
                </div>
              </div>
            </div>

            <!-- Bank Account Info Note -->
            <div class="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div class="flex items-start space-x-2">
                <svg class="w-5 h-5 text-blue-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <div>
                  <p class="text-sm font-medium text-blue-800">Bank Account Information</p>
                  <p class="text-sm text-blue-700 mt-1">Payments will be processed directly to your bank account. Make sure all details are accurate to avoid delays.</p>
                </div>
              </div>
            </div>

            <!-- Submit Button -->
            <div class="flex justify-end pt-6 border-t border-gray-200 mt-8">
              <button
                type="submit"
                class="inline-flex items-center px-6 py-3 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                [disabled]="bankForm.invalid || isBankLoading"
              >
                <div *ngIf="isBankLoading" class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                <svg *ngIf="!isBankLoading" class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                </svg>
                {{ isBankLoading ? 'Updating...' : 'Update Bank Account' }}
              </button>
            </div>
          </form>
        </div>

        <!-- Digital Wallet Tab Content -->
        <div *ngIf="activePaymentTab === 'wallet'">
          <!-- Coming Soon Section -->
          <div class="text-center py-16">
            <div class="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>

            <h3 class="text-xl font-semibold text-gray-900 mb-2">Digital Wallets Coming Soon</h3>
            <p class="text-gray-600 mb-8 max-w-md mx-auto">We're working on integrating popular digital wallet services to make payments more convenient for you.</p>

            <!-- Wallet Options Preview -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md mx-auto">
              <!-- EasyPaisa -->
              <div class="p-6 border-2 border-gray-200 rounded-xl bg-gray-50 opacity-60">
                <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path>
                  </svg>
                </div>
                <h4 class="font-semibold text-gray-700 mb-1">EasyPaisa</h4>
                <p class="text-sm text-gray-500">Mobile wallet payments</p>
                <div class="mt-3 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  Coming Soon
                </div>
              </div>

              <!-- JazzCash -->
              <div class="p-6 border-2 border-gray-200 rounded-xl bg-gray-50 opacity-60">
                <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
                  </svg>
                </div>
                <h4 class="font-semibold text-gray-700 mb-1">JazzCash</h4>
                <p class="text-sm text-gray-500">Digital wallet service</p>
                <div class="mt-3 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  Coming Soon
                </div>
              </div>
            </div>

            <!-- Additional Info -->
            <div class="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg max-w-lg mx-auto">
              <div class="flex items-start space-x-2">
                <svg class="w-5 h-5 text-blue-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <div class="text-left">
                  <p class="text-sm font-medium text-blue-800">Stay Updated</p>
                  <p class="text-sm text-blue-700 mt-1">For now, you can use bank account transfers. We'll notify you when digital wallet options become available.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Security Settings -->
      <div class="border border-gray-200 rounded-xl p-8">
        <h3 class="text-lg font-semibold text-gray-900 mb-6">Security Settings</h3>
        <div class="space-y-4">
          <div class="flex items-center justify-between p-6 border border-gray-200 rounded-lg">
            <div class="flex items-center space-x-4">
              <div class="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"></path>
                </svg>
              </div>
              <div>
                <p class="font-medium text-gray-900">Change Password</p>
                <p class="text-sm text-gray-600">Update your account password</p>
              </div>
            </div>
            <button class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              Change
            </button>
          </div>

          <!-- Email Verification Status -->
          <!-- Not Verified - Show countdown or verify button -->
          <div *ngIf="!user?.emailVerified" class="flex items-center justify-between p-6 border border-yellow-200 bg-yellow-50 rounded-lg">
            <div class="flex items-center space-x-4">
              <div class="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                <svg class="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z"></path>
                </svg>
              </div>
              <div>
                <p class="font-medium text-yellow-800">Email Not Verified</p>
                <p class="text-sm text-yellow-700">
                  <span *ngIf="!isVerificationEmailSent">Verify your email to rent/rent-out equipment</span>
                  <span *ngIf="isVerificationEmailSent && verificationCountdown > 0">Email sent! You can resend in {{ getCountdownText() }}</span>
                  <span *ngIf="isVerificationEmailSent && verificationCountdown <= 0">You can now resend the verification email</span>
                </p>
              </div>
            </div>
            <button
              (click)="handleVerificationEmail()"
              [disabled]="isVerificationEmailSent && verificationCountdown > 0"
              class="px-4 py-2 text-sm font-medium transition-colors rounded-lg"
              [class]="(isVerificationEmailSent && verificationCountdown > 0)
                ? 'text-yellow-600 bg-yellow-200 border border-yellow-300 cursor-not-allowed opacity-50'
                : 'text-yellow-800 bg-yellow-100 border border-yellow-300 hover:bg-yellow-200'"
            >
              <span *ngIf="!isVerificationEmailSent || verificationCountdown <= 0">Verify Now</span>
              <span *ngIf="isVerificationEmailSent && verificationCountdown > 0">{{ getCountdownText() }}</span>
            </button>
          </div>

          <!-- Email Verified - Show success state -->
          <div *ngIf="user?.emailVerified" class="flex items-center justify-between p-6 border border-green-200 bg-green-50 rounded-lg">
            <div class="flex items-center space-x-4">
              <div class="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <div>
                <p class="font-medium text-green-800">Email Verified</p>
                <p class="text-sm text-green-700">Your email address has been verified successfully</p>
              </div>
            </div>
            <div class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
              Verified
            </div>
          </div>
        </div>
      </div>

      <!-- Account Actions -->
      <div class="border border-gray-200 rounded-xl p-8">
        <h3 class="text-lg font-semibold text-gray-900 mb-6">Account Actions</h3>
        <button
          (click)="logout()"
          class="w-full inline-flex items-center justify-center px-6 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
        >
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
          </svg>
          Sign Out
        </button>
      </div>
    </div>
  `
})
export class ProfileSettingsComponent implements OnInit, OnDestroy {
  @Input() user: User | null = null;

  profileForm: FormGroup;
  bankForm: FormGroup;
  isLoading = false;
  isBankLoading = false;
  activePaymentTab: 'bank' | 'wallet' = 'bank';

  // Email verification timer properties
  isVerificationEmailSent = false;
  verificationCountdown = 0;
  private countdownSubscription: Subscription | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private fb: FormBuilder,
    private http: HttpClient,
    private toaster: ToasterService
  ) {
    this.profileForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: [''],
      bio: [''],
      address: [''],
      city: [''],
      state: [''],
      website: [''],
      dateOfBirth: [''],
      gender: [''],
    });

    this.bankForm = this.fb.group({
      accountNumber: ['', [Validators.required, Validators.minLength(8), Validators.pattern(/^[0-9]+$/)]],
      bankName: ['', [Validators.required]],
      customBankName: [''],
      accountHolderName: ['', [Validators.required]]
    });

    // Set up conditional validators for bank form
    this.bankForm.get('bankName')?.valueChanges.subscribe(bankValue => {
      const customBankNameControl = this.bankForm.get('customBankName');
      if (bankValue === 'OTHER') {
        customBankNameControl?.setValidators([Validators.required]);
      } else {
        customBankNameControl?.clearValidators();
        customBankNameControl?.setValue('');
      }
      customBankNameControl?.updateValueAndValidity();
    });
  }

  ngOnInit() {
    if (this.user) {
      this.populateForm(this.user);
      this.populateBankForm(this.user);

      // Reset verification email state if user becomes verified
      if (this.user.emailVerified) {
        this.resetVerificationState();
      }
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.stopCountdown();
  }

  populateForm(user: User) {
    this.profileForm.patchValue({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      phoneNumber: user.phoneNumber || '',
      bio: user.bio || '',
      address: user.address?.fullAddress || '',
      city: user.address?.city || '',
      state: user.address?.state || '',
      website: user.website || '',
      dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
      gender: user.gender || '',
    });
  }

  populateBankForm(user: User) {
    // Assuming user has a paymentInfo property
    const paymentInfo = (user as any).paymentInfo;
    if (paymentInfo && paymentInfo.paymentMethod === 'BANK_ACCOUNT') {
      this.bankForm.patchValue({
        accountNumber: paymentInfo.accountNumber || '',
        bankName: paymentInfo.bankName || '',
        customBankName: paymentInfo.customBankName || '',
        accountHolderName: paymentInfo.accountHolderName || ''
      });
    }
  }

  onSubmitBankPayment() {
    if (this.bankForm.valid) {
      this.isBankLoading = true;

      const formData = this.bankForm.value;

      // Structure the payment data
      const paymentData = {
        paymentMethod: 'BANK_ACCOUNT',
        accountNumber: formData.accountNumber,
        bankName: formData.bankName === 'OTHER' ? formData.customBankName : formData.bankName,
        accountHolderName: formData.accountHolderName
      };

      // Update payment information via API
      this.http.put(`${this.authService.BASE_URL}/users/payment/update`, paymentData, {
        withCredentials: true
      }).subscribe({
        next: (response: any) => {
          this.isBankLoading = false;
          this.toaster.show('Bank account information updated successfully!', 'success');
          // Optionally reload user data to get updated payment info
          this.authService.loadUser();
        },
        error: (error) => {
          this.isBankLoading = false;
          this.toaster.show(error.error?.message || 'Failed to update bank account information. Please try again.', 'error');
        }
      });
    }
  }

  onSubmit() {
    if (this.profileForm.valid) {
      this.isLoading = true;

      const formData = this.profileForm.value;

      // Structure the data to match the User type
      const updateData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        bio: formData.bio,
        website: formData.website,
        dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth) : undefined,
        gender: formData.gender,
        address: {
          fullAddress: formData.address,
          street: formData.address,
          city: formData.city,
          state: formData.state,
        },
      };

      // Update profile via API
      this.http.put(`${this.authService.BASE_URL}/users/profile/update`, updateData, {
        withCredentials: true
      }).subscribe({
        next: (updatedUser: any) => {
          this.user = updatedUser;
          this.authService.loadUser(); // Refresh user in AuthService
          this.isLoading = false;
          this.toaster.show('Profile updated successfully!', 'success');
        },
        error: (error) => {
          this.isLoading = false;
          this.toaster.show(error.error?.message || 'Failed to update profile. Please try again.', 'error');
        }
      });
    }
  }

  onSubmitPayment() {
    // This method is kept for backward compatibility but no longer used
    // The actual submission is handled by onSubmitBankPayment()
  }

  handleVerificationEmail() {
    if (this.isVerificationEmailSent && this.verificationCountdown > 0) {
      return; // Don't send if countdown is active
    }

    // Send verification email API call
    this.authService.sendVerificationEmail().subscribe({
      next: () => {
        this.toaster.show("Verification email sent! Please check your inbox", 'info');
        this.startCountdown();
      },
      error: (error) => {
        this.toaster.show(error.error?.message || 'Failed to send verification email. Please try again.', 'error');
      }
    });
  }

  private startCountdown() {
    this.isVerificationEmailSent = true;
    this.verificationCountdown = 60; // 1 minute = 60 seconds

    this.countdownSubscription = interval(1000).subscribe(() => {
      this.verificationCountdown--;

      if (this.verificationCountdown <= 0) {
        this.resetVerificationState();
      }
    });
  }

  private stopCountdown() {
    if (this.countdownSubscription) {
      this.countdownSubscription.unsubscribe();
      this.countdownSubscription = null;
    }
  }

  private resetVerificationState() {
    this.stopCountdown();
    this.isVerificationEmailSent = false;
    this.verificationCountdown = 0;
  }

  getCountdownText(): string {
    const minutes = Math.floor(this.verificationCountdown / 60);
    const seconds = this.verificationCountdown % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  logout() {
    this.authService.logout();
  }
}

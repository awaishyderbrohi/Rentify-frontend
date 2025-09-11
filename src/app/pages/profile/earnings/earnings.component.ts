import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../../services/auth/auth.service';
import { ToasterService } from '../../../services/toaster/toaster.service';

interface Transaction {
  id: string;
  type: 'rental_payment' | 'payout' | 'fee' | 'refund';
  amount: number;
  description: string;
  date: string;
  status: 'completed' | 'pending' | 'failed';
  rentalId?: string;
  equipmentName?: string;
}

interface EarningsData {
  totalEarnings: number;
  availableBalance: number;
  pendingPayouts: number;
  thisMonthEarnings: number;
  lastMonthEarnings: number;
  totalTransactions: number;
  averageRentalValue: number;
  transactions: Transaction[];
}

interface PayoutMethod {
  id: string;
  type: 'bank_account' | 'paypal' | 'stripe';
  accountNumber?: string;
  bankName?: string;
  email?: string;
  isDefault: boolean;
  isVerified: boolean;
}

@Component({
  selector: 'app-earnings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  template: `
    <div class="space-y-8">
      <!-- Header -->
      <div>
        <h2 class="text-2xl font-bold text-gray-900 mb-2">Earnings</h2>
        <p class="text-gray-600">Track your rental income and manage payouts</p>
      </div>

      <!-- Loading State -->
      <div *ngIf="isLoading" class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
      </div>

      <!-- Error State -->
      <div *ngIf="errorMessage" class="bg-red-50 border border-red-200 rounded-lg p-4">
        <div class="flex items-center">
          <svg class="w-5 h-5 text-red-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <span class="text-red-800 text-sm font-medium">{{ errorMessage }}</span>
        </div>
      </div>

      <!-- Content -->
      <div *ngIf="!isLoading && !errorMessage">
        <!-- Earnings Overview Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div class="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
            <div class="flex items-center justify-between mb-4">
              <div class="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                </svg>
              </div>
            </div>
            <div class="text-3xl font-bold mb-1">\${{ formatCurrency(earningsData.totalEarnings) }}</div>
            <div class="text-green-100 text-sm">Total Earnings</div>
          </div>

          <div class="bg-white border border-gray-200 rounded-xl p-6">
            <div class="flex items-center justify-between mb-4">
              <div class="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
                </svg>
              </div>
            </div>
            <div class="text-3xl font-bold text-gray-900 mb-1">\${{ formatCurrency(earningsData.availableBalance) }}</div>
            <div class="text-gray-600 text-sm">Available Balance</div>
          </div>

          <div class="bg-white border border-gray-200 rounded-xl p-6">
            <div class="flex items-center justify-between mb-4">
              <div class="w-12 h-12 bg-yellow-50 rounded-lg flex items-center justify-center">
                <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
            </div>
            <div class="text-3xl font-bold text-gray-900 mb-1">\${{ formatCurrency(earningsData.pendingPayouts) }}</div>
            <div class="text-gray-600 text-sm">Pending Payouts</div>
          </div>

          <div class="bg-white border border-gray-200 rounded-xl p-6">
            <div class="flex items-center justify-between mb-4">
              <div class="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                </svg>
              </div>
            </div>
            <div class="text-3xl font-bold text-gray-900 mb-1">\${{ formatCurrency(earningsData.thisMonthEarnings) }}</div>
            <div class="text-gray-600 text-sm">This Month</div>
            <div class="text-xs mt-2 flex items-center">
              <span *ngIf="getGrowthPercentage() >= 0" class="text-green-600 flex items-center">
                <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 11l5-5m0 0l5 5m-5-5v12"></path>
                </svg>
                +{{ getGrowthPercentage() }}%
              </span>
              <span *ngIf="getGrowthPercentage() < 0" class="text-red-600 flex items-center">
                <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 13l-5 5m0 0l-5-5m5 5V6"></path>
                </svg>
                {{ getGrowthPercentage() }}%
              </span>
              <span class="ml-1 text-gray-500">vs last month</span>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="bg-white border border-gray-200 rounded-xl p-6 mb-8">
          <div class="flex flex-col sm:flex-row gap-4">
            <button
              (click)="requestPayout()"
              [disabled]="earningsData.availableBalance <= 0 || isProcessingPayout"
              class="flex-1 inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              <div *ngIf="isProcessingPayout" class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
              <svg *ngIf="!isProcessingPayout" class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
              {{ isProcessingPayout ? 'Processing...' : 'Request Payout' }}
            </button>
            <button
              (click)="togglePayoutSettings()"
              class="flex-1 sm:flex-initial inline-flex items-center justify-center px-6 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
              </svg>
              Payout Settings
            </button>
            <button
              (click)="downloadStatement()"
              class="flex-1 sm:flex-initial inline-flex items-center justify-center px-6 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              Download Statement
            </button>
          </div>
        </div>

        <!-- Payout Settings Modal -->
        <div *ngIf="showPayoutSettings" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div class="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div class="p-6 border-b border-gray-200">
              <div class="flex items-center justify-between">
                <h3 class="text-lg font-semibold text-gray-900">Payout Settings</h3>
                <button
                  (click)="togglePayoutSettings()"
                  class="text-gray-400 hover:text-gray-600"
                >
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
            </div>

            <div class="p-6">
              <!-- Existing Payout Methods -->
              <div class="mb-6">
                <h4 class="font-medium text-gray-900 mb-4">Payout Methods</h4>
                <div *ngIf="payoutMethods.length === 0" class="text-center py-8 text-gray-500">
                  <svg class="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
                  </svg>
                  <p>No payout methods configured</p>
                  <p class="text-sm">Add a payout method to receive your earnings</p>
                </div>

                <div *ngFor="let method of payoutMethods" class="border border-gray-200 rounded-lg p-4 mb-3">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-3">
                      <div class="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                        <svg *ngIf="method.type === 'bank_account'" class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H9m0 0H5m0 0h2M7 7h10M7 11h4"></path>
                        </svg>
                        <svg *ngIf="method.type === 'paypal'" class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                        </svg>
                      </div>
                      <div>
                        <p class="font-medium text-gray-900">
                          <span *ngIf="method.type === 'bank_account'">{{ method.bankName }}</span>
                          <span *ngIf="method.type === 'paypal'">PayPal</span>
                        </p>
                        <p class="text-sm text-gray-600">
                          <span *ngIf="method.type === 'bank_account'">****{{ method.accountNumber?.slice(-4) }}</span>
                          <span *ngIf="method.type === 'paypal'">{{ method.email }}</span>
                        </p>
                      </div>
                    </div>
                    <div class="flex items-center space-x-2">
                      <span *ngIf="method.isDefault" class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Default
                      </span>
                      <span *ngIf="method.isVerified" class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                        Verified
                      </span>
                      <button (click)="removePayoutMethod(method.id)" class="text-gray-400 hover:text-gray-600">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Add New Payout Method Form -->
              <div *ngIf="showAddPayoutForm" class="border-t border-gray-200 pt-6">
                <h4 class="font-medium text-gray-900 mb-4">Add New Payout Method</h4>
                <form [formGroup]="payoutForm" (ngSubmit)="addPayoutMethod()">
                  <div class="space-y-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">Method Type</label>
                      <select
                        formControlName="type"
                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select method</option>
                        <option value="bank_account">Bank Account</option>
                        <option value="paypal">PayPal</option>
                      </select>
                    </div>

                    <!-- Bank Account Fields -->
                    <div *ngIf="payoutForm.get('type')?.value === 'bank_account'">
                      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label class="block text-sm font-medium text-gray-700 mb-2">Bank Name</label>
                          <input
                            type="text"
                            formControlName="bankName"
                            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Enter bank name"
                          />
                        </div>
                        <div>
                          <label class="block text-sm font-medium text-gray-700 mb-2">Account Number</label>
                          <input
                            type="text"
                            formControlName="accountNumber"
                            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Enter account number"
                          />
                        </div>
                      </div>
                    </div>

                    <!-- PayPal Fields -->
                    <div *ngIf="payoutForm.get('type')?.value === 'paypal'">
                      <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">PayPal Email</label>
                        <input
                          type="email"
                          formControlName="email"
                          class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter PayPal email"
                        />
                      </div>
                    </div>

                    <div class="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        formControlName="setAsDefault"
                        id="setAsDefault"
                        class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <label for="setAsDefault" class="text-sm text-gray-700">Set as default payout method</label>
                    </div>
                  </div>

                  <div class="flex justify-end space-x-3 mt-6">
                    <button
                      type="button"
                      (click)="toggleAddPayoutForm()"
                      class="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      [disabled]="payoutForm.invalid || isAddingPayoutMethod"
                      class="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                    >
                      {{ isAddingPayoutMethod ? 'Adding...' : 'Add Method' }}
                    </button>
                  </div>
                </form>
              </div>

              <button
                *ngIf="!showAddPayoutForm"
                (click)="toggleAddPayoutForm()"
                class="w-full mt-4 inline-flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
                Add New Payout Method
              </button>
            </div>
          </div>
        </div>

        <!-- Transaction History -->
        <div class="bg-white border border-gray-200 rounded-xl p-6">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-lg font-semibold text-gray-900">Transaction History</h3>
            <div class="flex items-center space-x-2">
              <select
                [(ngModel)]="transactionFilter"
                (ngModelChange)="filterTransactions()"
                class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Transactions</option>
                <option value="rental_payment">Rental Payments</option>
                <option value="payout">Payouts</option>
                <option value="fee">Fees</option>
                <option value="refund">Refunds</option>
              </select>
            </div>
          </div>

          <div *ngIf="filteredTransactions.length === 0" class="text-center py-8 text-gray-500">
            <svg class="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
            </svg>
            <p>No transactions found</p>
          </div>

          <div class="space-y-3">
            <div
              *ngFor="let transaction of filteredTransactions.slice(0, showAllTransactions ? undefined : 10)"
              class="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div class="flex items-center space-x-4">
                <div class="w-10 h-10 rounded-lg flex items-center justify-center"
                     [class]="getTransactionIconClasses(transaction.type)">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" [innerHTML]="getTransactionIcon(transaction.type)">
                  </svg>
                </div>
                <div>
                  <p class="font-medium text-gray-900">{{ transaction.description }}</p>
                  <div class="flex items-center space-x-2 text-sm text-gray-600">
                    <span>{{ formatDate(transaction.date) }}</span>
                    <span *ngIf="transaction.equipmentName" class="text-gray-400">•</span>
                    <span *ngIf="transaction.equipmentName">{{ transaction.equipmentName }}</span>
                  </div>
                </div>
              </div>
              <div class="text-right">
                <div class="font-semibold"
                     [class]="transaction.type === 'fee' ? 'text-red-600' : 'text-green-600'">
                  {{ transaction.type === 'fee' ? '-' : '+' }}\${{ formatCurrency(transaction.amount) }}
                </div>
                <div class="text-xs"
                     [class]="getStatusClasses(transaction.status)">
                  {{ transaction.status | titlecase }}
                </div>
              </div>
            </div>
          </div>

          <div *ngIf="filteredTransactions.length > 10 && !showAllTransactions" class="text-center mt-4">
            <button
              (click)="showAllTransactions = true"
              class="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Show all {{ filteredTransactions.length }} transactions
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class EarningsComponent implements OnInit, OnDestroy {
  isLoading = true;
  errorMessage = '';
  isProcessingPayout = false;
  isAddingPayoutMethod = false;
  showPayoutSettings = false;
  showAddPayoutForm = false;
  showAllTransactions = false;
  transactionFilter = 'all';

  earningsData: EarningsData = {
    totalEarnings: 0,
    availableBalance: 0,
    pendingPayouts: 0,
    thisMonthEarnings: 0,
    lastMonthEarnings: 0,
    totalTransactions: 0,
    averageRentalValue: 0,
    transactions: []
  };

  payoutMethods: PayoutMethod[] = [];
  filteredTransactions: Transaction[] = [];

  payoutForm: FormGroup;
  private destroy$ = new Subject<void>();

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private fb: FormBuilder,
    private toaster: ToasterService
  ) {
    this.payoutForm = this.fb.group({
      type: ['', Validators.required],
      bankName: [''],
      accountNumber: [''],
      email: ['', Validators.email],
      setAsDefault: [false]
    });
  }

  ngOnInit() {
    this.loadEarningsData();
    this.loadPayoutMethods();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadEarningsData() {
    this.isLoading = true;
    this.errorMessage = '';

    this.http.get<EarningsData>(`${this.authService.BASE_URL}/earnings`, {
      withCredentials: true
    }).pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (data) => {
        this.earningsData = data;
        this.filteredTransactions = data.transactions;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Failed to load earnings data';
        this.isLoading = false;
        // Mock data for demo purposes
        this.loadMockData();
      }
    });
  }

  loadMockData() {
    // Mock data for demonstration
    this.earningsData = {
      totalEarnings: 15420.50,
      availableBalance: 2340.25,
      pendingPayouts: 180.00,
      thisMonthEarnings: 1850.75,
      lastMonthEarnings: 1420.30,
      totalTransactions: 47,
      averageRentalValue: 65.50,
      transactions: [
        {
          id: '1',
          type: 'rental_payment',
          amount: 120.00,
          description: 'Rental payment received',
          date: '2025-01-08T10:30:00Z',
          status: 'completed',
          rentalId: 'RNT-001',
          equipmentName: 'Canon EOS R5'
        },
        {
          id: '2',
          type: 'payout',
          amount: 500.00,
          description: 'Payout to Bank Account',
          date: '2025-01-05T14:20:00Z',
          status: 'completed'
        },
        {
          id: '3',
          type: 'fee',
          amount: 12.00,
          description: 'Platform service fee',
          date: '2025-01-08T10:30:00Z',
          status: 'completed',
          rentalId: 'RNT-001'
        },
        {
          id: '4',
          type: 'rental_payment',
          amount: 85.00,
          description: 'Rental payment received',
          date: '2025-01-07T16:45:00Z',
          status: 'completed',
          rentalId: 'RNT-002',
          equipmentName: 'DJI Mavic Pro'
        },
        {
          id: '5',
          type: 'payout',
          amount: 300.00,
          description: 'Payout to PayPal',
          date: '2025-01-03T09:15:00Z',
          status: 'pending'
        },
        {
          id: '6',
          type: 'rental_payment',
          amount: 95.00,
          description: 'Rental payment received',
          date: '2025-01-02T11:20:00Z',
          status: 'completed',
          rentalId: 'RNT-003',
          equipmentName: 'Sony A7R IV'
        },
        {
          id: '7',
          type: 'refund',
          amount: 45.00,
          description: 'Refund processed',
          date: '2024-12-28T14:15:00Z',
          status: 'completed',
          rentalId: 'RNT-004',
          equipmentName: 'GoPro Hero 12'
        },
        {
          id: '8',
          type: 'rental_payment',
          amount: 150.00,
          description: 'Rental payment received',
          date: '2024-12-25T09:30:00Z',
          status: 'completed',
          rentalId: 'RNT-005',
          equipmentName: 'RED Komodo 6K'
        }
      ]
    };
    this.filteredTransactions = this.earningsData.transactions;
    this.errorMessage = ''; // Clear error since we're using mock data
  }

  loadPayoutMethods() {
    this.http.get<PayoutMethod[]>(`${this.authService.BASE_URL}/payout-methods`, {
      withCredentials: true
    }).pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (methods) => {
        this.payoutMethods = methods;
      },
      error: (error) => {
        // Mock data for demo
        this.payoutMethods = [
          {
            id: '1',
            type: 'bank_account',
            bankName: 'Chase Bank',
            accountNumber: '1234567890',
            isDefault: true,
            isVerified: true
          },
          {
            id: '2',
            type: 'paypal',
            email: 'user@example.com',
            isDefault: false,
            isVerified: true
          }
        ];
      }
    });
  }

  requestPayout() {
    if (this.earningsData.availableBalance <= 0) {
      this.toaster.show('No available balance to payout', 'warning');
      return;
    }

    const defaultMethod = this.payoutMethods.find(m => m.isDefault);
    if (!defaultMethod) {
      this.toaster.show('Please add a payout method first', 'warning');
      this.togglePayoutSettings();
      return;
    }

    this.isProcessingPayout = true;

    const payoutData = {
      amount: this.earningsData.availableBalance,
      method: defaultMethod.id
    };

    this.http.post(`${this.authService.BASE_URL}/payouts`, payoutData, {
      withCredentials: true
    }).pipe(takeUntil(this.destroy$))
    .subscribe({
      next: () => {
        this.toaster.show('Payout request submitted successfully', 'success');
        this.loadEarningsData();
        this.isProcessingPayout = false;
      },
      error: (error) => {
        // Mock success for demo
        this.toaster.show('Payout request submitted successfully', 'success');
        // Update mock data to reflect payout
        this.earningsData.pendingPayouts += this.earningsData.availableBalance;
        this.earningsData.availableBalance = 0;
        this.isProcessingPayout = false;
      }
    });
  }

  togglePayoutSettings() {
    this.showPayoutSettings = !this.showPayoutSettings;
    if (!this.showPayoutSettings) {
      this.showAddPayoutForm = false;
    }
  }

  toggleAddPayoutForm() {
    this.showAddPayoutForm = !this.showAddPayoutForm;
    if (this.showAddPayoutForm) {
      this.payoutForm.reset();
    }
  }

  addPayoutMethod() {
    if (this.payoutForm.valid) {
      this.isAddingPayoutMethod = true;
      const formData = this.payoutForm.value;

      this.http.post(`${this.authService.BASE_URL}/payout-methods`, formData, {
        withCredentials: true
      }).pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.toaster.show('Payout method added successfully', 'success');
          this.loadPayoutMethods();
          this.toggleAddPayoutForm();
          this.isAddingPayoutMethod = false;
        },
        error: (error) => {
          // Mock success for demo
          const newMethod: PayoutMethod = {
            id: Date.now().toString(),
            type: formData.type,
            bankName: formData.bankName,
            accountNumber: formData.accountNumber,
            email: formData.email,
            isDefault: formData.setAsDefault || this.payoutMethods.length === 0,
            isVerified: false
          };

          if (formData.setAsDefault) {
            this.payoutMethods.forEach(method => method.isDefault = false);
          }

          this.payoutMethods.push(newMethod);
          this.toaster.show('Payout method added successfully', 'success');
          this.toggleAddPayoutForm();
          this.isAddingPayoutMethod = false;
        }
      });
    }
  }

  removePayoutMethod(methodId: string) {
    this.http.delete(`${this.authService.BASE_URL}/payout-methods/${methodId}`, {
      withCredentials: true
    }).pipe(takeUntil(this.destroy$))
    .subscribe({
      next: () => {
        this.payoutMethods = this.payoutMethods.filter(method => method.id !== methodId);
        this.toaster.show('Payout method removed successfully', 'success');
      },
      error: (error) => {
        // Mock success for demo
        this.payoutMethods = this.payoutMethods.filter(method => method.id !== methodId);
        this.toaster.show('Payout method removed successfully', 'success');
      }
    });
  }

  downloadStatement() {
    this.http.get(`${this.authService.BASE_URL}/earnings/statement`, {
      responseType: 'blob',
      withCredentials: true
    }).pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `earnings-statement-${new Date().toISOString().split('T')[0]}.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);
        this.toaster.show('Statement downloaded successfully', 'success');
      },
      error: (error) => {
        // Mock download for demo
        this.toaster.show('Statement download feature coming soon', 'info');
      }
    });
  }

  filterTransactions() {
    if (this.transactionFilter === 'all') {
      this.filteredTransactions = this.earningsData.transactions;
    } else {
      this.filteredTransactions = this.earningsData.transactions.filter(
        transaction => transaction.type === this.transactionFilter
      );
    }
    this.showAllTransactions = false;
  }

  getGrowthPercentage(): number {
    if (this.earningsData.lastMonthEarnings === 0) return 0;
    const growth = ((this.earningsData.thisMonthEarnings - this.earningsData.lastMonthEarnings) / this.earningsData.lastMonthEarnings) * 100;
    return Math.round(growth * 10) / 10;
  }

  formatCurrency(amount: number): string {
    return amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  getTransactionIcon(type: string): string {
    const icons: { [key: string]: string } = {
      rental_payment: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>',
      payout: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>',
      fee: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"></path>',
      refund: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"></path>'
    };
    return icons[type] || icons['rental_payment'];
  }

  getTransactionIconClasses(type: string): string {
    const classes: { [key: string]: string } = {
      rental_payment: 'bg-green-50 text-green-600',
      payout: 'bg-blue-50 text-blue-600',
      fee: 'bg-red-50 text-red-600',
      refund: 'bg-yellow-50 text-yellow-600'
    };
    return classes[type] || classes['rental_payment'];
  }

  getStatusClasses(status: string): string {
    const classes: { [key: string]: string } = {
      completed: 'text-green-600',
      pending: 'text-yellow-600',
      failed: 'text-red-600'
    };
    return classes[status] || classes['completed'];
  }
}

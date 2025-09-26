import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Subject, takeUntil } from 'rxjs';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  emailVerified: boolean;
  phoneNumber?: string;
  createdAt: Date;
  status: 'active' | 'suspended' | 'banned';
  totalListings: number;
  totalRentals: number;
  reportCount: number;
}

interface Listing {
  id: string;
  title: string;
  category: string;
  pricePerDay: number;
  owner: {
    firstName: string;
    lastName: string;
    email: string;
  };
  status: 'active' | 'inactive' | 'reported' | 'banned';
  createdAt: Date;
  totalRentals: number;
  reportCount: number;
  availability: 'available' | 'rented' | 'maintenance';
}

interface Activity {
  id: string;
  type: 'user_registration' | 'listing_created' | 'rental_completed' | 'report_submitted' | 'payment_processed';
  description: string;
  user: {
    firstName: string;
    lastName: string;
  };
  timestamp: Date;
  metadata?: any;
}

interface Report {
  id: string;
  type: 'user' | 'listing';
  reportedId: string;
  reportedBy: {
    firstName: string;
    lastName: string;
  };
  reason: string;
  description: string;
  status: 'pending' | 'resolved' | 'dismissed';
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
  reportedEntity?: User | Listing;
}

interface PlatformStats {
  totalUsers: number;
  totalListings: number;
  activeRentals: number;
  totalReports: number;
  activeUsers: number;
  pendingReports: number;
  platformCommission: number;
  userGrowth: number;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-slate-50 p-6">
      <div class="max-w-7xl mx-auto">
        <!-- Header -->
        <div class="mb-8">
          <h1 class="text-4xl font-bold text-slate-900 mb-2">Platform Administration</h1>
          <p class="text-slate-600">Manage users, listings, and monitor rental platform activity</p>
        </div>

        <!-- Stats Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div class="stats shadow-sm bg-white border border-slate-200">
            <div class="stat">
              <div class="stat-figure text-slate-600">
                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
              </div>
              <div class="stat-title text-slate-600">Total Users</div>
              <div class="stat-value text-slate-900">{{ stats().totalUsers | number }}</div>
              <div class="stat-desc text-emerald-600">
                <span class="font-medium">+{{ stats().userGrowth }}%</span> from last month
              </div>
            </div>
          </div>

          <div class="stats shadow-sm bg-white border border-slate-200">
            <div class="stat">
              <div class="stat-figure text-slate-600">
                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                </svg>
              </div>
              <div class="stat-title text-slate-600">Active Listings</div>
              <div class="stat-value text-slate-900">{{ stats().totalListings | number }}</div>
              <div class="stat-desc text-slate-500">{{ stats().activeUsers }} active owners</div>
            </div>
          </div>

          <div class="stats shadow-sm bg-white border border-slate-200">
            <div class="stat">
              <div class="stat-figure text-slate-600">
                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path>
                </svg>
              </div>
              <div class="stat-title text-slate-600">Active Rentals</div>
              <div class="stat-value text-slate-900">{{ stats().activeRentals | number }}</div>
              <div class="stat-desc text-slate-500">Currently ongoing</div>
            </div>
          </div>

          <div class="stats shadow-sm bg-white border border-slate-200">
            <div class="stat">
              <div class="stat-figure text-orange-500">
                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z"></path>
                </svg>
              </div>
              <div class="stat-title text-slate-600">Pending Reports</div>
              <div class="stat-value text-slate-900">{{ stats().pendingReports | number }}</div>
              <div class="stat-desc text-slate-500">{{ stats().totalReports }} total reports</div>
            </div>
          </div>
        </div>

        <!-- Navigation Tabs -->
        <div class="tabs tabs-boxed bg-white shadow-sm border border-slate-200 mb-6 p-1">
          @for (tab of tabs; track tab.id) {
            <button
              (click)="activeTab.set(tab.id)"
              class="tab transition-colors duration-200"
              [class.tab-active]="activeTab() === tab.id"
              [class.bg-slate-700]="activeTab() === tab.id"
              [class.text-white]="activeTab() === tab.id"
              [class.text-slate-600]="activeTab() !== tab.id"
            >
              {{ tab.label }}
            </button>
          }
        </div>

        <!-- Users Management -->
        @if (activeTab() === 'users') {
          <div class="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <div class="flex justify-between items-center mb-6">
              <h2 class="text-2xl font-bold text-slate-900">User Management</h2>
              <div class="join">
                <input
                  type="text"
                  placeholder="Search users..."
                  class="input input-bordered join-item w-64 border-slate-300 focus:border-slate-500"
                  [(ngModel)]="userSearchTerm"
                  (ngModelChange)="searchUsers()"
                />
                <button class="btn join-item bg-slate-700 hover:bg-slate-800 text-white border-slate-700">Search</button>
              </div>
            </div>

            <div class="overflow-x-auto">
              <table class="table table-zebra">
                <thead class="bg-slate-100">
                  <tr class="text-slate-700">
                    <th>User</th>
                    <th>Email</th>
                    <th>Status</th>
                    <th>Listings</th>
                    <th>Reports</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  @for (user of filteredUsers(); track user.id) {
                    <tr class="hover:bg-slate-50">
                      <td>
                        <div class="flex items-center space-x-3">
                          <div class="avatar placeholder">
                            <div class="bg-slate-600 text-white rounded-full w-12 text-sm">
                              <span>{{ user.firstName.charAt(0) + user.lastName.charAt(0) }}</span>
                            </div>
                          </div>
                          <div>
                            <div class="font-bold text-slate-900">{{ user.firstName }} {{ user.lastName }}</div>
                            @if (user.phoneNumber) {
                              <div class="text-sm text-slate-500">{{ user.phoneNumber }}</div>
                            }
                          </div>
                        </div>
                      </td>
                      <td class="text-slate-700">
                        {{ user.email }}
                        @if (user.emailVerified) {
                          <span class="badge badge-success badge-xs ml-2">Verified</span>
                        } @else {
                          <span class="badge badge-warning badge-xs ml-2">Unverified</span>
                        }
                      </td>
                      <td>
                        <span class="badge" [class]="getUserStatusClass(user.status)">
                          {{ user.status | titlecase }}
                        </span>
                      </td>
                      <td class="text-slate-700">{{ user.totalListings }}</td>
                      <td>
                        @if (user.reportCount > 0) {
                          <span class="badge badge-error">{{ user.reportCount }}</span>
                        } @else {
                          <span class="text-slate-500">0</span>
                        }
                      </td>
                      <td class="text-slate-600">{{ user.createdAt | date:'short' }}</td>
                      <td>
                        <div class="dropdown dropdown-end">
                          <button class="btn btn-sm btn-ghost text-slate-600 hover:text-slate-900" tabindex="0">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zM12 13a1 1 0 110-2 1 1 0 010 2zM12 20a1 1 0 110-2 1 1 0 010 2z"></path>
                            </svg>
                          </button>
                          <ul class="dropdown-content menu p-2 shadow-lg bg-white rounded-box w-52 border border-slate-200">
                            <li><button (click)="viewUser(user)" class="text-slate-700 hover:text-slate-900">View Details</button></li>
                            @if (user.status === 'active') {
                              <li><button (click)="suspendUser(user)" class="text-orange-600 hover:text-orange-700">Suspend</button></li>
                            }
                            @if (user.status === 'suspended') {
                              <li><button (click)="activateUser(user)" class="text-emerald-600 hover:text-emerald-700">Activate</button></li>
                            }
                            <li><button (click)="banUser(user)" class="text-red-600 hover:text-red-700">Ban</button></li>
                          </ul>
                        </div>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        }

        <!-- Listings Management -->
        @if (activeTab() === 'listings') {
          <div class="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <div class="flex justify-between items-center mb-6">
              <h2 class="text-2xl font-bold text-slate-900">Listing Management</h2>
              <div class="join">
                <input
                  type="text"
                  placeholder="Search listings..."
                  class="input input-bordered join-item w-64 border-slate-300 focus:border-slate-500"
                  [(ngModel)]="listingSearchTerm"
                  (ngModelChange)="searchListings()"
                />
                <select class="select select-bordered join-item border-slate-300 focus:border-slate-500">
                  <option value="">All Categories</option>
                  <option value="electronics">Electronics</option>
                  <option value="tools">Tools</option>
                  <option value="vehicles">Vehicles</option>
                  <option value="furniture">Furniture</option>
                  <option value="sports">Sports Equipment</option>
                </select>
              </div>
            </div>

            <div class="overflow-x-auto">
              <table class="table table-zebra">
                <thead class="bg-slate-100">
                  <tr class="text-slate-700">
                    <th>Listing</th>
                    <th>Owner</th>
                    <th>Price/Day</th>
                    <th>Status</th>
                    <th>Availability</th>
                    <th>Reports</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  @for (listing of filteredListings(); track listing.id) {
                    <tr class="hover:bg-slate-50">
                      <td>
                        <div>
                          <div class="font-bold text-slate-900">{{ listing.title }}</div>
                          <div class="text-sm text-slate-500">{{ listing.category | titlecase }}</div>
                        </div>
                      </td>
                      <td>
                        <div>
                          <div class="font-medium text-slate-900">{{ listing.owner.firstName }} {{ listing.owner.lastName }}</div>
                          <div class="text-sm text-slate-500">{{ listing.owner.email }}</div>
                        </div>
                      </td>
                      <td class="font-bold text-slate-900">Rs{{ listing.pricePerDay }}</td>
                      <td>
                        <span class="badge" [class]="getListingStatusClass(listing.status)">
                          {{ listing.status | titlecase }}
                        </span>
                      </td>
                      <td>
                        <span class="badge" [class]="getAvailabilityClass(listing.availability)">
                          {{ listing.availability | titlecase }}
                        </span>
                      </td>
                      <td>
                        @if (listing.reportCount > 0) {
                          <span class="badge badge-error">{{ listing.reportCount }}</span>
                        } @else {
                          <span class="text-slate-500">0</span>
                        }
                      </td>
                      <td class="text-slate-600">{{ listing.createdAt | date:'short' }}</td>
                      <td>
                        <div class="dropdown dropdown-end">
                          <button class="btn btn-sm btn-ghost text-slate-600 hover:text-slate-900" tabindex="0">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zM12 13a1 1 0 110-2 1 1 0 010 2zM12 20a1 1 0 110-2 1 1 0 010 2z"></path>
                            </svg>
                          </button>
                          <ul class="dropdown-content menu p-2 shadow-lg bg-white rounded-box w-52 border border-slate-200">
                            <li><button (click)="viewListing(listing)" class="text-slate-700 hover:text-slate-900">View Details</button></li>
                            @if (listing.status === 'active') {
                              <li><button (click)="deactivateListing(listing)" class="text-orange-600 hover:text-orange-700">Deactivate</button></li>
                            }
                            @if (listing.status === 'inactive') {
                              <li><button (click)="activateListing(listing)" class="text-emerald-600 hover:text-emerald-700">Activate</button></li>
                            }
                            <li><button (click)="banListing(listing)" class="text-red-600 hover:text-red-700">Ban</button></li>
                          </ul>
                        </div>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        }

        <!-- Activities -->
        @if (activeTab() === 'activities') {
          <div class="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <div class="flex justify-between items-center mb-6">
              <h2 class="text-2xl font-bold text-slate-900">Recent Activities</h2>
              <select
                class="select select-bordered border-slate-300 focus:border-slate-500"
                [(ngModel)]="activityFilter"
                (ngModelChange)="filterActivities()"
              >
                <option value="">All Activities</option>
                <option value="user_registration">User Registrations</option>
                <option value="listing_created">Listings Created</option>
                <option value="rental_completed">Rentals Completed</option>
                <option value="report_submitted">Reports Submitted</option>
                <option value="payment_processed">Payments Processed</option>
              </select>
            </div>

            <div class="space-y-4">
              @for (activity of filteredActivities(); track activity.id) {
                <div class="alert shadow-sm bg-slate-50 border border-slate-200">
                  <div class="flex items-start space-x-4 w-full">
                    <div class="avatar placeholder">
                      <div class="bg-slate-600 text-white rounded-full w-10">
                        <span class="text-sm">{{ activity.user.firstName.charAt(0) }}</span>
                      </div>
                    </div>
                    <div class="flex-1">
                      <div class="font-medium text-slate-900">{{ activity.description }}</div>
                      <div class="text-sm text-slate-500 mt-1">
                        by {{ activity.user.firstName }} {{ activity.user.lastName }} •
                        {{ activity.timestamp | date:'short' }}
                      </div>
                    </div>
                    <div class="badge" [class]="getActivityBadgeClass(activity.type)">
                      {{ activity.type.replace('_', ' ') | titlecase }}
                    </div>
                  </div>
                </div>
              }
            </div>
          </div>
        }

        <!-- Reports -->
        @if (activeTab() === 'reports') {
          <div class="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <div class="flex justify-between items-center mb-6">
              <h2 class="text-2xl font-bold text-slate-900">Reports Management</h2>
              <div class="join">
                <select
                  class="select select-bordered join-item border-slate-300 focus:border-slate-500"
                  [(ngModel)]="reportFilter"
                  (ngModelChange)="filterReports()"
                >
                  <option value="">All Reports</option>
                  <option value="pending">Pending</option>
                  <option value="resolved">Resolved</option>
                  <option value="dismissed">Dismissed</option>
                </select>
                <select class="select select-bordered join-item border-slate-300 focus:border-slate-500">
                  <option value="">All Priorities</option>
                  <option value="high">High Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="low">Low Priority</option>
                </select>
              </div>
            </div>

            <div class="grid gap-4">
              @for (report of filteredReports(); track report.id) {
                <div class="card bg-slate-50 shadow-sm border border-slate-200">
                  <div class="card-body">
                    <div class="flex justify-between items-start">
                      <div class="flex-1">
                        <div class="flex items-center space-x-2 mb-2">
                          <span class="badge badge-outline border-slate-300 text-slate-700">{{ report.type | titlecase }}</span>
                          <span class="badge" [class]="getReportStatusClass(report.status)">
                            {{ report.status | titlecase }}
                          </span>
                          <span class="badge" [class]="getPriorityClass(report.priority)">
                            {{ report.priority | titlecase }}
                          </span>
                        </div>
                        <h3 class="font-bold text-lg text-slate-900">{{ report.reason }}</h3>
                        <p class="text-sm text-slate-600 mb-3">{{ report.description }}</p>
                        <div class="text-sm text-slate-500">
                          <span class="font-medium">Reported by:</span>
                          {{ report.reportedBy.firstName }} {{ report.reportedBy.lastName }}
                          <span class="mx-2">•</span>
                          <span>{{ report.createdAt | date:'short' }}</span>
                        </div>
                      </div>
                      @if (report.status === 'pending') {
                        <div class="flex space-x-2">
                          <button (click)="resolveReport(report)" class="btn btn-success btn-sm">Resolve</button>
                          <button (click)="dismissReport(report)" class="btn btn-warning btn-sm">Dismiss</button>
                          <button (click)="viewReportDetails(report)" class="btn btn-ghost btn-sm text-slate-600">Details</button>
                        </div>
                      }
                    </div>
                  </div>
                </div>
              }
            </div>
          </div>
        }

        <!-- Analytics -->
        @if (activeTab() === 'analytics') {
          <div class="space-y-6">
            <!-- Platform Performance -->
            <div class="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
              <h3 class="text-xl font-bold text-slate-900 mb-4">Platform Performance</h3>
              <div class="h-64 flex items-center justify-center bg-slate-50 rounded border border-slate-200">
                <p class="text-slate-500">Platform analytics chart would be implemented here</p>
              </div>
            </div>

            <!-- User Growth Chart -->
            <div class="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
              <h3 class="text-xl font-bold text-slate-900 mb-4">User Growth</h3>
              <div class="h-64 flex items-center justify-center bg-slate-50 rounded border border-slate-200">
                <p class="text-slate-500">User growth chart would be implemented here</p>
              </div>
            </div>

            <!-- Category Performance -->
            <div class="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
              <h3 class="text-xl font-bold text-slate-900 mb-4">Category Performance</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                @for (category of categoryStats; track category.name) {
                  <div class="stats shadow-sm bg-slate-50 border border-slate-200">
                    <div class="stat">
                      <div class="stat-title text-slate-600">{{ category.name }}</div>
                      <div class="stat-value text-sm text-slate-900">{{ category.listings }} listings</div>
                      <div class="stat-desc text-slate-500">{{ category.activeRentals }} active rentals</div>
                    </div>
                  </div>
                }
              </div>
            </div>
          </div>
        }
      </div>
    </div>
  `
})
export class AdminDashboardComponent implements OnInit, OnDestroy {
  activeTab = signal('users');
  private destroy$ = new Subject<void>();

  // Search terms
  userSearchTerm = '';
  listingSearchTerm = '';
  activityFilter = '';
  reportFilter = '';

  // Data signals
  stats = signal<PlatformStats>({
    totalUsers: 1247,
    totalListings: 856,
    activeRentals: 432,
    totalReports: 23,
    activeUsers: 892,
    pendingReports: 8,
    platformCommission: 15420,
    userGrowth: 12.5
  });

  users = signal<User[]>([]);
  filteredUsers = signal<User[]>([]);

  listings = signal<Listing[]>([]);
  filteredListings = signal<Listing[]>([]);

  activities = signal<Activity[]>([]);
  filteredActivities = signal<Activity[]>([]);

  reports = signal<Report[]>([]);
  filteredReports = signal<Report[]>([]);

  categoryStats = [
    { name: 'Electronics', listings: 245, activeRentals: 89 },
    { name: 'Tools', listings: 189, activeRentals: 56 },
    { name: 'Vehicles', listings: 156, activeRentals: 78 },
    { name: 'Furniture', listings: 134, activeRentals: 34 },
    { name: 'Sports Equipment', listings: 98, activeRentals: 23 },
    { name: 'Appliances', listings: 76, activeRentals: 19 }
  ];

  tabs = [
    { id: 'users', label: 'Users' },
    { id: 'listings', label: 'Listings' },
    { id: 'activities', label: 'Activities' },
    { id: 'reports', label: 'Reports' },
    { id: 'analytics', label: 'Analytics' }
  ];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadMockData();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadMockData() {
    // Mock users data
    const mockUsers: User[] = [
      {
        id: '1',
        firstName: 'Ahmed',
        lastName: 'Khan',
        email: 'ahmed.khan@example.com',
        emailVerified: true,
        phoneNumber: '+92-300-1234567',
        createdAt: new Date('2024-01-15'),
        status: 'active',
        totalListings: 5,
        totalRentals: 12,
        reportCount: 0
      },
      {
        id: '2',
        firstName: 'Fatima',
        lastName: 'Ali',
        email: 'fatima.ali@example.com',
        emailVerified: false,
        phoneNumber: '+92-301-7654321',
        createdAt: new Date('2024-02-20'),
        status: 'suspended',
        totalListings: 3,
        totalRentals: 8,
        reportCount: 2
      },
      {
        id: '3',
        firstName: 'Hassan',
        lastName: 'Sheikh',
        email: 'hassan.sheikh@example.com',
        emailVerified: true,
        createdAt: new Date('2024-03-10'),
        status: 'active',
        totalListings: 8,
        totalRentals: 25,
        reportCount: 0
      }
    ];

    // Mock listings data
    const mockListings: Listing[] = [
      {
        id: '1',
        title: 'Professional DSLR Camera Kit',
        category: 'electronics',
        pricePerDay: 150,
        owner: {
          firstName: 'Ahmed',
          lastName: 'Khan',
          email: 'ahmed.khan@example.com'
        },
        status: 'active',
        createdAt: new Date('2024-01-20'),
        totalRentals: 8,
        reportCount: 0,
        availability: 'available'
      },
      {
        id: '2',
        title: 'Power Drill Set',
        category: 'tools',
        pricePerDay: 75,
        owner: {
          firstName: 'Hassan',
          lastName: 'Sheikh',
          email: 'hassan.sheikh@example.com'
        },
        status: 'active',
        createdAt: new Date('2024-02-15'),
        totalRentals: 15,
        reportCount: 0,
        availability: 'rented'
      },
      {
        id: '3',
        title: 'Mountain Bike',
        category: 'vehicles',
        pricePerDay: 200,
        owner: {
          firstName: 'Fatima',
          lastName: 'Ali',
          email: 'fatima.ali@example.com'
        },
        status: 'reported',
        createdAt: new Date('2024-03-01'),
        totalRentals: 3,
        reportCount: 1,
        availability: 'maintenance'
      }
    ];

    // Mock activities
    const mockActivities: Activity[] = [
      {
        id: '1',
        type: 'user_registration',
        description: 'New user registered on the platform',
        user: { firstName: 'Sara', lastName: 'Ahmed' },
        timestamp: new Date(Date.now() - 1000 * 60 * 30) // 30 minutes ago
      },
      {
        id: '2',
        type: 'listing_created',
        description: 'Created new listing "Gaming Console PS5"',
        user: { firstName: 'Ali', lastName: 'Hassan' },
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2) // 2 hours ago
      },
      {
        id: '3',
        type: 'rental_completed',
        description: 'Completed rental for "Professional Camera"',
        user: { firstName: 'Zain', lastName: 'Malik' },
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4) // 4 hours ago
      },
      {
        id: '4',
        type: 'payment_processed',
        description: 'Payment processed for rental transaction',
        user: { firstName: 'Ayesha', lastName: 'Khan' },
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6) // 6 hours ago
      },
      {
        id: '5',
        type: 'report_submitted',
        description: 'Report submitted against user behavior',
        user: { firstName: 'Omar', lastName: 'Sheikh' },
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8) // 8 hours ago
      }
    ];

    // Mock reports
    const mockReports: Report[] = [
      {
        id: '1',
        type: 'user',
        reportedId: '2',
        reportedBy: { firstName: 'Ahmed', lastName: 'Khan' },
        reason: 'Inappropriate behavior during rental',
        description: 'User was rude and uncooperative during the rental handover process. Did not follow agreed terms.',
        status: 'pending',
        priority: 'high',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12) // 12 hours ago
      },
      {
        id: '2',
        type: 'listing',
        reportedId: '3',
        reportedBy: { firstName: 'Hassan', lastName: 'Sheikh' },
        reason: 'Misleading item description',
        description: 'The bike condition was much worse than described. Several parts were damaged.',
        status: 'pending',
        priority: 'medium',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 18) // 18 hours ago
      },
      {
        id: '3',
        type: 'user',
        reportedId: '1',
        reportedBy: { firstName: 'Fatima', lastName: 'Ali' },
        reason: 'Late return of item',
        description: 'User returned the camera 2 days late without prior notice or communication.',
        status: 'resolved',
        priority: 'low',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2) // 2 days ago
      },
      {
        id: '4',
        type: 'listing',
        reportedId: '1',
        reportedBy: { firstName: 'Sara', lastName: 'Ahmed' },
        reason: 'Safety concerns',
        description: 'The camera equipment appears to have electrical issues that could be dangerous.',
        status: 'dismissed',
        priority: 'high',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3) // 3 days ago
      }
    ];

    this.users.set(mockUsers);
    this.filteredUsers.set(mockUsers);

    this.listings.set(mockListings);
    this.filteredListings.set(mockListings);

    this.activities.set(mockActivities);
    this.filteredActivities.set(mockActivities);

    this.reports.set(mockReports);
    this.filteredReports.set(mockReports);
  }

  // User management methods
  searchUsers() {
    const filtered = this.users().filter(user =>
      user.firstName.toLowerCase().includes(this.userSearchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(this.userSearchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(this.userSearchTerm.toLowerCase())
    );
    this.filteredUsers.set(filtered);
  }

  suspendUser(user: User) {
    // API call would go here
    const users = this.users();
    const index = users.findIndex(u => u.id === user.id);
    if (index !== -1) {
      users[index].status = 'suspended';
      this.users.set([...users]);
      this.searchUsers(); // Refresh filtered list
    }
    console.log('Suspending user:', user);
  }

  activateUser(user: User) {
    // API call would go here
    const users = this.users();
    const index = users.findIndex(u => u.id === user.id);
    if (index !== -1) {
      users[index].status = 'active';
      this.users.set([...users]);
      this.searchUsers(); // Refresh filtered list
    }
    console.log('Activating user:', user);
  }

  banUser(user: User) {
    // API call would go here
    const users = this.users();
    const index = users.findIndex(u => u.id === user.id);
    if (index !== -1) {
      users[index].status = 'banned';
      this.users.set([...users]);
      this.searchUsers(); // Refresh filtered list
    }
    console.log('Banning user:', user);
  }

  viewUser(user: User) {
    console.log('Viewing user details:', user);
    // Navigate to user detail view or open modal
  }

  // Listing management methods
  searchListings() {
    const filtered = this.listings().filter(listing =>
      listing.title.toLowerCase().includes(this.listingSearchTerm.toLowerCase()) ||
      listing.category.toLowerCase().includes(this.listingSearchTerm.toLowerCase())
    );
    this.filteredListings.set(filtered);
  }

  deactivateListing(listing: Listing) {
    const listings = this.listings();
    const index = listings.findIndex(l => l.id === listing.id);
    if (index !== -1) {
      listings[index].status = 'inactive';
      this.listings.set([...listings]);
      this.searchListings(); // Refresh filtered list
    }
    console.log('Deactivating listing:', listing);
  }

  activateListing(listing: Listing) {
    const listings = this.listings();
    const index = listings.findIndex(l => l.id === listing.id);
    if (index !== -1) {
      listings[index].status = 'active';
      this.listings.set([...listings]);
      this.searchListings(); // Refresh filtered list
    }
    console.log('Activating listing:', listing);
  }

  banListing(listing: Listing) {
    const listings = this.listings();
    const index = listings.findIndex(l => l.id === listing.id);
    if (index !== -1) {
      listings[index].status = 'banned';
      this.listings.set([...listings]);
      this.searchListings(); // Refresh filtered list
    }
    console.log('Banning listing:', listing);
  }

  viewListing(listing: Listing) {
    console.log('Viewing listing details:', listing);
    // Navigate to listing detail view or open modal
  }

  // Activity filtering
  filterActivities() {
    if (this.activityFilter) {
      const filtered = this.activities().filter(activity =>
        activity.type === this.activityFilter
      );
      this.filteredActivities.set(filtered);
    } else {
      this.filteredActivities.set([...this.activities()]);
    }
  }

  // Report management
  filterReports() {
    if (this.reportFilter) {
      const filtered = this.reports().filter(report =>
        report.status === this.reportFilter
      );
      this.filteredReports.set(filtered);
    } else {
      this.filteredReports.set([...this.reports()]);
    }
  }

  resolveReport(report: Report) {
    const reports = this.reports();
    const index = reports.findIndex(r => r.id === report.id);
    if (index !== -1) {
      reports[index].status = 'resolved';
      this.reports.set([...reports]);
      this.filterReports(); // Refresh filtered list
    }
    console.log('Resolving report:', report);
  }

  dismissReport(report: Report) {
    const reports = this.reports();
    const index = reports.findIndex(r => r.id === report.id);
    if (index !== -1) {
      reports[index].status = 'dismissed';
      this.reports.set([...reports]);
      this.filterReports(); // Refresh filtered list
    }
    console.log('Dismissing report:', report);
  }

  viewReportDetails(report: Report) {
    console.log('Viewing report details:', report);
    // Navigate to report detail view or open modal
  }

  // Utility methods for CSS classes
  getUserStatusClass(status: string): string {
    switch (status) {
      case 'active': return 'badge-success';
      case 'suspended': return 'badge-warning';
      case 'banned': return 'badge-error';
      default: return 'badge-ghost';
    }
  }

  getListingStatusClass(status: string): string {
    switch (status) {
      case 'active': return 'badge-success';
      case 'inactive': return 'badge-warning';
      case 'reported': return 'badge-error';
      case 'banned': return 'badge-error';
      default: return 'badge-ghost';
    }
  }

  getAvailabilityClass(availability: string): string {
    switch (availability) {
      case 'available': return 'badge-success';
      case 'rented': return 'badge-info';
      case 'maintenance': return 'badge-warning';
      default: return 'badge-ghost';
    }
  }

  getActivityBadgeClass(type: string): string {
    switch (type) {
      case 'user_registration': return 'badge-primary';
      case 'listing_created': return 'badge-secondary';
      case 'rental_completed': return 'badge-success';
      case 'report_submitted': return 'badge-warning';
      case 'payment_processed': return 'badge-info';
      default: return 'badge-ghost';
    }
  }

  getReportStatusClass(status: string): string {
    switch (status) {
      case 'pending': return 'badge-warning';
      case 'resolved': return 'badge-success';
      case 'dismissed': return 'badge-ghost';
      default: return 'badge-ghost';
    }
  }

  getPriorityClass(priority: string): string {
    switch (priority) {
      case 'high': return 'badge-error';
      case 'medium': return 'badge-warning';
      case 'low': return 'badge-info';
      default: return 'badge-ghost';
    }
  }
}

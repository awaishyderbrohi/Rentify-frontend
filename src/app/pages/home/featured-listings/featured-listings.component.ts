import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface ListingItem {
  id: string;
  title: string;
  category: string;
  price: number;
  priceUnit: string;
  location: string;
  rating: number;
  reviewCount: number;
  image: string;
  badge?: string;
  badgeType?: 'featured' | 'popular' | 'new';
  owner: {
    name: string;
    avatar: string;
    verified: boolean;
  };
  features: string[];
}

@Component({
  selector: 'app-featured-listings',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="py-16 px-4 bg-base-100">
      <div class="max-w-7xl mx-auto">
        <!-- Section Header -->
        <div class="text-center mb-12">
          <div class="badge badge-primary badge-lg mb-4">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
            </svg>
            Featured Equipment
          </div>

          <h2 class="text-4xl lg:text-5xl font-bold text-base-content mb-4">
            Premium Equipment Ready to Rent
          </h2>

          <p class="text-lg text-base-content opacity-70 max-w-2xl mx-auto">
            Hand-picked professional equipment from verified owners. All items are fully insured and quality-checked.
          </p>
        </div>

        <!-- Filter Tabs -->
        <div class="flex justify-center mb-12">
          <div class="tabs tabs-boxed bg-base-200">
            <button
              *ngFor="let category of categories; trackBy: trackByCategory"
              class="tab"
              [class.tab-active]="selectedCategory === category"
              (click)="selectCategory(category)"
            >
              {{category}}
            </button>
          </div>
        </div>

        <!-- Listings Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
          <div
            *ngFor="let listing of filteredListings; trackBy: trackByListing"
            class="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300 border border-base-300 group hover:scale-105"
          >
            <!-- Image Container -->
            <figure class="relative overflow-hidden">
              <img
                [src]="listing.image"
                [alt]="listing.title"
                class="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
              />

              <!-- Badge -->
              <div
                *ngIf="listing.badge"
                class="badge absolute top-3 left-3"
                [ngClass]="{
                  'badge-primary': listing.badgeType === 'featured',
                  'badge-secondary': listing.badgeType === 'popular',
                  'badge-accent': listing.badgeType === 'new'
                }"
              >
                {{listing.badge}}
              </div>

              <!-- Heart Icon -->
              <button class="btn btn-circle btn-sm absolute top-3 right-3 bg-base-100 bg-opacity-80 border-0 hover:bg-opacity-100 transition-all">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                </svg>
              </button>
            </figure>

            <div class="card-body p-4">
              <!-- Category -->
              <div class="badge badge-outline badge-sm mb-2">{{listing.category}}</div>

              <!-- Title -->
              <h3 class="card-title text-base font-bold text-base-content line-clamp-2 mb-2">
                {{listing.title}}
              </h3>

              <!-- Features -->
              <div class="flex flex-wrap gap-1 mb-3">
                <span
                  *ngFor="let feature of listing.features.slice(0, 2)"
                  class="badge badge-ghost badge-xs"
                >
                  {{feature}}
                </span>
                <span
                  *ngIf="listing.features.length > 2"
                  class="badge badge-ghost badge-xs"
                >
                  +{{listing.features.length - 2}} more
                </span>
              </div>

              <!-- Rating & Location -->
              <div class="flex items-center justify-between text-sm mb-3">
                <div class="flex items-center text-warning">
                  <svg class="w-4 h-4 mr-1 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                  <span class="font-semibold">{{listing.rating}}</span>
                  <span class="text-base-content opacity-60 ml-1">({{listing.reviewCount}})</span>
                </div>

                <div class="flex items-center text-base-content opacity-60">
                  <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  </svg>
                  <span class="text-xs">{{listing.location}}</span>
                </div>
              </div>

              <!-- Owner Info -->
              <div class="flex items-center mb-4">
                <div class="avatar">
                  <div class="w-6 h-6 rounded-full">
                    <img [src]="listing.owner.avatar" [alt]="listing.owner.name" />
                  </div>
                </div>
                <span class="text-sm text-base-content opacity-70 ml-2">{{listing.owner.name}}</span>
                <svg
                  *ngIf="listing.owner.verified"
                  class="w-4 h-4 text-primary ml-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                </svg>
              </div>

              <!-- Price & CTA -->
              <div class="card-actions justify-between items-center">
                <div class="text-left">
                  <div class="text-2xl font-bold text-primary">
                    \${{listing.price}}
                    <span class="text-sm font-normal text-base-content opacity-60">/{{listing.priceUnit}}</span>
                  </div>
                </div>

                <button class="btn btn-primary btn-sm">
                  Rent Now
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- View All Button -->
        <div class="text-center">
          <button class="btn btn-outline btn-lg hover:btn-primary group">
            View All Equipment
            <svg class="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path>
            </svg>
          </button>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .group:hover .group-hover\\:scale-110 {
      transform: scale(1.1);
    }

    .group:hover .group-hover\\:translate-x-1 {
      transform: translateX(0.25rem);
    }

    .card:hover {
      transform: translateY(-4px);
    }
  `]
})
export class FeaturedListingsComponent {
  selectedCategory = 'All';

  categories = ['All', 'Photography', 'Tools', 'Vehicles', 'Audio', 'Sports'];

  listings: ListingItem[] = [
    {
      id: '1',
      title: 'Canon EOS R5 Mirrorless Camera Kit',
      category: 'Photography',
      price: 89,
      priceUnit: 'day',
      location: 'New York, NY',
      rating: 4.9,
      reviewCount: 127,
      image: 'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=400&h=300&fit=crop',
      badge: 'Featured',
      badgeType: 'featured',
      owner: {
        name: 'Alex Chen',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
        verified: true
      },
      features: ['42MP Full Frame', '8K Video', '5-Axis Stabilization', 'Dual Memory Cards']
    },
    {
      id: '2',
      title: 'Professional Drill Set with Bits',
      category: 'Tools',
      price: 25,
      priceUnit: 'day',
      location: 'Los Angeles, CA',
      rating: 4.8,
      reviewCount: 89,
      image: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&h=300&fit=crop',
      badge: 'Popular',
      badgeType: 'popular',
      owner: {
        name: 'Mike Torres',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face',
        verified: true
      },
      features: ['Cordless', '18V Battery', '50+ Bits', 'Carrying Case']
    },
    {
      id: '3',
      title: 'Tesla Model 3 Performance',
      category: 'Vehicles',
      price: 199,
      priceUnit: 'day',
      location: 'San Francisco, CA',
      rating: 5.0,
      reviewCount: 45,
      image: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=400&h=300&fit=crop',
      badge: 'New',
      badgeType: 'new',
      owner: {
        name: 'Sarah Kim',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face',
        verified: true
      },
      features: ['Autopilot', '0-60 in 3.1s', 'Supercharging', 'Premium Interior']
    },
    {
      id: '4',
      title: 'Yamaha HS8 Studio Monitors (Pair)',
      category: 'Audio',
      price: 45,
      priceUnit: 'day',
      location: 'Nashville, TN',
      rating: 4.7,
      reviewCount: 73,
      image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop',
      owner: {
        name: 'James Wilson',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop&crop=face',
        verified: false
      },
      features: ['8-inch Woofer', 'Bi-amp Design', 'Room Control', 'XLR/TRS Inputs']
    },
    {
      id: '5',
      title: 'DJI Mavic 3 Cine Premium Combo',
      category: 'Photography',
      price: 125,
      priceUnit: 'day',
      location: 'Miami, FL',
      rating: 4.9,
      reviewCount: 156,
      image: 'https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=400&h=300&fit=crop',
      badge: 'Featured',
      badgeType: 'featured',
      owner: {
        name: 'Elena Rodriguez',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b19c?w=40&h=40&fit=crop&crop=face',
        verified: true
      },
      features: ['4/3 CMOS Sensor', '5.1K Video', '46-min Flight', 'Obstacle Sensing']
    },
    {
      id: '6',
      title: 'Professional Mountain Bike',
      category: 'Sports',
      price: 35,
      priceUnit: 'day',
      location: 'Denver, CO',
      rating: 4.6,
      reviewCount: 92,
      image: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=300&fit=crop',
      owner: {
        name: 'Ryan Martinez',
        avatar: 'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=40&h=40&fit=crop&crop=face',
        verified: true
      },
      features: ['Full Suspension', '29" Wheels', 'Shimano Gears', 'Hydraulic Brakes']
    },
    {
      id: '7',
      title: 'MacBook Pro M3 Max 16" Laptop',
      category: 'Photography',
      price: 75,
      priceUnit: 'day',
      location: 'Seattle, WA',
      rating: 4.8,
      reviewCount: 134,
      image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=300&fit=crop',
      badge: 'Popular',
      badgeType: 'popular',
      owner: {
        name: 'David Park',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
        verified: true
      },
      features: ['M3 Max Chip', '64GB RAM', '2TB SSD', 'Liquid Retina Display']
    },
    {
      id: '8',
      title: 'Portable Generator 7500W',
      category: 'Tools',
      price: 55,
      priceUnit: 'day',
      location: 'Houston, TX',
      rating: 4.7,
      reviewCount: 68,
      image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&h=300&fit=crop',
      owner: {
        name: 'Carlos Silva',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face',
        verified: true
      },
      features: ['Electric Start', 'Dual Fuel', '10 Hour Runtime', 'Portable Design']
    }
  ];

  get filteredListings(): ListingItem[] {
    if (this.selectedCategory === 'All') {
      return this.listings;
    }
    return this.listings.filter(listing => listing.category === this.selectedCategory);
  }

  selectCategory(category: string): void {
    this.selectedCategory = category;
  }

  trackByCategory(index: number, category: string): string {
    return category;
  }

  trackByListing(index: number, listing: ListingItem): string {
    return listing.id;
  }
}

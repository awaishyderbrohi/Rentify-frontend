import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface ProductSearch {
  product: string;
  location: string;
}

interface CategoryItem {
  name: string;
  icon: string;
}

interface TrustIndicator {
  text: string;
  icon: string;
}

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="relative bg-base-100 py-16 px-4">
      <!-- Subtle background pattern -->
      <div class="absolute inset-0 opacity-5">
        <div class="absolute inset-0"
             [style.background-image]="backgroundPattern">
        </div>
      </div>

      <div class="relative max-w-7xl mx-auto">
        <!-- Trust Badge -->
        <div class="text-center mb-8">
          <div class="badge badge-lg bg-base-200 text-base-content border-0 px-6 py-3">
            <svg class="w-4 h-4 mr-2 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
            </svg>
            Enterprise-Grade Security & Insurance
          </div>
        </div>

        <!-- Main Hero Content -->
        <div class="text-center mb-12">
          <h1 class="text-4xl sm:text-5xl lg:text-6xl font-bold text-base-content leading-tight mb-6">
            <span class="block mb-2">Professional Equipment</span>
            <span class="text-base-content opacity-70">Rental Platform</span>
          </h1>

          <p class="text-lg text-base-content opacity-70 max-w-2xl mx-auto mb-8 leading-relaxed">
            Access thousands of professional tools, cameras, vehicles, and equipment from verified owners.
            Streamlined rentals for businesses and individuals.
          </p>

          <!-- Trust Indicators -->
          <div class="flex flex-wrap justify-center gap-6 mb-12">
            <div *ngFor="let indicator of trustIndicators" class="flex items-center text-base-content opacity-80">
              <span [innerHTML]="indicator.icon" class="w-4 h-4 mr-2 opacity-60"></span>
              <span class="text-sm font-medium">{{indicator.text}}</span>
            </div>
          </div>
        </div>

        <!-- Prominent Search Section -->
        <div class="max-w-5xl mx-auto mb-16">
          <div class="card bg-base-100 shadow-2xl border border-base-300">
            <div class="card-body p-8">
              <div class="text-center mb-8">
                <h2 class="card-title text-3xl font-bold text-base-content mb-2 justify-center">
                  Find Equipment Now
                </h2>
                <p class="text-base-content opacity-70">Search from over 10,000+ verified listings</p>
              </div>

              <!-- Search Form -->
              <div class="bg-base-200 rounded-xl p-6 mb-6">
                <div class="flex flex-col lg:flex-row gap-4">
                  <div class="flex-1 relative">
                    <svg class="absolute left-4 top-1/2 transform -translate-y-1/2 text-base-content opacity-40 w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                    </svg>
                    <input
                      type="text"
                      placeholder="Search equipment (e.g., Canon EOS R5, Construction Tools)"
                      class="input input-bordered w-full pl-14 pr-4 py-5 h-auto text-lg focus:border-primary"
                      [(ngModel)]="productSearch.product"
                      (keyup.enter)="handleSearch()"
                    />
                  </div>

                  <div class="lg:w-64 relative">
                    <svg class="absolute left-4 top-1/2 transform -translate-y-1/2 text-base-content opacity-40 w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    </svg>
                    <input
                      type="text"
                      placeholder="Location"
                      class="input input-bordered w-full pl-14 pr-4 py-5 h-auto text-lg focus:border-primary"
                      [(ngModel)]="productSearch.location"
                      (keyup.enter)="handleSearch()"
                    />
                  </div>

                  <button
                    (click)="handleSearch()"
                    class="btn btn-primary px-10 py-5 h-auto text-lg font-semibold group hover:scale-105 transition-transform"
                  >
                    Search
                    <svg class="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path>
                    </svg>
                  </button>
                </div>
              </div>

              <!-- Popular Categories -->
              <div class="text-center">
                <p class="text-sm text-base-content opacity-60 mb-4 font-medium">Browse Popular Categories:</p>
                <div class="flex flex-wrap justify-center gap-3">
                  <button
                    *ngFor="let category of popularCategories"
                    class="btn btn-outline btn-sm flex items-center px-4 py-3 hover:btn-primary transition-all duration-200 group"
                    (click)="selectCategory(category.name)"
                  >
                    <span [innerHTML]="category.icon" class="w-4 h-4 mr-2 group-hover:scale-110 transition-transform"></span>
                    <span class="text-sm font-medium">{{category.name}}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Stats Section -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
          <div class="stat bg-base-100">
            <div class="stat-value text-primary text-3xl">25K+</div>
            <div class="stat-desc">Equipment Listed</div>
          </div>
          <div class="stat bg-base-100">
            <div class="stat-value text-secondary text-3xl">15K+</div>
            <div class="stat-desc">Active Users</div>
          </div>
          <div class="stat bg-base-100">
            <div class="stat-value text-accent text-3xl">98%</div>
            <div class="stat-desc">Success Rate</div>
          </div>
          <div class="stat bg-base-100">
            <div class="stat-value text-info text-3xl">24/7</div>
            <div class="stat-desc">Support Available</div>
          </div>
        </div>

        <!-- Secondary CTA -->
        <div class="text-center mt-12">
          <div class="flex items-center justify-center space-x-6">
            <a href="/how-it-works" class="link link-hover text-base-content opacity-70 font-medium hover:opacity-100 transition-opacity">
              How it works →
            </a>
            <span class="text-base-content opacity-30">|</span>
            <a href="/businesses" class="link link-hover text-base-content opacity-70 font-medium hover:opacity-100 transition-opacity">
              For businesses →
            </a>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .stat {
      @apply text-center;
    }

    .stat-value {
      @apply font-bold mb-1;
    }

    .stat-desc {
      @apply text-sm opacity-70;
    }

    .badge-lg {
      @apply text-sm font-semibold;
    }

    .group:hover .group-hover\\:translate-x-1 {
      transform: translateX(0.25rem);
    }

    .group:hover .group-hover\\:scale-110 {
      transform: scale(1.1);
    }
  `]
})
export class HeroComponent {
  backgroundPattern = 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23000000\' fill-opacity=\'0.1\'%3E%3Ccircle cx=\'30\' cy=\'30\' r=\'2\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")';

  productSearch: ProductSearch = {
    product: '',
    location: ''
  };

  popularCategories: CategoryItem[] = [
    {
      name: 'Photography & Video',
      icon: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>`
    },
    {
      name: 'Tools & Equipment',
      icon: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>`
    },
    {
      name: 'Vehicles',
      icon: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 6H4L2 4H1m4 8V9l1-1h6l4 2 2 1v3M9 17h6m-6 0V9"></path></svg>`
    },
    {
      name: 'Sports & Recreation',
      icon: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>`
    },
    {
      name: 'Audio & Music',
      icon: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"></path></svg>`
    }
  ];

  trustIndicators: TrustIndicator[] = [
    {
      text: 'Fully Insured Equipment',
      icon: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>`
    },
    {
      text: '24/7 Customer Support',
      icon: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`
    },
    {
      text: 'Verified Owners',
      icon: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`
    },
    {
      text: '4.9/5 Rating',
      icon: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path></svg>`
    }
  ];

  handleSearch(): void {
    console.log(`Searching for ${this.productSearch.product} in ${this.productSearch.location}`);
    // Add your search logic here
  }

  selectCategory(categoryName: string): void {
    this.productSearch.product = categoryName;
  }
}

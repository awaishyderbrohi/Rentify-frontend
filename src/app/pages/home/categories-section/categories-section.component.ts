import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Route, Router } from '@angular/router';

interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  itemCount: number;
  color: string;
}

@Component({
  selector: 'app-category-section',
  imports: [CommonModule],
  template: `
    <section class="relative bg-base-100 py-16 px-4">
      <!-- Subtle background pattern matching hero -->
      <div class="absolute inset-0 opacity-5">
        <div class="absolute inset-0"
             [style.background-image]="backgroundPattern">
        </div>
      </div>

      <div class="relative max-w-7xl mx-auto">
        <!-- Header -->
        <div class="text-center mb-12">
          <div class="badge badge-lg bg-base-200 text-base-content border-0 px-6 py-3 mb-6">
            <svg class="w-4 h-4 mr-2 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
            </svg>
            Equipment Categories
          </div>

          <h2 class="text-4xl sm:text-5xl font-bold text-base-content leading-tight mb-4">
            <span class="block mb-2">Browse by Category</span>
          </h2>
          <p class="text-lg text-base-content opacity-70 max-w-2xl mx-auto leading-relaxed">
            Discover equipment across various categories to find exactly what you need for your project.
          </p>
        </div>

        <!-- Categories Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <div
            *ngFor="let category of categories; trackBy: trackByCategory"
            class="bg-base-100 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer group border border-base-200"
            (click)="onCategoryClick(category.id)">

            <div class="p-6">
              <!-- Icon -->
              <div class="flex items-center justify-between mb-4">
                <div
                  class="w-12 h-12 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
                  [ngClass]="category.color">
                  <div [innerHTML]="category.icon" class="w-6 h-6 text-white"></div>
                </div>
                <div class="bg-base-200 text-base-content px-3 py-1 rounded-full text-xs font-medium">
                  {{ category.itemCount }}+ items
                </div>
              </div>

              <!-- Content -->
              <h3 class="text-xl font-bold text-base-content mb-2 group-hover:opacity-80 transition-opacity">
                {{ category.name }}
              </h3>
              <p class="text-base-content opacity-70 text-sm mb-4 leading-relaxed">
                {{ category.description }}
              </p>

              <!-- Action -->
              <div class="flex justify-end">
                <span class="text-base-content opacity-70 font-medium group-hover:opacity-100 transition-opacity flex items-center text-sm">
                  Browse Category
                  <svg class="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                  </svg>
                </span>
              </div>
            </div>


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

    .group:hover .group-hover\\:opacity-80 {
      opacity: 0.8;
    }

    .group:hover .group-hover\\:opacity-100 {
      opacity: 1;
    }

    .transition-all {
      transition-property: all;
      transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
      transition-duration: 300ms;
    }

    .transition-transform {
      transition-property: transform;
      transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
      transition-duration: 300ms;
    }

    .transition-opacity {
      transition-property: opacity;
      transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
      transition-duration: 300ms;
    }
  `]
})
export class CategorySectionComponent {
  backgroundPattern = 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23000000\' fill-opacity=\'0.1\'%3E%3Ccircle cx=\'30\' cy=\'30\' r=\'2\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")';

  categories: Category[] = [
    {
      id: 'photography',
      name: 'Photography & Video',
      description: 'Professional cameras, lenses, lighting equipment for stunning visuals.',
      icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>',
      itemCount: 1250,
      color: 'bg-purple-500'
    },
    {
      id: 'tools',
      name: 'Tools & Equipment',
      description: 'Industrial tools, power equipment, and specialized machinery.',
      icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>',
      itemCount: 890,
      color: 'bg-orange-500'
    },
    {
      id: 'vehicles',
      name: 'Vehicles & Transport',
      description: 'Cars, trucks, vans for personal and commercial needs.',
      icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>',
      itemCount: 450,
      color: 'bg-blue-500'
    },
    {
      id: 'audio',
      name: 'Audio & Music',
      description: 'Professional audio equipment and sound systems.',
      icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M9 10l.01.01M15 10l.01.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>',
      itemCount: 680,
      color: 'bg-green-500'
    },
    {
      id: 'sports',
      name: 'Sports & Recreation',
      description: 'Sports equipment and outdoor gear for active lifestyles.',
      icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>',
      itemCount: 320,
      color: 'bg-pink-500'
    },
    {
      id: 'computing',
      name: 'Computing & Tech',
      description: 'Computers, laptops, and technology equipment.',
      icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>',
      itemCount: 540,
      color: 'bg-indigo-500'
    }
  ];

  constructor(private router: Router) {}

  trackByCategory(index: number, category: Category): string {
    return category.id;
  }

  onCategoryClick(categoryId: string): void {
    console.log(`Category clicked: ${categoryId}`);

    this.router.navigate(['/products/category', categoryId]);
    // Add your navigation logic here
    // Example: this.router.navigate(['/category', categoryId]);
  }

  onViewAllClick(): void {
    console.log('View all categories clicked');
    // Add your navigation logic here
    // Example: this.router.navigate(['/categories']);
  }
}

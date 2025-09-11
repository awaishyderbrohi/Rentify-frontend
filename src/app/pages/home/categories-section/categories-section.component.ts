import { Component } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { RouterModule } from '@angular/router';

interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  itemCount: number;
  popularItems: string[];
  color: string;
  bgColor: string;
  featured?: boolean;
}

interface SubCategory {
  id: string;
  name: string;
  count: number;
  parentId: string;
}

@Component({
  selector: 'app-categories-section',
  imports: [CommonModule, RouterModule],
  template: `
    <section class="bg-slate-50 py-20 px-4">
      <div class="max-w-7xl mx-auto">
        <!-- Section Header -->
        <div class="text-center mb-16">
          <div class="inline-flex items-center px-4 py-2 bg-slate-200 text-slate-700 rounded-full text-sm font-medium mb-6">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
            </svg>
            Equipment Categories
          </div>

          <h2 class="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
            Find the Perfect Equipment
            <span class="block text-slate-600 text-3xl md:text-4xl mt-2">for Every Project</span>
          </h2>

          <p class="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Browse our comprehensive collection of professional equipment across multiple categories.
            From high-end cameras to construction tools, we have everything you need.
          </p>
        </div>

        <!-- Featured Categories Grid -->
        <div class="mb-20">
          <h3 class="text-2xl font-bold text-slate-900 mb-8 text-center">Featured Categories</h3>
          <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div *ngFor="let category of featuredCategories; trackBy: trackByCategory"
                 class="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer transform hover:-translate-y-2"
                 [ngClass]="category.bgColor"
                 (click)="navigateToCategory(category.id)">

              <!-- Category Card Content -->
              <div class="p-8 h-full flex flex-col justify-between min-h-[300px]">
                <!-- Icon and Badge -->
                <div class="flex items-start justify-between mb-6">
                  <div class="p-4 bg-white/20 backdrop-blur-sm rounded-2xl group-hover:scale-110 transition-transform duration-300">
                    <div [innerHTML]="category.icon" [ngClass]="category.color" class="w-8 h-8"></div>
                  </div>
                  <div class="px-3 py-1 bg-white/30 backdrop-blur-sm rounded-full text-sm font-medium text-white">
                    {{ category.itemCount }}+ items
                  </div>
                </div>

                <!-- Category Info -->
                <div class="text-white">
                  <h4 class="text-2xl font-bold mb-3 group-hover:text-white/90 transition-colors">
                    {{ category.name }}
                  </h4>
                  <p class="text-white/80 mb-6 leading-relaxed">
                    {{ category.description }}
                  </p>

                  <!-- Popular Items -->
                  <div class="mb-6">
                    <p class="text-sm text-white/70 mb-2 font-medium">Popular items:</p>
                    <div class="flex flex-wrap gap-2">
                      <span *ngFor="let item of category.popularItems.slice(0, 3)"
                            class="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs text-white/90">
                        {{ item }}
                      </span>
                    </div>
                  </div>

                  <!-- CTA Button -->
                  <button class="flex items-center text-white font-medium group-hover:text-white/90 transition-colors">
                    Explore Category
                    <svg class="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                    </svg>
                  </button>
                </div>
              </div>

              <!-- Gradient Overlay -->
              <div class="absolute inset-0 bg-gradient-to-br from-black/20 to-black/40 group-hover:from-black/30 group-hover:to-black/50 transition-all duration-500"></div>
            </div>
          </div>
        </div>

        <!-- All Categories Grid -->
        <div class="mb-16">
          <div class="flex items-center justify-between mb-8">
            <h3 class="text-2xl font-bold text-slate-900">All Categories</h3>
            <button class="text-slate-600 hover:text-slate-900 font-medium transition-colors" (click)="showAllCategories = !showAllCategories">
              {{ showAllCategories ? 'Show Less' : 'View All' }}
              <svg class="w-4 h-4 ml-1 inline-block" [class.rotate-180]="showAllCategories" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </button>
          </div>

          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            <div *ngFor="let category of (showAllCategories ? allCategories : allCategories.slice(0, 12)); trackBy: trackByCategory"
                 class="group bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-slate-200"
                 (click)="navigateToCategory(category.id)">

              <div class="text-center">
                <div class="p-3 bg-slate-50 rounded-xl mb-4 group-hover:bg-slate-100 transition-colors mx-auto w-fit">
                  <div [innerHTML]="category.icon" class="w-6 h-6 text-slate-600 group-hover:text-slate-700"></div>
                </div>

                <h4 class="font-semibold text-slate-900 mb-2 text-sm group-hover:text-slate-700 transition-colors">
                  {{ category.name }}
                </h4>

                <p class="text-xs text-slate-500">{{ category.itemCount }} items</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Subcategories Section -->
        <div class="bg-white rounded-2xl p-8 shadow-lg">
          <div class="text-center mb-8">
            <h3 class="text-2xl font-bold text-slate-900 mb-4">Browse by Specialty</h3>
            <p class="text-slate-600">Find exactly what you need with our detailed subcategories</p>
          </div>

          <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div *ngFor="let group of subcategoryGroups" class="space-y-4">
              <h4 class="font-bold text-slate-900 text-lg border-b border-slate-200 pb-2">
                {{ group.title }}
              </h4>
              <div class="space-y-2">
                <button *ngFor="let subcat of group.subcategories"
                        class="flex items-center justify-between w-full text-left p-3 rounded-lg hover:bg-slate-50 transition-colors group"
                        (click)="navigateToSubcategory(subcat.id)">
                  <span class="text-slate-700 group-hover:text-slate-900 font-medium">{{ subcat.name }}</span>
                  <span class="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-full group-hover:bg-slate-200">
                    {{ subcat.count }}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- CTA Section -->
        <div class="text-center mt-16 bg-gradient-to-r from-slate-900 to-slate-700 rounded-2xl p-12 text-white">
          <h3 class="text-3xl font-bold mb-4">Can't Find What You're Looking For?</h3>
          <p class="text-xl text-slate-200 mb-8 max-w-2xl mx-auto">
            Our team can help you find specialized equipment or suggest alternatives that meet your specific needs.
          </p>

          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <button class="px-8 py-4 bg-white text-slate-900 font-semibold rounded-xl hover:bg-slate-100 transition-colors flex items-center justify-center">
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
              </svg>
              Contact Support
            </button>

            <button class="px-8 py-4 border-2 border-white text-white font-semibold rounded-xl hover:bg-white hover:text-slate-900 transition-colors flex items-center justify-center">
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
              Request Equipment
            </button>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .rotate-180 {
      transform: rotate(180deg);
    }

    .group:hover .group-hover\\:scale-110 {
      transform: scale(1.1);
    }

    .group:hover .group-hover\\:translate-x-1 {
      transform: translateX(0.25rem);
    }

    .group:hover .group-hover\\:text-slate-700 {
      color: rgb(51 65 85);
    }

    .group:hover .group-hover\\:text-slate-900 {
      color: rgb(15 23 42);
    }

    .group:hover .group-hover\\:bg-slate-100 {
      background-color: rgb(241 245 249);
    }

    .group:hover .group-hover\\:bg-slate-200 {
      background-color: rgb(226 232 240);
    }

    .bg-gradient-photography {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .bg-gradient-tools {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    }

    .bg-gradient-vehicles {
      background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
    }

    .bg-gradient-audio {
      background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
    }

    .bg-gradient-sports {
      background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
    }

    .bg-gradient-construction {
      background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
    }

    .transition-all {
      transition-property: all;
      transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
      transition-duration: 300ms;
    }

    .backdrop-blur-sm {
      backdrop-filter: blur(4px);
    }

    @media (max-width: 768px) {
      .min-h-\\[300px\\] {
        min-height: 250px;
      }
    }
  `]
})
export class CategoriesSectionComponent {
  showAllCategories = false;

  featuredCategories: Category[] = [
    {
      id: 'photography',
      name: 'Photography & Video',
      description: 'Professional cameras, lenses, lighting equipment, and video gear for stunning visual content creation.',
      icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>',
      itemCount: 2500,
      popularItems: ['Canon EOS R5', 'Sony FX6', 'RED Cameras', 'Lighting Kits'],
      color: 'text-purple-600',
      bgColor: 'bg-gradient-photography',
      featured: true
    },
    {
      id: 'tools',
      name: 'Tools & Equipment',
      description: 'Industrial tools, power equipment, and specialized machinery for construction and manufacturing projects.',
      icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>',
      itemCount: 1800,
      popularItems: ['Power Drills', 'Excavators', 'Welders', 'Generators'],
      color: 'text-pink-600',
      bgColor: 'bg-gradient-tools',
      featured: true
    },
    {
      id: 'vehicles',
      name: 'Vehicles & Transport',
      description: 'Cars, trucks, vans, and specialized vehicles for personal and commercial transportation needs.',
      icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>',
      itemCount: 950,
      popularItems: ['Tesla Model S', 'Moving Trucks', 'Luxury Cars', 'Motorcycles'],
      color: 'text-blue-600',
      bgColor: 'bg-gradient-vehicles',
      featured: true
    },
    {
      id: 'audio',
      name: 'Audio & Music',
      description: 'Professional audio equipment, musical instruments, and sound systems for events and recording.',
      icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M9 10l.01.01M15 10l.01.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>',
      itemCount: 1200,
      popularItems: ['PA Systems', 'Mixing Consoles', 'Microphones', 'DJ Equipment'],
      color: 'text-green-600',
      bgColor: 'bg-gradient-audio',
      featured: true
    },
    {
      id: 'sports',
      name: 'Sports & Recreation',
      description: 'Sports equipment, outdoor gear, and recreational items for active lifestyles and adventures.',
      icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>',
      itemCount: 800,
      popularItems: ['Mountain Bikes', 'Kayaks', 'Ski Equipment', 'Camping Gear'],
      color: 'text-yellow-600',
      bgColor: 'bg-gradient-sports',
      featured: true
    },
    {
      id: 'construction',
      name: 'Construction & Heavy',
      description: 'Heavy machinery, construction equipment, and industrial tools for large-scale projects.',
      icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>',
      itemCount: 600,
      popularItems: ['Bulldozers', 'Cranes', 'Cement Mixers', 'Scaffolding'],
      color: 'text-teal-600',
      bgColor: 'bg-gradient-construction',
      featured: true
    }
  ];

  allCategories: Category[] = [
    ...this.featuredCategories,
    {
      id: 'computing',
      name: 'Computing & Tech',
      description: 'Computers, laptops, and technology equipment',
      icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>',
      itemCount: 450,
      popularItems: ['MacBook Pro', 'Gaming PCs', 'Tablets'],
      color: 'text-indigo-600',
      bgColor: 'bg-slate-100'
    },
    {
      id: 'medical',
      name: 'Medical Equipment',
      description: 'Medical devices and healthcare equipment',
      icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>',
      itemCount: 320,
      popularItems: ['X-Ray Machines', 'Wheelchairs', 'Monitors'],
      color: 'text-red-600',
      bgColor: 'bg-slate-100'
    },
    {
      id: 'furniture',
      name: 'Furniture & Decor',
      description: 'Furniture, decorations, and home items',
      icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 21l4-7 4 7M3 7l2-2M21 7l-2-2"></path></svg>',
      itemCount: 280,
      popularItems: ['Office Chairs', 'Tables', 'Lighting'],
      color: 'text-amber-600',
      bgColor: 'bg-slate-100'
    },
    {
      id: 'kitchen',
      name: 'Kitchen & Catering',
      description: 'Commercial kitchen and catering equipment',
      icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>',
      itemCount: 190,
      popularItems: ['Commercial Ovens', 'Mixers', 'Refrigerators'],
      color: 'text-orange-600',
      bgColor: 'bg-slate-100'
    },
    {
      id: 'events',
      name: 'Events & Party',
      description: 'Event equipment and party supplies',
      icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>',
      itemCount: 150,
      popularItems: ['Tents', 'Sound Systems', 'Decorations'],
      color: 'text-violet-600',
      bgColor: 'bg-slate-100'
    },
    {
      id: 'outdoor',
      name: 'Outdoor & Garden',
      description: 'Outdoor equipment and gardening tools',
      icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>',
      itemCount: 380,
      popularItems: ['Lawn Mowers', 'Pressure Washers', 'Garden Tools'],
      color: 'text-emerald-600',
      bgColor: 'bg-slate-100'
    }
  ];

  subcategoryGroups = [
    {
      title: 'Photography Specialties',
      subcategories: [
        { id: 'dslr', name: 'DSLR Cameras', count: 450, parentId: 'photography' },
        { id: 'lenses', name: 'Professional Lenses', count: 380, parentId: 'photography' },
        { id: 'lighting', name: 'Studio Lighting', count: 220, parentId: 'photography' },
        { id: 'tripods', name: 'Tripods & Stabilizers', count: 180, parentId: 'photography' },
        { id: 'video', name: 'Video Equipment', count: 320, parentId: 'photography' }
      ]
    },
    {
      title: 'Construction Tools',
      subcategories: [
        { id: 'power-tools', name: 'Power Tools', count: 340, parentId: 'tools' },
        { id: 'hand-tools', name: 'Hand Tools', count: 280, parentId: 'tools' },
        { id: 'measuring', name: 'Measuring Equipment', count: 150, parentId: 'tools' },
        { id: 'safety', name: 'Safety Equipment', count: 200, parentId: 'tools' },
        { id: 'heavy-machinery', name: 'Heavy Machinery', count: 180, parentId: 'tools' }
      ]
    },
    {
      title: 'Vehicle Types',
      subcategories: [
        { id: 'luxury-cars', name: 'Luxury Cars', count: 120, parentId: 'vehicles' },
        { id: 'commercial', name: 'Commercial Vehicles', count: 200, parentId: 'vehicles' },
        { id: 'motorcycles', name: 'Motorcycles', count: 85, parentId: 'vehicles' },
        { id: 'electric', name: 'Electric Vehicles', count: 95, parentId: 'vehicles' },
        { id: 'specialty', name: 'Specialty Vehicles', count: 60, parentId: 'vehicles' }
      ]
    }
  ];

  constructor() {}

  trackByCategory(index: number, category: Category): string {
    return category.id;
  }

  navigateToCategory(categoryId: string): void {
    console.log(`Navigating to category: ${categoryId}`);
    // Add navigation logic here
    // Example: this.router.navigate(['/category', categoryId]);
  }

  navigateToSubcategory(subcategoryId: string): void {
    console.log(`Navigating to subcategory: ${subcategoryId}`);
    // Add navigation logic here
    // Example: this.router.navigate(['/subcategory', subcategoryId]);
  }

  // Additional utility methods for enhanced functionality
  getCategoryById(id: string): Category | undefined {
    return this.allCategories.find(cat => cat.id === id);
  }

  getSubcategoriesByParent(parentId: string): SubCategory[] {
    return this.subcategoryGroups
      .flatMap(group => group.subcategories)
      .filter(subcat => subcat.parentId === parentId);
  }

  getTotalItemsCount(): number {
    return this.allCategories.reduce((total, category) => total + category.itemCount, 0);
  }

  searchCategories(query: string): Category[] {
    const searchTerm = query.toLowerCase();
    return this.allCategories.filter(category =>
      category.name.toLowerCase().includes(searchTerm) ||
      category.description.toLowerCase().includes(searchTerm) ||
      category.popularItems.some(item => item.toLowerCase().includes(searchTerm))
    );
  }

  // Method to handle category filtering by popularity
  getMostPopularCategories(limit: number = 6): Category[] {
    return this.allCategories
      .sort((a, b) => b.itemCount - a.itemCount)
      .slice(0, limit);
  }

  // Method to get categories with special offers or promotions
  getPromotionalCategories(): Category[] {
    // This would typically come from an API
    return this.allCategories.filter(cat => cat.featured);
  }

  // Animation trigger methods for enhanced UX
  onCategoryHover(categoryId: string): void {
    // Add hover analytics or preview loading
    console.log(`Hovering over category: ${categoryId}`);
  }

  onCategoryLeave(categoryId: string): void {
    // Cleanup hover effects or cancel preview loading
    console.log(`Left category: ${categoryId}`);
  }

  // Method to handle lazy loading of category images
  loadCategoryImage(category: Category): string {
    // Return placeholder or actual image URL
    return `https://picsum.photos/400/300?random=${category.id}`;
  }
}

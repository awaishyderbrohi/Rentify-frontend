import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Camera, Wrench, Car, Headphones, Trophy, Grid3X3, ListStart } from 'lucide-angular';
import { ListingsService } from '../../../services/listings/listings.service';
import { Listing } from '../../profile/my-listings/my-listings.component';
import { Router } from '@angular/router';

interface CategoryItem {
  name: string;
  icon: any;
}

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
  imports: [CommonModule, LucideAngularModule],
  templateUrl: `./featured-listings.html`,
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

    .badge-lg {
      @apply text-sm font-semibold;
    }

    .btn-sm {
      @apply text-xs;
    }

    .avatar {
      @apply flex-shrink-0;
    }

    /* Custom badge styles matching the hero section */
    .badge {
      @apply rounded-lg;
    }

    /* Smooth transitions */
    .transition-all {
      transition-property: all;
      transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    }

    /* Hover effects */
    .group:hover .group-hover\\:scale-105 {
      transform: scale(1.05);
    }
  `]
})
export class FeaturedListingsComponent implements OnInit{
  selectedCategory = 'All';

  // Categories with Lucide icons
  categories: CategoryItem[] = [
    { name: 'All', icon: Grid3X3 },
    { name: 'Photography', icon: Camera },
    { name: 'Tools', icon: Wrench },
    { name: 'Vehicles', icon: Car },
    { name: 'Audio', icon: Headphones },
    { name: 'Sports', icon: Trophy }
  ];

  listings: Listing[] = [];

  constructor(private listingsService:ListingsService,private router:Router){}


  ngOnInit(): void {
     this.listingsService.getRandomItems(8).subscribe({
      next:(res)=>{
        this.listings =  res.t
      }
    })

  }
   get getAllListings():Listing[] {
    return this.listings;

  }

  selectCategory(category: string): void {
    this.selectedCategory = category;
  }

  getBadgeClass(badgeType: string | undefined): string {
    switch (badgeType) {
      case 'featured':
        return 'bg-base-content text-base-100';
      case 'popular':
        return 'bg-base-300 text-base-content';
      case 'new':
        return 'bg-base-200 text-base-content';
      default:
        return 'bg-base-200 text-base-content';
    }
  }

  trackByCategory(index: number, category: CategoryItem): string {
    return category.name;
  }

  trackByListing(index: number, listing: Listing): string {
    return listing.id;
  }

  goToListing(id:string){
    this.router.navigate(['/products/',id])
  }
}

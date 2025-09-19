import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Camera, Wrench, Car, Headphones, Trophy, Grid3X3 } from 'lucide-angular';

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
  `]
})
export class FeaturedListingsComponent {
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

  trackByCategory(index: number, category: CategoryItem): string {
    return category.name;
  }

  trackByListing(index: number, listing: ListingItem): string {
    return listing.id;
  }
}

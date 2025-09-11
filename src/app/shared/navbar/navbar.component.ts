import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit, OnDestroy, signal } from '@angular/core';
import { User } from '../../models/User.model';
import { Category } from '../../models/Category.model';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth/auth.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-navbar',
  imports: [CommonModule, FormsModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit {

 // Signals for reactive state management
  isMobileMenuOpen = signal(false);
  isCategoriesDropdownOpen = signal(false);
  isUserDropdownOpen = signal(false);
  isEmailBannerVisible = signal(false);
  searchQuery = signal('');
  locationQuery = signal('');

  user$!: Observable<User | null>;

  categories: Category[] = [
    {
      id: 'tools',
      name: 'Tools & Equipment',
      icon: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z',
      color: 'blue'
    },
    {
      id: 'electronics',
      name: 'Electronics',
      icon: 'M13 10V3L4 14h7v7l9-11h-7z',
      color: 'green'
    },
    {
      id: 'vehicles',
      name: 'Vehicles',
      icon: 'M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M10.5 4L12 2l1.5 2M21 10l-2-2m-14 2l-2-2',
      color: 'purple'
    }
  ];

  constructor(private router: Router, private auth: AuthService) {}

  ngOnInit(): void {
      // ✅ Assign after constructor initializes `this.auth`
    this.user$ = this.auth.user$;
    // Load user data on component initialization
    this.auth.loadUser();
    

    // Show email banner if needed (you can add logic here)
    // this.isEmailBannerVisible.set(true);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;

    // Close categories dropdown if clicking outside
    if (!target.closest('.categories-dropdown-container')) {
      this.isCategoriesDropdownOpen.set(false);
    }

    // Close user dropdown if clicking outside
    if (!target.closest('.user-dropdown-container')) {
      this.isUserDropdownOpen.set(false);
    }

    // Close mobile menu if clicking on backdrop
    if (target.classList.contains('mobile-backdrop')) {
      this.closeMobileMenu();
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(): void {
    // Close mobile menu on window resize
    if (window.innerWidth >= 1024) {
      this.closeMobileMenu();
    }
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen.update(value => !value);
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen.set(false);
  }

  toggleCategoriesDropdown(): void {
    this.isCategoriesDropdownOpen.update(value => !value);
  }

  toggleUserDropdown(): void {
    this.isUserDropdownOpen.update(value => !value);
  }

  getInitials(name: any): any {
    if (!name) return 'U';

    const words = name.trim().split(' ');
    if (words.length === 1) {
      return words[0].charAt(0).toUpperCase();
    }

    return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
  }

  onSearch(): void {
    const query = this.searchQuery();
    const location = this.locationQuery();

    console.log('Searching for:', { query, location });

    // Implement search logic here
    // Example: this.router.navigate(['/search'], { queryParams: { q: query, location } });
  }

  OnLogo() {
    this.router.navigate(['']);
  }

  onCategoryClick(category: Category): void {
    console.log('Category clicked:', category);
    this.isCategoriesDropdownOpen.set(false);
    this.closeMobileMenu();

    // Implement category navigation logic here
    // Example: this.router.navigate(['/category', category.id]);
  }

  onLogin(): void {
    console.log('Login clicked');
    this.router.navigate(['/login']);
    this.closeMobileMenu();
  }

  onListEquipment(): void {
    console.log('List equipment clicked');
    this.router.navigate(['list-equipment']);
    this.closeMobileMenu();

    // Implement list equipment logic here
    // Example: this.router.navigate(['/list-equipment']);
  }

  onForBusiness(): void {
    console.log('For business clicked');
    this.closeMobileMenu();

    // Implement for business logic here
    // Example: this.router.navigate(['/business']);
  }

  onHowItWorks(): void {
    console.log('How it works clicked');
    this.router.navigate(['/how-it-works']);
    // Implement how it works logic here
    // Example: this.router.navigate(['/how-it-works']);
  }

  // User Profile Menu Actions
  onProfile(): void {
    console.log('Profile clicked');
    this.isUserDropdownOpen.set(false);
    this.closeMobileMenu();
    this.router.navigate(['/user/profile']);
  }

  onMyRentals(): void {
    console.log('My rentals clicked');
    this.isUserDropdownOpen.set(false);
    this.closeMobileMenu();
    this.router.navigate(['/my-rentals']);
  }

  onMyListings(): void {
    console.log('My listings clicked');
    this.isUserDropdownOpen.set(false);
    this.closeMobileMenu();
    this.router.navigate(['/my-listings']);
  }

  onSettings(): void {
    console.log('Settings clicked');
    this.isUserDropdownOpen.set(false);
    this.closeMobileMenu();
    this.router.navigate(['/settings']);
  }

  onLogout(): void {
    console.log('Logout clicked');
    this.isUserDropdownOpen.set(false);
    this.closeMobileMenu();

    // Call the auth service logout method
    this.logout();
  }

  dismissEmailBanner(): void {
    this.isEmailBannerVisible.set(false);
  }

  onVerifyEmail(): void {
    console.log('Verify email clicked');

    // Implement email verification logic here
  }

  getCategoryIconColor(color: string): string {
    const colorMap: { [key: string]: string } = {
      'blue': 'bg-blue-100 text-blue-600',
      'green': 'bg-green-100 text-green-600',
      'purple': 'bg-purple-100 text-purple-600'
    };
    return colorMap[color] || 'bg-gray-100 text-gray-600';
  }

  logout(): void {
    console.log('Logging out...');

    this.auth.logout().subscribe({
      next: () => {
        console.log('Logout successful');
        this.router.navigate(['/']);
      },
      error: (error) => {
        console.error('Logout failed:', error);
        // Even if logout fails on server, clear local user state
        this.router.navigate(['/']);
      }
    });
  }
}

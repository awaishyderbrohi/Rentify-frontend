import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import { List } from 'lucide-angular';
import { AuthService } from '../../services/auth/auth.service';
import { User } from '../../models/User.model';
import { Listing } from '../profile/my-listings/my-listings.component';
import { ListingsService } from '../../services/listings/listings.service';
import { UsersService } from '../../services/users/users.service';
import { HttpParams } from '@angular/common/http';

@Component({
  selector: 'app-visitor-user-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: `./visitor-user-profile.component.html`
})
export class VisitorUserProfileComponent implements OnInit {
  user: User | null = null;
  userId: string = '';
  loading: boolean = true;
  error: string = '';

  listings: Listing[] = [];
  activeListings: Listing[] = [];
  recentReviews: any[] = []; // Define proper interface based on your review model
  isOnline: boolean = false;

  stats = {
    active: 0,
    rented: 0
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private usersService: UsersService,
    private listingsService: ListingsService
  ) {}

  ngOnInit() {
    // Get userId from route parameters
    this.route.params.subscribe(params => {
      this.userId = params['id'] || params['userId'];
      if (this.userId) {
        this.fetchUserData();
      } else {
        this.error = 'User ID not provided';
        this.loading = false;
      }
    });
  }

  private fetchUserData() {
    this.loading = true;
    this.error = '';

    this.usersService.getUserById(this.userId).subscribe({
      next: (response) => {
        this.user = response.t;
        console.log(this.user)
        this.loadUserListings();
        this.loadRecentReviews();
        this.checkOnlineStatus();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error fetching user data:', error);
        this.error = error.error?.message || 'Failed to load user profile. User may not exist.';
        this.loading = false;
      }
    });
  }

  retry() {
    this.fetchUserData();
  }

  private loadUserListings() {
    if (!this.userId) return;

    this.listingsService.getAllUserListingsById(this.userId).subscribe({
      next: (res) => {
        this.listings =  res.t;
        this.activeListings = this.listings.filter(l => l.status === 'ACTIVE');
        this.updateStats();
      },
      error: (error) => {
        console.error('Error loading user listings:', error);
        // Don't set global error for listings, just log it
      }
    });
  }

  private loadRecentReviews() {
    if (!this.userId) return;

    // Implement reviews fetching logic when you have reviews service
    // this.reviewsService.getUserReviews(this.userId).subscribe({
    //   next: (reviews) => {
    //     this.recentReviews = reviews.slice(0, 5); // Show only 5 recent reviews
    //   },
    //   error: (error) => {
    //     console.error('Error loading reviews:', error);
    //   }
    // });

    // Mock data for now
    this.recentReviews = [];
  }

  private checkOnlineStatus() {
    if (!this.userId) return;

    // Implement online status check logic
    // This could be a WebSocket connection or periodic API call
    // For now, mock implementation
    this.isOnline = Math.random() > 0.5;
  }

  private updateStats() {
    this.stats.active = this.listings.filter(l => l.status === 'ACTIVE').length;
    this.stats.rented = this.listings.filter(l => l.status === 'RENTED').length;
  }

  onContactUser() {
    if (!this.user?.id) return;

    // Navigate to chat or contact page
    let params = new HttpParams();
    params = params.set("user",this.user.id)
    this.router.navigate(['/profile/messages' ]);

    // Or open a contact modal
    // const modalData = { userId: this.user.id, userName: `${this.user.firstName} ${this.user.lastName}` };
    // this.dialog.open(ContactUserModalComponent, { data: modalData });
  }

  onReportUser() {
    if (!this.user?.id) return;

    // Navigate to report page or open modal
    this.router.navigate(['/report-user', this.user.id]);

    // Or open a report modal
    // const modalData = { userId: this.user.id, userName: `${this.user.firstName} ${this.user.lastName}` };
    // this.dialog.open(ReportUserModalComponent, { data: modalData });
  }

  onViewListing(listing: Listing) {
    // Navigate to listing detail page
    this.router.navigate(['/products', listing.id]);
  }

  onViewAllListings() {
    // Navigate to user's all listings page
  }

  onViewAllReviews() {
    // Navigate to user's all reviews page
    this.router.navigate(['/user', this.userId, 'reviews']);
  }

  getInitials(): string {
    if (!this.user) return 'U';
    const firstName = this.user.firstName || '';
    const lastName = this.user.lastName || '';
    return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
  }

  getPublicEmail(): string {
    if (!this.user?.email) return '';
    // Show only partial email for privacy
    const email = this.user.email;
    const [username, domain] = email.split('@');
    if (username.length <= 3) return email;
    return `${username.substring(0, 2)}***@${domain}`;
  }

  getReviewerInitials(review: any): string {
    if (!review.reviewerName) return 'A';
    const names = review.reviewerName.split(' ');
    return names.map((name: string) => name.charAt(0)).join('').substring(0, 2).toUpperCase();
  }

  getStarArray(rating: number): number[] {
    return Array(Math.floor(rating)).fill(0);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
}

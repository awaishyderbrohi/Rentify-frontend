import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl:`./footer.component.html`,
  styles: [`
    .glassmorphism {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
    }

    .logo-gradient {
      background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
    }

    .hover-lift {
      transition: transform 0.2s ease-in-out;
    }

    .hover-lift:hover {
      transform: translateY(-1px);
    }

    .search-shadow {
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    }

    .dropdown-enter {
      animation: dropdownEnter 0.2s ease-out;
    }

    @keyframes dropdownEnter {
      from {
        opacity: 0;
        transform: translateY(-10px) scale(0.95);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    .mobile-backdrop {
      animation: fadeIn 0.2s ease-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    /* Custom scrollbar for location dropdown */
    .location-dropdown-container .max-h-80::-webkit-scrollbar,
    .location-dropdown-container .max-h-60::-webkit-scrollbar {
      width: 4px;
    }

    .location-dropdown-container .max-h-80::-webkit-scrollbar-track,
    .location-dropdown-container .max-h-60::-webkit-scrollbar-track {
      background: #f1f5f9;
      border-radius: 4px;
    }

    .location-dropdown-container .max-h-80::-webkit-scrollbar-thumb,
    .location-dropdown-container .max-h-60::-webkit-scrollbar-thumb {
      background: #cbd5e1;
      border-radius: 4px;
    }

    .location-dropdown-container .max-h-80::-webkit-scrollbar-thumb:hover,
    .location-dropdown-container .max-h-60::-webkit-scrollbar-thumb:hover {
      background: #94a3b8;
    }
  `]
})
export class FooterComponent {
  // Newsletter email signal
  newsletterEmail = signal<string>('');

  // Current year for copyright
  currentYear = new Date().getFullYear();

  constructor() {}

  // Newsletter subscription
  onNewsletterSubscribe() {
    if (this.isValidEmail(this.newsletterEmail())) {
      console.log('Newsletter subscription:', this.newsletterEmail());
      // TODO: Implement newsletter subscription logic
      // You might want to call a service here to handle the subscription

      // Show success message or handle the subscription
      alert('Thank you for subscribing to our newsletter!');
      this.newsletterEmail.set('');
    }
  }

  // Email validation
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Social media clicks
  onSocialClick(platform: string) {
    console.log('Social click:', platform);
    // TODO: Implement social media navigation
    const socialUrls: { [key: string]: string } = {
      facebook: 'https://facebook.com/rentify',
      twitter: 'https://twitter.com/rentify',
      instagram: 'https://instagram.com/rentify',
      linkedin: 'https://linkedin.com/company/rentify'
    };

    if (socialUrls[platform]) {
      window.open(socialUrls[platform], '_blank');
    }
  }

  // Footer link clicks
  onFooterLink(link: string) {
    console.log('Footer link click:', link);
    // TODO: Implement navigation to footer pages
    // You might want to inject Router here and navigate

    switch (link) {
      case 'about':
        // Navigate to about page
        break;
      case 'how-it-works':
        // Navigate to how it works page
        break;
      case 'pricing':
        // Navigate to pricing page
        break;
      case 'safety':
        // Navigate to safety page
        break;
      case 'blog':
        // Navigate to blog page
        break;
      case 'careers':
        // Navigate to careers page
        break;
      default:
        console.log('Unknown footer link:', link);
    }
  }

  // Category link clicks
  onCategoryLink(category: string) {
    console.log('Category link click:', category);
    // TODO: Implement category navigation
    // Navigate to category page with filters
  }

  // Support link clicks
  onSupportLink(link: string) {
    console.log('Support link click:', link);
    // TODO: Implement support page navigation

    switch (link) {
      case 'help':
        // Navigate to help center
        break;
      case 'contact':
        // Navigate to contact page
        break;
      case 'trust-safety':
        // Navigate to trust & safety page
        break;
      case 'insurance':
        // Navigate to insurance page
        break;
      case 'dispute':
        // Navigate to dispute resolution page
        break;
      default:
        console.log('Unknown support link:', link);
    }
  }

  // App download clicks
  onAppDownload(platform: string) {
    console.log('App download click:', platform);
    // TODO: Implement app store navigation
    const appUrls: { [key: string]: string } = {
      ios: 'https://apps.apple.com/app/rentify',
      android: 'https://play.google.com/store/apps/details?id=com.rentify'
    };

    if (appUrls[platform]) {
      window.open(appUrls[platform], '_blank');
    }
  }

  // Legal link clicks
  onLegalLink(link: string) {
    console.log('Legal link click:', link);
    // TODO: Implement legal page navigation

    switch (link) {
      case 'privacy':
        // Navigate to privacy policy
        break;
      case 'terms':
        // Navigate to terms of service
        break;
      case 'cookies':
        // Navigate to cookie policy
        break;
      default:
        console.log('Unknown legal link:', link);
    }
  }

  // Language selector click
  onLanguageClick() {
    console.log('Language selector clicked');
    // TODO: Implement language selection dropdown or modal
    // You might want to show a dropdown with available languages
  }
}

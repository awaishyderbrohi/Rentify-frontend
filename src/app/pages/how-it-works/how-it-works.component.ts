import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-how-it-works',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-gray-50">
      <!-- Hero Section -->
      <div class="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        <div class="max-w-7xl mx-auto px-4 py-20">
          <div class="text-center">
            <h1 class="text-5xl font-bold mb-6">How Smart Rental Works</h1>
            <p class="text-xl text-slate-300 max-w-3xl mx-auto mb-8">
              Connect with your community to rent anything you need or earn money from items you own.
              It's simple, secure, and sustainable.
            </p>
            <div class="flex justify-center space-x-4">
              <button
                (click)="activeTab = 'renter'"
                [class]="'px-8 py-3 rounded-xl font-semibold transition-all ' +
                         (activeTab === 'renter'
                           ? 'bg-white text-slate-900'
                           : 'bg-slate-700 text-white hover:bg-slate-600')">
                I Want to Rent
              </button>
              <button
                (click)="activeTab = 'owner'"
                [class]="'px-8 py-3 rounded-xl font-semibold transition-all ' +
                         (activeTab === 'owner'
                           ? 'bg-white text-slate-900'
                           : 'bg-slate-700 text-white hover:bg-slate-600')">
                I Want to Rent Out
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Categories Section -->
      <div class="max-w-7xl mx-auto px-4 py-16">
        <div class="text-center mb-12">
          <h2 class="text-3xl font-bold text-slate-900 mb-4">Rent Anything You Need</h2>
          <p class="text-lg text-slate-600">From power tools to party equipment, find it all in one place</p>
        </div>
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          <div *ngFor="let category of categories"
               class="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 text-center hover:shadow-md transition-shadow">
            <div class="w-8 h-8 mx-auto mb-3 text-slate-600 text-2xl">{{ category.icon }}</div>
            <h3 class="font-semibold text-slate-900 mb-1">{{ category.name }}</h3>
            <p class="text-sm text-slate-500">{{ category.count }} items</p>
          </div>
        </div>
      </div>

      <!-- How It Works Steps -->
      <div class="max-w-6xl mx-auto px-4 py-12">
        <div class="text-center mb-12">
          <h2 class="text-4xl font-bold text-slate-900 mb-4">
            {{ activeTab === 'renter' ? 'How to Rent Items' : 'How to Rent Out Your Items' }}
          </h2>
          <p class="text-lg text-slate-600">
            {{ activeTab === 'renter'
              ? 'Get what you need in 4 simple steps'
              : 'Start earning from your unused items in 4 simple steps'
            }}
          </p>
        </div>

        <!-- Renter Steps -->
        <div *ngIf="activeTab === 'renter'" class="relative">
          <!-- Connecting Line -->
          <div class="absolute left-1/2 top-16 bottom-0 w-0.5 bg-gradient-to-b from-blue-200 via-purple-200 to-orange-200 transform -translate-x-1/2 hidden lg:block"></div>

          <div class="space-y-12">
            <div *ngFor="let step of renterSteps; let i = index" class="relative">
              <div class="flex flex-col lg:flex-row items-center gap-8">
                <!-- Step Number Circle -->
                <div class="relative z-10 lg:absolute lg:left-1/2 lg:transform lg:-translate-x-1/2">
                  <div [class]="'w-12 h-12 bg-gradient-to-r rounded-full flex items-center justify-center shadow-lg ' + getStepColor(i).bg">
                    <span class="text-lg font-bold text-white">{{ i + 1 }}</span>
                  </div>
                </div>

                <!-- Content -->
                <div [class]="'flex-1 ' + (i % 2 === 0 ? 'lg:pr-16' : 'lg:pl-16 lg:ml-auto')">
                  <div [class]="'bg-white rounded-2xl shadow-lg border p-6 transform hover:scale-105 transition-all duration-300 border-' + getStepColor(i).border">
                    <div class="flex items-center mb-4">
                      <div [class]="'w-10 h-10 rounded-xl flex items-center justify-center mr-4 text-xl bg-' + getStepColor(i).light + ' border-' + getStepColor(i).border">
                        {{ step.icon }}
                      </div>
                      <div>
                        <h3 class="text-xl font-bold text-slate-900 mb-1">{{ step.title }}</h3>
                        <p class="text-slate-600 text-sm">{{ step.description }}</p>
                      </div>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div *ngFor="let detail of step.details"
                           [class]="'flex items-start p-3 rounded-lg border bg-' + getStepColor(i).light + ' border-' + getStepColor(i).border">
                        <span class="text-green-600 mr-2 flex-shrink-0 mt-0.5 text-sm">✓</span>
                        <span class="text-slate-700 text-sm">{{ detail }}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Visual Element -->
                <div [class]="'flex-1 ' + (i % 2 === 0 ? 'lg:pl-16' : 'lg:pr-16 lg:order-first')">
                  <div [class]="'bg-gradient-to-br rounded-2xl p-8 h-48 flex items-center justify-center border shadow-md from-' + getStepColor(i).light + ' to-' + getStepColor(i).light + ' border-' + getStepColor(i).border">
                    <div class="text-5xl opacity-60">{{ step.icon }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Owner Steps -->
        <div *ngIf="activeTab === 'owner'" class="space-y-8">
          <div *ngFor="let step of ownerSteps; let i = index" class="flex flex-col lg:flex-row items-center gap-6">
            <div [class]="'lg:w-1/2 ' + (i % 2 === 1 ? 'lg:order-2' : '')">
              <div class="bg-white p-6 rounded-xl shadow-lg border border-slate-200">
                <div class="flex items-center mb-4">
                  <div class="bg-slate-900 text-white w-10 h-10 rounded-lg flex items-center justify-center mr-3 text-lg">
                    {{ step.icon }}
                  </div>
                  <div>
                    <div class="text-xs font-semibold text-slate-500 mb-1">Step {{ i + 1 }}</div>
                    <h3 class="text-xl font-bold text-slate-900">{{ step.title }}</h3>
                  </div>
                </div>
                <p class="text-slate-600 mb-4 text-sm">{{ step.description }}</p>
                <ul class="space-y-2">
                  <li *ngFor="let detail of step.details" class="flex items-center text-slate-700 text-sm">
                    <span class="text-green-500 mr-2 flex-shrink-0 text-sm">✓</span>
                    {{ detail }}
                  </li>
                </ul>
              </div>
            </div>
            <div [class]="'lg:w-1/2 ' + (i % 2 === 1 ? 'lg:order-1' : '')">
              <div class="bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl p-6 h-52 flex items-center justify-center">
                <div class="text-4xl text-slate-400">{{ step.icon }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Safety & Security Section -->
      <div class="bg-white py-16">
        <div class="max-w-7xl mx-auto px-4">
          <div class="text-center mb-12">
            <h2 class="text-3xl font-bold text-slate-900 mb-4">Safe & Secure Platform</h2>
            <p class="text-lg text-slate-600">Your safety and security are our top priorities</p>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div class="text-center p-6">
              <div class="bg-green-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span class="text-3xl text-green-600">🛡️</span>
              </div>
              <h3 class="text-xl font-semibold text-slate-900 mb-3">Verified Users</h3>
              <p class="text-slate-600">All users go through identity verification for a trusted community.</p>
            </div>
            <div class="text-center p-6">
              <div class="bg-blue-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span class="text-3xl text-blue-600">💳</span>
              </div>
              <h3 class="text-xl font-semibold text-slate-900 mb-3">Secure Payments</h3>
              <p class="text-slate-600">Payments are held securely until rental is completed successfully.</p>
            </div>
            <div class="text-center p-6">
              <div class="bg-purple-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span class="text-3xl text-purple-600">⭐</span>
              </div>
              <h3 class="text-xl font-semibold text-slate-900 mb-3">Rating System</h3>
              <p class="text-slate-600">Build trust through our comprehensive rating and review system.</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Benefits Section -->
      <div class="bg-slate-50 py-16">
        <div class="max-w-7xl mx-auto px-4">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h2 class="text-3xl font-bold text-slate-900 mb-6">Why Choose Smart Rental?</h2>
              <div class="space-y-6">
                <div *ngFor="let benefit of benefits" class="flex items-start">
                  <div [class]="'w-10 h-10 rounded-lg flex items-center justify-center mr-4 flex-shrink-0 ' + benefit.bgColor">
                    <span [class]="benefit.iconColor">✓</span>
                  </div>
                  <div>
                    <h3 class="font-semibold text-slate-900 mb-2">{{ benefit.title }}</h3>
                    <p class="text-slate-600">{{ benefit.description }}</p>
                  </div>
                </div>
              </div>
            </div>
            <div class="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 text-white">
              <h3 class="text-2xl font-bold mb-6">Ready to Get Started?</h3>
              <p class="text-slate-300 mb-8">Join thousands of users who are already saving money and earning income through Smart Rental.</p>
              <div class="space-y-4">
                <button class="w-full bg-white text-slate-900 font-semibold py-3 px-6 rounded-xl hover:bg-slate-100 transition-colors flex items-center justify-center">
                  Start Renting Items
                  <span class="ml-2">→</span>
                </button>
                <button class="w-full bg-slate-700 text-white font-semibold py-3 px-6 rounded-xl hover:bg-slate-600 transition-colors flex items-center justify-center">
                  List Your Items
                  <span class="ml-2">→</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- FAQ Section -->
      <div class="max-w-4xl mx-auto px-4 py-16">
        <div class="text-center mb-12">
          <h2 class="text-3xl font-bold text-slate-900 mb-4">Frequently Asked Questions</h2>
          <p class="text-lg text-slate-600">Got questions? We've got answers.</p>
        </div>
        <div class="space-y-6">
          <div *ngFor="let faq of faqs" class="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <h3 class="text-lg font-semibold text-slate-900 mb-3">{{ faq.question }}</h3>
            <p class="text-slate-600">{{ faq.answer }}</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: []
})
export class HowItWorksComponent {
  activeTab: 'renter' | 'owner' = 'renter';

  categories = [
    { icon: '🔧', name: 'Tools & Equipment', count: '2,500+' },
    { icon: '🚗', name: 'Vehicles', count: '1,200+' },
    { icon: '📷', name: 'Electronics', count: '3,800+' },
    { icon: '🎮', name: 'Gaming', count: '950+' },
    { icon: '🎵', name: 'Musical Instruments', count: '600+' },
    { icon: '💻', name: 'Tech & Gadgets', count: '2,100+' }
  ];

  renterSteps = [
    {
      icon: '🔍',
      title: 'Search & Discover',
      description: 'Browse thousands of items available for rent in your area. Use filters to find exactly what you need.',
      details: [
        'Search by category, location, or keywords',
        'View detailed photos and descriptions',
        'Check availability dates',
        'Compare prices from different owners'
      ]
    },
    {
      icon: '💬',
      title: 'Connect & Communicate',
      description: 'Message item owners directly to ask questions, discuss details, and arrange pickup or delivery.',
      details: [
        'Built-in messaging system',
        'Ask questions about the item',
        'Negotiate terms if needed',
        'Arrange pickup/delivery logistics'
      ]
    },
    {
      icon: '💳',
      title: 'Book & Pay Securely',
      description: 'Make secure payments through our platform. Your money is protected until you confirm receipt.',
      details: [
        'Secure payment processing',
        'Multiple payment options',
        'Payment held in escrow',
        'Instant booking confirmation'
      ]
    },
    {
      icon: '✅',
      title: 'Use & Return',
      description: 'Pick up your item, use it for the agreed period, and return it in the same condition.',
      details: [
        'Flexible pickup/delivery options',
        'Clear rental terms and duration',
        'Item condition documentation',
        'Easy return process'
      ]
    }
  ];

  ownerSteps = [
    {
      icon: '📷',
      title: 'List Your Items',
      description: 'Take great photos and create detailed listings for items you want to rent out.',
      details: [
        'Upload high-quality photos',
        'Write detailed descriptions',
        'Set your rental rates',
        'Define availability calendar'
      ]
    },
    {
      icon: '📅',
      title: 'Manage Bookings',
      description: 'Receive booking requests, communicate with renters, and manage your rental calendar.',
      details: [
        'Real-time booking notifications',
        'Accept or decline requests',
        'Manage your availability',
        'Track rental history'
      ]
    },
    {
      icon: '📍',
      title: 'Meet & Handover',
      description: 'Meet renters for item pickup or arrange delivery. Document the item condition together.',
      details: [
        'Flexible meeting arrangements',
        'Condition check documentation',
        'Digital handover process',
        'Secure identity verification'
      ]
    },
    {
      icon: '⭐',
      title: 'Earn & Review',
      description: 'Receive payment automatically after successful rentals and build your reputation.',
      details: [
        'Automatic payment processing',
        'Fast payout to your account',
        'Build rating and reviews',
        'Grow your rental business'
      ]
    }
  ];

  benefits = [
    {
      title: 'Save Money',
      description: "Rent items for a fraction of the purchase price. No need to buy things you'll use once.",
      bgColor: 'bg-green-100',
      iconColor: 'text-green-600'
    },
    {
      title: 'Earn Extra Income',
      description: 'Turn your unused items into a steady income stream by renting them out.',
      bgColor: 'bg-blue-100',
      iconColor: 'text-blue-600'
    },
    {
      title: 'Reduce Waste',
      description: 'Promote sustainability by sharing resources and reducing consumption.',
      bgColor: 'bg-purple-100',
      iconColor: 'text-purple-600'
    },
    {
      title: 'Local Community',
      description: 'Connect with neighbors and build stronger community relationships.',
      bgColor: 'bg-orange-100',
      iconColor: 'text-orange-600'
    }
  ];

  faqs = [
    {
      question: 'How does payment work?',
      answer: 'Payments are processed securely through our platform. Money is held in escrow until you confirm receipt of the item, ensuring both parties are protected.'
    },
    {
      question: 'What if an item gets damaged?',
      answer: 'We document item condition before and after rentals. Our resolution center helps resolve any disputes, and we offer damage protection options for high-value items.'
    },
    {
      question: 'How are users verified?',
      answer: 'All users complete identity verification including phone number, email, and ID verification. We also use our rating system to build trust in our community.'
    },
    {
      question: 'Can I cancel a booking?',
      answer: 'Yes, both renters and owners can cancel bookings according to our cancellation policy. Cancellation terms vary depending on how far in advance you cancel.'
    }
  ];

  getStepColor(index: number) {
    const colors = [
      { bg: 'from-blue-500 to-blue-600', accent: 'blue', light: 'blue-50', border: 'blue-200' },
      { bg: 'from-purple-500 to-purple-600', accent: 'purple', light: 'purple-50', border: 'purple-200' },
      { bg: 'from-emerald-500 to-emerald-600', accent: 'emerald', light: 'emerald-50', border: 'emerald-200' },
      { bg: 'from-orange-500 to-orange-600', accent: 'orange', light: 'orange-50', border: 'orange-200' }
    ];
    return colors[index];
  }
}

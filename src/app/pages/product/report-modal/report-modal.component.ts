import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface ReportData {
  reason: 'fraud' | 'inappropriate' | 'misleading' | 'prohibited' | 'copyright' | 'duplicate' | 'other' | null;
  details: string;
  contactEmail?: string;
  priority: 'low' | 'medium' | 'high';
}

interface Listing {
  id: string;
  title: string;
  area: string;
  city: string;
  price: number;
  priceType: string;
  images: string[];
}

@Component({
  selector: 'app-report-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- Report Modal Template goes here -->
  `,
  styleUrls: ['./report-modal.component.css']
})
export class ReportModalComponent {
  @Input() showReportModal: boolean = false;
  @Input() listing: Listing | null = null;
  @Output() reportSubmitted = new EventEmitter<void>();
  @Output() modalClosed = new EventEmitter<void>();

  showSuccessModal: boolean = false;
  isSubmitting: boolean = false;
  reportId: string = '';

  reportData: ReportData = {
    reason: null,
    details: '',
    contactEmail: '',
    priority: 'medium'
  };

  closeReportModal(): void {
    this.showReportModal = false;
    this.resetForm();
    this.modalClosed.emit();
  }

  closeSuccessModal(): void {
    this.showSuccessModal = false;
  }

  resetForm(): void {
    this.reportData = {
      reason: null,
      details: '',
      contactEmail: '',
      priority: 'medium'
    };
    this.isSubmitting = false;
  }

  generateReportId(): string {
    return 'RPT' + Math.random().toString(36).substr(2, 9).toUpperCase();
  }

  submitReport(): void {
    if (!this.reportData.reason || !this.listing) {
      return;
    }

    // Validate required fields
    if (this.reportData.reason === 'copyright' && !this.reportData.contactEmail) {
      return;
    }

    if (this.reportData.details && this.reportData.details.length > 500) {
      this.reportData.details = this.reportData.details.substring(0, 500);
    }

    this.isSubmitting = true;

    // Simulate API call
    setTimeout(() => {
      console.log('Report submitted:', {
        listingId: this.listing?.id,
        reason: this.reportData.reason,
        details: this.reportData.details,
        contactEmail: this.reportData.contactEmail,
        priority: this.reportData.priority,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href
      });

      // Generate report ID
      this.reportId = this.generateReportId();

      // Close report modal and show success
      this.showReportModal = false;
      this.showSuccessModal = true;
      this.isSubmitting = false;

      // Reset form
      this.resetForm();

      // Emit event
      this.reportSubmitted.emit();
    }, 1500);
  }

  getReasonDescription(reason: string): string {
    const descriptions: { [key: string]: string } = {
      'fraud': 'This listing appears to be fraudulent or a scam',
      'inappropriate': 'Contains offensive, inappropriate, or harmful content',
      'misleading': 'False or misleading description, price, or details',
      'prohibited': 'Item is not allowed on our platform',
      'copyright': 'Uses copyrighted images or content without permission',
      'duplicate': 'This item has already been listed by the same user',
      'other': 'Something else not listed above'
    };
    return descriptions[reason] || '';
  }

  getPriorityColor(priority: string): string {
    const colors: { [key: string]: string } = {
      'low': 'badge-info',
      'medium': 'badge-warning',
      'high': 'badge-error'
    };
    return colors[priority] || 'badge-neutral';
  }

  onTextareaInput(event: any): void {
    const value = event.target.value;
    if (value.length > 500) {
      this.reportData.details = value.substring(0, 500);
    }
  }
}

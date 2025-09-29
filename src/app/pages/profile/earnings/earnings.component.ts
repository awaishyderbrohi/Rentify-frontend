// earnings-section.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import jsPDF from 'jspdf';



// Extend jsPDF type to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable?: (options: any) => void;
    lastAutoTable?: {
      finalY: number;
    };
  }
}

export interface EarningsData {
  totalEarnings: number;
  thisMonth: number;
  totalBookings: number;
  platformFees: number;
}

export interface Transaction {
  id: string;
  description: string;
  grossAmount: number;
  platformFee: number;
  netAmount: number;
  date: Date;
  type: 'rental' | 'fee';
  listingTitle: string;
  renterName: string;
}

@Component({
  selector: 'app-earnings-section',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">
      <!-- Earnings Cards -->
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        <!-- Total Earnings -->
        <div class="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-3 text-white shadow-lg">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-green-100 text-xs mb-1">Total Net Earnings</p>
              <p class="text-lg font-bold">Rs {{ formatAmount(earningsData.totalEarnings) }}</p>
            </div>
            <div class="w-8 h-8 bg-green-400 bg-opacity-30 rounded-lg flex items-center justify-center">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
              </svg>
            </div>
          </div>
          <p class="text-green-100 text-xs mt-1">After 10% platform fee</p>
        </div>

        <!-- This Month -->
        <div class="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-3 text-white shadow-lg">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-blue-100 text-xs mb-1">This Month</p>
              <p class="text-lg font-bold">Rs {{ formatAmount(earningsData.thisMonth) }}</p>
            </div>
            <div class="w-8 h-8 bg-blue-400 bg-opacity-30 rounded-lg flex items-center justify-center">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
            </div>
          </div>
          <p class="text-blue-100 text-xs mt-1">Directly transferred</p>
        </div>

        <!-- Total Bookings -->
        <div class="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-3 text-white shadow-lg">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-purple-100 text-xs mb-1">Total Bookings</p>
              <p class="text-lg font-bold">{{ earningsData.totalBookings }}</p>
            </div>
            <div class="w-8 h-8 bg-purple-400 bg-opacity-30 rounded-lg flex items-center justify-center">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
              </svg>
            </div>
          </div>
          <p class="text-purple-100 text-xs mt-1">Completed rentals</p>
        </div>

        <!-- Platform Fees -->
        <div class="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-3 text-white shadow-lg">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-orange-100 text-xs mb-1">Platform Fees Paid</p>
              <p class="text-lg font-bold">Rs {{ formatAmount(earningsData.platformFees) }}</p>
            </div>
            <div class="w-8 h-8 bg-orange-400 bg-opacity-30 rounded-lg flex items-center justify-center">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
              </svg>
            </div>
          </div>
          <p class="text-orange-100 text-xs mt-1">10% service fee</p>
        </div>

        <!-- Total Gross Earnings -->
        <div class="bg-gradient-to-r from-gray-500 to-gray-600 rounded-lg p-3 text-white shadow-lg">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-100 text-xs mb-1">Total Gross</p>
              <p class="text-lg font-bold">Rs {{ formatAmount(earningsData.totalEarnings + earningsData.platformFees) }}</p>
            </div>
            <div class="w-8 h-8 bg-gray-400 bg-opacity-30 rounded-lg flex items-center justify-center">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
              </svg>
            </div>
          </div>
          <p class="text-gray-100 text-xs mt-1">Before deductions</p>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex gap-4">
        <button
          (click)="generatePDFReport()"
          [disabled]="isGeneratingPDF"
          class="flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg *ngIf="!isGeneratingPDF" class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
          </svg>
          <svg *ngIf="isGeneratingPDF" class="w-5 h-5 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {{ isGeneratingPDF ? 'Generating...' : 'Download PDF Report' }}
        </button>
      </div>

      <!-- Info Banner -->
      <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div class="flex items-start space-x-3">
          <svg class="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <div>
            <p class="text-sm font-medium text-blue-800">Direct Transfer System</p>
            <p class="text-sm text-blue-700 mt-1">
              Your earnings are automatically transferred to your bank account after each completed booking.
              Platform fee (10%) is deducted automatically. No waiting, no payout requests needed.
            </p>
          </div>
        </div>
      </div>

      <!-- Recent Transactions -->
      <div class="border border-gray-200 rounded-xl p-6 bg-white shadow-sm">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-lg font-semibold text-gray-900">Recent Transactions</h3>
          <button class="text-sm text-blue-600 hover:text-blue-800 font-medium">View All</button>
        </div>

        <div class="space-y-4" *ngIf="transactions.length > 0; else noTransactions">
          <div
            *ngFor="let transaction of transactions"
            class="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div class="flex items-center space-x-3">
              <!-- Transaction Icon -->
              <div class="w-10 h-10 rounded-lg flex items-center justify-center"
                   [class]="transaction.type === 'rental' ? 'bg-green-100' : 'bg-orange-100'">
                <svg class="w-5 h-5"
                     [class]="transaction.type === 'rental' ? 'text-green-600' : 'text-orange-600'"
                     fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path *ngIf="transaction.type === 'rental'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                  <path *ngIf="transaction.type === 'fee'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                </svg>
              </div>

              <!-- Transaction Details -->
              <div>
                <p class="font-medium text-gray-900">{{ transaction.description }}</p>
                <div class="flex items-center space-x-2 text-sm text-gray-600">
                  <span>{{ formatDate(transaction.date) }}</span>
                  <span class="w-1 h-1 bg-gray-400 rounded-full"></span>
                  <span>{{ transaction.renterName }}</span>
                </div>
                <p class="text-xs text-gray-500">{{ transaction.listingTitle }}</p>
              </div>
            </div>

            <!-- Amount Details -->
            <div class="text-right">
              <div class="space-y-1">
                <p class="text-sm text-gray-600">
                  Gross: Rs {{ formatAmount(transaction.grossAmount) }}
                </p>
                <p class="text-xs text-orange-600">
                  Fee: -Rs {{ formatAmount(transaction.platformFee) }}
                </p>
                <p class="font-semibold text-green-600">
                  Net: Rs {{ formatAmount(transaction.netAmount) }}
                </p>
              </div>
              <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-1">
                <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
                Transferred
              </span>
            </div>
          </div>
        </div>

        <ng-template #noTransactions>
          <div class="text-center py-12">
            <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
              </svg>
            </div>
            <h4 class="text-lg font-medium text-gray-900 mb-2">No Transactions Yet</h4>
            <p class="text-gray-600">Your earnings history will appear here once you start receiving bookings.</p>
          </div>
        </ng-template>
      </div>
    </div>
  `
})
export class EarningsComponent implements OnInit {
  isGeneratingPDF = false;

  earningsData: EarningsData = {
    totalEarnings: 40500, // Net after 10% fee
    thisMonth: 10800, // Net for current month
    totalBookings: 23,
    platformFees: 4500 // Total fees paid (10% of gross)
  };

  transactions: Transaction[] = [
    {
      id: '1',
      description: 'Rental payment received',
      grossAmount: 2500,
      platformFee: 250,
      netAmount: 2250,
      date: new Date('2024-01-15'),
      type: 'rental',
      listingTitle: 'Professional DSLR Camera',
      renterName: 'Ahmad Khan'
    },
    {
      id: '2',
      description: 'Rental payment received',
      grossAmount: 4000,
      platformFee: 400,
      netAmount: 3600,
      date: new Date('2024-01-12'),
      type: 'rental',
      listingTitle: 'DJI Drone with 4K Camera',
      renterName: 'Sara Ahmed'
    },
    {
      id: '3',
      description: 'Rental payment received',
      grossAmount: 1800,
      platformFee: 180,
      netAmount: 1620,
      date: new Date('2024-01-08'),
      type: 'rental',
      listingTitle: 'Professional Lighting Kit',
      renterName: 'Hassan Ali'
    },
    {
      id: '4',
      description: 'Rental payment received',
      grossAmount: 3200,
      platformFee: 320,
      netAmount: 2880,
      date: new Date('2024-01-05'),
      type: 'rental',
      listingTitle: 'Audio Recording Equipment',
      renterName: 'Maria Sheikh'
    },
    {
      id: '5',
      description: 'Rental payment received',
      grossAmount: 5500,
      platformFee: 550,
      netAmount: 4950,
      date: new Date('2024-01-02'),
      type: 'rental',
      listingTitle: 'Video Production Setup',
      renterName: 'Omar Malik'
    }
  ];

  ngOnInit() {
    // Load data from API
  }

  async generatePDFReport() {
    this.isGeneratingPDF = true;

    try {
      // Create new PDF document
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      // Colors (defined as tuples for proper TypeScript support)
      const primaryColor: [number, number, number] = [37, 99, 235]; // Blue
      const secondaryColor: [number, number, number] = [107, 114, 128]; // Gray
      const successColor: [number, number, number] = [34, 197, 94]; // Green
      const warningColor: [number, number, number] = [249, 115, 22]; // Orange

      // Add Rentify Logo (using text for now - you can replace with actual logo image)
      pdf.setFontSize(24);
      pdf.setTextColor(...primaryColor);
      pdf.setFont('helvetica', 'bold');
      pdf.text('RENTIFY', 20, 25);

      // Add tagline
      pdf.setFontSize(10);
      pdf.setTextColor(...secondaryColor);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Your Trusted Rental Platform', 20, 31);

      // Add report title and date
      pdf.setFontSize(18);
      pdf.setTextColor(0, 0, 0);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Earnings Report', pageWidth - 20, 25, { align: 'right' });

      pdf.setFontSize(10);
      pdf.setTextColor(...secondaryColor);
      pdf.setFont('helvetica', 'normal');
      const reportDate = new Date().toLocaleDateString('en-PK', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      pdf.text(`Generated on ${reportDate}`, pageWidth - 20, 31, { align: 'right' });

      // Add separator line
      pdf.setLineWidth(0.5);
      pdf.setDrawColor(...primaryColor);
      pdf.line(20, 40, pageWidth - 20, 40);

      // Summary Section
      let currentY = 55;
      pdf.setFontSize(14);
      pdf.setTextColor(0, 0, 0);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Earnings Summary', 20, currentY);

      currentY += 15;

      // Summary cards data - all 5 cards in single row
      const summaryData = [
        {
          label: 'Total Net Earnings',
          value: `Rs ${this.formatAmount(this.earningsData.totalEarnings)}`,
          color: successColor as [number, number, number]
        },
        {
          label: 'This Month',
          value: `Rs ${this.formatAmount(this.earningsData.thisMonth)}`,
          color: primaryColor as [number, number, number]
        },
        {
          label: 'Total Bookings',
          value: this.earningsData.totalBookings.toString(),
          color: [147, 51, 234] as [number, number, number] // Purple
        },
        {
          label: 'Platform Fees',
          value: `Rs ${this.formatAmount(this.earningsData.platformFees)}`,
          color: warningColor as [number, number, number]
        },
        {
          label: 'Total Gross',
          value: `Rs ${this.formatAmount(this.earningsData.totalEarnings + this.earningsData.platformFees)}`,
          color: secondaryColor as [number, number, number]
        }
      ];

      // Draw summary cards in single row
      const totalCardsWidth = pageWidth - 40; // Available width minus margins
      const cardWidth = totalCardsWidth / 5; // 5 cards in one row
      const cardHeight = 16; // Reduced height for compact design
      let cardX = 20;
      const cardY = currentY;

      summaryData.forEach((item, index) => {
        // Draw card background with light fill
        pdf.setFillColor(248, 250, 252);
        pdf.rect(cardX, cardY, cardWidth - 2, cardHeight, 'F'); // -2 for gap between cards

        // Draw card border
        pdf.setLineWidth(0.3);
        pdf.setDrawColor(226, 232, 240);
        pdf.rect(cardX, cardY, cardWidth - 2, cardHeight);

        // Add label (smaller font)
        pdf.setFontSize(7);
        pdf.setTextColor(...secondaryColor);
        pdf.setFont('helvetica', 'normal');
        pdf.text(item.label, cardX + 2, cardY + 6);

        // Add value (smaller but bold)
        pdf.setFontSize(10);
        pdf.setTextColor(...item.color);
        pdf.setFont('helvetica', 'bold');

        // Handle text wrapping for longer values
        const valueText = item.value;
        const maxWidth = cardWidth - 6;
        const textLines = pdf.splitTextToSize(valueText, maxWidth);

        if (textLines.length > 1) {
          // If text is too long, use smaller font
          pdf.setFontSize(8);
        }

        pdf.text(textLines[0], cardX + 2, cardY + 12);

        cardX += cardWidth;
      });

      // Transactions Section
      currentY = cardY + cardHeight + 25; // Reduced spacing after compact cards
      pdf.setFontSize(14);
      pdf.setTextColor(0, 0, 0);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Recent Transactions', 20, currentY);

      currentY += 10;

      // Check if autoTable is available
      if (pdf.autoTable && typeof pdf.autoTable === 'function') {
        // Prepare transaction data for table
        const tableData = this.transactions.map(transaction => [
          this.formatDate(transaction.date),
          transaction.description,
          transaction.listingTitle.length > 20 ? transaction.listingTitle.substring(0, 20) + '...' : transaction.listingTitle,
          transaction.renterName,
          `Rs ${this.formatAmount(transaction.grossAmount)}`,
          `Rs ${this.formatAmount(transaction.platformFee)}`,
          `Rs ${this.formatAmount(transaction.netAmount)}`
        ]);

        // Add transactions table
        pdf.autoTable({
          startY: currentY,
          head: [['Date', 'Type', 'Item', 'Renter', 'Gross', 'Fee', 'Net']],
          body: tableData,
          theme: 'grid',
          headStyles: {
            fillColor: primaryColor,
            textColor: 255,
            fontSize: 9,
            fontStyle: 'bold',
            halign: 'center'
          },
          bodyStyles: {
            fontSize: 8,
            textColor: [51, 65, 85]
          },
          columnStyles: {
            0: { cellWidth: 25, halign: 'center' }, // Date
            1: { cellWidth: 30 }, // Type
            2: { cellWidth: 40 }, // Item
            3: { cellWidth: 25 }, // Renter
            4: { cellWidth: 25, halign: 'right' }, // Gross
            5: { cellWidth: 25, halign: 'right', textColor: [249, 115, 22] }, // Fee
            6: { cellWidth: 25, halign: 'right', textColor: [34, 197, 94] } // Net
          },
          alternateRowStyles: {
            fillColor: [248, 250, 252]
          },
          margin: { left: 20, right: 20 }
        });

        currentY = (pdf.lastAutoTable?.finalY || currentY) + 20;
      } else {
        // Fallback: Create table manually
        currentY = this.createManualTable(pdf, currentY, pageWidth, primaryColor, secondaryColor);
      }

      // Footer
      const footerY = pageHeight - 30;
      pdf.setLineWidth(0.5);
      pdf.setDrawColor(...primaryColor);
      pdf.line(20, footerY, pageWidth - 20, footerY);

      pdf.setFontSize(8);
      pdf.setTextColor(...secondaryColor);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Rentify - Earnings Report', 20, footerY + 8);
      pdf.text(`Page 1 of 1`, pageWidth - 20, footerY + 8, { align: 'right' });

      // Add disclaimer
      pdf.setFontSize(7);
      pdf.setTextColor(...secondaryColor);
      const disclaimer = 'This report is generated automatically. All amounts are in Pakistani Rupees (PKR). Platform fee of 10% is automatically deducted from gross earnings.';
      const disclaimerLines = pdf.splitTextToSize(disclaimer, pageWidth - 40);
      pdf.text(disclaimerLines, 20, footerY + 15);

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `Rentify-Earnings-Report-${timestamp}.pdf`;

      // Save the PDF
      pdf.save(filename);

      // Show success message
      this.showSuccessMessage('PDF earnings report downloaded successfully!');

    } catch (error) {
      console.error('Error generating PDF:', error);
      this.showErrorMessage(`Failed to generate PDF report: 'Unknown error'}`);
    } finally {
      this.isGeneratingPDF = false;
    }
  }

  viewBankAccount() {
    // Navigate to payment settings or show bank details
    this.showInfoMessage('Redirecting to bank account settings...');
  }

  formatAmount(amount: number): string {
    return amount.toLocaleString();
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('en-PK', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  private createManualTable(pdf: jsPDF, startY: number, pageWidth: number, primaryColor: [number, number, number], secondaryColor: [number, number, number]): number {
    let currentY = startY;
    const rowHeight = 8;
    const headerHeight = 10;

    // Table headers
    const headers = ['Date', 'Type', 'Item', 'Renter', 'Gross', 'Fee', 'Net'];
    const colWidths = [25, 25, 45, 25, 25, 25, 25]; // Adjusted for better fit

    // Draw header background
    pdf.setFillColor(...primaryColor);
    pdf.rect(20, currentY, pageWidth - 40, headerHeight, 'F');

    // Draw header text
    pdf.setFontSize(9);
    pdf.setTextColor(255, 255, 255);
    pdf.setFont('helvetica', 'bold');

    let xPos = 22;
    headers.forEach((header, index) => {
      pdf.text(header, xPos, currentY + 7);
      xPos += colWidths[index];
    });

    currentY += headerHeight;

    // Draw transaction rows
    pdf.setFontSize(8);
    pdf.setTextColor(51, 65, 85);
    pdf.setFont('helvetica', 'normal');

    this.transactions.forEach((transaction, index) => {
      // Alternate row background
      if (index % 2 === 1) {
        pdf.setFillColor(248, 250, 252);
        pdf.rect(20, currentY, pageWidth - 40, rowHeight, 'F');
      }

      // Row data
      const rowData = [
        this.formatDate(transaction.date),
        'Rental',
        transaction.listingTitle.length > 18 ? transaction.listingTitle.substring(0, 18) + '...' : transaction.listingTitle,
        transaction.renterName.length > 12 ? transaction.renterName.substring(0, 12) + '...' : transaction.renterName,
        `Rs ${this.formatAmount(transaction.grossAmount)}`,
        `Rs ${this.formatAmount(transaction.platformFee)}`,
        `Rs ${this.formatAmount(transaction.netAmount)}`
      ];

      xPos = 22;
      rowData.forEach((data, colIndex) => {
        // Set color for fee (orange) and net (green) columns
        if (colIndex === 5) {
          pdf.setTextColor(249, 115, 22); // Orange for fees
        } else if (colIndex === 6) {
          pdf.setTextColor(34, 197, 94); // Green for net
        } else {
          pdf.setTextColor(51, 65, 85); // Default gray
        }

        pdf.text(data, xPos, currentY + 6);
        xPos += colWidths[colIndex];
      });

      currentY += rowHeight;
    });

    // Draw table border
    pdf.setDrawColor(226, 232, 240);
    pdf.setLineWidth(0.5);
    pdf.rect(20, startY, pageWidth - 40, currentY - startY);

    return currentY + 20;
  }

  private showSuccessMessage(message: string) {
    // In a real app, you'd use a toast/notification service
    alert(message);
  }

  private showErrorMessage(message: string) {
    // In a real app, you'd use a toast/notification service
    alert(message);
  }

  private showInfoMessage(message: string) {
    // In a real app, you'd use a toast/notification service
    alert(message);
  }
}

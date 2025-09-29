import { Component, OnInit, OnDestroy, signal, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Subject, takeUntil } from 'rxjs';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { User } from '../../models/User.model';
import { AdministratorService } from '../../services/administrator/administrator.service';
import { Listing } from '../profile/my-listings/my-listings.component';

interface LocationCoordinates {
  lat: number;
  lng: number;
}

interface DeliveryOptions {
  pickup: boolean;
  delivery: boolean;
  shipping: boolean;
}

interface Activity {
  id: string;
  type: 'user_registration' | 'listing_created' | 'rental_completed' | 'report_submitted' | 'payment_processed';
  description: string;
  user: {
    firstName: string;
    lastName: string;
  };
  timestamp: Date;
  metadata?: any;
}

interface Report {
  id: string;
  type: 'user' | 'listing';
  reportedId: string;
  reportedBy: {
    firstName: string;
    lastName: string;
  };
  reason: string;
  description: string;
  status: 'pending' | 'resolved' | 'dismissed';
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
  reportedEntity?: User | Listing;
}

interface PlatformStats {
  totalUsers: number;
  totalListings: number;
  activeRentals: number;
  totalReports: number;
  activeUsers: number;
  pendingReports: number;
  monthlyRevenue: number;
  userGrowth: number;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: `./admin-profile.component.html`
})
export class AdminDashboardComponent implements OnInit, OnDestroy {
  activeTab = signal('users');
  private destroy$ = new Subject<void>();
  menuOpen = false;



  // Search terms
  userSearchTerm = '';
  listingSearchTerm = '';
  activityFilter = '';
  reportFilter = '';

  // Data signals
  stats = signal<PlatformStats>({
    totalUsers: 1247,
    totalListings: 856,
    activeRentals: 432,
    totalReports: 23,
    activeUsers: 892,
    pendingReports: 8,
    monthlyRevenue: 245000,
    userGrowth: 12.5
  });

  users = signal<User[]>([]);
  filteredUsers = signal<User[]>([]);

  listings = signal<Listing[]>([]);
  filteredListings = signal<Listing[]>([]);

  activities = signal<Activity[]>([]);
  filteredActivities = signal<Activity[]>([]);

  reports = signal<Report[]>([]);
  filteredReports = signal<Report[]>([]);

  categoryStats = [
    { name: 'Electronics', listings: 245, activeRentals: 89 },
    { name: 'Tools', listings: 189, activeRentals: 56 },
    { name: 'Vehicles', listings: 156, activeRentals: 78 },
    { name: 'Furniture', listings: 134, activeRentals: 34 },
    { name: 'Sports Equipment', listings: 98, activeRentals: 23 },
    { name: 'Appliances', listings: 76, activeRentals: 19 },
  ];

  tabs = [
    { id: 'analytics', label: 'Analytics' },
    { id: 'users', label: 'Users' },
    { id: 'listings', label: 'Listings' },
    { id: 'activities', label: 'Activities' },
    { id: 'reports', label: 'Reports' }
  ];

  constructor(private http: HttpClient,private adminService:AdministratorService, private eRef:ElementRef) {}

  ngOnInit() {
    this.loadData();

  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadData() {
    // Mock users data

    this.adminService.getAllUsers().subscribe({
      next:(res)=>{
        let fetchedUsers:User[]=[]
        fetchedUsers= res.t;
        this.users.set(fetchedUsers);
        this.filteredUsers.set(fetchedUsers);
        this.stats.update(current => ({
        ...current,
        totalUsers: fetchedUsers.length,
        monthlyRevenue: 200000
      }));
      }
    })

    this.adminService.getAllListings().subscribe({
      next:(res)=>{
        let fetchListings: Listing[];
        fetchListings= res.t;
        this.listings.set(fetchListings);
        this.filteredListings.set(fetchListings);
      }
    })




    // Mock activities
    const mockActivities: Activity[] = [];

    // Mock reports
    const mockReports: Report[] = [];


    this.activities.set(mockActivities);
    this.filteredActivities.set(mockActivities);
    this.reports.set(mockReports);
    this.filteredReports.set(mockReports);
  }

  // Search methods
  searchUsers() {
    const term = this.userSearchTerm.toLowerCase();
    const filtered = this.users().filter(user =>
      (user.firstName?.toLowerCase().includes(term) || false) ||
      (user.lastName?.toLowerCase().includes(term) || false) ||
      (user.email?.toLowerCase().includes(term) || false)
    );
    this.filteredUsers.set(filtered);
  }

  searchListings() {
    const term = this.listingSearchTerm.toLowerCase();
    const filtered = this.listings().filter(listing =>
      listing.title.toLowerCase().includes(term) ||
      listing.category.toLowerCase().includes(term)
    );
    this.filteredListings.set(filtered);
  }

  filterActivities() {
    if (this.activityFilter) {
      const filtered = this.activities().filter(activity =>
        activity.type === this.activityFilter
      );
      this.filteredActivities.set(filtered);
    } else {
      this.filteredActivities.set([...this.activities()]);
    }
  }

  filterReports() {
    if (this.reportFilter) {
      const filtered = this.reports().filter(report =>
        report.status === this.reportFilter
      );
      this.filteredReports.set(filtered);
    } else {
      this.filteredReports.set([...this.reports()]);
    }
  }

  // Action methods
  suspendUser(user: User) {
    console.log('Suspending user:', user);
  }

  activateUser(user: User) {
    console.log('Activating user:', user);
  }

  banUser(user: User) {
    console.log('Banning user:', user);
  }

  viewUser(user: User) {
    console.log('Viewing user details:', user);
  }

   toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  // Close all open menus if clicked outside
  @HostListener('document:click', ['$event'])
  clickOutside(event: Event) {
    if (!this.eRef.nativeElement.contains(event.target)) {
      this.filteredUsers().forEach(user => user.menuOpen = false);
    }
  }


  deactivateListing(listing: Listing) {
    console.log('Deactivating listing:', listing);
  }

  activateListing(listing: Listing) {
    console.log('Activating listing:', listing);
  }

  banListing(listing: Listing) {
    console.log('Banning listing:', listing);
  }

  viewListing(listing: Listing) {
    console.log('Viewing listing details:', listing);
  }

  resolveReport(report: Report) {
    const reports = this.reports();
    const index = reports.findIndex(r => r.id === report.id);
    if (index !== -1) {
      reports[index].status = 'resolved';
      this.reports.set([...reports]);
      this.filterReports();
    }
  }

  dismissReport(report: Report) {
    const reports = this.reports();
    const index = reports.findIndex(r => r.id === report.id);
    if (index !== -1) {
      reports[index].status = 'dismissed';
      this.reports.set([...reports]);
      this.filterReports();
    }
  }

  viewReportDetails(report: Report) {
    console.log('Viewing report details:', report);
  }



// PDF Export Methods
exportUsersPDF() {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
  const currentDate = new Date().toLocaleDateString();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // === ENTERPRISE HEADER ===
  // Background header bar
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 90, 'F');

  // Company logo area (placeholder)
  doc.setFillColor(71, 85, 105); // slate-600
  doc.roundedRect(40, 25, 40, 40, 4, 4, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.text('R', 57, 50);

  // Main title
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('User Management Report', 100, 45);

  // Subtitle
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(203, 213, 225); // slate-300
  doc.text('Comprehensive User Analytics & Status Overview', 100, 62);

  // === REPORT METADATA ===
  const metaY = 120;
  doc.setFillColor(248, 250, 252); // slate-50
  doc.rect(40, metaY, pageWidth - 80, 50, 'F');
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.setLineWidth(1);
  doc.rect(40, metaY, pageWidth - 80, 50);

  doc.setTextColor(71, 85, 105); // slate-600
  doc.setFontSize(10);
  doc.text(`Generated on: ${currentDate}`, 55, metaY + 20);
  doc.text(`Report ID: USR-${Date.now().toString().slice(-6)}`, 55, metaY + 35);

  const reportTime = new Date().toLocaleTimeString();
  doc.text(`Time: ${reportTime}`, 300, metaY + 20);
  doc.text('Classification: Internal Use', 300, metaY + 35);

  // === ENHANCED SUMMARY SECTION ===
  const activeUsers = this.filteredUsers().filter(u => u.status === 'ACTIVE').length;
  const bannedUsers = this.filteredUsers().filter(u => u.status === 'BANNED').length;
  const totalUsers = this.filteredUsers().length;
  const verifiedUsers = this.filteredUsers().filter(u => u.emailVerified).length;

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59); // slate-800
  doc.text('Key Metrics', 40, 200);

  const summaryY = 220;
  const cardWidth = 120;
  const cardHeight = 80;
  const cardSpacing = 15;

  const stats = [
    {
      label: "Total Users",
      value: totalUsers,
      bgColor: [51, 65, 85],   // slate-700
      icon: "👥"
    },
    {
      label: "Active Users",
      value: activeUsers,
      bgColor: [16, 185, 129], // emerald-500
      percentage: totalUsers > 0 ? Math.round((activeUsers / totalUsers) * 100) : 0,
      icon: "✅"
    },
    {
      label: "Banned Users",
      value: bannedUsers,
      bgColor: [239, 68, 68],  // red-500
      percentage: totalUsers > 0 ? Math.round((bannedUsers / totalUsers) * 100) : 0,
      icon: "🚫"
    },
    {
      label: "Email Verified",
      value: verifiedUsers,
      bgColor: [59, 130, 246], // blue-500
      percentage: totalUsers > 0 ? Math.round((verifiedUsers / totalUsers) * 100) : 0,
      icon: "📧"
    }
  ];

  stats.forEach((stat, i) => {
    const x = 40 + i * (cardWidth + cardSpacing);

    // Card background with subtle shadow effect
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(x + 2, summaryY + 2, cardWidth, cardHeight, 8, 8, 'F'); // shadow
    doc.setFillColor(stat.bgColor[0], stat.bgColor[1], stat.bgColor[2]);
    doc.roundedRect(x, summaryY, cardWidth, cardHeight, 8, 8, 'F');

    // Card content
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(28);
    doc.setFont('helvetica', 'bold');
    doc.text(`${stat.value}`, x + 15, summaryY + 35);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(stat.label, x + 15, summaryY + 50);

    // Percentage if available
    if (stat.percentage !== undefined) {
      doc.setFontSize(8);
      doc.text(`${stat.percentage}%`, x + 15, summaryY + 65);
    }
  });

  // === ENHANCED USER TABLE ===
  const tableStartY = 340;

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59); // slate-800
  doc.text('User Directory', 40, tableStartY - 10);

  const tableData = this.filteredUsers().map(user => [
    `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'N/A',
    user.email || 'N/A',
    user.status || 'INACTIVE',
    user.totalRentals?.toString() || '0',
    user.reports?.toString() || '0',
    user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A',
    user.emailVerified ? 'Verified' : 'Pending'
  ]);

  autoTable(doc, {
    head: [['Full Name', 'Email Address', 'Status', 'Rentals', 'Reports', 'Join Date', 'Email Status']],
    body: tableData,
    startY: tableStartY,
    theme: 'grid',
    styles: {
      fontSize: 9,
      cellPadding: 6,
      textColor: [51, 65, 85], // slate-700
      lineColor: [226, 232, 240], // slate-200
      lineWidth: 0.5
    },
    headStyles: {
      fillColor: [15, 23, 42], // slate-900
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center',
      fontSize: 10,
      cellPadding: 8
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252] // slate-50
    },
    columnStyles: {
      0: { cellWidth: 85, halign: 'left' },   // Name
      1: { cellWidth: 135, halign: 'left' },  // Email (increased width)
      2: { cellWidth: 55, halign: 'center' }, // Status
      3: { cellWidth: 45, halign: 'center' }, // Rentals
      4: { cellWidth: 45, halign: 'center' }, // Reports
      5: { cellWidth: 65, halign: 'center' }, // Date
      6: { cellWidth: 65, halign: 'center' }  // Email Status
    },
    didParseCell: function(data) {
      // Color-code status cells
      if (data.column.index === 2) { // Status column
        const status = data.cell.text[0];
        if (status === 'ACTIVE') {
          data.cell.styles.fillColor = [240, 253, 244]; // green-50
          data.cell.styles.textColor = [22, 101, 52];   // green-800
        } else if (status === 'BANNED') {
          data.cell.styles.fillColor = [254, 242, 242]; // red-50
          data.cell.styles.textColor = [153, 27, 27];   // red-800
        } else if (status === 'PENDING') {
          data.cell.styles.fillColor = [255, 251, 235]; // amber-50
          data.cell.styles.textColor = [146, 64, 14];   // amber-800
        }
      }

      // Color-code email verification
      if (data.column.index === 6) { // Email Status column
        const status = data.cell.text[0];
        if (status === 'Verified') {
          data.cell.styles.fillColor = [240, 249, 255]; // blue-50
          data.cell.styles.textColor = [30, 64, 175];   // blue-800
        } else {
          data.cell.styles.fillColor = [255, 251, 235]; // amber-50
          data.cell.styles.textColor = [146, 64, 14];   // amber-800
        }
      }
    }
  });

  // === ENTERPRISE FOOTER ===
  const pageCount = (doc as any).internal.getNumberOfPages();

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);

    // Footer background
    doc.setFillColor(248, 250, 252); // slate-50
    doc.rect(0, pageHeight - 50, pageWidth, 50, 'F');

    // Footer divider line
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.setLineWidth(1);
    doc.line(0, pageHeight - 50, pageWidth, pageHeight - 50);

    // Footer content
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139); // slate-500

    // Left side
    doc.text("© 2025 Rentify Inc. | Confidential & Proprietary", 40, pageHeight - 25);
    doc.text("This report contains sensitive user data - Handle with care", 40, pageHeight - 15);

    // Right side
    doc.text(`Page ${i} of ${pageCount}`, pageWidth - 100, pageHeight - 25);
    doc.text(`Generated: ${currentDate}`, pageWidth - 100, pageHeight - 15);
  }

  // === SAVE WITH ENTERPRISE NAMING ===
  const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
  const filename = `Rentify_UserReport_${timestamp}.pdf`;
  doc.save(filename);

  // Optional: Return doc object for further processing
  return doc;
}

exportListingsPDF() {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
  const currentDate = new Date().toLocaleDateString();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // === ENTERPRISE HEADER ===
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 90, 'F');

  // Logo placeholder
  doc.setFillColor(71, 85, 105); // slate-600
  doc.roundedRect(40, 25, 40, 40, 4, 4, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.text('R', 57, 50);

  // Title
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('Listings Management Report', 100, 45);

  // Subtitle
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(203, 213, 225); // slate-300
  doc.text('Comprehensive Listings Overview & Insights', 100, 62);

  // === REPORT METADATA ===
  const metaY = 120;
  doc.setFillColor(248, 250, 252); // slate-50
  doc.rect(40, metaY, pageWidth - 80, 50, 'F');
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.setLineWidth(1);
  doc.rect(40, metaY, pageWidth - 80, 50);

  doc.setTextColor(71, 85, 105); // slate-600
  doc.setFontSize(10);
  doc.text(`Generated on: ${currentDate}`, 55, metaY + 20);
  doc.text(`Report ID: LST-${Date.now().toString().slice(-6)}`, 55, metaY + 35);

  const reportTime = new Date().toLocaleTimeString();
  doc.text(`Time: ${reportTime}`, 300, metaY + 20);
  doc.text('Classification: Internal Use', 300, metaY + 35);

  // === SUMMARY CARDS ===
  const totalListings = this.filteredListings().length;
  const activeListings = this.filteredListings().filter(l => l.status === 'ACTIVE').length;
  const rentedListings = this.filteredListings().filter(l => l.status === 'RENTED').length;
  const totalViews = this.filteredListings().reduce((sum, l) => sum + (l.views ?? 0), 0);

  const summaryY = 200;
  const cardWidth = 120;
  const cardHeight = 80;
  const cardSpacing = 15;

  const stats = [
    { label: "Total Listings", value: totalListings, bgColor: [59, 130, 246], icon: "📦" },
    { label: "Active Listings", value: activeListings, bgColor: [16, 185, 129], icon: "✅" },
    { label: "Rented Listings", value: rentedListings, bgColor: [249, 115, 22], icon: "🏠" },
    { label: "Total Views", value: totalViews.toLocaleString(), bgColor: [139, 92, 246], icon: "👁️" }
  ];

  stats.forEach((stat, i) => {
    const x = 40 + i * (cardWidth + cardSpacing);

    // Card shadow
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(x + 2, summaryY + 2, cardWidth, cardHeight, 8, 8, 'F');

    // Card background
    doc.setFillColor(stat.bgColor[0], stat.bgColor[1], stat.bgColor[2]);
    doc.roundedRect(x, summaryY, cardWidth, cardHeight, 8, 8, 'F');

    // Card content
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(28);
    doc.setFont('helvetica', 'bold');
    doc.text(`${stat.value}`, x + 15, summaryY + 35);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(stat.label, x + 15, summaryY + 50);
  });

  // === LISTINGS TABLE ===
  const tableStartY = 340;

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59); // slate-800
  doc.text('Listings Directory', 40, tableStartY - 10);

  const tableData = this.filteredListings().map(l => [
    l.title || 'Untitled',
    l.category ? l.category.charAt(0).toUpperCase() + l.category.slice(1) : 'N/A',
    l.price != null ? `Rs${l.price}` : 'N/A',
    (l.views ?? 0).toLocaleString(),
    l.reportCount != null ? l.reportCount.toString() : '0',
    l.createdAt ? new Date(l.createdAt).toLocaleDateString() : 'N/A',
      l.status || 'N/A'
  ]);

  autoTable(doc, {
    head: [['Title', 'Category', 'Price', 'Views', 'Reports', 'Created', 'status']],
    body: tableData,
    startY: tableStartY,
    theme: 'grid',
    styles: {
      fontSize: 9,
      cellPadding: 6,
      textColor: [51, 65, 85], // slate-700
      lineColor: [226, 232, 240], // slate-200
      lineWidth: 0.5
    },
    headStyles: {
      fillColor: [15, 23, 42], // slate-900
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center',
      fontSize: 10,
      cellPadding: 8
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252] // slate-50
    },
    columnStyles: {
      0: { cellWidth: 100, halign: 'left' }, // Title
      1: { cellWidth: 75, halign: 'center' }, // Category
      2: { cellWidth: 65, halign: 'center' }, // Price
      3: { cellWidth: 65, halign: 'center' }, // Status
      4: { cellWidth: 65, halign: 'center' }, // Views
      5: { cellWidth: 65, halign: 'center' }, // Reports
      6: { cellWidth: 75, halign: 'center' }  // Created
    },
    didParseCell: function(data) {
      // Status column coloring
      if (data.column.index === 3) {
        const status = data.cell.text[0];
        if (status === 'ACTIVE') {
          data.cell.styles.fillColor = [240, 253, 244]; // green-50
          data.cell.styles.textColor = [22, 101, 52];   // green-800
        } else if (status === 'RENTED') {
          data.cell.styles.fillColor = [239, 246, 255]; // blue-50
          data.cell.styles.textColor = [30, 64, 175];   // blue-800
        } else {
          data.cell.styles.fillColor = [255, 251, 235]; // amber-50
          data.cell.styles.textColor = [146, 64, 14];   // amber-800
        }
      }
    }
  });

  // === FOOTER ===
  const pageCount = (doc as any).internal.getNumberOfPages();

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);

    doc.setFillColor(248, 250, 252); // slate-50
    doc.rect(0, pageHeight - 50, pageWidth, 50, 'F');

    doc.setDrawColor(226, 232, 240); // slate-200
    doc.setLineWidth(1);
    doc.line(0, pageHeight - 50, pageWidth, pageHeight - 50);

    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139); // slate-500

    doc.text("© 2025 Rentify Inc. | Confidential & Proprietary", 40, pageHeight - 25);
    doc.text("This report contains sensitive data - Handle with care", 40, pageHeight - 15);

    doc.text(`Page ${i} of ${pageCount}`, pageWidth - 100, pageHeight - 25);
    doc.text(`Generated: ${currentDate}`, pageWidth - 100, pageHeight - 15);
  }

  // === SAVE ===
  const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
  const filename = `Rentify_ListingsReport_${timestamp}.pdf`;
  doc.save(filename);

  return doc;
}


  exportActivitiesPDF() {
    const doc = new jsPDF();
    const currentDate = new Date().toLocaleDateString();

    // Header
    doc.setFontSize(20);
    doc.setTextColor(15, 23, 42);
    doc.text('Platform Activities Report', 20, 20);

    doc.setFontSize(12);
    doc.setTextColor(71, 85, 105);
    doc.text(`Generated on: ${currentDate}`, 20, 30);
    doc.text(`Total Activities: ${this.filteredActivities().length}`, 20, 38);

    // Activity summary
    const activityCounts = this.filteredActivities().reduce((acc, a) => {
      acc[a.type ?? 'UNKNOWN'] = (acc[a.type ?? 'UNKNOWN'] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    let yPos = 46;
    Object.entries(activityCounts).forEach(([type, count]) => {
      doc.text(`${type.replace('_', ' ').toUpperCase()}: ${count}`, 20, yPos);
      yPos += 8;
    });

    // Table
    const tableData = this.filteredActivities().map(a => [
      a.description || '',
      (a.type ?? 'UNKNOWN').replace('_', ' ').toUpperCase(),
      `${a.user?.firstName ?? ''} ${a.user?.lastName ?? ''}`.trim(),
      a.timestamp ? new Date(a.timestamp).toLocaleString() : ''
    ]);

    autoTable(doc, {
      head: [['Description', 'Type', 'User', 'Timestamp']],
      body: tableData,
      startY: yPos + 10,
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 3, textColor: [15, 23, 42] },
      headStyles: { fillColor: [248, 250, 252], textColor: [15, 23, 42], fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [248, 250, 252] }
    });

    doc.save(`activities-report-${currentDate}.pdf`);
  }

  exportReportsPDF() {
    const doc = new jsPDF();
    const currentDate = new Date().toLocaleDateString();

    // Header
    doc.setFontSize(20);
    doc.setTextColor(15, 23, 42);
    doc.text('Reports Management Summary', 20, 20);

    doc.setFontSize(12);
    doc.setTextColor(71, 85, 105);
    doc.text(`Generated on: ${currentDate}`, 20, 30);
    doc.text(`Total Reports: ${this.filteredReports().length}`, 20, 38);

    // Status summary
    const pendingReports = this.filteredReports().filter(r => r.status === 'pending').length;
    const resolvedReports = this.filteredReports().filter(r => r.status === 'resolved').length;
    const dismissedReports = this.filteredReports().filter(r => r.status === 'dismissed').length;

    doc.text(`Pending Reports: ${pendingReports}`, 20, 46);
    doc.text(`Resolved Reports: ${resolvedReports}`, 20, 54);
    doc.text(`Dismissed Reports: ${dismissedReports}`, 20, 62);

    // Priority summary
    const highPriority = this.filteredReports().filter(r => r.priority === 'high').length;
    const mediumPriority = this.filteredReports().filter(r => r.priority === 'medium').length;
    const lowPriority = this.filteredReports().filter(r => r.priority === 'low').length;

    doc.text(`High Priority: ${highPriority}`, 120, 46);
    doc.text(`Medium Priority: ${mediumPriority}`, 120, 54);
    doc.text(`Low Priority: ${lowPriority}`, 120, 62);

    // Table
    const tableData = this.filteredReports().map(r => [
      (r.type ?? '').toUpperCase(),
      r.reason || '',
      (r.status ?? '').toUpperCase(),
      (r.priority ?? '').toUpperCase(),
      `${r.reportedBy?.firstName ?? ''} ${r.reportedBy?.lastName ?? ''}`.trim(),
      r.createdAt ? new Date(r.createdAt).toLocaleDateString() : ''
    ]);

    autoTable(doc, {
      head: [['Type', 'Reason', 'Status', 'Priority', 'Reported By', 'Date']],
      body: tableData,
      startY: 75,
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 3, textColor: [15, 23, 42] },
      headStyles: { fillColor: [248, 250, 252], textColor: [15, 23, 42], fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [248, 250, 252] }
    });

    doc.save(`reports-summary-${currentDate}.pdf`);
  }



  exportAnalyticsPDF() {
    const doc = new jsPDF();
    const currentDate = new Date().toLocaleDateString();

    // Header
    doc.setFontSize(20);
    doc.setTextColor(15, 23, 42);
    doc.text('Platform Analytics Report', 20, 20);

    doc.setFontSize(12);
    doc.setTextColor(71, 85, 105);
    doc.text(`Generated on: ${currentDate}`, 20, 30);

    // Overview
    doc.setFontSize(14);
    doc.setTextColor(15, 23, 42);
    doc.text('Platform Overview', 20, 50);

    const stats = this.stats?.() ?? {};
    doc.setFontSize(10);
    doc.setTextColor(71, 85, 105);
    doc.text(`Total Users: ${(stats.totalUsers ?? 0).toLocaleString()}`, 20, 65);
    doc.text(`Active Listings: ${(stats.totalListings ?? 0).toLocaleString()}`, 20, 75);
    doc.text(`Active Rentals: ${(stats.activeRentals ?? 0).toLocaleString()}`, 20, 85);
    doc.text(`Monthly Revenue: Rs${(stats.monthlyRevenue ?? 0).toLocaleString()}`, 20, 95);
    doc.text(`User Growth: +${stats.userGrowth ?? 0}%`, 20, 105);
    doc.text(`Pending Reports: ${stats.pendingReports ?? 0}`, 20, 115);

    // Category performance
    doc.setFontSize(14);
    doc.setTextColor(15, 23, 42);
    doc.text('Category Performance', 20, 135);

    const categoryTableData = (this.categoryStats ?? []).map(c => [
      c.name ?? '',
      (c.listings ?? 0).toString(),
      (c.activeRentals ?? 0).toString(),
      c.listings ? `${(((c.activeRentals ?? 0) / c.listings) * 100).toFixed(1)}%` : '0%'
    ]);

    autoTable(doc, {
      head: [['Category', 'Total Listings', 'Active Rentals', 'Utilization Rate']],
      body: categoryTableData,
      startY: 145,
      theme: 'grid',
      styles: { fontSize: 9, cellPadding: 4, textColor: [15, 23, 42] },
      headStyles: { fillColor: [248, 250, 252], textColor: [15, 23, 42], fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [248, 250, 252] }
    });

    doc.save(`analytics-report-${currentDate}.pdf`);
  }


  getUserStatusClass(status: 'ACTIVE' | 'INACTIVE' | 'BANNED'): string {
    switch (status) {
      case 'ACTIVE': return 'bg-emerald-100 text-emerald-800';
      case 'INACTIVE': return 'bg-amber-100 text-amber-800';
      case 'BANNED': return 'bg-red-100 text-red-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  }

  getListingStatusClass(status: string): string {
    switch (status) {
      case 'ACTIVE': return 'bg-emerald-100 text-emerald-800';
      case 'RENTED': return 'bg-blue-100 text-blue-800';
      case 'INACTIVE': return 'bg-slate-100 text-slate-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  }

  getActivityBadgeClass(type: string): string {
    switch (type) {
      case 'user_registration': return 'bg-blue-100 text-blue-800';
      case 'listing_created': return 'bg-emerald-100 text-emerald-800';
      case 'rental_completed': return 'bg-purple-100 text-purple-800';
      case 'report_submitted': return 'bg-amber-100 text-amber-800';
      case 'payment_processed': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  }

  getReportStatusClass(status: string): string {
    switch (status) {
      case 'pending': return 'bg-amber-100 text-amber-800';
      case 'resolved': return 'bg-emerald-100 text-emerald-800';
      case 'dismissed': return 'bg-slate-100 text-slate-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  }

  getPriorityClass(priority: string): string {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-amber-100 text-amber-800';
      case 'low': return 'bg-blue-100 text-blue-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  }
}

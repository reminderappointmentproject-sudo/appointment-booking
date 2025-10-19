import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../services/auth.service';
import { AdminService } from '../../services/admin.service';
import { UserService } from '../../services/user.service';
import { User, Customer, ServiceProvider, Admin as AdminUser } from '../../models/user.model';

@Component({
  selector: 'app-user-details',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatChipsModule,
    MatDividerModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="container">
      <div class="header-actions">
        <button mat-button (click)="goBack()">
          <mat-icon>arrow_back</mat-icon>
          Back to Dashboard
        </button>
      </div>

      <mat-card class="details-card" *ngIf="user">
        <mat-card-header>
          <mat-card-title>User Details</mat-card-title>
          <mat-card-subtitle>User ID: {{user.id}}</mat-card-subtitle>
          <div class="header-chips">
            <mat-chip [color]="getRoleColor(user.role)" selected>
              {{user.role}}
            </mat-chip>
            <mat-chip [color]="user.active ? 'primary' : 'warn'" selected>
              {{user.active ? 'Active' : 'Inactive'}}
            </mat-chip>
            <mat-chip *ngIf="isServiceProvider() && user.approved" color="accent" selected>
              Approved
            </mat-chip>
            <mat-chip *ngIf="isServiceProvider() && !user.approved" color="warn" selected>
              Pending Approval
            </mat-chip>
          </div>
        </mat-card-header>

        <mat-card-content>
          <div class="details-grid">
            <!-- Basic Information -->
            <div class="detail-section">
              <h3>Basic Information</h3>
              <div class="detail-item">
                <strong>Name:</strong> {{user.firstName}} {{user.lastName}}
              </div>
              <div class="detail-item">
                <strong>Email:</strong> {{user.email}}
              </div>
              <div class="detail-item">
                <strong>Phone:</strong> {{user.phone}}
              </div>
              <div class="detail-item">
                <strong>Role:</strong> {{user.role}}
              </div>
              <div class="detail-item">
                <strong>Status:</strong> 
                <span [class]="user.active ? 'status-active' : 'status-inactive'">
                  {{user.active ? 'Active' : 'Inactive'}}
                </span>
              </div>
              <div class="detail-item">
                <strong>Member Since:</strong> {{formatDate(user.createdAt)}}
              </div>
              <div class="detail-item">
                <strong>Last Updated:</strong> {{formatDate(user.updatedAt)}}
              </div>
            </div>

            <!-- Customer Specific Information -->
            <div class="detail-section" *ngIf="isCustomer()">
              <h3>Customer Information</h3>
              <div class="detail-item" *ngIf="user.address">
                <strong>Address:</strong> {{user.address}}
              </div>
              <div class="detail-item" *ngIf="user.city">
                <strong>City:</strong> {{user.city}}
              </div>
              <div class="detail-item" *ngIf="user.state">
                <strong>State:</strong> {{user.state}}
              </div>
              <div class="detail-item" *ngIf="user.zipCode">
                <strong>Zip Code:</strong> {{user.zipCode}}
              </div>
            </div>

            <!-- Service Provider Specific Information -->
            <div class="detail-section" *ngIf="isServiceProvider()">
              <h3>Service Provider Information</h3>
              <div class="detail-item">
                <strong>Service Type:</strong> {{user.serviceType || 'Not specified'}}
              </div>
              <div class="detail-item" *ngIf="user.qualification">
                <strong>Qualification:</strong> {{user.qualification}}
              </div>
              <div class="detail-item" *ngIf="user.experience">
                <strong>Experience:</strong> {{user.experience}}
              </div>
              <div class="detail-item" *ngIf="user.hourlyRate">
                <strong>Hourly Rate:</strong> ₹{{user.hourlyRate}}
              </div>
              <div class="detail-item" *ngIf="user.bio">
                <strong>Bio:</strong> 
                <div class="bio-content">{{user.bio}}</div>
              </div>
              <div class="detail-item">
                <strong>Approval Status:</strong> 
                <span [class]="user.approved ? 'status-approved' : 'status-pending'">
                  {{user.approved ? 'Approved' : 'Pending Approval'}}
                </span>
              </div>
            </div>

            <!-- Admin Specific Information -->
            <div class="detail-section" *ngIf="isAdminUser()">
              <h3>Admin Information</h3>
              <div class="detail-item" *ngIf="user.department">
                <strong>Department:</strong> {{user.department}}
              </div>
            </div>
          </div>
        </mat-card-content>

        <mat-card-actions>
          <div class="action-buttons">
            <!-- Activation/Deactivation Buttons -->
            <button mat-raised-button color="warn" 
                    *ngIf="user.active"
                    (click)="deactivateUser()">
              <mat-icon>block</mat-icon>
              Deactivate User
            </button>
            <button mat-raised-button color="primary" 
                    *ngIf="!user.active"
                    (click)="activateUser()">
              <mat-icon>check_circle</mat-icon>
              Activate User
            </button>

            <!-- Provider Approval Button -->
            <button mat-raised-button color="accent" 
                    *ngIf="isServiceProvider() && !user.approved"
                    (click)="approveProvider()">
              <mat-icon>verified</mat-icon>
              Approve Provider
            </button>

            <!-- View Appointments Button -->
            <button mat-raised-button color="primary" 
                    *ngIf="isCustomer() || isServiceProvider()"
                    (click)="viewUserAppointments()">
              <mat-icon>event</mat-icon>
              View Appointments
            </button>
          </div>
        </mat-card-actions>
      </mat-card>

      <!-- Loading State -->
      <div *ngIf="loading" class="loading">
        <mat-spinner diameter="50"></mat-spinner>
        <p>Loading user details...</p>
      </div>

      <!-- Error State -->
      <div *ngIf="error" class="error">
        <mat-icon color="warn">error</mat-icon>
        <p>{{error}}</p>
        <button mat-raised-button color="primary" (click)="goBack()">
          Back to Dashboard
        </button>
      </div>
    </div>
  `,
  styles: [`
    .container {
      padding: 20px;
      background-color: #f5f5f5;
      min-height: 100vh;
    }
    .header-actions {
      margin-bottom: 20px;
    }
    .details-card {
      max-width: 800px;
      margin: 0 auto;
    }
    .header-chips {
      display: flex;
      gap: 10px;
      margin-left: auto;
    }
    .details-grid {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    .detail-section {
      padding: 15px;
      background: #fafafa;
      border-radius: 8px;
    }
    .detail-section h3 {
      margin-top: 0;
      color: #3f51b5;
      border-bottom: 2px solid #e0e0e0;
      padding-bottom: 8px;
    }
    .detail-item {
      margin: 8px 0;
      display: flex;
      gap: 10px;
    }
    .detail-item strong {
      min-width: 150px;
    }
    .bio-content {
      background: white;
      padding: 10px;
      border-radius: 4px;
      border-left: 4px solid #3f51b5;
      font-style: italic;
      margin-top: 5px;
    }
    .action-buttons {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }
    .status-active { 
      color: #4caf50; 
      font-weight: bold;
    }
    .status-inactive { 
      color: #f44336; 
      font-weight: bold;
    }
    .status-approved { 
      color: #4caf50; 
      font-weight: bold;
    }
    .status-pending { 
      color: #ff9800; 
      font-weight: bold;
    }
    .loading, .error {
      text-align: center;
      padding: 40px;
    }
    .error mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin-bottom: 10px;
    }
  `]
})
export class UserDetailsComponent implements OnInit {
  user: any;
  loading = false;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private adminService: AdminService,
    private userService: UserService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.loadUserDetails();
  }

  loadUserDetails() {
    this.loading = true;
    const userId = this.route.snapshot.params['id'];
    
    this.userService.getUserById(userId).subscribe({
      next: (user) => {
        this.user = user;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load user details';
        this.loading = false;
        this.snackBar.open('Error loading user details', 'Close', { duration: 3000 });
      }
    });
  }

  isCustomer(): boolean {
    return this.user?.role === 'CUSTOMER';
  }

  isServiceProvider(): boolean {
    return this.user?.role === 'SERVICE_PROVIDER';
  }

  isAdminUser(): boolean {
    return this.user?.role === 'ADMIN';
  }

  getRoleColor(role: string): string {
    switch (role) {
      case 'ADMIN': return 'primary';
      case 'SERVICE_PROVIDER': return 'accent';
      case 'CUSTOMER': return '';
      default: return '';
    }
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  goBack() {
    this.router.navigate(['/admin/dashboard']);
  }

  deactivateUser() {
    if (confirm('Are you sure you want to deactivate this user?')) {
      this.adminService.deactivateUser(this.user.id).subscribe({
        next: () => {
          this.snackBar.open('User deactivated successfully', 'Close', { duration: 3000 });
          this.loadUserDetails(); // Refresh details
        },
        error: (error) => {
          this.snackBar.open('Error deactivating user', 'Close', { duration: 3000 });
        }
      });
    }
  }

  activateUser() {
    this.adminService.activateUser(this.user.id).subscribe({
      next: () => {
        this.snackBar.open('User activated successfully', 'Close', { duration: 3000 });
        this.loadUserDetails(); // Refresh details
      },
      error: (error) => {
        this.snackBar.open('Error activating user', 'Close', { duration: 3000 });
      }
    });
  }

  approveProvider() {
    this.adminService.approveServiceProvider(this.user.id).subscribe({
      next: () => {
        this.snackBar.open('Provider approved successfully', 'Close', { duration: 3000 });
        this.loadUserDetails(); // Refresh details
      },
      error: (error) => {
        this.snackBar.open('Error approving provider', 'Close', { duration: 3000 });
      }
    });
  }

 // Purana method replace karo:
viewUserAppointments() {
  this.router.navigate(['/admin/user', this.user.id, 'appointments']);
}
}
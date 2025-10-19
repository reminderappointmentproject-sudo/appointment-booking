import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from '../../services/auth.service';
import { AdminService } from '../../services/admin.service';
import { Rating } from '../../models/rating.model';

@Component({
  selector: 'app-admin-ratings',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatIconModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatTooltipModule
  ],
  template: `
    <div class="container">
      <div class="header-actions">
        <button mat-button (click)="goBack()">
          <mat-icon>arrow_back</mat-icon>
          Back to Dashboard
        </button>
      </div>

      <mat-card class="ratings-card">
        <mat-card-header>
          <mat-card-title>Platform Ratings & Reviews</mat-card-title>
          <mat-card-subtitle>Manage and monitor all customer feedback</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <!-- Search and Filters -->
          <form [formGroup]="searchForm" (ngSubmit)="onSearch()" class="search-form">
            <div class="filter-row">
              <mat-form-field appearance="outline" class="search-field">
                <mat-label>Search Ratings</mat-label>
                <input matInput formControlName="searchTerm" placeholder="Customer, provider, or comment...">
                <mat-icon matSuffix>search</mat-icon>
              </mat-form-field>

              <button mat-raised-button color="primary" type="submit" [disabled]="loading">
                <mat-icon>search</mat-icon>
                Search
              </button>

              <button mat-button type="button" (click)="clearFilters()" *ngIf="hasActiveFilters()">
                Clear Filters
              </button>

              <button mat-raised-button color="accent" (click)="loadRatingStats()">
                <mat-icon>analytics</mat-icon>
                View Stats
              </button>
            </div>
          </form>

          <!-- Rating Statistics -->
          <div class="stats-section" *ngIf="ratingStats">
            <h3>Rating Statistics</h3>
            <div class="stats-grid">
              <div class="stat-card">
                <div class="stat-number">{{ratingStats.totalRatings || 0}}</div>
                <div class="stat-label">Total Ratings</div>
              </div>
              <div class="stat-card">
                <div class="stat-number">{{ratingStats.averageRating || 0}}</div>
                <div class="stat-label">Average Rating</div>
              </div>
              <div class="stat-card" *ngFor="let dist of getRatingDistribution()">
                <div class="stat-number">{{dist.count}}</div>
                <div class="stat-label">
                  <mat-icon *ngFor="let star of [1,2,3,4,5]" 
                           [class.filled]="star <= dist.rating">
                    {{star <= dist.rating ? 'star' : 'star_border'}}
                  </mat-icon>
                </div>
              </div>
            </div>
          </div>

          <!-- Ratings List -->
          <div class="ratings-list">
            <div class="results-header">
              <h3>All Ratings ({{ratings.length}} total)</h3>
            </div>

            <!-- Loading State -->
            <div *ngIf="loading" class="loading">
              <mat-spinner diameter="40"></mat-spinner>
              <p>Loading ratings...</p>
            </div>

            <!-- No Results -->
            <div *ngIf="!loading && ratings.length === 0" class="no-ratings">
              <mat-icon>reviews</mat-icon>
              <h3>No ratings found</h3>
              <p>No customer ratings available yet.</p>
            </div>

            <!-- Ratings Grid -->
            <div class="ratings-grid" *ngIf="!loading && ratings.length > 0">
              <mat-card *ngFor="let rating of ratings" class="rating-card">
                <mat-card-header>
                  <mat-card-title>
                    {{rating.customer.firstName}} {{rating.customer.lastName}}
                    <span class="rated-text">rated</span>
                    {{rating.serviceProvider.firstName}} {{rating.serviceProvider.lastName}}
                  </mat-card-title>
                  <mat-card-subtitle>
                    {{formatDate(rating.createdAt)}}
                  </mat-card-subtitle>
                  <div class="rating-badge">
                    <mat-icon *ngFor="let star of [1,2,3,4,5]" 
                             [class.filled]="star <= rating.rating">
                      {{star <= rating.rating ? 'star' : 'star_border'}}
                    </mat-icon>
                    <span class="rating-value">{{rating.rating}}/5</span>
                  </div>
                </mat-card-header>

                <mat-card-content>
                  <div class="appointment-info">
                    <strong>Appointment:</strong> {{rating.appointment.serviceType}} • 
                    {{formatDateTime(rating.appointment.appointmentDateTime)}}
                  </div>

                  <div class="rating-comment" *ngIf="rating.comment">
                    <p>"{{rating.comment}}"</p>
                  </div>

                  <div class="contact-info">
                    <div class="contact-item">
                      <strong>Customer:</strong> {{rating.customer.email}} • {{rating.customer.phone}}
                    </div>
                    <div class="contact-item">
                      <strong>Provider:</strong> {{rating.serviceProvider.email}} • {{rating.serviceProvider.phone}}
                    </div>
                  </div>
                </mat-card-content>

                <mat-card-actions>
                  <button mat-button color="primary" (click)="viewCustomer(rating.customer.id)">
                    <mat-icon>person</mat-icon>
                    View Customer
                  </button>
                  <button mat-button color="accent" (click)="viewProvider(rating.serviceProvider.id)">
                    <mat-icon>business_center</mat-icon>
                    View Provider
                  </button>
                  <button mat-button color="warn" (click)="viewAppointment(rating.appointment.id)">
                    <mat-icon>event</mat-icon>
                    View Appointment
                  </button>
                </mat-card-actions>
              </mat-card>
            </div>
          </div>
        </mat-card-content>
      </mat-card>
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
    .ratings-card {
      max-width: 1200px;
      margin: 0 auto;
    }
    .search-form {
      margin-bottom: 30px;
    }
    .filter-row {
      display: flex;
      gap: 15px;
      align-items: flex-end;
      flex-wrap: wrap;
    }
    .search-field {
      flex: 2;
      min-width: 300px;
    }
    .stats-section {
      background: white;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 30px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .stats-section h3 {
      margin-top: 0;
      color: #3f51b5;
      margin-bottom: 20px;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 15px;
    }
    .stat-card {
      text-align: center;
      padding: 15px;
      background: #f8f9fa;
      border-radius: 8px;
      border: 1px solid #e0e0e0;
    }
    .stat-number {
      font-size: 1.8rem;
      font-weight: bold;
      color: #3f51b5;
      margin-bottom: 5px;
    }
    .stat-label {
      color: #666;
      font-size: 0.9rem;
    }
    .stat-label mat-icon {
      font-size: 1rem;
      width: 1rem;
      height: 1rem;
      color: #ffc107;
    }
    .stat-label .filled {
      color: #ff9800;
    }
    .ratings-list {
      margin-top: 20px;
    }
    .results-header {
      margin-bottom: 20px;
    }
    .results-header h3 {
      margin: 0;
      color: #3f51b5;
    }
    .ratings-grid {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    .rating-card {
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .rating-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0,0,0,0.15);
    }
    .rated-text {
      color: #666;
      font-weight: normal;
      font-size: 0.9em;
      margin: 0 8px;
    }
    .rating-badge {
      display: flex;
      align-items: center;
      gap: 4px;
      background: #fff3e0;
      padding: 6px 12px;
      border-radius: 20px;
      margin-left: auto;
    }
    .rating-badge mat-icon {
      color: #ffc107;
      font-size: 1.2rem;
      width: 1.2rem;
      height: 1.2rem;
    }
    .rating-badge .filled {
      color: #ff9800;
    }
    .rating-value {
      font-weight: bold;
      color: #ff9800;
      margin-left: 4px;
    }
    .appointment-info {
      margin-bottom: 10px;
      color: #666;
    }
    .rating-comment {
      background: #f8f9fa;
      padding: 15px;
      border-radius: 8px;
      margin: 15px 0;
      border-left: 4px solid #3f51b5;
    }
    .rating-comment p {
      margin: 0;
      font-style: italic;
      color: #333;
    }
    .contact-info {
      display: flex;
      flex-direction: column;
      gap: 5px;
      font-size: 0.9rem;
      color: #666;
    }
    .contact-item {
      display: flex;
      gap: 10px;
    }
    .loading, .no-ratings {
      text-align: center;
      padding: 40px;
      color: #666;
    }
    .no-ratings mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      margin-bottom: 16px;
      color: #ccc;
    }
  `]
})
export class AdminRatingsComponent implements OnInit {
  searchForm: FormGroup;
  ratings: Rating[] = [];
  ratingStats: any = null;
  loading = false;
  currentUser: any;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private adminService: AdminService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.searchForm = this.createForm();
  }

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    if (!this.currentUser || !this.authService.isAdmin()) {
      this.router.navigate(['/login']);
      return;
    }
    this.loadAllRatings();
    this.loadRatingStats();
  }

  createForm(): FormGroup {
    return this.fb.group({
      searchTerm: ['']
    });
  }

  loadAllRatings() {
    this.loading = true;
    this.adminService.getAllRatings().subscribe({
      next: (ratings) => {
        this.ratings = ratings;
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        this.snackBar.open('Error loading ratings', 'Close', { duration: 3000 });
      }
    });
  }

  loadRatingStats() {
    this.adminService.getRatingStatistics().subscribe({
      next: (stats) => {
        this.ratingStats = stats;
      },
      error: (error) => {
        console.error('Error loading rating stats:', error);
      }
    });
  }

  onSearch() {
    if (this.searchForm.valid) {
      this.loading = true;
      const searchTerm = this.searchForm.value.searchTerm;

      if (searchTerm) {
        this.adminService.searchRatings(searchTerm).subscribe({
          next: (ratings) => {
            this.ratings = ratings;
            this.loading = false;
          },
          error: (error) => {
            this.loading = false;
            this.snackBar.open('Error searching ratings', 'Close', { duration: 3000 });
          }
        });
      } else {
        this.loadAllRatings();
      }
    }
  }

  clearFilters() {
    this.searchForm.reset({ searchTerm: '' });
    this.loadAllRatings();
  }

  hasActiveFilters(): boolean {
    return !!this.searchForm.value.searchTerm;
  }

  getRatingDistribution() {
    if (!this.ratingStats?.ratingDistribution) return [];
    
    const distribution = [];
    for (let i = 5; i >= 1; i--) {
      distribution.push({
        rating: i,
        count: this.ratingStats.ratingDistribution[i] || 0
      });
    }
    return distribution;
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  formatDateTime(dateString: string): string {
    return new Date(dateString).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  viewCustomer(customerId: number) {
    this.router.navigate(['/admin/user', customerId]);
  }

  viewProvider(providerId: number) {
    this.router.navigate(['/admin/user', providerId]);
  }

  viewAppointment(appointmentId: number) {
    this.router.navigate(['/admin/appointment', appointmentId]);
  }

  goBack() {
    this.router.navigate(['/admin/dashboard']);
  }
}
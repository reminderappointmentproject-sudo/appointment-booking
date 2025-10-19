import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../services/auth.service';
import { RatingService } from '../../services/rating.service';
import { UserService } from '../../services/user.service';
import { Rating, RatingStats } from '../../models/rating.model';

@Component({
  selector: 'app-provider-ratings',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
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

      <mat-card class="ratings-card">
        <mat-card-header>
          <mat-card-title>Customer Reviews</mat-card-title>
          <mat-card-subtitle>Feedback from your customers</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <!-- Rating Stats -->
          <div class="rating-stats" *ngIf="ratingStats">
            <div class="overall-rating">
              <div class="average-rating">{{ratingStats.averageRating}}</div>
              <div class="stars">
                <mat-icon *ngFor="let star of getStars(ratingStats.averageRating)" 
                         [class.half]="star === 0.5"
                         [class.full]="star === 1">
                  {{star === 0.5 ? 'star_half' : 'star'}}
                </mat-icon>
              </div>
              <div class="rating-count">Based on {{ratingStats.ratingCount}} reviews</div>
            </div>
          </div>

          <!-- Ratings List -->
          <div class="ratings-list" *ngIf="ratings.length > 0">
            <div *ngFor="let rating of ratings" class="rating-item">
              <div class="rating-header">
                <div class="customer-info">
                  <strong>{{rating.customer.firstName}} {{rating.customer.lastName}}</strong>
                  <div class="rating-stars">
                    <mat-icon *ngFor="let star of [1,2,3,4,5]" 
                             [class.filled]="star <= rating.rating">
                      {{star <= rating.rating ? 'star' : 'star_border'}}
                    </mat-icon>
                  </div>
                </div>
                <div class="rating-date">{{formatDate(rating.createdAt)}}</div>
              </div>
              
              <div class="rating-comment" *ngIf="rating.comment">
                "{{rating.comment}}"
              </div>

              <div class="appointment-info">
                Service: {{rating.appointment.serviceType}} • 
                {{formatDate(rating.appointment.appointmentDateTime)}}
              </div>
            </div>
          </div>

          <!-- No Ratings -->
          <div *ngIf="ratings.length === 0 && !loading" class="no-ratings">
            <mat-icon>reviews</mat-icon>
            <h3>No Reviews Yet</h3>
            <p>You haven't received any reviews from customers yet.</p>
            <p>Complete appointments to get feedback from your customers.</p>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Loading State -->
      <div *ngIf="loading" class="loading">
        <mat-spinner diameter="50"></mat-spinner>
        <p>Loading reviews...</p>
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
    .ratings-card {
      max-width: 800px;
      margin: 0 auto;
    }
    .rating-stats {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px;
      border-radius: 8px;
      margin-bottom: 30px;
      text-align: center;
    }
    .average-rating {
      font-size: 3rem;
      font-weight: bold;
      margin-bottom: 10px;
    }
    .stars {
      display: flex;
      justify-content: center;
      gap: 2px;
      margin-bottom: 10px;
    }
    .stars mat-icon {
      color: #ffc107;
      font-size: 1.5rem;
      width: 1.5rem;
      height: 1.5rem;
    }
    .stars .half {
      color: #ffc107;
    }
    .stars .full {
      color: #ffc107;
    }
    .rating-count {
      font-size: 0.9rem;
      opacity: 0.9;
    }
    .ratings-list {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    .rating-item {
      background: white;
      padding: 20px;
      border-radius: 8px;
      border: 1px solid #e0e0e0;
    }
    .rating-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 10px;
    }
    .customer-info strong {
      display: block;
      margin-bottom: 5px;
    }
    .rating-stars {
      display: flex;
      gap: 2px;
    }
    .rating-stars mat-icon {
      color: #ffc107;
      font-size: 1.2rem;
      width: 1.2rem;
      height: 1.2rem;
    }
    .rating-stars .filled {
      color: #ff9800;
    }
    .rating-date {
      color: #666;
      font-size: 0.9rem;
    }
    .rating-comment {
      font-style: italic;
      color: #333;
      margin: 10px 0;
      padding-left: 10px;
      border-left: 3px solid #3f51b5;
    }
    .appointment-info {
      color: #666;
      font-size: 0.8rem;
      margin-top: 10px;
    }
    .no-ratings {
      text-align: center;
      padding: 40px;
      color: #666;
    }
    .no-ratings mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      margin-bottom: 20px;
      color: #ccc;
    }
    .loading {
      text-align: center;
      padding: 40px;
    }
  `]
})
export class ProviderRatingsComponent implements OnInit {
  ratings: Rating[] = [];
  ratingStats: RatingStats | null = null;
  loading = false;
  currentUser: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private ratingService: RatingService,
    private userService: UserService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    if (!this.currentUser || !this.authService.isProvider()) {
      this.router.navigate(['/login']);
      return;
    }
    this.loadRatings();
  }

  loadRatings() {
    this.loading = true;
    
    // Load ratings and stats in parallel
    this.ratingService.getProviderRatings(this.currentUser.id).subscribe({
      next: (ratings) => {
        this.ratings = ratings;
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        this.snackBar.open('Error loading reviews', 'Close', { duration: 3000 });
      }
    });

    this.ratingService.getProviderRatingStats(this.currentUser.id).subscribe({
      next: (stats) => {
        this.ratingStats = stats;
      },
      error: (error) => {
        console.error('Error loading rating stats:', error);
      }
    });
  }

  getStars(averageRating: number): number[] {
    const stars = [];
    const fullStars = Math.floor(averageRating);
    const hasHalfStar = averageRating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(1);
    }
    if (hasHalfStar) {
      stars.push(0.5);
    }
    while (stars.length < 5) {
      stars.push(0);
    }
    return stars;
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  goBack() {
    this.router.navigate(['/provider/dashboard']);
  }
}
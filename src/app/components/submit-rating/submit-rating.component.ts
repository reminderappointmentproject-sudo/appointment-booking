import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider'; // ADD THIS
import { AuthService } from '../../services/auth.service';
import { RatingService } from '../../services/rating.service';
import { AppointmentService } from '../../services/appointment.service';

@Component({
  selector: 'app-submit-rating',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDividerModule // ADD THIS
  ],
  template: `
    <div class="container">
      <mat-card class="rating-card">
        <mat-card-header>
          <mat-card-title>Rate Your Experience</mat-card-title>
          <mat-card-subtitle>Appointment ID: {{appointment?.id}}</mat-card-subtitle>
        </mat-card-header>
        
        <mat-card-content>
          <!-- Appointment Details -->
          <div class="appointment-details" *ngIf="appointment">
            <h3>Appointment Details</h3>
            <div class="detail-item">
              <strong>Service Provider:</strong> {{appointment.providerName}}
            </div>
            <div class="detail-item">
              <strong>Service Type:</strong> {{appointment.serviceType}}
            </div>
            <div class="detail-item">
              <strong>Date:</strong> {{formatDateTime(appointment.appointmentDateTime)}}
            </div>
          </div>

          <mat-divider></mat-divider>

          <!-- Rating Form -->
          <form [formGroup]="ratingForm" (ngSubmit)="onSubmit()" class="rating-form">
            <h3>How was your experience?</h3>
            
            <!-- Star Rating -->
            <div class="star-rating">
              <div class="rating-label">
                <strong>Rating:</strong>
                <span class="rating-value">{{ratingForm.get('rating')?.value || 0}}/5</span>
              </div>
              <div class="stars">
                <button type="button" 
                        *ngFor="let star of [1,2,3,4,5]" 
                        (click)="setRating(star)"
                        class="star-button">
                  <mat-icon [class.filled]="star <= (ratingForm.get('rating')?.value || 0)">
                    {{star <= (ratingForm.get('rating')?.value || 0) ? 'star' : 'star_border'}}
                  </mat-icon>
                </button>
              </div>
            </div>

            <!-- Comment -->
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Your Review (Optional)</mat-label>
              <textarea matInput formControlName="comment" rows="4" placeholder="Share your experience with this service provider..."></textarea>
            </mat-form-field>

            <div class="form-actions">
              <button mat-button type="button" (click)="goBack()">Cancel</button>
              <button mat-raised-button color="primary" type="submit" [disabled]="!ratingForm.valid || loading">
                {{ loading ? 'Submitting...' : 'Submit Review' }}
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>

      <!-- Loading State -->
      <div *ngIf="loading" class="loading">
        <mat-spinner diameter="50"></mat-spinner>
        <p>Loading appointment details...</p>
      </div>
    </div>
  `,
  styles: [`
    .container {
      padding: 20px;
      background-color: #f5f5f5;
      min-height: 100vh;
    }
    .rating-card {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .appointment-details {
      background: #f8f9fa;
      padding: 15px;
      border-radius: 8px;
      margin-bottom: 20px;
    }
    .appointment-details h3 {
      margin-top: 0;
      color: #3f51b5;
    }
    .detail-item {
      margin: 8px 0;
      display: flex;
      gap: 10px;
    }
    .detail-item strong {
      min-width: 150px;
    }
    .rating-form {
      margin-top: 20px;
    }
    .rating-form h3 {
      color: #3f51b5;
      margin-bottom: 20px;
    }
    .star-rating {
      margin-bottom: 20px;
    }
    .rating-label {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 10px;
    }
    .rating-value {
      color: #ff9800;
      font-weight: bold;
    }
    .stars {
      display: flex;
      gap: 5px;
    }
    .star-button {
      background: none;
      border: none;
      cursor: pointer;
      padding: 0;
    }
    .star-button mat-icon {
      font-size: 2rem;
      width: 2rem;
      height: 2rem;
      color: #ffc107;
    }
    .star-button .filled {
      color: #ff9800;
    }
    .full-width {
      width: 100%;
      margin-bottom: 15px;
    }
    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      margin-top: 20px;
    }
    .loading {
      text-align: center;
      padding: 40px;
    }
  `]
})
export class SubmitRatingComponent implements OnInit {
  ratingForm: FormGroup;
  appointment: any;
  loading = false;
  currentUser: any;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private ratingService: RatingService,
    private appointmentService: AppointmentService,
    private snackBar: MatSnackBar
  ) {
    this.ratingForm = this.createForm();
  }

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    if (!this.currentUser || !this.authService.isCustomer()) {
      this.router.navigate(['/login']);
      return;
    }
    this.loadAppointmentDetails();
  }

  createForm(): FormGroup {
    return this.fb.group({
      rating: [0, [Validators.required, Validators.min(1), Validators.max(5)]],
      comment: ['']
    });
  }

  loadAppointmentDetails() {
    this.loading = true;
    const appointmentId = this.route.snapshot.params['id'];
    
    this.appointmentService.getAppointmentById(appointmentId).subscribe({
      next: (appointment) => {
        this.appointment = appointment;
        this.loading = false;
        
        // Check if appointment is completed
        if (appointment.status !== 'COMPLETED') {
          this.snackBar.open('You can only rate completed appointments', 'Close', { duration: 5000 });
          this.goBack();
        }
      },
      error: (error) => {
        this.loading = false;
        this.snackBar.open('Error loading appointment details', 'Close', { duration: 3000 });
        this.goBack();
      }
    });
  }

  setRating(rating: number) {
    this.ratingForm.patchValue({ rating: rating });
  }

  formatDateTime(dateTime: string): string {
    return new Date(dateTime).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  onSubmit() {
    if (this.ratingForm.valid && this.appointment) {
      this.loading = true;

      const ratingData = {
        customerId: this.currentUser.id,
        providerId: this.appointment.providerId,
        appointmentId: this.appointment.id,
        rating: this.ratingForm.value.rating,
        comment: this.ratingForm.value.comment
      };

      this.ratingService.submitRating(ratingData).subscribe({
        next: (rating) => {
          this.loading = false;
          this.snackBar.open('Thank you for your feedback!', 'Close', { duration: 5000 });
          this.router.navigate(['/customer/dashboard']);
        },
        error: (error) => {
          this.loading = false;
          console.error('Rating error:', error);
          this.snackBar.open('Error submitting rating: ' + (error.error?.error || 'Unknown error'), 'Close', { duration: 5000 });
        }
      });
    }
  }

  goBack() {
    this.router.navigate(['/customer/dashboard']);
  }
}
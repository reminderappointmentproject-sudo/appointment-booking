import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'; // ADD THIS
import { AuthService } from '../../services/auth.service';
import { AppointmentService } from '../../services/appointment.service';
import { Appointment, AppointmentStatus } from '../../models/appointment.model';

@Component({
  selector: 'app-appointment-details',
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
    MatProgressSpinnerModule // ADD THIS
  ],
  template: `
    <div class="container">
      <div class="header-actions">
        <button mat-button (click)="goBack()">
          <mat-icon>arrow_back</mat-icon>
          Back to Dashboard
        </button>
      </div>

      <mat-card class="details-card" *ngIf="appointment">
        <mat-card-header>
          <mat-card-title>Appointment Details</mat-card-title>
          <mat-card-subtitle>Appointment ID: {{appointment.id}}</mat-card-subtitle>
          <div class="status-chip">
            <mat-chip [color]="getStatusColor(appointment.status)" selected>
              {{appointment.status}}
            </mat-chip>
          </div>
        </mat-card-header>

        <mat-card-content>
          <div class="details-grid">
            <!-- Customer Information -->
            <div class="detail-section">
              <h3>Customer Information</h3>
              <div class="detail-item">
                <strong>Name:</strong> {{appointment.customerName}}
              </div>
              <div class="detail-item" *ngIf="isProvider()">
                <strong>Customer ID:</strong> {{appointment.customerId}}
              </div>
            </div>

            <!-- Provider Information -->
            <div class="detail-section">
              <h3>Service Provider Information</h3>
              <div class="detail-item">
                <strong>Name:</strong> {{appointment.providerName}}
              </div>
              <div class="detail-item" *ngIf="isCustomer()">
                <strong>Provider ID:</strong> {{appointment.providerId}}
              </div>
              <div class="detail-item">
                <strong>Service Type:</strong> {{appointment.serviceType}}
              </div>
            </div>

            <mat-divider></mat-divider>

            <!-- Appointment Details -->
            <div class="detail-section">
              <h3>Appointment Details</h3>
              <div class="detail-item">
                <strong>Date & Time:</strong> {{formatDateTime(appointment.appointmentDateTime)}}
              </div>
              <div class="detail-item">
                <strong>Duration:</strong> {{appointment.duration}} minutes
              </div>
              <div class="detail-item">
                <strong>End Time:</strong> {{formatDateTime(appointment.endDateTime)}}
              </div>
              <div class="detail-item">
                <strong>Status:</strong> 
                <span [class]="'status-' + appointment.status.toLowerCase()">
                  {{appointment.status}}
                </span>
              </div>
            </div>

            <!-- Notes -->
            <div class="detail-section" *ngIf="appointment.notes">
              <h3>Additional Notes</h3>
              <div class="notes-content">
                {{appointment.notes}}
              </div>
            </div>

            <!-- Timestamps -->
            <div class="detail-section">
              <h3>Timestamps</h3>
              <div class="detail-item">
                <strong>Created:</strong> {{formatDateTime(appointment.createdAt)}}
              </div>
              <div class="detail-item">
                <strong>Last Updated:</strong> {{formatDateTime(appointment.updatedAt)}}
              </div>
            </div>
          </div>
        </mat-card-content>

        <mat-card-actions>
          <!-- Customer Actions -->
          <div *ngIf="isCustomer()" class="action-buttons">
            <button mat-raised-button color="accent" 
                    (click)="rescheduleAppointment()"
                    [disabled]="appointment.status === 'CANCELLED' || appointment.status === 'COMPLETED'">
              <mat-icon>schedule</mat-icon>
              Reschedule
            </button>
            <button mat-raised-button color="warn" 
                    (click)="cancelAppointment()"
                    [disabled]="appointment.status === 'CANCELLED' || appointment.status === 'COMPLETED'">
              <mat-icon>cancel</mat-icon>
              Cancel Appointment
            </button>
          </div>

          <!-- Provider Actions -->
          <div *ngIf="isProvider()" class="action-buttons">
            <button mat-raised-button color="primary" 
                    (click)="updateStatus(AppointmentStatus.CONFIRMED)"
                    *ngIf="appointment.status === AppointmentStatus.PENDING">
              <mat-icon>check_circle</mat-icon>
              Confirm Appointment
            </button>
            <button mat-raised-button color="accent" 
                    (click)="updateStatus(AppointmentStatus.COMPLETED)"
                    *ngIf="appointment.status === AppointmentStatus.CONFIRMED">
              <mat-icon>done_all</mat-icon>
              Mark as Completed
            </button>
            <button mat-raised-button color="warn" 
                    (click)="updateStatus(AppointmentStatus.CANCELLED)"
                    *ngIf="appointment.status !== AppointmentStatus.CANCELLED && appointment.status !== AppointmentStatus.COMPLETED">
              <mat-icon>cancel</mat-icon>
              Cancel Appointment
            </button>
          </div>
        </mat-card-actions>
      </mat-card>

      <!-- Loading State -->
      <div *ngIf="loading" class="loading">
        <mat-spinner diameter="50"></mat-spinner>
        <p>Loading appointment details...</p>
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
    .status-chip {
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
      min-width: 120px;
    }
    .notes-content {
      background: white;
      padding: 15px;
      border-radius: 4px;
      border-left: 4px solid #3f51b5;
      font-style: italic;
    }
    .action-buttons {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }
    .status-pending { 
      color: #ff9800; 
      font-weight: bold;
    }
    .status-confirmed { 
      color: #4caf50; 
      font-weight: bold;
    }
    .status-cancelled { 
      color: #f44336; 
      font-weight: bold;
    }
    .status-completed { 
      color: #2196f3; 
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
export class AppointmentDetailsComponent implements OnInit {
  appointment: any;
  loading = false;
  error = '';
  AppointmentStatus = AppointmentStatus;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private appointmentService: AppointmentService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.loadAppointmentDetails();
  }

  loadAppointmentDetails() {
    this.loading = true;
    const appointmentId = this.route.snapshot.params['id'];
    
    this.appointmentService.getAppointmentById(appointmentId).subscribe({
      next: (appointment) => {
        this.appointment = appointment;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load appointment details';
        this.loading = false;
        this.snackBar.open('Error loading appointment details', 'Close', { duration: 3000 });
      }
    });
  }

 // isCustomer() method mein add karo:
isCustomer(): boolean {
  return this.authService.isCustomer() || this.authService.isAdmin();
}

// isProvider() method mein add karo:
isProvider(): boolean {
  return this.authService.isProvider() || this.authService.isAdmin();
}
  formatDateTime(dateTime: string): string {
    return new Date(dateTime).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'PENDING': return 'accent';
      case 'CONFIRMED': return 'primary';
      case 'COMPLETED': return 'primary';
      case 'CANCELLED': return 'warn';
      default: return '';
    }
  }

// goBack() method update karo:
goBack() {
  if (this.authService.isCustomer()) {
    this.router.navigate(['/customer/dashboard']);
  } else if (this.authService.isProvider()) {
    this.router.navigate(['/provider/dashboard']);
  } else if (this.authService.isAdmin()) {
    this.router.navigate(['/admin/dashboard']);
  } else {
    this.router.navigate(['/login']);
  }
}

  rescheduleAppointment() {
    this.snackBar.open('Reschedule feature coming soon!', 'Close', { duration: 3000 });
  }

  cancelAppointment() {
    if (confirm('Are you sure you want to cancel this appointment?')) {
      this.appointmentService.cancelAppointment(this.appointment.id).subscribe({
        next: () => {
          this.snackBar.open('Appointment cancelled successfully', 'Close', { duration: 3000 });
          this.loadAppointmentDetails(); // Refresh details
        },
        error: (error) => {
          this.snackBar.open('Error cancelling appointment', 'Close', { duration: 3000 });
        }
      });
    }
  }

  updateStatus(status: AppointmentStatus) {
    const statusText = status.toLowerCase();
    
    if (status === AppointmentStatus.CANCELLED) {
      if (!confirm('Are you sure you want to cancel this appointment?')) {
        return;
      }
    }

    this.appointmentService.updateAppointmentStatus(this.appointment.id, status).subscribe({
      next: () => {
        this.snackBar.open(`Appointment ${statusText} successfully`, 'Close', { duration: 3000 });
        this.loadAppointmentDetails(); // Refresh details
      },
      error: (error) => {
        this.snackBar.open('Error updating appointment status', 'Close', { duration: 3000 });
      }
    });
  }
}
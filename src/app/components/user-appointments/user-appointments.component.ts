import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { AdminService } from '../../services/admin.service';
import { UserService } from '../../services/user.service';
import { AppointmentService } from '../../services/appointment.service';
import { Appointment, AppointmentStatus } from '../../models/appointment.model';

@Component({
  selector: 'app-user-appointments',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatTableModule,
    MatIconModule,
    MatSnackBarModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatSelectModule,
    FormsModule
  ],
  template: `
    <div class="container">
      <div class="header-actions">
        <button mat-button (click)="goBack()">
          <mat-icon>arrow_back</mat-icon>
          Back to User Details
        </button>
      </div>

      <mat-card class="appointments-card">
        <mat-card-header>
          <mat-card-title>
            Appointments for {{user?.firstName}} {{user?.lastName}}
          </mat-card-title>
          <mat-card-subtitle>
            {{getUserTypeText()}} - {{appointments.length}} total appointments
          </mat-card-subtitle>
          <div class="filters">
            <mat-form-field appearance="outline" class="filter-field">
              <mat-label>Filter by Status</mat-label>
              <mat-select [(value)]="selectedStatus" (selectionChange)="applyFilter()">
                <mat-option value="ALL">All Appointments</mat-option>
                <mat-option value="PENDING">Pending</mat-option>
                <mat-option value="CONFIRMED">Confirmed</mat-option>
                <mat-option value="COMPLETED">Completed</mat-option>
                <mat-option value="CANCELLED">Cancelled</mat-option>
              </mat-select>
            </mat-form-field>

            <button mat-button (click)="clearFilters()" *ngIf="selectedStatus !== 'ALL'">
              Clear Filter
            </button>
          </div>
        </mat-card-header>

        <mat-card-content>
          <!-- Statistics -->
          <div class="stats" *ngIf="appointments.length > 0">
            <div class="stat-item">
              <span class="stat-number">{{pendingAppointments.length}}</span>
              <span class="stat-label">Pending</span>
            </div>
            <div class="stat-item">
              <span class="stat-number">{{confirmedAppointments.length}}</span>
              <span class="stat-label">Confirmed</span>
            </div>
            <div class="stat-item">
              <span class="stat-number">{{completedAppointments.length}}</span>
              <span class="stat-label">Completed</span>
            </div>
            <div class="stat-item">
              <span class="stat-number">{{cancelledAppointments.length}}</span>
              <span class="stat-label">Cancelled</span>
            </div>
          </div>

          <!-- Appointments Table -->
          <table mat-table [dataSource]="filteredAppointments" class="mat-elevation-z8">
            <!-- Customer/Provider Column -->
            <ng-container [matColumnDef]="isCustomerView ? 'provider' : 'customer'">
              <th mat-header-cell *matHeaderCellDef>
                {{isCustomerView ? 'Service Provider' : 'Customer'}}
              </th>
              <td mat-cell *matCellDef="let appointment">
                {{isCustomerView ? appointment.providerName : appointment.customerName}}
              </td>
            </ng-container>

            <!-- Date Column -->
            <ng-container matColumnDef="date">
              <th mat-header-cell *matHeaderCellDef>Date & Time</th>
              <td mat-cell *matCellDef="let appointment">
                {{formatDateTime(appointment.appointmentDateTime)}}
              </td>
            </ng-container>

            <!-- Service Type Column -->
            <ng-container matColumnDef="serviceType">
              <th mat-header-cell *matHeaderCellDef>Service Type</th>
              <td mat-cell *matCellDef="let appointment">{{appointment.serviceType}}</td>
            </ng-container>

            <!-- Duration Column -->
            <ng-container matColumnDef="duration">
              <th mat-header-cell *matHeaderCellDef>Duration</th>
              <td mat-cell *matCellDef="let appointment">{{appointment.duration}} minutes</td>
            </ng-container>

            <!-- Status Column -->
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let appointment">
                <mat-chip [color]="getStatusColor(appointment.status)" selected>
                  {{appointment.status}}
                </mat-chip>
              </td>
            </ng-container>

            <!-- Actions Column -->
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Actions</th>
              <td mat-cell *matCellDef="let appointment">
                <button mat-icon-button color="primary" 
                        (click)="viewAppointmentDetails(appointment.id)"
                        matTooltip="View Details">
                  <mat-icon>visibility</mat-icon>
                </button>
                <button mat-icon-button color="warn" 
                        *ngIf="appointment.status !== 'CANCELLED' && appointment.status !== 'COMPLETED'"
                        (click)="cancelAppointment(appointment.id)"
                        matTooltip="Cancel Appointment">
                  <mat-icon>cancel</mat-icon>
                </button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>

          <div *ngIf="filteredAppointments.length === 0" class="no-data">
            <mat-icon>event_busy</mat-icon>
            <p *ngIf="selectedStatus === 'ALL'">No appointments found.</p>
            <p *ngIf="selectedStatus !== 'ALL'">No {{selectedStatus.toLowerCase()}} appointments found.</p>
            <button mat-raised-button color="primary" (click)="clearFilters()" *ngIf="selectedStatus !== 'ALL'">
              Show All Appointments
            </button>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Loading State -->
      <div *ngIf="loading" class="loading">
        <mat-spinner diameter="50"></mat-spinner>
        <p>Loading appointments...</p>
      </div>

      <!-- Error State -->
      <div *ngIf="error" class="error">
        <mat-icon color="warn">error</mat-icon>
        <p>{{error}}</p>
        <button mat-raised-button color="primary" (click)="goBack()">
          Back to User Details
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
    .appointments-card {
      max-width: 1000px;
      margin: 0 auto;
    }
    .filters {
      display: flex;
      align-items: center;
      gap: 15px;
      margin-left: auto;
    }
    .filter-field {
      width: 200px;
    }
    .stats {
      display: flex;
      gap: 20px;
      margin-bottom: 20px;
      padding: 15px;
      background: #f8f9fa;
      border-radius: 8px;
    }
    .stat-item {
      text-align: center;
      flex: 1;
    }
    .stat-number {
      display: block;
      font-size: 1.5rem;
      font-weight: bold;
      color: #3f51b5;
    }
    .stat-label {
      display: block;
      color: #666;
      font-size: 0.9rem;
    }
    .no-data {
      text-align: center;
      padding: 40px;
      color: #666;
    }
    .no-data mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin-bottom: 10px;
      color: #ccc;
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
export class UserAppointmentsComponent implements OnInit {
  user: any;
  appointments: any[] = [];
  filteredAppointments: any[] = [];
  selectedStatus: string = 'ALL';
  loading = false;
  error = '';
  displayedColumns: string[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private adminService: AdminService,
    private userService: UserService,
    private appointmentService: AppointmentService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.loadUserAndAppointments();
  }

  get isCustomerView(): boolean {
    return this.user?.role === 'CUSTOMER';
  }

  get pendingAppointments() {
    return this.appointments.filter(a => a.status === 'PENDING');
  }

  get confirmedAppointments() {
    return this.appointments.filter(a => a.status === 'CONFIRMED');
  }

  get completedAppointments() {
    return this.appointments.filter(a => a.status === 'COMPLETED');
  }

  get cancelledAppointments() {
    return this.appointments.filter(a => a.status === 'CANCELLED');
  }

  loadUserAndAppointments() {
    this.loading = true;
    const userId = this.route.snapshot.params['id'];
    
    // Load user details first
    this.userService.getUserById(userId).subscribe({
      next: (user) => {
        this.user = user;
        this.setDisplayedColumns();
        this.loadAppointments(userId, user.role);
      },
      error: (error) => {
        this.error = 'Failed to load user details';
        this.loading = false;
        this.snackBar.open('Error loading user details', 'Close', { duration: 3000 });
      }
    });
  }

  setDisplayedColumns() {
    if (this.isCustomerView) {
      this.displayedColumns = ['provider', 'date', 'serviceType', 'duration', 'status', 'actions'];
    } else {
      this.displayedColumns = ['customer', 'date', 'serviceType', 'duration', 'status', 'actions'];
    }
  }

  loadAppointments(userId: number, role: string) {
    if (role === 'CUSTOMER') {
      this.appointmentService.getCustomerAppointments(userId).subscribe({
        next: (appointments) => {
          this.appointments = appointments;
          this.applyFilter();
          this.loading = false;
        },
        error: (error) => {
          this.error = 'Failed to load customer appointments';
          this.loading = false;
          this.snackBar.open('Error loading appointments', 'Close', { duration: 3000 });
        }
      });
    } else if (role === 'SERVICE_PROVIDER') {
      this.appointmentService.getProviderAppointments(userId).subscribe({
        next: (appointments) => {
          this.appointments = appointments;
          this.applyFilter();
          this.loading = false;
        },
        error: (error) => {
          this.error = 'Failed to load provider appointments';
          this.loading = false;
          this.snackBar.open('Error loading appointments', 'Close', { duration: 3000 });
        }
      });
    } else {
      this.loading = false;
      this.snackBar.open('Admin users do not have appointments', 'Close', { duration: 3000 });
    }
  }

  applyFilter() {
    if (this.selectedStatus === 'ALL') {
      this.filteredAppointments = this.appointments;
    } else {
      this.filteredAppointments = this.appointments.filter(
        appointment => appointment.status === this.selectedStatus
      );
    }
  }

  clearFilters() {
    this.selectedStatus = 'ALL';
    this.applyFilter();
  }

  formatDateTime(dateTime: string): string {
    return new Date(dateTime).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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

  getUserTypeText(): string {
    switch (this.user?.role) {
      case 'CUSTOMER': return 'Customer';
      case 'SERVICE_PROVIDER': return 'Service Provider';
      case 'ADMIN': return 'Administrator';
      default: return 'User';
    }
  }

  viewAppointmentDetails(appointmentId: number) {
    // Open appointment details in new tab or navigate
    this.router.navigate(['/admin/appointment', appointmentId]);
  }

  cancelAppointment(appointmentId: number) {
    if (confirm('Are you sure you want to cancel this appointment?')) {
      this.appointmentService.cancelAppointment(appointmentId).subscribe({
        next: () => {
          this.snackBar.open('Appointment cancelled successfully', 'Close', { duration: 3000 });
          this.loadAppointments(this.user.id, this.user.role);
        },
        error: (error) => {
          this.snackBar.open('Error cancelling appointment', 'Close', { duration: 3000 });
        }
      });
    }
  }

  goBack() {
    this.router.navigate(['/admin/user', this.user.id]);
  }
}
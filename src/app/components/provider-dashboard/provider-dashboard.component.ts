import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { AppointmentService } from '../../services/appointment.service';
import { Appointment, AppointmentStatus } from '../../models/appointment.model';

@Component({
  selector: 'app-provider-dashboard',
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
    MatTooltipModule,
    MatFormFieldModule,
    MatSelectModule,
    FormsModule
  ],
  template: `
    <div class="dashboard-container">
      <header class="dashboard-header">
        <h1>Service Provider Dashboard</h1>
        <div class="user-info">
          <span>Welcome, {{currentUser?.firstName}}!</span>
          <button mat-button routerLink="/provider/profile">My Profile</button>
          <button mat-button (click)="logout()">Logout</button>
        </div>
      </header>

      <div class="dashboard-content">
        <!-- Statistics Cards -->
        <div class="stats-cards">
          <mat-card class="stat-card">
            <mat-card-content>
              <div class="stat-number">{{appointments.length}}</div>
              <div class="stat-label">Total Appointments</div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card">
            <mat-card-content>
              <div class="stat-number">{{pendingAppointments.length}}</div>
              <div class="stat-label">Pending</div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card">
            <mat-card-content>
              <div class="stat-number">{{confirmedAppointments.length}}</div>
              <div class="stat-label">Confirmed</div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card">
            <mat-card-content>
              <div class="stat-number">{{completedAppointments.length}}</div>
              <div class="stat-label">Completed</div>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Quick Actions -->
        <div class="quick-actions">
          <button mat-raised-button color="primary" (click)="navigateToAvailability()">
            <mat-icon>schedule</mat-icon>
            Manage Availability
          </button>
          <button mat-raised-button color="accent" routerLink="/provider/ratings">
            <mat-icon>reviews</mat-icon>
            View Reviews
          </button>
          <button mat-raised-button color="accent" routerLink="/provider/notifications">
            <mat-icon>notifications</mat-icon>
            Notifications
          </button>
        </div>

        <!-- Appointments Table with Filters -->
        <mat-card class="appointments-card">
          <mat-card-header>
            <mat-card-title>My Appointments</mat-card-title>
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
            <table mat-table [dataSource]="filteredAppointments" class="mat-elevation-z8">
              <!-- Customer Column -->
              <ng-container matColumnDef="customer">
                <th mat-header-cell *matHeaderCellDef>Customer</th>
                <td mat-cell *matCellDef="let appointment">
                  {{appointment.customerName}}
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
                  <button mat-icon-button color="primary" (click)="viewAppointment(appointment.id)" 
                          matTooltip="View Details">
                    <mat-icon>visibility</mat-icon>
                  </button>
                  <button mat-icon-button color="accent" 
                          (click)="rescheduleAppointment(appointment.id)"
                          *ngIf="appointment.status !== 'CANCELLED' && appointment.status !== 'COMPLETED'"
                          matTooltip="Reschedule">
                    <mat-icon>schedule</mat-icon>
                  </button>
                  <button mat-icon-button color="primary" 
                          (click)="updateStatus(appointment.id, AppointmentStatus.CONFIRMED)"
                          *ngIf="appointment.status === AppointmentStatus.PENDING"
                          matTooltip="Confirm Appointment">
                    <mat-icon>check_circle</mat-icon>
                  </button>
                  <button mat-icon-button color="accent" 
                          (click)="updateStatus(appointment.id, AppointmentStatus.COMPLETED)"
                          *ngIf="appointment.status === AppointmentStatus.CONFIRMED"
                          matTooltip="Mark as Completed">
                    <mat-icon>done_all</mat-icon>
                  </button>
                  <button mat-icon-button color="warn" 
                          (click)="updateStatus(appointment.id, AppointmentStatus.CANCELLED)"
                          *ngIf="appointment.status !== AppointmentStatus.CANCELLED && appointment.status !== AppointmentStatus.COMPLETED"
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
              <p *ngIf="selectedStatus === 'ALL'">When customers book appointments, they will appear here.</p>
              <button mat-raised-button color="primary" (click)="clearFilters()" *ngIf="selectedStatus !== 'ALL'">
                Show All Appointments
              </button>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 20px;
      background-color: #f5f5f5;
      min-height: 100vh;
    }
    .dashboard-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .stats-cards {
      display: flex;
      gap: 20px;
      margin-bottom: 30px;
    }
    .stat-card {
      flex: 1;
      text-align: center;
    }
    .stat-number {
      font-size: 2rem;
      font-weight: bold;
      color: #3f51b5;
    }
    .stat-label {
      color: #666;
      margin-top: 5px;
    }
    .quick-actions {
      display: flex;
      gap: 15px;
      margin-bottom: 30px;
    }
    .appointments-card {
      margin-bottom: 30px;
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
  `]
})
export class ProviderDashboardComponent implements OnInit {
  currentUser: any;
  appointments: any[] = [];
  filteredAppointments: any[] = [];
  selectedStatus: string = 'ALL';
  displayedColumns: string[] = ['customer', 'date', 'serviceType', 'duration', 'status', 'actions'];
  AppointmentStatus = AppointmentStatus;

  constructor(
    private authService: AuthService,
    private appointmentService: AppointmentService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    if (!this.currentUser || !this.authService.isProvider()) {
      this.router.navigate(['/login']);
      return;
    }
    this.loadAppointments();
  }

  get pendingAppointments() {
    return this.appointments.filter(a => a.status === AppointmentStatus.PENDING);
  }

  get confirmedAppointments() {
    return this.appointments.filter(a => a.status === AppointmentStatus.CONFIRMED);
  }

  get completedAppointments() {
    return this.appointments.filter(a => a.status === AppointmentStatus.COMPLETED);
  }

  loadAppointments() {
    this.appointmentService.getProviderAppointments(this.currentUser.id).subscribe({
      next: (appointments) => {
        console.log('Provider appointments loaded:', appointments);
        this.appointments = appointments;
        this.applyFilter(); // Apply initial filter
      },
      error: (error) => {
        console.error('Error loading appointments:', error);
        this.snackBar.open('Error loading appointments', 'Close', { duration: 3000 });
      }
    });
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

  viewAppointment(appointmentId: number) {
    this.router.navigate(['/provider/appointment', appointmentId]);
  }

  rescheduleAppointment(appointmentId: number) {
    this.router.navigate(['/provider/reschedule', appointmentId]);
  }

  updateStatus(appointmentId: number, status: AppointmentStatus) {
    const statusText = status.toLowerCase();
    
    if (status === AppointmentStatus.CANCELLED) {
      if (!confirm('Are you sure you want to cancel this appointment?')) {
        return;
      }
    }

    this.appointmentService.updateAppointmentStatus(appointmentId, status).subscribe({
      next: () => {
        this.snackBar.open(`Appointment ${statusText} successfully`, 'Close', { duration: 3000 });
        this.loadAppointments();
      },
      error: (error) => {
        this.snackBar.open('Error updating appointment', 'Close', { duration: 3000 });
      }
    });
  }

  navigateToAvailability() {
    this.router.navigate(['/provider/availability']);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
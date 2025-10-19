import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { AppointmentService } from '../../services/appointment.service';
import { UserService } from '../../services/user.service';
import { Appointment, AppointmentStatus } from '../../models/appointment.model';
import { ServiceProvider } from '../../models/user.model';

@Component({
  selector: 'app-customer-dashboard',
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
    MatFormFieldModule,
    MatSelectModule,
    FormsModule
  ],
  template: `
    <div class="dashboard-container">
      <header class="dashboard-header">
        <h1>Customer Dashboard</h1>
        <div class="user-info">
          <span>Welcome, {{currentUser?.firstName}}!</span>
          <button mat-button routerLink="/customer/profile">My Profile</button>
          <button mat-button (click)="logout()">Logout</button>
        </div>
      </header>

      <div class="dashboard-content">
        <!-- Quick Actions -->
        <div class="quick-actions">
          <mat-card class="action-card">
            <mat-card-header>
              <mat-card-title>Book Appointment</mat-card-title>
            </mat-card-header>
            <mat-card-actions>
              <button mat-raised-button color="primary" (click)="navigateToBookAppointment()">
                Book Now
              </button>
            </mat-card-actions>
          </mat-card>

          <mat-card class="action-card">
            <mat-card-header>
              <mat-card-title>Find Providers</mat-card-title>
            </mat-card-header>
            <mat-card-actions>
              <button mat-raised-button color="accent" routerLink="/customer/search-providers">
                Search Providers
              </button>
            </mat-card-actions>
          </mat-card>

          <mat-card class="action-card">
            <mat-card-header>
              <mat-card-title>My Appointments</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <p>Total: {{appointments.length}}</p>
              <p>Pending: {{pendingAppointments.length}}</p>
              <p>Confirmed: {{confirmedAppointments.length}}</p>
              <p>Completed: {{completedAppointments.length}}</p>
            </mat-card-content>
          </mat-card>
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
              <!-- Service Provider Column -->
              <ng-container matColumnDef="provider">
                <th mat-header-cell *matHeaderCellDef>Service Provider</th>
                <td mat-cell *matCellDef="let appointment">
                  {{appointment.providerName}}
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
                  <span [class]="'status-' + appointment.status.toLowerCase()">
                    {{appointment.status}}
                  </span>
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
                          [disabled]="appointment.status === 'CANCELLED' || appointment.status === 'COMPLETED'"
                          matTooltip="Reschedule">
                    <mat-icon>schedule</mat-icon>
                  </button>
                  <button mat-icon-button color="primary" 
                          (click)="rateAppointment(appointment.id)"
                          *ngIf="appointment.status === 'COMPLETED'"
                          matTooltip="Rate Service">
                    <mat-icon>star_rate</mat-icon>
                  </button>
                  <button mat-icon-button color="warn" 
                          (click)="cancelAppointment(appointment.id)"
                          [disabled]="appointment.status === 'CANCELLED' || appointment.status === 'COMPLETED'"
                          matTooltip="Cancel">
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
              <button mat-raised-button color="primary" (click)="navigateToBookAppointment()" *ngIf="selectedStatus === 'ALL'">
                Book Your First Appointment
              </button>
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
    .quick-actions {
      display: flex;
      gap: 20px;
      margin-bottom: 30px;
    }
    .action-card {
      flex: 1;
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
    .status-pending { 
      color: #ff9800; 
      font-weight: bold;
      background: #fff3e0;
      padding: 4px 8px;
      border-radius: 4px;
    }
    .status-confirmed { 
      color: #4caf50; 
      font-weight: bold;
      background: #e8f5e8;
      padding: 4px 8px;
      border-radius: 4px;
    }
    .status-cancelled { 
      color: #f44336; 
      font-weight: bold;
      background: #ffebee;
      padding: 4px 8px;
      border-radius: 4px;
    }
    .status-completed { 
      color: #2196f3; 
      font-weight: bold;
      background: #e3f2fd;
      padding: 4px 8px;
      border-radius: 4px;
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
export class CustomerDashboardComponent implements OnInit {
  currentUser: any;
  appointments: any[] = [];
  filteredAppointments: any[] = [];
  selectedStatus: string = 'ALL';
  displayedColumns: string[] = ['provider', 'date', 'serviceType', 'duration', 'status', 'actions'];

  constructor(
    private authService: AuthService,
    private appointmentService: AppointmentService,
    private userService: UserService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    if (!this.currentUser) {
      this.router.navigate(['/login']);
      return;
    }
    this.loadAppointments();
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

  loadAppointments() {
    this.appointmentService.getCustomerAppointments(this.currentUser.id).subscribe({
      next: (appointments) => {
        console.log('Appointments loaded:', appointments);
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

  navigateToBookAppointment() {
    this.router.navigate(['/customer/book-appointment']);
  }

  viewAppointment(appointmentId: number) {
    this.router.navigate(['/customer/appointment', appointmentId]);
  }

  rescheduleAppointment(appointmentId: number) {
    this.router.navigate(['/customer/reschedule', appointmentId]);
  }

  rateAppointment(appointmentId: number) {
    this.router.navigate(['/customer/rate', appointmentId]);
  }

  cancelAppointment(appointmentId: number) {
    if (confirm('Are you sure you want to cancel this appointment?')) {
      this.appointmentService.cancelAppointment(appointmentId).subscribe({
        next: () => {
          this.snackBar.open('Appointment cancelled successfully', 'Close', { duration: 3000 });
          this.loadAppointments();
        },
        error: (error) => {
          this.snackBar.open('Error cancelling appointment', 'Close', { duration: 3000 });
        }
      });
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
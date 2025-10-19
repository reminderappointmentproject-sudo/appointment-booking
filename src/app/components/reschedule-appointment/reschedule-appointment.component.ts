import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AuthService } from '../../services/auth.service';
import { AppointmentService } from '../../services/appointment.service';
import { MatDividerModule } from '@angular/material/divider'; // ADD THIS
@Component({
  selector: 'app-reschedule-appointment',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatDialogModule,
    MatDividerModule 
  ],
  template: `
    <div class="reschedule-container">
      <mat-card class="reschedule-card">
        <mat-card-header>
          <mat-card-title>Reschedule Appointment</mat-card-title>
          <mat-card-subtitle>Appointment ID: {{appointment?.id}}</mat-card-subtitle>
        </mat-card-header>
        
        <mat-card-content>
          <!-- Current Appointment Details -->
          <div class="current-appointment" *ngIf="appointment">
            <h3>Current Appointment</h3>
            <div class="detail-item">
              <strong>Provider:</strong> {{appointment.providerName}}
            </div>
            <div class="detail-item">
              <strong>Current Date & Time:</strong> {{formatDateTime(appointment.appointmentDateTime)}}
            </div>
            <div class="detail-item">
              <strong>Service:</strong> {{appointment.serviceType}}
            </div>
            <div class="detail-item">
              <strong>Duration:</strong> {{appointment.duration}} minutes
            </div>
          </div>

          <mat-divider></mat-divider>

          <!-- Reschedule Form -->
          <form [formGroup]="rescheduleForm" (ngSubmit)="onSubmit()" class="reschedule-form">
            <h3>Select New Date & Time</h3>
            
            <div class="row">
              <mat-form-field appearance="outline" class="half-width">
                <mat-label>New Date</mat-label>
                <input matInput [matDatepicker]="picker" formControlName="newDate" [min]="minDate">
                <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
                <mat-datepicker #picker></mat-datepicker>
                <mat-error *ngIf="rescheduleForm.get('newDate')?.hasError('required')">
                  Date is required
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="half-width">
                <mat-label>New Time</mat-label>
                <input matInput type="time" formControlName="newTime">
                <mat-error *ngIf="rescheduleForm.get('newTime')?.hasError('required')">
                  Time is required
                </mat-error>
              </mat-form-field>
            </div>

            <div class="duration-info">
              <p><strong>Duration:</strong> {{appointment?.duration}} minutes</p>
              <p><strong>New End Time:</strong> {{calculateEndTime()}}</p>
            </div>

            <div class="form-actions">
              <button mat-button type="button" (click)="goBack()">Cancel</button>
              <button mat-raised-button color="primary" type="submit" [disabled]="!rescheduleForm.valid || loading">
                {{ loading ? 'Rescheduling...' : 'Reschedule Appointment' }}
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .reschedule-container {
      padding: 20px;
      background-color: #f5f5f5;
      min-height: 100vh;
    }
    .reschedule-card {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .current-appointment {
      background: #f8f9fa;
      padding: 15px;
      border-radius: 8px;
      margin-bottom: 20px;
    }
    .current-appointment h3 {
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
    .reschedule-form {
      margin-top: 20px;
    }
    .reschedule-form h3 {
      color: #3f51b5;
      margin-bottom: 20px;
    }
    .half-width {
      width: 48%;
      margin-bottom: 15px;
    }
    .row {
      display: flex;
      justify-content: space-between;
    }
    .duration-info {
      background: #e3f2fd;
      padding: 15px;
      border-radius: 8px;
      margin: 15px 0;
    }
    .duration-info p {
      margin: 5px 0;
    }
    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      margin-top: 20px;
    }
  `]
})
export class RescheduleAppointmentComponent implements OnInit {
  rescheduleForm: FormGroup;
  appointment: any;
  loading = false;
  minDate: Date;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private appointmentService: AppointmentService,
    private snackBar: MatSnackBar
  ) {
    this.rescheduleForm = this.createForm();
    this.minDate = new Date(); // Today's date
  }

  ngOnInit() {
    const appointmentId = this.route.snapshot.params['id'];
    this.loadAppointmentDetails(appointmentId);
  }

  createForm(): FormGroup {
    return this.fb.group({
      newDate: ['', Validators.required],
      newTime: ['', Validators.required]
    });
  }

  loadAppointmentDetails(appointmentId: number) {
    this.appointmentService.getAppointmentById(appointmentId).subscribe({
      next: (appointment) => {
        this.appointment = appointment;
        this.setInitialFormValues(appointment);
      },
      error: (error) => {
        this.snackBar.open('Error loading appointment details', 'Close', { duration: 3000 });
        this.goBack();
      }
    });
  }

  setInitialFormValues(appointment: any) {
    const currentDate = new Date(appointment.appointmentDateTime);
    
    // Set form with current appointment date/time
    this.rescheduleForm.patchValue({
      newDate: currentDate,
      newTime: this.formatTime(currentDate)
    });
  }

  formatTime(date: Date): string {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
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

  calculateEndTime(): string {
    if (!this.rescheduleForm.value.newDate || !this.rescheduleForm.value.newTime || !this.appointment) {
      return 'Please select date and time';
    }

    const date = new Date(this.rescheduleForm.value.newDate);
    const [hours, minutes] = this.rescheduleForm.value.newTime.split(':');
    
    date.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    const endTime = new Date(date.getTime() + this.appointment.duration * 60000);

    return endTime.toLocaleString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  }

  onSubmit() {
    if (this.rescheduleForm.valid && this.appointment) {
      this.loading = true;

      const formValue = this.rescheduleForm.value;
      
      // Combine date and time into ISO string
      const date = new Date(formValue.newDate);
      const [hours, minutes] = formValue.newTime.split(':');
      date.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      
      const newDateTime = date.toISOString();

      this.appointmentService.rescheduleAppointment(this.appointment.id, newDateTime).subscribe({
        next: (updatedAppointment) => {
          this.loading = false;
          this.snackBar.open('Appointment rescheduled successfully!', 'Close', { duration: 5000 });
          
          // Redirect based on user role
          if (this.authService.isCustomer()) {
            this.router.navigate(['/customer/dashboard']);
          } else if (this.authService.isProvider()) {
            this.router.navigate(['/provider/dashboard']);
          }
        },
        error: (error) => {
          this.loading = false;
          console.error('Reschedule error:', error);
          this.snackBar.open('Reschedule failed: ' + (error.error?.error || 'Time slot not available'), 'Close', { duration: 5000 });
        }
      });
    }
  }

  goBack() {
    if (this.authService.isCustomer()) {
      this.router.navigate(['/customer/dashboard']);
    } else if (this.authService.isProvider()) {
      this.router.navigate(['/provider/dashboard']);
    } else {
      this.router.navigate(['/login']);
    }
  }
}
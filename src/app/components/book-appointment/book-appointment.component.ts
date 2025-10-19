import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { AppointmentService } from '../../services/appointment.service';
import { ServiceProvider } from '../../models/user.model';
import { MatIconModule } from '@angular/material/icon'; // ADD THIS
@Component({
  selector: 'app-book-appointment',
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
    MatDatepickerModule,
    MatNativeDateModule,
    MatSnackBarModule,
    MatIconModule 
  ],
  template: `
    <div class="container">
      <mat-card class="booking-card">
        <mat-card-header>
          <mat-card-title>Book New Appointment</mat-card-title>
          <mat-card-subtitle *ngIf="selectedProvider">
            Booking with: {{selectedProvider.firstName}} {{selectedProvider.lastName}}
          </mat-card-subtitle>
        </mat-card-header>
        
        <mat-card-content>
          <div class="navigation-actions">
            <button mat-button color="primary" routerLink="/customer/search-providers">
              <mat-icon>arrow_back</mat-icon>
              Back to Search
            </button>
          </div>

          <form [formGroup]="bookingForm" (ngSubmit)="onSubmit()">
            <!-- Service Provider Selection -->
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Select Service Provider</mat-label>
              <mat-select formControlName="providerId" (selectionChange)="onProviderChange($event)">
                <mat-option *ngFor="let provider of serviceProviders" [value]="provider.id">
                  {{provider.firstName}} {{provider.lastName}} - {{provider.serviceType}}
                </mat-option>
              </mat-select>
              <mat-error *ngIf="bookingForm.get('providerId')?.hasError('required')">
                Please select a service provider
              </mat-error>
            </mat-form-field>

            <!-- Service Type -->
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Service Type</mat-label>
              <input matInput formControlName="serviceType">
              <mat-error *ngIf="bookingForm.get('serviceType')?.hasError('required')">
                Service type is required
              </mat-error>
            </mat-form-field>

            <!-- Date and Time -->
            <div class="row">
              <mat-form-field appearance="outline" class="half-width">
                <mat-label>Appointment Date</mat-label>
                <input matInput [matDatepicker]="picker" formControlName="appointmentDate">
                <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
                <mat-datepicker #picker></mat-datepicker>
                <mat-error *ngIf="bookingForm.get('appointmentDate')?.hasError('required')">
                  Date is required
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="half-width">
                <mat-label>Time</mat-label>
                <input matInput type="time" formControlName="appointmentTime">
                <mat-error *ngIf="bookingForm.get('appointmentTime')?.hasError('required')">
                  Time is required
                </mat-error>
              </mat-form-field>
            </div>

            <!-- Duration -->
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Duration (minutes)</mat-label>
              <input matInput type="number" formControlName="duration" min="15" max="240">
              <mat-error *ngIf="bookingForm.get('duration')?.hasError('required')">
                Duration is required
              </mat-error>
            </mat-form-field>

            <!-- Notes -->
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Additional Notes</mat-label>
              <textarea matInput formControlName="notes" rows="3"></textarea>
            </mat-form-field>

            <div class="form-actions">
              <button mat-button type="button" routerLink="/customer/dashboard">Cancel</button>
              <button mat-raised-button color="primary" type="submit" [disabled]="!bookingForm.valid || loading">
                {{ loading ? 'Booking...' : 'Book Appointment' }}
              </button>
            </div>
          </form>
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
    .booking-card {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .navigation-actions {
      margin-bottom: 20px;
    }
    .full-width {
      width: 100%;
      margin-bottom: 15px;
    }
    .half-width {
      width: 48%;
      margin-bottom: 15px;
    }
    .row {
      display: flex;
      justify-content: space-between;
    }
    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      margin-top: 20px;
    }
  `]
})
export class BookAppointmentComponent implements OnInit {
  bookingForm: FormGroup;
  serviceProviders: ServiceProvider[] = [];
  selectedProvider: ServiceProvider | null = null;
  loading = false;
  currentUser: any;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private userService: UserService,
    private appointmentService: AppointmentService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {
    this.bookingForm = this.fb.group({
      providerId: ['', Validators.required],
      serviceType: ['', Validators.required],
      appointmentDate: ['', Validators.required],
      appointmentTime: ['', Validators.required],
      duration: [60, [Validators.required, Validators.min(15), Validators.max(240)]],
      notes: ['']
    });
  }

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    if (!this.currentUser || !this.authService.isCustomer()) {
      this.router.navigate(['/login']);
      return;
    }

    // Check for provider ID in query params
    this.route.queryParams.subscribe(params => {
      const providerId = params['providerId'];
      if (providerId) {
        this.bookingForm.patchValue({ providerId: parseInt(providerId) });
      }
    });

    this.loadServiceProviders();
  }

  loadServiceProviders() {
    this.userService.getAllServiceProviders().subscribe({
      next: (providers) => {
        this.serviceProviders = providers;
        
        // If provider ID is set in form, find and set the provider
        const providerId = this.bookingForm.get('providerId')?.value;
        if (providerId) {
          this.selectedProvider = providers.find(p => p.id === providerId) || null;
          if (this.selectedProvider) {
            this.bookingForm.patchValue({
              serviceType: this.selectedProvider.serviceType
            });
          }
        }
      },
      error: (error) => {
        this.snackBar.open('Error loading service providers', 'Close', { duration: 3000 });
      }
    });
  }

  onProviderChange(event: any) {
    const providerId = event.value;
    this.selectedProvider = this.serviceProviders.find(p => p.id === providerId) || null;
    
    if (this.selectedProvider) {
      this.bookingForm.patchValue({
        serviceType: this.selectedProvider.serviceType
      });
    }
  }

  onSubmit() {
    if (this.bookingForm.valid) {
      this.loading = true;
      
      const formValue = this.bookingForm.value;
      
      // Combine date and time into ISO string
      const date = new Date(formValue.appointmentDate);
      const time = formValue.appointmentTime;
      
      const [hours, minutes] = time.split(':');
      date.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      
      const dateTimeString = date.toISOString();

      const bookingData = {
        customerId: this.currentUser.id,
        providerId: formValue.providerId,
        appointmentDateTime: dateTimeString,
        duration: formValue.duration,
        serviceType: formValue.serviceType,
        notes: formValue.notes
      };

      console.log('Sending booking data:', bookingData);

      this.appointmentService.bookAppointment(bookingData).subscribe({
        next: (appointment) => {
          this.snackBar.open('Appointment booked successfully!', 'Close', { duration: 5000 });
          this.router.navigate(['/customer/dashboard']);
        },
        error: (error) => {
          this.loading = false;
          console.error('Booking error:', error);
          
          let errorMessage = 'Booking failed: ';
          if (error.error?.error) {
            if (error.error.error.includes("not available")) {
              errorMessage = 'Time slot not available. Please choose a different time.';
            } else if (error.error.error.includes("not approved")) {
              errorMessage = 'Service provider is not approved yet.';
            } else {
              errorMessage += error.error.error;
            }
          } else {
            errorMessage += 'Unknown error occurred';
          }
          
          this.snackBar.open(errorMessage, 'Close', { duration: 5000 });
        },
        complete: () => {
          this.loading = false;
        }
      });
    }
  }
}
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators, FormControl } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { AuthService } from '../../services/auth.service';
import { AvailabilityService } from '../../services/availability.service';

@Component({
  selector: 'app-availability-management',
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
    MatSnackBarModule,
    MatIconModule,
    MatCheckboxModule
  ],
  template: `
    <div class="container">
      <mat-card class="availability-card">
        <mat-card-header>
          <mat-card-title>Manage Availability</mat-card-title>
          <mat-card-subtitle>Set your working hours for each day</mat-card-subtitle>
        </mat-card-header>
        
        <mat-card-content>
          <form [formGroup]="availabilityForm" (ngSubmit)="onSubmit()">
            <div formArrayName="availabilities">
              <div *ngFor="let day of days; let i = index" class="day-row">
                <mat-card class="day-card">
                  <mat-card-content>
                    <div class="day-header">
                      <h3>{{day}}</h3>
                      <mat-checkbox [formControl]="getAvailableControl(i)" (change)="onDayToggle(i, $event)">
                        Available
                      </mat-checkbox>
                    </div>
                    
                    <div class="time-fields" *ngIf="getAvailableControl(i).value">
                      <mat-form-field appearance="outline" class="time-field">
                        <mat-label>Start Time</mat-label>
                        <input matInput type="time" [formControl]="getStartTimeControl(i)" required>
                        <mat-error *ngIf="getStartTimeControl(i).hasError('required')">
                          Start time is required
                        </mat-error>
                      </mat-form-field>

                      <mat-form-field appearance="outline" class="time-field">
                        <mat-label>End Time</mat-label>
                        <input matInput type="time" [formControl]="getEndTimeControl(i)" required>
                        <mat-error *ngIf="getEndTimeControl(i).hasError('required')">
                          End time is required
                        </mat-error>
                      </mat-form-field>
                    </div>

                    <div *ngIf="!getAvailableControl(i).value" class="not-available">
                      <p>Not available on {{day}}</p>
                    </div>
                  </mat-card-content>
                </mat-card>
              </div>
            </div>

            <div class="form-actions">
              <button mat-button type="button" routerLink="/provider/dashboard">Cancel</button>
              <button mat-raised-button color="primary" type="submit" [disabled]="loading || !isFormValid()">
                {{ loading ? 'Saving...' : 'Save Availability' }}
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
    .availability-card {
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    .day-row {
      margin-bottom: 15px;
    }
    .day-card {
      padding: 15px;
    }
    .day-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
    }
    .time-fields {
      display: flex;
      gap: 15px;
    }
    .time-field {
      flex: 1;
    }
    .not-available {
      text-align: center;
      padding: 20px;
      background: #f5f5f5;
      border-radius: 4px;
      color: #666;
    }
    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      margin-top: 20px;
    }
  `]
})
export class AvailabilityManagementComponent implements OnInit {
  availabilityForm: FormGroup;
  days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
  loading = false;
  currentUser: any;
  
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private availabilityService: AvailabilityService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.availabilityForm = this.fb.group({
      availabilities: this.fb.array([])
    });
  }

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    if (!this.currentUser || !this.authService.isProvider()) {
      this.router.navigate(['/login']);
      return;
    }
    this.initializeForm();
    this.loadExistingAvailability();
  }

  get availabilities(): FormArray {
    return this.availabilityForm.get('availabilities') as FormArray;
  }

  getAvailableControl(index: number): FormControl {
    return (this.availabilities.at(index) as FormGroup).get('available') as FormControl;
  }

  getStartTimeControl(index: number): FormControl {
    return (this.availabilities.at(index) as FormGroup).get('startTime') as FormControl;
  }

  getEndTimeControl(index: number): FormControl {
    return (this.availabilities.at(index) as FormGroup).get('endTime') as FormControl;
  }

  initializeForm() {
    // Clear existing form array
    while (this.availabilities.length !== 0) {
      this.availabilities.removeAt(0);
    }

    // Initialize with default values (all available)
    this.days.forEach(day => {
      const dayGroup = this.fb.group({
        dayOfWeek: [day],
        startTime: ['09:00', Validators.required],
        endTime: ['17:00', Validators.required],
        available: [true] // Default to available
      });
      
      this.availabilities.push(dayGroup);
    });
  }

  loadExistingAvailability() {
    this.availabilityService.getProviderAvailability(this.currentUser.id).subscribe({
      next: (availabilities) => {
        console.log('Loaded availabilities from backend:', availabilities);
        
        if (availabilities && availabilities.length > 0) {
          this.populateFormWithData(availabilities);
        } else {
          console.log('No existing availability found, using defaults');
          // Keep default values (all available)
        }
      },
      error: (error) => {
        console.error('Error loading availability:', error);
        this.snackBar.open('Error loading availability data', 'Close', { duration: 3000 });
      }
    });
  }

  populateFormWithData(availabilities: any[]) {
    console.log('Populating form with:', availabilities);
    
    // First, set all days to unavailable
    this.availabilities.controls.forEach((control, index) => {
      const dayGroup = control as FormGroup;
      dayGroup.patchValue({
        available: false,
        startTime: '09:00',
        endTime: '17:00'
      });
    });

    // Then update with actual data from backend
    availabilities.forEach(avail => {
      const dayIndex = this.days.indexOf(avail.dayOfWeek);
      console.log(`Processing ${avail.dayOfWeek} at index ${dayIndex}:`, avail);
      
      if (dayIndex !== -1) {
        const dayGroup = this.availabilities.at(dayIndex) as FormGroup;
        
        // Format time from backend (remove seconds if present)
        const startTime = avail.startTime ? avail.startTime.substring(0, 5) : '09:00';
        const endTime = avail.endTime ? avail.endTime.substring(0, 5) : '17:00';
        
        dayGroup.patchValue({
          available: avail.available !== false, // Default to true if not specified
          startTime: startTime,
          endTime: endTime
        });
        
        console.log(`Updated ${avail.dayOfWeek}: available=${avail.available}, start=${startTime}, end=${endTime}`);
      }
    });
  }

  onDayToggle(index: number, event: any) {
    const isAvailable = event.checked;
    const dayGroup = this.availabilities.at(index) as FormGroup;
    
    if (!isAvailable) {
      dayGroup.get('startTime')?.clearValidators();
      dayGroup.get('endTime')?.clearValidators();
    } else {
      dayGroup.get('startTime')?.setValidators(Validators.required);
      dayGroup.get('endTime')?.setValidators(Validators.required);
    }
    
    dayGroup.get('startTime')?.updateValueAndValidity();
    dayGroup.get('endTime')?.updateValueAndValidity();
  }

  isFormValid(): boolean {
    return this.availabilityForm.valid;
  }

  onSubmit() {
    if (this.availabilityForm.valid) {
      this.loading = true;
      
      const formValue = this.availabilities.value;
      console.log('Form data before processing:', formValue);

      // Process all days - including unavailable ones
      const availabilities = formValue.map((avail: any) => ({
        dayOfWeek: avail.dayOfWeek,
        startTime: avail.available ? avail.startTime + ':00' : '00:00:00',
        endTime: avail.available ? avail.endTime + ':00' : '00:00:00',
        available: avail.available
      }));

      console.log('Processed availability data for backend:', availabilities);

      this.availabilityService.setAvailability(this.currentUser.id, availabilities).subscribe({
        next: (response) => {
          console.log('Save successful:', response);
          this.snackBar.open('Availability saved successfully!', 'Close', { duration: 3000 });
          this.router.navigate(['/provider/dashboard']);
        },
        error: (error) => {
          this.loading = false;
          console.error('Save error:', error);
          this.snackBar.open('Error saving availability: ' + (error.error?.error || 'Unknown error'), 'Close', { duration: 5000 });
        },
        complete: () => {
          this.loading = false;
        }
      });
    } else {
      this.snackBar.open('Please fill all required fields', 'Close', { duration: 3000 });
    }
  }
}
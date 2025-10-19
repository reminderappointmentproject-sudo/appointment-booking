import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-profile',
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
    MatSelectModule
  ],
  template: `
    <div class="container">
      <mat-card class="profile-card">
        <mat-card-header>
          <mat-card-title>My Profile</mat-card-title>
          <mat-card-subtitle>Update your personal information</mat-card-subtitle>
        </mat-card-header>
        
        <mat-card-content>
          <form [formGroup]="profileForm" (ngSubmit)="onSubmit()">
            <!-- Basic Information -->
            <div class="section">
              <h3>Basic Information</h3>
              <div class="row">
                <mat-form-field appearance="outline" class="half-width">
                  <mat-label>First Name</mat-label>
                  <input matInput formControlName="firstName">
                  <mat-error *ngIf="profileForm.get('firstName')?.hasError('required')">
                    First name is required
                  </mat-error>
                </mat-form-field>

                <mat-form-field appearance="outline" class="half-width">
                  <mat-label>Last Name</mat-label>
                  <input matInput formControlName="lastName">
                  <mat-error *ngIf="profileForm.get('lastName')?.hasError('required')">
                    Last name is required
                  </mat-error>
                </mat-form-field>
              </div>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Email</mat-label>
                <input matInput formControlName="email" type="email" readonly>
                <mat-hint>Email cannot be changed</mat-hint>
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Phone</mat-label>
                <input matInput formControlName="phone">
                <mat-error *ngIf="profileForm.get('phone')?.hasError('required')">
                  Phone is required
                </mat-error>
              </mat-form-field>
            </div>

            <!-- Customer Specific Fields -->
            <div class="section" *ngIf="isCustomer()">
              <h3>Address Information</h3>
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Address</mat-label>
                <input matInput formControlName="address">
              </mat-form-field>

              <div class="row">
                <mat-form-field appearance="outline" class="half-width">
                  <mat-label>City</mat-label>
                  <input matInput formControlName="city">
                </mat-form-field>

                <mat-form-field appearance="outline" class="half-width">
                  <mat-label>State</mat-label>
                  <input matInput formControlName="state">
                </mat-form-field>
              </div>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Zip Code</mat-label>
                <input matInput formControlName="zipCode">
              </mat-form-field>
            </div>

            <!-- Provider Specific Fields -->
            <div class="section" *ngIf="isProvider()">
              <h3>Professional Information</h3>
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Service Type</mat-label>
                <input matInput formControlName="serviceType">
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Qualification</mat-label>
                <input matInput formControlName="qualification">
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Experience</mat-label>
                <input matInput formControlName="experience">
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Bio</mat-label>
                <textarea matInput formControlName="bio" rows="3"></textarea>
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Hourly Rate (₹)</mat-label>
                <input matInput type="number" formControlName="hourlyRate">
              </mat-form-field>
            </div>

            <!-- Admin Specific Fields -->
            <div class="section" *ngIf="isAdmin()">
              <h3>Admin Information</h3>
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Department</mat-label>
                <input matInput formControlName="department">
              </mat-form-field>
            </div>

            <div class="form-actions">
              <button mat-button type="button" (click)="goBack()">Cancel</button>
              <button mat-raised-button color="primary" type="submit" [disabled]="!profileForm.valid || loading">
                {{ loading ? 'Saving...' : 'Save Changes' }}
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
    .profile-card {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .section {
      margin-bottom: 30px;
      padding: 20px;
      background: #fafafa;
      border-radius: 8px;
    }
    .section h3 {
      margin-top: 0;
      color: #3f51b5;
      border-bottom: 2px solid #e0e0e0;
      padding-bottom: 8px;
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
export class ProfileComponent implements OnInit {
  profileForm: FormGroup;
  currentUser: any;
  loading = false;
  originalData: any;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private userService: UserService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.profileForm = this.createForm();
  }

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    if (!this.currentUser) {
      this.router.navigate(['/login']);
      return;
    }
    this.loadUserProfile();
  }

  createForm(): FormGroup {
    return this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      // Customer fields
      address: [''],
      city: [''],
      state: [''],
      zipCode: [''],
      // Provider fields
      serviceType: [''],
      qualification: [''],
      experience: [''],
      bio: [''],
      hourlyRate: [0],
      // Admin fields
      department: ['']
    });
  }

  loadUserProfile() {
    this.userService.getUserProfile(this.currentUser.id).subscribe({
      next: (user) => {
        this.originalData = user;
        this.populateForm(user);
      },
      error: (error) => {
        this.snackBar.open('Error loading profile', 'Close', { duration: 3000 });
      }
    });
  }

  populateForm(user: any) {
    this.profileForm.patchValue({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      address: user.address || '',
      city: user.city || '',
      state: user.state || '',
      zipCode: user.zipCode || '',
      serviceType: user.serviceType || '',
      qualification: user.qualification || '',
      experience: user.experience || '',
      bio: user.bio || '',
      hourlyRate: user.hourlyRate || 0,
      department: user.department || ''
    });
  }

  isCustomer(): boolean {
    return this.authService.isCustomer();
  }

  isProvider(): boolean {
    return this.authService.isProvider();
  }

  isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  onSubmit() {
    if (this.profileForm.valid) {
      this.loading = true;
      
      const formData = this.profileForm.value;
      
      this.userService.updateUserProfile(this.currentUser.id, formData).subscribe({
        next: (updatedUser) => {
          this.loading = false;
          this.snackBar.open('Profile updated successfully!', 'Close', { duration: 3000 });
          
          // Update local storage with new data
          localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        },
        error: (error) => {
          this.loading = false;
          this.snackBar.open('Error updating profile', 'Close', { duration: 3000 });
        }
      });
    }
  }

  goBack() {
    if (this.isCustomer()) {
      this.router.navigate(['/customer/dashboard']);
    } else if (this.isProvider()) {
      this.router.navigate(['/provider/dashboard']);
    } else if (this.isAdmin()) {
      this.router.navigate(['/admin/dashboard']);
    }
  }
}
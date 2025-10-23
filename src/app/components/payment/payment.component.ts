import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../services/auth.service';
import { PaymentService } from '../../services/payment.service';
import { AppointmentService } from '../../services/appointment.service';

@Component({
  selector: 'app-payment',
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
    MatProgressSpinnerModule,
    MatIconModule,
    MatDividerModule
  ],
  template: `
    <div class="container">
      <mat-card class="payment-card">
        <mat-card-header>
          <mat-card-title>Complete Payment</mat-card-title>
          <mat-card-subtitle>Appointment ID: {{appointment?.id}}</mat-card-subtitle>
        </mat-card-header>
        
        <mat-card-content>
          <!-- Appointment Summary -->
          @if (appointment) {
            <div class="appointment-summary">
              <h3>Appointment Details</h3>
              <div class="detail-item">
                <strong>Provider:</strong> {{appointment.providerName}}
              </div>
              <div class="detail-item">
                <strong>Service:</strong> {{appointment.serviceType}}
              </div>
              <div class="detail-item">
                <strong>Date & Time:</strong> {{formatDateTime(appointment.appointmentDateTime)}}
              </div>
              <div class="detail-item">
                <strong>Duration:</strong> {{appointment.duration}} minutes
              </div>
              <div class="detail-item total-amount">
                <strong>Total Amount:</strong> ₹{{calculateAmount()}}
              </div>
            </div>
          }

          <mat-divider></mat-divider>

          <!-- Payment Form -->
          <form [formGroup]="paymentForm" (ngSubmit)="onSubmit()" class="payment-form">
            <h3>Payment Information</h3>
            
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Card Number</mat-label>
              <input matInput formControlName="cardNumber" placeholder="1234 5678 9012 3456" maxlength="16">
              @if (paymentForm.get('cardNumber')?.hasError('required')) {
                <mat-error>Card number is required</mat-error>
              }
              @if (paymentForm.get('cardNumber')?.hasError('pattern')) {
                <mat-error>Please enter a valid 16-digit card number</mat-error>
              }
            </mat-form-field>

            <div class="row">
              <mat-form-field appearance="outline" class="half-width">
                <mat-label>Expiry Date</mat-label>
                <input matInput formControlName="expiryDate" placeholder="MM/YY" maxlength="5">
                @if (paymentForm.get('expiryDate')?.hasError('required')) {
                  <mat-error>Expiry date is required</mat-error>
                }
                @if (paymentForm.get('expiryDate')?.hasError('pattern')) {
                  <mat-error>Format: MM/YY</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline" class="half-width">
                <mat-label>CVV</mat-label>
                <input matInput formControlName="cvv" type="password" maxlength="3">
                @if (paymentForm.get('cvv')?.hasError('required')) {
                  <mat-error>CVV is required</mat-error>
                }
                @if (paymentForm.get('cvv')?.hasError('pattern')) {
                  <mat-error>3 digits required</mat-error>
                }
              </mat-form-field>
            </div>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Cardholder Name</mat-label>
              <input matInput formControlName="cardholderName">
              @if (paymentForm.get('cardholderName')?.hasError('required')) {
                <mat-error>Cardholder name is required</mat-error>
              }
            </mat-form-field>

            <div class="security-note">
              <mat-icon>lock</mat-icon>
              <span>Your payment information is secure and encrypted</span>
            </div>

            <div class="form-actions">
              <button mat-button type="button" (click)="goBack()">Cancel</button>
              <button mat-raised-button color="primary" type="submit" [disabled]="!paymentForm.valid || loading">
                @if (!loading) {
                  <mat-icon>payment</mat-icon>
                }
                {{ loading ? 'Processing...' : 'Pay ₹' + calculateAmount() }}
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
    .payment-card { 
      max-width: 500px; 
      margin: 0 auto; 
      padding: 20px; 
    }
    .appointment-summary { 
      background: #f8f9fa; 
      padding: 15px; 
      border-radius: 8px; 
      margin-bottom: 20px; 
    }
    .appointment-summary h3 {
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
    .total-amount { 
      font-size: 1.2em; 
      font-weight: bold; 
      color: #3f51b5; 
      border-top: 1px solid #ddd;
      padding-top: 8px;
      margin-top: 8px;
    }
    .payment-form h3 { 
      color: #3f51b5; 
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
    .security-note {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #4caf50;
      font-size: 0.9rem;
      margin: 15px 0;
    }
    .form-actions { 
      display: flex; 
      justify-content: flex-end; 
      gap: 10px; 
      margin-top: 20px; 
    }
  `]
})
export class PaymentComponent implements OnInit {
  paymentForm: FormGroup;
  appointment: any;
  loading = false;
  currentUser: any;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private paymentService: PaymentService,
    private appointmentService: AppointmentService,
    private snackBar: MatSnackBar
  ) {
    this.paymentForm = this.createForm();
  }

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    if (!this.currentUser || !this.authService.isCustomer()) {
      this.router.navigate(['/login']);
      return;
    }

    const appointmentId = this.route.snapshot.params['id'];
    this.loadAppointmentDetails(appointmentId);
  }

  createForm(): FormGroup {
    return this.fb.group({
      cardNumber: ['', [Validators.required, Validators.pattern(/^\d{16}$/)]],
      expiryDate: ['', [Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])\/\d{2}$/)]],
      cvv: ['', [Validators.required, Validators.pattern(/^\d{3}$/)]],
      cardholderName: ['', Validators.required]
    });
  }

  loadAppointmentDetails(appointmentId: number) {
    this.appointmentService.getAppointmentById(appointmentId).subscribe({
      next: (appointment) => {
        this.appointment = appointment;
        
        // Check if appointment is already paid
        if (appointment.status === 'CONFIRMED') {
          this.snackBar.open('This appointment is already confirmed and paid', 'Close', { duration: 5000 });
          this.router.navigate(['/customer/dashboard']);
        }
      },
      error: (error) => {
        this.snackBar.open('Error loading appointment details', 'Close', { duration: 3000 });
        this.goBack();
      }
    });
  }

  calculateAmount(): number {
    if (!this.appointment) return 0;
    // Calculate based on provider's hourly rate and duration
    // For now, using fixed rate - in real app, get from provider profile
    const hourlyRate = 500; 
    return Math.round((hourlyRate * this.appointment.duration) / 60);
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
    if (this.paymentForm.valid && this.appointment) {
      this.loading = true;

      // Step 1: Create payment record
      const createPaymentRequest = {
        appointmentId: this.appointment.id,
        amount: this.calculateAmount()
      };

      this.paymentService.createPayment(createPaymentRequest).subscribe({
        next: (payment) => {
          // Step 2: Process payment
          const processPaymentRequest = {
            paymentId: payment.id,
            paymentMethod: 'Credit Card',
            cardLastFour: this.paymentForm.value.cardNumber.slice(-4)
          };

          this.paymentService.processPayment(processPaymentRequest).subscribe({
            next: (processedPayment) => {
              this.loading = false;
              this.snackBar.open('Payment successful! Appointment confirmed.', 'Close', { 
                duration: 5000
              });
              this.router.navigate(['/customer/dashboard']);
            },
            error: (error) => {
              this.loading = false;
              this.snackBar.open('Payment processing failed. Please try again.', 'Close', { 
                duration: 5000
              });
              console.error('Payment error:', error);
            }
          });
        },
        error: (error) => {
          this.loading = false;
          this.snackBar.open('Error creating payment. Please try again.', 'Close', { duration: 5000 });
          console.error('Create payment error:', error);
        }
      });
    }
  }

  goBack() {
    this.router.navigate(['/customer/dashboard']);
  }
}
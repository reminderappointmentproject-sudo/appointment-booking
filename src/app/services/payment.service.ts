import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Payment {
  id: number;
  appointment: any;
  amount: number;
  currency: string;
  status: string;
  transactionId: string;
  paymentMethod: string;
  paymentGateway: string;
  paymentDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePaymentRequest {
  appointmentId: number;
  amount: number;
}

export interface ProcessPaymentRequest {
  paymentId: number;
  paymentMethod: string;
  cardLastFour: string;
}

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  createPayment(request: CreatePaymentRequest): Observable<Payment> {
    return this.http.post<Payment>(`${this.apiUrl}/payments/create`, request);
  }

  processPayment(request: ProcessPaymentRequest): Observable<Payment> {
    return this.http.post<Payment>(`${this.apiUrl}/payments/process`, request);
  }

  getPaymentById(paymentId: number): Observable<Payment> {
    return this.http.get<Payment>(`${this.apiUrl}/payments/${paymentId}`);
  }

  getCustomerPayments(customerId: number): Observable<Payment[]> {
    return this.http.get<Payment[]>(`${this.apiUrl}/payments/customer/${customerId}`);
  }

  getProviderPayments(providerId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/payments/provider/${providerId}`);
  }

  getPaymentStatistics(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/payments/statistics`);
  }
}
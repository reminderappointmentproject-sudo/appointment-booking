import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Appointment, AppointmentStatus } from '../models/appointment.model';

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  bookAppointment(bookingData: any): Observable<Appointment> {
    return this.http.post<Appointment>(`${this.apiUrl}/appointments/book`, bookingData);
  }

  getCustomerAppointments(customerId: number): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(`${this.apiUrl}/appointments/customer/${customerId}`);
  }

  getProviderAppointments(providerId: number): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(`${this.apiUrl}/appointments/provider/${providerId}`);
  }

  rescheduleAppointment(appointmentId: number, newDateTime: string): Observable<Appointment> {
    return this.http.put<Appointment>(`${this.apiUrl}/appointments/${appointmentId}/reschedule`, {
      newDateTime
    });
  }

  cancelAppointment(appointmentId: number): Observable<Appointment> {
    return this.http.put<Appointment>(`${this.apiUrl}/appointments/${appointmentId}/cancel`, {});
  }

  updateAppointmentStatus(appointmentId: number, status: AppointmentStatus): Observable<Appointment> {
    return this.http.put<Appointment>(`${this.apiUrl}/appointments/${appointmentId}/status`, {
      status
    });
  }

  getAppointmentById(appointmentId: number): Observable<Appointment> {
    return this.http.get<Appointment>(`${this.apiUrl}/appointments/${appointmentId}`);
  }

  getAppointmentsByStatus(status: AppointmentStatus): Observable<Appointment[]> {
  return this.http.get<Appointment[]>(`${this.apiUrl}/appointments/status/${status}`);
}


}
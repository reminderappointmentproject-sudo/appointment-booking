import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { CalendarEvent } from '../models/calendar.model';

@Injectable({
  providedIn: 'root'
})
export class CalendarService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getProviderAppointmentsForCalendar(providerId: number): Observable<CalendarEvent[]> {
    return this.http.get<any[]>(`${this.apiUrl}/appointments/provider/${providerId}`).pipe(
      map(appointments => this.mapAppointmentsToCalendarEvents(appointments))
    );
  }

  getCustomerAppointmentsForCalendar(customerId: number): Observable<CalendarEvent[]> {
    return this.http.get<any[]>(`${this.apiUrl}/appointments/customer/${customerId}`).pipe(
      map(appointments => this.mapAppointmentsToCalendarEvents(appointments))
    );
  }

  private mapAppointmentsToCalendarEvents(appointments: any[]): CalendarEvent[] {
    return appointments.map(appointment => {
      const start = new Date(appointment.appointmentDateTime);
      const end = new Date(appointment.endDateTime);
      
      let color = '#3f51b5'; // Default blue
      
      switch (appointment.status) {
        case 'PENDING':
          color = '#ff9800'; // Orange
          break;
        case 'CONFIRMED':
          color = '#4caf50'; // Green
          break;
        case 'COMPLETED':
          color = '#2196f3'; // Blue
          break;
        case 'CANCELLED':
          color = '#f44336'; // Red
          break;
      }

      return {
        id: appointment.id,
        title: `${appointment.customerName} - ${appointment.serviceType}`,
        start: start,
        end: end,
        appointment: appointment,
        color: color
      };
    });
  }
}
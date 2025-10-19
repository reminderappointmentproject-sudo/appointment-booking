import { Customer, ServiceProvider } from "./user.model";

export interface Appointment {
  id: number;
  customer: Customer;
  serviceProvider: ServiceProvider;
  appointmentDateTime: string;
  endDateTime: string;
  duration: number;
  status: AppointmentStatus;
  serviceType: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export enum AppointmentStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  RESCHEDULED = 'RESCHEDULED'
}
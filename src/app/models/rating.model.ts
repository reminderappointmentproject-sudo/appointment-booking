import { Customer, ServiceProvider } from "./user.model";
import { Appointment } from "./appointment.model";

export interface Rating {
  id: number;
  customer: Customer;
  serviceProvider: ServiceProvider;
  appointment: Appointment;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
}

export interface RatingStats {
  averageRating: number;
  ratingCount: number;
}

export interface SubmitRatingRequest {
  customerId: number;
  providerId: number;
  appointmentId: number;
  rating: number;
  comment: string;
}
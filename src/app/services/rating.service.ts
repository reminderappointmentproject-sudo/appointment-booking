import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Rating, RatingStats, SubmitRatingRequest } from '../models/rating.model';

@Injectable({
  providedIn: 'root'
})
export class RatingService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  submitRating(ratingData: SubmitRatingRequest): Observable<Rating> {
    return this.http.post<Rating>(`${this.apiUrl}/ratings/submit`, ratingData);
  }

  getProviderRatings(providerId: number): Observable<Rating[]> {
    return this.http.get<Rating[]>(`${this.apiUrl}/ratings/provider/${providerId}`);
  }

  getProviderRatingStats(providerId: number): Observable<RatingStats> {
    return this.http.get<RatingStats>(`${this.apiUrl}/ratings/provider/${providerId}/stats`);
  }

  getRatingByAppointment(appointmentId: number): Observable<Rating> {
    return this.http.get<Rating>(`${this.apiUrl}/ratings/appointment/${appointmentId}`);
  }
}
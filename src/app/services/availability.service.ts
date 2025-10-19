import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Availability } from '../models/availability.model';

@Injectable({
  providedIn: 'root'
})
export class AvailabilityService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }


  setAvailability(providerId: number, availabilities: any[]): Observable<Availability[]> {
  console.log('Sending availability data:', availabilities); // ADD THIS
  return this.http.post<Availability[]>(`${this.apiUrl}/availability/provider/${providerId}`, availabilities);
}

getProviderAvailability(providerId: number): Observable<Availability[]> {
  console.log('Fetching availability for provider:', providerId); // ADD THIS
  return this.http.get<Availability[]>(`${this.apiUrl}/availability/provider/${providerId}`);
}
}
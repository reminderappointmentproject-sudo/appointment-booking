import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { User, ServiceProvider } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getUserById(userId: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/users/${userId}`);
  }

  updateUser(userId: number, userData: any): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/users/${userId}`, userData);
  }

  getAllServiceProviders(): Observable<ServiceProvider[]> {
    return this.http.get<ServiceProvider[]>(`${this.apiUrl}/users/providers`);
  }

  getServiceProvidersByType(serviceType: string): Observable<ServiceProvider[]> {
    return this.http.get<ServiceProvider[]>(`${this.apiUrl}/users/providers/${serviceType}`);
  }

  deactivateUser(userId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/users/${userId}/deactivate`, {});
  }

  activateUser(userId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/users/${userId}/activate`, {});
  }

  // user.service.ts mein yeh method add karo
updateUserProfile(userId: number, userData: any): Observable<User> {
  return this.http.put<User>(`${this.apiUrl}/users/${userId}`, userData);
}

getUserProfile(userId: number): Observable<User> {
  return this.http.get<User>(`${this.apiUrl}/users/${userId}`);
}
}
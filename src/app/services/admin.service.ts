import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { User, ServiceProvider } from '../models/user.model';
import { Rating } from '../models/rating.model';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  approveServiceProvider(providerId: number): Observable<ServiceProvider> {
    return this.http.put<ServiceProvider>(`${this.apiUrl}/admin/providers/${providerId}/approve`, {});
  }

  rejectServiceProvider(providerId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/admin/providers/${providerId}/reject`);
  }

  getPendingProviders(): Observable<ServiceProvider[]> {
    return this.http.get<ServiceProvider[]>(`${this.apiUrl}/admin/providers/pending`);
  }

  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/admin/users`);
  }

  searchUsers(searchTerm: string = '', role: string = '', active: boolean | null = null): Observable<User[]> {
    let params = new HttpParams();
    
    if (searchTerm) {
      params = params.set('search', searchTerm);
    }
    if (role) {
      params = params.set('role', role);
    }
    if (active !== null) {
      params = params.set('active', active.toString());
    }

    return this.http.get<User[]>(`${this.apiUrl}/admin/users/search`, { params });
  }

  getSystemStats(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/admin/stats`);
  }

  deactivateUser(userId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/users/${userId}/deactivate`, {});
  }

  activateUser(userId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/users/${userId}/activate`, {});
  }

  // NEW RATINGS METHODS
  getAllRatings(): Observable<Rating[]> {
    return this.http.get<Rating[]>(`${this.apiUrl}/admin/ratings`);
  }

  searchRatings(searchTerm: string = ''): Observable<Rating[]> {
    let params = new HttpParams();
    if (searchTerm) {
      params = params.set('search', searchTerm);
    }
    return this.http.get<Rating[]>(`${this.apiUrl}/admin/ratings/search`, { params });
  }

  getRatingStatistics(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/admin/ratings/stats`);
  }
}
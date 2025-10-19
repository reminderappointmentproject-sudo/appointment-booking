import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { User, Customer, ServiceProvider, Admin } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  registerCustomer(customer: Customer): Observable<Customer> {
    return this.http.post<Customer>(`${this.apiUrl}/auth/register/customer`, customer);
  }

  registerProvider(provider: ServiceProvider): Observable<ServiceProvider> {
    return this.http.post<ServiceProvider>(`${this.apiUrl}/auth/register/provider`, provider);
  }

  registerAdmin(admin: Admin): Observable<Admin> {
    return this.http.post<Admin>(`${this.apiUrl}/auth/register/admin`, admin);
  }

  login(credentials: { email: string, password: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/auth/login`, credentials);
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
  }

  getCurrentUser(): User | null {
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
  }

  isLoggedIn(): boolean {
    return !!this.getCurrentUser();
  }

  isCustomer(): boolean {
    const user = this.getCurrentUser();
    return user ? user.role === 'CUSTOMER' : false;
  }

  isProvider(): boolean {
    const user = this.getCurrentUser();
    return user ? user.role === 'SERVICE_PROVIDER' : false;
  }

  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user ? user.role === 'ADMIN' : false;
  }
}
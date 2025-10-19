import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ProviderSearchResult } from '../models/search.model';
import { ServiceProvider } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  searchProviders(
    searchTerm: string = '',
    serviceType: string = '',
    availableToday: boolean = false
  ): Observable<ServiceProvider[]> {
    let params = new HttpParams();
    
    if (searchTerm) {
      params = params.set('search', searchTerm);
    }
    if (serviceType) {
      params = params.set('serviceType', serviceType);
    }
    if (availableToday) {
      params = params.set('availableToday', availableToday.toString());
    }

    return this.http.get<ServiceProvider[]>(`${this.apiUrl}/users/providers/search`, { params });
  }

  getServiceTypes(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/users/providers/service-types`);
  }
}
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getUserNotifications(userId: number): Observable<Notification[]> {
    return this.http.get<Notification[]>(`${this.apiUrl}/notifications/user/${userId}`);
  }

  getUnreadNotificationCount(userId: number): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/notifications/user/${userId}/unread-count`);
  }

  markAsRead(notificationId: number): Observable<Notification> {
    return this.http.put<Notification>(`${this.apiUrl}/notifications/${notificationId}/read`, {});
  }

  markAllAsRead(userId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/notifications/user/${userId}/read-all`, {});
  }

  createNotification(notificationData: any): Observable<Notification> {
    return this.http.post<Notification>(`${this.apiUrl}/notifications/send`, notificationData);
  }
}
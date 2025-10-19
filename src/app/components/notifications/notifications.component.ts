import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatListModule } from '@angular/material/list';
import { MatBadgeModule } from '@angular/material/badge';
import { MatChipsModule } from '@angular/material/chips';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatListModule,
    MatBadgeModule,
    MatChipsModule
  ],
  template: `
    <div class="container">
      <mat-card class="notifications-card">
        <mat-card-header>
          <mat-card-title>
            Notifications
            <mat-chip *ngIf="unreadCount > 0" color="warn">
              {{unreadCount}} unread
            </mat-chip>
          </mat-card-title>
          <div class="header-actions">
            <button mat-button (click)="markAllAsRead()" [disabled]="unreadCount === 0">
              Mark All as Read
            </button>
            <button mat-button (click)="goBack()">Back to Dashboard</button>
          </div>
        </mat-card-header>
        
        <mat-card-content>
          <mat-list>
            <mat-list-item *ngFor="let notification of notifications" 
                          [class.unread]="!notification.read"
                          class="notification-item">
              <div matListItemIcon>
                <mat-icon [color]="notification.read ? '' : 'primary'">
                  {{getNotificationIcon(notification.type)}}
                </mat-icon>
              </div>
              
              <div matListItemTitle>{{notification.title}}</div>
              <div matListItemLine>{{notification.message}}</div>
              <div matListItemMeta>
                <span class="timestamp">{{notification.createdAt | date:'medium'}}</span>
                <button mat-icon-button (click)="markAsRead(notification.id)" *ngIf="!notification.read">
                  <mat-icon>mark_email_read</mat-icon>
                </button>
              </div>
            </mat-list-item>
          </mat-list>

          <div *ngIf="notifications.length === 0" class="no-data">
            <mat-icon>notifications_off</mat-icon>
            <p>No notifications found.</p>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .container {
      padding: 20px;
      background-color: #f5f5f5;
      min-height: 100vh;
    }
    .notifications-card {
      max-width: 800px;
      margin: 0 auto;
    }
    .header-actions {
      display: flex;
      gap: 10px;
    }
    .notification-item {
      border-bottom: 1px solid #eee;
    }
    .unread {
      background-color: #f0f8ff;
    }
    .timestamp {
      color: #666;
      font-size: 0.8rem;
    }
    .no-data {
      text-align: center;
      padding: 40px;
      color: #666;
    }
    .no-data mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin-bottom: 10px;
    }
  `]
})
export class NotificationsComponent implements OnInit {
  notifications: any[] = [];
  unreadCount = 0;
  currentUser: any;

  constructor(
    private authService: AuthService,
    private notificationService: NotificationService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    if (!this.currentUser) {
      this.router.navigate(['/login']);
      return;
    }
    this.loadNotifications();
    this.loadUnreadCount();
  }

  loadNotifications() {
    this.notificationService.getUserNotifications(this.currentUser.id).subscribe({
      next: (notifications) => {
        this.notifications = notifications;
      },
      error: (error) => {
        this.snackBar.open('Error loading notifications', 'Close', { duration: 3000 });
      }
    });
  }

  loadUnreadCount() {
    this.notificationService.getUnreadNotificationCount(this.currentUser.id).subscribe({
      next: (count) => {
        this.unreadCount = count;
      }
    });
  }

  getNotificationIcon(type: string): string {
    switch (type) {
      case 'APPOINTMENT_CONFIRMATION': return 'event_available';
      case 'APPOINTMENT_REMINDER': return 'notification_important';
      case 'APPOINTMENT_CANCELLATION': return 'event_busy';
      case 'APPOINTMENT_RESCHEDULE': return 'schedule';
      case 'PROVIDER_APPROVAL': return 'verified';
      default: return 'notifications';
    }
  }

  markAsRead(notificationId: number) {
    this.notificationService.markAsRead(notificationId).subscribe({
      next: () => {
        this.loadNotifications();
        this.loadUnreadCount();
      },
      error: (error) => {
        this.snackBar.open('Error marking notification as read', 'Close', { duration: 3000 });
      }
    });
  }

  markAllAsRead() {
    this.notificationService.markAllAsRead(this.currentUser.id).subscribe({
      next: () => {
        this.snackBar.open('All notifications marked as read', 'Close', { duration: 3000 });
        this.loadNotifications();
        this.loadUnreadCount();
      },
      error: (error) => {
        this.snackBar.open('Error marking notifications as read', 'Close', { duration: 3000 });
      }
    });
  }

  goBack() {
    if (this.authService.isCustomer()) {
      this.router.navigate(['/customer/dashboard']);
    } else if (this.authService.isProvider()) {
      this.router.navigate(['/provider/dashboard']);
    } else {
      this.router.navigate(['/admin/dashboard']);
    }
  }
}
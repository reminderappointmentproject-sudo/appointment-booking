import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { AuthService } from '../../services/auth.service';
import { AdminService } from '../../services/admin.service';
import { User, ServiceProvider } from '../../models/user.model';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatTableModule,
    MatIconModule,
    MatSnackBarModule,
    MatChipsModule,
    MatMenuModule
  ],
  template: `
    <div class="dashboard-container">
      <header class="dashboard-header">
        <h1>Admin Dashboard</h1>
        <div class="user-info">
          <span>Welcome, {{currentUser?.firstName}}!</span>
          <button mat-button routerLink="/admin/profile">My Profile</button>
          <button mat-button (click)="logout()">Logout</button>
        </div>
      </header>

      <div class="dashboard-content">
        <!-- Statistics Cards -->
        <div class="stats-cards" *ngIf="stats">
          <mat-card class="stat-card">
            <mat-card-content>
              <div class="stat-number">{{stats.totalUsers}}</div>
              <div class="stat-label">Total Users</div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card">
            <mat-card-content>
              <div class="stat-number">{{stats.totalAppointments}}</div>
              <div class="stat-label">Total Appointments</div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card">
            <mat-card-content>
              <div class="stat-number">{{stats.totalProviders}}</div>
              <div class="stat-label">Service Providers</div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card">
            <mat-card-content>
              <div class="stat-number">{{stats.pendingProviders}}</div>
              <div class="stat-label">Pending Approvals</div>
            </mat-card-content>
          </mat-card>

          <!-- NEW RATING STATS CARDS ✅ -->
          <mat-card class="stat-card" *ngIf="stats.totalRatings">
            <mat-card-content>
              <div class="stat-number">{{stats.totalRatings}}</div>
              <div class="stat-label">Total Ratings</div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card" *ngIf="stats.averageRating">
            <mat-card-content>
              <div class="stat-number">{{stats.averageRating | number:'1.1-1'}}</div>
              <div class="stat-label">Avg Rating</div>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Quick Actions Section ✅ -->
        <div class="quick-actions">
          <mat-card class="action-card">
            <mat-card-header>
              <mat-card-title>Ratings & Reviews</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <p>Manage all customer feedback and ratings across the platform</p>
            </mat-card-content>
            <mat-card-actions>
              <button mat-raised-button color="primary" routerLink="/admin/ratings">
                <mat-icon>reviews</mat-icon>
                Manage Ratings
              </button>
            </mat-card-actions>
          </mat-card>

          <mat-card class="action-card">
            <mat-card-header>
              <mat-card-title>User Management</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <p>View and manage all users, activate/deactivate accounts</p>
            </mat-card-content>
            <mat-card-actions>
              <button mat-raised-button color="accent" (click)="scrollToUsers()">
                <mat-icon>people</mat-icon>
                Manage Users
              </button>
            </mat-card-actions>
          </mat-card>

          <mat-card class="action-card">
            <mat-card-header>
              <mat-card-title>Provider Approvals</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <p>Approve or reject new service provider registrations</p>
            </mat-card-content>
            <mat-card-actions>
              <button mat-raised-button color="accent" (click)="scrollToPending()">
                <mat-icon>verified</mat-icon>
                Review Providers
              </button>
            </mat-card-actions>
          </mat-card>
        </div>

        <!-- Pending Providers Section -->
        <mat-card class="section-card" id="pending-providers">
          <mat-card-header>
            <mat-card-title>Pending Provider Approvals</mat-card-title>
            <mat-card-subtitle>{{pendingProviders.length}} providers waiting for approval</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <table mat-table [dataSource]="pendingProviders" class="mat-elevation-z8" *ngIf="pendingProviders.length > 0">
              <!-- Name Column -->
              <ng-container matColumnDef="name">
                <th mat-header-cell *matHeaderCellDef>Name</th>
                <td mat-cell *matCellDef="let provider">
                  {{provider.firstName}} {{provider.lastName}}
                </td>
              </ng-container>

              <!-- Email Column -->
              <ng-container matColumnDef="email">
                <th mat-header-cell *matHeaderCellDef>Email</th>
                <td mat-cell *matCellDef="let provider">{{provider.email}}</td>
              </ng-container>

              <!-- Service Type Column -->
              <ng-container matColumnDef="serviceType">
                <th mat-header-cell *matHeaderCellDef>Service Type</th>
                <td mat-cell *matCellDef="let provider">{{provider.serviceType}}</td>
              </ng-container>

              <!-- Experience Column -->
              <ng-container matColumnDef="experience">
                <th mat-header-cell *matHeaderCellDef>Experience</th>
                <td mat-cell *matCellDef="let provider">{{provider.experience || 'Not specified'}}</td>
              </ng-container>

              <!-- Actions Column -->
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Actions</th>
                <td mat-cell *matCellDef="let provider">
                  <button mat-raised-button color="primary" (click)="approveProvider(provider.id)">
                    <mat-icon>check_circle</mat-icon>
                    Approve
                  </button>
                  <button mat-raised-button color="warn" (click)="rejectProvider(provider.id)" class="ml-10">
                    <mat-icon>cancel</mat-icon>
                    Reject
                  </button>
                  <button mat-button color="accent" (click)="viewUserDetails(provider)">
                    <mat-icon>visibility</mat-icon>
                    Details
                  </button>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="['name', 'email', 'serviceType', 'experience', 'actions']"></tr>
              <tr mat-row *matRowDef="let row; columns: ['name', 'email', 'serviceType', 'experience', 'actions'];"></tr>
            </table>

            <div *ngIf="pendingProviders.length === 0" class="no-data">
              <mat-icon>verified_user</mat-icon>
              <p>No pending provider approvals. All providers are approved.</p>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- All Users Section with Management -->
        <mat-card class="section-card" id="all-users">
          <mat-card-header>
            <mat-card-title>All Users Management</mat-card-title>
            <mat-card-subtitle>{{allUsers.length}} total users in system</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <table mat-table [dataSource]="allUsers" class="mat-elevation-z8">
              <!-- Name Column -->
              <ng-container matColumnDef="name">
                <th mat-header-cell *matHeaderCellDef>Name</th>
                <td mat-cell *matCellDef="let user">
                  {{user.firstName}} {{user.lastName}}
                </td>
              </ng-container>

              <!-- Email Column -->
              <ng-container matColumnDef="email">
                <th mat-header-cell *matHeaderCellDef>Email</th>
                <td mat-cell *matCellDef="let user">{{user.email}}</td>
              </ng-container>

              <!-- Role Column -->
              <ng-container matColumnDef="role">
                <th mat-header-cell *matHeaderCellDef>Role</th>
                <td mat-cell *matCellDef="let user">
                  <mat-chip [color]="getRoleColor(user.role)" selected>
                    {{user.role}}
                  </mat-chip>
                </td>
              </ng-container>

              <!-- Status Column -->
              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef>Status</th>
                <td mat-cell *matCellDef="let user">
                  <mat-chip [color]="user.active ? 'primary' : 'warn'" selected>
                    {{user.active ? 'Active' : 'Inactive'}}
                  </mat-chip>
                  <mat-chip *ngIf="user.role === 'SERVICE_PROVIDER' && user.approved" color="accent" selected>
                    Approved
                  </mat-chip>
                  <mat-chip *ngIf="user.role === 'SERVICE_PROVIDER' && !user.approved" color="warn" selected>
                    Pending
                  </mat-chip>
                </td>
              </ng-container>

              <!-- Actions Column -->
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Actions</th>
                <td mat-cell *matCellDef="let user">
                  <button mat-icon-button [matMenuTriggerFor]="menu">
                    <mat-icon>more_vert</mat-icon>
                  </button>
                  <mat-menu #menu="matMenu">
                    <button mat-menu-item (click)="viewUserDetails(user)">
                      <mat-icon>visibility</mat-icon>
                      View Details
                    </button>
                    <button mat-menu-item 
                            *ngIf="user.active"
                            (click)="deactivateUser(user.id)">
                      <mat-icon>block</mat-icon>
                      Deactivate
                    </button>
                    <button mat-menu-item 
                            *ngIf="!user.active"
                            (click)="activateUser(user.id)">
                      <mat-icon>check_circle</mat-icon>
                      Activate
                    </button>
                    <button mat-menu-item 
                            *ngIf="user.role === 'SERVICE_PROVIDER' && !user.approved"
                            (click)="approveProvider(user.id)">
                      <mat-icon>verified</mat-icon>
                      Approve Provider
                    </button>
                    <button mat-menu-item 
                            *ngIf="user.role === 'CUSTOMER' || user.role === 'SERVICE_PROVIDER'"
                            (click)="viewUserAppointments(user)">
                      <mat-icon>event</mat-icon>
                      View Appointments
                    </button>
                  </mat-menu>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="['name', 'email', 'role', 'status', 'actions']"></tr>
              <tr mat-row *matRowDef="let row; columns: ['name', 'email', 'role', 'status', 'actions'];"></tr>
            </table>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 20px;
      background-color: #f5f5f5;
      min-height: 100vh;
    }
    .dashboard-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .stats-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }
    .stat-card {
      text-align: center;
      transition: transform 0.2s;
    }
    .stat-card:hover {
      transform: translateY(-2px);
    }
    .stat-number {
      font-size: 2rem;
      font-weight: bold;
      color: #3f51b5;
    }
    .stat-label {
      color: #666;
      margin-top: 5px;
    }
    .quick-actions {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }
    .action-card {
      transition: transform 0.2s;
    }
    .action-card:hover {
      transform: translateY(-2px);
    }
    .section-card {
      margin-bottom: 30px;
      transition: transform 0.2s;
    }
    .section-card:hover {
      transform: translateY(-1px);
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
      color: #ccc;
    }
    .ml-10 {
      margin-left: 10px;
    }
  `]
})
export class AdminDashboardComponent implements OnInit {
  currentUser: any;
  stats: any;
  pendingProviders: ServiceProvider[] = [];
  allUsers: User[] = [];

  constructor(
    private authService: AuthService,
    private adminService: AdminService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    if (!this.currentUser || !this.authService.isAdmin()) {
      this.router.navigate(['/login']);
      return;
    }
    this.loadStats();
    this.loadPendingProviders();
    this.loadAllUsers();
  }

  loadStats() {
    this.adminService.getSystemStats().subscribe({
      next: (stats) => {
        this.stats = stats;
      },
      error: (error) => {
        this.snackBar.open('Error loading statistics', 'Close', { duration: 3000 });
      }
    });
  }

  loadPendingProviders() {
    this.adminService.getPendingProviders().subscribe({
      next: (providers) => {
        this.pendingProviders = providers;
      },
      error: (error) => {
        this.snackBar.open('Error loading pending providers', 'Close', { duration: 3000 });
      }
    });
  }

  loadAllUsers() {
    this.adminService.getAllUsers().subscribe({
      next: (users) => {
        this.allUsers = users;
      },
      error: (error) => {
        this.snackBar.open('Error loading users', 'Close', { duration: 3000 });
      }
    });
  }

  getRoleColor(role: string): string {
    switch (role) {
      case 'ADMIN': return 'primary';
      case 'SERVICE_PROVIDER': return 'accent';
      case 'CUSTOMER': return '';
      default: return '';
    }
  }

  approveProvider(providerId: number) {
    this.adminService.approveServiceProvider(providerId).subscribe({
      next: () => {
        this.snackBar.open('Provider approved successfully', 'Close', { duration: 3000 });
        this.loadPendingProviders();
        this.loadAllUsers();
        this.loadStats();
      },
      error: (error) => {
        this.snackBar.open('Error approving provider', 'Close', { duration: 3000 });
      }
    });
  }

  rejectProvider(providerId: number) {
    if (confirm('Are you sure you want to reject this provider?')) {
      this.adminService.rejectServiceProvider(providerId).subscribe({
        next: () => {
          this.snackBar.open('Provider rejected successfully', 'Close', { duration: 3000 });
          this.loadPendingProviders();
          this.loadAllUsers();
          this.loadStats();
        },
        error: (error) => {
          this.snackBar.open('Error rejecting provider', 'Close', { duration: 3000 });
        }
      });
    }
  }

  viewUserDetails(user: User) {
    this.router.navigate(['/admin/user', user.id]);
  }

  viewUserAppointments(user: User) {
    this.router.navigate(['/admin/user', user.id, 'appointments']);
  }

  deactivateUser(userId: number) {
    if (confirm('Are you sure you want to deactivate this user?')) {
      this.adminService.deactivateUser(userId).subscribe({
        next: () => {
          this.snackBar.open('User deactivated successfully', 'Close', { duration: 3000 });
          this.loadAllUsers();
          this.loadStats();
        },
        error: (error) => {
          this.snackBar.open('Error deactivating user', 'Close', { duration: 3000 });
        }
      });
    }
  }

  activateUser(userId: number) {
    this.adminService.activateUser(userId).subscribe({
      next: () => {
        this.snackBar.open('User activated successfully', 'Close', { duration: 3000 });
        this.loadAllUsers();
        this.loadStats();
      },
      error: (error) => {
        this.snackBar.open('Error activating user', 'Close', { duration: 3000 });
      }
    });
  }

  // NEW METHODS FOR SCROLLING ✅
  scrollToPending() {
    document.getElementById('pending-providers')?.scrollIntoView({ behavior: 'smooth' });
  }

  scrollToUsers() {
    document.getElementById('all-users')?.scrollIntoView({ behavior: 'smooth' });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
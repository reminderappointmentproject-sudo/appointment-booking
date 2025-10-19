import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from '../../services/auth.service';
import { SearchService } from '../../services/search.service';
import { RatingService } from '../../services/rating.service';
import { ServiceProvider } from '../../models/user.model';
import { MatMenuModule } from '@angular/material/menu'; // ADD THIS
@Component({
  selector: 'app-provider-search',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatCheckboxModule,
    MatIconModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatTooltipModule,
    MatMenuModule 
  ],
  template: `
    <div class="container">
      <mat-card class="search-card">
        <mat-card-header>
          <mat-card-title>Find Service Providers</mat-card-title>
          <mat-card-subtitle>Search and filter to find the perfect service provider</mat-card-subtitle>
        </mat-card-header>
        
        <mat-card-content>
          <!-- Search Filters -->
          <form [formGroup]="searchForm" (ngSubmit)="onSearch()" class="search-form">
            <div class="filter-row">
              <mat-form-field appearance="outline" class="search-field">
                <mat-label>Search Providers</mat-label>
                <input matInput formControlName="searchTerm" placeholder="Name, service type, or keywords...">
                <mat-icon matSuffix>search</mat-icon>
              </mat-form-field>

              <mat-form-field appearance="outline" class="service-type-field">
                <mat-label>Service Type</mat-label>
                <mat-select formControlName="serviceType">
                  <mat-option value="">All Services</mat-option>
                  <mat-option *ngFor="let type of serviceTypes" [value]="type">
                    {{type}}
                  </mat-option>
                </mat-select>
              </mat-form-field>

              <mat-checkbox formControlName="availableToday" class="availability-checkbox">
                Available Today
              </mat-checkbox>

              <button mat-raised-button color="primary" type="submit" [disabled]="loading">
                <mat-icon>search</mat-icon>
                Search
              </button>

              <button mat-button type="button" (click)="clearFilters()" *ngIf="hasActiveFilters()">
                Clear Filters
              </button>
            </div>
          </form>

          <!-- Search Results -->
          <div class="results-section">
            <div class="results-header">
              <h3>Search Results ({{providers.length}} providers found)</h3>
              <div class="sort-options">
                <button mat-button [matMenuTriggerFor]="sortMenu">
                  <mat-icon>sort</mat-icon>
                  Sort By: {{getSortLabel()}}
                </button>
                <mat-menu #sortMenu="matMenu">
                  <button mat-menu-item (click)="sortBy('name')">
                    Name (A-Z)
                  </button>
                  <button mat-menu-item (click)="sortBy('rating')">
                    Highest Rated
                  </button>
                  <button mat-menu-item (click)="sortBy('price')">
                    Price (Low to High)
                  </button>
                  <button mat-menu-item (click)="sortBy('experience')">
                    Experience
                  </button>
                </mat-menu>
              </div>
            </div>

            <!-- Loading State -->
            <div *ngIf="loading" class="loading">
              <mat-spinner diameter="40"></mat-spinner>
              <p>Searching providers...</p>
            </div>

            <!-- No Results -->
            <div *ngIf="!loading && providers.length === 0 && hasSearched" class="no-results">
              <mat-icon>search_off</mat-icon>
              <h3>No providers found</h3>
              <p>Try adjusting your search criteria or filters.</p>
              <button mat-raised-button color="primary" (click)="clearFilters()">
                Show All Providers
              </button>
            </div>

            <!-- Providers Grid -->
            <div class="providers-grid" *ngIf="!loading && providers.length > 0">
              <mat-card *ngFor="let provider of providers" class="provider-card">
                <mat-card-header>
                  <mat-card-title>{{provider.firstName}} {{provider.lastName}}</mat-card-title>
                  <mat-card-subtitle>{{provider.serviceType}}</mat-card-subtitle>
                  <div class="rating-badge" *ngIf="provider.averageRating">
                    <mat-icon>star</mat-icon>
                    <span>{{provider.averageRating}}</span>
                    <span class="rating-count">({{provider.ratingCount}})</span>
                  </div>
                </mat-card-header>

                <mat-card-content>
                  <div class="provider-info">
                    <div class="info-item" *ngIf="provider.qualification">
                      <mat-icon>school</mat-icon>
                      <span>{{provider.qualification}}</span>
                    </div>
                    <div class="info-item" *ngIf="provider.experience">
                      <mat-icon>work</mat-icon>
                      <span>{{provider.experience}}</span>
                    </div>
                    <div class="info-item">
                      <mat-icon>attach_money</mat-icon>
                      <span>₹{{provider.hourlyRate}}/hour</span>
                    </div>
                  </div>

                  <div class="provider-bio" *ngIf="provider.bio">
                    <p>{{provider.bio}}</p>
                  </div>
                </mat-card-content>

                <mat-card-actions>
                  <button mat-raised-button color="primary" (click)="bookAppointment(provider)">
                    <mat-icon>event_available</mat-icon>
                    Book Appointment
                  </button>
                  <button mat-button color="accent" (click)="viewProviderDetails(provider)">
                    <mat-icon>visibility</mat-icon>
                    View Details
                  </button>
                </mat-card-actions>
              </mat-card>
            </div>
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
    .search-card {
      max-width: 1200px;
      margin: 0 auto;
    }
    .search-form {
      margin-bottom: 30px;
    }
    .filter-row {
      display: flex;
      gap: 15px;
      align-items: flex-end;
      flex-wrap: wrap;
    }
    .search-field {
      flex: 2;
      min-width: 300px;
    }
    .service-type-field {
      flex: 1;
      min-width: 200px;
    }
    .availability-checkbox {
      margin-bottom: 15px;
    }
    .results-section {
      margin-top: 20px;
    }
    .results-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }
    .results-header h3 {
      margin: 0;
      color: #3f51b5;
    }
    .providers-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 20px;
    }
    .provider-card {
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .provider-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0,0,0,0.15);
    }
    .rating-badge {
      display: flex;
      align-items: center;
      gap: 4px;
      background: #fff3e0;
      padding: 4px 8px;
      border-radius: 16px;
      font-size: 0.8rem;
      margin-left: auto;
    }
    .rating-badge mat-icon {
      color: #ff9800;
      font-size: 1rem;
      width: 1rem;
      height: 1rem;
    }
    .rating-count {
      color: #666;
      font-size: 0.7rem;
    }
    .provider-info {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-bottom: 15px;
    }
    .info-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.9rem;
      color: #666;
    }
    .info-item mat-icon {
      font-size: 1rem;
      width: 1rem;
      height: 1rem;
      color: #3f51b5;
    }
    .provider-bio {
      margin-top: 10px;
      padding: 10px;
      background: #f8f9fa;
      border-radius: 4px;
      font-size: 0.9rem;
      color: #555;
    }
    .provider-bio p {
      margin: 0;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .loading, .no-results {
      text-align: center;
      padding: 40px;
      color: #666;
    }
    .no-results mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      margin-bottom: 16px;
      color: #ccc;
    }
  `]
})
export class ProviderSearchComponent implements OnInit {
  searchForm: FormGroup;
  providers: ServiceProvider[] = [];
  serviceTypes: string[] = [];
  loading = false;
  hasSearched = false;
  currentSort = 'name';
  currentUser: any; // ADD THIS MISSING PROPERTY

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private searchService: SearchService,
    private ratingService: RatingService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.searchForm = this.createForm();
  }

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    if (!this.currentUser || !this.authService.isCustomer()) {
      this.router.navigate(['/login']);
      return;
    }
    this.loadServiceTypes();
    this.loadAllProviders(); // Load all providers initially
  }

  createForm(): FormGroup {
    return this.fb.group({
      searchTerm: [''],
      serviceType: [''],
      availableToday: [false]
    });
  }

  loadServiceTypes() {
    this.searchService.getServiceTypes().subscribe({
      next: (types) => {
        this.serviceTypes = types;
      },
      error: (error) => {
        console.error('Error loading service types:', error);
      }
    });
  }

  loadAllProviders() {
    this.loading = true;
    this.searchService.searchProviders().subscribe({
      next: (providers) => {
        this.providers = providers;
        this.loading = false;
        this.hasSearched = true;
        this.loadRatingsForProviders();
      },
      error: (error) => {
        this.loading = false;
        this.snackBar.open('Error loading providers', 'Close', { duration: 3000 });
      }
    });
  }

  onSearch() {
    if (this.searchForm.valid) {
      this.loading = true;
      const formValue = this.searchForm.value;

      this.searchService.searchProviders(
        formValue.searchTerm,
        formValue.serviceType,
        formValue.availableToday
      ).subscribe({
        next: (providers) => {
          this.providers = providers;
          this.loading = false;
          this.hasSearched = true;
          this.loadRatingsForProviders();
        },
        error: (error) => {
          this.loading = false;
          this.snackBar.open('Error searching providers', 'Close', { duration: 3000 });
        }
      });
    }
  }

  loadRatingsForProviders() {
    this.providers.forEach(provider => {
      this.ratingService.getProviderRatingStats(provider.id).subscribe({
        next: (stats) => {
          // Use type assertion for now until we update the model
          (provider as any).averageRating = stats.averageRating;
          (provider as any).ratingCount = stats.ratingCount;
        },
        error: (error) => {
          // Silently fail - ratings are optional
        }
      });
    });
  }

  clearFilters() {
    this.searchForm.reset({
      searchTerm: '',
      serviceType: '',
      availableToday: false
    });
    this.loadAllProviders();
  }

  hasActiveFilters(): boolean {
    const formValue = this.searchForm.value;
    return !!formValue.searchTerm || !!formValue.serviceType || formValue.availableToday;
  }

  sortBy(criteria: string) {
    this.currentSort = criteria;
    
    switch (criteria) {
      case 'name':
        this.providers.sort((a, b) => 
          `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`)
        );
        break;
      case 'rating':
        this.providers.sort((a, b) => 
          ((b as any).averageRating || 0) - ((a as any).averageRating || 0)
        );
        break;
      case 'price':
        this.providers.sort((a, b) => a.hourlyRate - b.hourlyRate);
        break;
      case 'experience':
        // Simple experience sorting - you might want to parse experience strings
        this.providers.sort((a, b) => 
          (b.experience || '').localeCompare(a.experience || '')
        );
        break;
    }
  }

  getSortLabel(): string {
    switch (this.currentSort) {
      case 'name': return 'Name';
      case 'rating': return 'Rating';
      case 'price': return 'Price';
      case 'experience': return 'Experience';
      default: return 'Name';
    }
  }

  bookAppointment(provider: ServiceProvider) {
    this.router.navigate(['/customer/book-appointment'], {
      queryParams: { providerId: provider.id }
    });
  }

  viewProviderDetails(provider: ServiceProvider) {
    // Navigate to provider details page or show in dialog
    this.snackBar.open(`Viewing details for ${provider.firstName} ${provider.lastName}`, 'Close', {
      duration: 3000
    });
  }
}
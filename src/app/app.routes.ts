import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterCustomerComponent } from './components/register-customer/register-customer.component';
import { RegisterProviderComponent } from './components/register-provider/register-provider.component';
import { CustomerDashboardComponent } from './components/customer-dashboard/customer-dashboard.component';
import { ProviderDashboardComponent } from './components/provider-dashboard/provider-dashboard.component';
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard.component';
import { BookAppointmentComponent } from './components/book-appointment/book-appointment.component';
import { AvailabilityManagementComponent } from './components/availability-management/availability-management.component';
import { NotificationsComponent } from './components/notifications/notifications.component';
import { AppointmentDetailsComponent } from './components/appointment-details/appointment-details.component';
import { RescheduleAppointmentComponent } from './components/reschedule-appointment/reschedule-appointment.component';
import { ProfileComponent } from './components/profile/profile.component';
import { UserDetailsComponent } from './components/user-details/user-details.component';
import { UserAppointmentsComponent } from './components/user-appointments/user-appointments.component';
import { SubmitRatingComponent } from './components/submit-rating/submit-rating.component';
import { ProviderRatingsComponent } from './components/provider-ratings/provider-ratings.component';
import { ProviderSearchComponent } from './components/provider-search/provider-search.component';
import { AdminRatingsComponent } from './components/admin-ratings/admin-ratings.component'; // ✅ ADD THIS

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register/customer', component: RegisterCustomerComponent },
  { path: 'register/provider', component: RegisterProviderComponent },
  
  // Customer Routes
  { path: 'customer/dashboard', component: CustomerDashboardComponent },
  { path: 'customer/book-appointment', component: BookAppointmentComponent },
  { path: 'customer/search-providers', component: ProviderSearchComponent },
  { path: 'customer/notifications', component: NotificationsComponent },
  { path: 'customer/appointment/:id', component: AppointmentDetailsComponent },
  { path: 'customer/reschedule/:id', component: RescheduleAppointmentComponent },
  { path: 'customer/rate/:id', component: SubmitRatingComponent },
  { path: 'customer/profile', component: ProfileComponent },
  
  // Provider Routes
  { path: 'provider/dashboard', component: ProviderDashboardComponent },
  { path: 'provider/availability', component: AvailabilityManagementComponent },
  { path: 'provider/notifications', component: NotificationsComponent },
  { path: 'provider/appointment/:id', component: AppointmentDetailsComponent },
  { path: 'provider/reschedule/:id', component: RescheduleAppointmentComponent },
  { path: 'provider/ratings', component: ProviderRatingsComponent },
  { path: 'provider/profile', component: ProfileComponent },
  
  // Admin Routes - UPDATED ✅
  { path: 'admin/dashboard', component: AdminDashboardComponent },
  { path: 'admin/ratings', component: AdminRatingsComponent }, // ✅ NEW ROUTE
  { path: 'admin/user/:id', component: UserDetailsComponent },
  { path: 'admin/user/:id/appointments', component: UserAppointmentsComponent },
  { path: 'admin/appointment/:id', component: AppointmentDetailsComponent },
  { path: 'admin/profile', component: ProfileComponent },
  
  { path: '**', redirectTo: '/login' }
];
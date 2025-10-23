import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { CalendarService } from '../../services/calendar.service';
import { CalendarEvent, CalendarView } from '../../models/calendar.model';

@Component({
  selector: 'app-provider-calendar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatSelectModule,
    MatFormFieldModule,
    FormsModule
  ],
  template: `
    <div class="container">
      <div class="header-actions">
        <button mat-button (click)="goBack()">
          <mat-icon>arrow_back</mat-icon>
          Back to Dashboard
        </button>
      </div>

      <mat-card class="calendar-card">
        <mat-card-header>
          <mat-card-title>My Schedule Calendar</mat-card-title>
          <mat-card-subtitle>View and manage your appointments</mat-card-subtitle>
          
          <div class="calendar-controls">
            <mat-form-field appearance="outline">
              <mat-label>View</mat-label>
              <mat-select [(value)]="currentView" (selectionChange)="onViewChange()">
                @for (view of calendarViews; track view.value) {
                  <mat-option [value]="view.value">
                    {{view.label}}
                  </mat-option>
                }
              </mat-select>
            </mat-form-field>

            <button mat-raised-button color="primary" (click)="goToToday()">
              <mat-icon>today</mat-icon>
              Today
            </button>
          </div>
        </mat-card-header>

        <mat-card-content>
          <!-- Month View -->
          @if (currentView === 'month') {
            <div class="month-view">
              <div class="calendar-header">
                <button mat-icon-button (click)="previousMonth()">
                  <mat-icon>chevron_left</mat-icon>
                </button>
                <h3>{{currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}}</h3>
                <button mat-icon-button (click)="nextMonth()">
                  <mat-icon>chevron_right</mat-icon>
                </button>
              </div>

              <div class="calendar-grid">
                <div class="calendar-weekdays">
                  @for (day of weekDays; track day) {
                    <div class="weekday-header">{{day}}</div>
                  }
                </div>

                <div class="calendar-days">
                  @for (day of calendarDays; track day.date) {
                    <div 
                      class="calendar-day"
                      [class.current-month]="day.isCurrentMonth"
                      [class.today]="day.isToday"
                      [class.has-events]="day.hasEvents"
                      (click)="onDayClick(day.date)"
                    >
                      <div class="day-number">{{day.date.getDate()}}</div>
                      @if (day.hasEvents) {
                        <div class="day-events">
                          @for (event of day.events; track event.id) {
                            <div 
                              class="event-dot" 
                              [style.background-color]="event.color"
                              [matTooltip]="event.title"
                            ></div>
                          }
                        </div>
                      }
                    </div>
                  }
                </div>
              </div>
            </div>
          }

          <!-- Week View -->
          @if (currentView === 'week') {
            <div class="week-view">
              <div class="calendar-header">
                <button mat-icon-button (click)="previousWeek()">
                  <mat-icon>chevron_left</mat-icon>
                </button>
                <h3>Week of {{getWeekRange()}}</h3>
                <button mat-icon-button (click)="nextWeek()">
                  <mat-icon>chevron_right</mat-icon>
                </button>
              </div>

              <div class="week-grid">
                <div class="week-timeline">
                  <div class="time-header"></div>
                  @for (hour of hours; track hour) {
                    <div class="time-slot">{{hour}}:00</div>
                  }
                </div>

                @for (day of weekDays; track day; let i = $index) {
                  <div class="week-day-column">
                    <div class="day-header">
                      <div class="day-name">{{day}}</div>
                      <div class="day-date">{{getWeekDate(i).getDate()}}</div>
                    </div>
                    
                    @for (hour of hours; track hour) {
                      <div class="time-slot-cell">
                        @for (event of getEventsForDayAndHour(i, hour); track event.id) {
                          <div 
                            class="week-event"
                            [style.background-color]="event.color"
                            (click)="viewAppointment(event.appointment.id)"
                          >
                            <div class="event-time">
                              {{formatTime(event.start)}} - {{formatTime(event.end)}}
                            </div>
                            <div class="event-title">{{event.title}}</div>
                          </div>
                        }
                      </div>
                    }
                  </div>
                }
              </div>
            </div>
          }

          <!-- Day View -->
          @if (currentView === 'day') {
            <div class="day-view">
              <div class="calendar-header">
                <button mat-icon-button (click)="previousDay()">
                  <mat-icon>chevron_left</mat-icon>
                </button>
                <h3>{{selectedDay.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}}</h3>
                <button mat-icon-button (click)="nextDay()">
                  <mat-icon>chevron_right</mat-icon>
                </button>
              </div>

              <div class="day-timeline">
                @for (hour of hours; track hour) {
                  <div class="day-time-slot">
                    <div class="time-label">{{hour}}:00</div>
                    <div class="time-content">
                      @for (event of getEventsForDayAndHour(selectedDay.getDay(), hour); track event.id) {
                        <div 
                          class="day-event"
                          [style.background-color]="event.color"
                          (click)="viewAppointment(event.appointment.id)"
                        >
                          <div class="event-details">
                            <strong>{{event.title}}</strong>
                            <div>{{formatTime(event.start)}} - {{formatTime(event.end)}}</div>
                          </div>
                        </div>
                      }
                    </div>
                  </div>
                }
              </div>
            </div>
          }

          <!-- List View -->
          @if (currentView === 'list') {
            <div class="list-view">
              <div class="calendar-header">
                <h3>Upcoming Appointments</h3>
              </div>

              <div class="appointments-list">
                @for (event of calendarEvents; track event.id) {
                  <mat-card class="appointment-card" (click)="viewAppointment(event.appointment.id)">
                    <mat-card-content>
                      <div class="appointment-header">
                        <div class="event-color" [style.background-color]="event.color"></div>
                        <div class="appointment-info">
                          <h4>{{event.title}}</h4>
                          <p class="appointment-time">
                            {{formatDateTime(event.start)}} - {{formatTime(event.end)}}
                          </p>
                          <p class="appointment-status">
                            Status: <span [class]="'status-' + event.appointment.status.toLowerCase()">
                              {{event.appointment.status}}
                            </span>
                          </p>
                        </div>
                      </div>
                    </mat-card-content>
                  </mat-card>
                }
                @empty {
                  <div class="no-appointments">
                    <mat-icon>event_busy</mat-icon>
                    <p>No appointments scheduled</p>
                  </div>
                }
              </div>
            </div>
          }
        </mat-card-content>
      </mat-card>

      <!-- Loading State -->
      @if (loading) {
        <div class="loading">
          <mat-spinner diameter="40"></mat-spinner>
          <p>Loading calendar...</p>
        </div>
      }
    </div>
  `,
  styles: [`
    .container {
      padding: 20px;
      background-color: #f5f5f5;
      min-height: 100vh;
    }
    .header-actions {
      margin-bottom: 20px;
    }
    .calendar-card {
      max-width: 1200px;
      margin: 0 auto;
    }
    .calendar-controls {
      display: flex;
      gap: 15px;
      align-items: center;
      margin-left: auto;
    }
    .calendar-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      padding: 15px;
      background: #f8f9fa;
      border-radius: 8px;
    }
    
    /* Month View Styles */
    .calendar-grid {
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      overflow: hidden;
    }
    .calendar-weekdays {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      background: #3f51b5;
      color: white;
    }
    .weekday-header {
      padding: 12px;
      text-align: center;
      font-weight: bold;
    }
    .calendar-days {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      grid-auto-rows: 100px;
    }
    .calendar-day {
      border: 1px solid #e0e0e0;
      padding: 8px;
      cursor: pointer;
      transition: background-color 0.2s;
    }
    .calendar-day:hover {
      background-color: #f5f5f5;
    }
    .calendar-day.current-month {
      background-color: white;
    }
    .calendar-day:not(.current-month) {
      background-color: #fafafa;
      color: #999;
    }
    .calendar-day.today {
      background-color: #e3f2fd;
    }
    .day-number {
      font-weight: bold;
      margin-bottom: 4px;
    }
    .day-events {
      display: flex;
      flex-wrap: wrap;
      gap: 2px;
    }
    .event-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      cursor: pointer;
    }
    
    /* Week View Styles */
    .week-grid {
      display: grid;
      grid-template-columns: 80px repeat(7, 1fr);
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      overflow: hidden;
    }
    .week-timeline {
      background: #f8f9fa;
    }
    .time-header {
      height: 60px;
      border-bottom: 1px solid #e0e0e0;
    }
    .time-slot {
      height: 60px;
      padding: 8px;
      border-bottom: 1px solid #e0e0e0;
      font-size: 0.8rem;
      color: #666;
    }
    .week-day-column {
      border-right: 1px solid #e0e0e0;
    }
    .day-header {
      height: 60px;
      padding: 12px;
      text-align: center;
      border-bottom: 1px solid #e0e0e0;
      background: #f8f9fa;
    }
    .day-name {
      font-weight: bold;
      color: #3f51b5;
    }
    .day-date {
      font-size: 0.9rem;
      color: #666;
    }
    .time-slot-cell {
      height: 60px;
      border-bottom: 1px solid #e0e0e0;
      position: relative;
    }
    .week-event {
      position: absolute;
      left: 2px;
      right: 2px;
      padding: 4px;
      border-radius: 4px;
      color: white;
      font-size: 0.8rem;
      cursor: pointer;
      overflow: hidden;
    }
    
    /* Day View Styles */
    .day-timeline {
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      overflow: hidden;
    }
    .day-time-slot {
      display: flex;
      border-bottom: 1px solid #e0e0e0;
    }
    .time-label {
      width: 80px;
      padding: 12px;
      background: #f8f9fa;
      font-weight: bold;
      border-right: 1px solid #e0e0e0;
    }
    .time-content {
      flex: 1;
      padding: 12px;
      min-height: 80px;
      position: relative;
    }
    .day-event {
      padding: 8px;
      border-radius: 4px;
      color: white;
      margin-bottom: 4px;
      cursor: pointer;
    }
    
    /* List View Styles */
    .appointments-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .appointment-card {
      cursor: pointer;
      transition: transform 0.2s;
    }
    .appointment-card:hover {
      transform: translateY(-2px);
    }
    .appointment-header {
      display: flex;
      align-items: center;
      gap: 15px;
    }
    .event-color {
      width: 4px;
      height: 40px;
      border-radius: 2px;
    }
    .appointment-info h4 {
      margin: 0 0 4px 0;
    }
    .appointment-time {
      color: #666;
      margin: 0 0 4px 0;
    }
    .status-pending { color: #ff9800; font-weight: bold; }
    .status-confirmed { color: #4caf50; font-weight: bold; }
    .status-completed { color: #2196f3; font-weight: bold; }
    .status-cancelled { color: #f44336; font-weight: bold; }
    
    .no-appointments {
      text-align: center;
      padding: 40px;
      color: #666;
    }
    .no-appointments mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin-bottom: 10px;
      color: #ccc;
    }
    .loading {
      text-align: center;
      padding: 40px;
    }
  `]
})
export class ProviderCalendarComponent implements OnInit {
  calendarEvents: CalendarEvent[] = [];
  currentView: string = 'month';
  currentMonth: Date = new Date();
  selectedDay: Date = new Date();
  loading = false;
  currentUser: any;

  calendarViews: CalendarView[] = [
    { value: 'month', label: 'Month' },
    { value: 'week', label: 'Week' },
    { value: 'day', label: 'Day' },
    { value: 'list', label: 'List' }
  ];

  weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  hours = Array.from({length: 12}, (_, i) => i + 8); // 8 AM to 7 PM

  constructor(
    private router: Router,
    private authService: AuthService,
    private calendarService: CalendarService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    if (!this.currentUser || !this.authService.isProvider()) {
      this.router.navigate(['/login']);
      return;
    }
    this.loadCalendarEvents();
  }

  loadCalendarEvents() {
    this.loading = true;
    this.calendarService.getProviderAppointmentsForCalendar(this.currentUser.id).subscribe({
      next: (events) => {
        this.calendarEvents = events;
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        this.snackBar.open('Error loading calendar events', 'Close', { duration: 3000 });
      }
    });
  }

  // Calendar navigation methods
  previousMonth() {
    this.currentMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() - 1, 1);
  }

  nextMonth() {
    this.currentMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() + 1, 1);
  }

  previousWeek() {
    this.selectedDay = new Date(this.selectedDay.setDate(this.selectedDay.getDate() - 7));
  }

  nextWeek() {
    this.selectedDay = new Date(this.selectedDay.setDate(this.selectedDay.getDate() + 7));
  }

  previousDay() {
    this.selectedDay = new Date(this.selectedDay.setDate(this.selectedDay.getDate() - 1));
  }

  nextDay() {
    this.selectedDay = new Date(this.selectedDay.setDate(this.selectedDay.getDate() + 1));
  }

  goToToday() {
    this.currentMonth = new Date();
    this.selectedDay = new Date();
  }

  onViewChange() {
    // View change logic if needed
  }

  onDayClick(date: Date) {
    this.selectedDay = date;
    this.currentView = 'day';
  }

  // Calendar data methods
  get calendarDays(): any[] {
    const year = this.currentMonth.getFullYear();
    const month = this.currentMonth.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const endDate = new Date(lastDay);
    endDate.setDate(endDate.getDate() + (6 - lastDay.getDay()));
    
    const days = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const date = new Date(currentDate);
      const dayEvents = this.calendarEvents.filter(event => 
        this.isSameDay(event.start, date)
      );
      
      days.push({
        date: date,
        isCurrentMonth: date.getMonth() === month,
        isToday: this.isToday(date),
        hasEvents: dayEvents.length > 0,
        events: dayEvents
      });
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return days;
  }

  getWeekRange(): string {
    const startOfWeek = new Date(this.selectedDay);
    startOfWeek.setDate(this.selectedDay.getDate() - this.selectedDay.getDay());
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    
    return `${startOfWeek.toLocaleDateString()} - ${endOfWeek.toLocaleDateString()}`;
  }

  getWeekDate(dayIndex: number): Date {
    const date = new Date(this.selectedDay);
    date.setDate(this.selectedDay.getDate() - this.selectedDay.getDay() + dayIndex);
    return date;
  }

  getEventsForDayAndHour(dayIndex: number, hour: number): CalendarEvent[] {
    const date = this.getWeekDate(dayIndex);
    return this.calendarEvents.filter(event => {
      const eventDate = new Date(event.start);
      return this.isSameDay(eventDate, date) && eventDate.getHours() === hour;
    });
  }

  // Utility methods
  isSameDay(date1: Date, date2: Date): boolean {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  }

  isToday(date: Date): boolean {
    const today = new Date();
    return this.isSameDay(date, today);
  }

  formatTime(date: Date): string {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  }

  formatDateTime(date: Date): string {
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  viewAppointment(appointmentId: number) {
    this.router.navigate(['/provider/appointment', appointmentId]);
  }

  goBack() {
    this.router.navigate(['/provider/dashboard']);
  }
}
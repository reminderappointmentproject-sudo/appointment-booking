export interface CalendarEvent {
  id: number;
  title: string;
  start: Date;
  end: Date;
  appointment: any;
  color?: string;
}

export interface CalendarView {
  value: string;
  label: string;
}
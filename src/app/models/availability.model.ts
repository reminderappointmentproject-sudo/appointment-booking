import { ServiceProvider } from "./user.model";

export interface Availability {
  id: number;
  serviceProvider: ServiceProvider;
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  available: boolean;
}

export enum DayOfWeek {
  MONDAY = 'MONDAY',
  TUESDAY = 'TUESDAY',
  WEDNESDAY = 'WEDNESDAY',
  THURSDAY = 'THURSDAY',
  FRIDAY = 'FRIDAY',
  SATURDAY = 'SATURDAY',
  SUNDAY = 'SUNDAY'
}
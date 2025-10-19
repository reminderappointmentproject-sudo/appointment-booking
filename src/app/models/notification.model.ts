export interface Notification {
  id: number;
  user: any;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  createdAt: string;
}

export enum NotificationType {
  APPOINTMENT_CONFIRMATION = 'APPOINTMENT_CONFIRMATION',
  APPOINTMENT_REMINDER = 'APPOINTMENT_REMINDER',
  APPOINTMENT_CANCELLATION = 'APPOINTMENT_CANCELLATION',
  APPOINTMENT_RESCHEDULE = 'APPOINTMENT_RESCHEDULE',
  PROVIDER_APPROVAL = 'PROVIDER_APPROVAL',
  SYSTEM_ANNOUNCEMENT = 'SYSTEM_ANNOUNCEMENT'
}
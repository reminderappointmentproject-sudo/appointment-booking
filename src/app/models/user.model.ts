export interface User {
  id: number;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: UserRole;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export enum UserRole {
  CUSTOMER = 'CUSTOMER',
  SERVICE_PROVIDER = 'SERVICE_PROVIDER',
  ADMIN = 'ADMIN'
}

export interface Customer extends User {
  address: string;
  city: string;
  state: string;
  zipCode: string;
}

export interface ServiceProvider extends User {
  serviceType: string;
  qualification: string;
  experience: string;
  bio: string;
  hourlyRate: number;
  approved: boolean;
  // ADD THESE PROPERTIES FOR RATINGS
  averageRating?: number;
  ratingCount?: number;
}

export interface Admin extends User {
  department: string;
}
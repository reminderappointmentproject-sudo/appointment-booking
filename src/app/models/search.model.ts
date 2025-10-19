export interface SearchFilters {
  searchTerm: string;
  serviceType: string;
  availableToday: boolean;
  sortBy: string;
  sortOrder: string;
}

export interface ProviderSearchResult {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  serviceType: string;
  qualification: string;
  experience: string;
  bio: string;
  hourlyRate: number;
  approved: boolean;
  averageRating?: number;
  ratingCount?: number;
}
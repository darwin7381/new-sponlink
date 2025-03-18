export type UserRole = 'organizer' | 'sponsor';

export interface OrganizerEvent {
  id: string;
  name: string;
  status: 'upcoming' | 'completed';
  date: string;
}

export interface OrganizerStatistics {
  totalEvents: number;
  upcomingEvents: number;
  averageAttendees: number;
  totalRevenue: string;
}

export interface OrganizerProfile {
  userId: string;
  bio: string;
  contactInfo: string;
  avatar: string;
  updatedAt: string;
  events: OrganizerEvent[];
  statistics: OrganizerStatistics;
}

export interface Sponsorship {
  id: string;
  eventName: string;
  status: 'confirmed' | 'pending';
  amount: string;
}

export interface SponsorAnalytics {
  totalSponsored: number;
  activeSponsorship: number;
  totalInvestment: string;
  averageRoi: string;
}

export interface SponsorProfile {
  userId: string;
  bio: string;
  contactInfo: string;
  avatar: string;
  updatedAt: string;
  companyName: string;
  logo: string;
  description: string;
  sponsorships: Sponsorship[];
  analytics: SponsorAnalytics;
}

export type UserProfile = OrganizerProfile | SponsorProfile; 
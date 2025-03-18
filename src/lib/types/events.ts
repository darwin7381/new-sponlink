export enum EVENT_STATUS {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  CANCELLED = 'CANCELLED'
}

export interface Location {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
}

export interface SponsorshipPlan {
  id: string;
  event_id: string;
  title: string;
  price: number;
  description: string;
  benefits: string[];
}

export interface Event {
  id: string;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  location: Location;
  organizer_id: string;
  sponsor_ids: string[];
  status: EVENT_STATUS;
  cover_image: string;
  deck_url: string;
  sponsorship_plans: SponsorshipPlan[];
} 
export enum CartItemStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED'
}

export enum MeetingStatus {
  REQUESTED = 'REQUESTED',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED'
}

export interface CartItem {
  id: string;
  sponsor_id: string;
  sponsorship_plan_id: string;
  status: CartItemStatus;
  created_at: string;
  updated_at: string;
}

export interface Meeting {
  id: string;
  sponsor_id: string;
  organizer_id: string;
  event_id: string;
  title: string;
  description: string;
  proposed_times: string[];
  confirmed_time: string | null;
  status: MeetingStatus;
  meeting_link: string | null;
  created_at: string;
  updated_at: string;
}

export interface CheckoutResult {
  success: boolean;
  confirmed_items: number;
  order_id: string;
  total_amount: number;
}

export interface MeetingData {
  title?: string;
  description?: string;
  proposed_times: string[];
}

export interface Sponsorship {
  id: string;
  event_id: string;
  plan_id: string;
  status: string;
  amount: number;
  created_at: string;
}

export interface SponsorProfile {
  id: string;
  user_id: string;
  company_name: string;
  logo_url?: string;
  website?: string;
  industry?: string;
  company_size?: string;
  description?: string;
  contact_email?: string;
  contact_phone?: string;
  social_media?: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
  };
  sponsorships?: Sponsorship[];
  analytics?: {
    totalSponsored: number;
    activeSponsorship: number;
    totalInvestment: string;
    averageRoi: string;
  };
  created_at: string;
  updated_at: string;
  bio?: string;
  avatar?: string;
} 
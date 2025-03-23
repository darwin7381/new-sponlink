export enum MeetingStatus {
  REQUESTED = 'REQUESTED',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED'
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
  timezone?: string;
  created_at: string;
  updated_at: string;
}

export enum CartItemStatus {
  PENDING = 'PENDING',
  CHECKOUT = 'CHECKOUT',
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
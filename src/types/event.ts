export enum EventStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed'
}

export enum LocationType {
  GOOGLE = 'google',  // Google 地點（有 place_id）
  VIRTUAL = 'virtual', // 虛擬會議連結
  CUSTOM = 'custom'   // 自定義地址
}

export interface Location {
  id: string;
  name: string;
  address: string;
  city: string;
  country: string;
  postal_code: string;
  latitude?: number;
  longitude?: number;
  isVirtual?: boolean;
  platformName?: string;
  place_id?: string;
  location_type?: LocationType; // 位置類型
  full_address?: string; // 完整地址字符串（從Google Places API獲取）
}

export interface SponsorshipPlan {
  id: string;
  event_id: string;
  title: string;
  description: string;
  price: number;
  benefits: string[];
  max_sponsors?: number;
  current_sponsors?: number;
  created_at: string;
  updated_at: string;
}

export interface Event {
  id: string;
  organizer_id: string;
  title: string;
  description: string;
  cover_image: string;
  deck_url?: string;
  start_time: string;
  end_time: string;
  location: Location;
  status: EventStatus;
  category: string;
  tags: string[];
  sponsor_ids?: string[];
  sponsorship_plans: SponsorshipPlan[];
  created_at: string;
  updated_at: string;
}

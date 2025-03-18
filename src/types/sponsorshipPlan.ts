export interface SponsorshipPlan {
  id: string;
  event_id: string;
  name: string;
  description: string;
  price: number;
  benefits: string[];
  max_sponsors?: number;
  current_sponsors?: number;
  visibility: string;
  created_at: string;
  updated_at: string;
} 
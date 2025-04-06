import { Location } from "@/types/event";

/**
 * 贊助計劃表單數據類型
 */
export interface SponsorshipPlanForm {
  id: string;
  title: string;
  description: string;
  price: number;
  max_sponsors: number;
  benefits: string[];
}

/**
 * 事件表單數據類型
 */
export interface EventFormData {
  title: string;
  description: string;
  cover_image: string;
  start_time: string;
  end_time: string;
  category: string;
  tags: string;
  timezone: string;
  location: Location;
} 
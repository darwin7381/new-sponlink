import { RESOURCE_TYPE } from '@/lib/types/users';

// 所有權類型
export enum OWNER_TYPE {
  USER = 'user',
  ORGANIZATION = 'organization'
}

// 通用資源基礎接口
export interface BaseResource {
  id: string;
  ownerId: string;                        // 資源擁有者ID
  ownerType: OWNER_TYPE;                  // 擁有者類型：用戶或組織
  resourceType: RESOURCE_TYPE;            // 資源類型
  created_at: string;
  updated_at: string;
}

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

// 贊助方案 - 實現基礎資源接口
export interface SponsorshipPlan extends Omit<BaseResource, 'resourceType'> {
  event_id: string;
  title: string;
  description: string;
  price: number;
  benefits: string[];
  max_sponsors?: number;
  current_sponsors?: number;
}

// 活動 - 實現基礎資源接口
export interface Event extends Omit<BaseResource, 'resourceType'> {
  organizer_id: string;  // 暫時保留，兼容舊代碼
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
  timezone?: string; // 事件的時區，例如: 'Asia/Taipei', 'America/New_York'
}

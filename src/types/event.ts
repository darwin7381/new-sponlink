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

// 新增事件系列類型
export enum EventSeriesType {
  BLOCKCHAIN_WEEK = 'blockchain_week',
  HACKATHON_SERIES = 'hackathon_series',
  CONFERENCE_SERIES = 'conference_series',
  ROADSHOW = 'roadshow',
  CUSTOM = 'custom'
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

// 活動系列 - 實現基礎資源接口
export interface EventSeries extends Omit<BaseResource, 'resourceType'> {
  title: string;
  description: string;
  cover_image: string;
  series_type: EventSeriesType;
  start_time: string; // 整個活動系列的開始時間
  end_time: string; // 整個活動系列的結束時間
  main_event_id?: string; // 主要活動ID
  event_ids: string[]; // 系列中包含的所有活動ID
  status: EventStatus;
  category: string;
  tags: string[];
  locations: string[]; // 涵蓋的地點（城市名稱）
  timezone?: string;
  organizer?: string; // 添加組織者姓名字段
  website?: string; // 添加網站連結
  twitter?: string; // 添加 Twitter 帳號
  instagram?: string; // 添加 Instagram 帳號
}

// 活動材料接口
export interface EventMaterials {
  deck_url?: string;      // 活動簡報下載連結
  brochure_url?: string;  // 活動手冊下載連結
  agenda_url?: string;    // 活動議程下載連結
  other_materials?: {     // 其他材料
    name: string;
    url: string;
  }[];
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
  series_id?: string; // 所屬的活動系列ID，如果有的話
  is_main_event?: boolean; // 是否為活動系列的主要活動
  event_type?: string; // 活動類型，例如：Main Event, Side Event, Feature Event等
  materials?: EventMaterials; // 活動相關材料
  organizer?: string; // 添加組織者姓名字段
  attendees_count?: number;
  max_attendees?: number;
  price?: number;
  currency?: string;
  event_series_id?: string;
}

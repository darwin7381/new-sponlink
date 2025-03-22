/**
 * Luma 活動爬蟲服務
 * 用於從 Luma 活動頁面提取數據，並將其轉換為應用程序的事件格式
 */

import { Event, EventStatus, Location, LocationType } from '@/types/event';
import { v4 as uuidv4 } from 'uuid';

/**
 * Luma 活動數據結構（從抓取內容中提取）
 */
interface ScrapedLumaEvent {
  title: string;
  description: string;
  coverImage: string;
  startAt: string; // ISO 時間戳
  endAt: string;   // ISO 時間戳
  timezone?: string;
  location: {
    place_id?: string; 
    name?: string;
    address?: string;
    full_address?: string;
    city?: string;
    country?: string;
    description?: string;
    latitude?: number;
    longitude?: number;
    raw_geo_data?: Record<string, unknown>;
  };
  category: string;
  tags: string[];
}

/**
 * 創建位置對象
 * 直接使用原始 Google Places 數據
 */
const createLocation = (locationData: ScrapedLumaEvent['location']): Location => {
  try {
    // 確定位置類型 - 如果有 Google Place ID 使用 Google 類型
    const locationType = locationData.place_id 
      ? LocationType.GOOGLE 
      : (!locationData.full_address && !locationData.address 
        ? LocationType.VIRTUAL 
        : LocationType.CUSTOM);
    
    // 基本位置對象
    const location: Location = {
      id: uuidv4(),
      name: locationData.name || '',
      address: locationData.full_address || locationData.address || '',
      city: locationData.city || '',
      country: locationData.country || '',
      postal_code: '',
      location_type: locationType,
    };
    
    // Google Places 專用屬性
    if (locationData.place_id) {
      location.place_id = locationData.place_id;
    }
    
    // 添加經緯度
    if (typeof locationData.latitude === 'number' && typeof locationData.longitude === 'number') {
      location.latitude = locationData.latitude;
      location.longitude = locationData.longitude;
    }
    
    return location;
  } catch (error) {
    console.error('創建位置對象錯誤:', error);
    // 返回默認位置
    return {
      id: uuidv4(),
      name: '未知位置',
      address: '',
      city: '',
      country: '',
      postal_code: '',
      location_type: LocationType.CUSTOM
    };
  }
};

/**
 * 從 HTML 內容中解析 Luma 活動數據
 */
export const parseLumaHTML = (html: string): ScrapedLumaEvent | null => {
  try {
    // 這只是一個簡單的示例，實際應用中可能需要更複雜的解析
    
    // 提取標題
    const titleMatch = html.match(/<title>(.*?)<\/title>/);
    const title = titleMatch ? titleMatch[1].replace(' | Luma', '') : '未命名活動';
    
    // 提取描述（簡化示例）
    const descriptionMatch = html.match(/<meta\s+name="description"\s+content="([^"]+)"/i);
    const description = descriptionMatch ? descriptionMatch[1] : '';
    
    // 提取圖片（簡化示例）
    const imageMatch = html.match(/("https:\/\/images\.lumacdn\.com[^"]+?")/);
    const coverImage = imageMatch ? imageMatch[1].replace(/"/g, '') : '';
    
    // 假設一些默認值
    return {
      title,
      description,
      coverImage,
      startAt: '',
      endAt: '',
      location: {
        name: '',
        address: '',
        city: '',
        country: ''
      },
      category: 'Technology',
      tags: ['Conference', 'Tech']
    };
  } catch (error) {
    console.error('解析 Luma HTML 錯誤:', error);
    return null;
  }
};

/**
 * 格式化爬取的 Luma 數據為 Event 對象
 */
export const formatLumaEvent = (
  scrapedData: ScrapedLumaEvent,
  organizerId: string
): Omit<Event, 'id' | 'created_at' | 'updated_at'> => {
  // 創建位置對象
  const location = createLocation(scrapedData.location);
  
  // 格式化為應用程序的事件格式
  return {
    organizer_id: organizerId,
    title: scrapedData.title,
    description: scrapedData.description,
    cover_image: scrapedData.coverImage,
    start_time: scrapedData.startAt,  // 直接使用 ISO 時間戳
    end_time: scrapedData.endAt,      // 直接使用 ISO 時間戳
    location,
    status: EventStatus.DRAFT,
    category: scrapedData.category,
    tags: scrapedData.tags,
    sponsorship_plans: []
  };
};

/**
 * 從 Luma URL 抓取事件數據
 */
export const scrapeLumaEvent = async (lumaUrl: string, organizerId: string): Promise<Omit<Event, 'id' | 'created_at' | 'updated_at'> | null> => {
  try {
    // 使用我們的 API 端點來抓取 Luma 網站數據
    const response = await fetch(`/api/scrape-luma?url=${encodeURIComponent(lumaUrl)}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `抓取失敗: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.success || !data.eventData) {
      throw new Error('抓取 Luma 事件數據無效');
    }
    
    // 直接使用 API 返回的數據
    return formatLumaEvent(data.eventData, organizerId);
  } catch (error) {
    console.error('抓取 Luma 事件錯誤:', error);
    return null;
  }
}; 
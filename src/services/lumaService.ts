/**
 * Luma 活動爬蟲服務
 * 用於從 Luma 活動頁面提取數據，並將其轉換為應用程序的事件格式
 */

import { Event, EventStatus, Location, LocationType } from '@/types/event';
import { v4 as uuidv4 } from 'uuid';
import { convertToDatetimeLocalFormat, getBrowserTimezone } from '@/utils/dateUtils';

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
    location_type?: LocationType;
    postal_code?: string;
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
    // 確定位置類型 - 優先使用API返回的location_type，否則自動判斷
    let locationType;
    
    if (locationData.location_type !== undefined) {
      // 優先使用API返回的location_type值
      locationType = locationData.location_type;
      console.log('使用API返回的location_type:', locationType);
    } else {
      // 自動判斷位置類型 - 如果有Google Place ID使用Google類型
      locationType = locationData.place_id 
        ? LocationType.GOOGLE 
        : (!locationData.full_address && !locationData.address 
          ? LocationType.VIRTUAL 
          : LocationType.CUSTOM);
      console.log('自動判斷的location_type:', locationType);
    }
    
    // 基本位置對象
    const location: Location = {
      id: uuidv4(),
      name: locationData.name || '',
      address: locationData.full_address || locationData.address || '',
      city: locationData.city || '',
      country: locationData.country || '',
      postal_code: locationData.postal_code || '',
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
    
    console.log('創建的最終位置對象:', location);
    
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
 * 增加對時區的處理
 */
export const formatLumaEvent = (
  scrapedData: ScrapedLumaEvent,
  organizerId: string
): Omit<Event, 'id' | 'created_at' | 'updated_at'> => {
  // 創建位置對象
  const location = createLocation(scrapedData.location);
  
  // 處理時區 - 如果 Luma 沒有提供時區，使用瀏覽器的時區作為備用
  const timezone = scrapedData.timezone || getBrowserTimezone();
  console.log('活動時區:', timezone);
  
  // 將時間轉換為表單可顯示的格式
  const startTimeLocal = convertToDatetimeLocalFormat(scrapedData.startAt, timezone);
  const endTimeLocal = convertToDatetimeLocalFormat(scrapedData.endAt, timezone);
  
  console.log('原始開始時間:', scrapedData.startAt);
  console.log('轉換後開始時間:', startTimeLocal);
  console.log('原始結束時間:', scrapedData.endAt);
  console.log('轉換後結束時間:', endTimeLocal);
  
  // 格式化為應用程序的事件格式
  return {
    organizer_id: organizerId,
    title: scrapedData.title,
    description: scrapedData.description,
    cover_image: scrapedData.coverImage,
    start_time: scrapedData.startAt,  // 保留原始 ISO 時間戳
    end_time: scrapedData.endAt,      // 保留原始 ISO 時間戳
    location,
    status: EventStatus.DRAFT,
    category: scrapedData.category,
    tags: scrapedData.tags,
    sponsorship_plans: [],
    timezone: timezone  // 保存時區信息，方便後續處理
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
    
    // 檢查API返回的數據是否有效
    if (!data || !data.title) {
      throw new Error('抓取 Luma 事件數據無效');
    }
    
    console.log('API返回數據:', JSON.stringify(data).substring(0, 500) + '...');
    console.log('位置數據:', data.location);
    
    // 轉換為ScrapedLumaEvent格式
    const scrapedData: ScrapedLumaEvent = {
      title: data.title,
      description: data.description,
      coverImage: data.coverImage,
      startAt: data.startAt,
      endAt: data.endAt,
      timezone: data.timezone,
      location: {
        name: data.location.name,
        full_address: data.location.full_address,
        address: data.location.address,
        city: data.location.city,
        country: data.location.country,
        place_id: data.location.place_id,
        description: data.location.description,
        postal_code: data.location.postal_code,
        location_type: data.location.location_type, // 保留API返回的location_type
        latitude: data.location.latitude,
        longitude: data.location.longitude
      },
      category: data.category,
      tags: data.tags || []
    };
    
    // 直接使用 API 返回的數據作為 ScrapedLumaEvent
    return formatLumaEvent(scrapedData, organizerId);
  } catch (error) {
    console.error('抓取 Luma 事件錯誤:', error);
    throw error; // 向上拋出錯誤，使呼叫方能夠處理
  }
}; 
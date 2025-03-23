import { Location, LocationType } from '@/types/event';
import { v4 as uuidv4 } from 'uuid';

// 虛擬會議平台匹配規則 - 與 LocationSelector.tsx 完全一致
export const VIRTUAL_PLATFORMS = [
  { name: 'Zoom', regex: /zoom\.us|zoomus\.cn/i },
  { name: 'Google Meet', regex: /meet\.google\.com/i },
  { name: 'Microsoft Teams', regex: /teams\.microsoft\.com|teams\.live\.com/i },
  { name: 'Webex', regex: /webex\.com/i },
  { name: 'Skype', regex: /skype\.com/i },
  { name: 'Discord', regex: /discord\.com|discord\.gg/i },
  { name: 'Slack', regex: /slack\.com/i },
];

/**
 * 檢測輸入是否為虛擬會議連結
 * 與 LocationSelector.tsx 中的邏輯完全一致
 * @param url 輸入的URL或文字
 * @returns 包含是否為虛擬連結及平台名稱的對象
 */
export const detectVirtualPlatform = (url: string): { isVirtual: boolean, platformName: string } => {
  // 如果輸入非常短或明顯不是URL，直接返回非虛擬
  if (!url || url.length < 4 || !url.includes('.')) {
    return { isVirtual: false, platformName: '' };
  }

  // 避免將純地址或位置名稱誤識別為虛擬連結
  // 地址內容通常包含數字、逗號、空格等，而非純URL
  const addressPattern = /\d+.*?(st|rd|ave|blvd|square|plaza|district|road|street|avenue)/i;
  if (addressPattern.test(url)) {
    return { isVirtual: false, platformName: '' };
  }

  // 嘗試添加協議前綴以正確解析URL
  let normalizedUrl = url;
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    normalizedUrl = `https://${url}`;
  }

  try {
    const urlObj = new URL(normalizedUrl);
    const hostname = urlObj.hostname;
    
    // 不要將明顯是搜索詞的內容識別為URL
    // 例如： "café in paris" 不應該被視為URL，即使它包含點
    if (hostname.includes(' ') || !hostname.includes('.')) {
      return { isVirtual: false, platformName: '' };
    }
    
    // 檢查是否匹配已知的虛擬平台
    for (const platform of VIRTUAL_PLATFORMS) {
      if (platform.regex.test(hostname)) {
        return { isVirtual: true, platformName: platform.name };
      }
    }
    
    // 檢查是否為有效URL但非已知會議平台
    return { isVirtual: true, platformName: 'Virtual' };
  } catch {
    // 解析URL失敗，可能不是有效的URL
    return { isVirtual: false, platformName: '' };
  }
};

/**
 * 提取網域名稱（用於顯示虛擬網址）
 * @param url 完整網址
 * @returns 網域名稱
 */
export const extractDomainFromUrl = (url: string): string => {
  try {
    if (!url) return '';
    
    // 確保 URL 格式化正確
    const normalizedUrl = url.startsWith('http') ? url : `https://${url}`;
    const urlObj = new URL(normalizedUrl);
    return urlObj.hostname;
  } catch {
    // 若無法解析為 URL，返回原始文本
    return url;
  }
};

/**
 * 根據手動輸入標準創建虛擬活動地點
 * 完全遵循 LocationSelector.tsx 中的邏輯
 * @param input 用戶輸入的虛擬會議鏈接或文本
 * @returns 格式化後的 Location 對象
 */
export const createVirtualLocation = (input: string): Location => {
  const { isVirtual, platformName } = detectVirtualPlatform(input);
  
  if (!isVirtual) {
    // 如果不是虛擬地址，則創建自定義地址
    return createCustomLocation(input);
  }
  
  // 提取顯示域名
  const displayAddress = extractDomainFromUrl(input);
  
  // 遵循 LocationSelector 中的格式：
  // 情況 d: 已知虛擬會議平台 - 上方顯示平台名稱，下方顯示完整會議鏈接
  // 情況 e: 未知虛擬平台 - 上方顯示「Virtual」，下方顯示網域名稱
  return {
    id: uuidv4(),
    name: platformName, // 上方始終顯示平台名稱
    address: platformName === 'Virtual' ? displayAddress : input, // 當是未知平台時僅顯示域名，否則顯示完整鏈接
    full_address: input, // 保存原始輸入
    city: '',
    country: '',
    postal_code: '',
    isVirtual: true,
    platformName: platformName,
    location_type: LocationType.VIRTUAL
  };
};

/**
 * 建立Google地點的位置對象
 * 遵循 LocationSelector.tsx 中 handlePlaceSelect 的邏輯
 * @param placeDetails Google地點詳情
 * @returns 符合Google地點格式的Location對象
 */
export const createGoogleLocation = (placeDetails: {
  name: string;
  address?: string;
  full_address?: string;
  city?: string;
  country?: string;
  postal_code?: string;
  latitude?: number;
  longitude?: number;
  place_id: string;
}): Location => {
  // Google 地點的標準格式：
  // 1. 情況 b: 上方顯示地點名稱，下方顯示完整地址
  return {
    id: uuidv4(),
    name: placeDetails.name, // 上方顯示地點名稱
    address: placeDetails.address || placeDetails.full_address || '', // 下方顯示完整地址
    full_address: placeDetails.full_address || placeDetails.address || '',
    city: placeDetails.city || '',
    country: placeDetails.country || '',
    postal_code: placeDetails.postal_code || '',
    latitude: placeDetails.latitude,
    longitude: placeDetails.longitude,
    place_id: placeDetails.place_id,
    location_type: LocationType.GOOGLE, // 明確設置為 Google 類型
    // 注意：不設置 isVirtual 和 platformName，因為這是實體地點而非虛擬會議
  };
};

/**
 * 創建自定義地點（非 Google Places，非虛擬）
 * 遵循 LocationSelector.tsx 中 handleUseCustomAddress 的邏輯
 * @param address 地址文本
 * @param cityName 城市（可選）
 * @param countryName 國家（可選）
 * @returns 格式化的 Location 對象
 */
export const createCustomLocation = (address: string, cityName?: string, countryName?: string): Location => {
  // 自定義地址的標準格式：
  // 1. 情況 c: 上方顯示輸入文本，下方顯示「Custom Address」標籤
  return {
    id: uuidv4(),
    name: address, // 上方顯示輸入的地址文本
    address: address, // 保存完整地址
    full_address: address, // 保存完整地址
    city: cityName || '',
    country: countryName || '',
    postal_code: '',
    location_type: LocationType.CUSTOM, // 明確設置為自定義類型
    // 注意：不設置 isVirtual 和 platformName，因為這是自定義地址而非虛擬會議
  };
};

/**
 * 創建需要註冊查看的位置對象
 * @param city 城市名稱
 * @returns 符合需註冊格式的Location對象
 */
export const createRegistrationRequiredLocation = (city: string): Location => {
  return {
    id: uuidv4(),
    name: `[${city}] Please register to see the exact location of this event`,
    address: '',
    full_address: '',
    city: city,
    country: '',
    postal_code: '',
    latitude: undefined,
    longitude: undefined,
    place_id: '',
    location_type: LocationType.CUSTOM
  };
};

/**
 * 格式化位置顯示文本
 * 根據位置類型和可用信息生成適合顯示的文本
 * @param location 位置對象
 * @returns 格式化的顯示文本
 */
export const formatLocationDisplay = (location: Location): string => {
  if (!location) return '';
  
  if (location.location_type === LocationType.VIRTUAL) {
    return location.name || 'Virtual Event';
  }
  
  if (location.city && location.country) {
    return `${location.city}, ${location.country}`;
  }
  
  if (location.city || location.country) {
    return location.city || location.country || '';
  }
  
  return location.name || location.address || '';
};

/**
 * 判斷是否為需要註冊的地點文本
 * @param text 輸入文本
 * @returns 是否需要註冊
 */
export const isRegistrationRequired = (text: string): boolean => {
  return text.includes('register to see') || 
         text.includes('register to view') ||
         text.match(/\[\w+\]\s+Please register/i) !== null;
};

/**
 * 從註冊必要文本中提取城市
 * @param text 註冊必要文本，格式如"[City] Please register..."
 * @returns 城市名稱或空字符串
 */
export const extractCityFromRegistrationText = (text: string): string => {
  const match = text.match(/\[(\w+)\]/i);
  return match ? match[1] : '';
};

/**
 * 確保地點對象符合五種標準顯示格式之一
 * 這是一個保障函數，用於檢查並修正任何可能導致顯示不一致的地點對象
 * @param location 需要檢查的地點對象
 * @returns 修正後符合標準格式的地點對象
 */
export const ensureStandardLocationFormat = (location: Location): Location => {
  // 檢查是否為空地點
  if (!location || (!location.name && !location.address)) {
    // 情況 a: 初始形式/內容為空
    return {
      id: location?.id || uuidv4(),
      name: '',
      address: '',
      city: '',
      country: '',
      postal_code: '',
      location_type: undefined
    };
  }

  // 檢查地點類型
  if (location.location_type === LocationType.VIRTUAL || location.isVirtual) {
    // 確保虛擬地點格式正確
    // 情況 d 和 e: 虛擬會議
    return {
      ...location,
      id: location.id || uuidv4(),
      name: location.platformName || 'Virtual', // 上方顯示平台名稱或 Virtual
      address: location.platformName === 'Virtual' ? extractDomainFromUrl(location.address || location.full_address || '') : (location.address || location.full_address || ''), // 下方顯示域名或完整鏈接
      location_type: LocationType.VIRTUAL
    };
  } else if (location.location_type === LocationType.GOOGLE && location.place_id) {
    // 情況 b: Google 地點
    return {
      ...location,
      id: location.id || uuidv4(),
      location_type: LocationType.GOOGLE
    };
  } else {
    // 情況 c: 自定義地址
    return {
      ...location,
      id: location.id || uuidv4(),
      location_type: LocationType.CUSTOM
    };
  }
}; 
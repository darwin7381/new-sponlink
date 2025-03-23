/**
 * Google Places API (v1) 工具函數
 * 提供與Google Places API交互的功能
 */

/**
 * 地點詳情接口
 */
export interface PlaceDetails {
  name?: string;
  full_address?: string;
  city?: string;
  country?: string;
  postal_code?: string;
  address?: string;
  description?: string;
  latitude?: number;
  longitude?: number;
}

/**
 * 預測結果接口
 */
export interface Prediction {
  id: string;
  name: string;
  address: string;
  mainText: string;
  secondaryText: string;
}

/**
 * Place API 地點接口
 */
interface PlaceApiPlace {
  id: string;
  displayName?: {
    text: string;
    languageCode: string;
  };
  formattedAddress?: string;
}

/**
 * 地址組件接口
 */
interface AddressComponent {
  longText: string;
  shortText: string;
  types: string[];
  languageCode: string;
}

/**
 * 從Google Places API獲取地點詳情
 * 使用新版Google Places API (v1)
 * 
 * @param placeId - Google Places ID
 * @param apiKey - Google Maps API密鑰
 * @returns 地點詳情對象
 */
export async function getPlaceDetailsFromAPI(
  placeId: string, 
  apiKey: string
): Promise<PlaceDetails | null> {
  if (!apiKey) {
    console.log('未配置Google Maps API密钥，无法获取地点详情');
    return null;
  }

  console.log(`使用API密钥 ${apiKey.substring(0, 8)}... 获取地点详情，place_id: ${placeId}`);
  
  try {
    // 使用新版Google Places API (v1)
    const url = `https://places.googleapis.com/v1/places/${placeId}`;
    
    console.log(`API调用URL: ${url}`);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'displayName,formattedAddress,location,addressComponents'
      }
    });
    
    const data = await response.json();
    
    console.log(`Places API响应状态码: ${response.status}`);
    
    if (response.ok && data) {
      // 解析地址组件
      console.log('成功获取地点详情，数据结构:', JSON.stringify(data).substring(0, 300) + '...');
      
      // 从地址组件中提取城市和国家
      let city = '';
      let country = '';
      let postal_code = '';
      let streetName = '';
      let streetNumber = '';
      
      if (data.addressComponents) {
        data.addressComponents.forEach((component: AddressComponent) => {
          if (component.types.includes('locality')) {
            city = component.longText || '';
          } else if (component.types.includes('country')) {
            country = component.longText || '';
          } else if (component.types.includes('postal_code')) {
            postal_code = component.longText || '';
          } else if (component.types.includes('administrative_area_level_1') && !city) {
            // 如果没有找到城市，使用一级行政区
            city = component.longText || '';
          } else if (component.types.includes('route')) {
            streetName = component.longText || '';
          } else if (component.types.includes('street_number')) {
            streetNumber = component.longText || '';
          }
        });
      }
      
      // 提取地址（去除城市和国家）
      const address = data.formattedAddress ? 
        data.formattedAddress.split(',').slice(0, -2).join(',').trim() : 
        (streetNumber && streetName ? `${streetNumber}, ${streetName}` : '');
        
      // 构建完整的结果对象
      const result: PlaceDetails = {
        name: data.displayName?.text || '',
        full_address: data.formattedAddress || '',
        city,
        country,
        postal_code,
        address: address || '',
        description: '',
        latitude: data.location?.latitude || undefined,
        longitude: data.location?.longitude || undefined
      };
      
      console.log('从API解析的最终地址数据:', result);
      
      return result;
    } else {
      // 详细记录错误信息
      console.error('Google Places API返回错误:', data);
      if (data.error) {
        console.error('错误详情:', data.error.message || data.error.status || '未知错误');
        console.error('错误码:', data.error.code || '无错误码');
      }
      return null;
    }
  } catch (error) {
    console.error('获取Google地点详情时出错:', error);
    if (error instanceof Error) {
      console.error('错误消息:', error.message);
      console.error('错误堆栈:', error.stack);
    }
    return null;
  }
}

/**
 * 獲取地點預測
 * 使用新版Google Places API (v1)的searchText接口搜索地點
 * 
 * @param input - 用戶輸入的搜索文本
 * @param apiKey - Google Maps API密鑰
 * @param limit - 最大返回結果數量(默認為5)
 * @param language - 語言代碼(默認為en)
 * @returns 預測結果數組
 */
export async function fetchPlacePredictions(
  input: string,
  apiKey: string,
  limit: number = 5,
  language: string = 'en'
): Promise<Prediction[]> {
  if (!input.trim() || !apiKey) {
    return [];
  }
  
  try {
    // 使用新版Places API進行全球搜索(無地區限制)
    const response = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress'
      },
      body: JSON.stringify({
        textQuery: input,
        languageCode: language
      })
    });
    
    const data = await response.json();
    
    if (response.ok && data.places && data.places.length > 0) {
      // 轉換為我們的預測格式，並限制最多結果數量
      const transformedPredictions = data.places
        .map((place: PlaceApiPlace) => ({
          id: place.id,
          name: place.displayName?.text || '',
          address: place.formattedAddress || '',
          mainText: place.displayName?.text || '',
          secondaryText: place.formattedAddress || ''
        }))
        .slice(0, limit);
      
      return transformedPredictions;
    } else {
      return [];
    }
  } catch (error) {
    console.error('預測請求錯誤:', error);
    return [];
  }
}

/**
 * 加載Google Maps JavaScript API
 * 
 * @param apiKey - Google Maps API密鑰
 * @param callback - 加載完成回調函數
 * @param libraries - 需要加載的庫(默認為空)
 * @returns 清理函數，用於移除事件監聽器
 */
export function loadGoogleMapsAPI(
  apiKey: string,
  callback?: () => void,
  libraries: string[] = []
): () => void {
  // 使用全局變量跟踪加載狀態，避免重複加載
  if (typeof window !== 'undefined') {
    if (!window.googleMapsInitialized) {
      window.googleMapsInitialized = true;
    } else if (window.google && window.google.maps) {
      console.log('Google Maps API already loaded');
      if (callback) callback();
      return () => {};
    }
    
    // 檢查是否已經有腳本正在加載
    const existingScript = document.getElementById('google-maps-api');
    if (existingScript) {
      console.log('Google Maps API script already exists');
      return () => {};
    }
    
    console.log('Starting to load Google Maps API');
    
    // 定義回調函數以通知加載完成
    const callbackName = `initGoogleMapsCallback_${Date.now()}`;
    window[callbackName] = () => {
      console.log('Google Maps initialized via callback');
      if (callback) callback();
    };
    
    const script = document.createElement('script');
    script.id = 'google-maps-api';
    
    // 構建URL，包含庫參數
    let url = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=${callbackName}`;
    if (libraries.length > 0) {
      url += `&libraries=${libraries.join(',')}`;
    }
    
    script.src = url;
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      console.log('Google Maps script loaded successfully');
      if (window.google && window.google.maps) {
        console.log('Google Maps API available');
      } else {
        console.error('Google Maps script loaded but API object is not available');
      }
    };
    
    script.onerror = (error) => {
      console.error('Failed to load Google Maps API:', error);
      window.googleMapsInitialized = false; // 重置狀態以允許再次嘗試
    };
    
    document.head.appendChild(script);
    
    // 清理函數
    return () => {
      // 不移除腳本，因為其他組件可能正在使用它
      // 只移除自定義回調
      if (window[callbackName]) {
        window[callbackName] = undefined;
      }
    };
  }
  
  return () => {};
}

// 擴展Window接口，添加googleMapsInitialized屬性
declare global {
  interface Window {
    googleMapsInitialized?: boolean;
    [key: string]: unknown;
  }
} 
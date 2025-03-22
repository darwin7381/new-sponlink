import { getCurrentUser } from "@/lib/services/authService";
import { Location } from "@/types/event";

// 城市和國家的本地化映射
interface CountryMap {
  [key: string]: {
    en: string;
    zh: string;
  };
}

interface CityMap {
  [key: string]: {
    en: string;
    zh: string;
  };
}

// 國家名稱本地化映射
const countryLocalization: CountryMap = {
  "USA": { en: "USA", zh: "美國" },
  "United States": { en: "USA", zh: "美國" },
  "China": { en: "China", zh: "中國" },
  "Taiwan": { en: "Taiwan", zh: "台灣" },
  "中國": { en: "China", zh: "中國" },
  "台灣": { en: "Taiwan", zh: "台灣" },
  "Japan": { en: "Japan", zh: "日本" },
  "South Korea": { en: "South Korea", zh: "韓國" },
  "Korea": { en: "South Korea", zh: "韓國" },
  "韓國": { en: "South Korea", zh: "韓國" },
  "Singapore": { en: "Singapore", zh: "新加坡" },
  "新加坡": { en: "Singapore", zh: "新加坡" },
  "Hong Kong": { en: "Hong Kong", zh: "香港" },
  "中國香港": { en: "Hong Kong", zh: "中國香港" },
};

// 城市名稱本地化映射
const cityLocalization: CityMap = {
  "San Francisco": { en: "San Francisco", zh: "舊金山" },
  "New York": { en: "New York", zh: "紐約" },
  "Seattle": { en: "Seattle", zh: "西雅圖" },
  "台北": { en: "Taipei", zh: "台北" },
  "Taipei": { en: "Taipei", zh: "台北" },
  "北京": { en: "Beijing", zh: "北京" },
  "Beijing": { en: "Beijing", zh: "北京" },
  "Hong Kong": { en: "Hong Kong", zh: "香港" },
  "香港": { en: "Hong Kong", zh: "香港" },
  "首爾": { en: "Seoul", zh: "首爾" },
  "Seoul": { en: "Seoul", zh: "首爾" },
  "新加坡": { en: "Singapore", zh: "新加坡" },
  "Singapore": { en: "Singapore", zh: "新加坡" },
};

/**
 * 獲取用戶當前語言設置
 * 如果用戶未登入或未設置語言，將返回默認語言(en)
 */
export const getUserLanguage = async (): Promise<string> => {
  try {
    const user = await getCurrentUser();
    return user?.preferred_language || "en";
  } catch (error) {
    console.error("Error getting user language:", error);
    return "en"; // 出錯時使用默認語言
  }
};

/**
 * 同步版本的獲取語言函數，從localStorage直接讀取
 * 適用於不能使用async函數的場景
 */
export const getUserLanguageSync = (): string => {
  try {
    if (typeof window !== 'undefined') {
      const userJson = localStorage.getItem('user');
      if (!userJson) return "en";
      const user = JSON.parse(userJson);
      return user?.preferred_language || "en";
    }
    return "en";
  } catch (error) {
    console.error("Error getting user language:", error);
    return "en";
  }
};

/**
 * 根據用戶語言格式化國家名稱
 */
export const formatCountry = (country: string, language: string = "en"): string => {
  if (!country) return "";
  
  const countryData = countryLocalization[country];
  if (countryData) {
    return language === "zh" ? countryData.zh : countryData.en;
  }
  
  // 如果找不到映射關係，返回原始值
  return country;
};

/**
 * 根據用戶語言格式化城市名稱
 */
export const formatCity = (city: string, language: string = "en"): string => {
  if (!city) return "";
  
  const cityData = cityLocalization[city];
  if (cityData) {
    return language === "zh" ? cityData.zh : cityData.en;
  }
  
  // 如果找不到映射關係，返回原始值
  return city;
};

/**
 * 格式化地點顯示的工具函數
 */

/**
 * 簡單地將城市和國家標準化顯示為 "城市, 國家" 格式
 * 直接使用數據庫中存儲的值，不進行本地化翻譯
 */
export const formatLocation = (city?: string, country?: string): string => {
  if (!city && !country) return "";
  if (city && country) return `${city}, ${country}`;
  return city || country || "";
};

/**
 * 格式化地址，用於顯示完整地址信息
 */
export const formatAddress = (location: Location | null | undefined): string => {
  if (!location) return "";
  
  const parts = [];
  if (location.name) parts.push(location.name);
  if (location.address) parts.push(location.address);
  
  const cityCountry = formatLocation(location.city, location.country);
  if (cityCountry) {
    const postalCode = location.postal_code ? ` ${location.postal_code}` : '';
    parts.push(`${cityCountry}${postalCode}`);
  }
  
  return parts.join('\n');
};

/**
 * 格式化地址顯示為"城市, 國家"的格式，並根據用戶語言本地化
 */
export const formatLocationSync = (city: string, country: string): string => {
  const language = getUserLanguageSync();
  return formatLocation(city, country, language);
}; 
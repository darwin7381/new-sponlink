import { Location } from "@/types/event";

// Language type
export type SupportedLanguage = 'en' | 'zh';

// City and country localization mappings
interface LocalizationMap {
  [key: string]: {
    en: string;
    zh: string;
  };
}

// Country name localization mapping
const countryLocalization: LocalizationMap = {
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

// City name localization mapping
const cityLocalization: LocalizationMap = {
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

// Store language preference in localStorage with a dedicated key
const LANGUAGE_STORAGE_KEY = 'app_language_preference';

/**
 * Get the current language setting
 * Returns 'en' (English) as the default and only supported language
 * Note: This application standardizes on English for all text
 */
export const getUserLanguage = (): SupportedLanguage => {
  // Always return English as the standard language
  return "en";
};

/**
 * Synchronous version of getUserLanguage
 * Standardized to always return 'en'
 */
export const getUserLanguageSync = (): SupportedLanguage => {
  // Application standardized to English, no need to check user preferences
  return "en";
};

/**
 * Format country name based on language
 */
export const formatCountry = (country: string, language: SupportedLanguage = "en"): string => {
  if (!country) return "";
  
  const countryData = countryLocalization[country];
  if (countryData) {
    return language === "zh" ? countryData.zh : countryData.en;
  }
  
  // Return original value if no mapping found
  return country;
};

/**
 * Format city name based on language
 */
export const formatCity = (city: string, language: SupportedLanguage = "en"): string => {
  if (!city) return "";
  
  const cityData = cityLocalization[city];
  if (cityData) {
    return language === "zh" ? cityData.zh : cityData.en;
  }
  
  // Return original value if no mapping found
  return city;
};

/**
 * Format location as "city, country"
 * Uses the values stored in the database without localization
 */
export const formatLocation = (city?: string, country?: string): string => {
  if (!city && !country) return "";
  if (city && country) return `${city}, ${country}`;
  return city || country || "";
};

/**
 * Format full address from Location object
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
 * Synchronous version of formatLocation
 */
export const formatLocationSync = (city: string, country: string): string => {
  return formatLocation(city, country);
}; 
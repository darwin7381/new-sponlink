import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';
import { getPlaceDetailsFromAPI } from '@/lib/utils/googlePlacesAPI';
import { LocationType } from '@/types/event';

/**
 * Luma 活動數據接口
 */
export interface LumaEvent {
  eventId: string;
  pageUrl: string;
  title: string;
  description: string;
  hostName: string;
  hostUrl: string;
  coverImage: string;
  startAt: string;
  endAt: string;
  timezone: string;
  location: LumaLocationData;
  category: string;
  tags: string[];
}

/**
 * Luma 地點數據接口
 */
export interface LumaLocationData {
  name: string;
  full_address: string;
  city?: string;
  country?: string;
  address?: string;
  description?: string;
  place_id?: string;
  postal_code?: string;
  location_type: LocationType;
}

/**
 * 處理抓取 Luma 頁面的 API 路由
 * 這在服務器端運行，可以避免前端的 CORS 限制
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');
    
    if (!url) {
      return NextResponse.json({ success: false, error: "URL parameter is required" }, { status: 400 });
    }
    
    if (!url.startsWith('https://lu.ma/')) {
      return NextResponse.json({ success: false, error: "Only Luma URLs are supported" }, { status: 400 });
    }

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (!response.ok) {
      return NextResponse.json({ 
        success: false, 
        error: `Failed to fetch the page: ${response.status} ${response.statusText}` 
      }, { status: 500 });
    }

    const html = await response.text();
    const eventData = await scrapeLumaEventFromHTML(html);
    
    // 標籤提取優化
    const getTags = (title: string, description: string, category: string, location: LumaLocationData) => {
      // 從標題和描述中提取潛在的標籤
      const tags: string[] = [];
      
      // 如果有類別，將其添加到標籤中
      if (category) {
        tags.push(category);
      }
      
      // 標籤常見關鍵詞列表
      const commonTagKeywords = [
        "NFT", "Crypto", "Blockchain", "Web3", "DeFi", "Ethereum", "Conference", "Meetup", 
        "Workshop", "Hackathon", "Networking", "Summit", "Business", "Tech", "Technology",
        "Startup", "Innovation", "Finance", "Training", "Seminar"
      ];
      
      // 從標題和描述中提取常見關鍵詞作為標籤
      const combinedText = `${title} ${description}`.toLowerCase();
      commonTagKeywords.forEach(keyword => {
        if (combinedText.includes(keyword.toLowerCase())) {
          if (!tags.includes(keyword)) {
            tags.push(keyword);
          }
        }
      });
      
      // 如果位置信息是城市名稱，添加城市作為標籤
      if (location.city && !tags.includes(location.city)) {
        tags.push(location.city);
      }
      
      // 對於特定地點，添加相關標籤
      if (location.name && location.name.includes("Taipei")) {
        if (!tags.includes("Taipei")) {
          tags.push("Taipei");
        }
      }
      
      // 限制標籤數量，避免太多標籤
      return tags.slice(0, 5);
    }

    // 在返回數據前應用標籤提取
    eventData.tags = getTags(eventData.title, eventData.description, eventData.category, eventData.location);

    // 將提取的數據組合為最終結果
    const result = {
      title: eventData.title,
      description: eventData.description,
      coverImage: eventData.coverImage,
      startAt: eventData.startAt,
      endAt: eventData.endAt,
      timezone: eventData.timezone,
      location: {
        name: eventData.location.name,
        full_address: eventData.location.full_address,
        city: eventData.location.city,
        country: eventData.location.country,
        place_id: eventData.location.place_id,
        address: eventData.location.address || eventData.location.full_address,
        postal_code: eventData.location.postal_code,
        location_type: eventData.location.location_type || LocationType.CUSTOM // 確保始終有一個有效的location_type
      },
      category: eventData.category,
      tags: eventData.tags
    };

    console.log('最终返回数据中的地址信息:', {
      name: eventData.location.name,
      full_address: eventData.location.full_address,
      city: eventData.location.city,
      country: eventData.location.country,
      place_id: eventData.location.place_id,
      location_type: eventData.location.location_type
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error scraping Luma event:', error);
    return NextResponse.json({ 
      success: false, 
      error: `Error scraping Luma event: ${(error as Error).message}` 
    }, { status: 500 });
  }
}

/**
 * 從 HTML 結構直接提取 Luma 事件數據
 */
async function scrapeLumaEventFromHTML(htmlContent: string): Promise<LumaEvent> {
  const $ = cheerio.load(htmlContent);
  
  // 提取標題
  const title = $('h1').first().text().trim();
  
  // 提取封面圖片
  const coverImage = $('img').filter((_, el) => {
    const src = $(el).attr('src') || '';
    return src.includes('event-covers') || src.includes('lumacdn.com');
  }).first().attr('src') || '';
  
  // 提取描述
  let description = '';
  
  // 尋找 "About Event" 後面的文本
  const aboutEventElements = $(':contains("About Event")');
  if (aboutEventElements.length > 0) {
    const aboutEventElement = aboutEventElements.filter((_, el) => {
      const text = $(el).text().trim();
      return text === 'About Event';
    }).first();
    
    if (aboutEventElement.length > 0) {
      // 尋找 "About Event" 後面的文本，直到下一個標題或位置信息
      const parent = aboutEventElement.parent();
      const siblings = parent.nextAll();
      
      for (let i = 0; i < siblings.length; i++) {
        const current = $(siblings[i]);
        const text = current.text().trim();
        
        // 如果遇到新標題或位置信息，停止提取
        if (
          text.includes('Location') || 
          text.includes('Going') || 
          text.includes('What\'s New') ||
          text.includes('Registration') ||
          current.find('h1, h2, h3').length > 0
        ) {
          break;
        }
        
        // 加入描述文本
        if (text.length > 10 && !text.includes('Props') && !text.includes('api_id')) {
          description += text + ' ';
        }
      }
    }
  }
  
  // 如果上面方式沒有找到描述，嘗試尋找特定段落
  if (!description) {
    // 尋找以 "Begin your journey" 或其他常見開頭的段落
    const potentialDescriptions = $('p, div').filter((_, el) => {
      const text = $(el).text().trim();
      return (
        text.length > 100 && 
        !text.includes('Props') && 
        !text.includes('api_id') && 
        !text.includes('initialData')
      );
    });
    
    if (potentialDescriptions.length > 0) {
      description = potentialDescriptions.first().text().trim();
    }
  }
  
  // 如果上述方法都失敗了，直接查找頁面中包含 "Begin your journey" 的文本
  if (!description) {
    const beginJourneyIndex = htmlContent.indexOf('Begin your journey');
    if (beginJourneyIndex > -1) {
      const beginJourneyText = htmlContent.substring(beginJourneyIndex, beginJourneyIndex + 1000);
      description = beginJourneyText.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
      
      // 防止描述太長
      if (description.length > 500) {
        description = description.substring(0, 500) + '...';
      }
    }
  }
  
  // 清理描述
  description = description
    .replace(/\s+/g, ' ')
    .replace(/​+/g, ' ') // 清理不可見字符
    .trim();
  
  // 清理JSON格式的文本
  if (description.startsWith('{') && description.includes('props')) {
    description = '';
  }
  
  // 提取時間日期信息 - 查找日期格式
  const datePattern = /(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sept?|Oct|Nov|Dec)\s+(\d{4})/i;
  
  // 從 HTML 中查找日期和時間
  let startAt = '';
  let endAt = '';
  let timezone = 'UTC';
  
  // 尋找日期和時間信息
  $('div, span, p').each((i, el) => {
    const text = $(el).text();
    
    // 尋找日期
    const dateMatch = text.match(datePattern);
    if (dateMatch) {
      const [, day, month, year] = dateMatch;
      
      // 尋找時間
      const timeMatches = text.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/g);
      if (timeMatches && timeMatches.length >= 1) {
        // 假設第一個時間是開始時間，第二個是結束時間
        const startTime = timeMatches[0];
        const endTime = timeMatches.length > 1 ? timeMatches[1] : '';
        
        // 轉換為 ISO 格式日期
        const monthNum = {
          'jan': 0, 'feb': 1, 'mar': 2, 'apr': 3, 'may': 4, 'jun': 5,
          'jul': 6, 'aug': 7, 'sep': 8, 'sept': 8, 'oct': 9, 'nov': 10, 'dec': 11
        }[month.toLowerCase()] || 0;
        
        // 創建日期對象
        const date = new Date(parseInt(year), monthNum, parseInt(day));
        
        // 處理開始時間
        if (startTime) {
          const [startHour, startMinute, startAmPm] = startTime.split(/[:\s]/);
          let hour = parseInt(startHour);
          if (startAmPm && startAmPm.toLowerCase() === 'pm' && hour < 12) {
            hour += 12;
          } else if (startAmPm && startAmPm.toLowerCase() === 'am' && hour === 12) {
            hour = 0;
          }
          date.setHours(hour, parseInt(startMinute) || 0);
          startAt = date.toISOString();
        }
        
        // 處理結束時間
        if (endTime) {
          const [endHour, endMinute, endAmPm] = endTime.split(/[:\s]/);
          let hour = parseInt(endHour);
          if (endAmPm && endAmPm.toLowerCase() === 'pm' && hour < 12) {
            hour += 12;
          } else if (endAmPm && endAmPm.toLowerCase() === 'am' && hour === 12) {
            hour = 0;
          }
          date.setHours(hour, parseInt(endMinute) || 0);
          endAt = date.toISOString();
        }
      }
    }
    
    // 尋找時區
    if (text.includes('timezone') || text.includes('UTC') || text.includes('GMT') || text.includes('EST') || text.includes('PST')) {
      const timezoneMatch = text.match(/(UTC|GMT|[A-Z]{3,4})|([A-Za-z]+\/[A-Za-z_]+)/);
      if (timezoneMatch) {
        timezone = timezoneMatch[0];
      }
    }
  });
  
  // 方法2: 從JSON數據中提取日期和時區
  if (!startAt) {
    const isoDateMatch = htmlContent.match(/"start_at":"([^"]+)"/);
    if (isoDateMatch && isoDateMatch[1]) {
      startAt = isoDateMatch[1];
      
      const isoEndMatch = htmlContent.match(/"end_at":"([^"]+)"/);
      if (isoEndMatch && isoEndMatch[1]) {
        endAt = isoEndMatch[1];
      } else {
        // 假設活動時長為 3 小時
        const startDate = new Date(startAt);
        startDate.setHours(startDate.getHours() + 3);
        endAt = startDate.toISOString();
      }
      
      const timezoneMatch = htmlContent.match(/"timezone":"([^"]+)"/);
      if (timezoneMatch && timezoneMatch[1]) {
        timezone = timezoneMatch[1];
      }
    }
  }
  
  // 如果仍然找不到日期，使用默認值
  if (!startAt) {
    const now = new Date();
    startAt = now.toISOString();
    now.setHours(now.getHours() + 3);
    endAt = now.toISOString();
  }
  
  // 嘗試從JSON數據中提取Google Places ID和地理信息
  let placeId = '';
  let fullAddress = '';
  let locationName = '';
  let cityName = '';
  let countryName = '';
  let locationDescription = '';

  // 首先嘗試從geo_address_info中提取完整數據
  const geoAddressInfoMatch = htmlContent.match(/"geo_address_info":\s*(\{[^}]+\})/);
  if (geoAddressInfoMatch) {
    try {
      // 改进JSON字符串的预处理
      let geoInfoJson = geoAddressInfoMatch[1];
      
      // 先识别和转义JSON中的嵌套引号
      geoInfoJson = geoInfoJson.replace(/([^\\])"/g, '$1\\"'); // 转义所有非转义的引号
      geoInfoJson = geoInfoJson.replace(/^"/, '\\"'); // 处理开头的引号
      geoInfoJson = `{${geoInfoJson}}`; // 重新包装为JSON对象
      
      console.log('预处理后的geo_address_info JSON字符串:', geoInfoJson);
      
      // 使用正则表达式直接提取需要的字段
      try {
        // 提取place_id
        const placeIdMatch = geoInfoJson.match(/"place_id\\?":\s*\\?"([^\\]+)\\?"/);
        if (placeIdMatch && placeIdMatch[1]) {
          placeId = placeIdMatch[1];
          console.log('从geo_address_info提取到place_id:', placeId);
        }
        
        // 提取其他信息
        const addressMatch = geoInfoJson.match(/"address\\?":\s*\\?"([^\\]+)\\?"/);
        if (addressMatch && addressMatch[1]) {
          locationName = addressMatch[1];
          console.log('从geo_address_info提取到locationName:', locationName);
        }
        
        const cityMatch = geoInfoJson.match(/"city\\?":\s*\\?"([^\\]+)\\?"/);
        if (cityMatch && cityMatch[1]) {
          cityName = cityMatch[1];
          console.log('从geo_address_info提取到cityName:', cityName);
        }
        
        const countryMatch = geoInfoJson.match(/"country\\?":\s*\\?"([^\\]+)\\?"/);
        if (countryMatch && countryMatch[1]) {
          countryName = countryMatch[1];
          console.log('从geo_address_info提取到countryName:', countryName);
        }
        
        const fullAddressMatch = geoInfoJson.match(/"full_address\\?":\s*\\?"([^\\]+)\\?"/);
        if (fullAddressMatch && fullAddressMatch[1]) {
          fullAddress = fullAddressMatch[1];
          console.log('从geo_address_info提取到fullAddress:', fullAddress);
        }
        
        const descriptionMatch = geoInfoJson.match(/"description\\?":\s*\\?"([^\\]+)\\?"/);
        if (descriptionMatch && descriptionMatch[1]) {
          locationDescription = descriptionMatch[1].replace(/\\n/g, '\n');
          console.log('从geo_address_info提取到description:', locationDescription);
        }
      } catch (regexError) {
        console.error('使用正则表达式提取geo_address_info失败:', regexError);
      }
    } catch (e) {
      console.error('处理geo_address_info时出错:', e);
    }
  }

  // 如果上面方法沒有獲取到place_id，嘗試從Google Maps嵌入URL提取
  if (!placeId) {
    // 尝试方法1：从maps/embed/v1/place中提取
    const mapsEmbedMatch = htmlContent.match(/maps\/embed\/v1\/place\?[^"]*place_id%3A([^&"]+)/);
    if (mapsEmbedMatch && mapsEmbedMatch[1]) {
      placeId = decodeURIComponent(mapsEmbedMatch[1]);
      console.log('从maps/embed/v1/place提取到place_id:', placeId);
    } 
    
    // 尝试方法2：从maps/search中提取
    if (!placeId) {
      const mapsSearchMatch = htmlContent.match(/maps\/search\/\?[^"]*query_place_id=([^&"]+)/);
      if (mapsSearchMatch && mapsSearchMatch[1]) {
        placeId = mapsSearchMatch[1];
        console.log('从maps/search提取到place_id:', placeId);
      }
    }
    
    // 尝试方法3：直接从HTML中搜索place_id
    if (!placeId) {
      const directPlaceIdMatch = htmlContent.match(/"place_id":"([^"]+)"/);
      if (directPlaceIdMatch && directPlaceIdMatch[1]) {
        placeId = directPlaceIdMatch[1];
        console.log('从HTML直接提取到place_id:', placeId);
      }
    }
  }

  // 檢查是否為線上活動 - 更精確的檢測
  const isOnlineEvent = 
    htmlContent.match(/online\s+event/i) !== null || 
    htmlContent.match(/virtual\s+event/i) !== null || 
    (htmlContent.toLowerCase().includes(' zoom ') && !htmlContent.toLowerCase().includes('zoom is not')) ||
    htmlContent.toLowerCase().includes('webinar');

  // 創建位置對象
  const location: LumaLocationData = {
    name: '',
    full_address: '',
    place_id: '',
    location_type: LocationType.CUSTOM // 默認為自定義類型
  };

  // 完成从地点信息提取过程
  const processLocation = async () => {
    // 检查地址是否为模糊地址（obfuscated）
    const isObfuscatedAddress = htmlContent.includes('"mode":"obfuscated"') || 
                                geoAddressInfoMatch?.[1]?.includes('"mode":"obfuscated"');
    
    // 檢查是否需要註冊才能查看確切位置
    const needsRegistration = 
      htmlContent.includes('Please register to see the exact location') || 
      htmlContent.includes('Register to See Address') ||
      htmlContent.includes('Request to Join') && htmlContent.match(/location.*hidden/i) ||
      (htmlContent.includes('Location') && htmlContent.includes('Please register')) ||
      htmlContent.match(/address.*hidden until/i) ||
      htmlContent.match(/venue.*revealed/i) ||
      $('div:contains("Location")').next().text().includes('register') ||
      $('div:contains("Address")').next().text().includes('register');
    
    // 通用的地區/城市識別模式
    const locationPatterns = [
      /([A-Za-z\u4e00-\u9fa5]+)\s*District,\s*([A-Za-z\u4e00-\u9fa5]+)\s*City/i,  // 區域, 城市
      /([A-Za-z\u4e00-\u9fa5]+)\s*City,\s*([A-Za-z\u4e00-\u9fa5]+)/i,             // 城市, 國家
      /([A-Za-z\u4e00-\u9fa5]+)\s*區,\s*([A-Za-z\u4e00-\u9fa5]+)\s*市/i,          // 區域, 城市 (本地化版本)
      /([A-Za-z\u4e00-\u9fa5]+),\s*([A-Za-z\u4e00-\u9fa5]+)/i                    // 一般的 城市, 國家/州
    ];
    
    // 提取地區/城市名字的函數
    const extractLocationInfo = () => {
      // 先從 geo_address_info 獲取
      if (geoAddressInfoMatch) {
        const cityStateMatch = geoAddressInfoMatch[1].match(/"city_state\\?":\s*\\?"([^\\]+)\\?"/);
        if (cityStateMatch && cityStateMatch[1]) {
          return cityStateMatch[1];
        }
      }
      
      // 尋找可能包含位置信息的元素
      const locationElements = $('div:contains("Location")').next();
      if (locationElements.length > 0) {
        const locationText = locationElements.text().trim();
        if (locationText && !locationText.includes('register') && !locationText.includes('Online')) {
          return locationText;
        }
      }
      
      // 直接在整個 HTML 尋找可能的位置信息
      for (const pattern of locationPatterns) {
        const match = htmlContent.match(pattern);
        if (match) {
          return match[0];
        }
      }
      
      return null;
    };
    
    if (isOnlineEvent) {
      // 線上活動
      location.name = 'Online Event';
      location.full_address = 'Online Event';
      location.place_id = '';
      location.location_type = LocationType.VIRTUAL; // 設置為虛擬類型
    } else if (placeId) {
      // 優先處理有 Google Place ID 的情況 - 使用 Google Places API 獲取詳細信息
      location.place_id = placeId;
      location.location_type = LocationType.GOOGLE;
      
      try {
        // 使用環境變量獲取 API 密鑰
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';
        const placeDetails = await getPlaceDetailsFromAPI(location.place_id, apiKey);
        
        if (placeDetails) {
          // 成功從API獲取數據，使用 API 返回的結果
          location.name = placeDetails.name || locationName || '';
          location.full_address = placeDetails.full_address || fullAddress || '';
          location.city = placeDetails.city || cityName || '';
          location.country = placeDetails.country || countryName || '';
          location.address = placeDetails.address || '';
          location.description = locationDescription || '';
          
          // 處理郵遞區號
          if (placeDetails.postal_code) {
            location.postal_code = placeDetails.postal_code;
          }
          
          // 處理可能的模糊地址
          if (isObfuscatedAddress) {
            location.location_type = LocationType.CUSTOM;
          }
        } else {
          // API 調用失敗，使用從 HTML 提取的數據
          location.name = locationName || '';
          location.full_address = fullAddress || '';
          location.city = cityName || '';
          location.country = countryName || '';
          location.address = locationName || '';
          location.description = locationDescription || '';
        }
      } catch (error) {
        // 錯誤處理
        console.error('獲取 Google Places 詳情時出錯:', error);
        
        // 回退到從 HTML 提取的數據
        location.name = locationName || '';
        location.full_address = fullAddress || '';
        location.city = cityName || '';
        location.country = countryName || '';
        location.address = locationName || '';
        location.description = locationDescription || '';
      }
    } else if (fullAddress) {
      // 使用已提取的地理數據
      location.name = locationName || '';
      location.full_address = fullAddress;
      location.city = cityName || '';
      location.country = countryName || '';
      location.place_id = placeId; 
      location.description = locationDescription || '';
      
      // 如果有place_id，設置為Google類型
      location.location_type = placeId ? LocationType.GOOGLE : LocationType.CUSTOM;
    } else if (needsRegistration) {
      // 需要註冊才能查看確切位置的情況 - 優先級降低，只有當其他方法都失敗時才使用
      console.log('偵測到需要註冊才能查看確切位置的活動');
      
      // 獲取位置資訊
      const locationInfo = extractLocationInfo();
      console.log('提取的位置資訊:', locationInfo);
      
      if (locationInfo) {
        // 嘗試提取城市和區域/國家信息
        let firstPart = '';
        let secondPart = '';
        let city = '';
        let matchedPattern = null;
        
        // 嘗試匹配任何位置模式
        for (const pattern of locationPatterns) {
          const match = locationInfo.match(pattern);
          if (match && match.length >= 3) {
            firstPart = match[1];  // 這可能是區域或城市
            secondPart = match[2]; // 這可能是城市或國家
            matchedPattern = pattern.toString();
            
            // 一些啟發式判斷，通常第二部分是城市
            if (matchedPattern.includes('District')) {
              // 如果模式包含District，則第一部分是區域，第二部分是城市
              city = secondPart;
            } else {
              // 否則第一部分可能是城市
              city = firstPart;
            }
            break;
          }
        }
        
        // 組裝位置信息
        if (city) {
          location.name = `[${city}] Please register to see the exact location of this event`;
          location.full_address = '';  // 不再保留模糊地址
          location.city = city;
          // 只有當明確識別出國家時才設置
          if (matchedPattern && matchedPattern.includes('City,')) {
            location.country = secondPart;
          }
        } else {
          // 沒有分解出具體信息，使用名稱
          location.name = 'Please register to see the exact location of this event';
          location.full_address = '';  // 保持為空
        }
        
        location.address = 'Custom Address';
        location.description = 'The exact location is hidden until registration';
        location.location_type = LocationType.CUSTOM;
        
        console.log('已提取需註冊活動的位置資訊:', {
          locationInfo,
          city: location.city,
          full_address: location.full_address
        });
      } else {
        // 找不到任何位置信息
        location.name = 'Please register to see the exact location of this event';
        location.full_address = '';  // 保持為空
        location.address = 'Custom Address';
        location.description = 'The exact location is hidden until registration';
        location.location_type = LocationType.CUSTOM;
      }
    } else {
      // 嘗試從HTML中提取地址信息
      // 尋找可能包含地址的元素
      $('p, div, span, h1, h2, h3, h4, h5, h6').each((i, element) => {
        const text = $(element).text().trim();
        if (text && 
            (text.match(/^\d+\s+[A-Za-z\s]+,\s+[A-Za-z\s]+,\s+[A-Za-z\s]+$/i) || 
             text.match(/^[A-Za-z\s]+,\s+[A-Za-z\s]+,\s+[A-Za-z\s]+$/i) ||
             text.match(/^[A-Za-z\s]+\s+\d+,\s+[A-Za-z\s]+$/i))) {
          
          location.full_address = text;
          location.name = text.split(',')[0].trim();
          
          // 嘗試提取城市和國家
          const addressParts = text.split(',');
          if (addressParts.length >= 2) {
            location.city = addressParts[addressParts.length - 2].trim();
          }
          if (addressParts.length >= 1) {
            location.country = addressParts[addressParts.length - 1].trim();
          }
          
          location.place_id = placeId; // 使用前面提取的place_id
          // 如果有place_id，設置為Google類型
          location.location_type = placeId ? LocationType.GOOGLE : LocationType.CUSTOM;
          
          return false; // 找到後停止循環
        }
      });
    }
  };

  // 执行位置信息处理
  await processLocation();
  
  // 提取類別和標籤
  let category = '';
  const tags: string[] = [];
  
  // 尋找類別和標籤
  $('div, span').each((i, el) => {
    const text = $(el).text().trim();
    
    // 常見的 Luma 標籤類別
    const commonCategories = ['Crypto', 'AI', 'Tech', 'Web3', 'Business', 'Social', 'Arts', 'Music'];
    for (const cat of commonCategories) {
      if (text === cat) {
        if (!category) category = cat;
        if (!tags.includes(cat)) tags.push(cat);
      }
    }
    
    // 尋找標籤（短文本且可能是標籤）
    if (text.length > 0 && text.length < 20 && !text.includes(':') && !text.includes('/')) {
      const possibleTags = ['Blockchain', 'NFT', 'Gaming', 'DeFi', 'DAO', 'Meetup', 'Workshop', 'Conference', 'Networking', 'Ethereum', 'Bitcoin'];
      for (const tag of possibleTags) {
        if (text.includes(tag) && !tags.includes(tag)) {
          tags.push(tag);
        }
      }
    }
  });
  
  // 從標題和描述中提取關鍵詞作為標籤
  const keywordsToCheck = ['Blockchain', 'NFT', 'Gaming', 'DeFi', 'DAO', 'Meetup', 'Workshop', 'Conference', 'Networking', 'Ethereum', 'Bitcoin', 'Web3', 'Crypto'];
  
  for (const keyword of keywordsToCheck) {
    if ((title.includes(keyword) || description.includes(keyword)) && !tags.includes(keyword)) {
      tags.push(keyword);
    }
  }
  
  // 從地點中提取標籤
  if (location.city && !tags.includes(location.city)) {
    tags.push(location.city);
  }
  
  // 如果仍然沒有標籤，從類別中添加
  if (tags.length === 0 && category) {
    tags.push(category);
  }
  
  // 如果仍然沒有任何標籤，嘗試從事件標題中提取
  if (tags.length === 0 && title) {
    const titleWords = title.split(/\s+/);
    for (const word of titleWords) {
      if (word.length > 3 && !tags.includes(word)) {
        tags.push(word);
      }
    }
  }
  
  return {
    eventId: '',
    pageUrl: '',
    title,
    description,
    hostName: '',
    hostUrl: '',
    coverImage,
    startAt,
    endAt,
    timezone,
    location,
    category,
    tags
  };
} 
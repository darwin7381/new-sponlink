import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';
import { getPlaceDetailsFromAPI } from '@/lib/utils/googlePlacesAPI';
import { LocationType } from '@/types/event';
import { 
  createVirtualLocation, 
  createGoogleLocation, 
  createCustomLocation,
  ensureStandardLocationFormat
} from '@/utils/locationUtils';

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
        ...eventData.location,
        name: eventData.location.name || '',
        full_address: eventData.location.full_address || '',
        address: eventData.location.address || eventData.location.full_address || '',
        location_type: eventData.location.location_type || LocationType.CUSTOM
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

    // 使用 ensureStandardLocationFormat 確保返回的地點數據符合標準格式
    const standardizedLocation = ensureStandardLocationFormat({
      id: '',
      name: result.location.name,
      address: result.location.address || result.location.full_address || '',
      full_address: result.location.full_address || result.location.address || '',
      city: result.location.city || '',
      country: result.location.country || '',
      postal_code: result.location.postal_code || '',
      place_id: result.location.place_id,
      location_type: result.location.location_type
    });

    // 轉回 LumaLocationData 類型
    const locationResult: LumaLocationData = {
      name: standardizedLocation.name || '',
      full_address: standardizedLocation.full_address || standardizedLocation.address || '',
      address: standardizedLocation.address || '',
      city: standardizedLocation.city || '',
      country: standardizedLocation.country || '',
      postal_code: standardizedLocation.postal_code || '',
      place_id: standardizedLocation.place_id || '',
      description: result.location.description || '',
      location_type: standardizedLocation.location_type || LocationType.CUSTOM
    };

    return NextResponse.json({
      title: result.title,
      description: result.description,
      coverImage: result.coverImage,
      startAt: result.startAt,
      endAt: result.endAt,
      timezone: result.timezone,
      location: locationResult,
      category: result.category,
      tags: result.tags
    });
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
      // 增強時區匹配，支持 GMT+8 格式和時區縮寫
      const timezoneMatch = text.match(/(UTC|GMT[+-]\d+|[A-Z]{3,4})|([A-Za-z]+\/[A-Za-z_]+)/);
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
      
      // 增強時區提取，支持多種格式
      let extractedTimezone = '';
      const timezoneMatch = htmlContent.match(/"timezone":"([^"]+)"/);
      if (timezoneMatch && timezoneMatch[1]) {
        extractedTimezone = timezoneMatch[1];
      }
      
      // 如果找到的是IANA時區，使用該時區
      if (extractedTimezone && (extractedTimezone.includes('/') || extractedTimezone === 'UTC')) {
        timezone = extractedTimezone;
      } else {
        // 尋找特殊格式的GMT時區，例如GMT+8
        const gmtMatch = htmlContent.match(/GMT[+-]\d+/);
        if (gmtMatch) {
          timezone = gmtMatch[0];
        } else if (extractedTimezone) {
          timezone = extractedTimezone;
        }
      }
      
      // 顯式尋找包含時區的文本，這是Luma常用的時區顯示格式
      const timeWithTimezonePattern = /\d{1,2}:\d{2}\s*(?:AM|PM)?\s*(GMT[+-]\d+|EDT|EST|PDT|PST|CDT|CST|MDT|MST)/i;
      const timeWithTimezoneMatch = htmlContent.match(timeWithTimezonePattern);
      if (timeWithTimezoneMatch && timeWithTimezoneMatch[1]) {
        timezone = timeWithTimezoneMatch[1];
      }

      // 如果頁面包含EDI、PDT等標準縮寫時區
      const tzAbbrevPatterns = /\b(EDT|EST|PDT|PST|CDT|CST|MDT|MST)\b/g;
      const tzAbbrevMatches = [...htmlContent.matchAll(tzAbbrevPatterns)];
      if (tzAbbrevMatches.length > 0) {
        // 使用最後一個找到的縮寫（通常是最相關的）
        timezone = tzAbbrevMatches[tzAbbrevMatches.length - 1][0];
      }
      
      console.log('提取的時區:', timezone);
    }
  }
  
  // 如果仍然找不到日期，使用默認值
  if (!startAt) {
    const now = new Date();
    startAt = now.toISOString();
    now.setHours(now.getHours() + 3);
    endAt = now.toISOString();
  }
  
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
  
  // 嘗試從JSON數據中提取Google Places ID和地理信息
  let placeId = '';
  let fullAddress = '';
  let locationName = '';
  let cityName = '';
  let countryName = '';
  let locationDescription = '';

  // 首先嘗試從geo_address_info中提取完整數據
  const geoAddressInfoMatch = htmlContent.match(/"geo_address_info":\s*(\{[^}]+\})/);
  
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
      console.error('處理geo_address_info時出錯:', e);
    }
  }

  // 檢查是否為線上活動 - 更精確的檢測
  const isOnlineEvent = 
    htmlContent.match(/online\s+event/i) !== null || 
    htmlContent.match(/virtual\s+event/i) !== null || 
    (htmlContent.toLowerCase().includes(' zoom ') && !htmlContent.toLowerCase().includes('zoom is not')) ||
    htmlContent.toLowerCase().includes('webinar');

  // 處理位置數據
  let locationResult: LumaLocationData;

  if (isOnlineEvent) {
    // 虛擬活動: 從 HTML 中提取並創建虛擬地點
    // 尋找可能的會議鏈接
    let virtualLink = '';
    
    // 先嘗試找常見會議平台的鏈接
    const meetingLinkPatterns = [
      /https?:\/\/[^"\s]+zoom\.us\/[^"\s]+/i,
      /https?:\/\/meet\.google\.com\/[^"\s]+/i,
      /https?:\/\/teams\.microsoft\.com\/[^"\s]+/i,
      /https?:\/\/[^"\s]+\.webex\.com\/[^"\s]+/i
    ];
    
    for (const pattern of meetingLinkPatterns) {
      const match = htmlContent.match(pattern);
      if (match && match[0]) {
        virtualLink = match[0];
        break;
      }
    }
    
    // 若沒找到具體鏈接，根據關鍵詞判斷平台
    if (!virtualLink) {
      if (htmlContent.toLowerCase().includes('zoom')) {
        virtualLink = 'Zoom'; // 使用平台名稱，而非鏈接
      } else if (htmlContent.toLowerCase().includes('google meet')) {
        virtualLink = 'Google Meet'; // 使用平台名稱，而非鏈接
      } else if (htmlContent.toLowerCase().includes('microsoft teams')) {
        virtualLink = 'Microsoft Teams'; // 使用平台名稱，而非鏈接
      } else if (htmlContent.toLowerCase().includes('webex')) {
        virtualLink = 'Webex'; // 使用平台名稱，而非鏈接
      } else {
        // 尋找任何可能的域名
        const domainMatch = htmlContent.match(/https?:\/\/([^\/"\s]+)/i);
        if (domainMatch && domainMatch[0] && !domainMatch[0].includes('lu.ma')) {
          virtualLink = domainMatch[0];
        } else {
          virtualLink = 'Virtual'; // 完全沒有任何鏈接時使用 "Virtual"
        }
      }
    }
    
    // 使用統一的邏輯創建虛擬地點
    const virtualLocation = createVirtualLocation(virtualLink);
    
    // 將 Location 類型轉換為 LumaLocationData 類型
    locationResult = {
      name: virtualLocation.name,
      full_address: virtualLocation.full_address || virtualLocation.address || '',
      address: virtualLocation.address || '',
      city: virtualLocation.city || '',
      country: virtualLocation.country || '',
      postal_code: virtualLocation.postal_code || '',
      place_id: virtualLocation.place_id || '',
      description: '', 
      location_type: LocationType.VIRTUAL
    };
    console.log('已創建虛擬活動地點:', locationResult);

  } else if (placeId) {
    // Google Places: 使用 API 獲取詳情
    try {
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';
      const placeDetails = await getPlaceDetailsFromAPI(placeId, apiKey);
      
      if (placeDetails) {
        // 成功獲取 Google 地點詳情
        const googleLocation = createGoogleLocation({
          name: placeDetails.name || locationName || '',
          address: placeDetails.address || '',
          full_address: placeDetails.full_address || fullAddress || '',
          city: placeDetails.city || cityName || '',
          country: placeDetails.country || countryName || '',
          postal_code: placeDetails.postal_code || '',
          latitude: placeDetails.latitude,
          longitude: placeDetails.longitude,
          place_id: placeId
        });
        
        // 轉換為 LumaLocationData 類型
        locationResult = {
          name: googleLocation.name || '',
          full_address: googleLocation.full_address || '',
          address: googleLocation.address || '',
          city: googleLocation.city || '',
          country: googleLocation.country || '',
          postal_code: googleLocation.postal_code || '',
          place_id: googleLocation.place_id || '',
          description: locationDescription || '',
          location_type: LocationType.GOOGLE
        };
      } else {
        // API 失敗，使用提取的數據創建備用地點
        const customLocation = createCustomLocation(
          locationName || fullAddress || '',
          cityName,
          countryName
        );
        
        // 轉換為 LumaLocationData 類型
        locationResult = {
          name: customLocation.name || '',
          full_address: customLocation.full_address || '',
          address: customLocation.address || '',
          city: customLocation.city || '',
          country: customLocation.country || '',
          postal_code: customLocation.postal_code || '',
          place_id: placeId,
          description: locationDescription || '',
          location_type: LocationType.GOOGLE
        };
      }
    } catch (error) {
      console.error('獲取 Google Places 詳情時出錯:', error);
      
      // 創建備用地點
      const customLocation = createCustomLocation(
        locationName || fullAddress || '',
        cityName,
        countryName
      );
      
      // 轉換為 LumaLocationData 類型
      locationResult = {
        name: customLocation.name || '',
        full_address: customLocation.full_address || '',
        address: customLocation.address || '',
        city: customLocation.city || '',
        country: customLocation.country || '',
        postal_code: customLocation.postal_code || '',
        place_id: placeId,
        description: locationDescription || '',
        location_type: LocationType.GOOGLE
      };
    }
    
  } else if (fullAddress) {
    // 使用提取的地理數據創建自定義地點
    const customLocation = createCustomLocation(
      locationName || fullAddress,
      cityName,
      countryName
    );
    
    // 轉換為 LumaLocationData 類型
    locationResult = {
      name: customLocation.name || '',
      full_address: customLocation.full_address || '',
      address: customLocation.address || '',
      city: customLocation.city || '',
      country: customLocation.country || '',
      postal_code: customLocation.postal_code || '',
      place_id: customLocation.place_id || '',
      description: locationDescription || '',
      location_type: LocationType.CUSTOM
    };
    
  } else if (needsRegistration) {
    // 需要註冊才能查看確切位置
    console.log('偵測到需要註冊才能查看確切位置的活動');
    
    // 獲取位置資訊
    const locationInfo = extractLocationInfo();
    console.log('提取的位置資訊:', locationInfo);
    
    if (locationInfo) {
      // 使用提取的位置數據
      const customLocation = createCustomLocation(
        `[${locationInfo}] Please register to see the exact location of this event`,
        locationInfo,
        ''
      );
      
      // 轉換為 LumaLocationData 類型
      locationResult = {
        name: customLocation.name || '',
        full_address: customLocation.full_address || '',
        address: customLocation.address || '',
        city: customLocation.city || '',
        country: customLocation.country || '',
        postal_code: customLocation.postal_code || '',
        place_id: customLocation.place_id || '',
        description: locationDescription || '',
        location_type: LocationType.CUSTOM
      };
    } else {
      // 無法提取位置資訊，使用通用信息
      const customLocation = createCustomLocation(
        'Please register to see the exact location of this event',
        '',
        ''
      );
      
      // 轉換為 LumaLocationData 類型
      locationResult = {
        name: customLocation.name || '',
        full_address: customLocation.full_address || '',
        address: customLocation.address || '',
        city: customLocation.city || '',
        country: customLocation.country || '',
        postal_code: customLocation.postal_code || '',
        place_id: customLocation.place_id || '',
        description: locationDescription || '',
        location_type: LocationType.CUSTOM
      };
    }
    
  } else {
    // 無法取得位置數據的情況
    const customLocation = createCustomLocation('Location not specified', '', '');
    
    // 轉換為 LumaLocationData 類型
    locationResult = {
      name: customLocation.name || '',
      full_address: customLocation.full_address || '',
      address: customLocation.address || '',
      city: customLocation.city || '',
      country: customLocation.country || '',
      postal_code: customLocation.postal_code || '',
      place_id: customLocation.place_id || '',
      description: '',
      location_type: LocationType.CUSTOM
    };
  }

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
  if (locationResult.city && !tags.includes(locationResult.city)) {
    tags.push(locationResult.city);
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
  
  const event = {
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
    location: locationResult,
    category,
    tags
  };
  
  return event;
} 
/**
 * 日期時間和時區處理工具函數
 * 用於處理來自Luma的時間與本地應用時間的轉換
 */

/**
 * 將ISO時間字符串轉換為指定時區的ISO時間字符串
 * @param isoString 原始ISO時間字符串
 * @param timezone 時區標識符，如 'Asia/Taipei', 'Asia/Tokyo', 'America/New_York', 'GMT+8', 'EDT' 等
 * @returns 轉換後的ISO時間字符串，保留原始時間在目標時區的表示
 */
export const convertToTimezone = (isoString: string, timezone: string): string => {
  try {
    if (!isoString) return '';
    
    // 處理特殊格式的時區 (如EDT、EST)，轉換為標準格式
    let standardTimezone = timezone;
    // 創建時區映射表
    const timezoneMap: Record<string, string> = {
      'EDT': 'America/New_York', // 東部夏令時間
      'EST': 'America/New_York', // 東部標準時間
      'PDT': 'America/Los_Angeles', // 太平洋夏令時間
      'PST': 'America/Los_Angeles', // 太平洋標準時間
      'CDT': 'America/Chicago', // 中部夏令時間
      'CST': 'America/Chicago', // 中部標準時間
      'MDT': 'America/Denver', // 山區夏令時間
      'MST': 'America/Denver', // 山區標準時間
    };
    
    // 檢查是否為縮寫時區，並轉換為標準IANA時區
    if (timezone in timezoneMap) {
      standardTimezone = timezoneMap[timezone];
      console.log(`將時區 ${timezone} 轉換為標準時區 ${standardTimezone}`);
    }
    
    // 嘗試將 "GMT+8" 格式轉換為標準IANA時區
    if (timezone.startsWith('GMT')) {
      const offset = timezone.substring(3); // 例如從 "GMT+8" 提取 "+8"
      
      // 嘗試找到匹配的IANA時區
      if (offset === '+8') {
        standardTimezone = 'Asia/Shanghai'; // 或 'Asia/Taipei'
      } else if (offset === '+9') {
        standardTimezone = 'Asia/Tokyo';
      } else if (offset === '-5') {
        standardTimezone = 'America/New_York';
      } else if (offset === '-8') {
        standardTimezone = 'America/Los_Angeles';
      }
      // 可以根據需要添加更多映射
      
      console.log(`將GMT時區 ${timezone} 映射到 ${standardTimezone}`);
    }
    
    // 1. 解析原始ISO時間
    const originalDate = new Date(isoString);
    
    // 2. 使用格式化工具獲取在目標時區的時間各部分
    // 這種方法處理了夏令時間和時區特定規則
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: standardTimezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
      timeZoneName: 'short' // 獲取時區名稱如 "EDT"
    });
    
    // 3. 格式化日期時間
    const parts = formatter.formatToParts(originalDate);
    const dateTimeMap: Record<string, string> = {};
    
    // 將各部分數據放入映射中
    parts.forEach(part => {
      dateTimeMap[part.type] = part.value;
    });
    
    // 4. 構建新的日期時間字符串
    const year = parseInt(dateTimeMap.year);
    const month = parseInt(dateTimeMap.month) - 1; // 月份是0-11
    const day = parseInt(dateTimeMap.day);
    const hour = parseInt(dateTimeMap.hour);
    const minute = parseInt(dateTimeMap.minute);
    const second = parseInt(dateTimeMap.second);
    
    // 5. 創建新的Date對象（在UTC時區）
    const utcDate = new Date(Date.UTC(year, month, day, hour, minute, second));
    
    // 6. 返回ISO格式字符串
    return utcDate.toISOString();
  } catch (error) {
    console.error('時區轉換錯誤:', error, '時區:', timezone);
    return isoString; // 如果出錯，返回原始值
  }
};

/**
 * 檢測用戶當前瀏覽器使用的時區
 * @returns 當前瀏覽器時區
 */
export const getBrowserTimezone = (): string => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch (error) {
    console.error('獲取瀏覽器時區錯誤:', error);
    return 'UTC';
  }
};

/**
 * 格式化日期時間為本地顯示格式
 * @param isoString ISO日期時間字符串
 * @param format 格式類型: 'short', 'medium', 'long', 'full'
 * @param locale 區域設置，預設為 'zh-TW'
 * @returns 格式化後的日期時間字符串
 */
export const formatDateTime = (
  isoString: string, 
  format: 'short' | 'medium' | 'long' | 'full' = 'medium',
  locale: string = 'zh-TW'
): string => {
  try {
    if (!isoString) return '';
    
    const date = new Date(isoString);
    
    const options: Intl.DateTimeFormatOptions = {
      dateStyle: format,
      timeStyle: format
    };
    
    return new Intl.DateTimeFormat(locale, options).format(date);
  } catch (error) {
    console.error('格式化日期時間錯誤:', error);
    return isoString;
  }
};

/**
 * 將Luma的ISO時間轉換為本地表單使用的datetime-local格式
 * @param isoString Luma的ISO時間字符串
 * @param timezone Luma的時區
 * @returns 適合HTML datetime-local輸入的字符串 (YYYY-MM-DDTHH:MM)
 */
export const convertToDatetimeLocalFormat = (
  isoString: string,
  timezone: string
): string => {
  try {
    if (!isoString) return '';
    
    // 1. 先轉換到指定時區
    const convertedIso = convertToTimezone(isoString, timezone);
    
    // 2. 轉換為datetime-local格式 (YYYY-MM-DDTHH:MM)
    return convertedIso.slice(0, 16);
  } catch (error) {
    console.error('轉換為datetime-local格式錯誤:', error);
    
    // 如果出錯，嘗試直接截取
    try {
      return isoString.slice(0, 16);
    } catch {
      return '';
    }
  }
};

/**
 * 將datetime-local格式的時間轉換為ISO格式
 * 同時考慮時區差異調整
 * @param datetimeLocal HTML日期時間值 (YYYY-MM-DDTHH:MM)
 * @param targetTimezone 目標時區
 * @returns 在目標時區的ISO時間字符串
 */
export const convertFromDatetimeLocalToISO = (
  datetimeLocal: string,
  targetTimezone: string
): string => {
  try {
    if (!datetimeLocal) return '';
    
    // 1. 創建新的日期對象
    const date = new Date(datetimeLocal);
    
    // 2. 獲取ISO格式
    const isoString = date.toISOString();
    
    // 3. 轉換到目標時區
    return convertToTimezone(isoString, targetTimezone);
  } catch (error) {
    console.error('datetime-local轉ISO錯誤:', error);
    return new Date(datetimeLocal).toISOString();
  }
}; 
/**
 * 日期時間和時區處理工具函數
 * 用於處理來自Luma的時間與本地應用時間的轉換
 */

/**
 * 將ISO時間字符串轉換為指定時區的ISO時間字符串
 * @param isoString 原始ISO時間字符串
 * @param timezone 時區標識符，如 'Asia/Taipei', 'Asia/Tokyo', 'America/New_York' 等
 * @returns 轉換後的ISO時間字符串
 */
export const convertToTimezone = (isoString: string, timezone: string): string => {
  try {
    if (!isoString) return '';
    
    // 1. 將ISO字符串轉換為Date對象
    const date = new Date(isoString);
    
    // 2. 使用Intl.DateTimeFormat獲取指定時區的日期時間
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
    
    // 3. 格式化日期時間
    const parts = formatter.formatToParts(date);
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
    
    // 5. 創建新的Date對象（在本地時區）
    const localDate = new Date(year, month, day, hour, minute, second);
    
    // 6. 返回ISO格式字符串
    return localDate.toISOString();
  } catch (error) {
    console.error('時區轉換錯誤:', error);
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
# Luma 導入與時區處理方案

## 問題分析

通過檢查代碼和問題描述，我們發現了以下時區相關問題：

1. **時區識別問題**：在從Luma抓取活動時，我們可以獲取到時區信息（例如 'Asia/Singapore'、'Asia/Taipei'），但這些信息在轉換到表單時並未被正確使用

2. **日期顯示問題**：當用戶從Luma導入活動後，表單中顯示的日期時間可能與Luma原始日期時間不一致，這是由於時區差異造成的

3. **數據保存問題**：即使正確顯示了日期，我們也需要確保將原始時區信息保存下來，以便在後續顯示時能夠正確轉換

4. **時區顯示不統一**：系統中時區顯示格式不一致，有時顯示為 GMT+8 格式，有時顯示為 PDT、EDT 等縮寫格式，導致用戶體驗不一致

5. **本地時間轉換錯誤**：在事件詳情頁中，當用戶瀏覽器時區與活動時區不同時，顯示的本地時間轉換會出錯

## 解決方案

我們實現了以下解決方案：

### 1. 統一時區處理工具函數

在 `src/utils/dateUtils.ts` 中添加並優化了專門處理時區的工具函數：

- `convertToTimezone`: 將ISO時間字符串轉換為指定時區的ISO時間字符串
- `getBrowserTimezone`: 獲取用戶瀏覽器的時區
- `formatDateTime`: 格式化日期時間為本地顯示格式
- `convertToDatetimeLocalFormat`: 將Luma的ISO時間轉換為HTML表單使用的datetime-local格式
- `convertFromDatetimeLocalToISO`: 將表單的datetime-local格式轉換回ISO格式
- `getTimezoneDisplay`: 統一的時區顯示邏輯，優先顯示時區縮寫（如PDT、EDT），如果沒有則顯示GMT格式（如GMT+8）

### 2. 優化時區識別系統

- 增強時區縮寫（如 PDT、EDT）和 GMT 格式（如 GMT+8）的識別能力
- 為常見時區建立映射表，提高時區識別的準確性
- 在抓取 Luma 活動時，更精確地提取原始時區信息

### 3. 統一時區顯示風格

- 更新 `EventCard` 組件，使用統一的時區顯示邏輯
- 更新事件詳情頁，確保時區顯示與 EventCard 保持一致
- 從 `dateUtils.ts` 導入共享的 `getTimezoneDisplay` 函數，確保所有組件使用相同的時區顯示邏輯

### 4. 修復本地時間轉換問題

- 實現更精確的時間轉換邏輯，使用 `formatToLocalTime` 函數正確轉換活動時間到用戶本地時區
- 使用瀏覽器原生的 `toLocaleTimeString` 進行時間格式化，提高準確性
- 增強錯誤處理，確保即使轉換出錯也能提供良好的用戶體驗

## 時區處理流程

整體處理流程如下：

1. **導入時區**: 從 Luma 導入活動時，保留原始時區格式（如 EDT、GMT+8 等）
2. **時間格式化**: 格式化顯示時間時，使用統一的 `getTimezoneDisplay` 函數獲取時區顯示格式
3. **本地時間轉換**: 當用戶瀏覽器時區與活動時區不同時，使用 `formatToLocalTime` 正確轉換時間
4. **時區轉換**: 在需要轉換時區時，使用 `convertToTimezone` 函數處理不同時區間的時間轉換

## 核心實現代碼

### 統一的時區顯示邏輯

```typescript
/**
 * 獲取時區的顯示名稱（優先使用縮寫如PDT、EDT，然後是GMT格式）
 * @param timezone 時區標識符，如 'Asia/Taipei', 'America/New_York' 等
 * @returns 時區縮寫或GMT格式
 */
export const getTimezoneDisplay = (timezone: string | undefined): string => {
  if (!timezone) return '';
  
  // 如果已經是GMT格式，直接返回
  if (timezone.startsWith('GMT')) {
    return timezone;
  }
  
  // 如果已經是縮寫格式，直接返回
  if (/^[A-Z]{3,4}$/.test(timezone)) {
    return timezone;
  }
  
  try {
    // 獲取時區縮寫（如 PDT, EDT 等）
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = {
      timeZone: timezone,
      timeZoneName: 'short' // 'short' 會給出 PDT, EDT 等縮寫
    };
    
    const formatter = new Intl.DateTimeFormat('en-US', options);
    const formattedDate = formatter.format(now);
    
    // 提取時區縮寫，例如從 "5/24/2023, 8:00 AM EDT" 提取 "EDT"
    const tzMatch = formattedDate.match(/[A-Z]{3,4}$/);
    if (tzMatch) {
      return tzMatch[0]; // 返回時區縮寫，如 "EDT"
    }
    
    // 如果沒有找到縮寫，嘗試獲取GMT偏移
    const options2: Intl.DateTimeFormatOptions = {
      timeZone: timezone,
      timeZoneName: 'longOffset' // 'longOffset' 會給出 GMT+8 等格式
    };
    
    const formatter2 = new Intl.DateTimeFormat('en-GB', options2);
    const formattedDate2 = formatter2.format(now);
    
    const gmtMatch = formattedDate2.match(/GMT[+-]\d+(?::\d+)?/);
    return gmtMatch ? gmtMatch[0] : '';
  } catch (error) {
    console.error('獲取時區顯示錯誤:', error);
    return '';
  }
};
```

### EventCard 中的時間格式化

```typescript
// 使用更靠近原生的方法格式化時間
const formatTimeWithTimezone = (): string => {
  if (!event.start_time) return '';
  
  try {
    const startDate = new Date(event.start_time);
    const endDate = event.end_time ? new Date(event.end_time) : null;
    
    // 使用瀏覽器的 toLocaleTimeString 而不是自己計算，以獲得更準確的時間格式化
    const options: Intl.DateTimeFormatOptions = {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: event.timezone || undefined
    };
    
    // 格式化開始時間
    let result = startDate.toLocaleTimeString('en-US', options);
    
    // 添加結束時間（如果有）
    if (endDate) {
      result += ` - ${endDate.toLocaleTimeString('en-US', options)}`;
    }
    
    // 添加時區，使用共享的時區顯示邏輯
    const timezoneDisplay = getTimezoneDisplay(event.timezone);
    if (timezoneDisplay) {
      result += ` ${timezoneDisplay}`;
    }
    
    return result;
  } catch (error) {
    console.error('格式化時間錯誤:', error);
    return '';
  }
};
```

### 本地時間轉換的實現

```typescript
// 事件詳情頁中的本地時間轉換
(() => {
  try {
    // 使用相同的時區轉換邏輯
    if (!startDate) return "時間未指定";
    
    // 獲取瀏覽器時區
    const browserTimezone = getBrowserTimezone();
    
    // 格式化開始時間到用戶當地時區
    const localStartTime = formatToLocalTime(event.start_time, event.timezone, browserTimezone);
    
    // 格式化結束時間到用戶當地時區
    const localEndTime = event.end_time 
      ? formatToLocalTime(event.end_time, event.timezone, browserTimezone)
      : null;
    
    // 獲取時區顯示
    const localTimezoneDisplay = getTimezoneDisplay(browserTimezone);
    
    // 組合顯示格式
    if (localEndTime) {
      const localStartDate = new Date(localStartTime);
      const localEndDate = new Date(localEndTime);
      
      if (localStartDate.toDateString() === localEndDate.toDateString()) {
        // 同一天的情況
        return `${format(localStartDate, "MMM d")} • ${format(localStartDate, "h:mm a")} - ${format(localEndDate, "h:mm a")} ${localTimezoneDisplay}`;
      } else {
        // 跨天的情況
        return `${format(localStartDate, "MMM d")} - ${format(localEndDate, "MMM d")} ${localTimezoneDisplay}`;
      }
    } else {
      // 只有開始時間
      return `${format(new Date(localStartTime), "MMM d, h:mm a")} ${localTimezoneDisplay}`;
    }
  } catch (error) {
    console.error("轉換當地時間錯誤:", error);
    return "轉換時間出錯";
  }
})()
```

## 注意事項

1. **時區差異**: 不同瀏覽器可能有不同的時區設置，我們使用 `Intl.DateTimeFormat().resolvedOptions().timeZone` 獲取瀏覽器時區
2. **夏令時間**: 某些時區會有夏令時間轉換，如美國的 EDT（夏令時）和 EST（標準時間），我們的時區轉換代碼需要處理這種情況
3. **時區縮寫優先**: 在顯示時區時，我們優先使用縮寫（如 PDT、EDT）而不是 GMT 格式，以符合用戶習慣
4. **錯誤處理**: 時區轉換容易出錯，我們添加了完善的錯誤處理，在出錯時提供良好的用戶體驗
5. **統一顯示邏輯**: 使用共享的 `getTimezoneDisplay` 函數確保全系統時區顯示的一致性 
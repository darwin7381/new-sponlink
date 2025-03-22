# 地點系統功能更新文檔

## 概述

本文檔記錄了對 Sponlink 平台地點選擇和顯示系統的更新，包括對數據結構的增強和用戶界面的改進。

## 數據結構更新

### 位置類型枚舉 (LocationType)

在 `src/types/event.ts` 中添加了 `LocationType` 枚舉，用於清晰區分不同類型的地點：

```typescript
export enum LocationType {
  GOOGLE = 'GOOGLE',  // Google 地圖 API 返回的地點
  VIRTUAL = 'VIRTUAL', // 虛擬會議鏈接
  CUSTOM = 'CUSTOM'   // 用戶手動輸入的自定義地點
}
```

### 位置接口 (Location)

在 `Location` 接口中添加了新的屬性：

```typescript
export interface Location {
  id: string;
  name: string;
  address: string;
  city: string;
  country: string;
  postal_code: string;
  latitude?: number;
  longitude?: number;
  isVirtual?: boolean;    // 標記是否為虛擬地點
  platformName?: string;  // 虛擬平台名稱 (如 Zoom, Google Meet 等)
  place_id?: string;      // Google Places API 的唯一標識符
  location_type?: LocationType; // 地點類型枚舉
}
```

## 組件更新

### LocationSelector 組件

在 `src/components/maps/LocationSelector.tsx` 中進行了以下更新：

1. 引入 `LocationType` 枚舉
2. 在選擇不同類型地點時設置相應的 `location_type` 值：
   - Google 地圖選擇：`LocationType.GOOGLE`
   - 虛擬會議鏈接：`LocationType.VIRTUAL`
   - 自定義地址：`LocationType.CUSTOM`

```typescript
// 處理 Google Places 返回的位置
const handlePlaceSelect = (placeDetails: {/*...*/}) => {
  onChange({
    // ...其他屬性
    place_id: placeDetails.place_id,
    location_type: LocationType.GOOGLE
  });
};

// 處理自定義地址或虛擬連結
const handleUseCustomAddress = () => {
  const { isVirtual, platformName } = detectVirtualPlatform(inputValue);
  
  onChange({
    // ...其他屬性
    place_id: undefined,
    location_type: isVirtual ? LocationType.VIRTUAL : LocationType.CUSTOM
  });
};

// 處理清除位置
const handleClearLocation = (e: React.MouseEvent) => {
  onChange({
    // ...重置其他屬性
    place_id: undefined,
    location_type: undefined
  });
};
```

3. 更新地址顯示邏輯，為自定義地址添加標示：

```tsx
{location.location_type === LocationType.CUSTOM ? (
  <div>
    <div className="text-white font-normal">{getDisplayAddress()}</div>
    <div className="text-sm text-gray-400 truncate">Custom Address</div>
  </div>
) : (
  <span>{getDisplayAddress()}</span>
)}
```

## 問題修復

### 自定義地址標示缺失問題

在 `/organizer/events/create` 頁面中，發現自定義地址被選中後，缺少 "Custom Address" 的標示顯示。問題表現為:

1. 用戶輸入自定義地址後，地址值正確顯示
2. 但下方缺少 "Custom Address" 的標示文字

通過修改 `LocationSelector.tsx` 中的顯示邏輯解決此問題:

```tsx
// 修改前
{getDisplayAddress() ? (
  // 原有代碼
) : (
  // 原有代碼
)}

// 修改後 - 添加對 LocationType.CUSTOM 的條件判斷
{getDisplayAddress() ? (
  <div className="flex items-center justify-between w-full">
    <div className="text-white">
      {isVirtual && platformName ? (
        // 虛擬地址顯示邏輯
      ) : (
        location.name && location.address && location.name !== location.address ? (
          // Google 地址顯示邏輯
        ) : (
          location.location_type === LocationType.CUSTOM ? (
            <div>
              <div className="text-white font-normal">{getDisplayAddress()}</div>
              <div className="text-sm text-gray-400 truncate">Custom Address</div>
            </div>
          ) : (
            <span>{getDisplayAddress()}</span>
          )
        )
      )}
    </div>
    // 原有的清除按鈕代碼
  </div>
) : (
  // 原有代碼
)}
```

這一修改確保了當地址類型被識別為自定義地址時，會顯示正確的標示，保持了所有地址類型的一致顯示風格。

### 模擬數據更新

在 `src/mocks/eventData.ts` 中更新了模擬數據，為所有活動地點添加了 `place_id` 和 `location_type` 屬性，並提供了三種不同類型的地點示例：

1. **Google 地址**：
```json
{
  "id": "loc1",
  "name": "台北南港展覽館",
  "address": "台北市南港區經貿二路1號",
  "city": "台北",
  "country": "台灣",
  "postal_code": "115",
  "latitude": 25.0554,
  "longitude": 121.6074,
  "place_id": "ChIJRRRLT1KrQjQRczNL5s16vzU",
  "location_type": "GOOGLE"
}
```

2. **虛擬地址**：
```json
{
  "id": "loc9",
  "name": "Zoom",
  "address": "https://zoom.us/j/123456789",
  "city": "",
  "country": "",
  "postal_code": "",
  "isVirtual": true,
  "platformName": "Zoom",
  "location_type": "VIRTUAL"
}
```

3. **自定義地址**：
```json
{
  "id": "loc10",
  "name": "Crypto Art Café",
  "address": "區塊大廈3樓藝術空間",
  "isVirtual": false,
  "location_type": "CUSTOM"
}
```

## 顯示邏輯優化

在地點顯示時，根據 `location_type` 實現了差異化的展示：

1. **Google 地址**：顯示地點名稱和完整地址
2. **虛擬地址**：顯示平台名稱（如 Zoom）和會議鏈接
3. **自定義地址**：顯示用戶輸入的地址，並在下方標示 "Custom Address"

## 實施成效與測試結果

### 修復效果

修復後，自定義地址在 `/organizer/events/create` 頁面的顯示效果如下：

1. **修復前**：
   - 僅顯示用戶輸入的地址文本（例如 "123"）
   - 缺少 "Custom Address" 的標示

2. **修復後**：
   - 用戶輸入的地址文本以較大字體顯示
   - 下方以灰色文本顯示 "Custom Address" 的標示
   - 與虛擬地址和 Google 地址的顯示風格保持一致

### 測試結果

在測試環境中對修復進行了驗證：

1. **Google 地址測試**：
   - 輸入並選擇 Google 地址後，地址正確顯示
   - 地址類型正確設置為 `LocationType.GOOGLE`
   - 地址名稱和完整地址分兩行顯示

2. **虛擬地址測試**：
   - 輸入虛擬會議鏈接後，平台名稱和鏈接正確顯示
   - 地址類型正確設置為 `LocationType.VIRTUAL`
   - 虛擬平台名稱和鏈接分兩行顯示

3. **自定義地址測試**：
   - 輸入自定義地址文本後，地址和標示正確顯示
   - 地址類型正確設置為 `LocationType.CUSTOM`
   - 地址和 "Custom Address" 標示分兩行顯示

所有地址類型的顯示形式現在保持一致，提升了用戶體驗的一致性。

## 多語言支持考慮

本次更新考慮了多語言支持的需求：

1. 使用 `place_id` 作為 Google 地址的唯一標識符，可在不同語言環境下通過 Places API 獲取對應語言的地址格式
2. 保留經緯度信息，確保地圖功能在不同語言環境下正常工作
3. 自定義地址保持用戶輸入的原始格式，不進行語言轉換

## 未來擴展計劃

1. 在用戶配置文件中添加語言偏好設置
2. 根據用戶語言偏好，在顯示 Google 地址時動態獲取對應語言的地址格式
3. 擴展虛擬平台支持，添加更多常用虛擬會議平台的識別和顯示

## 技術債務

1. 需要優化地址搜索性能，考慮添加地址緩存機制
2. 為自定義地址添加更多元數據支持，如標籤和自定義圖標 
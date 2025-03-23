# 地點顯示格式文檔

本文檔記錄了系統中使用的五種標準地點顯示格式以及相關代碼結構，確保在手動輸入和自動導入（如 Luma）時保持一致的顯示效果。

## 五種標準地點顯示格式

### a. 初始形式/內容為空
- **顯示文本**：「Add Event Location」和「Offline location or virtual link」
- **圖標**：地標圖標（地圖定位針）
- **格式**：標題+說明文本
- **LocationType**：`undefined`
- **特點**：未設置任何地點信息
- **觸發條件**：當地點對象未初始化或所有字段為空時

![初始形式](../assets/location-empty.png)

### b. Google 地點選項
- **顯示文本**：「Taipei City」和「Taipei City, Taiwan」
- **圖標**：地標圖標（地圖定位針）
- **格式**：上方顯示地點名稱，下方顯示完整地址
- **LocationType**：`LocationType.GOOGLE`
- **特點**：具有 `place_id`，通常包含經緯度等詳細信息
- **觸發條件**：從 Google 地點搜索中選擇地點，或導入含 `place_id` 的地點

![Google 地點](../assets/location-google.png)

### c. 自訂地址
- **顯示文本**：「taipei 101」和「Custom Address」
- **圖標**：地標圖標（地圖定位針）
- **格式**：上方顯示自定義文本，下方顯示「Custom Address」標籤
- **LocationType**：`LocationType.CUSTOM`
- **特點**：手動輸入的非虛擬地址
- **觸發條件**：手動輸入非網址格式的地址，或導入無 `place_id` 的實體地址

![自訂地址](../assets/location-custom.png)

### d. 已知虛擬會議平台
- **顯示文本**：「Google Meet」和「meet.google.com/syh-ruzc-mbz」
- **圖標**：視頻會議圖標（攝像機/顯示器）
- **格式**：上方顯示平台名稱，下方顯示完整會議鏈接
- **LocationType**：`LocationType.VIRTUAL`
- **特點**：已識別的特定會議平台
- **觸發條件**：輸入或導入已知平台（如 Zoom、Google Meet 等）的會議鏈接

![已知虛擬平台](../assets/location-virtual-known.png)

### e. 未知虛擬平台
- **顯示文本**：「Virtual」和「blocktempo.com」
- **圖標**：視頻會議圖標（攝像機/顯示器）
- **格式**：上方顯示「Virtual」，下方顯示網域名稱
- **LocationType**：`LocationType.VIRTUAL`
- **特點**：未識別的網址格式
- **觸發條件**：輸入或導入非知名會議平台的網址

![未知虛擬平台](../assets/location-virtual-unknown.png)

## 相關代碼結構

### 主要文件
1. **`src/utils/locationUtils.ts`** - 包含所有地點處理的核心函數
2. **`src/components/maps/LocationSelector.tsx`** - 負責手動選擇地點的 UI 組件
3. **`src/app/api/scrape-luma/route.ts`** - 處理從 Luma 導入地點的邏輯

### 類型定義
```typescript
// src/types/event.ts
export enum LocationType {
  GOOGLE = 'google',  // Google 地點（有 place_id）
  VIRTUAL = 'virtual', // 虛擬會議連結
  CUSTOM = 'custom'   // 自定義地址
}

export interface Location {
  id: string;
  name: string;
  address: string;
  city: string;
  country: string;
  postal_code: string;
  latitude?: number;
  longitude?: number;
  isVirtual?: boolean;
  platformName?: string;
  place_id?: string;
  location_type?: LocationType;
  full_address?: string;
}
```

### 核心函數說明

#### 1. 地點創建函數
- **`createVirtualLocation`** - 創建虛擬會議地點（格式 d 和 e）
- **`createGoogleLocation`** - 創建 Google 地點（格式 b）
- **`createCustomLocation`** - 創建自定義地點（格式 c）

#### 2. 輔助函數
- **`detectVirtualPlatform`** - 檢測輸入是否為虛擬會議鏈接
- **`extractDomainFromUrl`** - 提取網址的域名部分
- **`ensureStandardLocationFormat`** - 確保任何地點對象都符合標準格式

### 使用示例

#### 創建虛擬地點
```typescript
// 已知平台（格式 d）
const zoomLocation = createVirtualLocation('https://zoom.us/j/123456789');
// 結果: name="Zoom", address="https://zoom.us/j/123456789", location_type=VIRTUAL

// 未知平台（格式 e）
const customVirtual = createVirtualLocation('https://example.com/meeting');
// 結果: name="Virtual", address="example.com", location_type=VIRTUAL
```

#### 創建 Google 地點
```typescript
const googleLocation = createGoogleLocation({
  name: 'Taipei 101',
  address: 'No. 7, Section 5, Xinyi Road, Xinyi District, Taipei City, Taiwan 110',
  city: 'Taipei',
  country: 'Taiwan',
  place_id: 'ChIJG7nnQsTrQjQROvbB-Ofr8-E'
});
// 結果: 格式 b - 上方顯示 "Taipei 101"，下方顯示完整地址
```

#### 創建自定義地點
```typescript
const customLocation = createCustomLocation('Taipei Main Station', 'Taipei', 'Taiwan');
// 結果: 格式 c - 上方顯示 "Taipei Main Station"，下方顯示 "Custom Address"
```

#### 從 Luma 導入時確保格式一致
```typescript
// 在 route.ts 中，返回前使用 ensureStandardLocationFormat 確保格式符合標準
const standardizedLocation = ensureStandardLocationFormat({
  id: '',
  name: result.location.name,
  address: result.location.address || result.location.full_address || '',
  // ... 其他屬性
  location_type: result.location.location_type
});
```

## 格式轉換邏輯

### 處理虛擬地點時的邏輯流程
1. 使用 `detectVirtualPlatform` 檢測是否為已知虛擬平台
2. 若是已知平台：設置 `name` 為平台名稱，`address` 為完整鏈接（格式 d）
3. 若非已知平台但是有效網址：設置 `name` 為 "Virtual"，`address` 為網域名稱（格式 e）

### 處理 Google 地點時的邏輯流程
1. 優先使用 Google Places API 獲取詳細信息
2. 設置 `name` 為地點名稱，`address` 為完整地址（格式 b）
3. 保留 `place_id` 用於後續操作

### 處理自定義地點時的邏輯流程
1. 設置 `name` 為用戶輸入的文本
2. 設置 `location_type` 為 `CUSTOM`（格式 c）

## 注意事項
1. 確保從外部來源（如 Luma）導入的地點也遵循這五種標準格式
2. 使用 `ensureStandardLocationFormat` 函數進行最後的保障檢查
3. 圖標顯示基於 `location_type` 和 `isVirtual` 屬性
4. 虛擬地點和實體地點的顯示邏輯完全不同，注意區分 
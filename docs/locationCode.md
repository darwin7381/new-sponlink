# 地點處理代碼結構說明

這份文檔詳細記錄了系統中處理地點信息的相關代碼結構、關鍵函數和實現邏輯，以方便開發者理解和維護。

## 整體架構

系統的地點處理邏輯主要分為三個部分：

1. **核心工具函數**：`src/utils/locationUtils.ts` - 封裝了地點處理的所有基礎函數
2. **UI 交互層**：`src/components/maps/LocationSelector.tsx` - 用於用戶手動輸入和選擇地點
3. **外部導入層**：`src/app/api/scrape-luma/route.ts` - 處理從外部源（如 Luma）導入地點數據

## 1. 核心工具函數 (locationUtils.ts)

### 1.1 主要函數

```typescript
// 檢測輸入是否為虛擬會議連結
detectVirtualPlatform(url: string): { isVirtual: boolean, platformName: string }

// 提取網域名稱
extractDomainFromUrl(url: string): string

// 創建虛擬會議地點
createVirtualLocation(input: string): Location

// 創建 Google 地點
createGoogleLocation(placeDetails: {...}): Location

// 創建自定義地點
createCustomLocation(address: string, cityName?: string, countryName?: string): Location

// 創建需要註冊查看的位置
createRegistrationRequiredLocation(city: string): Location

// 確保地點對象符合標準格式
ensureStandardLocationFormat(location: Location): Location
```

### 1.2 輔助常量與函數

```typescript
// 虛擬會議平台匹配規則
VIRTUAL_PLATFORMS = [
  { name: 'Zoom', regex: /zoom\.us|zoomus\.cn/i },
  { name: 'Google Meet', regex: /meet\.google\.com/i },
  // ... 其他平台
]

// 格式化位置顯示文本
formatLocationDisplay(location: Location): string

// 判斷是否為需要註冊的地點文本
isRegistrationRequired(text: string): boolean

// 從註冊必要文本中提取城市
extractCityFromRegistrationText(text: string): string
```

### 1.3 關鍵實現細節

#### 虛擬地點檢測

```typescript
// detectVirtualPlatform 函數的核心邏輯
try {
  const urlObj = new URL(normalizedUrl);
  const hostname = urlObj.hostname;
  
  // 檢查是否匹配已知的虛擬平台
  for (const platform of VIRTUAL_PLATFORMS) {
    if (platform.regex.test(hostname)) {
      return { isVirtual: true, platformName: platform.name };
    }
  }
  
  // 檢查是否為有效URL但非已知會議平台
  return { isVirtual: true, platformName: 'Virtual' };
} catch {
  // 解析URL失敗，可能不是有效的URL
  return { isVirtual: false, platformName: '' };
}
```

#### 標準格式保障

```typescript
// ensureStandardLocationFormat 函數的核心邏輯
// 檢查地點類型
if (location.location_type === LocationType.VIRTUAL || location.isVirtual) {
  // 確保虛擬地點格式正確 - 格式 d 和 e
  return {
    ...location,
    name: location.platformName || 'Virtual',
    address: location.platformName === 'Virtual' ? extractDomainFromUrl(...) : ...,
    location_type: LocationType.VIRTUAL
  };
} else if (location.location_type === LocationType.GOOGLE && location.place_id) {
  // 格式 b: Google 地點
  return { ... };
} else {
  // 格式 c: 自定義地址
  return { ... };
}
```

## 2. UI 交互層 (LocationSelector.tsx)

### 2.1 主要組件結構

```typescript
const LocationSelector: React.FC<LocationSelectorProps> = ({
  location,
  onChange
}) => {
  // 狀態管理
  const [isExpanded, setIsExpanded] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [isVirtual, setIsVirtual] = useState(false);
  const [platformName, setPlatformName] = useState('');
  
  // 處理邏輯
  const handlePlaceSelect = (placeDetails: {...}) => { ... }
  const handleUseCustomAddress = () => { ... }
  const fetchPredictions = async (input: string) => { ... }
  const handlePredictionSelect = async (prediction: Prediction) => { ... }
  
  // 渲染部分
  return (
    <div className="relative w-full">
      {/* 主按鈕 */}
      <button>...</button>
      
      {/* 展開面板 */}
      {isExpanded && (
        <div>
          {/* 搜索輸入框 */}
          <input ... />
          
          {/* 預測結果 */}
          {predictions.map(...)}
          
          {/* 虛擬會議選項 */}
          {detectVirtualPlatform(inputValue).isVirtual && ...}
          
          {/* 使用自定義文字選項 */}
          <div onClick={handleUseCustomAddress}>...</div>
        </div>
      )}
    </div>
  );
};
```

### 2.2 關鍵實現細節

#### 地點類型處理

```typescript
// 處理當Google Places返回位置詳情
const handlePlaceSelect = (placeDetails: {...}) => {
  // 使用 createGoogleLocation 函數從 locationUtils.ts
  const googleLocation = createGoogleLocation({
    name: placeDetails.name,
    // ... 其他屬性
  });
  
  // 更新位置
  onChange(googleLocation);
};

// 處理使用自定義地址或虛擬連結
const handleUseCustomAddress = () => {
  if (inputValue.trim()) {
    // 檢測是否為虛擬會議連結
    const { isVirtual, platformName } = detectVirtualPlatform(inputValue);
    
    if (isVirtual) {
      // 使用 createVirtualLocation 函數
      const virtualLocation = createVirtualLocation(inputValue);
      onChange(virtualLocation);
    } else {
      // 使用 createCustomLocation 函數
      const customLocation = createCustomLocation(inputValue);
      onChange(customLocation);
    }
  }
};
```

#### 顯示邏輯

```typescript
// 不同類型地點的顯示邏輯
{isVirtual && platformName ? (
  <div>
    <div className="text-white font-normal">{platformName}</div>
    <div className="text-sm text-gray-400 truncate">{getDisplayAddress()}</div>
  </div>
) : (
  location.name && location.address && location.name !== location.address ? (
    <div>
      <div className="text-white font-normal">{location.name}</div>
      <div className="text-sm text-gray-400 truncate">{location.address}</div>
    </div>
  ) : (
    location.location_type === LocationType.GOOGLE ? (
      <div>
        <div className="text-white font-normal">{location.name || getDisplayAddress()}</div>
        <div className="text-sm text-gray-400 truncate">{location.address || location.full_address}</div>
      </div>
    ) : location.location_type === LocationType.CUSTOM ? (
      <div>
        <div className="text-white font-normal">{getDisplayAddress()}</div>
        <div className="text-sm text-gray-400 truncate">Custom Address</div>
      </div>
    ) : (
      <span>{getDisplayAddress()}</span>
    )
  )
)}
```

## 3. 外部導入層 (route.ts)

### 3.1 主要函數結構

```typescript
// 處理抓取 Luma 頁面的 API 路由
export async function GET(request: Request) {
  // ... 參數處理和前置檢查
  const eventData = await scrapeLumaEventFromHTML(html);
  // ... 標籤處理和後續邏輯
  
  // 確保地點數據符合標準格式
  const standardizedLocation = ensureStandardLocationFormat({
    id: '',
    name: result.location.name,
    // ... 其他屬性
  });
  
  // 返回結果
  return NextResponse.json({ ... });
}

// 從 HTML 結構直接提取 Luma 事件數據
async function scrapeLumaEventFromHTML(htmlContent: string): Promise<LumaEvent> {
  // ... 提取標題、描述、時間等信息
  
  // 處理位置數據
  let locationResult: LumaLocationData;
  
  if (isOnlineEvent) {
    // 處理虛擬地點
    const virtualLocation = createVirtualLocation(virtualLink);
    // ... 處理並返回
  } else if (placeId) {
    // 處理 Google 地點
    const googleLocation = createGoogleLocation({...});
    // ... 處理並返回
  } else if (fullAddress) {
    // 處理自定義地點
    const customLocation = createCustomLocation(...);
    // ... 處理並返回
  }
  
  // ... 返回完整事件數據
}
```

### 3.2 關鍵實現細節

#### 虛擬地點提取

```typescript
// 虛擬活動: 從 HTML 中提取並創建虛擬地點
let virtualLink = '';

// 先嘗試找常見會議平台的鏈接
const meetingLinkPatterns = [
  /https?:\/\/[^"\s]+zoom\.us\/[^"\s]+/i,
  /https?:\/\/meet\.google\.com\/[^"\s]+/i,
  // ... 其他平台
];

// ... 尋找鏈接或平台名稱的邏輯

// 使用統一的邏輯創建虛擬地點
const virtualLocation = createVirtualLocation(virtualLink);

// 將 Location 類型轉換為 LumaLocationData 類型
locationResult = {
  name: virtualLocation.name,
  // ... 其他屬性轉換
  location_type: LocationType.VIRTUAL
};
```

#### 最終格式保障

```typescript
// 在 GET 路由中，確保返回的數據符合標準格式
const standardizedLocation = ensureStandardLocationFormat({
  id: '',
  name: result.location.name,
  address: result.location.address || result.location.full_address || '',
  // ... 其他屬性
  location_type: result.location.location_type
});

// 轉回 LumaLocationData 類型
const locationResult: LumaLocationData = {
  name: standardizedLocation.name || '',
  // ... 其他屬性
  location_type: standardizedLocation.location_type || LocationType.CUSTOM
};

// 返回最終結果
return NextResponse.json({
  // ... 其他屬性
  location: locationResult,
  // ... 其他屬性
});
```

## 處理流程總結

1. **手動輸入流程**：
   - 用戶輸入地點信息 → `LocationSelector` 檢測類型 → 調用相應創建函數 → 返回標準格式地點對象

2. **外部導入流程**：
   - 解析外部 HTML → 提取地點信息 → 檢測地點類型 → 調用相應創建函數 → 通過 `ensureStandardLocationFormat` 確保格式一致 → 返回標準化地點對象

3. **格式保障流程**：
   - 任何來源的地點對象 → `ensureStandardLocationFormat` → 符合五種標準格式之一的地點對象 
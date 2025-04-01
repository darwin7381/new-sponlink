# 組件重構最佳實踐：事件系列頁面案例分析

## 背景

本文檔基於對 `/event-series/[id]/page.tsx` 頁面的重構經驗，該頁面原始代碼超過 1000 行，導致維護困難，代碼可讀性差。通過拆分為多個功能性組件，顯著提高了代碼的可維護性、可讀性和可重用性。

## 問題分析

### 原始頁面存在的問題

1. **代碼過長**：單一文件超過 1000 行代碼
2. **職責不明確**：一個文件承擔多種功能
3. **難以維護**：修改某一部分功能時需要在大量代碼中定位
4. **團隊協作困難**：多人同時修改同一個文件容易造成衝突
5. **複用性差**：緊耦合的代碼難以在其他頁面復用

### 功能區分

分析原始頁面後，識別出以下主要功能區塊：

1. 頁面頂部橫幅
2. 事件系列信息卡
3. 事件列表（包含時間線視圖和列表視圖）
4. 日曆面板
5. 地圖組件
6. 頁面加載狀態
7. 404 錯誤頁面

## 重構方案

### 組件結構設計

採用了以下組件結構：

```
src/
  components/
    event-series/
      SeriesBanner.tsx        // 頂部橫幅
      SeriesInfo.tsx          // 事件系列信息卡
      EventCalendarPanel.tsx  // 日曆和地圖組件容器
      LoadingState.tsx        // 加載狀態
      NotFoundState.tsx       // 未找到頁面
      SeriesEventsList/       // 事件列表相關組件
        index.tsx             // 列表容器和控制
        TimelineView.tsx      // 時間線視圖
        ListView.tsx          // 列表視圖
    maps/
      MapboxEventMap.tsx      // 地圖組件（已存在）
```

組件的層次結構和數據流可以參考 [組件結構圖文檔](../images/component-structure.md)。

### 組件拆分策略

1. **按功能拆分**：每個組件負責單一功能，符合單一職責原則
2. **數據流設計**：父組件管理狀態，通過 props 傳遞給子組件
3. **合理分組**：相關功能組件放在同一目錄下，便於管理
4. **保持一致性**：所有組件使用相同的代碼風格和命名規範

## 實現詳情

### 1. 核心頁面組件 (page.tsx)

核心頁面只保留：
- 狀態管理
- 數據獲取
- 組件組合

```tsx
// src/app/event-series/[id]/page.tsx
export default function EventSeriesPage({ params }: EventSeriesPageProps) {
  // 狀態定義和數據獲取
  // ...

  return (
    <div className="bg-background min-h-screen">
      <SeriesBanner series={series} />
      <div className="max-w-6xl mx-auto px-4 -mt-20 relative z-10 pb-24">
        <SeriesInfo series={series} />
        <div className="flex flex-col md:flex-row gap-8">
          <SeriesEventsList 
            events={filteredEvents} 
            allTags={allTags}
            // 其他必要的 props
          />
          <EventCalendarPanel 
            events={events}
            currentMonth={currentMonth}
            // 其他必要的 props
          />
        </div>
      </div>
    </div>
  );
}
```

### 2. 各功能組件設計

#### SeriesBanner.tsx
簡單的展示組件，顯示事件系列的頂部橫幅圖片。

```tsx
const SeriesBanner: React.FC<SeriesBannerProps> = ({ series }) => {
  return (
    <div className="relative w-full h-80 sm:h-96">
      <Image
        src={series.cover_image || "https://placehold.co/1200x400/333/FFF"}
        alt={series.title}
        className="object-cover object-center brightness-75"
        fill
        priority
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent"></div>
    </div>
  );
};
```

#### SeriesInfo.tsx
展示事件系列的詳細信息，包括標題、描述、日期等。

```tsx
const SeriesInfo: React.FC<SeriesInfoProps> = ({ series }) => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  
  // 處理訂閱功能
  const handleSubscribe = () => {
    setIsSubscribed(!isSubscribed);
  };
  
  return (
    <div className="bg-card shadow-lg rounded-xl overflow-hidden mb-10">
      {/* 內容實現 */}
    </div>
  );
};
```

#### EventCalendarPanel.tsx
包含日曆和地圖的側邊欄組件，這兩個組件使用相同的 sticky 容器以確保它們作為一組一起固定。

```tsx
const EventCalendarPanel: React.FC<EventCalendarPanelProps> = ({
  events,
  currentMonth,
  // 其他 props
}) => {
  return (
    <div className="w-full md:w-72 flex-shrink-0">
      {/* 提交活動按鈕 */}
      <div className="bg-card border border-border rounded-md p-4 text-center">
        {/* 按鈕內容 */}
      </div>
      
      {/* 固定容器 - 包含日曆和地圖，確保它們作為一組一起固定 */}
      <div className="sticky top-20 mt-6 space-y-6">
        {/* 日曆組件 */}
        <div className="bg-card border border-border rounded-md overflow-hidden">
          {/* 日曆實現 */}
        </div>
        
        {/* 活動地點地圖組件 */}
        <div className="bg-card border border-border rounded-md overflow-hidden">
          <div className="aspect-video w-full relative bg-neutral-900">
            <MapboxEventMap 
              locations={events.filter(/*...*/)}
              height="100%"
              width="100%"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
```

#### SeriesEventsList/index.tsx
事件列表的主容器，包含控制和過濾功能。

```tsx
const SeriesEventsList: React.FC<SeriesEventsListProps> = ({
  events,
  allTags,
  // 其他 props
}) => {
  const [viewMode, setViewMode] = useState<"timeline" | "list">("timeline");
  const [searchQuery, setSearchQuery] = useState<string>("");
  
  return (
    <div className="flex-1 min-w-0">
      {/* 頂部標題和控制區 */}
      <div className="flex justify-between items-center mb-6 sticky top-0 z-10 bg-background/95 backdrop-blur-sm py-4">
        {/* 控制元素 */}
      </div>

      {/* 活動篩選標籤 */}
      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-6">
          {/* 標籤列表 */}
        </div>
      )}

      {/* 根據視圖模式顯示不同的組件 */}
      {events.length > 0 && viewMode === "timeline" && (
        <TimelineView events={events} />
      )}

      {events.length > 0 && viewMode === "list" && (
        <ListView events={events} />
      )}
    </div>
  );
};
```

## 重構中的關鍵設計決策

### 1. 日曆和地圖組件的布局處理

一個重要的 UI 挑戰是日曆和地圖在頁面滾動時會互相重疊。解決方案是將兩個組件放在同一個 sticky 容器中：

```tsx
{/* 固定容器 - 包含日曆和地圖 */}
<div className="sticky top-20 mt-6 space-y-6">
  {/* 日曆組件 */}
  <div className="...">...</div>
  
  {/* 地圖組件 */}
  <div className="...">
    <MapboxEventMap ... />
  </div>
</div>
```

這確保了兩個組件作為一個整體一起固定，避免了滾動時的重疊問題。

### 2. 狀態管理策略

保持所有共享狀態在頂層頁面組件中管理，包括：
- 選中的日期
- 選中的標籤
- 視圖模式
- 搜索查詢

這樣可以確保各組件之間的狀態同步，避免數據不一致的問題。

### 3. 組件間的數據流

採用自上而下（props 傳遞）的方式傳遞數據和事件處理函數，保持數據流的清晰和可預測性。詳細的數據流可見於[組件結構圖](../images/component-structure.md#數據流概覽)。

## 重構效果

### 改進點

1. **文件大小**：主頁面文件從 1000+ 行減少到約 300 行
2. **組件可維護性**：每個組件職責明確，易於理解和維護
3. **團隊協作**：不同開發者可以同時處理不同組件
4. **代碼復用**：可以在其他頁面中復用這些組件
5. **性能優化**：每個組件可以單獨優化，提高頁面性能

### 已知問題

重構過程中發現了一些需要解決的問題：

1. **CSS 404 錯誤**：多次出現 `/_next/static/css/app/layout.css` 404 錯誤，可能與 Next.js CSS 配置有關
2. **字體文件錯誤**：`Error: ENOENT: no such file or directory, open '/next-font-manifest.json'`，與 Next.js 字體優化功能有關
3. **組件依賴問題**：某些組件仍然存在重複代碼，例如日期格式化邏輯

## 下一步改進計劃

1. **解決 CSS 和字體問題**：修復 404 錯誤和字體清單問題
2. **進一步抽取共用功能**：例如將日期格式化和事件分組邏輯抽取為工具函數
3. **組件性能優化**：使用 React.memo 等技術優化渲染性能
4. **添加單元測試**：為重構後的組件添加測試用例
5. **進一步拆分大型組件**：例如 EventCalendarPanel 仍然可以進一步拆分

## 結論

通過將大型頁面組件拆分為多個小型組件，我們顯著提高了代碼的可維護性和可讀性。這種方法特別適用於複雜的頁面，可以讓開發團隊更高效地協作和維護代碼。

重構過程中最重要的經驗是：

1. 根據功能和職責清晰地劃分組件
2. 保持合理的狀態管理和數據流設計
3. 注意組件間的數據傳遞和事件處理
4. 在重構過程中保持 UI 行為和視覺設計的一致性

這些原則和經驗可以應用於項目中的其他頁面重構工作。 
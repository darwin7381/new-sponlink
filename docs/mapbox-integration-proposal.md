# Mapbox地圖集成方案

## 背景

我們目前的系統已經使用Google Maps API實現了地點選擇和搜索功能，但在展示多個活動位置的地圖視圖時，我們需要一個更經濟高效且視覺上更符合Luma風格的解決方案。

透過研究，我們發現Luma.com使用Mapbox GL JS實現其地圖功能，並提供了優雅的視覺設計和良好的用戶體驗。

## 方案比較 (Google Maps vs Mapbox)

### 功能對比

| 功能 | Google Maps | Mapbox |
|------|-------------|--------|
| 地點數據庫 | ✅ 非常全面 | ⚠️ 良好但不如Google |
| 自定義樣式 | ⚠️ 有限 | ✅ 完全自定義 |
| 交互性 | ✅ 良好 | ✅ 更流暢 |
| API設計 | ⚠️ 複雜 | ✅ 開發者友好 |
| 本地化支持 | ✅ 極佳 | ⚠️ 需要額外設置 |

### 價格對比 (2024年數據)

| 計費項目 | Google Maps | Mapbox | 差距倍數 |
|---------|-------------|--------|---------|
| 免費額度 | 28,000次載入/月 | 50,000次載入/月 | Mapbox約1.8倍 |
| 超額費用 | $7/1000次 | $0.5/1000次 | Google約14倍 |
| 額外API調用 | 單獨計費 | 部分包含在基本計費中 | 視功能而定 |

### 系統整合考量

由於我們已經使用Google Maps API進行地點選擇和地址補全功能，我們建議採用混合策略：

1. **保留Google Maps API用於**:
   - 地點搜索和自動補全
   - 地址驗證和結構化
   - 需要精確地點數據的功能

2. **引入Mapbox用於**:
   - 活動系列頁面的多點顯示地圖
   - 需要自定義外觀的地圖顯示
   - 高度交互的地圖視圖

## 技術實現方案

### 需要安裝的依賴

```bash
npm install mapbox-gl @types/mapbox-gl
```

### 環境設置

在`.env.local`文件中添加Mapbox訪問令牌:

```
# 現有的Google Maps配置
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=您的Google_Maps_API密鑰

# 新增的Mapbox配置
NEXT_PUBLIC_MAPBOX_TOKEN=您的Mapbox訪問令牌
```

### 關鍵組件實現

建立新的`MapboxEventMap.tsx`組件實現多點顯示地圖:

```tsx
'use client';

import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Location } from '@/types/event';
import { MapPin } from 'lucide-react';

interface EventLocation {
  id: string;
  title: string;
  location: Location;
}

interface MapboxEventMapProps {
  locations: EventLocation[];
  className?: string;
  height?: string;
  width?: string;
}

// 設置Mapbox訪問令牌
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

const MapboxEventMap: React.FC<MapboxEventMapProps> = ({
  locations,
  className = '',
  height = '100%',
  width = '100%'
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!mapboxgl.accessToken) {
      setError('Mapbox token is required');
      return;
    }

    // 確保只初始化一次地圖
    if (map.current || !mapContainer.current) return;

    try {
      // 初始化地圖
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/dark-v11', // Luma風格的深色主題
        center: [114.1694, 22.3193], // 香港中心位置
        zoom: 11
      });

      // 地圖載入完成後添加標記
      map.current.on('load', () => {
        if (!map.current) return;

        // 篩選有效的地點數據
        const validLocations = locations.filter(
          item => item.location && item.location.latitude && item.location.longitude
        );

        if (validLocations.length === 0) return;

        // 設置地圖邊界以顯示所有標記
        const bounds = new mapboxgl.LngLatBounds();

        // 添加每個位置的標記
        validLocations.forEach((item, index) => {
          if (!map.current) return;
          if (!item.location.latitude || !item.location.longitude) return;

          // 擴展邊界
          bounds.extend([item.location.longitude, item.location.latitude]);

          // 創建自定義HTML標記
          const markerEl = document.createElement('div');
          markerEl.className = 'flex items-center justify-center bg-green-500 rounded-full w-6 h-6 text-white text-xs font-medium shadow-md';
          markerEl.innerText = `${index + 1}`;
          
          // 添加懸停效果
          markerEl.style.transition = 'all 0.2s ease-in-out';
          markerEl.addEventListener('mouseenter', () => {
            markerEl.style.transform = 'scale(1.2)';
          });
          markerEl.addEventListener('mouseleave', () => {
            markerEl.style.transform = 'scale(1)';
          });

          // 創建彈出信息
          const popup = new mapboxgl.Popup({ offset: 25 })
            .setHTML(`
              <div class="p-2">
                <h3 class="font-medium text-sm">${item.title}</h3>
                <p class="text-xs text-gray-600 mt-1">
                  ${item.location.name || item.location.address || ''}
                </p>
              </div>
            `);

          // 添加標記到地圖
          new mapboxgl.Marker({ element: markerEl })
            .setLngLat([item.location.longitude, item.location.latitude])
            .setPopup(popup)
            .addTo(map.current);
        });

        // 調整地圖以顯示所有標記
        if (!bounds.isEmpty()) {
          map.current.fitBounds(bounds, {
            padding: 50,
            maxZoom: 15
          });
        }
      });

      // 添加控制元素 (可選)
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    } catch (err) {
      console.error('Error initializing map:', err);
      setError('Failed to initialize map');
    }

    // 清理函數
    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, [locations]);

  // 錯誤處理
  if (error) {
    return (
      <div className={`${className} flex items-center justify-center bg-neutral-900`} style={{ width, height }}>
        <div className="text-center p-4">
          <MapPin className="h-8 w-8 text-primary/50 mx-auto mb-2" />
          <p className="text-sm font-medium text-muted-foreground">無法載入地圖</p>
          <p className="text-xs text-muted-foreground mt-1">{error}</p>
        </div>
      </div>
    );
  }

  // 加載中狀態
  if (!mapboxgl.accessToken) {
    return (
      <div className={`${className} flex items-center justify-center bg-neutral-900`} style={{ width, height }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="text-sm text-muted-foreground mt-2">加載地圖中...</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={mapContainer} className={className} style={{ width, height }} />
  );
};

export default MapboxEventMap;
```

### 全局CSS樣式 (添加到globals.css)

```css
/* 將Mapbox控制器設為暗色主題風格 */
.mapboxgl-ctrl-group {
  background-color: #1f2937 !important;
  border-radius: 4px !important;
  border: 1px solid #374151 !important;
}

.mapboxgl-ctrl-group button {
  color: #e5e7eb !important;
}

.mapboxgl-ctrl-group button:hover {
  background-color: #374151 !important;
}

.mapboxgl-popup-content {
  background-color: #ffffff !important;
  border-radius: 6px !important;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06) !important;
  padding: 0 !important;
}

.mapboxgl-popup-close-button {
  padding: 4px !important;
  color: #6b7280 !important;
}
```

## 更新應用實現

1. 替換當前的地圖組件:
   ```tsx
   {/* 替換此組件 */}
   <EventLocationMap ...props />
   
   {/* 替換為 */}
   <MapboxEventMap ...props />
   ```

2. 確保環境變量正確設置

## 成本預測

以每月10萬用戶訪問估算:

| 供應商 | 預計每月請求量 | 免費額度 | 超額請求 | 月費 | 年費 |
|-------|--------------|---------|---------|-----|-----|
| Google Maps | 100,000 | 28,000 | 72,000 | $504 | $6,048 |
| Mapbox | 100,000 | 50,000 | 50,000 | $25 | $300 |

**年度節省**: $5,748 (比Google Maps節省約95%)

## 實施計劃

1. 獲取Mapbox訪問令牌
2. 實施MapboxEventMap組件
3. 在事件系列詳情頁面集成組件
4. 進行性能和視覺效果測試
5. 全面部署

## 結論和建議

我們推薦採用Mapbox實現活動地點地圖功能，同時保留現有的Google Maps地點搜索功能，這樣可以:

1. 顯著降低API使用成本（估計節省95%）
2. 提供更現代、可自定義的用戶界面
3. 保持與Luma等同類產品的視覺一致性
4. 提升地圖交互體驗

這種混合方案既利用了Google Maps強大的地點數據庫和搜索能力，又避免了其高昂的地圖顯示費用。 
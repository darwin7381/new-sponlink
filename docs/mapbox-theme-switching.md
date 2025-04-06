# MapBox 主題切換實現經驗

## 問題描述

在 SponLink 平台中，我們使用 MapBox 實現了地圖功能，但在網站的暗色/亮色主題切換過程中遇到了挑戰。主要問題包括：

1. 地圖無法正確檢測當前主題狀態（深色/亮色）
2. 網站主題切換時，地圖不會自動更新樣式
3. 初始化加載時地圖樣式與網站主題不一致

## 解決方案

經過多次嘗試，我們發現最可靠的方法是直接從 DOM 結構中檢測當前主題，而不是依賴 `useTheme` hook 的狀態。

### 關鍵代碼實現

#### 1. 直接從 DOM 檢測主題

```typescript
// 直接從DOM檢測當前主題
const getCurrentTheme = useCallback(() => {
  if (typeof window !== 'undefined') {
    const isDarkMode = document.documentElement.classList.contains('dark');
    return isDarkMode ? 'dark' : 'light';
  }
  return 'light'; // 默認主題
}, []);

// 根據主題獲取地圖樣式
const getMapStyle = useCallback(() => {
  const currentTheme = getCurrentTheme();
  console.log(`地圖 - 從DOM檢測主題: ${currentTheme}`);
  return currentTheme === 'dark'
    ? 'mapbox://styles/mapbox/dark-v11'
    : 'mapbox://styles/mapbox/streets-v12';
}, [getCurrentTheme]);
```

#### 2. 地圖初始化時設置正確樣式

```typescript
// 初始化地圖
useEffect(() => {
  if (!mapboxgl.accessToken) {
    setError('Mapbox token is required');
    return;
  }

  // 確保只初始化一次地圖
  if (map.current || !mapContainer.current) return;

  try {
    const currentTheme = getCurrentTheme();
    console.log(`地圖初始化 - 使用DOM檢測主題: ${currentTheme}`);
    
    // 添加主題標記類到容器
    if (mapContainer.current) {
      mapContainer.current.classList.remove('theme-dark', 'theme-light');
      mapContainer.current.classList.add(`theme-${currentTheme}`);
      mapContainer.current.dataset.theme = currentTheme;
    }
    
    // 根據當前主題選擇地圖樣式
    const mapStyle = currentTheme === 'dark'
      ? 'mapbox://styles/mapbox/dark-v11'
      : 'mapbox://styles/mapbox/streets-v12';
    
    // 初始化地圖
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: mapStyle,
      // ... 其他配置
    });

    // ... 其他初始化邏輯
  } catch (err) {
    console.error('Error initializing map:', err);
    setError('Failed to initialize map');
  }

  // ... 清理函數
}, [getCurrentTheme]);
```

#### 3. 監聽主題變化更新地圖樣式

```typescript
// 監聽主題變化，更新地圖樣式
useEffect(() => {
  // 確保只在主題變化時更新，而不是其他狀態變化時
  if (!map.current || !isMapInitialized) return;

  const currentTheme = getCurrentTheme();
  console.log(`主題變化檢測 - 當前主題: ${currentTheme}`);
  
  try {
    // 更新容器的主題類名
    if (mapContainer.current) {
      mapContainer.current.classList.remove('theme-dark', 'theme-light');
      mapContainer.current.classList.add(`theme-${currentTheme}`);
      mapContainer.current.dataset.theme = currentTheme;
    }
    
    // 直接設置新樣式
    map.current.setStyle(getMapStyle());
  } catch (err) {
    console.error('更新地圖樣式錯誤:', err);
  }
}, [theme, isMapInitialized, getMapStyle, getCurrentTheme]); // 監聽 theme 變化
```

#### 4. 為彈出窗口添加主題特定樣式

```css
/* 主題特定樣式 */
.theme-dark .mapboxgl-popup-content {
  background-color: #1f1f1f;
  color: #f0f0f0;
}
.theme-dark .mapboxgl-popup-tip {
  border-top-color: #1f1f1f;
  border-bottom-color: #1f1f1f;
}
.theme-dark .mapboxgl-popup-close-button {
  color: #f0f0f0;
}
.theme-dark .border-gray-200 {
  border-color: #3a3a3a !important;
}
.theme-dark .text-gray-500 {
  color: #a0a0a0 !important;
}
/* 暗色模式下改變標記顏色 */
.theme-dark .marker-container {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.4);
}
.theme-dark .marker-container:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.5);
}
```

## 主要經驗教訓

1. **避免依賴 useTheme 的狀態**：在 Next.js 和 React 環境中，`useTheme` 提供的 `theme` 和 `resolvedTheme` 有時可能不同步或無法反映當前實際主題狀態。
   
2. **直接從 DOM 檢測主題更可靠**：通過檢查 `document.documentElement.classList.contains('dark')` 可以直接獲取當前應用的主題狀態。

3. **主題切換同步問題**：主題變化和 MapBox 樣式更新需要明確的同步機制，不能假設它們會自動同步。

4. **樣式保持**：在更新地圖樣式時，需要保存和恢復地圖的視圖狀態（中心點、縮放級別等）。

5. **標記重新添加**：在樣式變化後，可能需要重新添加地圖標記。

## 實現注意事項

1. **初始化時機**：確保在檢測到主題後才初始化地圖。

2. **避免多次初始化**：使用 ref 和狀態標誌確保地圖只初始化一次。

3. **添加主題類名**：為地圖容器添加主題相關的類名，以便套用相應的 CSS 樣式。

4. **監聽全局主題變化**：監聽 `theme` 變量的變化以觸發地圖樣式更新。

5. **提供後備選項**：始終為主題檢測提供合理的默認值，避免未定義狀態。

## 總結

通過直接從 DOM 檢測主題狀態而不是依賴 React 上下文提供的主題狀態，我們成功解決了 MapBox 在主題切換時的樣式同步問題。這種方法更加可靠，特別是在 Next.js 的服務器端渲染和客戶端水合過程中。

這個解決方案適用於 SponLink 平台中的所有 MapBox 地圖組件，包括活動列表中的小地圖和活動系列的大地圖視圖。 
'use client';

import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Location } from '@/types/event';
import { MapPin } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';

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
  onMarkerClick?: (eventIds: string[]) => void;
  seriesId?: string;
  stableLocations?: boolean; // 新增：標記位置數據是否應該被視為穩定（不重新計算和渲染）
}

// 设置Mapbox访问令牌
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

/**
 * MapBox Event Map 組件
 * 
 * 主題切換解決方案：
 * 1. 我們直接從 DOM 檢測當前主題狀態(dark/light)，而不是依賴 useTheme 提供的狀態
 * 2. 初始化地圖時基於當前檢測到的主題設置對應的地圖樣式
 * 3. 監聽主題變化並更新地圖樣式
 * 4. 為地圖容器添加主題相關的類名，以便應用相應的 CSS 樣式
 * 
 * 詳細說明見 /docs/mapbox-theme-switching.md
 */
const MapboxEventMap: React.FC<MapboxEventMapProps> = ({
  locations,
  className = '',
  height = '100%',
  width = '100%',
  onMarkerClick,
  seriesId,
  stableLocations = false // 預設為false，保持向後兼容
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const [isMapInitialized, setIsMapInitialized] = useState(false);
  const initialLocationsRef = useRef<EventLocation[]>(locations);
  const { theme } = useTheme(); // 簡化主題使用
  
  /**
   * 直接從DOM檢測當前主題
   * 這是更可靠的方法，因為它直接檢查文檔的實際狀態
   * useTheme 提供的狀態在某些情況下可能不一致或延遲更新
   */
  const getCurrentTheme = useCallback(() => {
    if (typeof window !== 'undefined') {
      const isDarkMode = document.documentElement.classList.contains('dark');
      return isDarkMode ? 'dark' : 'light';
    }
    return 'light'; // 默認主題
  }, []);

  /**
   * 根據主題獲取適當的地圖樣式
   * dark 主題 -> dark-v11 樣式
   * light 主題 -> streets-v12 樣式
   */
  const getMapStyle = useCallback(() => {
    const currentTheme = getCurrentTheme();
    console.log(`小地圖 - 從DOM檢測主題: ${currentTheme}`);
    return currentTheme === 'dark'
      ? 'mapbox://styles/mapbox/dark-v11'
      : 'mapbox://styles/mapbox/streets-v12';
  }, [getCurrentTheme]);

  // 只在組件首次渲染或非穩定模式下使用locations計算locationGroups
  const locationGroups = useMemo(() => {
    // 如果是穩定模式且地圖已初始化，則使用初始locations
    const locationsToUse = (stableLocations && isMapInitialized) 
      ? initialLocationsRef.current 
      : locations;
    
    if (!locationsToUse || locationsToUse.length === 0) return {};
    
    // 篩選有效的地點數據
    const validLocations = locationsToUse.filter(
      item => item.location && item.location.latitude && item.location.longitude
    );

    if (validLocations.length === 0) return {};
    
    // 按經緯度分組
    const groups: Record<string, EventLocation[]> = {};
    
    validLocations.forEach(item => {
      if (!item.location.latitude || !item.location.longitude) return;
      
      // 使用經緯度四捨五入到3位小數作為鍵，將接近的位置分組
      const key = `${Math.round(item.location.latitude * 1000) / 1000},${Math.round(item.location.longitude * 1000) / 1000}`;
      
      if (!groups[key]) {
        groups[key] = [];
      }
      
      groups[key].push(item);
    });
    
    return groups;
  }, [locations, stableLocations, isMapInitialized]);

  // 處理地圖點擊，跳轉到完整地圖頁面
  const handleMapClick = useCallback(() => {
    if (seriesId) {
      router.push(`/event-series/${seriesId}/map`);
    }
  }, [router, seriesId]);

  /**
   * 監聽主題變化並更新地圖樣式
   * 當網站主題改變時，我們需要相應地更新地圖樣式
   */
  useEffect(() => {
    // 確保只在主題變化時更新，而不是其他狀態變化時
    if (!map.current || !isMapInitialized) return;

    const currentTheme = getCurrentTheme();
    console.log(`小地圖主題變化檢測 - 當前主題: ${currentTheme}`);
    
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
  }, [theme, isMapInitialized, getMapStyle, getCurrentTheme]); // 只監聽 theme 變化

  /**
   * 初始化地圖並設置適合當前主題的樣式
   */
  useEffect(() => {
    if (!mapboxgl.accessToken) {
      setError('Mapbox token is required');
      return;
    }

    // 確保只初始化一次地圖
    if (map.current || !mapContainer.current) return;

    try {
      const currentTheme = getCurrentTheme();
      console.log(`小地圖初始化 - 使用DOM檢測主題: ${currentTheme}`);
      
      // 添加主題標記類到容器
      if (mapContainer.current) {
        mapContainer.current.classList.remove('theme-dark', 'theme-light');
        mapContainer.current.classList.add(`theme-${currentTheme}`);
        mapContainer.current.dataset.theme = currentTheme;
      }
      
      // 儲存初始位置數據
      initialLocationsRef.current = locations;
      
      // 根據當前主題選擇地圖樣式
      const mapStyle = currentTheme === 'dark'
        ? 'mapbox://styles/mapbox/dark-v11'
        : 'mapbox://styles/mapbox/streets-v12';
      
      console.log(`使用地圖樣式: ${mapStyle}`);
      
      // 初始化地圖
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: mapStyle,
        center: [114.1694, 22.3193],
        zoom: 11,
        attributionControl: false,
        logoPosition: 'bottom-right',
        renderWorldCopies: false,
        interactive: false, // 禁用交互性（平移/縮放）
        fadeDuration: 0 // 無過渡動畫
      });

      // 添加地圖點擊事件
      if (mapContainer.current) {
        mapContainer.current.addEventListener('click', handleMapClick);
      }

      // 地圖加載完成後添加標記
      map.current.on('load', () => {
        if (!map.current) return;
        console.log('地圖加載完成，添加標記...');
        
        // 清除現有標記
        if (markers.current.length > 0) {
          markers.current.forEach(marker => marker.remove());
          markers.current = [];
        }
        
        // 計算邊界
        if (Object.keys(locationGroups).length > 0) {
          const bounds = new mapboxgl.LngLatBounds();
          
          Object.entries(locationGroups).forEach(([key, group]) => {
            if (group.length === 0) return;
            
            const firstLocation = group[0];
            const lat = firstLocation.location.latitude || 0;
            const lng = firstLocation.location.longitude || 0;
            
            bounds.extend([lng, lat]);
            
            // 創建自定義HTML標記
            const markerEl = document.createElement('div');
            markerEl.className = 'flex items-center justify-center bg-green-500 rounded-full w-6 h-6 text-white text-xs font-medium shadow-md';
            markerEl.innerText = `${group.length}`;
            
            // 為標記添加點擊事件：篩選相關事件
            markerEl.style.cursor = 'pointer';
            markerEl.addEventListener('click', (e) => {
              e.stopPropagation(); // 防止觸發地圖點擊
              if (onMarkerClick) {
                const eventIds = group.map(item => item.id);
                onMarkerClick(eventIds);
              }
            });
            
            // 簡化標記，不添加彈出框
            const marker = new mapboxgl.Marker({ element: markerEl })
              .setLngLat([lng, lat])
              .addTo(map.current as mapboxgl.Map);
              
            // 存儲標記引用以便之後清除
            markers.current.push(marker);
          });
          
          if (!bounds.isEmpty()) {
            // 立即設置地圖邊界 - 無動畫
            map.current.fitBounds(bounds, {
              padding: 50,
              maxZoom: 15,
              duration: 0 // 禁用動畫
            });
          }
        }
        
        // 設置地圖已初始化標誌
        setIsMapInitialized(true);
      });

    } catch (err) {
      console.error('Error initializing map:', err);
      setError('Failed to initialize map');
    }

    // 清理函數
    return () => {
      if (mapContainer.current) {
        mapContainer.current.removeEventListener('click', handleMapClick);
      }
      
      // 清除所有標記
      if (markers.current.length > 0) {
        markers.current.forEach(marker => marker.remove());
        markers.current = [];
      }
      
      map.current?.remove();
      map.current = null;
      setIsMapInitialized(false);
    };
  }, [handleMapClick, getCurrentTheme, locations]);

  // 更新標記 - 只有在非穩定模式下才根據位置變化更新
  useEffect(() => {
    // 如果開啟了穩定模式且地圖已初始化，則不更新標記
    if (stableLocations && isMapInitialized) {
      return;
    }
    
    if (!map.current || Object.keys(locationGroups).length === 0) return;
    
    // 確保地圖已加載
    if (map.current.loaded()) {
      console.log('更新地圖標記...');
      
      // 清除現有標記
      if (markers.current.length > 0) {
        markers.current.forEach(marker => marker.remove());
        markers.current = [];
      }
      
      // 添加新標記
      Object.entries(locationGroups).forEach(([key, group]) => {
        if (group.length === 0) return;
        
        const firstLocation = group[0];
        const lat = firstLocation.location.latitude || 0;
        const lng = firstLocation.location.longitude || 0;
        
        // 創建自定義HTML標記
        const markerEl = document.createElement('div');
        markerEl.className = 'flex items-center justify-center bg-green-500 rounded-full w-6 h-6 text-white text-xs font-medium shadow-md';
        markerEl.innerText = `${group.length}`;
        
        // 為標記添加點擊事件：篩選相關事件
        markerEl.style.cursor = 'pointer';
        markerEl.addEventListener('click', (e) => {
          e.stopPropagation(); // 防止觸發地圖點擊
          if (onMarkerClick) {
            const eventIds = group.map(item => item.id);
            onMarkerClick(eventIds);
          }
        });
        
        // 簡化標記，不添加彈出框
        const marker = new mapboxgl.Marker({ element: markerEl })
          .setLngLat([lng, lat])
          .addTo(map.current as mapboxgl.Map);
          
        // 存儲標記引用以便之後清除
        markers.current.push(marker);
      });
    } else {
      // 如果地圖尚未加載，等待load事件
      map.current.once('load', () => {
        // 在地圖加載後更新標記
        if (!map.current) return;
        
        // 清除現有標記
        if (markers.current.length > 0) {
          markers.current.forEach(marker => marker.remove());
          markers.current = [];
        }
        
        // 添加新標記
        Object.entries(locationGroups).forEach(([key, group]) => {
          if (!map.current || group.length === 0) return;
          
          const firstLocation = group[0];
          const lat = firstLocation.location.latitude || 0;
          const lng = firstLocation.location.longitude || 0;
          
          // 創建自定義HTML標記
          const markerEl = document.createElement('div');
          markerEl.className = 'flex items-center justify-center bg-green-500 rounded-full w-6 h-6 text-white text-xs font-medium shadow-md';
          markerEl.innerText = `${group.length}`;
          
          // 為標記添加點擊事件：篩選相關事件
          markerEl.style.cursor = 'pointer';
          markerEl.addEventListener('click', (e) => {
            e.stopPropagation(); // 防止觸發地圖點擊
            if (onMarkerClick) {
              const eventIds = group.map(item => item.id);
              onMarkerClick(eventIds);
            }
          });
          
          // 簡化標記，不添加彈出框
          const marker = new mapboxgl.Marker({ element: markerEl })
            .setLngLat([lng, lat])
            .addTo(map.current as mapboxgl.Map);
            
          // 存儲標記引用以便之後清除
          markers.current.push(marker);
        });
      });
    }
  }, [locationGroups, onMarkerClick, stableLocations, isMapInitialized]);

  // 錯誤處理
  if (error) {
    return (
      <div className={`${className} flex items-center justify-center bg-card theme-${getCurrentTheme()}`} style={{ width, height }}>
        <div className="text-center p-4">
          <MapPin className="h-8 w-8 text-primary/50 mx-auto mb-2" />
          <p className="text-sm font-medium text-muted-foreground">无法加载地图</p>
          <p className="text-xs text-muted-foreground mt-1">{error}</p>
        </div>
      </div>
    );
  }

  // 加載中狀態
  if (!mapboxgl.accessToken) {
    return (
      <div className={`${className} flex items-center justify-center bg-card theme-${getCurrentTheme()}`} style={{ width, height }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="text-sm text-muted-foreground mt-2">加载地图中...</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={mapContainer} 
      className={`${className} cursor-pointer theme-${getCurrentTheme()}`} 
      style={{ width, height }} 
      data-testid="mapbox-container"
      data-theme={getCurrentTheme()}
    />
  );
};

export default MapboxEventMap; 
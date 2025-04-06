"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { EventSeries, Event } from "@/types/event";
import { getEventSeriesById, getEventsInSeries } from "@/services/eventSeriesService";
import mapboxgl, { Map } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import Link from "next/link";
import { ArrowLeft, MapPin, Calendar, Clock, List, X } from "lucide-react";
import { format } from "date-fns";
import { useTheme } from "next-themes";

// 設置Mapbox令牌 - 確保在代碼頂部使用，避免延遲設置
if (typeof window !== "undefined") {
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  if (mapboxToken) {
    mapboxgl.accessToken = mapboxToken;
    console.log("Mapbox token set successfully");
  } else {
    console.error("NEXT_PUBLIC_MAPBOX_TOKEN is missing");
  }
}

// 添加腳本以監聽暗黑模式變化
if (typeof window !== "undefined") {
  // 檢測是否支持prefers-color-scheme
  if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
      console.log(`系統主題變化檢測: ${e.matches ? 'dark' : 'light'}`);
    });
  }
}

// 全局添加地圖樣式
const mapStyles = `
  .marker-container {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    background-color: #10b981;
    border-radius: 50%;
    color: white;
    font-weight: 500;
    font-size: 14px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    cursor: pointer;
    transition: all 0.2s ease;
  }
  .marker-container:hover {
    transform: scale(1.1);
    box-shadow: 0 4px 8px rgba(0,0,0,0.3);
  }
  .marker-container.selected {
    background-color: #f97316; /* 橙色標記表示選中狀態 */
    transform: scale(1.1);
    box-shadow: 0 0 0 4px rgba(249, 115, 22, 0.3);
  }
  .mapboxgl-popup-content {
    padding: 12px;
    border-radius: 8px;
  }
  .mapboxgl-popup {
    max-width: 280px !important;
    z-index: 10;
  }
  .map-container {
    width: 100% !important;
    height: 100% !important;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #f5f5f5;
    overflow: hidden;
  }
  .dark .map-container {
    background-color: #1a1a1a;
  }
  .events-list {
    overflow-y: auto;
    height: 100%;
    border-right: 1px solid rgba(127, 127, 127, 0.2);
  }
  .events-list-header {
    padding: 16px;
    border-bottom: 1px solid rgba(127, 127, 127, 0.2);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  /* 確保地圖容器正確填充 */
  #map {
    position: absolute !important;
    width: 100% !important;
    height: 100% !important;
    overflow: hidden !important;
  }
  /* 修復彈出窗口導致的空白問題 */
  .mapboxgl-canvas-container {
    width: 100% !important;
    height: 100% !important;
    position: relative !important;
  }
  .mapboxgl-canvas {
    width: 100% !important;
    height: 100% !important;
    position: absolute !important;
    left: 0 !important;
    top: 0 !important;
  }
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
`;

export default function EventSeriesMapPage() {
  const params = useParams();
  const seriesId = typeof params.id === 'string' ? params.id : null;
  const router = useRouter();
  const { theme, resolvedTheme, systemTheme } = useTheme();
  const [series, setSeries] = useState<EventSeries | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEventIds, setSelectedEventIds] = useState<string[]>([]);
  const [selectedMarkerKeys, setSelectedMarkerKeys] = useState<string[]>([]);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map | null>(null);
  const markerRefs = useRef<Record<string, { marker: mapboxgl.Marker, element: HTMLElement, eventIds: string[] }>>({});
  const [mapInitialized, setMapInitialized] = useState(false);
  const viewStateRef = useRef<{ center?: mapboxgl.LngLat, zoom?: number }>({});
  const boundsInitializedRef = useRef(false);
  const markersCreatedRef = useRef(false);
  const [localTheme, setLocalTheme] = useState<string>('');
  
  // 確定當前實際主題 - 改為僅在組件掛載時設置一次
  const currentTheme = useMemo(() => {
    // 如果在客戶端，檢查localStorage中存儲的主題
    if (typeof window !== "undefined") {
      try {
        // 嘗試從localStorage直接獲取當前主題
        const storedTheme = localStorage.getItem('theme');
        if (storedTheme) {
          console.log(`從localStorage讀取到主題: ${storedTheme}`);
          setLocalTheme(storedTheme);
          return storedTheme;
        }
      } catch (err) {
        console.error('讀取localStorage主題錯誤:', err);
      }
    }
    
    const detected = resolvedTheme || (theme === 'system' ? systemTheme : theme) || 'light';
    console.log(`檢測到的當前主題: ${detected}`);
    setLocalTheme(detected);
    return detected;
  }, [resolvedTheme, theme, systemTheme]);

  /**
   * 獲取當前主題並返回相應的地圖樣式
   * 直接從DOM檢測主題而不是依賴useTheme hook的狀態
   */
  const getMapStyle = useCallback(() => {
    // 使用一個更簡單的邏輯來獲取當前主題
    // 首先檢查 document.documentElement 的 class 屬性
    let isDarkMode = false;
    
    if (typeof window !== 'undefined') {
      // 嘗試從 HTML 元素的 class 直接判斷
      isDarkMode = document.documentElement.classList.contains('dark');
      console.log(`直接從 HTML 元素檢測主題: ${isDarkMode ? 'dark' : 'light'}`);
    }
    
    const mapStyle = isDarkMode
      ? 'mapbox://styles/mapbox/dark-v11'
      : 'mapbox://styles/mapbox/streets-v12';
    
    console.log(`使用地圖樣式: ${mapStyle}`);
    return mapStyle;
  }, []);

  // 調試輸出主題狀態 - 僅用於開發調試
  useEffect(() => {
    console.log(`主題信息 - theme: ${theme}, resolvedTheme: ${resolvedTheme}, systemTheme: ${systemTheme}`);
    console.log(`計算後的當前主題: ${currentTheme}, localTheme: ${localTheme}`);
    
    // 檢查localStorage中的主題
    if (typeof window !== "undefined") {
      try {
        const storedTheme = localStorage.getItem('theme');
        console.log(`localStorage中的主題: ${storedTheme}`);
      } catch (error) {
        console.error('無法讀取localStorage:', error);
      }
    }
  }, [theme, resolvedTheme, systemTheme, currentTheme, localTheme]);

  // 獲取系列和活動數據
  useEffect(() => {
    const fetchData = async () => {
      if (!seriesId) {
        setError("缺少活動系列ID");
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        console.log(`開始獲取系列ID為 ${seriesId} 的數據`);
        
        const [seriesData, eventsData] = await Promise.all([
          getEventSeriesById(seriesId),
          getEventsInSeries(seriesId) as Promise<Event[]>
        ]);
        
        console.log(`系列數據已獲取: ${seriesData ? '成功' : '失敗'}`);
        console.log(`活動數據已獲取, 共 ${eventsData.length} 個活動`);
        
        if (eventsData.length > 0 && eventsData[0].location) {
          console.log(`首個活動位置數據:`, eventsData[0].location);
        }
        
        setSeries(seriesData);
        setEvents(eventsData);
        
      } catch (err) {
        console.error(`獲取數據出錯:`, err);
        setError("無法加載數據");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [seriesId]);

  // 注入地圖樣式
  useEffect(() => {
    // 添加全局CSS樣式
    const styleElement = document.createElement('style');
    styleElement.textContent = mapStyles;
    document.head.appendChild(styleElement);
    
    return () => {
      // 清理樣式
      if (styleElement.parentNode) {
        document.head.removeChild(styleElement);
      }
    };
  }, []);

  // 單獨封裝地圖初始化函數，方便在不同地方調用
  const initializeMap = (container: HTMLDivElement) => {
    try {
      // 直接從 DOM 判斷當前主題
      const isDarkMode = document.documentElement.classList.contains('dark');
      const themeToUse = isDarkMode ? 'dark' : 'light';
      console.log(`初始化大地圖 - DOM檢測主題: ${themeToUse}`);
      
      // 添加主題標記到容器
      container.classList.remove('theme-dark', 'theme-light');
      container.classList.add(`theme-${themeToUse}`);
      container.dataset.theme = themeToUse;
      
      // 根據當前主題獲取地圖樣式
      const mapStyle = themeToUse === 'dark'
        ? 'mapbox://styles/mapbox/dark-v11'
        : 'mapbox://styles/mapbox/streets-v12';
      
      console.log(`使用地圖樣式: ${mapStyle}`);
      
      // 創建地圖實例
      const map = new mapboxgl.Map({
        container: container,
        style: mapStyle,
        center: viewStateRef.current.center || [121.5654, 25.0330],
        zoom: viewStateRef.current.zoom || 11,
        attributionControl: true,
        antialias: true,
        preserveDrawingBuffer: true,
        failIfMajorPerformanceCaveat: false
      });
      
      // 保存地圖引用
      mapRef.current = map;
      
      // 處理樣式加載完成事件
      map.on('style.load', () => {
        console.log(`地圖樣式加載完成 - ${mapStyle}`);
      });
      
      // 地圖載入完成的處理
      map.on('load', () => {
        console.log("地圖已加載完成，準備添加標記");
        setMapInitialized(true);
        
        // 添加控制項
        map.addControl(new mapboxgl.NavigationControl(), 'top-right');
        
        // 檢查是否已經創建過標記（避免重複添加）
        if (!markersCreatedRef.current) {
          addMarkersToMap(map);
        }
      });
      
      // 監聽地圖錯誤
      map.on('error', (e) => {
        console.error('地圖錯誤:', e);
        setError(`地圖載入錯誤: ${e.error?.message || '未知錯誤'}`);
      });
      
      return map;
    } catch (error) {
      console.error('地圖初始化錯誤:', error);
      setError(`地圖初始化失敗: ${error instanceof Error ? error.message : String(error)}`);
      return null;
    }
  };
  
  // 單獨封裝標記添加邏輯
  const addMarkersToMap = (map: mapboxgl.Map) => {
    console.log("開始添加標記到地圖");
    
    // 過濾有效的事件位置
    const eventsWithLocation = events.filter(event => 
      event.location && 
      typeof event.location.latitude === 'number' && 
      typeof event.location.longitude === 'number'
    );
    
    console.log(`找到 ${eventsWithLocation.length} 個有位置數據的活動`);
    
    if (eventsWithLocation.length > 0) {
      // 按位置分組事件
      const locationGroups: Record<string, Event[]> = {};
      
      eventsWithLocation.forEach(event => {
        if (!event.location.latitude || !event.location.longitude) return;
        const key = `${Math.round(event.location.latitude * 1000) / 1000},${Math.round(event.location.longitude * 1000) / 1000}`;
        if (!locationGroups[key]) locationGroups[key] = [];
        locationGroups[key].push(event);
      });
      
      const bounds = new mapboxgl.LngLatBounds();
      
      // 為每個位置添加標記
      Object.entries(locationGroups).forEach(([key, groupEvents]) => {
        const firstEvent = groupEvents[0];
        const lat = firstEvent.location.latitude || 0;
        const lng = firstEvent.location.longitude || 0;
        
        bounds.extend([lng, lat]);
        
        // 創建標記元素
        const markerEl = document.createElement('div');
        markerEl.className = 'marker-container';
        markerEl.innerText = `${groupEvents.length}`;
        
        // 過濾該位置的所有事件ID
        const eventIds = groupEvents.map(event => event.id);
        
        // 創建標記
        const marker = new mapboxgl.Marker({ element: markerEl })
          .setLngLat([lng, lat])
          .setPopup(
            new mapboxgl.Popup({ 
              offset: 25,
              maxWidth: '250px',
              closeButton: true,
              closeOnClick: true,
              className: 'custom-popup'
            })
            .setHTML(`
              <div class="p-2">
                <h3 class="font-medium text-base mb-2">${groupEvents.length > 1 ? `${groupEvents.length} 個活動` : groupEvents[0].title}</h3>
                <div class="max-h-48 overflow-y-auto">
                  ${groupEvents.map(event => `
                    <div class="border-t border-gray-200 py-2 first:border-0 cursor-pointer" data-event-id="${event.id}">
                      <div class="font-medium">${event.title}</div>
                      <div class="text-xs text-gray-500 mt-1">
                        ${event.start_time ? format(new Date(event.start_time), 'yyyy/MM/dd HH:mm') : ''}
                      </div>
                    </div>
                  `).join('')}
                </div>
              </div>
            `)
            .on('open', function(this: mapboxgl.Popup) {
              // 當彈窗打開時，過濾左側列表顯示相關活動
              handleSelectEvents(eventIds);
              
              setTimeout(() => {
                const popupEl = this.getElement();
                if (!popupEl) return;
                
                popupEl.addEventListener('click', (e: MouseEvent) => {
                  const target = e.target as HTMLElement;
                  const eventDiv = target.closest<HTMLElement>('[data-event-id]');
                  if (eventDiv && eventDiv.dataset.eventId) {
                    router.push(`/events/${eventDiv.dataset.eventId}`);
                  }
                });
              }, 100);
            })
        )
        .addTo(map);
        
        // 保存標記引用和相關事件ID，用於後續更新樣式
        markerRefs.current[key] = { 
          marker, 
          element: markerEl, 
          eventIds 
        };
        
        // 如果已經有選中的事件，檢查這個標記是否應該標記為選中
        if (selectedEventIds.length > 0 && eventIds.some(id => selectedEventIds.includes(id))) {
          markerEl.classList.add('selected');
        }
        
        // 添加點擊事件 - 當直接點擊標記時也過濾左側列表
        markerEl.addEventListener('click', () => {
          handleSelectEvents(eventIds);
        });
      });
      
      // 標記已創建標誌
      markersCreatedRef.current = true;
      
      // 僅在初次加載時調整視圖，避免重複縮放
      if (!boundsInitializedRef.current && !bounds.isEmpty()) {
        boundsInitializedRef.current = true;
        map.fitBounds(bounds, {
          padding: 50,
          maxZoom: 15
        });
      }
    }
  };

  // 初始化地圖的簡化流程
  useEffect(() => {
    // 只有在事件數據加載完成後再初始化地圖
    if (!mapContainerRef.current || loading || events.length === 0) {
      console.log("地圖容器未準備好或正在加載數據，跳過初始化");
      return;
    }

    // 檢查Mapbox支援
    if (!mapboxgl.supported()) {
      console.error("此瀏覽器不支持Mapbox GL");
      setError("您的瀏覽器不支持Mapbox GL。請嘗試使用Chrome或Firefox。");
      return;
    }

    // 檢查Mapbox令牌
    if (!mapboxgl.accessToken) {
      console.error("缺少Mapbox令牌");
      setError("地圖加載失敗：缺少必要的訪問令牌");
      return;
    }

    console.log("開始初始化大地圖...");
    
    // 確保容器樣式正確
    const container = mapContainerRef.current;
    container.style.width = '100%';
    container.style.height = '100%';
    
    // 清除現有的地圖實例
    if (mapRef.current) {
      console.log("清理現有地圖實例");
      mapRef.current.remove();
      mapRef.current = null;
      setMapInitialized(false);
      markerRefs.current = {};
      markersCreatedRef.current = false;
    }
    
    // 立即初始化地圖
    initializeMap(container);
    
    // 返回清理函數
    return () => {
      console.log("執行地圖清理");
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        setMapInitialized(false);
        markerRefs.current = {};
        markersCreatedRef.current = false;
      }
    };
  }, [events, loading]); // 只關注事件加載完成

  // 更新標記狀態 - 分離自地圖初始化以避免重新縮放
  useEffect(() => {
    if (!mapInitialized || !mapRef.current) return;
    
    // 只更新標記樣式，不重新創建地圖或標記
    Object.entries(markerRefs.current).forEach(([key, { element, eventIds: markerEventIds }]) => {
      const isSelected = selectedEventIds.length > 0 && markerEventIds.some(id => selectedEventIds.includes(id));
      
      if (isSelected) {
        element.classList.add('selected');
      } else {
        element.classList.remove('selected');
      }
    });
  }, [selectedEventIds, mapInitialized]);

  // 處理選擇事件和更新標記顯示
  const handleSelectEvents = (eventIds: string[]) => {
    setSelectedEventIds(eventIds);
  };

  const renderEventsList = () => {
    const filteredEvents = selectedEventIds.length > 0
      ? events.filter(event => selectedEventIds.includes(event.id))
      : events;
    
    return (
      <>
        {filteredEvents.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            暫無活動
          </div>
        ) : (
          filteredEvents.map((event) => (
            <Link href={`/events/${event.id}`} key={event.id}>
              <div className="p-4 border-b border-border hover:bg-secondary/10 transition-colors">
                <h3 className="font-medium text-base">{event.title}</h3>
                <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {event.start_time ? format(new Date(event.start_time), 'yyyy/MM/dd') : 'TBA'}
                  </span>
                </div>
                {event.location && (
                  <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{event.location.name || event.location.city || 'TBA'}</span>
                  </div>
                )}
                {event.start_time && (
                  <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{format(new Date(event.start_time), 'HH:mm')}</span>
                  </div>
                )}
              </div>
            </Link>
          ))
        )}
      </>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error && !series) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center p-4">
        <h2 className="text-xl font-bold mb-2">發生錯誤</h2>
        <p className="text-muted-foreground mb-4">{error}</p>
        {seriesId && (
          <Link href={`/event-series/${seriesId}`} className="text-primary hover:underline flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" />
            返回活動系列頁面
          </Link>
        )}
      </div>
    );
  }

  if (!series) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center p-4">
        <h2 className="text-xl font-bold mb-2">找不到活動系列</h2>
        <Link href="/event-series" className="text-primary hover:underline flex items-center gap-1">
          <ArrowLeft className="h-4 w-4" />
          瀏覽所有活動系列
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* 頂部導航欄 */}
      <div className="bg-card border-b border-border p-2 md:p-4 z-20">
        <div className="max-w-full mx-auto flex justify-between items-center">
          <Link href={`/event-series/${seriesId}`} className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5">
            <ArrowLeft className="h-4 w-4" />
            <span>返回 {series?.title || "活動系列"}</span>
          </Link>
          <h1 className="text-lg md:text-xl font-bold truncate max-w-[250px] md:max-w-none">
            {series?.title || "活動系列"} - 活動地圖
          </h1>
          <div className="w-24"></div>
        </div>
      </div>
      
      {/* 主內容區 - 左側列表，右側地圖 */}
      <div className="flex flex-1 h-[calc(100vh-61px)] overflow-hidden">
        {/* 左側活動列表 - 固定區域 */}
        <div className="w-[300px] events-list bg-card">
          <div className="events-list-header">
            <h2 className="font-bold">活動列表</h2>
            <span className="text-sm text-muted-foreground">
              {selectedEventIds.length > 0 
                ? `顯示 ${selectedEventIds.length} 個篩選活動` 
                : `共 ${events.length} 個活動`}
            </span>
          </div>
          <div className="overflow-y-auto h-[calc(100%-56px)]">
            {renderEventsList()}
          </div>
        </div>
        
        {/* 右側地圖區域 - 固定區域 */}
        <div className="flex-1 relative" style={{ width: 'calc(100% - 300px)', overflow: 'hidden' }}>
          {/* 地圖本體 */}
          <div 
            id="map" 
            ref={mapContainerRef} 
            className="map-container"
          ></div>
          
          {/* 篩選按鈕 */}
          {selectedEventIds.length > 0 && (
            <button 
              className="absolute top-4 right-4 bg-card px-3 py-1.5 text-sm rounded-full shadow-lg hover:bg-secondary/20 transition-colors z-10"
              onClick={() => setSelectedEventIds([])}
            >
              清除篩選
            </button>
          )}
          
          {/* 加載指示器 */}
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-neutral-900/50 z-20">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          )}
          
          {/* 錯誤提示 */}
          {error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-neutral-900/80 text-center p-4 z-20">
              <MapPin className="h-8 w-8 text-destructive mx-auto mb-2" />
              <p className="text-sm font-medium text-destructive">無法加載地圖</p>
              <p className="text-xs text-muted-foreground mt-1">{error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} // 地圖主題檢測與切換問題解決方案說明\n// 請參考 /docs/mapbox-theme-switching.md 了解詳情

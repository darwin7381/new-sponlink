"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { EventSeries, Event } from "@/types/event";
import { getEventSeriesById, getEventsInSeries } from "@/services/eventSeriesService";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import Link from "next/link";
import { ArrowLeft, MapPin, Calendar, Clock } from "lucide-react";
import { format } from "date-fns";

interface EventSeriesMapPageProps {
  params: { id: string };
}

export default function EventSeriesMapPage({ params }: EventSeriesMapPageProps) {
  const { id: seriesId } = params;
  const router = useRouter();
  const [series, setSeries] = useState<EventSeries | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEventIds, setSelectedEventIds] = useState<string[]>([]);

  // 獲取活動系列和活動數據
  useEffect(() => {
    const fetchData = async () => {
      if (!seriesId) return;
      
      try {
        setLoading(true);
        
        // 獲取活動系列數據
        const seriesData = await getEventSeriesById(seriesId);
        setSeries(seriesData);
        
        // 獲取系列中的所有活動
        const eventsData = await getEventsInSeries(seriesId);
        setEvents(eventsData as Event[]);
        
        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("無法加載數據");
        setLoading(false);
      }
    };
    
    fetchData();
  }, [seriesId]);

  // 初始化地圖
  useEffect(() => {
    // 移除 mapInitialized 依賴，確保在 events 數據加載後總會嘗試初始化地圖
    if (!events.length) return;
    
    console.log("開始初始化地圖...");
    
    // 確保有Mapbox訪問令牌
    if (!mapboxgl.accessToken) {
      mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';
      console.log("Mapbox token:", mapboxgl.accessToken ? "已設置" : "未設置");
      if (!mapboxgl.accessToken) {
        setError("缺少地圖訪問令牌");
        return;
      }
    }
    
    // 篩選有有效位置的活動
    const eventsWithLocation = events.filter(
      event => event.location && event.location.latitude && event.location.longitude
    );
    
    console.log(`找到 ${eventsWithLocation.length} 個有位置數據的活動`);
    
    if (eventsWithLocation.length === 0) {
      setError("沒有找到活動位置");
      return;
    }
    
    // 初始化地圖
    const mapContainer = document.getElementById('map');
    console.log("地圖容器:", mapContainer ? "找到" : "未找到");
    
    if (!mapContainer) {
      console.error("找不到地圖容器元素 #map");
      return;
    }
    
    // 如果地圖已存在，則不再初始化
    if (mapContainer.hasChildNodes()) {
      console.log("地圖已初始化，跳過重新初始化");
      return;
    }
    
    try {
      console.log("創建Mapbox Map實例...");
      const map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/dark-v11',
        center: [121.5, 25.04], // 默認台北市中心
        zoom: 11,
        attributionControl: true
      });
      
      // 添加加載和錯誤事件處理
      map.on('error', (e) => {
        console.error('地圖加載錯誤:', e);
        setError("地圖加載錯誤");
      });
      
      // 添加導航控制
      map.addControl(new mapboxgl.NavigationControl(), 'top-right');
      
      // 按經緯度分組
      const locationGroups: Record<string, Event[]> = {};
      
      eventsWithLocation.forEach(event => {
        if (!event.location.latitude || !event.location.longitude) return;
        
        // 使用經緯度四捨五入到3位小數作為鍵，將接近的位置分組
        const key = `${Math.round(event.location.latitude * 1000) / 1000},${Math.round(event.location.longitude * 1000) / 1000}`;
        
        if (!locationGroups[key]) {
          locationGroups[key] = [];
        }
        
        locationGroups[key].push(event);
      });
      
      console.log(`位置分組後有 ${Object.keys(locationGroups).length} 個地點`);
      
      // 設置地圖邊界以顯示所有標記
      const bounds = new mapboxgl.LngLatBounds();
      
      // 添加標記
      Object.entries(locationGroups).forEach(([key, groupEvents]) => {
        const firstEvent = groupEvents[0];
        const lat = firstEvent.location.latitude || 0;
        const lng = firstEvent.location.longitude || 0;
        
        console.log(`添加標記: [${lng}, ${lat}] 包含 ${groupEvents.length} 個活動`);
        
        // 擴展邊界
        bounds.extend([lng, lat]);
        
        // 創建標記元素
        const markerEl = document.createElement('div');
        markerEl.className = 'flex items-center justify-center bg-green-500 rounded-full w-8 h-8 text-white text-sm font-medium shadow-md';
        markerEl.innerText = `${groupEvents.length}`;
        markerEl.style.cursor = 'pointer';
        
        // 添加標記到地圖
        const marker = new mapboxgl.Marker({ element: markerEl })
          .setLngLat([lng, lat])
          .addTo(map);
        
        // 創建彈出信息
        const popupHTML = `
          <div class="p-3">
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
        `;
        
        const popup = new mapboxgl.Popup({ offset: 25 })
          .setHTML(popupHTML);
        
        // 添加點擊事件
        marker.setPopup(popup);
        
        // 彈出框內活動點擊事件
        marker.getPopup()?.on('open', () => {
          setTimeout(() => {
            document.querySelectorAll('[data-event-id]').forEach(el => {
              el.addEventListener('click', (e) => {
                const eventId = (e.currentTarget as HTMLElement).getAttribute('data-event-id');
                if (eventId) {
                  router.push(`/events/${eventId}`);
                }
              });
            });
          }, 100);
        });
      });
      
      // 調整地圖以顯示所有標記
      if (!bounds.isEmpty()) {
        console.log("調整地圖視圖以顯示所有標記");
        map.fitBounds(bounds, {
          padding: 50,
          maxZoom: 15
        });
      }
      
      // 地圖加載完成
      map.on('load', () => {
        console.log("地圖加載完成");
        // 不再設置 mapInitialized 狀態，因為我們只初始化一次
      });
      
      // 清理函數
      return () => {
        console.log("清理地圖資源（如果地圖存在）");
        if (map && map.remove) {
          map.remove();
        }
      };
      
    } catch (err) {
      console.error("Error initializing map:", err);
      setError(`無法初始化地圖: ${err}`);
    }
  }, [events, router]);

  // 選擇特定活動
  const handleSelectEvents = (eventIds: string[]) => {
    setSelectedEventIds(eventIds);
  };

  // 渲染活動列表
  const renderEventsList = () => {
    const filteredEvents = selectedEventIds.length > 0
      ? events.filter(event => selectedEventIds.includes(event.id))
      : events;
    
    return (
      <div className="overflow-y-auto max-h-[calc(100vh-200px)]">
        {filteredEvents.map((event) => (
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
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center p-4">
        <h2 className="text-xl font-bold mb-2">發生錯誤</h2>
        <p className="text-muted-foreground mb-4">{error}</p>
        <Link href={`/event-series/${seriesId}`} className="text-primary hover:underline flex items-center gap-1">
          <ArrowLeft className="h-4 w-4" />
          返回活動系列頁面
        </Link>
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
    <div className="min-h-screen bg-background">
      {/* 頂部導航欄 */}
      <div className="bg-card border-b border-border p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href={`/event-series/${seriesId}`} className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5">
            <ArrowLeft className="h-4 w-4" />
            <span>返回 {series?.title || "活動系列"}</span>
          </Link>
          <h1 className="text-xl font-bold">{series?.title || "活動系列"} - 活動地圖</h1>
          <div className="w-24"></div> {/* 保持佈局平衡的空白元素 */}
        </div>
      </div>
      
      {/* 主要內容 - 分為地圖和列表兩欄 */}
      <div className="max-w-7xl mx-auto p-4 flex flex-col lg:flex-row gap-4">
        {/* 左側 - 活動列表 */}
        <div className="lg:w-1/4 bg-card border border-border rounded-lg overflow-hidden">
          <div className="p-4 border-b border-border">
            <h2 className="font-bold">活動列表</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {selectedEventIds.length > 0 
                ? `顯示 ${selectedEventIds.length} 個篩選活動` 
                : `共 ${events.length} 個活動`}
            </p>
          </div>
          {renderEventsList()}
        </div>
        
        {/* 右側 - 地圖區域 */}
        <div className="lg:w-3/4 h-[500px] lg:h-[calc(100vh-150px)] bg-neutral-900 rounded-lg overflow-hidden relative">
          <div id="map" className="w-full h-full"></div>
          {selectedEventIds.length > 0 && (
            <button 
              className="absolute top-4 right-4 bg-card px-3 py-1.5 text-sm rounded-full shadow-lg hover:bg-secondary/20 transition-colors z-10"
              onClick={() => setSelectedEventIds([])}
            >
              清除篩選
            </button>
          )}
        </div>
      </div>
    </div>
  );
} 
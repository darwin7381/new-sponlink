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

// 设置Mapbox访问令牌
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

    // 确保只初始化一次地图
    if (map.current || !mapContainer.current) return;

    try {
      // 初始化地图
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/dark-v11', // Luma风格的深色主题
        center: [114.1694, 22.3193], // 香港中心位置
        zoom: 11
      });

      // 地图加载完成后添加标记
      map.current.on('load', () => {
        if (!map.current) return;

        // 筛选有效的地点数据
        const validLocations = locations.filter(
          item => item.location && item.location.latitude && item.location.longitude
        );

        if (validLocations.length === 0) return;

        // 设置地图边界以显示所有标记
        const bounds = new mapboxgl.LngLatBounds();

        // 添加每个位置的标记
        validLocations.forEach((item, index) => {
          if (!map.current) return;
          if (!item.location.latitude || !item.location.longitude) return;

          // 扩展边界
          bounds.extend([item.location.longitude, item.location.latitude]);

          // 创建自定义HTML标记
          const markerEl = document.createElement('div');
          markerEl.className = 'flex items-center justify-center bg-green-500 rounded-full w-6 h-6 text-white text-xs font-medium shadow-md';
          markerEl.innerText = `${index + 1}`;
          
          // 添加悬停效果
          markerEl.style.transition = 'all 0.2s ease-in-out';
          markerEl.addEventListener('mouseenter', () => {
            markerEl.style.transform = 'scale(1.2)';
          });
          markerEl.addEventListener('mouseleave', () => {
            markerEl.style.transform = 'scale(1)';
          });

          // 创建弹出信息
          const popup = new mapboxgl.Popup({ offset: 25 })
            .setHTML(`
              <div class="p-2">
                <h3 class="font-medium text-sm">${item.title}</h3>
                <p class="text-xs text-gray-600 mt-1">
                  ${item.location.name || item.location.address || ''}
                </p>
              </div>
            `);

          // 添加标记到地图
          new mapboxgl.Marker({ element: markerEl })
            .setLngLat([item.location.longitude, item.location.latitude])
            .setPopup(popup)
            .addTo(map.current);
        });

        // 调整地图以显示所有标记
        if (!bounds.isEmpty()) {
          map.current.fitBounds(bounds, {
            padding: 50,
            maxZoom: 15
          });
        }
      });

      // 添加控制元素 (可选)
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    } catch (err) {
      console.error('Error initializing map:', err);
      setError('Failed to initialize map');
    }

    // 清理函数
    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, [locations]);

  // 错误处理
  if (error) {
    return (
      <div className={`${className} flex items-center justify-center bg-neutral-900`} style={{ width, height }}>
        <div className="text-center p-4">
          <MapPin className="h-8 w-8 text-primary/50 mx-auto mb-2" />
          <p className="text-sm font-medium text-muted-foreground">无法加载地图</p>
          <p className="text-xs text-muted-foreground mt-1">{error}</p>
        </div>
      </div>
    );
  }

  // 加载中状态
  if (!mapboxgl.accessToken) {
    return (
      <div className={`${className} flex items-center justify-center bg-neutral-900`} style={{ width, height }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="text-sm text-muted-foreground mt-2">加载地图中...</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={mapContainer} className={className} style={{ width, height }} />
  );
};

export default MapboxEventMap; 
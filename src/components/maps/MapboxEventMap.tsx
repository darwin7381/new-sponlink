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
        zoom: 11,
        attributionControl: false, // 移除Mapbox浮水印
        logoPosition: 'bottom-right' // 如果logo未移除，移到右下角
      });

      // 地图加载完成后添加标记
      map.current.on('load', () => {
        if (!map.current) return;

        // 筛选有效的地点数据
        const validLocations = locations.filter(
          item => item.location && item.location.latitude && item.location.longitude
        );

        if (validLocations.length === 0) return;

        // 计算每个位置的活动数量
        // 先按经纬度分组
        const locationGroups: Record<string, EventLocation[]> = {};
        
        validLocations.forEach(item => {
          if (!item.location.latitude || !item.location.longitude) return;
          
          // 使用经纬度四舍五入到3位小数作为键，将接近的位置分组
          const key = `${Math.round(item.location.latitude * 1000) / 1000},${Math.round(item.location.longitude * 1000) / 1000}`;
          
          if (!locationGroups[key]) {
            locationGroups[key] = [];
          }
          
          locationGroups[key].push(item);
        });

        // 设置地图边界以显示所有标记
        const bounds = new mapboxgl.LngLatBounds();
        
        // 为每个位置组添加标记
        Object.entries(locationGroups).forEach(([key, group]) => {
          if (!map.current || group.length === 0) return;
          
          const firstLocation = group[0];
          const lat = firstLocation.location.latitude || 0;
          const lng = firstLocation.location.longitude || 0;
          
          // 扩展边界
          bounds.extend([lng, lat]);
          
          // 创建自定义HTML标记
          const markerEl = document.createElement('div');
          markerEl.className = 'flex items-center justify-center bg-green-500 rounded-full w-6 h-6 text-white text-xs font-medium shadow-md';
          markerEl.innerText = `${group.length}`; // 显示该位置的活动数量
          
          // 添加悬停效果
          markerEl.style.transition = 'all 0.2s ease-in-out';
          markerEl.addEventListener('mouseenter', () => {
            markerEl.style.transform = 'scale(1.2)';
          });
          markerEl.addEventListener('mouseleave', () => {
            markerEl.style.transform = 'scale(1)';
          });
          
          // 创建弹出信息 - 如果有多个活动，显示列表
          let popupHTML = '';
          
          if (group.length === 1) {
            // 单个活动
            popupHTML = `
              <div class="p-2">
                <h3 class="font-medium text-sm">${group[0].title}</h3>
                <p class="text-xs text-gray-600 mt-1">
                  ${group[0].location.name || group[0].location.address || ''}
                </p>
              </div>
            `;
          } else {
            // 多个活动
            popupHTML = `
              <div class="p-2">
                <h3 class="font-medium text-sm">${group.length} 个活动</h3>
                <ul class="mt-1">
                  ${group.map(item => `
                    <li class="text-xs text-gray-600 mb-1">
                      ${item.title}
                    </li>
                  `).join('')}
                </ul>
              </div>
            `;
          }
          
          const popup = new mapboxgl.Popup({ offset: 25 })
            .setHTML(popupHTML);
          
          // 添加标记到地图
          new mapboxgl.Marker({ element: markerEl })
            .setLngLat([lng, lat])
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

      // 不添加控制元素
      // map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

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
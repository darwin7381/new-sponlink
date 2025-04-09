'use client';

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { Event } from "@/types/event";
import { formatLocation } from "@/utils/languageUtils";
import { Clock, MapPin } from "lucide-react";
import { getTimezoneDisplay } from "@/utils/dateUtils";
import { SaveButton } from "@/components/common/SaveButton";
import { SavedItemType } from "@/types/userPreferences";

interface HoriEventCardProps {
  event: Event;
}

export function HoriEventCard({ event }: HoriEventCardProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 只在客戶端渲染後顯示日期和時間
  if (!mounted) {
    return (
      <div className="flex h-full bg-card border rounded-lg overflow-hidden shadow-sm">
        <div className="w-32 h-32 sm:w-40 sm:h-40 bg-gray-200 dark:bg-gray-800 flex-shrink-0"></div>
        <div className="flex-1 p-4 animate-pulse">
          <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
          <div className="h-6 w-4/5 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
          <div className="h-5 w-2/5 bg-gray-200 dark:bg-gray-700 rounded mt-auto"></div>
        </div>
      </div>
    );
  }

  // 直接格式化日期，不處理時區（保留原始日期）
  const formattedDate = event.start_time ? 
    (() => {
      const eventDate = new Date(event.start_time);
      const currentYear = new Date().getFullYear();
      const eventYear = eventDate.getFullYear();
      
      // 只有當事件不在當前年份時才顯示年份
      return format(eventDate, eventYear === currentYear ? "EEE, MMM d" : "EEE, MMM d, yyyy");
    })() : 
    "Date TBD";

  // 使用更靠近原生的方法格式化時間
  const formatTimeWithTimezone = (): string => {
    if (!event.start_time) return '';
    
    try {
      const startDate = new Date(event.start_time);
      
      // 使用瀏覽器的 toLocaleTimeString 而不是自己計算，以獲得更準確的時間格式化
      const options: Intl.DateTimeFormatOptions = {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
        timeZone: event.timezone || undefined
      };
      
      // 只格式化開始時間
      let result = startDate.toLocaleTimeString('en-US', options);
      
      // 添加時區，使用共享的時區顯示邏輯
      const timezoneDisplay = getTimezoneDisplay(event.timezone);
      if (timezoneDisplay) {
        result += ` ${timezoneDisplay}`;
      }
      
      return result;
    } catch (error) {
      console.error('格式化時間錯誤:', error);
      return '';
    }
  };

  // 格式化好的時間範圍
  const timeRange = formatTimeWithTimezone();

  // 格式化地點
  const locationDisplay = event.location ? 
    (event.location.city || event.location.country ? 
      formatLocation(event.location.city, event.location.country) : 
      event.location.name) : 
    "Location TBD";

  return (
    <Link href={`/events/${event.id}`} className="block group">
      <div className="flex h-36 sm:h-44 bg-card border rounded-lg overflow-hidden hover:border-primary/50 hover:shadow-md transition-all duration-200 hover:-translate-y-1">
        {/* 左側圖片容器 - 正方形 */}
        <div className="w-32 h-full sm:w-40 relative flex-shrink-0">
          <Image 
            fill
            className="object-cover" 
            src={event.cover_image || "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1600&q=80"} 
            alt={event.title}
            sizes="(max-width: 640px) 8rem, 10rem"
          />
        </div>
        
        {/* 右側內容區域 */}
        <div className="flex-1 p-4 flex flex-col justify-between">
          {/* 顯示日期和時間在同一行 */}
          <div className="flex items-baseline gap-2 flex-wrap" suppressHydrationWarning>
            <span className="text-sm font-medium text-primary">{formattedDate}</span>
            {timeRange && (
              <>
                <span className="text-sm text-muted-foreground">•</span>
                <span className="text-sm text-muted-foreground">{timeRange}</span>
              </>
            )}
          </div>
          
          {/* 標題區域固定兩行高度 */}
          <div className="h-[calc(2*1.25rem+0.25rem)] mt-1">
            <h3 className="text-lg font-semibold leading-snug text-foreground group-hover:text-primary transition-colors line-clamp-2">
              {event.title}
            </h3>
          </div>
          
          {/* 底部地點標籤和收藏按鈕 */}
          <div className="mt-auto flex justify-between items-center">
            <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-primary/10 text-primary">
              {event.location?.location_type === 'virtual' ? (
                <>
                  <Clock className="mr-1 h-3 w-3" />
                  虛擬活動
                </>
              ) : (
                <>
                  <MapPin className="mr-1 h-3 w-3" />
                  {locationDisplay}
                </>
              )}
            </span>
            
            {/* 收藏按鈕 */}
            <div 
              onClick={(e) => e.preventDefault()} 
              className="z-10"
            >
              <SaveButton 
                itemId={event.id}
                itemType={SavedItemType.EVENT}
                metadata={{
                  title: event.title,
                  thumbnail: event.cover_image,
                  date: event.start_time
                }}
                iconOnly
                size="sm"
              />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
} 
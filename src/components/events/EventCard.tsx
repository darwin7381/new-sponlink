'use client';

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Event } from "@/types/event";
import { formatLocation } from "@/utils/languageUtils";
import { Clock } from "lucide-react";

interface EventCardProps {
  event: Event;
}

export function EventCard({ event }: EventCardProps) {
  // 直接格式化日期，不處理時區（保留原始日期）
  const formattedDate = event.start_time ? 
    format(new Date(event.start_time), "MMM d, yyyy") : 
    "Date TBD";
    
  // 獲取時區的GMT偏移量（如GMT+8）
  const getTimezoneOffset = (timezone: string | undefined): string => {
    if (!timezone) return '';
    
    // 定義常見時區的映射（固定值），避免需要計算
    const timezoneMap: Record<string, string> = {
      'Asia/Taipei': 'GMT+8',
      'Asia/Singapore': 'GMT+8',
      'Asia/Shanghai': 'GMT+8',
      'Asia/Hong_Kong': 'GMT+8',
      'Asia/Tokyo': 'GMT+9',
      'Asia/Seoul': 'GMT+9',
      'America/New_York': 'GMT-5',
      'America/Los_Angeles': 'GMT-8',
      'Europe/London': 'GMT+0',
      'Europe/Paris': 'GMT+1',
      'UTC': 'UTC'
    };
    
    // 檢查是否有預定義的映射
    if (timezone in timezoneMap) {
      return timezoneMap[timezone];
    }
    
    // 如果是 "GMT+8" 格式，直接返回
    if (timezone.startsWith('GMT')) {
      return timezone;
    }
    
    // 其他情況嘗試使用 Intl.DateTimeFormat 獲取
    try {
      const now = new Date();
      const formatter = new Intl.DateTimeFormat('en-GB', {
        timeZone: timezone,
        timeZoneName: 'longOffset'
      });
      
      const formatted = formatter.format(now);
      const match = formatted.match(/GMT[+-]\d+(?::\d+)?/);
      
      return match ? match[0] : '';
    } catch (error) {
      console.error('獲取時區偏移量錯誤:', error);
      return '';
    }
  };

  // 格式化時間，考慮原始時區
  // 由於瀏覽器無法直接用原始時間和時區顯示，我們使用輔助方法來模擬
  const formatTimeInTimezone = (dateStr: string | undefined, timezone: string | undefined): string => {
    if (!dateStr) return '';
    
    try {
      // 獲取ISO格式時間
      const date = new Date(dateStr);
      
      // 1. 從 ISO 時間中提取小時和分鐘
      const hours = date.getUTCHours();
      const minutes = date.getUTCMinutes();
      
      // 2. 根據時區調整小時
      let adjustedHours = hours;
      const tzOffset = getTimezoneOffset(timezone);
      
      if (tzOffset && tzOffset.startsWith('GMT')) {
        const offsetHours = parseInt(tzOffset.substring(3)); // 如 "GMT+8" 提取 8 或 -5
        adjustedHours = (hours + offsetHours) % 24;
        if (adjustedHours < 0) adjustedHours += 24; // 處理負數時間
      }
      
      // 3. 格式化為 "2:00 PM" 格式
      const isPM = adjustedHours >= 12;
      const hour12 = adjustedHours % 12 || 12; // 轉換為12小時制
      const paddedMinutes = minutes.toString().padStart(2, '0');
      
      return `${hour12}:${paddedMinutes} ${isPM ? 'PM' : 'AM'}`;
    } catch (error) {
      console.error('格式化時區時間錯誤:', error);
      return '';
    }
  };

  // 生成時間範圍字符串
  const formatTimeRange = (): string => {
    if (!event.start_time) return '';
    
    try {
      const startTime = formatTimeInTimezone(event.start_time, event.timezone);
      let result = startTime;
      
      if (event.end_time) {
        const endTime = formatTimeInTimezone(event.end_time, event.timezone);
        result += ` - ${endTime}`;
      }
      
      // 添加時區
      const timezone = getTimezoneOffset(event.timezone);
      if (timezone) {
        result += ` ${timezone}`;
      }
      
      return result;
    } catch (error) {
      console.error('時間範圍格式化錯誤:', error);
      return '';
    }
  };

  // 格式化好的時間範圍
  const timeRange = formatTimeRange();

  // 格式化地點
  const locationDisplay = event.location ? 
    (event.location.city || event.location.country ? 
      formatLocation(event.location.city, event.location.country) : 
      event.location.name) : 
    "Location TBD";

  return (
    <Card className="overflow-hidden h-full flex flex-col">
      <div className="h-48 w-full relative">
        <Image 
          fill
          className="object-cover" 
          src={event.cover_image || "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1600&q=80"} 
          alt={event.title}
        />
      </div>
      <CardContent className="flex-1 p-6 flex flex-col justify-between">
        <div className="flex-1">
          {/* 顯示日期 */}
          <p className="text-sm font-medium text-primary">
            <span>{formattedDate}</span>
          </p>
          
          {/* 顯示時間範圍及時區 */}
          {timeRange && (
            <p className="text-sm text-muted-foreground mt-1">
              {timeRange}
            </p>
          )}
          
          <Link href={`/events/${event.id}`} className="block mt-2">
            <h3 className="text-xl font-semibold text-foreground">{event.title}</h3>
            <p className="mt-3 text-base text-muted-foreground line-clamp-3">
              {event.description}
            </p>
          </Link>
        </div>
      </CardContent>
      <CardFooter className="px-6 pb-6 pt-0">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-primary/10 text-primary">
              {event.location?.location_type === 'virtual' ? (
                <>
                  <Clock className="mr-1 h-3 w-3" />
                  虛擬活動
                </>
              ) : locationDisplay}
            </span>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
} 
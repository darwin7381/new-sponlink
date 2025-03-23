'use client';

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Event } from "@/types/event";
import { formatLocation } from "@/utils/languageUtils";
import { Clock } from "lucide-react";
import { getTimezoneDisplay } from "@/utils/dateUtils";

interface EventCardProps {
  event: Event;
}

export function EventCard({ event }: EventCardProps) {
  // 直接格式化日期，不處理時區（保留原始日期）
  const formattedDate = event.start_time ? 
    format(new Date(event.start_time), "MMM d, yyyy") : 
    "Date TBD";

  // 使用更靠近原生的方法格式化時間
  const formatTimeWithTimezone = (): string => {
    if (!event.start_time) return '';
    
    try {
      const startDate = new Date(event.start_time);
      const endDate = event.end_time ? new Date(event.end_time) : null;
      
      // 使用瀏覽器的 toLocaleTimeString 而不是自己計算，以獲得更準確的時間格式化
      const options: Intl.DateTimeFormatOptions = {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
        timeZone: event.timezone || undefined
      };
      
      // 格式化開始時間
      let result = startDate.toLocaleTimeString('en-US', options);
      
      // 添加結束時間（如果有）
      if (endDate) {
        result += ` - ${endDate.toLocaleTimeString('en-US', options)}`;
      }
      
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
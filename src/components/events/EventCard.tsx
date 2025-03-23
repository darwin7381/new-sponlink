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
  // Format date for display
  const formattedDate = event.start_time ? 
    format(new Date(event.start_time), "MMM d, yyyy") : 
    "Date TBD";
    
  // 獲取時區偏移，使用人性化的時區縮寫
  const getTimezoneDisplay = (timezone: string | undefined): string => {
    if (!timezone) return '';
    try {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        timeZone: timezone,
        timeZoneName: 'short'
      };
      // 使用en-US來獲取標準化的時區縮寫（如EDT、PDT等）
      const timeString = new Intl.DateTimeFormat('en-US', options).format(now);
      
      // 提取時區縮寫，例如從 "5/24/2023, 8:00 AM EDT" 提取 "EDT"
      const tzMatch = timeString.match(/[A-Z]{3,4}$/);
      if (tzMatch) {
        return tzMatch[0]; // 返回時區縮寫，如 "EDT"
      }
      
      // 如果沒有找到標準縮寫，嘗試獲取GMT偏移
      const gmtMatch = timeString.match(/GMT[+-]\d+/);
      return gmtMatch ? gmtMatch[0] : '';
    } catch (error) {
      console.error('獲取時區顯示錯誤:', error);
      return '';
    }
  };

  // 顯示人性化的時區格式
  const timezoneDisplay = event.timezone ? getTimezoneDisplay(event.timezone) : '';

  // 格式化地點，標準格式顯示
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
          <p className="text-sm font-medium text-primary">
            <span>{formattedDate}</span>
            {event.timezone && timezoneDisplay && (
              <span className="ml-1 text-xs text-muted-foreground">{timezoneDisplay}</span>
            )}
          </p>
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
'use client';

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { MapPin, Calendar, Users } from "lucide-react";
import { EventSeries } from "@/types/event";

interface EventSeriesCardProps {
  series: EventSeries;
}

export function EventSeriesCard({ series }: EventSeriesCardProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 只在客户端渲染后显示日期和时间
  if (!mounted) {
    return (
      <div className="overflow-hidden h-full rounded-lg border bg-card text-card-foreground shadow-sm">
        <div className="h-40 w-full relative bg-gray-200 dark:bg-gray-800"></div>
        <div className="p-4 animate-pulse">
          <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
          <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
          <div className="h-6 w-full bg-gray-200 dark:bg-gray-700 rounded mb-3"></div>
          <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
        </div>
      </div>
    );
  }

  // 格式化日期
  const formattedStartDate = series.start_time ? 
    format(new Date(series.start_time), "MMM d, yyyy") : 
    "TBD";
  
  const formattedEndDate = series.end_time ? 
    format(new Date(series.end_time), "MMM d, yyyy") : 
    "TBD";

  // 日期范围显示
  const dateRange = `${formattedStartDate} - ${formattedEndDate}`;

  return (
    <Link href={`/event-series/${series.id}`} className="block group">
      <div className="overflow-hidden h-full rounded-lg border bg-card text-card-foreground shadow-sm hover:border-primary/50 hover:shadow-md transition-all duration-200 hover:-translate-y-1">
        {/* 圖片容器 - 確保與卡片邊緣完全貼合 */}
        <div className="relative w-full h-40 overflow-hidden">
          <Image 
            fill
            className="object-cover" 
            src={series.cover_image || "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1600&q=80"} 
            alt={series.title}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60"></div>
          <div className="absolute bottom-3 left-3 text-white text-sm font-medium px-2 py-1 bg-primary/80 rounded-full">
            {series.series_type.replace('_', ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
          </div>
        </div>
        
        <div className="p-4">
          <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2 min-h-[3.5rem]">
            {series.title}
          </h3>
          
          <div className="flex items-center mt-4 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
            <span suppressHydrationWarning className="truncate">{dateRange}</span>
          </div>
          
          <div className="flex items-center mt-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
            <span className="truncate">{series.locations.join(', ')}</span>
          </div>
          
          <div className="flex items-center mt-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4 mr-2 flex-shrink-0" />
            <span>{series.event_ids.length} 場活動</span>
          </div>
          
          <div className="mt-4 text-xs text-muted-foreground line-clamp-2 h-9">
            {series.description}
          </div>
        </div>
      </div>
    </Link>
  );
} 
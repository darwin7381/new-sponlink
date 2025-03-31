'use client';

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { EventSeries } from "@/types/event";
import { MapPin, Calendar, Users } from "lucide-react";

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
      <Card className="overflow-hidden h-full flex flex-col">
        <div className="h-48 w-full relative bg-gray-200 dark:bg-gray-800"></div>
        <CardContent className="flex-1 p-6 flex flex-col justify-between animate-pulse">
          <div className="flex-1">
            <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
            <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
            <div className="h-6 w-full bg-gray-200 dark:bg-gray-700 rounded mb-3"></div>
            <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
            <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </CardContent>
        <CardFooter className="px-6 pb-6 pt-0">
          <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </CardFooter>
      </Card>
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
    <Card className="overflow-hidden h-full flex flex-col border-2 hover:border-primary transition-colors">
      <div className="h-48 w-full relative">
        <Image 
          fill
          className="object-cover" 
          src={series.cover_image || "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1600&q=80"} 
          alt={series.title}
        />
        <div className="absolute top-0 left-0 bg-primary text-primary-foreground px-3 py-1 text-sm font-medium">
          {series.series_type.replace('_', ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
        </div>
      </div>
      <CardContent className="flex-1 p-6 flex flex-col justify-between">
        <div className="flex-1">
          <Link href={`/event-series/${series.id}`} className="block mt-2">
            <h3 className="text-xl font-semibold text-foreground hover:text-primary transition-colors">{series.title}</h3>
            <p className="mt-3 text-base text-muted-foreground line-clamp-3">
              {series.description}
            </p>
          </Link>
          <div className="flex items-center mt-4 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4 mr-2" />
            <span suppressHydrationWarning>{dateRange}</span>
          </div>
          <div className="flex items-center mt-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 mr-2" />
            <span>{series.locations.join(', ')}</span>
          </div>
          <div className="flex items-center mt-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4 mr-2" />
            <span>{series.event_ids.length} 活動</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="px-6 pb-6 pt-0">
        <Link 
          href={`/event-series/${series.id}`} 
          className="inline-flex items-center justify-center rounded-md text-sm font-medium text-primary hover:bg-primary/10 h-9 px-4 py-2"
        >
          查看系列活動 →
        </Link>
      </CardFooter>
    </Card>
  );
} 
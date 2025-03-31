'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { EventSeries } from "@/types/event";
import { EventSeriesCard } from "@/components/events/EventSeriesCard";

interface FeaturedEventSeriesProps {
  series: EventSeries[];
}

export function FeaturedEventSeries({ series }: FeaturedEventSeriesProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 在服务端渲染时显示占位内容
  if (!mounted) {
    return (
      <div className="py-12 bg-secondary/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-foreground dark:text-foreground sm:text-4xl">活動系列</h2>
            <p className="mt-3 max-w-2xl mx-auto text-xl text-muted-foreground dark:text-muted-foreground sm:mt-4">
              探索精選的活動系列，參與多場相關活動獲得更完整的體驗。
            </p>
          </div>
          <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* 骨架屏占位 */}
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-96 bg-gray-100 dark:bg-neutral-800 rounded-lg animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!series || series.length === 0) {
    return null;
  }

  return (
    <div className="py-12 bg-secondary/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-foreground dark:text-foreground sm:text-4xl">活動系列</h2>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-muted-foreground dark:text-muted-foreground sm:mt-4">
            探索精選的活動系列，參與多場相關活動獲得更完整的體驗。
          </p>
        </div>
        <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {series.map((eventSeries) => (
            <EventSeriesCard key={eventSeries.id} series={eventSeries} />
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link href="/event-series" className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-primary-foreground bg-primary hover:bg-primary/90">
            查看所有活動系列
          </Link>
        </div>
      </div>
    </div>
  );
} 
'use client';

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Event } from "@/types/event";
import { HoriEventCard } from "@/components/events/HoriEventCard";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface FeaturedHoriEventsProps {
  events: Event[];
}

export function FeaturedHoriEvents({ events }: FeaturedHoriEventsProps) {
  const [mounted, setMounted] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 處理滾動
  const scrollLeft = () => {
    if (!containerRef.current) return;
    const scrollWidth = containerRef.current.clientWidth * 0.85;
    const newPosition = Math.max(0, scrollPosition - scrollWidth);
    containerRef.current.scrollTo({ left: newPosition, behavior: 'smooth' });
    setScrollPosition(newPosition);
  };

  const scrollRight = () => {
    if (!containerRef.current) return;
    const scrollWidth = containerRef.current.clientWidth * 0.85;
    const maxScroll = containerRef.current.scrollWidth - containerRef.current.clientWidth;
    const newPosition = Math.min(maxScroll, scrollPosition + scrollWidth);
    containerRef.current.scrollTo({ left: newPosition, behavior: 'smooth' });
    setScrollPosition(newPosition);
  };

  // 在服務端渲染時顯示占位內容
  if (!mounted) {
    return (
      <div className="py-12 bg-background/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-foreground sm:text-4xl">Upcoming Events</h2>
            <p className="mt-3 max-w-2xl mx-auto text-xl text-muted-foreground sm:mt-4">
              Explore more event opportunities with our simple browsing format.
            </p>
          </div>
          <div className="mt-10 h-48 bg-gray-100 dark:bg-neutral-800 rounded-lg animate-pulse"></div>
        </div>
      </div>
    );
  }

  // 如果沒有事件
  if (events.length === 0) {
    return null;
  }

  return (
    <div className="py-12 bg-background/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-foreground sm:text-4xl">Upcoming Events</h2>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-muted-foreground sm:mt-4">
            Explore more event opportunities with our simple browsing format.
          </p>
        </div>
        
        {/* 滾動容器 */}
        <div className="mt-10 relative">
          {/* 左滾動按鈕 */}
          <button 
            onClick={scrollLeft}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-background/80 hover:bg-background rounded-full p-2 shadow-md border border-border"
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-6 w-6 text-foreground" />
          </button>
          
          {/* 橫向滾動容器 */}
          <div 
            ref={containerRef}
            className="flex overflow-x-auto scrollbar-hide gap-4 pb-4 snap-x snap-mandatory scroll-smooth max-w-full"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {events.map((event) => (
              <div 
                key={event.id} 
                className="flex-none w-full sm:w-[calc(70%-1rem)] lg:w-[38%] snap-start"
                style={{ minWidth: "38%" }}
              >
                <HoriEventCard event={event} />
              </div>
            ))}
          </div>
          
          {/* 右滾動按鈕 */}
          <button 
            onClick={scrollRight}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-background/80 hover:bg-background rounded-full p-2 shadow-md border border-border"
            aria-label="Scroll right"
          >
            <ChevronRight className="h-6 w-6 text-foreground" />
          </button>
        </div>
        
        <div className="mt-10 text-center">
          <Link href="/events" className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-primary-foreground bg-primary hover:bg-primary/90">
            View All Events
          </Link>
        </div>
      </div>
    </div>
  );
} 
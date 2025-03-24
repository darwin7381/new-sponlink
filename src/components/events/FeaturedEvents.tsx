'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { Event } from "@/types/event";
import { EventCard } from "@/components/events/EventCard";

interface FeaturedEventsProps {
  events: Event[];
}

export function FeaturedEvents({ events }: FeaturedEventsProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 在服務端渲染時顯示占位內容
  if (!mounted) {
    return (
      <div className="py-12 bg-background dark:bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-foreground dark:text-foreground sm:text-4xl">Featured Events</h2>
            <p className="mt-3 max-w-2xl mx-auto text-xl text-muted-foreground dark:text-muted-foreground sm:mt-4">
              Discover upcoming events looking for sponsors.
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

  return (
    <div className="py-12 bg-background dark:bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-foreground dark:text-foreground sm:text-4xl">Featured Events</h2>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-muted-foreground dark:text-muted-foreground sm:mt-4">
            Discover upcoming events looking for sponsors.
          </p>
        </div>
        <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
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
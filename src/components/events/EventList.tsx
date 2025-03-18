'use client';

import React from "react";
import { EventCard } from "./EventCard";
import { Event } from "@/lib/types/events";
import { Skeleton } from "@/components/ui/skeleton";

interface EventListProps {
  events: Event[];
  isLoading?: boolean;
}

export default function EventList({ events, isLoading = false }: EventListProps) {
  if (isLoading) {
    return (
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="space-y-3">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <div className="flex justify-between pt-2">
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-8 w-24" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!events || events.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-foreground">沒有找到活動</h3>
        <p className="mt-2 text-sm text-muted-foreground">請稍後再試或調整您的搜索條件。</p>
      </div>
    );
  }

  return (
    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
      {events.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
} 
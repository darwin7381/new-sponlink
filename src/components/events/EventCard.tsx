'use client';

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Event } from "@/types/event";
import { formatLocation } from "@/utils/languageUtils";

interface EventCardProps {
  event: Event;
}

export function EventCard({ event }: EventCardProps) {
  // Format date for display
  const formattedDate = event.start_time ? 
    format(new Date(event.start_time), "MMM d, yyyy") : 
    "Date TBD";

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
              {locationDisplay}
            </span>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
} 
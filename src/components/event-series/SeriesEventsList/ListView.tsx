'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { format, isSameDay } from 'date-fns';
import { MapPin } from 'lucide-react';
import { Event } from '@/types/event';

interface ListViewProps {
  events: Event[];
}

const ListView: React.FC<ListViewProps> = ({ events }) => {
  // 將事件按日期分組
  const groupEventsByDate = () => {
    const groupedEvents: Record<string, Event[]> = {};
    
    events.forEach(event => {
      if (!event.start_time) return;
      
      const dateKey = format(new Date(event.start_time), "yyyy-MM-dd");
      if (!groupedEvents[dateKey]) {
        groupedEvents[dateKey] = [];
      }
      groupedEvents[dateKey].push(event);
    });
    
    // 排序日期
    return Object.keys(groupedEvents)
      .sort()
      .map(dateKey => ({
        date: new Date(dateKey),
        events: groupedEvents[dateKey]
      }));
  };

  // 獲取日期和星期分開顯示
  const getDateDisplay = (date: Date): { date: string, weekday: string } => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    let dateText;
    let weekdayText;
    
    if (isSameDay(date, today)) {
      dateText = 'Today';
      weekdayText = format(date, 'EEEE');
    } else if (isSameDay(date, tomorrow)) {
      dateText = 'Tomorrow';
      weekdayText = format(date, 'EEEE');
    } else if (isSameDay(date, yesterday)) {
      dateText = 'Yesterday';
      weekdayText = format(date, 'EEEE');
    } else {
      dateText = `${format(date, 'MMM d')}`;
      weekdayText = format(date, 'EEEE');
    }
    
    return { date: dateText, weekday: weekdayText };
  };

  const eventsByDate = groupEventsByDate();

  return (
    <div className="space-y-8">
      {eventsByDate.map((group) => (
        <div key={format(group.date, "yyyy-MM-dd")}>
          {/* 日期标题与分隔线 */}
          <div className="mb-3">
            <h3 className="text-sm font-medium mb-2">
              {(() => {
                const { date, weekday } = getDateDisplay(group.date);
                return (
                  <>
                    {date} <span className="text-muted-foreground">{weekday}</span>
                  </>
                );
              })()}
            </h3>
            <div className="h-px bg-border w-full"></div>
          </div>
          
          {/* 当日活动列表 */}
          <div className="space-y-2">
            {group.events.map(event => (
              <Link key={event.id} href={`/events/${event.id}`} className="block group">
                <div className="px-3 py-3 hover:bg-secondary/5 transition-colors rounded-md flex gap-3 items-start">
                  <div className="text-xs text-muted-foreground w-16 flex-shrink-0 pt-1">
                    {event.start_time ? format(new Date(event.start_time), "h:mm a") : ""}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-medium mb-1 group-hover:text-primary transition-colors line-clamp-1">
                        {event.title}
                      </h3>
                      
                      {event.cover_image && (
                        <div className="w-12 h-12 relative overflow-hidden rounded-md flex-shrink-0">
                          <Image 
                            src={event.cover_image}
                            alt={event.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {event.organizer && (
                        <span>By {event.organizer}</span>
                      )}
                      
                      {event.location && (
                        <div className="flex items-center">
                          <span className="mx-1">•</span>
                          <MapPin className="h-3 w-3 mr-0.5" />
                          <span className="truncate max-w-[150px]">
                            {event.location.name || "Location TBD"}
                          </span>
                        </div>
                      )}
                      
                      {event.attendees_count !== undefined && (
                        <div className="flex items-center">
                          <span className="mx-1">•</span>
                          <span>{event.attendees_count} attending</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ListView; 
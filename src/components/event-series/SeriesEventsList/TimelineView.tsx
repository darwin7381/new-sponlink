'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { format, isSameDay } from 'date-fns';
import { MapPin, Users } from 'lucide-react';
import { Event, EventStatus } from '@/types/event';
import { Badge } from '@/components/ui/badge';

interface TimelineViewProps {
  events: Event[];
}

const TimelineView: React.FC<TimelineViewProps> = ({ events }) => {
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
    <div className="relative pb-12 mt-4">
      {/* 创建一个连续的垂直时间线 */}
      <div className="absolute left-4 top-0 bottom-0 w-[2px] bg-border h-full"></div>
      
      {eventsByDate.map((group) => (
        <div key={format(group.date, "yyyy-MM-dd")} className="relative mb-10">
          {/* 日期标记和圆点 */}
          <div className="flex items-center sticky top-[72px] z-20 py-2 bg-background/95 backdrop-blur-sm">
            {/* 圆点: 确保完美居中在线上 */}
            <div className="h-4 w-4 rounded-full bg-primary border-2 border-background absolute left-4 transform -translate-x-1/2"></div>
            <h3 className="text-sm font-medium ml-8">
              {(() => {
                const { date, weekday } = getDateDisplay(group.date);
                return (
                  <>
                    {date} <span className="text-muted-foreground">{weekday}</span>
                  </>
                );
              })()}
            </h3>
          </div>
          
          {/* 事件卡片列表 */}
          <div className="mt-4 ml-8 space-y-3">
            {group.events.map((event) => (
              <Link key={event.id} href={`/events/${event.id}`} className="block group">
                <div className="bg-card border border-border hover:border-primary/30 transition-all rounded-md overflow-hidden">
                  <div className="flex flex-col md:flex-row">
                    {/* 主要内容区 */}
                    <div className="p-4 md:p-5 flex-1 min-w-0">
                      <div className="text-sm text-muted-foreground mb-1.5">
                        {event.start_time ? format(new Date(event.start_time), "h:mm a") : ""}
                      </div>
                      
                      <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors line-clamp-2">
                        {event.title}
                      </h3>
                      
                      {/* 组织者和地点信息 */}
                      <div className="flex flex-col gap-1.5 text-sm text-muted-foreground">
                        {event.organizer && (
                          <div className="flex items-center">
                            <span className="text-foreground/80">By {event.organizer}</span>
                          </div>
                        )}
                        
                        {event.location && (
                          <div className="flex items-center">
                            <MapPin className="h-3.5 w-3.5 mr-1.5 flex-shrink-0 text-muted-foreground" />
                            <span className="truncate max-w-full">
                              {event.location.location_type === "virtual" ? "Virtual Event" : 
                              event.location.name || event.location.address || "Location TBD"}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* 右侧图片 */}
                    {event.cover_image && (
                      <div className="w-full md:w-28 h-32 md:h-auto relative overflow-hidden flex-shrink-0 border-t md:border-t-0 md:border-l border-border">
                        <Image 
                          src={event.cover_image}
                          alt={event.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>
                    )}
                  </div>
                  
                  {/* 底部信息栏 */}
                  {(event.attendees_count !== undefined || event.tags?.length > 0) && (
                    <div className="px-4 py-2 bg-secondary/5 border-t border-border flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        {event.attendees_count !== undefined && (
                          <div className="flex items-center text-muted-foreground">
                            <Users className="h-3.5 w-3.5 mr-1" />
                            <span>{event.attendees_count}</span>
                          </div>
                        )}
                        
                        {/* 标签 */}
                        {event.tags && event.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {event.tags.slice(0, 2).map(tag => (
                              <Badge key={tag} variant="outline" className="text-xs px-1.5 py-0 bg-transparent border-border text-muted-foreground">
                                {tag}
                              </Badge>
                            ))}
                            {event.tags.length > 2 && (
                              <span className="text-xs text-muted-foreground">+{event.tags.length - 2}</span>
                            )}
                          </div>
                        )}
                      </div>
                      
                      {event.status === EventStatus.PUBLISHED && (
                        <Badge variant="secondary" className="text-[10px] px-1 py-0 bg-green-900/20 text-green-400 border-0">
                          Published
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default TimelineView; 
"use client";

import { useState, useEffect } from "react";
import { format } from 'date-fns';
import Link from 'next/link';
import { EventSeries, Event } from "@/types/event";
import { getEventSeriesById, getEventsInSeries, getMainEventInSeries } from "@/services/eventSeriesService";

// 導入拆分後的組件
import SeriesBanner from '@/components/event-series/SeriesBanner';
import SeriesInfo from '@/components/event-series/SeriesInfo';
import SeriesEventsList from '@/components/event-series/SeriesEventsList';
import EventCalendarPanel from '@/components/event-series/EventCalendarPanel';
import LoadingState from '@/components/event-series/LoadingState';
import NotFoundState from '@/components/event-series/NotFoundState';

interface EventSeriesPageProps {
  params: Promise<{ id: string }>
}

export default function EventSeriesPage({ params }: EventSeriesPageProps) {
  const [seriesId, setSeriesId] = useState<string>("");
  const [series, setSeries] = useState<EventSeries | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [mainEvent, setMainEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [viewMode, setViewMode] = useState<"timeline" | "list">("timeline");
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [showMode, setShowMode] = useState<"upcoming" | "past">("upcoming");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [filteredEventIds, setFilteredEventIds] = useState<string[]>([]);

  const subscribeText = "Subscribe";
  const subscribedText = "Subscribed";

  // 解析参数
  useEffect(() => {
    const resolveParams = async () => {
      try {
        const resolvedParams = await params;
        const id = resolvedParams.id;
        setSeriesId(id);
      } catch (error) {
        console.error("Error resolving params:", error);
      }
    };
    
    resolveParams();
  }, [params]);

  useEffect(() => {
    const fetchData = async () => {
      if (!seriesId) return;
      
      try {
        setLoading(true);
        const seriesData = await getEventSeriesById(seriesId);
        if (seriesData) {
          setSeries(seriesData);
          
          // 获取系列中的所有活动
          const eventsData = await getEventsInSeries(seriesData.id);
          setEvents(eventsData as Event[]);

          // 收集所有標籤
          const tags = new Set<string>();
          eventsData.forEach((event: Event) => {
            if (event.tags) {
              event.tags.forEach(tag => tags.add(tag));
            }
          });
          setAllTags(Array.from(tags));
          
          // 获取主要活动
          if (seriesData.main_event_id) {
            const mainEventData = await getMainEventInSeries(seriesData.id);
            setMainEvent(mainEventData);
          }
        }
      } catch (error) {
        console.error('Error fetching event series data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [seriesId]);

  const handleSubscribe = () => {
    setIsSubscribed(!isSubscribed);
  };

  const handlePrevMonth = () => {
    setCurrentMonth(prevMonth => {
      const newDate = new Date(prevMonth);
      newDate.setMonth(newDate.getMonth() - 1);
      return newDate;
    });
    setSelectedDate(null);
    // 重置篩選
    setFilteredEventIds([]);
  };

  const handleNextMonth = () => {
    setCurrentMonth(prevMonth => {
      const newDate = new Date(prevMonth);
      newDate.setMonth(newDate.getMonth() + 1);
      return newDate;
    });
    setSelectedDate(null);
    // 重置篩選
    setFilteredEventIds([]);
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prevTags => {
      if (prevTags.includes(tag)) {
        return prevTags.filter(t => t !== tag);
      } else {
        return [...prevTags, tag];
      }
    });
    // 重置事件 ID 篩選
    setFilteredEventIds([]);
  };

  // 清除日期過濾
  const clearDateFilter = () => {
    setSelectedDate(null);
    // 重置事件 ID 篩選
    setFilteredEventIds([]);
  };

  // 按事件 ID 篩選事件
  const filterByEventIds = (eventIds: string[]) => {
    setFilteredEventIds(eventIds);
    // 清除日期和標籤篩選
    setSelectedDate(null);
    setSelectedTags([]);
  };

  // 清除所有篩選
  const clearAllFilters = () => {
    setSelectedDate(null);
    setSelectedTags([]);
    setFilteredEventIds([]);
    setSearchQuery("");
  };

  // 過濾活動
  const filteredEvents = events.filter(event => {
    // 如果有篩選的事件ID，則只顯示這些ID的事件
    if (filteredEventIds.length > 0) {
      return filteredEventIds.includes(event.id);
    }
    
    // 首先按照標簽過濾
    const passesTagFilter = selectedTags.length === 0 || 
      (event.tags && event.tags.some(tag => selectedTags.includes(tag)));
    
    // 然後按照日期過濾 (即將到來/過去)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const eventDate = event.start_time ? new Date(event.start_time) : null;
    if (!eventDate) return false;
    
    const isUpcoming = eventDate >= today;
    const isPast = eventDate < today;
    
    // 如果選擇了特定日期，則只顯示該日期的事件
    const passesSelectedDateFilter = selectedDate ? 
      format(eventDate, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd') : 
      true;
    
    // 添加搜尋過濾
    const matchesSearch = searchQuery === "" || 
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (event.description && event.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (event.organizer && event.organizer.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return passesTagFilter && passesSelectedDateFilter && matchesSearch && (
      (showMode === "upcoming" && isUpcoming) ||
      (showMode === "past" && isPast)
    );
  });

  // 生成日曆格子
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    // 獲取當月第一天
    const firstDay = new Date(year, month, 1);
    // 獲取當月最後一天
    const lastDay = new Date(year, month + 1, 0);
    
    // 第一天是星期幾 (0-6, 0 = 星期日)
    const firstDayIndex = firstDay.getDay();
    // 本月有多少天
    const daysInMonth = lastDay.getDate();
    
    // 創建日曆格子
    const days = [];
    
    // 週日至週六的標題
    const weekdays = ["日", "一", "二", "三", "四", "五", "六"];
    for (let i = 0; i < 7; i++) {
      days.push(
        <div key={`header-${i}`} className="p-2 text-center font-medium text-sm text-muted-foreground">
          {weekdays[i]}
        </div>
      );
    }
    
    // 上個月的補充天數
    for (let i = 0; i < firstDayIndex; i++) {
      days.push(
        <div key={`prev-${i}`} className="h-24 p-1 text-muted-foreground opacity-40 border">
          <span className="text-xs">{new Date(year, month, -firstDayIndex + i + 1).getDate()}</span>
        </div>
      );
    }
    
    // 當月的天數
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      // 查找這一天有哪些活動
      const dayEvents = filteredEvents.filter(event => {
        if (!event.start_time) return false;
        const eventDate = new Date(event.start_time);
        return (
          eventDate.getDate() === i &&
          eventDate.getMonth() === month &&
          eventDate.getFullYear() === year
        );
      });
      
      const isToday = new Date().getDate() === i && 
                      new Date().getMonth() === month && 
                      new Date().getFullYear() === year;
      
      days.push(
        <div 
          key={`day-${i}`} 
          className={`h-24 p-1 border relative
            ${isToday ? 'bg-primary/5' : ''} 
            ${dayEvents.length > 0 ? 'hover:bg-secondary/20' : ''}
            transition-colors`
          }
        >
          <div className={`text-sm mb-1 font-medium ${isToday ? 'text-primary' : ''}`}>
            {i}
          </div>
          
          <div className="space-y-1 max-h-[75px] overflow-y-auto">
            {dayEvents.map((event) => (
              <Link key={event.id} href={`/events/${event.id}`} className="block">
                <div className="text-xs p-1 rounded truncate bg-primary-foreground hover:bg-primary/10 transition-colors">
                  {event.start_time ? format(new Date(event.start_time), "HH:mm") : ""} {event.title}
                </div>
              </Link>
            ))}
          </div>
          
          {dayEvents.length > 3 && (
            <div className="absolute bottom-1 right-1 text-xs text-muted-foreground bg-background/80 rounded-full px-1.5">
              +{dayEvents.length - 3}
            </div>
          )}
        </div>
      );
    }
    
    // 計算需要補充的下個月天數，使總數為 7 的倍數
    const remainingDays = 7 - (days.length % 7);
    if (remainingDays < 7) {
      for (let i = 1; i <= remainingDays; i++) {
        days.push(
          <div key={`next-${i}`} className="h-24 p-1 text-muted-foreground opacity-40 border">
            <span className="text-xs">{i}</span>
          </div>
        );
      }
    }
    
    return days;
  };

  // 分組事件按日期
  const groupEventsByDate = () => {
    const groupedEvents: Record<string, Event[]> = {};
    filteredEvents.forEach(event => {
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

  // 獲取相對日期顯示
  const getRelativeDateDisplay = (date: Date): string => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (format(date, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')) {
      return 'Today';
    } else if (format(date, 'yyyy-MM-dd') === format(tomorrow, 'yyyy-MM-dd')) {
      return 'Tomorrow';
    } else if (format(date, 'yyyy-MM-dd') === format(yesterday, 'yyyy-MM-dd')) {
      return 'Yesterday';
    }
    
    // 使用英文格式 May 15
    return `${format(date, 'MMM d')}`;
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
    
    if (format(date, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')) {
      dateText = 'Today';
      weekdayText = format(date, 'EEEE');
    } else if (format(date, 'yyyy-MM-dd') === format(tomorrow, 'yyyy-MM-dd')) {
      dateText = 'Tomorrow';
      weekdayText = format(date, 'EEEE');
    } else if (format(date, 'yyyy-MM-dd') === format(yesterday, 'yyyy-MM-dd')) {
      dateText = 'Yesterday';
      weekdayText = format(date, 'EEEE');
    } else {
      dateText = `${format(date, 'MMM d')}`;
      weekdayText = format(date, 'EEEE');
    }
    
    return { date: dateText, weekday: weekdayText };
  };

  const eventsByDate = groupEventsByDate();

  if (loading) {
    return <LoadingState />;
  }

  if (!series) {
    return <NotFoundState />;
  }

  return (
    <div className="bg-background min-h-screen">
      {/* 頂部橫幅 */}
      <SeriesBanner series={series} />
      
      <div className="max-w-6xl mx-auto px-4 -mt-20 relative z-10 pb-24">
        {/* 事件系列信息 */}
        <SeriesInfo series={series} />
        
        {/* 主要內容區域 - 使用flex布局確保左右列正確對齊 */}
        <div className="flex flex-col md:flex-row gap-8">
          {/* 左側活動列表 */}
          <SeriesEventsList 
            events={filteredEvents} 
            allTags={allTags}
            selectedTags={selectedTags}
            selectedDate={selectedDate}
            toggleTag={toggleTag}
            clearDateFilter={clearDateFilter}
          />
          
          {/* 右側邊欄 */}
          <EventCalendarPanel 
            events={events}
            currentMonth={currentMonth}
            selectedDate={selectedDate}
            showMode={showMode}
            handlePrevMonth={handlePrevMonth}
            handleNextMonth={handleNextMonth}
            setSelectedDate={setSelectedDate}
            setShowMode={setShowMode}
            seriesId={seriesId}
            onFilterByEventIds={filterByEventIds}
          />
        </div>
      </div>
    </div>
  );
} 
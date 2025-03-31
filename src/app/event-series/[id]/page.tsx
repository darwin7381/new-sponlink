"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { format, parseISO, isAfter, isBefore, isSameDay, addMonths, subMonths } from 'date-fns';
import { zhTW } from "date-fns/locale";
import { 
  Calendar, Clock, MapPin, Tag, Users, Check, Plus, Grid, 
  List, Calendar as CalendarIcon, ChevronLeft, ChevronRight, 
  User, Filter, Instagram, Twitter, Globe, ExternalLink, X,
  Search, AlignJustify
} from "lucide-react";
import { getEventSeriesById, getEventsInSeries, getMainEventInSeries } from "@/services/eventSeriesService";
import { EventSeries, Event } from "@/types/event";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EventStatus } from "@/types/event";
import MapboxEventMap from '@/components/maps/MapboxEventMap';

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
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() - 1);
    setCurrentMonth(newDate);
    setSelectedDate(null);
  };

  const handleNextMonth = () => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() + 1);
    setCurrentMonth(newDate);
    setSelectedDate(null);
  };

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  // 清除日期過濾
  const clearDateFilter = () => {
    setSelectedDate(null);
  };

  // 過濾活動
  const filteredEvents = events.filter(event => {
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
    return (
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="h-64 w-full bg-secondary/20 animate-pulse rounded-xl mb-8"></div>
        <div className="h-32 w-1/2 bg-secondary/20 animate-pulse rounded-xl mb-12"></div>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 w-full bg-secondary/20 animate-pulse rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!series) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12 text-center">
        <h1 className="text-3xl font-bold text-foreground">Event Series Not Found</h1>
        <p className="mt-4 text-muted-foreground">
          The event series you requested doesn&apos;t exist or has been removed.
        </p>
        <Link href="/event-series">
          <Button className="mt-8">Back to Event Series</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen">
      {/* Hero Banner */}
      <div className="relative w-full h-80 sm:h-96">
        <Image
          src={series.cover_image || "https://placehold.co/1200x400/333/FFF"}
          alt={series.title}
          className="object-cover object-center brightness-75"
          fill
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent"></div>
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-20 relative z-10 pb-24">
        {/* 系列信息卡 */}
        <div className="bg-card shadow-lg rounded-xl overflow-hidden mb-10">
          <div className="p-6 sm:p-8">
            <div className="flex flex-col md:flex-row md:items-start gap-6 mb-6">
              <div className="w-24 h-24 bg-primary/10 rounded-xl relative overflow-hidden flex-shrink-0 border-4 border-card shadow-md">
                <Image 
                  src={series.cover_image || "https://placehold.co/200x200/333/FFF"}
                  alt={series.title}
                  className="object-cover"
                  fill
                />
              </div>
              
              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                  <h1 className="text-3xl md:text-4xl font-bold">{series.title}</h1>
                  
                  <div className="flex gap-2">
                    <Button 
                      onClick={handleSubscribe}
                      variant={isSubscribed ? "outline" : "default"}
                      className={`rounded-full ${isSubscribed ? "bg-primary/10 border-primary/20 text-primary hover:bg-primary/20" : ""}`}
                    >
                      {isSubscribed ? (
                        <>
                          <Check className="mr-2 h-4 w-4" />
                          {subscribedText}
                        </>
                      ) : subscribeText}
                    </Button>
                  </div>
                </div>
                
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-muted-foreground text-sm mb-6">
                  {series.start_time && (
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>
                        {format(new Date(series.start_time), "yyyy年MM月dd日", { locale: zhTW })}
                        {series.end_time && ` — ${format(new Date(series.end_time), "yyyy年MM月dd日", { locale: zhTW })}`}
                      </span>
                    </div>
                  )}
                  
                  {series.locations && series.locations.length > 0 && (
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span>{series.locations.join(', ')}</span>
                    </div>
                  )}
                  
                  {series.organizer && (
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-2" />
                      <span>{series.organizer}</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-1.5 mb-6">
                  {series.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="bg-secondary hover:bg-secondary/80">
                      {tag}
                    </Badge>
                  ))}
                </div>
                
                <div className="mt-4 flex items-center gap-3">
                  {series.website && (
                    <a href={series.website} target="_blank" rel="noopener noreferrer" 
                      className="text-muted-foreground hover:text-primary">
                      <Globe className="h-5 w-5" />
                    </a>
                  )}
                  {series.twitter && (
                    <a href={`https://twitter.com/${series.twitter}`} target="_blank" rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-primary">
                      <Twitter className="h-5 w-5" />
                    </a>
                  )}
                  {series.instagram && (
                    <a href={`https://instagram.com/${series.instagram}`} target="_blank" rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-primary">
                      <Instagram className="h-5 w-5" />
                    </a>
                  )}
                </div>
              </div>
            </div>
            
            {series.description && (
              <div className="border-t pt-6">
                <p className="text-muted-foreground whitespace-pre-line">{series.description}</p>
              </div>
            )}
          </div>
        </div>

        {/* 主要內容區域 - 使用flex布局確保左右列正確對齊 */}
        <div className="flex flex-col md:flex-row gap-8">
          {/* 左側活動列表 (2/3 寬度) */}
          <div className="flex-1 min-w-0">
            {/* 頂部標題和控制區 */}
            <div className="flex justify-between items-center mb-6 sticky top-0 z-10 bg-background/95 backdrop-blur-sm py-4">
              <h2 className="text-xl font-semibold">
                Events
                {selectedDate && (
                  <span className="ml-2 text-sm font-normal text-muted-foreground">
                    ({format(selectedDate, 'MMM d, yyyy')})
                  </span>
                )}
              </h2>
              
              <div className="flex items-center space-x-4">
                {/* 日期篩選器（如果選擇了日期） */}
                {selectedDate && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 flex items-center gap-1 px-3"
                    onClick={clearDateFilter}
                  >
                    <X className="h-3.5 w-3.5" />
                    <span className="text-xs">Clear date</span>
                  </Button>
                )}
                
                {/* 搜尋按鈕 */}
                <div className="relative">
                  {isSearchOpen ? (
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search events..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="h-8 rounded-md bg-secondary/20 px-8 text-xs border-none focus:ring-1 focus:ring-primary"
                        onBlur={() => {
                          if (searchQuery === "") {
                            setIsSearchOpen(false);
                          }
                        }}
                        autoFocus
                      />
                      <Search className="h-3.5 w-3.5 absolute left-2.5 top-[10px] text-muted-foreground" />
                      {searchQuery && (
                        <button
                          onClick={() => {
                            setSearchQuery("");
                            setIsSearchOpen(false);
                          }}
                          className="absolute right-2.5 top-[10px]"
                          aria-label="Clear search"
                          title="Clear search"
                        >
                          <X className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
                        </button>
                      )}
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setIsSearchOpen(true)}
                    >
                      <Search className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
                
                {/* 標籤篩選按鈕 */}
                {allTags.length > 0 && (
                  <div className="relative">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 flex items-center gap-1 px-3"
                      onClick={() => {
                        // 這裡可以添加標籤篩選的邏輯
                      }}
                    >
                      <Filter className="h-3.5 w-3.5" />
                      <span className="text-xs">Filter</span>
                    </Button>
                  </div>
                )}
                
                {/* 視圖切換按鈕 */}
                <div className="bg-card rounded-md overflow-hidden flex border border-border">
                  <button 
                    className={`p-1.5 ${viewMode === 'timeline' ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary/20'}`}
                    onClick={() => setViewMode('timeline')}
                    aria-label="Timeline view"
                    title="Timeline view"
                  >
                    <AlignJustify className="h-3.5 w-3.5" />
                  </button>
                  <button 
                    className={`p-1.5 ${viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary/20'}`}
                    onClick={() => setViewMode('list')}
                    aria-label="List view"
                    title="List view"
                  >
                    <div className="h-3.5 w-3.5 flex flex-col justify-between">
                      <div className="h-[1px] w-full bg-current"></div>
                      <div className="h-[1px] w-full bg-current"></div>
                      <div className="h-[1px] w-full bg-current"></div>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* 活動篩選標籤 */}
            {allTags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-6">
                {allTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`text-xs px-2.5 py-0.5 rounded-full transition-colors ${
                      selectedTags.includes(tag)
                        ? "bg-primary text-primary-foreground"
                        : "bg-neutral-800/30 text-neutral-200 hover:bg-neutral-800/50"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            )}

            {filteredEvents.length === 0 && (
              <div className="text-center py-12 bg-card/20 rounded-xl">
                <p className="text-lg text-muted-foreground">No events found</p>
                {selectedTags.length > 0 && (
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => setSelectedTags([])}
                  >
                    Clear filters
                  </Button>
                )}
              </div>
            )}

            {filteredEvents.length > 0 && viewMode === "timeline" && (
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
            )}

            {filteredEvents.length > 0 && viewMode === "list" && (
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
            )}
          </div>
          
          {/* 右側邊欄 (1/3 寬度) */}
          <div className="w-full md:w-72 flex-shrink-0 space-y-6">
            {/* 提交活動按鈕 - 移到日曆上方 */}
            <div className="bg-card border border-border rounded-md p-4 text-center">
              <h3 className="font-medium mb-2 text-sm">Submit your event to this calendar</h3>
              <p className="text-xs text-muted-foreground mb-3">Want to add your event to this series?</p>
              <Link href="/create-event">
                <Button 
                  className="w-full text-sm h-9"
                  variant="outline"
                >
                  <Plus className="h-3.5 w-3.5 mr-1.5" />
                  Submit Event
                </Button>
              </Link>
            </div>
            
            {/* 固定在頂部的日曆組件 */}
            <div className="bg-card border border-border rounded-md overflow-hidden sticky top-4">
              <div className="p-3 border-b border-border flex justify-between items-center">
                <h3 className="font-medium text-sm">{format(currentMonth, 'MMMM')}</h3>
                <div className="flex space-x-2">
                  <div
                    className="w-5 h-5 flex items-center justify-center rounded-full hover:bg-secondary/20 cursor-pointer text-muted-foreground hover:text-foreground transition-colors"
                    title="Previous month"
                    aria-label="View previous month"
                    onClick={handlePrevMonth}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </div>
                  <div
                    className="w-5 h-5 flex items-center justify-center rounded-full hover:bg-secondary/20 cursor-pointer text-muted-foreground hover:text-foreground transition-colors" 
                    title="Next month"
                    aria-label="View next month"
                    onClick={handleNextMonth}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </div>
                </div>
              </div>
              
              {/* 如果有選中日期，顯示日期和取消按鈕 */}
              {selectedDate && (
                <div className="p-2 bg-primary/10 flex justify-between items-center">
                  <span className="text-xs font-medium">{format(selectedDate, 'MMMM d')}</span>
                  <Button 
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 rounded-full hover:bg-primary/20"
                    onClick={() => setSelectedDate(null)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}
              
              <div className="p-3">
                {/* 週日標題 */}
                <div className="grid grid-cols-7 text-center mb-2">
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                    <div key={day + index} className="text-xs text-muted-foreground">{day}</div>
                  ))}
                </div>
                
                {/* 日曆天數 */}
                <div className="grid grid-cols-7 gap-1 text-xs">
                  {/* 計算本月第一天是星期幾 */}
                  {(() => {
                    // 獲取當月第一天是星期幾 (0-6)
                    const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
                    // 上個月的最後幾天
                    const prevMonthDays = [];
                    const prevMonthLastDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 0).getDate();
                    
                    for (let i = 0; i < firstDay; i++) {
                      const day = prevMonthLastDay - firstDay + i + 1;
                      prevMonthDays.push(
                        <div key={`prev-${day}`} className="h-6 w-6 text-muted-foreground/50 flex items-center justify-center">
                          {day}
                        </div>
                      );
                    }
                    
                    return prevMonthDays;
                  })()}
                  
                  {/* 當月的天數 */}
                  {(() => {
                    // 當月的天數
                    const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
                    const days = [];
                    
                    for (let day = 1; day <= daysInMonth; day++) {
                      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
                      
                      // 檢查這一天是否有事件
                      const hasEvents = events.some(event => {
                        if (!event.start_time) return false;
                        const eventDate = new Date(event.start_time);
                        return format(eventDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');
                      });
                      
                      // 檢查是否為選中的日期
                      const isSelected = selectedDate && 
                        format(date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
                      
                      // 檢查是否為今天
                      const isToday = format(new Date(), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');
                      
                      days.push(
                        <div 
                          key={`day-${day}`}
                          className={`h-6 w-6 rounded-full relative flex items-center justify-center ${
                            isSelected ? "bg-primary text-primary-foreground" :
                            isToday ? "border border-primary text-primary" :
                            hasEvents ? "text-primary hover:bg-primary/20 cursor-pointer" :
                            "text-foreground"
                          }`}
                          onClick={() => {
                            // 只有包含事件的日期可以點擊
                            if (hasEvents) {
                              // 如果已經選中，則清除選擇
                              if (isSelected) {
                                setSelectedDate(null);
                              } else {
                                setSelectedDate(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day));
                              }
                            }
                          }}
                        >
                          {day}
                          {/* 有活動的日期顯示小圓點 */}
                          {hasEvents && !isSelected && (
                            <div className="absolute -bottom-1 w-1 h-1 bg-primary rounded-full"></div>
                          )}
                        </div>
                      );
                    }
                    
                    return days;
                  })()}
                  
                  {/* 下個月的前幾天 */}
                  {(() => {
                    const lastDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDay();
                    const nextMonthDays = [];
                    const daysToAdd = 6 - lastDay;
                    
                    for (let i = 1; i <= daysToAdd; i++) {
                      nextMonthDays.push(
                        <div key={`next-${i}`} className="h-6 w-6 text-muted-foreground/50 flex items-center justify-center">
                          {i}
                        </div>
                      );
                    }
                    
                    return nextMonthDays;
                  })()}
                </div>
              </div>
              
              <div className="p-3 border-t border-border flex justify-between">
                <button
                  className={`text-xs py-1 px-4 h-7 rounded transition-colors ${showMode === "upcoming" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary/20"}`}
                  onClick={() => setShowMode("upcoming")}
                >
                  Upcoming
                </button>
                <button
                  className={`text-xs py-1 px-4 h-7 rounded transition-colors ${showMode === "past" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary/20"}`}
                  onClick={() => setShowMode("past")}
                >
                  Past
                </button>
              </div>
            </div>
            
            {/* 活動地點地圖組件 */}
            <div className="bg-card border border-border rounded-md overflow-hidden">
              <div className="aspect-video w-full relative bg-neutral-900">
                <MapboxEventMap 
                  locations={events
                    .filter(event => event.location && (event.location.latitude && event.location.longitude))
                    .map(event => ({
                      id: event.id,
                      title: event.title,
                      location: event.location
                    }))}
                  height="100%"
                  width="100%"
                />
              </div>
              
              {/* 地點列表 */}
              <div className="p-3">
                <h3 className="text-sm font-medium mb-2">活動地點</h3>
                <p className="text-xs text-muted-foreground mb-3">顯示 {events.filter(e => e.location).length} 個地點</p>
                
                {events
                  .filter(event => event.location)
                  .slice(0, 3)
                  .map((event, index) => (
                    <Link 
                      key={event.id} 
                      href={`/events/${event.id}`}
                      className="flex items-start gap-2 p-2 -mx-2 hover:bg-secondary/5 rounded-md transition-colors"
                    >
                      <div className="w-5 h-5 rounded-full bg-green-500 flex-shrink-0 flex items-center justify-center text-[10px] text-white font-medium mt-0.5">
                        {index + 1}
                      </div>
                      <div>
                        <div className="text-sm">{event.title}</div>
                        <div className="text-xs text-muted-foreground">
                          {event.location?.name || event.location?.address || 'Location TBD'}
                        </div>
                      </div>
                    </Link>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
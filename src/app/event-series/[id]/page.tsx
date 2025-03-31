"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { zhTW } from "date-fns/locale";
import { 
  Calendar, Clock, MapPin, Tag, Users, Check, Plus, Grid, 
  List, Calendar as CalendarIcon, ChevronLeft, ChevronRight, 
  User, Filter, Instagram, Twitter, Globe, ExternalLink 
} from "lucide-react";
import { getEventSeriesById, getEventsInSeries, getMainEventInSeries } from "@/services/eventSeriesService";
import { EventSeries, Event } from "@/types/event";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EventStatus } from "@/types/event";

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
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [showMode, setShowMode] = useState<"upcoming" | "past">("upcoming");

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
  };

  const handleNextMonth = () => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() + 1);
    setCurrentMonth(newDate);
  };

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
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
    
    return passesTagFilter && (
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
        <h1 className="text-3xl font-bold text-foreground">活動系列未找到</h1>
        <p className="mt-4 text-muted-foreground">
          您請求的活動系列不存在或已被刪除。
        </p>
        <Link href="/event-series">
          <Button className="mt-8">返回活動系列列表</Button>
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
                      className={`rounded-full ${isSubscribed ? 'bg-primary/10 border-primary/20 text-primary hover:bg-primary/20' : ''}`}
                    >
                      {isSubscribed ? (
                        <>
                          <Check className="mr-2 h-4 w-4" />
                          已訂閱
                        </>
                      ) : '訂閱'}
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
              <h2 className="text-xl font-semibold">活動</h2>
              
              <div className="flex items-center space-x-4">
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
                      <span className="text-xs">篩選</span>
                    </Button>
                  </div>
                )}
                
                {/* 視圖切換按鈕 */}
                <div className="bg-card rounded-md overflow-hidden flex border border-border">
                  <button 
                    className={`p-1.5 ${viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary/20'}`}
                    onClick={() => setViewMode('list')}
                    aria-label="列表視圖"
                  >
                    <List className="h-3.5 w-3.5" />
                  </button>
                  <button 
                    className={`p-1.5 ${viewMode === 'calendar' ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary/20'}`}
                    onClick={() => setViewMode('calendar')}
                    aria-label="日曆視圖"
                  >
                    <Grid className="h-3.5 w-3.5" />
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
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-neutral-800/30 text-neutral-200 hover:bg-neutral-800/50'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            )}

            {filteredEvents.length === 0 && (
              <div className="text-center py-12 bg-card/20 rounded-xl">
                <p className="text-lg text-muted-foreground">暫無活動</p>
                {selectedTags.length > 0 && (
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => setSelectedTags([])}
                  >
                    清除篩選條件
                  </Button>
                )}
              </div>
            )}

            {filteredEvents.length > 0 && viewMode === 'list' && (
              <div className="relative">
                {/* 事件列表 */}
                <div className="space-y-10 relative z-10 pb-12">
                  {eventsByDate.map((group, groupIndex) => (
                    <div key={format(group.date, 'yyyy-MM-dd')} className="relative">
                      {/* 時間軸垂直線連接所有時間點 */}
                      {groupIndex < eventsByDate.length - 1 && (
                        <div className="absolute left-[6px] top-[26px] w-[0.5px] h-[calc(100%+20px)] bg-neutral-800/20"></div>
                      )}
                      
                      {/* 日期標記 - 使用獨立的圓點 */}
                      <div className="flex items-center sticky top-[72px] z-20 py-2 bg-background/95 backdrop-blur-sm">
                        <div className="w-3 h-3 rounded-full bg-primary flex-shrink-0"></div>
                        <div className="ml-3">
                          <span className="font-medium text-sm">{format(group.date, 'EEEE', { locale: zhTW })}</span>
                          <span className="text-sm text-neutral-400 ml-1">{format(group.date, 'M月d日', { locale: zhTW })}</span>
                        </div>
                      </div>
                      
                      {/* 事件卡片列表 */}
                      <div className="mt-4 ml-6 space-y-3">
                        {group.events.map((event) => (
                          <Link key={event.id} href={`/events/${event.id}`} className="block group">
                            <div className="bg-card border border-neutral-800/30 hover:border-primary/30 transition-all rounded-md overflow-hidden">
                              <div className="flex flex-col md:flex-row">
                                {/* 主要內容區 */}
                                <div className="p-4 md:p-5 flex-1 min-w-0">
                                  <div className="text-sm text-neutral-400 mb-1.5">
                                    {event.start_time ? format(new Date(event.start_time), "h:mm a") : ""}
                                  </div>
                                  
                                  <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors line-clamp-2">
                                    {event.title}
                                  </h3>
                                  
                                  {/* 組織者和地點信息 */}
                                  <div className="flex flex-col gap-1.5 text-sm text-neutral-400">
                                    {event.organizer && (
                                      <div className="flex items-center">
                                        <span className="text-neutral-300">By {event.organizer}</span>
                                      </div>
                                    )}
                                    
                                    {event.location && (
                                      <div className="flex items-center">
                                        <MapPin className="h-3.5 w-3.5 mr-1.5 flex-shrink-0 text-neutral-500" />
                                        <span className="truncate max-w-full">
                                          {event.location.location_type === 'virtual' ? '虛擬活動' : 
                                          event.location.name || event.location.address || '地點未定'}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                                
                                {/* 右側圖片 */}
                                {event.cover_image && (
                                  <div className="w-full md:w-28 h-32 md:h-auto relative overflow-hidden flex-shrink-0 border-t md:border-t-0 md:border-l border-neutral-800/30">
                                    <Image 
                                      src={event.cover_image}
                                      alt={event.title}
                                      fill
                                      className="object-cover group-hover:scale-105 transition-transform"
                                    />
                                  </div>
                                )}
                              </div>
                              
                              {/* 底部資訊欄 */}
                              {(event.attendees_count !== undefined || event.tags?.length > 0) && (
                                <div className="px-4 py-2 bg-neutral-800/10 border-t border-neutral-800/30 flex items-center justify-between text-xs">
                                  <div className="flex items-center gap-2">
                                    {event.attendees_count !== undefined && (
                                      <div className="flex items-center text-neutral-400">
                                        <Users className="h-3.5 w-3.5 mr-1" />
                                        <span>{event.attendees_count}</span>
                                      </div>
                                    )}
                                    
                                    {/* 標籤 */}
                                    {event.tags && event.tags.length > 0 && (
                                      <div className="flex flex-wrap gap-1">
                                        {event.tags.slice(0, 2).map(tag => (
                                          <Badge key={tag} variant="outline" className="text-xs px-1.5 py-0 bg-transparent border-neutral-700 text-neutral-400">
                                            {tag}
                                          </Badge>
                                        ))}
                                        {event.tags.length > 2 && (
                                          <span className="text-xs text-neutral-500">+{event.tags.length - 2}</span>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                  
                                  {event.status === EventStatus.PUBLISHED && (
                                    <Badge variant="secondary" className="text-[10px] px-1 py-0 bg-green-900/20 text-green-400 border-0">
                                      已發布
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
              </div>
            )}

            {filteredEvents.length > 0 && viewMode === 'calendar' && (
              <div className="bg-card border border-neutral-800/30 rounded-md overflow-hidden">
                {/* 日曆標頭 */}
                <div className="flex items-center justify-between p-3 border-b border-neutral-800/30">
                  <h3 className="font-medium">{format(currentMonth, 'yyyy年MM月')}</h3>
                  <div className="flex gap-1">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-7 w-7 hover:bg-neutral-800/20" 
                      onClick={handlePrevMonth}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-7 w-7 hover:bg-neutral-800/20" 
                      onClick={handleNextMonth}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                {/* 日曆主體 */}
                <div className="grid grid-cols-7">
                  {generateCalendarDays()}
                </div>
                
                {/* 當月活動列表 */}
                <div className="border-t border-neutral-800/30 p-4">
                  <h3 className="font-medium mb-3 text-sm">本月活動</h3>
                  {filteredEvents.filter(event => {
                    if (!event.start_time) return false;
                    const eventDate = new Date(event.start_time);
                    return eventDate.getMonth() === currentMonth.getMonth() && 
                           eventDate.getFullYear() === currentMonth.getFullYear();
                  }).length > 0 ? (
                    <div className="space-y-2.5">
                      {filteredEvents
                        .filter(event => {
                          if (!event.start_time) return false;
                          const eventDate = new Date(event.start_time);
                          return eventDate.getMonth() === currentMonth.getMonth() && 
                                eventDate.getFullYear() === currentMonth.getFullYear();
                        })
                        .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
                        .map(event => (
                          <Link 
                            key={event.id} 
                            href={`/events/${event.id}`} 
                            className="flex items-center px-2 py-1.5 -mx-2 rounded-md hover:bg-neutral-800/20 transition-colors"
                          >
                            <div className="w-8 h-8 rounded-md overflow-hidden relative flex-shrink-0 mr-3 bg-neutral-800/30">
                              {event.cover_image ? (
                                <Image
                                  src={event.cover_image}
                                  alt={event.title}
                                  fill
                                  className="object-cover"
                                />
                              ) : (
                                <div className="flex items-center justify-center h-full">
                                  <Calendar className="h-3.5 w-3.5 text-neutral-500" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium truncate">{event.title}</div>
                              <div className="text-xs text-neutral-400 flex items-center">
                                <span>
                                  {format(new Date(event.start_time), "M月d日 h:mm a")}
                                </span>
                              </div>
                            </div>
                          </Link>
                        ))
                      }
                    </div>
                  ) : (
                    <div className="text-sm text-neutral-500 py-2">
                      本月無活動
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          
          {/* 右側邊欄 (1/3 寬度) */}
          <div className="w-full md:w-72 flex-shrink-0 space-y-6">
            {/* 固定在頂部的日曆組件 */}
            <div className="bg-card border border-neutral-800/30 rounded-md overflow-hidden sticky top-4">
              <div className="p-3 border-b border-neutral-800/30 flex justify-between items-center">
                <h3 className="font-medium text-sm">{format(currentMonth, 'MMMM', { locale: zhTW })}</h3>
                <div className="flex space-x-2">
                  <div
                    className="w-5 h-5 flex items-center justify-center rounded-full hover:bg-neutral-800/30 cursor-pointer text-neutral-400 hover:text-white transition-colors"
                    title="上個月"
                    aria-label="查看上個月"
                    onClick={handlePrevMonth}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </div>
                  <div
                    className="w-5 h-5 flex items-center justify-center rounded-full hover:bg-neutral-800/30 cursor-pointer text-neutral-400 hover:text-white transition-colors" 
                    title="下個月"
                    aria-label="查看下個月"
                    onClick={handleNextMonth}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </div>
                </div>
              </div>
              
              <div className="p-3">
                {/* 週日標題 */}
                <div className="grid grid-cols-7 text-center mb-2">
                  {['日', '一', '二', '三', '四', '五', '六'].map((day, index) => (
                    <div key={day} className="text-xs text-neutral-500">{day}</div>
                  ))}
                </div>
                
                {/* 日曆天數，以4月為例 */}
                <div className="grid grid-cols-7 gap-1 text-xs">
                  <div className="h-6 w-6 text-neutral-500 flex items-center justify-center">31</div>
                  {Array.from({length: 30}, (_, i) => i + 1).map(day => (
                    <div 
                      key={`day-${day}`}
                      className={`h-6 w-6 rounded-full flex items-center justify-center ${
                        day === 2 ? 'bg-primary text-primary-foreground' :
                        [5, 9, 15, 23].includes(day) ? 'bg-primary/20 text-primary' :
                        'hover:bg-neutral-800/20'
                      }`}
                    >
                      {day}
                    </div>
                  ))}
                  <div className="h-6 w-6 text-neutral-500 flex items-center justify-center">1</div>
                  <div className="h-6 w-6 text-neutral-500 flex items-center justify-center">2</div>
                  <div className="h-6 w-6 text-neutral-500 flex items-center justify-center">3</div>
                  <div className="h-6 w-6 text-neutral-500 flex items-center justify-center">4</div>
                </div>
              </div>
              
              <div className="p-3 border-t border-neutral-800/30 flex justify-between">
                <button
                  className={`text-xs py-1 px-4 h-7 rounded transition-colors ${showMode === 'upcoming' ? 'bg-primary text-primary-foreground' : 'text-neutral-400 hover:bg-neutral-800/20'}`}
                  onClick={() => setShowMode("upcoming")}
                >
                  Upcoming
                </button>
                <button
                  className={`text-xs py-1 px-4 h-7 rounded transition-colors ${showMode === 'past' ? 'bg-primary text-primary-foreground' : 'text-neutral-400 hover:bg-neutral-800/20'}`}
                  onClick={() => setShowMode("past")}
                >
                  Past
                </button>
              </div>
            </div>
            
            {/* 活動地點地圖組件 */}
            <div className="bg-card border border-neutral-800/30 rounded-md overflow-hidden">
              <div className="aspect-video w-full relative bg-neutral-900">
                {/* 地圖預留區域 */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="h-8 w-8 text-primary/50 mx-auto mb-2" />
                    <p className="text-sm font-medium text-neutral-400">活動地點</p>
                    <p className="text-xs text-neutral-500 mt-1">顯示{events.length}個活動地點</p>
                  </div>
                </div>
                
                {/* 示例地點標記 */}
                {events.slice(0, 3).map((_, index) => (
                  <div 
                    key={`marker-${index}`}
                    className="absolute w-5 h-5 rounded-full bg-green-500 flex items-center justify-center text-[10px] text-white font-medium"
                    style={{ top: `${20 + (index * 15)}%`, left: `${20 + (index * 20)}%` }}
                  >
                    {index + 1}
                  </div>
                ))}
              </div>
              
              {/* 地點列表 */}
              <div className="p-3">
                {events.slice(0, 3).map((event, index) => (
                  <Link 
                    key={event.id} 
                    href={`/events/${event.id}`}
                    className="flex items-start gap-2 p-2 -mx-2 hover:bg-neutral-800/20 rounded-md transition-colors"
                  >
                    <div className="w-5 h-5 rounded-full bg-green-500 flex-shrink-0 flex items-center justify-center text-[10px] text-white font-medium mt-0.5">
                      {index + 1}
                    </div>
                    <div>
                      <div className="text-sm">{event.title}</div>
                      <div className="text-xs text-neutral-400">
                        {event.location?.name || event.location?.address || '地點未定'}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
            
            {/* 提交活動按鈕 */}
            <div className="bg-card border border-neutral-800/30 rounded-md p-4 text-center">
              <h3 className="font-medium mb-2 text-sm">提交您的活動到此日曆</h3>
              <p className="text-xs text-neutral-400 mb-3">想將您的活動添加到這個系列中嗎？</p>
              <Link href="/create-event">
                <Button 
                  className="w-full text-sm h-9"
                  variant="outline"
                >
                  <Plus className="h-3.5 w-3.5 mr-1.5" />
                  提交活動
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
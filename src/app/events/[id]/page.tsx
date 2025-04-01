'use client';

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SponsorshipPlanCard } from "@/components/events/SponsorshipPlanCard";
import { getEventById } from "@/services/eventService";
import { getEventSeriesById } from "@/services/eventSeriesService";
import { addToCart, getCartItems } from "@/services/sponsorService";
import type { Event, SponsorshipPlan, EventSeries } from "@/types/event";
import { CartItem, CartItemStatus } from "@/types/sponsor";
import { isAuthenticated, getCurrentUser, getStoredUser } from "@/lib/services/authService";
import { formatLocation } from "@/utils/languageUtils";
import { Clock, Calendar, MapPin, Link as LinkIcon } from "lucide-react";
import { getBrowserTimezone, getTimezoneDisplay } from "@/utils/dateUtils";
import LocationDisplay from "@/components/maps/LocationDisplay";

/**
 * 將時間從源時區轉換為目標時區
 * @param isoString 時間的ISO字符串
 * @param sourceTimezone 源時區
 * @param targetTimezone 目標時區
 * @returns 轉換後的時間ISO字符串
 */
const formatToLocalTime = (
  isoString: string | undefined,
  sourceTimezone: string | undefined,
  targetTimezone: string
): string => {
  if (!isoString || !sourceTimezone) return '';
  
  try {
    // 1. 將ISO字符串解析為UTC日期
    const date = new Date(isoString);
    
    // 2. 將源時區的時間映射到UTC時間
    const originalTimezoneFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: sourceTimezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
    
    const sourceTimeParts = originalTimezoneFormatter.formatToParts(date);
    const sourceTimeMap: Record<string, string> = {};
    sourceTimeParts.forEach(part => {
      sourceTimeMap[part.type] = part.value;
    });
    
    // 3. 重建日期對象
    const sourceYear = parseInt(sourceTimeMap.year);
    const sourceMonth = parseInt(sourceTimeMap.month) - 1; // 月份是0-11
    const sourceDay = parseInt(sourceTimeMap.day);
    const sourceHour = parseInt(sourceTimeMap.hour);
    const sourceMinute = parseInt(sourceTimeMap.minute);
    const sourceSecond = parseInt(sourceTimeMap.second);
    
    // 4. 創建表示源時區時間的UTC日期
    const sourceUTCDate = new Date(Date.UTC(
      sourceYear, 
      sourceMonth, 
      sourceDay, 
      sourceHour, 
      sourceMinute, 
      sourceSecond
    ));
    
    // 5. 將該UTC日期轉換為目標時區的表示
    const targetTimezoneFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: targetTimezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
    
    const targetTimeParts = targetTimezoneFormatter.formatToParts(sourceUTCDate);
    const targetTimeMap: Record<string, string> = {};
    targetTimeParts.forEach(part => {
      targetTimeMap[part.type] = part.value;
    });
    
    // 6. 從格式化的部分重建日期
    const targetYear = parseInt(targetTimeMap.year);
    const targetMonth = parseInt(targetTimeMap.month) - 1; // 月份是0-11
    const targetDay = parseInt(targetTimeMap.day);
    const targetHour = parseInt(targetTimeMap.hour);
    const targetMinute = parseInt(targetTimeMap.minute);
    const targetSecond = parseInt(targetTimeMap.second);
    
    // 7. 創建表示目標時區時間的日期對象
    const targetDate = new Date(
      targetYear,
      targetMonth,
      targetDay,
      targetHour,
      targetMinute,
      targetSecond
    );
    
    // 8. 返回轉換後的ISO字符串
    return targetDate.toISOString();
  } catch (error) {
    console.error('時區轉換錯誤:', error);
    return isoString; // 出錯時返回原始字符串
  }
};

export default function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [eventId, setEventId] = useState<string>("");
  
  const [event, setEvent] = useState<Event | null>(null);
  const [eventSeries, setEventSeries] = useState<EventSeries | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [addingToCart, setAddingToCart] = useState(false);
  const [isUserAuthenticated, setIsUserAuthenticated] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  
  // 处理参数
  useEffect(() => {
    const resolveParams = async () => {
      try {
        // 在 Next.js 15 中需要等待解析params
        const resolvedParams = await params;
        const id = resolvedParams.id;
        setEventId(id);
      } catch (error) {
        console.error("Error resolving params:", error);
        setError("Invalid event ID");
      }
    };
    
    resolveParams();
  }, [params]);
  
  // 檢查用戶身份
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // 檢查用戶是否已登入
        const authenticated = isAuthenticated();
        setIsUserAuthenticated(authenticated);
        
        if (authenticated) {
          // 獲取用戶信息
          const storedUser = getStoredUser();
          
          if (storedUser && storedUser.id) {
            setUserId(storedUser.id);
          } else {
            const userData = await getCurrentUser();
            if (userData) {
              setUserId(userData.id);
            }
          }
        } else {
          setUserId(null);
        }
      } catch (error) {
        console.error("身份檢查錯誤:", error);
      }
    };
    
    checkAuth();
    
    const handleAuthChange = () => {
      checkAuth();
    };
    
    window.addEventListener('authChange', handleAuthChange);
    
    return () => {
      window.removeEventListener('authChange', handleAuthChange);
    };
  }, []);
  
  // Get event data
  useEffect(() => {
    async function fetchEvent() {
      if (!eventId) return; // 等待eventId设置好
      
      try {
        setIsLoading(true);
        const eventData = await getEventById(eventId);
        
        if (!eventData) {
          setError("Event not found");
          return;
        }
        
        setEvent(eventData);
        
        // 如果活动属于某个系列，获取系列信息
        if (eventData.series_id) {
          try {
            const seriesData = await getEventSeriesById(eventData.series_id);
            if (seriesData) {
              setEventSeries(seriesData);
            }
          } catch (seriesError) {
            console.error("Error fetching event series:", seriesError);
          }
        }
      } catch (error) {
        console.error("Error fetching event:", error);
        setError("Failed to load event data");
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchEvent();
  }, [eventId]);
  
  // 獲取購物車項目
  useEffect(() => {
    const fetchCartItems = async () => {
      if (!userId) return;
      
      try {
        const items = await getCartItems(userId);
        const pendingItems = items.filter(item => item.status === CartItemStatus.PENDING);
        setCartItems(pendingItems);
      } catch (error) {
        console.error("獲取購物車錯誤:", error);
      }
    };
    
    fetchCartItems();
    
    const handleCartUpdate = () => {
      fetchCartItems();
    };
    
    window.addEventListener('cartUpdate', handleCartUpdate);
    
    return () => {
      window.removeEventListener('cartUpdate', handleCartUpdate);
    };
  }, [userId]);
  
  // 處理添加到購物車
  const handleAddToCart = async (plan: SponsorshipPlan) => {
    // 必須登入才能添加到購物車
    if (!isUserAuthenticated) {
      alert("請先登入後再添加到購物車");
      router.push('/login');
      return;
    }
    
    // 獲取當前用戶ID
    let currentUserId = userId;
    if (!currentUserId) {
      try {
        const storedUser = getStoredUser();
        if (storedUser && storedUser.id) {
          currentUserId = storedUser.id;
          setUserId(storedUser.id);
        } else {
          const userData = await getCurrentUser();
          if (userData && userData.id) {
            currentUserId = userData.id;
            setUserId(userData.id);
          }
        }
      } catch (error) {
        console.error("獲取用戶ID錯誤:", error);
      }
    }
    
    // 確認獲取到了用戶ID
    if (!currentUserId) {
      alert("無法獲取用戶ID，請重新登入後再試");
      router.push('/login');
      return;
    }
    
    try {
      setAddingToCart(true);
      
      // 檢查是否已在購物車中
      if (isPlanInCart(plan.id)) {
        alert("此贊助方案已在您的購物車中");
        setAddingToCart(false);
        return;
      }
      
      // 添加到購物車
      await addToCart(currentUserId, plan.id);
      
      // 觸發購物車更新
      window.dispatchEvent(new Event('cartUpdate'));
      
      alert("成功添加到購物車！");
      
      // 更新購物車顯示
      const items = await getCartItems(currentUserId);
      const pendingItems = items.filter(item => item.status === CartItemStatus.PENDING);
      setCartItems(pendingItems);
    } catch (error) {
      console.error("添加到購物車錯誤:", error);
      alert("添加到購物車時發生錯誤，請稍後再試");
    } finally {
      setAddingToCart(false);
    }
  };
  
  // 检查活动是否在购物车中
  const isPlanInCart = (planId: string) => {
    return cartItems.some(item => item.sponsorship_plan_id === planId);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-96 bg-gray-200 dark:bg-gray-800 rounded-lg mb-8"></div>
          <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-1/2 mb-4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-full mb-2"></div>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold text-red-500 mb-4">Error</h1>
        <p className="mb-8">{error || "Failed to load event"}</p>
        <Link href="/events">
          <Button>Return to Events</Button>
        </Link>
      </div>
    );
  }

  // 格式化事件日期和时间
  const formatEventDate = (isoString: string) => {
    try {
      return format(new Date(isoString), "MMMM d, yyyy");
    } catch (e) {
      console.error("Date formatting error:", e);
      return "Invalid date";
    }
  };

  const formatEventTime = (isoString: string) => {
    try {
      return format(new Date(isoString), "h:mm a");
    } catch (e) {
      console.error("Time formatting error:", e);
      return "Invalid time";
    }
  };

  // 显示的日期和时间
  const startDate = formatEventDate(event.start_time);
  const endDate = formatEventDate(event.end_time);
  const startTime = formatEventTime(event.start_time);
  const endTime = formatEventTime(event.end_time);
  
  // 判断是否为跨天事件
  const isMultiDayEvent = startDate !== endDate;
  
  // 根据是否跨天生成不同的显示文本
  const dateTimeDisplay = isMultiDayEvent 
    ? `${startDate} ${startTime} - ${endDate} ${endTime}` 
    : `${startDate}, ${startTime} - ${endTime}`;
  
  const timezoneText = event.timezone ? getTimezoneDisplay(event.timezone) : '';

  return (
    <div className="bg-background">
      {/* 顶部横幅 */}
      <div className="relative w-full h-[400px]">
        <Image
          src={event.cover_image || "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1600&q=80"}
          alt={event.title}
          className="object-cover"
          fill
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-black/70 flex items-end">
          <div className="container mx-auto px-4 pb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{event.title}</h1>
            <div className="flex flex-wrap gap-4 text-white">
              <div className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                <span>{dateTimeDisplay}</span>
              </div>
              <div className="flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                <span>{timezoneText}</span>
              </div>
              <div className="flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                <span>
                  {event.location.location_type === 'virtual' 
                    ? '虛擬活動' 
                    : formatLocation(event.location.city, event.location.country)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 主要内容 */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左边内容 */}
          <div className="lg:col-span-2">
            {/* 活动系列信息 */}
            {eventSeries && (
              <div className="mb-8 p-6 bg-secondary/30 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold">活動系列</h3>
                  <Link 
                    href={`/event-series/${eventSeries.id}`}
                    className="text-primary hover:underline flex items-center"
                  >
                    <span>查看系列</span>
                    <LinkIcon className="ml-1 h-4 w-4" />
                  </Link>
                </div>
                
                <div className="flex items-center">
                  <div className="h-16 w-16 relative mr-4 flex-shrink-0 bg-gray-200 rounded-md overflow-hidden">
                    <Image 
                      src={eventSeries.cover_image || "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1600&q=80"} 
                      alt={eventSeries.title}
                      className="rounded-md object-cover"
                      fill
                    />
                  </div>
                  <div>
                    <h4 className="font-medium">{eventSeries.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{eventSeries.event_ids.length} 場活動 • {eventSeries.locations.join(', ')}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">
                        {eventSeries.series_type.replace('_', ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                      </Badge>
                      {event.is_main_event && (
                        <Badge variant="secondary" className="text-xs">主要活動</Badge>
                      )}
                      {event.event_type && (
                        <Badge variant="secondary" className="text-xs">{event.event_type}</Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 活动描述 */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">關於活動</h2>
              <p className="whitespace-pre-line text-muted-foreground">{event.description}</p>
            </div>

            {/* 位置地图 */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">活動地點</h2>
              {event.location.location_type === 'virtual' ? (
                <div className="p-4 bg-secondary/30 rounded-lg">
                  <div className="flex items-center mb-2">
                    <Clock className="mr-2 h-5 w-5" />
                    <h3 className="font-semibold">虛擬活動</h3>
                  </div>
                  <p className="text-muted-foreground">
                    此活動將在線上進行，報名後將收到參與連結。
                  </p>
                </div>
              ) : (
                <LocationDisplay location={event.location} />
              )}
            </div>

            {/* 活動材料 */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Event Materials</h2>
              <div className="flex flex-wrap gap-4">
                <Button 
                  variant="default" 
                  className="flex items-center gap-2"
                  onClick={() => {
                    // 處理下載活動資料
                    const eventDeckUrl = event.materials?.deck_url || "https://example.com/event-deck.pdf";
                    window.open(eventDeckUrl, '_blank');
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                  </svg>
                  Download Event Deck
                </Button>
                
                {isUserAuthenticated && (
                  <Button 
                    variant="outline" 
                    className="flex items-center gap-2"
                    onClick={() => {
                      // 如果用戶已登入，導航到預約會議頁面
                      if (event.organizer_id) {
                        router.push(`/meetings?organizer=${event.organizer_id}&eventId=${event.id}&title=${encodeURIComponent(`Meeting about: ${event.title}`)}`);
                      } else {
                        alert("無法找到活動主辦方信息，請稍後再試");
                      }
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                      <line x1="16" y1="2" x2="16" y2="6"></line>
                      <line x1="8" y1="2" x2="8" y2="6"></line>
                      <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                    Schedule a Meeting with Organizer
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* 右边侧边栏 */}
          <div className="lg:col-span-1">
            <div className="sticky top-4">
              <div className="bg-secondary/30 rounded-lg p-6 mb-6">
                <h2 className="text-xl font-bold mb-4">活動詳情</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold">日期與時間</h3>
                    <p className="text-muted-foreground">{dateTimeDisplay}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold">地點</h3>
                    <p className="text-muted-foreground">
                      {event.location.location_type === 'virtual' ? (
                        '虛擬活動'
                      ) : (
                        event.location.name + ', ' + formatLocation(event.location.city, event.location.country)
                      )}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold">類別</h3>
                    <p className="text-muted-foreground">{event.category}</p>
                  </div>
                  {event.tags && event.tags.length > 0 && (
                    <div>
                      <h3 className="font-semibold">標籤</h3>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {event.tags.map((tag) => (
                          <Badge key={tag} variant="outline">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* 赞助方案区 */}
              <div className="bg-secondary/30 rounded-lg p-6">
                <h2 className="text-xl font-bold mb-4">贊助方案</h2>
                {event.sponsorship_plans && event.sponsorship_plans.length > 0 ? (
                  <div className="space-y-4">
                    {event.sponsorship_plans.map((plan) => (
                      <SponsorshipPlanCard
                        key={plan.id}
                        plan={plan}
                        isInCart={isPlanInCart(plan.id)}
                        isLoading={addingToCart}
                        onAddToCart={() => handleAddToCart(plan)}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">暫無贊助方案</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
'use client';

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { SponsorshipPlanCard } from "@/components/events/SponsorshipPlanCard";
import { getEventById } from "@/services/eventService";
import { addToCart, getCartItems } from "@/services/sponsorService";
import { Event, SponsorshipPlan } from "@/types/event";
import { CartItem } from "@/types/sponsor";
import { isAuthenticated, hasRole, getCurrentUser } from "@/lib/services/authService";
import { USER_ROLES } from "@/lib/types/users";
import { formatAddress } from "@/utils/languageUtils";
import { Clock } from "lucide-react";
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

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;
  
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [addingToCart, setAddingToCart] = useState(false);
  const [isUserAuthenticated, setIsUserAuthenticated] = useState(false);
  const [isSponsor, setIsSponsor] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  
  // Check user identity
  useEffect(() => {
    const checkAuth = async () => {
      const authenticated = isAuthenticated();
      setIsUserAuthenticated(authenticated);
      
      if (authenticated) {
        const sponsor = hasRole(USER_ROLES.SPONSOR);
        setIsSponsor(sponsor);
        
        if (sponsor) {
          try {
            const userData = await getCurrentUser();
            if (userData) {
              setUserId(userData.id);
            }
          } catch (error) {
            console.error("Error getting user data:", error);
          }
        }
      }
    };
    
    checkAuth();
  }, []);
  
  // Get event data
  useEffect(() => {
    async function fetchEvent() {
      try {
        setIsLoading(true);
        const eventData = await getEventById(eventId);
        
        if (!eventData) {
          setError("Event not found");
          return;
        }
        
        setEvent(eventData);
      } catch (error) {
        console.error("Error fetching event:", error);
        setError("Failed to load event data");
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchEvent();
  }, [eventId]);
  
  // Get cart items for sponsor
  useEffect(() => {
    if (isSponsor && userId) {
      async function fetchCartItems() {
        try {
          if (!userId) return;
          
          const items = await getCartItems(userId);
          setCartItems(items);
        } catch (error) {
          console.error("Error fetching cart items:", error);
        }
      }
      
      fetchCartItems();
    }
  }, [isSponsor, userId]);
  
  // Handle add to cart
  const handleAddToCart = async (plan: SponsorshipPlan) => {
    if (!isUserAuthenticated) {
      router.push('/login');
      return;
    }
    
    if (!userId) return;
    
    try {
      setAddingToCart(true);
      
      // Check if plan is already in cart
      const alreadyInCart = cartItems.some(item => item.sponsorship_plan_id === plan.id);
      
      if (alreadyInCart) {
        alert("This sponsorship plan is already in your cart");
        return;
      }
      
      await addToCart(userId, plan.id);
      
      // Update cart items
      const updatedItems = await getCartItems(userId);
      setCartItems(updatedItems);
      alert("Sponsorship plan added to cart successfully");
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert("Failed to add sponsorship plan to cart");
    } finally {
      setAddingToCart(false);
    }
  };
  
  // Check if plan is in cart
  const isPlanInCart = (planId: string) => {
    return cartItems.some(item => item.sponsorship_plan_id === planId);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (error || !event) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive">Error</h1>
          <p className="mt-2">{error || "Event not found"}</p>
          <Button variant="default" className="mt-4" asChild>
            <Link href="/events">Back to Events</Link>
          </Button>
        </div>
      </div>
    );
  }
  
  // 格式化日期以供顯示
  const startDate = event.start_time ? new Date(event.start_time) : null;
  const endDate = event.end_time ? new Date(event.end_time) : null;
  
  const formattedDate = startDate && endDate 
    ? startDate.toDateString() === endDate.toDateString()
      ? `${format(startDate, "MMMM d, yyyy")} • ${format(startDate, "h:mm a")} - ${format(endDate, "h:mm a")}`
      : `${format(startDate, "MMMM d, yyyy")} - ${format(endDate, "MMMM d, yyyy")}`
    : "日期待定";

  // 獲取人性化的時區縮寫顯示
  const timezoneDisplay = event.timezone ? getTimezoneDisplay(event.timezone) : '';

  // 格式化完整地址
  const addressDisplay = event.location ? formatAddress(event.location) : "地點待定";

  return (
    <div className="bg-background min-h-screen pt-16 pb-12">
      {/* 活動頭部與封面圖片 */}
      <div className="relative">
        <div className="w-full h-64 md:h-80 lg:h-96 relative">
          <Image
            fill
            className="object-cover"
            src={event.cover_image || "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1600&q=80"}
            alt={event.title}
          />
        </div>
      </div>
      
      {/* 活動內容 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 lg:gap-12">
          {/* 活動詳情 */}
          <div className="lg:col-span-2">
            <nav className="flex mb-4" aria-label="Breadcrumb">
              <ol className="flex items-center space-x-2">
                <li>
                  <Link href="/events" className="text-muted-foreground hover:text-foreground">
                    Events
                  </Link>
                </li>
                <li className="flex items-center">
                  <svg className="h-5 w-5 text-muted-foreground" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="ml-2 text-foreground font-medium truncate">{event.title}</span>
                </li>
              </ol>
            </nav>
            
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">{event.title}</h1>
            
            <div className="mt-4 flex flex-wrap items-center text-muted-foreground gap-4">
              <div className="flex items-center">
                <svg className="h-5 w-5 text-muted-foreground mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>
                  {formattedDate}
                  {timezoneDisplay && (
                    <span className="ml-1 text-sm text-muted-foreground">{timezoneDisplay}</span>
                  )}
                </span>
              </div>
              
              {/* 顯示為虛擬活動標記 */}
              {event.location?.location_type === 'virtual' && (
                <div className="inline-flex items-center bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">
                  <svg className="h-3 w-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  虛擬活動
                </div>
              )}
              
              <div className="flex items-center">
                <svg className="h-5 w-5 text-muted-foreground mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {event.location ? (
                  <LocationDisplay location={event.location} />
                ) : (
                  <span>地點待定</span>
                )}
              </div>
            </div>
            
            {/* 如果瀏覽器時區與活動時區不同，顯示用戶本地時間提示 */}
            {event.timezone && getBrowserTimezone() !== event.timezone && (
              <div className="mt-2 p-2 bg-muted/50 text-sm rounded-md">
                <p className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>當地時間: {
                    (() => {
                      try {
                        // 使用相同的時區轉換邏輯
                        if (!startDate) return "時間未指定";
                        
                        // 獲取瀏覽器時區
                        const browserTimezone = getBrowserTimezone();
                        
                        // 格式化開始時間到用戶當地時區
                        const localStartTime = formatToLocalTime(event.start_time, event.timezone, browserTimezone);
                        
                        // 格式化結束時間到用戶當地時區
                        const localEndTime = event.end_time 
                          ? formatToLocalTime(event.end_time, event.timezone, browserTimezone)
                          : null;
                        
                        // 獲取時區顯示
                        const localTimezoneDisplay = getTimezoneDisplay(browserTimezone);
                        
                        // 組合顯示格式
                        if (localEndTime) {
                          const localStartDate = new Date(localStartTime);
                          const localEndDate = new Date(localEndTime);
                          
                          if (localStartDate.toDateString() === localEndDate.toDateString()) {
                            // 同一天的情況
                            return `${format(localStartDate, "MMM d")} • ${format(localStartDate, "h:mm a")} - ${format(localEndDate, "h:mm a")} ${localTimezoneDisplay}`;
                          } else {
                            // 跨天的情況
                            return `${format(localStartDate, "MMM d")} - ${format(localEndDate, "MMM d")} ${localTimezoneDisplay}`;
                          }
                        } else {
                          // 只有開始時間
                          return `${format(new Date(localStartTime), "MMM d, h:mm a")} ${localTimezoneDisplay}`;
                        }
                      } catch (error) {
                        console.error("轉換當地時間錯誤:", error);
                        return "轉換時間出錯";
                      }
                    })()
                  }</span>
                </p>
              </div>
            )}
            
            <div className="mt-8">
              <h2 className="text-xl font-bold text-foreground mb-4">關於此活動</h2>
              <div className="prose max-w-none text-muted-foreground">
                <p className="whitespace-pre-line">{event.description}</p>
              </div>
            </div>
            
            {event.location?.address && (
              <div className="mt-8">
                <h2 className="text-xl font-bold text-foreground mb-4">地點</h2>
                <div className="bg-secondary p-4 rounded-lg">
                  <p className="text-secondary-foreground whitespace-pre-line">{addressDisplay}</p>
                </div>
              </div>
            )}
            
            {/* 如果有活動資料，顯示下載按鈕 */}
            {event.deck_url && (
              <div className="mt-8">
                <h2 className="text-xl font-bold text-foreground mb-4">活動資料</h2>
                <a 
                  href={event.deck_url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  <svg className="-ml-1 mr-2 h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  下載活動資料
                </a>
              </div>
            )}
            
            <div className="mt-10">
              <Button
                variant="default"
                onClick={() => router.push(`/meetings?eventId=${eventId}`)}
                className="w-full sm:w-auto"
              >
                Schedule Meeting with Organizer
              </Button>
            </div>
          </div>
          
          {/* Sponsorship Plans */}
          <div className="mt-8 lg:mt-0">
            <div className="bg-secondary p-6 rounded-lg">
              <h2 className="text-xl font-bold text-foreground mb-6">Sponsorship Plans</h2>
              
              {event.sponsorship_plans && event.sponsorship_plans.length > 0 ? (
                <div className="space-y-6">
                  {event.sponsorship_plans.map(plan => (
                    <SponsorshipPlanCard
                      key={plan.id}
                      plan={plan}
                      onAddToCart={() => {
                        if (userId) {
                          handleAddToCart(plan);
                        }
                      }}
                      isInCart={isPlanInCart(plan.id)}
                      isLoading={addingToCart}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No sponsorship plans available at this time.</p>
              )}
              
              {isUserAuthenticated && isSponsor && cartItems.length > 0 && (
                <div className="mt-8 text-center">
                  <Link href="/cart">
                    <Button variant="outline">
                      View Cart ({cartItems.length})
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
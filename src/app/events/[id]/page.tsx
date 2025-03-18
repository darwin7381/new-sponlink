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
import { Event } from "@/types/event";
import { CartItem } from "@/types/sponsor";
import { SponsorshipPlan } from "@/types/sponsorshipPlan";

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;
  
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [addingToCart, setAddingToCart] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSponsor, setIsSponsor] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  
  // 檢查用戶身份
  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      const userData = JSON.parse(user);
      setIsAuthenticated(true);
      setIsSponsor(userData.role === 'sponsor');
      setUserId(userData.id);
    }
  }, []);
  
  // 獲取活動數據
  useEffect(() => {
    async function fetchEvent() {
      try {
        setIsLoading(true);
        const eventData = await getEventById(eventId);
        setEvent(eventData);
        
        // 如果用戶是贊助商，也獲取他們的購物車項目
        if (isAuthenticated && isSponsor && userId) {
          const items = await getCartItems(userId);
          setCartItems(items);
        }
      } catch (error) {
        console.error("獲取活動錯誤:", error);
        setError("無法加載活動詳情。請稍後再試。");
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchEvent();
  }, [eventId, isAuthenticated, isSponsor, userId]);
  
  const handleScheduleMeeting = () => {
    router.push(`/meetings?eventId=${eventId}`);
  };
  
  const handleAddToCart = async (planId: string) => {
    if (!isAuthenticated || !isSponsor) {
      router.push("/login");
      return;
    }
    
    try {
      setAddingToCart(true);
      await addToCart(userId as string, planId);
      
      // 刷新購物車項目
      const updatedItems = await getCartItems(userId as string);
      setCartItems(updatedItems);
      
    } catch (error) {
      console.error("添加到購物車錯誤:", error);
      alert("無法將項目添加到購物車。請重試。");
    } finally {
      setAddingToCart(false);
    }
  };
  
  const isPlanInCart = (planId: string) => {
    return cartItems.some(item => item.sponsorship_plan_id === planId);
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-700"></div>
      </div>
    );
  }
  
  if (error || !event) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <h1 className="text-3xl font-bold text-gray-900">錯誤</h1>
        <p className="mt-4 text-lg text-gray-600">{error || "找不到活動"}</p>
        <Link href="/events">
          <Button variant="default" className="mt-6">
            返回活動列表
          </Button>
        </Link>
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

  // 將 Event 中的 sponsorship_plans 轉換為 SponsorshipPlan 類型
  const convertedPlans: SponsorshipPlan[] = event.sponsorship_plans.map(plan => ({
    id: plan.id,
    name: plan.title,
    description: plan.description,
    price: plan.price,
    is_limited: !!plan.max_sponsors,
    benefits: plan.benefits,
    event_id: plan.event_id,
    visibility: 'public',
    created_at: plan.created_at || new Date().toISOString(),
    updated_at: plan.updated_at || new Date().toISOString()
  }));

  return (
    <div className="bg-white min-h-screen pt-16 pb-12">
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
                  <Link href="/events" className="text-gray-500 hover:text-gray-700">
                    活動
                  </Link>
                </li>
                <li className="flex items-center">
                  <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="ml-2 text-gray-700 font-medium truncate">{event.title}</span>
                </li>
              </ol>
            </nav>
            
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">{event.title}</h1>
            
            <div className="mt-4 flex flex-wrap items-center text-gray-600 gap-4">
              <div className="flex items-center">
                <svg className="h-5 w-5 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>{formattedDate}</span>
              </div>
              
              <div className="flex items-center">
                <svg className="h-5 w-5 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>{event.location?.name || "地點待定"}</span>
              </div>
            </div>
            
            <div className="mt-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">關於此活動</h2>
              <div className="prose max-w-none text-gray-700">
                <p className="whitespace-pre-line">{event.description}</p>
              </div>
            </div>
            
            {event.location?.address && (
              <div className="mt-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">地點</h2>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700">{event.location.address}</p>
                </div>
              </div>
            )}
            
            {/* 如果有活動資料，顯示下載按鈕 */}
            {event.deck_url && (
              <div className="mt-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">活動資料</h2>
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
                onClick={handleScheduleMeeting}
                className="w-full sm:w-auto"
              >
                與組織者安排會議
              </Button>
            </div>
          </div>
          
          {/* 贊助方案側邊欄 */}
          <div className="mt-8 lg:mt-0">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h2 className="text-xl font-bold text-gray-900 mb-6">贊助方案</h2>
              
              {convertedPlans.length > 0 ? (
                <div className="space-y-6">
                  {convertedPlans.map(plan => (
                    <SponsorshipPlanCard
                      key={plan.id}
                      plan={plan}
                      onAddToCart={handleAddToCart}
                      isInCart={isPlanInCart(plan.id)}
                      isLoading={addingToCart}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">目前沒有可用的贊助方案。</p>
              )}
              
              {isAuthenticated && isSponsor && cartItems.length > 0 && (
                <div className="mt-8 text-center">
                  <Link href="/cart">
                    <Button variant="outline">
                      查看購物車 ({cartItems.length})
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
'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getEventById, publishEvent } from "@/services/eventService";
import { Event, EventStatus } from "@/types/event";

export default function EventDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isPublishing, setIsPublishing] = useState(false);
  const [eventId, setEventId] = useState<string>("");
  const [currentUser, setCurrentUser] = useState<{ id: string; role: string } | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isOrganizer, setIsOrganizer] = useState(false);

  // 檢查用戶身份
  useEffect(() => {
    const userJson = localStorage.getItem('user');
    if (userJson) {
      try {
        const user = JSON.parse(userJson);
        setCurrentUser(user);
        setIsAuthenticated(true);
        setIsOrganizer(user.role === 'organizer');
      } catch (e) {
        console.error("Error parsing user data:", e);
      }
    }
  }, []);

  // 如果未登錄或不是組織者，則重定向
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router, isLoading]);

  // 獲取活動詳情
  useEffect(() => {
    async function fetchEventDetails() {
      setIsLoading(true);
      setError("");
      
      try {
        // 在 Next.js 15 中需要等待解析params
        const resolvedParams = await params;
        const id = resolvedParams.id;
        setEventId(id); // 保存ID以便後續使用
        
        const eventData = await getEventById(id);
        if (!eventData) {
          setError("找不到該活動");
          return;
        }
        
        // 檢查當前用戶是否為活動的主辦方
        if (currentUser && eventData.organizer_id !== currentUser.id) {
          setError("您沒有權限查看此活動");
          router.push("/organizer/events");
          return;
        }
        
        setEvent(eventData);
      } catch (error) {
        console.error("Error fetching event details:", error);
        setError("無法加載活動詳情。請稍後再試。");
      } finally {
        setIsLoading(false);
      }
    }

    if (currentUser && isOrganizer) {
      fetchEventDetails();
    }
  }, [params, currentUser, isOrganizer, router]);

  // 發布活動
  const handlePublishEvent = async () => {
    if (!event) return;
    
    try {
      setIsPublishing(true);
      const updatedEvent = await publishEvent(eventId);
      
      if (updatedEvent) {
        setEvent(updatedEvent);
      }
    } catch (error) {
      console.error("Error publishing event:", error);
      setError("發布活動時出錯。請稍後再試。");
    } finally {
      setIsPublishing(false);
    }
  };

  // 獲取活動狀態標籤
  const getStatusBadge = (status: EventStatus) => {
    switch (status) {
      case EventStatus.DRAFT:
        return <Badge variant="outline" className="bg-gray-100 text-gray-800">草稿</Badge>;
      case EventStatus.PUBLISHED:
        return <Badge variant="outline" className="bg-green-100 text-green-800">已發布</Badge>;
      case EventStatus.CANCELLED:
        return <Badge variant="outline" className="bg-red-100 text-red-800">已取消</Badge>;
      case EventStatus.COMPLETED:
        return <Badge variant="outline" className="bg-blue-100 text-blue-800">已完成</Badge>;
      default:
        return <Badge variant="outline">未知</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-700"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-50 min-h-screen pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <p className="text-red-600">{error}</p>
          </div>
          <Button variant="outline" onClick={() => router.push("/organizer/events")}>
            返回活動列表
          </Button>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="bg-gray-50 min-h-screen pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <CardContent className="p-6 text-center">
              <h2 className="text-lg font-medium text-gray-900">找不到活動</h2>
              <p className="mt-2 text-gray-500">
                該活動可能已被刪除或您沒有權限查看。
              </p>
              <Button variant="outline" className="mt-4" onClick={() => router.push("/organizer/events")}>
                返回活動列表
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => router.push("/organizer/events")}>
              返回
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">{event.title}</h1>
            {getStatusBadge(event.status)}
          </div>
          <div className="flex gap-3">
            <Link href={`/organizer/events/${event.id}/edit`}>
              <Button variant="outline">編輯活動</Button>
            </Link>
            {event.status === EventStatus.DRAFT && (
              <Button 
                variant="default" 
                onClick={handlePublishEvent}
                disabled={isPublishing}
              >
                {isPublishing ? "發布中..." : "發布活動"}
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>活動詳情</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-video w-full mb-6 overflow-hidden rounded-lg">
                  <img 
                    src={event.cover_image} 
                    alt={event.title} 
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">描述</h3>
                    <p className="mt-2 text-gray-600">{event.description}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">時間</h3>
                    <div className="mt-2 text-gray-600">
                      <p>開始時間：{new Date(event.start_time).toLocaleString()}</p>
                      <p>結束時間：{new Date(event.end_time).toLocaleString()}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">地點</h3>
                    <div className="mt-2 text-gray-600">
                      <p>{event.location.name}, {event.location.city}</p>
                      <p>{event.location.address}</p>
                      <p>{event.location.country} {event.location.postal_code}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">分類與標籤</h3>
                    <div className="mt-2">
                      <Badge variant="secondary" className="mr-2">{event.category}</Badge>
                      {event.tags.map(tag => (
                        <Badge key={tag} variant="outline" className="mr-2">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div>
            <Card>
              <CardHeader>
                <CardTitle>贊助方案</CardTitle>
              </CardHeader>
              <CardContent>
                {event.sponsorship_plans.length === 0 ? (
                  <p className="text-gray-500">尚未設置贊助方案</p>
                ) : (
                  <div className="space-y-4">
                    {event.sponsorship_plans.map(plan => (
                      <div key={plan.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <h3 className="font-medium text-gray-900">{plan.title}</h3>
                          <span className="text-lg font-semibold">${plan.price.toLocaleString()}</span>
                        </div>
                        <p className="mt-1 text-sm text-gray-600">{plan.description}</p>
                        <div className="mt-3">
                          <h4 className="text-sm font-medium text-gray-700">權益：</h4>
                          <ul className="mt-1 text-sm text-gray-600 list-disc list-inside">
                            {plan.benefits.map((benefit, index) => (
                              <li key={index}>{benefit}</li>
                            ))}
                          </ul>
                        </div>
                        {(plan.max_sponsors !== undefined && plan.current_sponsors !== undefined) && (
                          <div className="mt-3 text-sm text-gray-600">
                            贊助商：{plan.current_sponsors} / {plan.max_sponsors}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="mt-6">
                  <Link href={`/organizer/events/${event.id}/plans`}>
                    <Button variant="outline" className="w-full">
                      管理贊助方案
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
            
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>活動狀態</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <span className="text-sm text-gray-500">創建時間</span>
                    <p>{new Date(event.created_at).toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">最後更新</span>
                    <p>{new Date(event.updated_at).toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">當前狀態</span>
                    <div className="mt-1">{getStatusBadge(event.status)}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 
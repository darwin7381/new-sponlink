'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getOrganizerEvents } from "@/services/eventService";
import { Event, EventStatus } from "@/types/event";

export default function ManageEventsPage() {
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
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
    if (!isLoading && (!isAuthenticated || !isOrganizer)) {
      router.push("/login");
    }
  }, [isAuthenticated, isOrganizer, router, isLoading]);

  // 獲取組織者的活動
  useEffect(() => {
    async function fetchEvents() {
      if (!currentUser) return;

      try {
        setIsLoading(true);
        const eventsData = await getOrganizerEvents(currentUser.id);
        setEvents(eventsData);
      } catch (error) {
        console.error("Error fetching events:", error);
        setError("無法加載您的活動。請稍後再試。");
      } finally {
        setIsLoading(false);
      }
    }

    if (currentUser && isOrganizer) {
      fetchEvents();
    }
  }, [currentUser, isOrganizer]);

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

  // 按狀態過濾活動
  const draftEvents = events.filter(event => event.status === EventStatus.DRAFT);
  const publishedEvents = events.filter(event => event.status === EventStatus.PUBLISHED);
  const completedEvents = events.filter(event => 
    event.status === EventStatus.COMPLETED || event.status === EventStatus.CANCELLED
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-700"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">管理活動</h1>
          <Link href="/organizer/events/create">
            <Button variant="default">
              創建新活動
            </Button>
          </Link>
        </div>

        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <p className="text-red-600">{error}</p>
          </div>
        ) : events.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <h2 className="text-lg font-medium text-gray-900">您還沒有創建任何活動</h2>
              <p className="mt-2 text-gray-500">
                點擊上方的「創建新活動」按鈕開始創建您的第一個活動。
              </p>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="all">
            <TabsList className="mb-6">
              <TabsTrigger value="all">所有活動 ({events.length})</TabsTrigger>
              <TabsTrigger value="draft">草稿 ({draftEvents.length})</TabsTrigger>
              <TabsTrigger value="published">已發布 ({publishedEvents.length})</TabsTrigger>
              <TabsTrigger value="completed">已完成 ({completedEvents.length})</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all">
              <EventList events={events} getStatusBadge={getStatusBadge} />
            </TabsContent>
            
            <TabsContent value="draft">
              <EventList events={draftEvents} getStatusBadge={getStatusBadge} />
            </TabsContent>
            
            <TabsContent value="published">
              <EventList events={publishedEvents} getStatusBadge={getStatusBadge} />
            </TabsContent>
            
            <TabsContent value="completed">
              <EventList events={completedEvents} getStatusBadge={getStatusBadge} />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}

// 活動列表組件
function EventList({ 
  events, 
  getStatusBadge 
}: { 
  events: Event[], 
  getStatusBadge: (status: EventStatus) => React.ReactNode 
}) {
  return (
    <div className="space-y-6">
      {events.map(event => (
        <Card key={event.id} className="overflow-hidden">
          <CardContent className="p-0">
            <div className="flex flex-col md:flex-row">
              <div className="md:w-1/4 h-48 md:h-auto relative">
                <img
                  src={event.cover_image}
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6 md:w-3/4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{event.title}</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {new Date(event.start_time).toLocaleDateString()} - {new Date(event.end_time).toLocaleDateString()}
                    </p>
                    <p className="mt-2 text-gray-600 line-clamp-2">{event.description}</p>
                  </div>
                  <div>{getStatusBadge(event.status)}</div>
                </div>
                
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="text-sm text-gray-500">
                    {event.sponsorship_plans.length} 個贊助方案
                  </span>
                  {event.location && (
                    <span className="text-sm text-gray-500">
                      • {event.location.name}
                    </span>
                  )}
                </div>
                
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link href={`/organizer/events/${event.id}`}>
                    <Button variant="outline" size="sm">
                      查看詳情
                    </Button>
                  </Link>
                  <Link href={`/organizer/events/${event.id}/edit`}>
                    <Button variant="outline" size="sm">
                      編輯活動
                    </Button>
                  </Link>
                  <Link href={`/organizer/events/${event.id}/plans`}>
                    <Button variant="outline" size="sm">
                      管理贊助方案
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
} 
'use client';

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarIcon, UserIcon, BarChart3Icon, ClockIcon } from "lucide-react";
import { getOrganizerMeetings } from "@/services/meetingService";
import { getOrganizerEvents } from "@/services/eventService";
import { Meeting, MEETING_STATUS } from "@/lib/types/users";
import { Event } from "@/lib/types/events";
import { adaptNewEventsToOld } from "@/lib/types-adapter";
import { getCurrentUser, isAuthenticated } from "@/lib/services/authService";
import { format } from "date-fns";

export default function OrganizerDashboardPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  
  // 格式化時區的函數
  const formatTimezone = (timezone?: string) => {
    if (!timezone) return '';
    
    // 嘗試獲取時區縮寫
    try {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        timeZone: timezone,
        timeZoneName: 'short'
      };
      // 使用en-US來獲取標準化的時區縮寫（如EDT、PDT等）
      const timeString = new Intl.DateTimeFormat('en-US', options).format(now);
      
      // 提取時區縮寫，例如從 "5/24/2023, 8:00 AM EDT" 提取 "EDT"
      const tzMatch = timeString.match(/[A-Z]{3,4}$/);
      if (tzMatch) {
        return tzMatch[0]; // 返回時區縮寫，如 "EDT"
      }
      
      // 如果沒有找到標準縮寫，嘗試獲取GMT偏移
      const gmtMatch = timeString.match(/GMT[+-]\d+/);
      return gmtMatch ? gmtMatch[0] : timezone.split('/').pop()?.replace('_', ' ') || timezone;
    } catch (_) { // eslint-disable-line @typescript-eslint/no-unused-vars
      // 發生錯誤時返回簡化的時區名稱
      return timezone.includes('/') 
        ? timezone.split('/').pop()?.replace('_', ' ')
        : timezone;
    }
  };

  // 顯示日期時間及時區
  const formatDateTime = (dateTimeStr: string, timezone?: string) => {
    const date = new Date(dateTimeStr);
    const formattedDate = format(date, "yyyy/MM/dd HH:mm");
    const timezoneStr = timezone ? ` ${formatTimezone(timezone)}` : '';
    return `${formattedDate}${timezoneStr}`;
  };

  // 檢查用戶身份
  useEffect(() => {
    const checkAuth = async () => {
      if (!isAuthenticated()) {
        router.push('/login');
        return;
      }
      
      try {
        const userData = await getCurrentUser();
        if (!userData) {
          router.push('/login');
          return;
        }
        
        setUserId(userData.id);
      } catch (e) {
        console.error("獲取用戶數據錯誤:", e);
        router.push('/login');
      }
    };
    
    checkAuth();
  }, [router]);
  
  // 獲取活動和會議數據
  useEffect(() => {
    async function fetchData() {
      if (!userId) return;
      
      try {
        setIsLoading(true);
        
        // 獲取活動
        const eventsData = await getOrganizerEvents(userId);
        setEvents(adaptNewEventsToOld(eventsData));
        
        // 獲取會議
        const meetingsData = await getOrganizerMeetings(userId);
        setMeetings(meetingsData);
      } catch (error) {
        console.error("獲取數據錯誤:", error);
        setError("無法加載主辦方數據。請稍後再試。");
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchData();
  }, [userId]);
  
  // 計算統計數據
  const totalEvents = events.length;
  const upcomingMeetings = meetings.filter(meeting => 
    meeting.status === MEETING_STATUS.CONFIRMED && 
    meeting.confirmed_time && 
    new Date(meeting.confirmed_time) > new Date()
  ).length;
  const totalSponsors = new Set(events.flatMap(event => event.sponsor_ids)).size;
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return (
    <div className="bg-background min-h-screen pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-foreground mb-8">主辦方儀表板</h1>
        
        {error && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}
        
        {/* 統計卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">總活動數</CardTitle>
              <BarChart3Icon className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalEvents}</div>
              <p className="text-xs text-muted-foreground">已創建的活動</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">即將到來的會議</CardTitle>
              <CalendarIcon className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{upcomingMeetings}</div>
              <p className="text-xs text-muted-foreground">已確認的會議</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">贊助商數量</CardTitle>
              <UserIcon className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalSponsors}</div>
              <p className="text-xs text-muted-foreground">參與贊助的贊助商</p>
            </CardContent>
          </Card>
        </div>
        
        <Tabs defaultValue="events" className="space-y-4">
          <TabsList>
            <TabsTrigger value="events">我的活動</TabsTrigger>
            <TabsTrigger value="meetings">我的會議</TabsTrigger>
          </TabsList>
          
          <TabsContent value="events" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>活動列表</CardTitle>
                <CardDescription>您創建的所有活動</CardDescription>
              </CardHeader>
              <CardContent>
                {events.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-muted-foreground">您還沒有創建任何活動。</p>
                    <Button variant="default" className="mt-4" onClick={() => router.push('/organizer/events/create')}>
                      創建活動
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {events.map((event) => (
                      <div key={event.id} className="border rounded-lg p-4">
                        <div className="flex flex-col md:flex-row justify-between">
                          <div>
                            <h3 className="text-lg font-medium text-foreground">{event.title}</h3>
                            <p className="mt-2 text-sm text-muted-foreground">{event.description.substring(0, 100)}...</p>
                            
                            <div className="mt-4 flex items-center text-sm text-muted-foreground">
                              <CalendarIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                              <span>
                                {formatDateTime(event.start_time, event.timezone)}
                              </span>
                              {event.timezone && (
                                <ClockIcon className="h-4 w-4 ml-2 mr-1 text-muted-foreground" />
                              )}
                            </div>
                          </div>
                          
                          <div className="mt-4 md:mt-0">
                            <Link href={`/events/${event.id}`}>
                              <Button variant="outline" size="sm">
                                查看詳情
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="meetings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>會議列表</CardTitle>
                <CardDescription>您安排的所有會議</CardDescription>
              </CardHeader>
              <CardContent>
                {meetings.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-muted-foreground">您還沒有安排任何會議。</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {meetings.map((meeting) => (
                      <div key={meeting.id} className="border rounded-lg p-4">
                        <div className="flex flex-col md:flex-row justify-between">
                          <div>
                            <div className="flex items-center">
                              <h3 className="text-lg font-medium text-foreground">{meeting.title}</h3>
                              <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                meeting.status === MEETING_STATUS.CONFIRMED ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 
                                meeting.status === MEETING_STATUS.CANCELLED ? 'bg-destructive/10 text-destructive' : 
                                'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                              }`}>
                                {meeting.status === MEETING_STATUS.CONFIRMED ? '已確認' : 
                                 meeting.status === MEETING_STATUS.CANCELLED ? '已取消' : 
                                 '待確認'}
                              </span>
                            </div>
                            
                            <p className="mt-2 text-sm text-muted-foreground">{meeting.description}</p>
                            
                            {meeting.confirmed_time && (
                              <div className="mt-4 flex items-center text-sm text-muted-foreground">
                                <CalendarIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                                <span>
                                  {formatDateTime(meeting.confirmed_time, meeting.timezone)}
                                </span>
                              </div>
                            )}
                          </div>
                          
                          <div className="mt-4 md:mt-0">
                            {meeting.status === MEETING_STATUS.REQUESTED && (
                              <Button variant="default" size="sm">
                                確認會議
                              </Button>
                            )}
                            
                            {meeting.status === MEETING_STATUS.CONFIRMED && meeting.meeting_link && (
                              <a 
                                href={meeting.meeting_link} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="inline-block"
                              >
                                <Button variant="outline" size="sm">
                                  加入會議
                                </Button>
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 
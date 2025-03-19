'use client';

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarIcon, BarChart3Icon, ClockIcon } from "lucide-react";
import { getSponsorMeetings, getSponsorships } from "@/lib/services/sponsorService";
import { getEventById } from "@/services/eventService";
import { CartItem, Meeting, MEETING_STATUS } from "@/lib/types/users";
import { USER_ROLES } from "@/lib/types/users";
import { SponsorshipPlan } from "@/types/event";
import { getCurrentUser, hasRole, isAuthenticated } from "@/lib/services/authService";

// 定義簡化的事件類型，只包含我們需要的屬性
interface EventData {
  id: string;
  title: string;
  start_time?: string;
  end_time?: string;
  description?: string;
  cover_image?: string;
  location?: {
    name?: string;
    address?: string;
  };
  organizer_id?: string;
  status?: string;
  category?: string;
  tags?: string[];
}

interface SponsorshipWithDetails {
  cartItem: CartItem;
  plan: SponsorshipPlan;
  event: EventData;
}

export default function SponsorDashboardPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sponsorships, setSponsorships] = useState<SponsorshipWithDetails[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  
  // 檢查用戶身份
  useEffect(() => {
    const checkAuth = async () => {
      if (!isAuthenticated()) {
        router.push('/login');
        return;
      }
      
      if (!hasRole(USER_ROLES.SPONSOR)) {
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
  
  // 獲取贊助和會議數據
  useEffect(() => {
    async function fetchData() {
      if (!userId) return;
      
      try {
        setIsLoading(true);
        
        // 獲取贊助
        const sponsorshipsData = await getSponsorships(userId);
        
        // 獲取每個贊助的詳細信息
        const sponsorshipsWithDetails = await Promise.all(
          sponsorshipsData.map(async (item) => {
            try {
              // 獲取贊助方案詳情 - 修正 API 路徑
              const planResponse = await fetch(`/api/sponsorships/plans/${item.sponsorship_plan_id}`);
              if (!planResponse.ok) {
                console.error(`獲取贊助方案失敗: ${planResponse.status}`);
                return null;
              }
              const planData = await planResponse.json();
              
              // 獲取活動詳情 - 修正 event_id 格式
              let eventId = planData.event_id;
              // 如果 event_id 格式為 "event-1"，則轉換為 "1"
              if (eventId.startsWith('event-')) {
                eventId = eventId.replace('event-', '');
              }
              
              const eventData = await getEventById(eventId);
              
              return {
                cartItem: item,
                plan: planData,
                event: eventData
              };
            } catch (error) {
              console.error("獲取贊助詳情錯誤:", error);
              return null;
            }
          })
        );
        
        // 過濾掉獲取失敗的項目
        setSponsorships(sponsorshipsWithDetails.filter(Boolean) as SponsorshipWithDetails[]);
        
        // 獲取會議
        const meetingsData = await getSponsorMeetings(userId);
        setMeetings(meetingsData);
      } catch (error) {
        console.error("獲取數據錯誤:", error);
        setError("無法加載贊助商數據。請稍後再試。");
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchData();
  }, [userId]);
  
  // 計算統計數據
  const totalSponsored = sponsorships.length;
  const totalInvestment = sponsorships.reduce((sum, item) => sum + item.plan.price, 0);
  const upcomingMeetings = meetings.filter(meeting => 
    meeting.status === MEETING_STATUS.CONFIRMED && 
    meeting.confirmed_time && 
    new Date(meeting.confirmed_time) > new Date()
  ).length;
  
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
        <h1 className="text-3xl font-bold text-foreground mb-8">贊助商儀表板</h1>
        
        {error && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}
        
        {/* 統計卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">總贊助數</CardTitle>
              <BarChart3Icon className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalSponsored}</div>
              <p className="text-xs text-muted-foreground">已確認的贊助</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">總投資額</CardTitle>
              <svg className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalInvestment}</div>
              <p className="text-xs text-muted-foreground">贊助總金額</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">即將到來的會議</CardTitle>
              <ClockIcon className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{upcomingMeetings}</div>
              <p className="text-xs text-muted-foreground">已確認的會議</p>
            </CardContent>
          </Card>
        </div>
        
        <Tabs defaultValue="sponsorships" className="space-y-4">
          <TabsList>
            <TabsTrigger value="sponsorships">我的贊助</TabsTrigger>
            <TabsTrigger value="meetings">我的會議</TabsTrigger>
          </TabsList>
          
          <TabsContent value="sponsorships" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>贊助列表</CardTitle>
                <CardDescription>您已確認的所有贊助</CardDescription>
              </CardHeader>
              <CardContent>
                {sponsorships.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-muted-foreground">您還沒有任何贊助。</p>
                    <Button variant="default" className="mt-4" onClick={() => router.push('/events')}>
                      瀏覽活動
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {sponsorships.map((sponsorship) => (
                      <div key={sponsorship.cartItem.id} className="border rounded-lg p-4">
                        <div className="flex flex-col md:flex-row justify-between">
                          <div>
                            <h3 className="text-lg font-medium text-foreground">{sponsorship.plan.title}</h3>
                            <Link 
                              href={`/events/${sponsorship.event.id}`}
                              className="text-sm text-primary hover:text-primary/80"
                            >
                              {sponsorship.event.title}
                            </Link>
                            <p className="mt-2 text-sm text-muted-foreground">{sponsorship.plan.description}</p>
                            
                            <div className="mt-4 flex items-center text-sm text-muted-foreground">
                              <CalendarIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                              <span>
                                {sponsorship.event.start_time ? 
                                  format(new Date(sponsorship.event.start_time), "yyyy年MM月dd日") : 
                                  "日期待定"}
                              </span>
                            </div>
                          </div>
                          
                          <div className="mt-4 md:mt-0 text-right">
                            <p className="text-lg font-medium text-foreground">${sponsorship.plan.price}</p>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-2">
                              已確認
                            </span>
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
                    <Button variant="default" className="mt-4" onClick={() => router.push('/meetings')}>
                      安排會議
                    </Button>
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
                                meeting.status === MEETING_STATUS.CONFIRMED ? 'bg-green-100 text-green-800' : 
                                meeting.status === MEETING_STATUS.CANCELLED ? 'bg-destructive/10 text-destructive' : 
                                'bg-yellow-100 text-yellow-800'
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
                                  {format(new Date(meeting.confirmed_time), "yyyy年MM月dd日 HH:mm")}
                                </span>
                              </div>
                            )}
                            
                            {meeting.meeting_link && (
                              <div className="mt-2">
                                <a 
                                  href={meeting.meeting_link} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-sm text-primary hover:text-primary/80"
                                >
                                  會議連結
                                </a>
                              </div>
                            )}
                          </div>
                          
                          <div className="mt-4 md:mt-0">
                            {meeting.status === MEETING_STATUS.CONFIRMED && (
                              <Button variant="outline" size="sm">
                                加入會議
                              </Button>
                            )}
                            
                            {meeting.status === MEETING_STATUS.REQUESTED && (
                              <div className="text-sm text-muted-foreground">
                                等待確認
                              </div>
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
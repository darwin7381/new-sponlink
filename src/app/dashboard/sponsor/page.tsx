'use client';

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarIcon, BarChart3Icon, ClockIcon } from "lucide-react";
import { getSponsorMeetings, getSponsorships, cancelMeeting } from "@/lib/services/sponsorService";
import { getEventById } from "@/services/eventService";
import { CartItem, Meeting, MEETING_STATUS } from "@/lib/types/users";
import { SponsorshipPlan } from "@/types/event";
import { getCurrentUser, isAuthenticated } from "@/lib/services/authService";
import { toast } from "sonner";
import { mockSponsorshipPlans } from '@/mocks/sponsorshipData';

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
  event: EventData | null;
}

export default function SponsorDashboardPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sponsorships, setSponsorships] = useState<SponsorshipWithDetails[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [isCancellingMeeting, setIsCancellingMeeting] = useState(false);
  
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
        console.error("Error getting user data:", e);
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
              // 直接從模擬數據中獲取贊助方案
              const planData = mockSponsorshipPlans.find(
                plan => plan.id === item.sponsorship_plan_id
              );
              
              if (!planData) {
                console.error(`Sponsorship plan not found: ${item.sponsorship_plan_id}`);
                return null;
              }
              
              // 獲取活動詳情 - 修正 event_id 格式
              let eventId = planData.event_id;
              // 如果 event_id 格式為 "event-1"，則轉換為 "1"
              if (eventId && eventId.startsWith('event-')) {
                eventId = eventId.replace('event-', '');
              }
              
              const eventData = await getEventById(eventId);
              
              return {
                cartItem: item,
                plan: planData,
                event: eventData
              };
            } catch (error) {
              console.error("Error getting sponsorship details:", error);
              return null;
            }
          })
        );
        
        // 過濾無效的贊助
        const validSponsorships = sponsorshipsWithDetails.filter(
          (item): item is NonNullable<typeof item> => item !== null
        ) as SponsorshipWithDetails[];
        
        setSponsorships(validSponsorships);
        
        // 獲取會議
        const meetingsData = await getSponsorMeetings(userId);
        const filteredMeetings = meetingsData.filter(meeting => meeting.status !== MEETING_STATUS.CANCELLED);
        setMeetings(filteredMeetings);
        
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setError("Failed to load dashboard data. Please try again later.");
        setIsLoading(false);
      }
    }
    
    if (userId) {
      fetchData();
    }
  }, [userId]);
  
  // 計算統計數據
  const totalSponsored = sponsorships.length;
  const totalInvestment = sponsorships.reduce((sum, item) => sum + item.plan.price, 0);
  const upcomingMeetings = meetings.filter(meeting => 
    meeting.status === MEETING_STATUS.CONFIRMED && 
    meeting.confirmed_time && 
    new Date(meeting.confirmed_time) > new Date()
  ).length;
  
  // 取消會議
  const handleCancelMeeting = async (meetingId: string) => {
    try {
      setIsCancellingMeeting(true);
      await cancelMeeting(meetingId);
      
      // 重新加載會議數據
      const updatedMeetings = await getSponsorMeetings(userId as string);
      const filteredMeetings = updatedMeetings.filter(meeting => meeting.status !== MEETING_STATUS.CANCELLED);
      setMeetings(filteredMeetings);
      
      toast.success("Meeting cancelled successfully");
    } catch (error) {
      console.error("Error cancelling meeting:", error);
      toast.error("Failed to cancel meeting");
    } finally {
      setIsCancellingMeeting(false);
    }
  };
  
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
        <h1 className="text-3xl font-bold text-foreground mb-8">Sponsor Dashboard</h1>
        
        {error && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}
        
        {/* 統計卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sponsorships</CardTitle>
              <BarChart3Icon className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalSponsored}</div>
              <p className="text-xs text-muted-foreground">Confirmed sponsorships</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Investment</CardTitle>
              <svg className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalInvestment}</div>
              <p className="text-xs text-muted-foreground">Total sponsorship amount</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming Meetings</CardTitle>
              <ClockIcon className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{upcomingMeetings}</div>
              <p className="text-xs text-muted-foreground">Confirmed meetings</p>
            </CardContent>
          </Card>
        </div>
        
        <Tabs defaultValue="sponsorships" className="space-y-4">
          <TabsList>
            <TabsTrigger value="sponsorships">My Sponsorships</TabsTrigger>
            <TabsTrigger value="meetings">My Meetings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="sponsorships" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Sponsorship List</CardTitle>
                <CardDescription>All confirmed sponsorships</CardDescription>
              </CardHeader>
              <CardContent>
                {sponsorships.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-muted-foreground">You haven&apos;t sponsored any event yet.</p>
                    <Button variant="default" className="mt-4" onClick={() => router.push('/events')}>
                      Browse Events
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
                              href={`/events/${sponsorship.event?.id}`}
                              className="text-sm text-primary hover:text-primary/80"
                            >
                              {sponsorship.event?.title}
                            </Link>
                            <p className="mt-2 text-sm text-muted-foreground">{sponsorship.plan.description}</p>
                            
                            <div className="mt-4 flex items-center text-sm text-muted-foreground">
                              <CalendarIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                              <span>
                                {sponsorship.event?.start_time ? 
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
                <CardTitle>Meeting List</CardTitle>
                <CardDescription>All scheduled meetings</CardDescription>
              </CardHeader>
              <CardContent>
                {meetings.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-muted-foreground">You haven&apos;t scheduled any meeting yet.</p>
                    <Button variant="default" className="mt-4" onClick={() => router.push('/meetings')}>
                      Schedule Meeting
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
                                  Meeting Link
                                </a>
                              </div>
                            )}
                          </div>
                          
                          <div className="mt-4 md:mt-0">
                            {meeting.status === MEETING_STATUS.CONFIRMED && (
                              <Button variant="outline" size="sm">
                                Join Meeting
                              </Button>
                            )}
                            
                            {meeting.status === MEETING_STATUS.REQUESTED && (
                              <div className="text-sm text-muted-foreground">
                                Waiting for confirmation
                              </div>
                            )}
                            
                            {meeting.status !== MEETING_STATUS.CANCELLED && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-destructive hover:text-destructive/80"
                                onClick={() => handleCancelMeeting(meeting.id)}
                                disabled={isCancellingMeeting}
                              >
                                Cancel
                              </Button>
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
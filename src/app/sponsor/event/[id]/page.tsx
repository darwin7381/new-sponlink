"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import ProtectedRouteWrapper from '@/components/auth/ProtectedRouteWrapper';
import { VIEW_TYPE } from '@/lib/services/authService';
import { mockEvents } from '@/mocks/eventData';
import { Event } from '@/types/event';

interface EventSponsorshipPageProps {
  params: Promise<{ id: string }>;
}

// 辅助函数
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('zh-TW', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

export default function EventSponsorshipPage({ params }: EventSponsorshipPageProps) {
  const router = useRouter();
  const [eventId, setEventId] = useState<string>("");
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 解析params参数
  useEffect(() => {
    const resolveParams = async () => {
      try {
        const resolvedParams = await params;
        setEventId(resolvedParams.id);
      } catch (error) {
        console.error("Error resolving params:", error);
        setError("無法獲取活動ID");
      }
    };
    
    resolveParams();
  }, [params]);

  // 获取活动数据
  useEffect(() => {
    const fetchData = async () => {
      if (!eventId) return;
      
      try {
        setLoading(true);
        
        // 从模拟数据中获取活动信息
        const eventData = mockEvents.find(e => e.id === eventId);
        
        if (!eventData) {
          setError('找不到該活動');
          setLoading(false);
          return;
        }
        
        setEvent(eventData);
      } catch (error) {
        console.error('获取活动详情失败:', error);
        setError('获取活动信息失败，请稍后重试');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [eventId]);

  const EventSponsorshipContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-lg">載入中...</p>
        </div>
      );
    }
    
    if (error || !event) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <h2 className="text-xl font-semibold text-red-600 mb-2">
            {error || '找不到該活動'}
          </h2>
          <Button 
            onClick={() => router.push('/sponsor')} 
            className="mt-4"
          >
            返回贊助商中心
          </Button>
        </div>
      );
    }
    
    // 如果活动没有赞助方案
    if (!event.sponsorship_plans || event.sponsorship_plans.length === 0) {
      return (
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <Link href="/sponsor">
                <Button variant="ghost" className="mb-2 -ml-2 flex items-center gap-1">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-4 w-4" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  返回贊助商中心
                </Button>
              </Link>
              <h1 className="text-3xl font-bold">{event.title}</h1>
              <p className="text-muted-foreground mt-2">{event.start_time ? new Date(event.start_time).toLocaleDateString('zh-TW') : ''} - {event.end_time ? new Date(event.end_time).toLocaleDateString('zh-TW') : ''}</p>
            </div>
          </div>
          
          <div className="flex flex-col items-center justify-center min-h-[40vh] bg-card rounded-lg border border-border p-8">
            <svg 
              className="h-16 w-16 text-muted-foreground/60" 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={1.5} 
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
              />
            </svg>
            <h3 className="mt-4 text-xl font-medium">此活動目前沒有贊助方案</h3>
            <p className="mt-2 text-center text-muted-foreground max-w-md">
              此活動目前尚未開放贊助，請稍後再查看或查看其他活動的贊助機會。
            </p>
            <div className="mt-6">
              <Link href="/sponsor">
                <Button>返回贊助商中心</Button>
              </Link>
            </div>
          </div>
        </div>
      );
    }
    
    return (
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* 顶部导航和标题 */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href="/sponsor">
              <Button variant="ghost" className="mb-2 -ml-2 flex items-center gap-1">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-4 w-4" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                返回贊助商中心
              </Button>
            </Link>
            <h1 className="text-3xl font-bold">{event.title}</h1>
            <p className="text-muted-foreground mt-2">{event.start_time ? new Date(event.start_time).toLocaleDateString('zh-TW') : ''} - {event.end_time ? new Date(event.end_time).toLocaleDateString('zh-TW') : ''}</p>
          </div>
        </div>
        
        {/* 活动详情卡片 */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>活動詳情</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">{event.description}</p>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {event.tags?.map((tag, index) => (
                  <Badge key={index} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
              
              <div className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">活動時間</p>
                  <p className="text-sm text-muted-foreground">
                    {event.start_time ? new Date(event.start_time).toLocaleDateString('zh-TW') : ''} - {event.end_time ? new Date(event.end_time).toLocaleDateString('zh-TW') : ''}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm font-medium">活動地點</p>
                  <p className="text-sm text-muted-foreground">
                    {event.location?.name}
                    {event.location?.city && `, ${event.location.city}`}
                    {event.location?.country && `, ${event.location.country}`}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* 贊助方案列表 */}
        <h2 className="text-2xl font-bold mb-6">可用贊助方案</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {event.sponsorship_plans?.map((plan) => (
            <Card key={plan.id} className="flex flex-col">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{plan.title}</CardTitle>
                    <CardDescription className="mt-1">{plan.description}</CardDescription>
                  </div>
                  <Badge variant="secondary" className="text-lg px-3 py-1 whitespace-nowrap">
                    {formatCurrency(plan.price)}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="flex-grow">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium mb-2">贊助權益</h3>
                    <ul className="space-y-2">
                      {plan.benefits.map((benefit, index) => (
                        <li key={index} className="flex items-start">
                          <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" 
                            viewBox="0 0 20 20" 
                            fill="currentColor"
                          >
                            <path 
                              fillRule="evenodd" 
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" 
                              clipRule="evenodd" 
                            />
                          </svg>
                          <span className="text-sm">{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="pt-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        已有 {plan.current_sponsors || 0} 位贊助商，共 {plan.max_sponsors || 0} 個名額
                      </span>
                      <Badge variant="outline" className="text-xs">
                        剩餘 {(plan.max_sponsors || 0) - (plan.current_sponsors || 0)} 個名額
                      </Badge>
                    </div>
                    <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${((plan.current_sponsors || 0) / (plan.max_sponsors || 1)) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </CardContent>
              
              <CardFooter>
                <Button className="w-full">申請此贊助方案</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
        
        {/* 联系主办方区域 */}
        <div className="mt-12 bg-muted/30 rounded-lg p-8 border border-border">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h3 className="text-xl font-bold mb-2">需要更多信息？</h3>
              <p className="text-muted-foreground">
                如果您有關於贊助方案的問題，或想了解定制贊助選項，請直接與活動主辦方聯繫。
              </p>
            </div>
            <Button variant="outline" className="whitespace-nowrap">
              聯繫主辦方
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <ProtectedRouteWrapper requiredView={VIEW_TYPE.SPONSORSHIP_MANAGER}>
      <EventSponsorshipContent />
    </ProtectedRouteWrapper>
  );
} 
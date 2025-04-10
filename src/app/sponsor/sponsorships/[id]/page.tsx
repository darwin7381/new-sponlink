"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { VIEW_TYPE } from '@/lib/services/authService';
import { MOCK_SPONSORSHIP_PLANS, SponsorshipPlan } from '@/lib/mocks/sponsorships';
import { Event } from '@/types/event';
import { mockEvents as MOCK_EVENTS } from '@/mocks/eventData';

interface SponsorshipDetailPageProps {
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

export default function SponsorshipDetailPage({ params }: SponsorshipDetailPageProps) {
  const router = useRouter();
  const [planId, setPlanId] = useState<string>("");
  const [plan, setPlan] = useState<SponsorshipPlan | null>(null);
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 解析params参数
  useEffect(() => {
    const resolveParams = async () => {
      try {
        const resolvedParams = await params;
        setPlanId(resolvedParams.id);
      } catch (error) {
        console.error("Error resolving params:", error);
        setError("無法獲取贊助方案ID");
      }
    };
    
    resolveParams();
  }, [params]);

  // 获取数据
  useEffect(() => {
    const fetchData = async () => {
      if (!planId) return;
      
      try {
        setLoading(true);
        
        // 在真实应用中，这里应该是API调用
        // 模拟从后端获取赞助方案数据
        const planData = MOCK_SPONSORSHIP_PLANS.find(p => 
          p.id === planId || 
          p.id === `plan-${planId}` || 
          planId.includes(p.id)
        );
        
        if (!planData) {
          setError('找不到該贊助方案');
          setLoading(false);
          return;
        }
        
        setPlan(planData);
        
        // 获取相关联的活动
        // 在真实应用中，这里应该是API调用
        if (planData.event_id) {
          const eventData = MOCK_EVENTS.find((e: Event) => e.id === planData.event_id);
          if (eventData) {
            setEvent(eventData);
          }
        }
      } catch (error) {
        console.error('获取赞助方案详情失败:', error);
        setError('获取赞助方案信息失败，请稍后重试');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [planId]);

  const SponsorshipDetailContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-lg">載入中...</p>
        </div>
      );
    }
    
    if (error || !plan) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <h2 className="text-xl font-semibold text-red-600 mb-2">
            {error || '找不到該贊助方案'}
          </h2>
          <Button 
            onClick={() => router.push('/sponsor/sponsorships')} 
            className="mt-4"
          >
            返回贊助列表
          </Button>
        </div>
      );
    }
    
    return (
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* 顶部导航和标题 */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href="/sponsor/sponsorships">
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
                返回贊助列表
              </Button>
            </Link>
            <h1 className="text-3xl font-bold">贊助方案詳情</h1>
          </div>
          <div>
            <Link href={`/sponsor`}>
              <Button variant="outline">
                返回贊助商中心
              </Button>
            </Link>
          </div>
        </div>
        
        {/* 主要内容 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* 左侧 - 方案详情 */}
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl">{plan.title}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                  </div>
                  <Badge variant="secondary" className="text-lg px-3 py-1">
                    {formatCurrency(plan.price)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium mb-2">贊助權益</h3>
                    <ul className="space-y-2">
                      {plan.benefits.map((benefit, index) => (
                        <li key={index} className="flex items-start">
                          <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            className="h-5 w-5 text-green-500 mr-2 mt-0.5" 
                            viewBox="0 0 20 20" 
                            fill="currentColor"
                          >
                            <path 
                              fillRule="evenodd" 
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" 
                              clipRule="evenodd" 
                            />
                          </svg>
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="pt-4 border-t border-border">
                    <h3 className="text-lg font-medium mb-2">贊助名額</h3>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        目前已有 {plan.current_sponsors} 位贊助商，共 {plan.max_sponsors} 個名額
                      </span>
                      <Badge variant="outline">
                        剩餘 {plan.max_sponsors - plan.current_sponsors} 個名額
                      </Badge>
                    </div>
                    <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${(plan.current_sponsors / plan.max_sponsors) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {event && (
              <Card>
                <CardHeader>
                  <CardTitle>活動資訊</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium">{event.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {event.tags?.map((tag, index) => (
                        <Badge key={index} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="pt-4 grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium">活動時間</p>
                        <p className="text-sm text-muted-foreground">
                          {event.start_time ? new Date(event.start_time).toLocaleDateString('zh-TW') : ''}
                          {event.end_time ? ` - ${new Date(event.end_time).toLocaleDateString('zh-TW')}` : ''}
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
                    
                    <div className="pt-4">
                      <Link href={`/events/${event.id}`}>
                        <Button variant="outline" className="w-full">查看活動詳情</Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
          
          {/* 右侧 - 操作区域 */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>申請贊助</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    成為贊助商後，您將獲得活動曝光機會和專業資源。
                  </p>
                  
                  <div className="pt-2">
                    <Button className="w-full">申請此贊助方案</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>與主辦方聯絡</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    想了解更多關於此贊助方案的信息？直接與主辦方聯絡。
                  </p>
                  
                  <div className="pt-2">
                    <Button variant="outline" className="w-full">安排會議</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>相關文件</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button variant="ghost" className="w-full justify-start">
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="h-4 w-4 mr-2" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
                      />
                    </svg>
                    贊助合約範本
                  </Button>
                  
                  <Button variant="ghost" className="w-full justify-start">
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="h-4 w-4 mr-2" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
                      />
                    </svg>
                    活動手冊
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  };

  return (
    <SponsorshipDetailContent />
  );
} 
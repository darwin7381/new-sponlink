'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { SponsorshipPlan } from '@/types/event';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { addToCart } from '@/services/sponsorService';
import { useAuth } from '@/components/auth/AuthProvider';
import { getEventById } from '@/services/eventService';
import { ComparisonSaveButton } from '@/components/common/ComparisonSaveButton';

export default function ComparePage() {
  const [plansToCompare, setPlansToCompare] = useState<SponsorshipPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [eventNames, setEventNames] = useState<Record<string, string>>({});
  const { isLoggedIn, user } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    // 從 localStorage 獲取要比較的計劃
    const loadPlans = () => {
      try {
        const storedPlans = localStorage.getItem('plansToCompare');
        if (storedPlans) {
          const parsedPlans = JSON.parse(storedPlans) as SponsorshipPlan[];
          setPlansToCompare(parsedPlans);
          
          // 獲取所有活動名稱
          const fetchEventNames = async () => {
            const names: Record<string, string> = {};
            
            for (const plan of parsedPlans) {
              if (!names[plan.event_id]) {
                try {
                  const event = await getEventById(plan.event_id);
                  if (event) {
                    names[plan.event_id] = event.title;
                  }
                } catch (error) {
                  console.error(`無法獲取活動 ${plan.event_id} 的詳情`, error);
                  names[plan.event_id] = '未知活動';
                }
              }
            }
            
            setEventNames(names);
          };
          
          fetchEventNames();
        }
      } catch (error) {
        console.error('無法加載比較計劃:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadPlans();
    
    // 監聽計劃更新
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'plansToCompare') {
        loadPlans();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);
  
  // 添加到購物車功能
  const handleAddToCart = async (plan: SponsorshipPlan) => {
    if (!isLoggedIn || !user?.id) {
      router.push('/login');
      return;
    }
    
    try {
      await addToCart(user.id, plan.id);
      alert('已成功添加到購物車');
    } catch (error) {
      console.error('添加到購物車錯誤:', error);
      alert('無法添加到購物車，請稍後再試');
    }
  };
  
  // 移除對比項目
  const handleRemove = (planId: string) => {
    const updatedPlans = plansToCompare.filter(p => p.id !== planId);
    setPlansToCompare(updatedPlans);
    localStorage.setItem('plansToCompare', JSON.stringify(updatedPlans));
  };
  
  // 清空所有比較項目
  const handleClearAll = () => {
    setPlansToCompare([]);
    localStorage.removeItem('plansToCompare');
  };
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">贊助方案比較</h1>
        <div className="flex gap-3">
          {plansToCompare.length > 0 && (
            <>
              <ComparisonSaveButton 
                comparisonItems={plansToCompare.map(plan => ({
                  type: 'sponsorship_plan',
                  id: plan.id,
                  metadata: {
                    title: plan.title,
                    price: plan.price,
                    event_id: plan.event_id,
                    event_name: eventNames[plan.event_id] || '未知活動'
                  }
                }))}
                comparisonCriteria={['price', 'benefits', 'max_sponsors']}
              />
              <Button variant="outline" onClick={handleClearAll}>清空比較清單</Button>
            </>
          )}
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center min-h-[200px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : plansToCompare.length === 0 ? (
        <Card>
          <CardContent className="pt-6 px-6 text-center">
            <div className="mb-4">
              <svg className="mx-auto h-12 w-12 text-muted-foreground" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-foreground">尚未添加任何方案進行比較</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              瀏覽活動頁面並添加贊助方案到比較清單
            </p>
            <div className="mt-6">
              <Link href="/events">
                <Button variant="default">瀏覽活動</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-muted">
                <th className="p-3 border">比較項目</th>
                {plansToCompare.map(plan => (
                  <th key={plan.id} className="p-3 border">
                    <div className="flex flex-col items-center">
                      <span className="font-medium">{plan.title}</span>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleRemove(plan.id)}
                        className="mt-2"
                      >
                        移除
                      </Button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="p-3 border font-medium">活動名稱</td>
                {plansToCompare.map(plan => (
                  <td key={plan.id} className="p-3 border text-center">
                    <Link href={`/events/${plan.event_id}`} className="text-primary hover:underline">
                      {eventNames[plan.event_id] || '載入中...'}
                    </Link>
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-3 border font-medium">方案價格</td>
                {plansToCompare.map(plan => (
                  <td key={plan.id} className="p-3 border text-center">
                    ¥{plan.price.toLocaleString()}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-3 border font-medium">方案描述</td>
                {plansToCompare.map(plan => (
                  <td key={plan.id} className="p-3 border">
                    {plan.description}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-3 border font-medium">福利內容</td>
                {plansToCompare.map(plan => (
                  <td key={plan.id} className="p-3 border">
                    <ul className="list-disc pl-5">
                      {plan.benefits.map((benefit, index) => (
                        <li key={index} className="mb-1">{benefit}</li>
                      ))}
                    </ul>
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-3 border font-medium">可用名額</td>
                {plansToCompare.map(plan => (
                  <td key={plan.id} className="p-3 border text-center">
                    {plan.max_sponsors && plan.current_sponsors !== undefined ? 
                      `${plan.max_sponsors - plan.current_sponsors}/${plan.max_sponsors}` : 
                      '不限'}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-3 border font-medium">操作</td>
                {plansToCompare.map(plan => (
                  <td key={plan.id} className="p-3 border text-center">
                    <Button 
                      onClick={() => handleAddToCart(plan)}
                      className="w-full"
                    >
                      添加到購物車
                    </Button>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
} 
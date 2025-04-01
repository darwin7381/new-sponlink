"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getSponsorships } from '@/lib/services/sponsorService';
import { CartItem, CART_ITEM_STATUS, User } from '@/lib/types/users';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getCurrentUser, VIEW_TYPE } from '@/lib/services/authService';
import ProtectedRouteWrapper from '@/components/auth/ProtectedRouteWrapper';

export default function SponsorshipsPage() {
  const [sponsorships, setSponsorships] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 獲取用戶資料，無需檢查角色
        const user = await getCurrentUser();
        if (!user) {
          return;
        }

        const sponsorshipsData = await getSponsorships(user.id);
        setSponsorships(sponsorshipsData);
      } catch (error) {
        console.error('Error fetching sponsorships:', error);
        setError('無法載入贊助資料。請稍後再試。');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  // 頁面內容組件
  const SponsorshipsContent = () => {
    if (loading) {
      return (
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <p className="text-lg">載入中...</p>
          </div>
        </div>
      );
    }
  
    if (error) {
      return (
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-red-600 mb-2">發生錯誤</h2>
              <p>{error}</p>
              <Button 
                onClick={() => window.location.reload()} 
                className="mt-4"
              >
                重試
              </Button>
            </div>
          </div>
        </div>
      );
    }
  
    return (
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">我的贊助</h1>
          <Link href="/sponsor">
            <Button variant="outline" className="flex items-center gap-2">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-5 w-5 mr-1" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="2" 
                  d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                />
              </svg>
              返回贊助商中心
            </Button>
          </Link>
        </div>
        
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="active">進行中</TabsTrigger>
            <TabsTrigger value="completed">已完成</TabsTrigger>
            <TabsTrigger value="all">全部</TabsTrigger>
          </TabsList>
          
          <TabsContent value="active">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sponsorships.filter(s => s.status === CART_ITEM_STATUS.CONFIRMED).map(sponsorship => (
                <SponsorshipCard key={sponsorship.id} sponsorship={sponsorship} />
              ))}
              {sponsorships.filter(s => s.status === CART_ITEM_STATUS.CONFIRMED).length === 0 && (
                <div className="col-span-full text-center py-12">
                  <p className="text-muted-foreground">目前沒有進行中的贊助</p>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="completed">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sponsorships.filter(s => s.status === CART_ITEM_STATUS.CONFIRMED).map(sponsorship => (
                <SponsorshipCard key={sponsorship.id} sponsorship={sponsorship} />
              ))}
              {sponsorships.filter(s => s.status === CART_ITEM_STATUS.CONFIRMED).length === 0 && (
                <div className="col-span-full text-center py-12">
                  <p className="text-muted-foreground">目前沒有已完成的贊助</p>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="all">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sponsorships.map(sponsorship => (
                <SponsorshipCard key={sponsorship.id} sponsorship={sponsorship} />
              ))}
              {sponsorships.length === 0 && (
                <div className="col-span-full text-center py-12">
                  <p className="text-muted-foreground">目前沒有贊助記錄</p>
                  <Button 
                    onClick={() => router.push('/sponsor')} 
                    className="mt-4"
                  >
                    返回贊助商中心
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    );
  };

  // 使用 ProtectedRouteWrapper 包裝頁面
  return (
    <ProtectedRouteWrapper requiredView={VIEW_TYPE.SPONSORSHIP_MANAGER}>
      <SponsorshipsContent />
    </ProtectedRouteWrapper>
  );
}

interface SponsorshipCardProps {
  sponsorship: CartItem;
}

function SponsorshipCard({ sponsorship }: SponsorshipCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>贊助計畫 #{sponsorship.id.slice(-4)}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-2">
          <span className="font-semibold">狀態：</span> 
          {sponsorship.status === CART_ITEM_STATUS.CONFIRMED ? '進行中' : 
           sponsorship.status === CART_ITEM_STATUS.CANCELLED ? '已取消' : '待處理'}
        </p>
        <p className="mb-2">
          <span className="font-semibold">建立日期：</span> 
          {new Date(sponsorship.created_at).toLocaleDateString('zh-TW')}
        </p>
        <div className="mt-4">
          <Link href={`/sponsor/sponsorships/${sponsorship.sponsorship_plan_id}`}>
            <Button variant="outline" className="w-full">
              查看詳情
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
} 
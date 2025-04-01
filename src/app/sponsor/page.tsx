"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/services/authService';
import { USER_ROLES, User } from '@/lib/types/users';
import { Button } from '@/components/ui/button';
import SwitchRoleToggle from '@/components/layout/SwitchRoleToggle';

export default function SponsorPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  
  useEffect(() => {
    const checkUser = async () => {
      try {
        setIsLoading(true);
        const currentUser = await getCurrentUser();
        
        if (!currentUser) {
          router.push('/login');
          return;
        }
        
        setUser(currentUser);
      } catch (error) {
        console.error('Error checking user:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkUser();
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <h1 className="text-2xl font-semibold mb-4">加載中...</h1>
          <p className="text-muted-foreground">請稍候，正在檢查您的帳戶信息。</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen">
      {/* 頂部導航欄 */}
      <div className="bg-primary text-primary-foreground">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between py-4">
            <h1 className="text-xl font-bold px-4">贊助商中心</h1>
            <SwitchRoleToggle currentRole="sponsor" />
          </div>
        </div>
      </div>
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* 左側欄位 */}
          <div className="w-full md:w-1/4 space-y-6">
            <div className="bg-card rounded-lg shadow-sm p-6 border border-border">
              <h2 className="text-lg font-semibold mb-4">快速導航</h2>
              <nav className="space-y-2">
                <Link href="/sponsor/sponsorships" className="block p-2 text-sm hover:bg-accent rounded">
                  我的贊助
                </Link>
                <Link href="/events" className="block p-2 text-sm hover:bg-accent rounded">
                  瀏覽活動
                </Link>
                <Link href="/meetings" className="block p-2 text-sm hover:bg-accent rounded">
                  會議安排
                </Link>
              </nav>
            </div>
            
            <div className="bg-card rounded-lg shadow-sm p-6 border border-border">
              <h2 className="text-lg font-semibold mb-4">贊助統計</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">已贊助活動</p>
                  <p className="text-xl font-semibold">0</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">進行中贊助</p>
                  <p className="text-xl font-semibold">0</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">總贊助金額</p>
                  <p className="text-xl font-semibold">$0</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* 主要內容區 */}
          <div className="w-full md:w-3/4 space-y-6">
            <div className="bg-card rounded-lg shadow-sm p-6 border border-border">
              <h2 className="text-lg font-semibold mb-4">推薦贊助機會</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-border rounded-lg p-4 hover:bg-accent/10 transition-colors">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">ETH Tokyo 2025</h3>
                    <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">推薦</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">5/15/2025 - 5/17/2025 · 東京, 日本</p>
                  <div className="flex justify-between items-center mt-4">
                    <span className="text-sm font-medium">$5,000 起</span>
                    <Button variant="outline" size="sm">查看詳情</Button>
                  </div>
                </div>
                
                <div className="border border-border rounded-lg p-4 hover:bg-accent/10 transition-colors">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">Web3 Summit 2025</h3>
                    <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">熱門</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">6/10/2025 - 6/14/2025 · 舊金山, 美國</p>
                  <div className="flex justify-between items-center mt-4">
                    <span className="text-sm font-medium">$10,000 起</span>
                    <Button variant="outline" size="sm">查看詳情</Button>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 text-right">
                <Link href="/events">
                  <Button variant="ghost" size="sm">
                    查看更多活動
                    <svg 
                      className="ml-1 h-4 w-4" 
                      xmlns="http://www.w3.org/2000/svg" 
                      viewBox="0 0 20 20" 
                      fill="currentColor"
                    >
                      <path 
                        fillRule="evenodd" 
                        d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" 
                        clipRule="evenodd" 
                      />
                    </svg>
                  </Button>
                </Link>
              </div>
            </div>
            
            <div className="bg-card rounded-lg shadow-sm p-6 border border-border">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">我的贊助</h2>
                <Link href="/sponsor/sponsorships">
                  <Button variant="outline" size="sm">查看全部</Button>
                </Link>
              </div>
              
              <div className="text-center py-12">
                <svg 
                  className="mx-auto h-12 w-12 text-muted-foreground/60" 
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
                <h3 className="mt-4 text-lg font-medium">還沒有贊助</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  開始贊助您感興趣的活動，提升您的品牌影響力！
                </p>
                <div className="mt-6">
                  <Link href="/events">
                    <Button>瀏覽活動</Button>
                  </Link>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-card rounded-lg shadow-sm p-6 border border-border">
                <h2 className="text-lg font-semibold mb-4">贊助收益分析</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  了解贊助如何影響您的品牌曝光度和業務增長。
                </p>
                <Button variant="outline" size="sm">查看分析</Button>
              </div>
              
              <div className="bg-card rounded-lg shadow-sm p-6 border border-border">
                <h2 className="text-lg font-semibold mb-4">贊助策略指南</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  探索如何制定有效的贊助策略，最大化投資回報率。
                </p>
                <Button variant="outline" size="sm">查看指南</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/services/authService';
import { USER_ROLES, User } from '@/lib/types/users';
import { Button } from '@/components/ui/button';
import SwitchRoleToggle from '@/components/layout/SwitchRoleToggle';

export default function OrganizerPage() {
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
            <h1 className="text-xl font-bold px-4">主辦方中心</h1>
            <SwitchRoleToggle currentRole="organizer" />
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
                <Link href="/organizer/events" className="block p-2 text-sm hover:bg-accent rounded">
                  我的活動
                </Link>
                <Link href="/organizer/events/create" className="block p-2 text-sm hover:bg-accent rounded">
                  創建活動
                </Link>
                <Link href="/meetings" className="block p-2 text-sm hover:bg-accent rounded">
                  會議安排
                </Link>
              </nav>
            </div>
            
            <div className="bg-card rounded-lg shadow-sm p-6 border border-border">
              <h2 className="text-lg font-semibold mb-4">主辦方統計</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">已創建活動</p>
                  <p className="text-xl font-semibold">0</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">進行中活動</p>
                  <p className="text-xl font-semibold">0</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">已完成活動</p>
                  <p className="text-xl font-semibold">0</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* 主要內容區 */}
          <div className="w-full md:w-3/4 space-y-6">
            <div className="bg-card rounded-lg shadow-sm p-6 border border-border">
              <h2 className="text-lg font-semibold mb-4">推薦活動模板</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-border rounded-lg p-4 hover:bg-accent/10 cursor-pointer">
                  <h3 className="font-medium">線上研討會</h3>
                  <p className="text-sm text-muted-foreground mt-2">適合遠程參與者的虛擬活動模板</p>
                </div>
                <div className="border border-border rounded-lg p-4 hover:bg-accent/10 cursor-pointer">
                  <h3 className="font-medium">線下會議</h3>
                  <p className="text-sm text-muted-foreground mt-2">適合實體場地的面對面活動模板</p>
                </div>
                <div className="border border-border rounded-lg p-4 hover:bg-accent/10 cursor-pointer">
                  <h3 className="font-medium">混合式活動</h3>
                  <p className="text-sm text-muted-foreground mt-2">線上與線下結合的活動模板</p>
                </div>
                <div className="border border-border rounded-lg p-4 hover:bg-accent/10 cursor-pointer">
                  <h3 className="font-medium">區塊鏈大會</h3>
                  <p className="text-sm text-muted-foreground mt-2">專為區塊鏈行業設計的活動模板</p>
                </div>
              </div>
            </div>
            
            <div className="bg-card rounded-lg shadow-sm p-6 border border-border">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">我的活動</h2>
                <Link href="/organizer/events">
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
                    d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v12a2 2 0 01-2 2z" 
                  />
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={1.5} 
                    d="M16 2v4M8 2v4M3 10h18" 
                  />
                </svg>
                <h3 className="mt-4 text-lg font-medium">還沒有活動</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  立即創建您的第一個活動，開始您的主辦方之旅！
                </p>
                <div className="mt-6">
                  <Link href="/organizer/events/create">
                    <Button>創建活動</Button>
                  </Link>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-card rounded-lg shadow-sm p-6 border border-border">
                <h2 className="text-lg font-semibold mb-4">贊助商指南</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  了解如何吸引更多贊助商支持您的活動，提升活動價值。
                </p>
                <Button variant="outline" size="sm">查看指南</Button>
              </div>
              
              <div className="bg-card rounded-lg shadow-sm p-6 border border-border">
                <h2 className="text-lg font-semibold mb-4">活動推廣技巧</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  探索有效的活動推廣策略，提高活動曝光度和參與度。
                </p>
                <Button variant="outline" size="sm">查看技巧</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
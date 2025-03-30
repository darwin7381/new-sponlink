'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { 
  getActiveView, 
  setActiveView, 
  VIEW_TYPE, 
  isAuthenticated 
} from '@/lib/services/authService';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown, Layout, Briefcase } from 'lucide-react';

export function ViewSwitcher() {
  const [activeView, setActiveViewState] = useState<VIEW_TYPE | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  // 初始化并監聽視角變更
  useEffect(() => {
    // 載入當前視角
    const currentView = getActiveView();
    setActiveViewState(currentView);

    // 監聽視角變更事件
    const handleViewChange = () => {
      setActiveViewState(getActiveView());
    };

    window.addEventListener('viewChange', handleViewChange);

    return () => {
      window.removeEventListener('viewChange', handleViewChange);
    };
  }, []);

  // 處理視角切換
  const handleViewSwitch = (view: VIEW_TYPE) => {
    // 保存之前的视角
    const previousView = activeView;
    
    // 更新视角
    setActiveView(view);
    setActiveViewState(view);
    
    // 如果在主仪表板页面并且视角确实发生变化，触发页面刷新以显示新视角内容
    if (pathname === '/dashboard' && previousView !== view) {
      // 仅刷新当前页面内容，不重定向
      router.refresh();
    }
    
    // 如果在特定视角相关页面时，可以选择性地导航到对应的视角首页
    // 例如：从 /dashboard/events/* 切换到赞助视角时，可导航到 /dashboard/sponsorships
    if (previousView !== view) {
      if (view === VIEW_TYPE.EVENT_ORGANIZER && pathname.includes('/dashboard/sponsorships')) {
        router.push('/dashboard/events');
      } else if (view === VIEW_TYPE.SPONSORSHIP_MANAGER && pathname.includes('/dashboard/events')) {
        router.push('/dashboard/sponsorships');
      }
    }
  };

  // 如果用戶未登入，不顯示視角切換器
  if (!isAuthenticated()) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          {activeView === VIEW_TYPE.EVENT_ORGANIZER ? (
            <>
              <Layout className="h-4 w-4" />
              <span>活動組織</span>
            </>
          ) : activeView === VIEW_TYPE.SPONSORSHIP_MANAGER ? (
            <>
              <Briefcase className="h-4 w-4" />
              <span>贊助管理</span>
            </>
          ) : (
            <span>選擇視角</span>
          )}
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>切換視角</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className={activeView === VIEW_TYPE.EVENT_ORGANIZER ? 'bg-accent' : ''}
          onClick={() => handleViewSwitch(VIEW_TYPE.EVENT_ORGANIZER)}
        >
          <Layout className="h-4 w-4 mr-2" />
          <span>活動組織</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          className={activeView === VIEW_TYPE.SPONSORSHIP_MANAGER ? 'bg-accent' : ''}
          onClick={() => handleViewSwitch(VIEW_TYPE.SPONSORSHIP_MANAGER)}
        >
          <Briefcase className="h-4 w-4 mr-2" />
          <span>贊助管理</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 
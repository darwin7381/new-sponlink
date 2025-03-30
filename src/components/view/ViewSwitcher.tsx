'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
    setActiveView(view);
    setActiveViewState(view);

    // 根據新視角重定向到適當的頁面
    if (view === VIEW_TYPE.EVENT_ORGANIZER) {
      router.push('/dashboard/events');
    } else if (view === VIEW_TYPE.SPONSORSHIP_MANAGER) {
      router.push('/dashboard/sponsorships');
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
'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function ComparePanel() {
  const [plansCount, setPlansCount] = useState(0);
  const router = useRouter();
  
  useEffect(() => {
    const updateCount = () => {
      try {
        if (typeof window !== 'undefined') {
          const storedPlans = localStorage.getItem('plansToCompare');
          const count = storedPlans ? JSON.parse(storedPlans).length : 0;
          setPlansCount(count);
        }
      } catch (error) {
        console.error('無法讀取比較計劃數量:', error);
      }
    };
    
    // 初始加載
    updateCount();
    
    // 創建自定義事件以便在添加到比較時觸發
    const handleCustomEvent = () => {
      updateCount();
    };
    
    // 監聽存儲變化以及自定義事件
    window.addEventListener('storage', updateCount);
    window.addEventListener('compareUpdate', handleCustomEvent);
    
    return () => {
      window.removeEventListener('storage', updateCount);
      window.removeEventListener('compareUpdate', handleCustomEvent);
    };
  }, []);
  
  // 如果沒有項目，不顯示面板
  if (plansCount === 0) return null;
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4 shadow-lg z-50">
      <div className="container mx-auto flex justify-between items-center">
        <div>已選擇 <span className="font-bold text-primary">{plansCount}</span> 個方案進行比較</div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => {
            localStorage.removeItem('plansToCompare');
            setPlansCount(0);
          }}>
            清空比較
          </Button>
          <Button onClick={() => router.push('/compare')}>
            查看比較
          </Button>
        </div>
      </div>
    </div>
  );
} 
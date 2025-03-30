'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  isAuthenticated, 
  VIEW_TYPE,
  getActiveView,
  setActiveView 
} from '@/lib/services/authService';
import { useAuth } from './AuthProvider';

interface ProtectedRouteWrapperProps {
  children: ReactNode;
  requiredView: VIEW_TYPE;
}

export default function ProtectedRouteWrapper({ 
  children, 
  requiredView 
}: ProtectedRouteWrapperProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAllowed, setIsAllowed] = useState(false);
  const router = useRouter();
  const { showLoginModal } = useAuth();

  useEffect(() => {
    const checkAccess = async () => {
      try {
        // 檢查用戶是否已登入
        if (!isAuthenticated()) {
          // 顯示登入彈窗，登入後重定向到當前頁面
          showLoginModal(() => {
            // 登入成功後會再次執行 checkAccess
            checkAccess();
          });
          setIsLoading(false);
          return;
        }
        
        // 檢查是否有權限
        // 所有已登入用戶都有權限
        setIsAllowed(true);
        
        // 檢查當前視角是否與所需視角匹配
        const currentView = getActiveView();
        
        // 如果不匹配，自動切換視角
        if (currentView !== requiredView) {
          console.log(`自動切換視角從 ${currentView} 到 ${requiredView}`);
          setActiveView(requiredView);
        }
      } catch (error) {
        console.error('Error checking route access:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAccess();
  }, [requiredView, router, showLoginModal]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAllowed) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center">
        <h1 className="text-2xl font-bold mb-4">需要登入</h1>
        <p className="text-muted-foreground mb-6">請登入以訪問此頁面</p>
        <button
          onClick={() => showLoginModal()}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          登入
        </button>
      </div>
    );
  }

  return <>{children}</>;
} 
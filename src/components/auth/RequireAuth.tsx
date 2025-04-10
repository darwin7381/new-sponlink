'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { clearLocalAuth } from '@/lib/auth/authUtils';

interface RequireAuthProps {
  children: React.ReactNode;
  redirectIfUnauthenticated?: boolean;
}

export default function RequireAuth({ children, redirectIfUnauthenticated = true }: RequireAuthProps) {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // 如果未認證且设置了需要重定向，則重定向到登入頁面，但不再清除本地數據
    if (status === 'unauthenticated' && redirectIfUnauthenticated) {
      console.log('用戶未認證，重定向到登入頁面');
      
      // 將當前URL保存到會話存儲，以便登入後重定向回來
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('redirectUrl', window.location.pathname);
      }
      
      // 重定向到登入頁面
      router.push('/login');
    }
  }, [status, router, redirectIfUnauthenticated]);

  if (status === 'loading') {
    // 顯示加載狀態
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // 如果已認證，或者未認證但不需要重定向，显示子组件
  if (status === 'authenticated' || (status === 'unauthenticated' && !redirectIfUnauthenticated)) {
    return <>{children}</>;
  }

  // 如果未認證且需要重定向，顯示空白頁面（重定向處理由 useEffect 完成）
  return null;
} 
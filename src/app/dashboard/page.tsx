"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/lib/services/authService';
import { USER_ROLES } from '@/lib/types/users';

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await getCurrentUser();
        if (!currentUser) {
          router.push('/login');
          return;
        }
        
        // 根據用戶角色重定向到對應的儀表板
        if (currentUser.role === USER_ROLES.SPONSOR) {
          router.push('/dashboard/sponsor');
        } else if (currentUser.role === USER_ROLES.ORGANIZER) {
          router.push('/dashboard/organizer');
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex justify-center items-center bg-background">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4 text-foreground">重定向中...</h1>
        <p className="text-muted-foreground">請稍候，我們正在將您重定向到適合的儀表板。</p>
      </div>
    </div>
  );
} 
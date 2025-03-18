"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/lib/services/authService';
import { USER_ROLES } from '@/lib/types/users';

export default function SponsorPage() {
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      try {
        const user = await getCurrentUser();
        if (!user || user.role !== USER_ROLES.SPONSOR) {
          router.push('/login');
          return;
        }
        
        // Redirect to sponsor dashboard
        router.push('/dashboard/sponsor');
      } catch (error) {
        console.error('Error checking user:', error);
        router.push('/login');
      }
    };

    checkUser();
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <h1 className="text-2xl font-semibold mb-4">重定向中...</h1>
        <p className="text-muted-foreground">請稍候，正在將您重定向到贊助商儀表板。</p>
      </div>
    </div>
  );
} 
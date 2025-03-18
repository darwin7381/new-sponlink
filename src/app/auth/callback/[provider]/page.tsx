'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { handleOAuthCallback } from '@/services/oauthService';
import { SocialProvider } from '@/types/auth';

export default function OAuthCallbackPage({
  params,
}: {
  params: { provider: string };
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get('code');
        if (!code) {
          throw new Error('Authorization code is missing');
        }

        const provider = params.provider as SocialProvider;
        const profile = await handleOAuthCallback(provider, code);

        // 儲存用戶資料到 localStorage
        localStorage.setItem('user', JSON.stringify(profile));

        // 重定向到儀表板
        router.push('/dashboard');
      } catch (error) {
        console.error('OAuth callback error:', error);
        // 重定向到登入頁面並顯示錯誤訊息
        router.push('/login?error=auth_failed');
      }
    };

    handleCallback();
  }, [params.provider, router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );
} 
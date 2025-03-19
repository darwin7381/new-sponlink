'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { LoginForm } from '@/components/auth/LoginForm'
import SocialLoginButtons from '@/components/auth/SocialLoginButtons'
import { SocialProvider } from '@/types/auth'
import { USER_ROLES } from '@/lib/types/users'
import { getCurrentUser, login as authLogin, isAuthenticated } from '@/lib/services/authService'

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()

  // 檢查是否已登入
  useEffect(() => {
    const checkLoginStatus = async () => {
      if (isAuthenticated()) {
        try {
          const user = await getCurrentUser();
          console.log('Already logged in as:', user);
          // 根據用戶角色重定向
          if (user?.role === USER_ROLES.SPONSOR) {
            router.push('/dashboard/sponsor');
          } else if (user?.role === USER_ROLES.ORGANIZER) {
            router.push('/dashboard/organizer');
          } else {
            router.push('/dashboard');
          }
        } catch (e) {
          console.error('Error checking login status:', e);
        }
      }
    };
    
    checkLoginStatus();
  }, [router]);

  // 檢查是否有錯誤參數
  useEffect(() => {
    const errorParam = searchParams.get('error')
    if (errorParam === 'auth_failed' && !error) {
      setError('社交登入失敗，請稍後再試')
    }
  }, [searchParams, error]);

  const handleLogin = async (email: string, password: string) => {
    setLoading(true)
    setError(null)

    try {
      console.log('Attempting login with:', email, password);
      
      // 使用 authService 進行登入
      try {
        const user = await authLogin(email, password);
        console.log('Login successful:', user);

        // 根據用戶角色重定向
        if (user.role === USER_ROLES.SPONSOR) {
          router.push('/dashboard/sponsor');
        } else {
          router.push('/dashboard/organizer');
        }
      } catch (authError) {
        console.error('AuthService login failed, trying API:', authError);
        
        // 如果 authService 登入失敗，嘗試API登入
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('API login error:', errorText);
          throw new Error('帳號或密碼錯誤');
        }

        const user = await response.json();
        console.log('API Login successful:', user);

        // 儲存用戶資料到 localStorage
        try {
          localStorage.setItem('user', JSON.stringify(user));
          localStorage.setItem('authToken', `mock-token-${Date.now()}`);
        } catch (e) {
          console.error('Error storing user data:', e);
        }

        // 使用 router 進行重定向
        if (user.role === USER_ROLES.SPONSOR) {
          router.push('/dashboard/sponsor');
        } else {
          router.push('/dashboard/organizer');
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      setError(error instanceof Error ? error.message : '登入失敗，請稍後再試')
    } finally {
      setLoading(false)
    }
  }

  const handleSocialLogin = (provider: SocialProvider) => {
    setLoading(true)
    setError(null)

    // 獲取回調 URL
    const redirectUrl = `${window.location.origin}/auth/callback/${provider}`
    // 重定向到 OAuth 提供者
    window.location.href = `/api/auth/${provider}?redirect_uri=${encodeURIComponent(redirectUrl)}`
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-foreground">
            登入您的帳號
          </h2>
        </div>

        <LoginForm 
          onSubmit={handleLogin}
          loading={loading}
          error={error}
        />

        <SocialLoginButtons
          onSocialLogin={handleSocialLogin}
          isLoading={loading}
        />
      </div>
    </div>
  )
} 
'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { LoginForm } from '@/components/auth/LoginForm'
import SocialLoginButtons from '@/components/auth/SocialLoginButtons'
import { SocialProvider } from '@/types/auth'
import { USER_ROLES } from '@/lib/types/users'

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()

  // 檢查是否已登入
  useEffect(() => {
    const checkLoginStatus = () => {
      const userJson = localStorage.getItem('currentUser');
      if (userJson) {
        try {
          const user = JSON.parse(userJson);
          console.log('Already logged in as:', user);
          // 根據用戶角色重定向
          if (user.role === USER_ROLES.SPONSOR) {
            router.push('/dashboard/sponsor');
          } else if (user.role === USER_ROLES.ORGANIZER) {
            router.push('/dashboard/organizer');
          } else {
            router.push('/dashboard');
          }
        } catch (e) {
          console.error('Error parsing user data:', e);
          localStorage.removeItem('currentUser');
        }
      }
    };
    
    checkLoginStatus();
  }, [router]);

  // 檢查是否有錯誤參數
  const errorParam = searchParams.get('error')
  if (errorParam === 'auth_failed' && !error) {
    setError('社交登入失敗，請稍後再試')
  }

  const handleLogin = async (email: string, password: string) => {
    setLoading(true)
    setError(null)

    try {
      console.log('Attempting login with:', email, password);
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        throw new Error('帳號或密碼錯誤')
      }

      const user = await response.json()
      console.log('Login successful:', user);

      // 儲存用戶資料到 localStorage
      localStorage.setItem('currentUser', JSON.stringify(user));
      localStorage.setItem('authToken', `mock-token-${Date.now()}`);

      // 強制重新加載頁面以更新全局狀態
      window.location.href = user.role === USER_ROLES.SPONSOR 
        ? '/dashboard/sponsor' 
        : '/dashboard/organizer';
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
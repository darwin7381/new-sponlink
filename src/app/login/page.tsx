'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { LoginForm } from '@/components/auth/LoginForm'
import SocialLoginButtons from '@/components/auth/SocialLoginButtons'
import { SocialProvider } from '@/types/auth'
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
          await getCurrentUser();
          console.log('Already logged in');
          // 直接重定向到統一儀表板而不考慮角色
          router.push('/dashboard');
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

        // 不再根據角色重定向，而是直接跳轉到儀表板
        router.push('/dashboard');
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

        // 不再根據角色重定向，而是直接跳轉到儀表板
        router.push('/dashboard');
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
    
    // 模擬社交登入流程
    setTimeout(() => {
      // 實際項目中，這裡會重定向到OAuth提供商
      console.log(`Redirecting to ${provider} login...`)
      
      // 模擬失敗，以便測試錯誤處理
      if (provider === 'github' as SocialProvider) {
        router.push('/login?error=auth_failed')
      } else {
        // 成功登入後直接重定向到儀表板
        router.push('/dashboard')
      }
      
      setLoading(false)
    }, 1000)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-card rounded-xl shadow-md p-8 border border-border">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-foreground">
            登入您的帳號
          </h2>
        </div>
        
        {error && (
          <div className="rounded-md bg-destructive/10 p-4 my-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-destructive" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-destructive">
                  {error}
                </h3>
              </div>
            </div>
          </div>
        )}
        
        <LoginForm onSubmit={handleLogin} loading={loading} />
        
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-card text-muted-foreground">
                或使用社交帳號登入
              </span>
            </div>
          </div>
          
          <SocialLoginButtons onSocialLogin={handleSocialLogin} isLoading={loading} />
        </div>
      </div>
    </div>
  )
} 
'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { LoginForm } from '@/components/auth/LoginForm'
import SocialLoginButtons from '@/components/auth/SocialLoginButtons'
import { SocialProvider } from '@/types/auth'
import { signIn, useSession } from 'next-auth/react'
import { clearLocalAuth, getRedirectUrl } from '@/lib/auth/authUtils'

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session, status } = useSession()

  // 檢查是否已登入
  useEffect(() => {
    if (status === 'authenticated' && session) {
      console.log('已通過 Auth.js 認證');
      
      // 獲取重定向URL並導航
      const redirectUrl = getRedirectUrl('/dashboard');
      router.push(redirectUrl);
    } else if (status === 'unauthenticated') {
      // 確保清除所有舊的認證數據
      clearLocalAuth();
    }
  }, [router, session, status]);

  // 檢查是否有錯誤參數
  useEffect(() => {
    const errorParam = searchParams.get('error')
    if (errorParam === 'auth_failed' && !error) {
      setError('登入失敗，請檢查您的帳號和密碼')
    } else if (errorParam === 'OAuthAccountNotLinked') {
      setError('此電子郵件已使用其他登入方式註冊，請使用原始登入方式')
    }
  }, [searchParams, error]);

  const handleLogin = async (email: string, password: string) => {
    setLoading(true)
    setError(null)

    try {
      console.log('嘗試登入:', email);
      
      // 確保清除舊的認證數據
      clearLocalAuth();
      
      // 獲取登入成功後的重定向URL
      const redirectUrl = getRedirectUrl('/dashboard');
      
      // 使用 Auth.js 進行登入
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });
      
      if (result?.error) {
        console.error('登入失敗:', result.error);
        throw new Error('帳號或密碼錯誤');
      } else {
        console.log('登入成功');
        
        // 登入成功後重定向到目標頁面
        router.push(redirectUrl);
      }
    } catch (error) {
      console.error('登入錯誤:', error);
      setError(error instanceof Error ? error.message : '登入失敗，請稍後再試')
    } finally {
      setLoading(false)
    }
  }

  const handleSocialLogin = async (provider: SocialProvider) => {
    setLoading(true)
    setError(null)
    
    try {
      // 確保清除舊的認證數據
      clearLocalAuth();
      
      // 獲取登入成功後的重定向URL
      const redirectUrl = getRedirectUrl('/dashboard');
      
      // 使用 Auth.js 社交登入
      await signIn(provider, { callbackUrl: redirectUrl });
    } catch (error) {
      console.error(`${provider} 登入錯誤:`, error);
      setError(`${provider}登入失敗，請稍後再試`);
      setLoading(false);
    }
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
        
        {/* Demo賬號區域 */}
        <div className="mt-8 border-t border-border pt-6">
          <h3 className="text-center text-sm font-medium text-muted-foreground mb-4">
            示範帳號
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 border border-border rounded-lg bg-card/50">
              <h4 className="font-semibold">贊助商:</h4>
              <p className="text-sm text-muted-foreground">sponsor@example.com</p>
              <p className="text-sm text-muted-foreground">sponsor123</p>
            </div>
            <div className="p-3 border border-border rounded-lg bg-card/50">
              <h4 className="font-semibold">組織者:</h4>
              <p className="text-sm text-muted-foreground">organizer@example.com</p>
              <p className="text-sm text-muted-foreground">organizer123</p>
            </div>
          </div>
        </div>
        
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
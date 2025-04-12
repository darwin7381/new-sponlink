'use client'

import { useState } from 'react'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { LoginForm } from './LoginForm'
import SocialLoginButtons from './SocialLoginButtons'
import { SocialProvider } from '@/types/auth'
import { RegisterForm } from './RegisterForm'

interface LoginModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  afterLogin?: () => void
  defaultTab?: 'login' | 'register'
}

export default function LoginModal({ 
  isOpen, 
  onOpenChange, 
  afterLogin,
  defaultTab = 'login'
}: LoginModalProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>(defaultTab)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async (email: string, password: string) => {
    setLoading(true)
    setError(null)

    try {
      console.log('[LoginModal] 開始登入:', email);
      
      // 使用API登入流程
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('[LoginModal] API登入錯誤:', errorText)
        throw new Error('帳號或密碼錯誤')
      }

      const user = await response.json()
      console.log('[LoginModal] API登入成功，原始用戶數據:', user)

      // 儲存用戶資料到 localStorage
      try {
        // 確保用戶ID有效
        if (!user.id) {
          console.error('[LoginModal] 用戶ID缺失!');
          throw new Error('用戶ID缺失');
        }
        
        // 無需ID格式轉換，直接使用UUID
        
        // 儲存用戶資料
        localStorage.setItem('user', JSON.stringify(user))
        localStorage.setItem('authToken', `mock-token-${Date.now()}`)
        
        // 驗證存儲是否成功
        const storedUser = localStorage.getItem('user');
        const parsedUser = storedUser ? JSON.parse(storedUser) : null;
        console.log('[LoginModal] 儲存成功，用戶ID: ' + (parsedUser?.id || '未知'));
        
        // 分發登入事件
        window.dispatchEvent(new Event('authChange'))
      } catch (e) {
        console.error('[LoginModal] 存儲用戶資料錯誤:', e)
      }

      // 關閉彈窗
      onOpenChange(false)
      
      // 呼叫登入後的回調函數
      if (afterLogin) {
        afterLogin()
      }
    } catch (error) {
      console.error('登入錯誤:', error)
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
      
      // 模擬成功登入
      onOpenChange(false)
      
      // 呼叫登入後的回調函數
      if (afterLogin) {
        afterLogin()
      }
      
      setLoading(false)
    }, 1000)
  }

  const handleRegister = async (name: string, email: string, password: string) => {
    setLoading(true)
    setError(null)
    
    try {
      console.log('[LoginModal] 開始註冊:', email);
      
      // 使用API註冊流程
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('[LoginModal] API註冊錯誤:', errorData)
        throw new Error(errorData.error || '註冊失敗')
      }

      const data = await response.json()
      console.log('[LoginModal] 註冊成功:', data.success)
      
      // 成功註冊後切換到登入頁面
      setActiveTab('login')
      setError('註冊成功！請使用您的新帳號登入。')
    } catch (error) {
      console.error('註冊錯誤:', error)
      setError(error instanceof Error ? error.message : '註冊失敗，請稍後再試')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl text-center font-bold text-foreground">
            {activeTab === 'login' ? '登入您的帳號' : '創建新帳號'}
          </DialogTitle>
          <DialogDescription className="text-center text-muted-foreground">
            {activeTab === 'login' ? '請登入繼續操作' : '填寫以下資訊創建您的帳號'}
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'login' | 'register')} className="w-full mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">登入</TabsTrigger>
            <TabsTrigger value="register">註冊</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login" className="mt-4">
            {error && (
              <div className="rounded-md bg-destructive/10 p-4 mb-4">
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
              <SocialLoginButtons onSocialLogin={handleSocialLogin} isLoading={loading} />
            </div>
          </TabsContent>
          
          <TabsContent value="register" className="mt-4">
            <RegisterForm 
              onSubmit={handleRegister} 
              loading={loading}
              error={error}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
} 
'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { getCurrentUser, isAuthenticated } from '@/lib/services/authService'
import { User } from '@/lib/types/users'
import LoginModal from './LoginModal'

// 定義 AuthContext 的類型
type AuthContextType = {
  isLoggedIn: boolean
  showLoginModal: (afterLoginCallback?: () => void) => void
  loading: boolean
  user: User | null
}

// 創建 AuthContext
const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  showLoginModal: () => {},
  loading: true,
  user: null
})

// 創建 useAuth hook
export const useAuth = () => useContext(AuthContext)

// AuthProvider 組件
export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [afterLoginCallback, setAfterLoginCallback] = useState<(() => void) | undefined>(undefined)

  // 初始化時檢查登入狀態
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const authenticated = isAuthenticated()
        setIsLoggedIn(authenticated)
        
        if (authenticated) {
          const userData = await getCurrentUser()
          setUser(userData)
        }
      } catch (error) {
        console.error('Error checking authentication:', error)
      } finally {
        setLoading(false)
      }
    }
    
    checkAuth()
    
    // 監聽登入狀態變更的自定義事件
    const handleAuthChange = () => {
      checkAuth()
    }
    
    window.addEventListener('authChange', handleAuthChange)
    
    return () => {
      window.removeEventListener('authChange', handleAuthChange)
    }
  }, [])

  // 顯示登入彈窗的方法
  const showLoginModal = (afterLoginCallback?: () => void) => {
    setAfterLoginCallback(() => afterLoginCallback)
    setIsModalOpen(true)
  }

  // 登入後執行回調
  const handleAfterLogin = () => {
    if (afterLoginCallback) {
      afterLoginCallback()
      setAfterLoginCallback(undefined)
    }
  }

  return (
    <AuthContext.Provider value={{ isLoggedIn, showLoginModal, loading, user }}>
      {children}
      <LoginModal 
        isOpen={isModalOpen} 
        onOpenChange={setIsModalOpen} 
        afterLogin={handleAfterLogin}
      />
    </AuthContext.Provider>
  )
} 
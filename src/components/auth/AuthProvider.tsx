'use client'

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react'
import { getCurrentUser, isAuthenticated, logout } from '@/lib/services/authService'
import { User } from '@/lib/types/users'
import LoginModal from './LoginModal'
import { useRouter } from 'next/navigation'

// 定義 AuthContext 的類型
type AuthContextType = {
  isLoggedIn: boolean
  showLoginModal: (afterLoginCallback?: () => void) => void
  loading: boolean
  user: User | null
  handleLogout: () => void
}

// 創建 AuthContext
const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  showLoginModal: () => {},
  loading: true,
  user: null,
  handleLogout: () => {}
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
  const router = useRouter()

  // 處理登出
  const handleLogout = useCallback(() => {
    console.log("AuthProvider: 開始登出處理");
    
    // 清除用戶數據和登入狀態
    setUser(null);
    setIsLoggedIn(false);
    
    // 調用登出服務
    try {
      logout();
      
      // 使用 React 路由導航
      router.push('/login');
    } catch (error) {
      console.error('登出錯誤:', error);
    }
  }, [router]);

  // 初始化時檢查登入狀態
  useEffect(() => {
    let isMounted = true;
    
    const checkAuth = async () => {
      try {
        const authenticated = isAuthenticated();
        
        if (!isMounted) return;
        
        setIsLoggedIn(authenticated);
        
        if (authenticated) {
          const userData = await getCurrentUser();
          if (!isMounted) return;
          setUser(userData);
        } else {
          // 如果未登入，確保用戶數據為空
          if (!isMounted) return;
          setUser(null);
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    checkAuth();
    
    // 監聽登入狀態變更的自定義事件，使用防抖處理
    let timeoutId: NodeJS.Timeout | null = null;
    let lastAuthChangeTime = 0;
    const MIN_AUTH_CHANGE_INTERVAL = 100; // 兩次事件之間的最小間隔（毫秒）
    
    const handleAuthChange = () => {
      // 檢查事件觸發間隔，避免過於頻繁的調用
      const now = Date.now();
      if (now - lastAuthChangeTime < MIN_AUTH_CHANGE_INTERVAL) {
        console.log('Auth change event throttled');
        return;
      }
      lastAuthChangeTime = now;
      
      // 清除可能存在的計時器，防止多次快速調用
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      
      // 延遲執行，減少快速連續事件帶來的問題
      timeoutId = setTimeout(() => {
        if (isMounted) {
          checkAuth();
        }
      }, 150); // 增加延遲時間
    };
    
    window.addEventListener('authChange', handleAuthChange);
    
    return () => {
      isMounted = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      window.removeEventListener('authChange', handleAuthChange);
    };
  }, []);

  // 顯示登入彈窗的方法
  const showLoginModal = (afterLoginCallback?: () => void) => {
    // 臨時解決方案：不顯示彈窗，直接導航到登入頁面
    if (afterLoginCallback) {
      // 保存回調以便登入後使用
      sessionStorage.setItem('afterLoginCallback', 'true');
    }
    router.push('/login');
  }

  // 登入後執行回調（現在暫時沒使用）
  const handleAfterLogin = () => {
    if (afterLoginCallback) {
      afterLoginCallback();
      setAfterLoginCallback(undefined);
    }
  }

  return (
    <AuthContext.Provider value={{ isLoggedIn, showLoginModal, loading, user, handleLogout }}>
      {children}
      {/* 暫時移除 LoginModal 組件 */}
    </AuthContext.Provider>
  )
} 
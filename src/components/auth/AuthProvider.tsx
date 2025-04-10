'use client'

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react'
import { User, SystemRole } from '@/lib/types/users'
import { useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'

// 定義 AuthContext 的類型
type AuthContextType = {
  isLoggedIn: boolean
  showLoginModal: (afterLoginCallback?: () => void) => void
  loading: boolean
  user: User | null
  handleLogout: () => void
  getResourceOwnerId: (resourceId: string) => string
}

// 為 Window 添加 afterLoginCallbackFn 屬性
declare global {
  interface Window {
    _isLoggingOut?: boolean;
    afterLoginCallbackFn?: () => void;
  }
}

// 創建 AuthContext
const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  showLoginModal: () => {},
  loading: true,
  user: null,
  handleLogout: () => {},
  getResourceOwnerId: (resourceId) => resourceId
})

// 創建 useAuth hook
export const useAuth = () => useContext(AuthContext)

// 清除所有本地存儲的認證相關數據
const clearLocalAuth = () => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem('user');
      localStorage.removeItem('authToken');
      localStorage.removeItem('activeView');
      
      // 移除可能存在的其他認證相關數據
      sessionStorage.removeItem('afterLoginCallback');
    } catch (e) {
      console.error('清除本地存儲時出錯:', e);
    }
  }
};

// AuthProvider 組件
export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const router = useRouter()
  const { data: session, status } = useSession()

  // 处理资源所有者ID映射 - 現在直接返回原始ID
  const getResourceOwnerId = useCallback((resourceId: string) => {
    return resourceId;
  }, []);

  // 處理登出
  const handleLogout = useCallback(() => {
    console.log("AuthProvider: 開始登出處理");
    
    // 使用 next-auth 的 signOut 方法
    try {
      // 不清除本地存儲，只使用 next-auth 處理登出
      signOut({ redirect: false });
      
      // 更新組件狀態
      setUser(null);
      setIsLoggedIn(false);
      
      console.log("AuthProvider: 登出完成，保留瀏覽狀態");
    } catch (error) {
      console.error('登出錯誤:', error);
    }
  }, []);

  // 完全使用Auth.js的認證狀態
  useEffect(() => {
    let isMounted = true;
    
    const checkAuth = async () => {
      try {
        if (status === 'authenticated' && session?.user) {
          if (!isMounted) return;
          
          setIsLoggedIn(true);
          
          // 處理用戶ID格式，確保兼容Neon數據庫中的ID格式
          let userId = session.user.id;
          
          // 檢查ID是否為數字或純數字字符串
          if (typeof userId === 'number' || /^\d+$/.test(userId)) {
            console.log(`[AuthProvider] 檢測到數字ID: ${userId}，轉換為正確格式`);
            
            // 檢查Neon系統中已知的測試用戶
            if ((typeof userId === 'number' && userId === 1) || (typeof userId === 'string' && userId === '1')) {
              if (session.user.email === 'organizer@example.com') {
                userId = 'user_123'; // 組織者正確ID
                console.log(`[AuthProvider] 將組織者用戶ID修正為: ${userId}`);
              } else if (session.user.email === 'sponsor@example.com') {
                userId = 'user_124'; // 贊助商正確ID
                console.log(`[AuthProvider] 將贊助商用戶ID修正為: ${userId}`);
              } else {
                userId = `user_${userId}`; // 通用格式
                console.log(`[AuthProvider] 將通用用戶ID修正為: ${userId}`);
              }
            } else {
              userId = `user_${userId}`;
              console.log(`[AuthProvider] 轉換一般數字ID為: ${userId}`);
            }
          }
          
          // 基於會話創建用戶對象
          // 徹底移除角色概念，使用系統角色區分普通用戶和管理員
          const sessionUser: User = {
            id: userId,
            email: session.user.email || '',
            systemRole: SystemRole.USER, // 默認為普通用戶
            preferred_language: 'zh',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          
          console.log(`[AuthProvider] 創建用戶對象完成，ID: ${sessionUser.id}`);
          
          setUser(sessionUser);
          
          // 同步到localStorage，確保一致性
          try {
            localStorage.setItem('user', JSON.stringify(sessionUser));
            console.log(`[AuthProvider] 已同步用戶數據到localStorage，ID: ${sessionUser.id}`);
          } catch (err) {
            console.error('[AuthProvider] 無法同步用戶到localStorage:', err);
          }
        } else if (status === 'unauthenticated') {
          // 只更新狀態，不清除本地存儲
          if (!isMounted) return;
          setIsLoggedIn(false);
          setUser(null);
        }
      } catch (error) {
        console.error('檢查認證時出錯:', error);
        
        // 發生錯誤時，假設未認證
        if (isMounted) {
          setIsLoggedIn(false);
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    if (status !== 'loading') {
      checkAuth();
    }
    
    return () => {
      isMounted = false;
    };
  }, [session, status]);

  // 顯示登入彈窗的方法
  const showLoginModal = (afterLoginCallback?: () => void) => {
    if (afterLoginCallback) {
      // 保存回調以便登入後使用
      sessionStorage.setItem('afterLoginCallback', 'true');
      // 還保存回調函數的序列化版本（如果可能）
      try {
        if (typeof afterLoginCallback === 'function') {
          // 直接執行函數而不是序列化
          console.log('保存回調函數，稍後執行');
          window.afterLoginCallbackFn = afterLoginCallback;
        }
      } catch (error) {
        console.error('無法保存回調函數:', error);
      }
    }
    router.push('/login');
  }

  return (
    <AuthContext.Provider value={{ 
      isLoggedIn, 
      showLoginModal, 
      loading, 
      user, 
      handleLogout,
      getResourceOwnerId 
    }}>
      {children}
    </AuthContext.Provider>
  )
} 
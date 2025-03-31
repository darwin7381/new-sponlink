import { User, USER_ROLES, RESOURCE_TYPE, PERMISSION, DYNAMIC_ROLE, UserOrganization } from '../types/users';
import { MOCK_USERS } from '../mocks/users';

// Helper function to simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Keys for local storage
const USER_KEY = 'user';
const AUTH_TOKEN_KEY = 'authToken';
const ACTIVE_VIEW_KEY = 'activeView'; // 新增: 存儲當前活躍的視角

// View types
export enum VIEW_TYPE {
  EVENT_ORGANIZER = 'event_organizer',
  SPONSORSHIP_MANAGER = 'sponsorship_manager',
}

// 為 Window 添加 _isLoggingOut 屬性
declare global {
  interface Window {
    _isLoggingOut?: boolean;
  }
}

// Get stored user
export const getStoredUser = (): User | null => {
  if (typeof window !== 'undefined') {
    try {
      const userJson = localStorage.getItem(USER_KEY);
      if (!userJson) return null;
      return JSON.parse(userJson);
    } catch (e) {
      console.error('Error getting stored user:', e);
      return null;
    }
  }
  return null;
};

// Set stored user
export const setStoredUser = (user: User): void => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch (e) {
      console.error('Error storing user:', e);
    }
  }
};

// New: Get active view
export const getActiveView = (): VIEW_TYPE | null => {
  if (typeof window !== 'undefined') {
    try {
      const view = localStorage.getItem(ACTIVE_VIEW_KEY) as VIEW_TYPE;
      return view || null;
    } catch (e) {
      console.error('Error getting active view:', e);
      return null;
    }
  }
  return null;
};

// New: Set active view
export const setActiveView = (view: VIEW_TYPE): void => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(ACTIVE_VIEW_KEY, view);
      
      // 分發視角變更事件，讓UI可以響應
      window.dispatchEvent(new Event('viewChange'));
    } catch (e) {
      console.error('Error storing active view:', e);
    }
  }
};

// New: Check if user has any events (模擬實現，真實系統中應該查詢資料庫)
export const hasOwnedEvents = async (): Promise<boolean> => {
  // 模擬異步API調用
  await delay(100);
  
  // 在真實系統中，這裡應該檢查用戶是否擁有任何活動
  return true; // 假設用戶有活動
};

// New: Check if user has any sponsorships (模擬實現，真實系統中應該查詢資料庫)
export const hasSponsorships = async (): Promise<boolean> => {
  // 模擬異步API調用
  await delay(100);
  
  // 在真實系統中，這裡應該檢查用戶是否有任何贊助
  return true; // 假設用戶有贊助
};

// New: 檢查用戶是否擁有特定視角
export const hasActiveView = (viewType: VIEW_TYPE): boolean => {
  const activeView = getActiveView();
  return activeView === viewType;
};

// New: 檢查用戶是否可以訪問頁面（基於視角）
export const allowedToView = (): boolean => {
  try {
    // 用戶必須已登入，只要登入就有權訪問所有頁面
    return isAuthenticated();
  } catch (e) {
    console.error('Error checking view permission:', e);
    return false;
  }
};

// New: 檢查用戶是否可以管理特定資源
export const canManageResource = (resourceType: string, resourceOwnerId: string): boolean => {
  const user = getStoredUser();
  if (!user) return false;
  
  // 如果有管理員角色，可以允許管理所有資源
  // 在真實系統中，應該根據實際角色系統來實現
  
  // 資源擁有者可以管理自己的資源
  return user.id === resourceOwnerId;
};

// 獲取當前用戶
export const getCurrentUser = async (): Promise<User | null> => {
  try {
    // Simulate API call
    await delay(300);
    
    return getStoredUser();
  } catch (error) {
    console.error("Error getting current user:", error);
    throw error;
  }
};

// Logout user
export const logout = (): void => {
  if (typeof window !== 'undefined') {
    try {
      // 檢查當前是否已經處於登出狀態，避免重複操作
      if (window._isLoggingOut) return;
      
      // 設置標誌表示正在登出處理
      window._isLoggingOut = true;
      
      // 清除本地存儲
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem(ACTIVE_VIEW_KEY);
      
      // 使用更長的延遲確保清理完成後再觸發事件，同時避免多個事件
      setTimeout(() => {
        try {
          // 只有在頁面仍然活躍時才分發事件
          if (typeof window !== 'undefined' && document.body) {
            window.dispatchEvent(new Event('authChange'));
          }
        } catch (e) {
          console.error('Error during logout event dispatch:', e);
        } finally {
          window._isLoggingOut = false;
        }
      }, 100);
    } catch (e) {
      console.error('Error during logout:', e);
      window._isLoggingOut = false;
    }
  }
};

// Login user
export const login = async (email: string, password: string): Promise<User> => {
  try {
    // Simulate API call
    await delay(500);
    
    // 定義有效的登入憑證
    const validCredentials = [
      { email: 'sponsor@example.com', password: 'sponsor123' },
      { email: 'organizer@example.com', password: 'organizer123' }
    ];
    
    // 檢查是否有匹配的憑證
    const isValid = validCredentials.some(
      cred => cred.email === email && cred.password === password
    );
    
    if (!isValid) {
      throw new Error("Invalid email or password");
    }
    
    // 找到對應的用戶
    const user = MOCK_USERS.find(u => u.email === email);
    
    if (!user) {
      throw new Error("User not found");
    }
    
    // Store user in localStorage
    setStoredUser(user);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(AUTH_TOKEN_KEY, `mock-token-${Date.now()}`);
        
        // 分發登入狀態變更事件
        window.dispatchEvent(new Event('authChange'));
      } catch (e) {
        console.error('Error storing auth token:', e);
      }
    }
    
    return user;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};

// Register new user
export const register = async (email: string, password: string, role: USER_ROLES): Promise<User> => {
  try {
    // Simulate API call
    await delay(500);
    
    // Check if user already exists
    const existingUser = MOCK_USERS.find(u => u.email === email);
    
    if (existingUser) {
      throw new Error("Email already in use");
    }
    
    // Create new user
    const newUser: User = {
      id: `${MOCK_USERS.length + 1}`,
      email,
      role,
      preferred_language: "en",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // Add to mock data (in a real app, this would be sent to a server)
    MOCK_USERS.push(newUser);
    
    // Store user in localStorage
    setStoredUser(newUser);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(AUTH_TOKEN_KEY, `mock-token-${Date.now()}`);
      } catch (e) {
        console.error('Error storing auth token:', e);
      }
    }
    
    return newUser;
  } catch (error) {
    console.error("Registration error:", error);
    throw error;
  }
};

// Check if token is valid
export const verifyToken = async (token: string): Promise<boolean> => {
  try {
    // Simulate API call
    await delay(300);
    
    // In a real app, this would validate with the backend
    if (typeof window !== 'undefined') {
      try {
        const storedToken = localStorage.getItem(AUTH_TOKEN_KEY);
        return storedToken === token;
      } catch (e) {
        console.error('Error verifying token:', e);
        return false;
      }
    }
    
    return false;
  } catch (error) {
    console.error("Verify token error:", error);
    throw error;
  }
};

// 檢查用戶是否有特定角色
export const hasRole = (role: USER_ROLES): boolean => {
  // 根據新身份系統整合方案，所有已登入用戶都具有相同權限
  // 不再區分具體角色，只檢查是否已登入
  return isAuthenticated();
};

// 檢查用戶是否已登入
export const isAuthenticated = (): boolean => {
  try {
    return !!getStoredUser();
  } catch (e) {
    console.error('Error checking authentication:', e);
    return false;
  }
};

// 檢查用戶是否可以執行操作（基於新身份系統）
export const canPerformAction = (
  action: 'create_event' | 'sponsor_event' | 'manage_event' | 'view_event' | 'add_to_cart',
  resourceId?: string
): boolean => {
  // 未登入用戶無法執行任何操作
  if (!isAuthenticated()) {
    return false;
  }
  
  // 基本操作：所有已登入用戶都可以執行
  const basicActions = ['view_event', 'sponsor_event', 'create_event', 'add_to_cart'];
  if (basicActions.includes(action)) {
    return true;
  }
  
  // 管理操作：僅資源所有者可執行
  if (action === 'manage_event' && resourceId) {
    return isResourceOwner(resourceId);
  }
  
  return false;
};

// 判斷用戶是否為資源所有者
export const isResourceOwner = (resourceId: string, ownerId?: string): boolean => {
  const user = getStoredUser();
  if (!user) return false;
  
  // 如果提供了所有者ID，直接比較
  if (ownerId) {
    return user.id === ownerId;
  }
  
  // 在實際系統中，應查詢資源所有權
  // 這裡只是一個簡單的模擬實現
  return resourceId.startsWith(user.id) || resourceId.includes(user.id);
};

// 檢查用戶是否有特定資源的特定權限
export const hasPermission = (
  resourceType: RESOURCE_TYPE, 
  resourceId: string, 
  permission: PERMISSION
): boolean => {
  // 未登入用戶無法獲得任何權限
  if (!isAuthenticated()) return false;
  
  // 查看和創建權限：所有已登入用戶都有
  if (permission === PERMISSION.VIEW || permission === PERMISSION.CREATE) {
    return true;
  }
  
  // 編輯和刪除權限：僅資源所有者可有
  if (permission === PERMISSION.EDIT || permission === PERMISSION.DELETE) {
    return isResourceOwner(resourceId);
  }
  
  return false;
};

// 新增：基于视角的权限检查
export const hasViewPermission = (
  viewType: VIEW_TYPE,
  permission: PERMISSION,
  resourceType: RESOURCE_TYPE
): boolean => {
  // 根据当前活跃视角检查权限
  const activeView = getActiveView();
  if (!activeView) return false;
  
  // 事件组织者视角可管理事件
  if (viewType === VIEW_TYPE.EVENT_ORGANIZER && 
      resourceType === RESOURCE_TYPE.EVENT) {
    return true;
  }
  
  // 赞助管理视角可管理赞助
  if (viewType === VIEW_TYPE.SPONSORSHIP_MANAGER && 
      resourceType === RESOURCE_TYPE.SPONSORSHIP) {
    return true;
  }
  
  // 所有视角都有查看权限
  return permission === PERMISSION.VIEW;
};

// 新增：获取用户的组织列表
export const getUserOrganizations = async (): Promise<UserOrganization[]> => {
  // 模拟API调用
  await delay(300);
  
  // 在真实系统中，应从后端获取
  return [];
};

// 新增：获取用户在特定组织中的角色
export const getUserRoleInOrganization = (): DYNAMIC_ROLE | null => {
  try {
    // 在真实系统中应从用户的组织列表中查询
    return null;
  } catch (e) {
    console.error('Error getting user role in organization:', e);
    return null;
  }
};

// 新增：检查用户是否有特定动态角色(不依赖于固定的USER_ROLES)
export const hasDynamicRole = (): boolean => {
  // 模拟实现 - 检查用户是否在任何组织中拥有该角色
  return false;
}; 
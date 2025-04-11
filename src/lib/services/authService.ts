/**
 * 認證服務
 * 處理用戶授權和訪問控制
 */

import { 
  User, 
  USER_ROLES, 
  RESOURCE_TYPE, 
  PERMISSION, 
  DYNAMIC_ROLE, 
  UserOrganization, 
  VIEW_TYPE,
  SystemRole 
} from '../types/users';

// Helper function to simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Keys for local storage
const USER_KEY = 'user';

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
      
      const user = JSON.parse(userJson);
      console.log("从localStorage获取的用户数据:", user);
      
      return user;
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

// Check if user has any events
export const hasOwnedEvents = async (): Promise<boolean> => {
  // 在真實系統中查詢數據庫
  await delay(100);
  return true; // 假設用戶有活動
};

// Check if user has any sponsorships
export const hasSponsorships = async (): Promise<boolean> => {
  // 在真實系統中查詢數據庫
  await delay(100);
  return true; // 假設用戶有贊助
};

// 檢查用戶是否可以訪問頁面
export const allowedToView = (): boolean => {
  try {
    // 用戶必須已登入
    return isAuthenticated();
  } catch (e) {
    console.error('Error checking view permission:', e);
    return false;
  }
};

// 檢查用戶是否可以管理特定資源
export const canManageResource = (resourceType: string, resourceOwnerId: string): boolean => {
  const user = getStoredUser();
  if (!user) return false;
  
  // 資源擁有者可以管理自己的資源
  return user.id === resourceOwnerId;
};

// 獲取當前用戶
export const getCurrentUser = async (): Promise<User | null> => {
  try {
    console.log("getCurrentUser被调用");
    const user = getStoredUser();
    console.log("getStoredUser返回结果:", user);
    return user;
  } catch (error) {
    console.error("Error getting current user:", error);
    throw error;
  }
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

// 檢查用戶是否有特定角色
export const hasRole = (role: USER_ROLES): boolean => {
  // 根據身份系統整合方案(identity_system_integration_proposal.md)
  // 和角色系統重構文檔(role-system-refactoring.md)
  // 徹底移除角色檢查，所有已登入用戶可以訪問所有功能
  // 所以這個函數始終返回true
  return true;
};

/**
 * 檢查當前用戶是否為系統管理員
 * 用於限制系統管理功能的訪問
 */
export const isSystemAdmin = (): boolean => {
  try {
    const user = getStoredUser();
    return user?.systemRole === SystemRole.ADMIN;
  } catch (error) {
    console.error('檢查管理員權限時出錯:', error);
    return false;
  }
};

// 檢查用戶是否可以執行操作
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
  
  return false;
};

// 檢查用戶是否有特定資源的特定權限
export const hasPermission = (
  resourceType: RESOURCE_TYPE, 
  resourceId: string, 
  permission: PERMISSION
): boolean => {
  // 未登入用戶無權限
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

// 获取用户的组织列表
export const getUserOrganizations = async (): Promise<UserOrganization[]> => {
  // 模拟API调用
  await delay(300);
  
  // 在真实系统中，应从后端获取
  return [];
};

// 获取用户在特定组织中的角色
export const getUserRoleInOrganization = (): DYNAMIC_ROLE | null => {
  return null;
};

// 检查用户是否有特定动态角色
export const hasDynamicRole = (): boolean => {
  return false;
};

// 重新導出 VIEW_TYPE 以供其他組件使用
export { VIEW_TYPE }; 
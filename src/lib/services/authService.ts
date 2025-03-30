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
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem(ACTIVE_VIEW_KEY); // 清除活躍視角
      
      // 分發登出事件
      window.dispatchEvent(new Event('authChange'));
    } catch (e) {
      console.error('Error during logout:', e);
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
  try {
    const user = getStoredUser();
    return !!user && user.role === role;
  } catch (e) {
    console.error('Error checking user role:', e);
    return false;
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

// 新增：检查用户是否有特定资源的特定权限
export const hasPermission = (
  resourceType: RESOURCE_TYPE, 
  resourceId: string, 
  permission: PERMISSION
): boolean => {
  try {
    const user = getStoredUser();
    if (!user) return false;
    
    // 模拟实现 - 实际系统应从后端验证权限
    // 在真实实现中，这应该检查用户的权限列表
    
    // 假设资源创建者拥有所有权限
    if (resourceId.includes(user.id)) {
      return true;
    }
    
    // 简化实现：SPONSOR 角色可访问 SPONSORSHIP 资源，ORGANIZER 可访问 EVENT 资源
    if (user.role === USER_ROLES.SPONSOR && resourceType === RESOURCE_TYPE.SPONSORSHIP) {
      return permission === PERMISSION.VIEW || permission === PERMISSION.CREATE;
    }
    
    if (user.role === USER_ROLES.ORGANIZER && resourceType === RESOURCE_TYPE.EVENT) {
      return true; // 组织者对事件有完全权限
    }
    
    // 所有登录用户都有查看权限
    return permission === PERMISSION.VIEW;
  } catch (e) {
    console.error('Error checking permission:', e);
    return false;
  }
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

// 新增：判断用户是否为资源所有者
export const isResourceOwner = (resourceId: string, ownerId: string): boolean => {
  const user = getStoredUser();
  if (!user) return false;
  
  return user.id === ownerId;
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
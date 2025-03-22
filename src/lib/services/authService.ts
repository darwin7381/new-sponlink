import { User, USER_ROLES } from '../types/users';
import { MOCK_USERS } from '../mocks/users';

// Helper function to simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Storage key constants
const USER_STORAGE_KEY = 'user';
const AUTH_TOKEN_KEY = 'authToken';

// Helper functions for type-safe localStorage access
const setStoredUser = (user: User) => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    } catch (e) {
      console.error('Error storing user data:', e);
    }
  }
};

const getStoredUser = (): User | null => {
  if (typeof window !== 'undefined') {
    try {
      const userJson = localStorage.getItem(USER_STORAGE_KEY);
      if (!userJson) return null;
      return JSON.parse(userJson);
    } catch (e) {
      console.error('Error parsing user data:', e);
      return null;
    }
  }
  return null;
};

const removeStoredUser = () => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(USER_STORAGE_KEY);
    } catch (e) {
      console.error('Error removing user data:', e);
    }
  }
};

// Get current user from localStorage or session
export const getCurrentUser = async (): Promise<User | null> => {
  try {
    // In a real app, this would validate the token with the backend
    return getStoredUser();
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
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

// Logout user
export const logout = async (): Promise<boolean> => {
  try {
    // Simulate API call
    await delay(300);
    
    // Remove user data from local storage
    removeStoredUser();
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(AUTH_TOKEN_KEY);
        
        // 分發登出狀態變更事件
        window.dispatchEvent(new Event('authChange'));
      } catch (e) {
        console.error('Error removing auth token:', e);
      }
    }
    
    return true;
  } catch (error) {
    console.error("Logout error:", error);
    return false;
  }
};

// Update user profile
export const updateProfile = async (userData: Partial<User>): Promise<User> => {
  try {
    // Get current user
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      throw new Error("User not authenticated");
    }
    
    // Simulate API call
    await delay(500);
    
    // Update user data
    const updatedUser = {
      ...currentUser,
      ...userData,
      updated_at: new Date().toISOString()
    };
    
    // Update localStorage
    setStoredUser(updatedUser);
    
    return updatedUser;
  } catch (error) {
    console.error("Update profile error:", error);
    throw error;
  }
};

// Change language preference
export const changeLanguage = async (language: string): Promise<User> => {
  try {
    // Get current user
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      throw new Error("User not authenticated");
    }
    
    // Simulate API call
    await delay(300);
    
    // Update language
    const updatedUser = {
      ...currentUser,
      preferred_language: language,
      updated_at: new Date().toISOString()
    };
    
    // Update localStorage
    setStoredUser(updatedUser);
    
    return updatedUser;
  } catch (error) {
    console.error("Change language error:", error);
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
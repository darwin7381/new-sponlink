import { User, USER_ROLES } from '../types/users';
import { MOCK_USERS } from '../mocks/users';

// Helper function to simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Get current user from localStorage or session
export const getCurrentUser = async (): Promise<User | null> => {
  try {
    // In a real app, this would validate the token with the backend
    if (typeof window !== 'undefined') {
      const userJson = localStorage.getItem('currentUser');
      
      if (!userJson) {
        return null;
      }
      
      return JSON.parse(userJson);
    }
    return null;
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
    if (typeof window !== 'undefined') {
      localStorage.setItem('currentUser', JSON.stringify(user));
      localStorage.setItem('authToken', `mock-token-${Date.now()}`);
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
    if (typeof window !== 'undefined') {
      localStorage.setItem('currentUser', JSON.stringify(newUser));
      localStorage.setItem('authToken', `mock-token-${Date.now()}`);
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
    
    // Clear localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('currentUser');
      localStorage.removeItem('authToken');
    }
    
    return true;
  } catch (error) {
    console.error("Logout error:", error);
    throw error;
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
    if (typeof window !== 'undefined') {
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    }
    
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
    if (typeof window !== 'undefined') {
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    }
    
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
      const storedToken = localStorage.getItem('authToken');
      return storedToken === token;
    }
    
    return false;
  } catch (error) {
    console.error("Verify token error:", error);
    throw error;
  }
}; 
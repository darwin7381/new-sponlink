'use client'

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react'
import { User, SystemRole } from '@/lib/types/users'
import { useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import LoginModal from '@/components/auth/LoginModal'

// Define the AuthContext type
type AuthContextType = {
  isLoggedIn: boolean
  showLoginModal: () => void
  loading: boolean
  user: User | null
  handleLogout: () => void
  error: string | null
  checkAuth: () => Promise<void>
}

// Add global type for Window
declare global {
  interface Window {
    _isLoggingOut?: boolean;
  }
}

// Create AuthContext
const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  showLoginModal: () => {},
  loading: true,
  user: null,
  handleLogout: () => {},
  error: null,
  checkAuth: async () => {},
})

// Create useAuth hook
export const useAuth = () => useContext(AuthContext)

// AuthProvider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { data: session, status } = useSession();

  // Add login modal state
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [loginModalTab, setLoginModalTab] = useState<'login' | 'register'>('login');

  // Monitor session status from NextAuth.js
  useEffect(() => {
    if (status === 'loading') {
      setLoading(true);
      return;
    }

    // Session is loaded (authenticated or not)
    setLoading(false);

    if (status === 'authenticated' && session?.user) {
      // Convert NextAuth session user to our User type
      const authUser: User = {
        id: session.user.id || '',
        email: session.user.email || '',
        // Property names must match User interface in src/lib/types/users.ts
        preferred_language: 'en', // Default language
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        systemRole: session.user.systemRole || SystemRole.USER,
      };

      setUser(authUser);
      setIsLoggedIn(true);
    } else {
      // Not authenticated
      setUser(null);
      setIsLoggedIn(false);
    }
  }, [session, status]);

  // Handle logout
  const handleLogout = useCallback(() => {
    console.log("AuthProvider: Starting logout process");
    
    // Use next-auth's signOut method
    try {
      // Use next-auth to handle logout
      signOut({ redirect: false });
      
      // Update component state (should be handled by the useEffect when session changes)
      
      console.log("AuthProvider: Logout complete, preserving navigation state");
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, []);

  // Check authentication status
  const checkAuth = async () => {
    // Just return the current auth state without returning a value (void)
    // This maintains compatibility with the AuthContextType interface
    Promise.resolve();
  };

  // Method to show login page
  const showLoginModal = () => {
    // Show login modal instead of redirecting
    setLoginModalOpen(true);
    setLoginModalTab('login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn, 
        loading,
        error,
        checkAuth,
        handleLogout,
        showLoginModal, 
      }}
    >
      {children}
      
      {/* Add login modal */}
      <LoginModal 
        isOpen={loginModalOpen} 
        onOpenChange={setLoginModalOpen} 
        defaultTab={loginModalTab} 
      />
    </AuthContext.Provider>
  );
} 
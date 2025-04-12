'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';

interface RequireAuthProps {
  children: React.ReactNode;
  redirectIfUnauthenticated?: boolean;
}

export default function RequireAuth({ children, redirectIfUnauthenticated = true }: RequireAuthProps) {
  const { isLoggedIn, loading, showLoginModal } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If user is not authenticated and redirects are enabled, show login modal
    if (!loading && !isLoggedIn && redirectIfUnauthenticated) {
      console.log('User not authenticated, showing login modal');
      
      // Save current URL to session storage for redirect after login
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('redirectUrl', window.location.pathname);
      }
      
      // Show login modal instead of redirecting
      showLoginModal();
    }
  }, [isLoggedIn, loading, redirectIfUnauthenticated, showLoginModal]);

  if (loading) {
    // Show loading state
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If authenticated, or not authenticated but no redirect needed, show children
  if (isLoggedIn || (!isLoggedIn && !redirectIfUnauthenticated)) {
    return <>{children}</>;
  }

  // If not authenticated and redirect needed, return empty (handled by useEffect)
  return null;
} 
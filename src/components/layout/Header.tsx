"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { getCurrentUser, logout } from '@/lib/services/authService';
import { User } from '@/lib/types/users';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import migrateLegacyAuth from '@/lib/utils/migrateLegacyAuth';
import { useAuth } from '@/components/auth/AuthProvider';
import { Button } from '@/components/ui/button';

export default function Header() {
  const [user, setUser] = useState<User | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { isLoggedIn, showLoginModal, handleLogout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // 處理滾動行為
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 遷移舊版身份驗證數據
  useEffect(() => {
    migrateLegacyAuth();
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };

    fetchUser();
    
    // 監聽登入狀態變更的自定義事件
    const handleAuthChange = () => {
      fetchUser();
    };
    
    window.addEventListener('authChange', handleAuthChange);
    
    return () => {
      window.removeEventListener('authChange', handleAuthChange);
    };
  }, [pathname, router]); // 添加pathname和router作為依賴項，確保路由變更時重新獲取用戶資訊

  return (
    <header className={`fixed top-0 left-0 right-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-background shadow-md' : 'bg-background/90'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-xl font-bold text-primary">
                SponLink
              </Link>
            </div>
            <nav className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link 
                href="/events" 
                className={`${
                  pathname === "/events" || pathname.startsWith("/events/") 
                    ? "border-primary text-foreground" 
                    : "border-transparent text-muted-foreground hover:border-gray-300 hover:text-foreground"
                } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
              >
                Events
              </Link>
              {user && (
                <>
                  <Link 
                    href="/organizer/events" 
                    className={`${
                      pathname === "/organizer/events" || pathname.startsWith("/organizer/events/") 
                        ? "border-primary text-foreground" 
                        : "border-transparent text-muted-foreground hover:border-gray-300 hover:text-foreground"
                    } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                  >
                    My Events
                  </Link>
                  <Link 
                    href="/organizer/events/create" 
                    className={`${
                      pathname === "/organizer/events/create" 
                        ? "border-primary text-foreground" 
                        : "border-transparent text-muted-foreground hover:border-gray-300 hover:text-foreground"
                    } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                  >
                    Create Event
                  </Link>
                  <Link 
                    href="/sponsor/sponsorships" 
                    className={`${
                      pathname === "/sponsor/sponsorships" || pathname.startsWith("/sponsor/sponsorships/") 
                        ? "border-primary text-foreground" 
                        : "border-transparent text-muted-foreground hover:border-gray-300 hover:text-foreground"
                    } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                  >
                    My Sponsorships
                  </Link>
                  <Link 
                    href="/cart" 
                    className={`${
                      pathname === "/cart" 
                        ? "border-primary text-foreground" 
                        : "border-transparent text-muted-foreground hover:border-gray-300 hover:text-foreground"
                    } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                  >
                    Cart
                  </Link>
                  <Link 
                    href="/meetings" 
                    className={`${
                      pathname === "/meetings" 
                        ? "border-primary text-foreground" 
                        : "border-transparent text-muted-foreground hover:border-gray-300 hover:text-foreground"
                    } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                  >
                    Meetings
                  </Link>
                </>
              )}
            </nav>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <Link
              href="/design-system/colors"
              className="text-muted-foreground hover:text-foreground px-3 py-2 mx-2 rounded-md text-sm font-medium flex items-center"
            >
              <svg 
                className="h-5 w-5 mr-1" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <circle cx="12" cy="12" r="4"></circle>
                <line x1="12" y1="2" x2="12" y2="4"></line>
                <line x1="12" y1="20" x2="12" y2="22"></line>
                <line x1="2" y1="12" x2="4" y2="12"></line>
                <line x1="20" y1="12" x2="22" y2="12"></line>
              </svg>
              設計系統
            </Link>
            <ThemeToggle />
            {isLoggedIn ? (
              <div className="ml-3 relative z-50">
                <div>
                  <button
                    type="button"
                    className="bg-card rounded-full flex text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                    id="user-menu-button"
                    aria-expanded="true"
                    aria-haspopup="true"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                  >
                    <span className="sr-only">Open user menu</span>
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                      {user?.email?.charAt(0).toUpperCase() || '?'}
                    </div>
                  </button>
                </div>
                {isMenuOpen && (
                  <div
                    className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-card ring-1 ring-border focus:outline-none z-50"
                    role="menu"
                    aria-orientation="vertical"
                    aria-labelledby="user-menu-button"
                    tabIndex={-1}
                  >
                    <Link
                      href="/dashboard"
                      className="block px-4 py-2 text-sm text-foreground hover:bg-accent"
                      role="menuitem"
                      tabIndex={-1}
                      id="user-menu-item-0"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-sm text-foreground hover:bg-accent"
                      role="menuitem"
                      tabIndex={-1}
                      id="user-menu-item-1"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Profile
                    </Link>
                    <button
                      className="block w-full text-left px-4 py-2 text-sm text-foreground hover:bg-accent"
                      role="menuitem"
                      tabIndex={-1}
                      id="user-menu-item-2"
                      onClick={() => {
                        setIsMenuOpen(false);
                        handleLogout();
                      }}
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex space-x-4">
                <Button
                  variant="ghost"
                  onClick={() => showLoginModal()}
                  className="text-muted-foreground hover:text-foreground hover:bg-accent"
                >
                  Sign in
                </Button>
                <Button
                  onClick={() => showLoginModal(() => router.push('/register'))}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Sign up
                </Button>
              </div>
            )}
          </div>
          <div className="-mr-2 flex items-center sm:hidden">
            <ThemeToggle />
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
              aria-controls="mobile-menu"
              aria-expanded="true"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              <svg
                className={`${isMenuOpen ? 'hidden' : 'block'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
              <svg
                className={`${isMenuOpen ? 'block' : 'hidden'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`${isMenuOpen ? 'block' : 'hidden'} sm:hidden`}
        id="mobile-menu"
      >
        <div className="pt-2 pb-3 space-y-1">
          <Link
            href="/events"
            className={`${
              pathname === "/events" || pathname.startsWith("/events/")
                ? "bg-accent text-foreground border-primary"
                : "text-muted-foreground hover:bg-accent hover:text-foreground border-transparent"
            } block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
            onClick={() => setIsMenuOpen(false)}
          >
            Events
          </Link>
          
          {user && (
            <>
              <Link
                href="/organizer/events"
                className={`${
                  pathname === "/organizer/events" || pathname.startsWith("/organizer/events/")
                    ? "bg-accent text-foreground border-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground border-transparent"
                } block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
                onClick={() => setIsMenuOpen(false)}
              >
                My Events
              </Link>
              <Link
                href="/organizer/events/create"
                className={`${
                  pathname === "/organizer/events/create"
                    ? "bg-accent text-foreground border-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground border-transparent"
                } block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
                onClick={() => setIsMenuOpen(false)}
              >
                Create Event
              </Link>
              <Link
                href="/sponsor/sponsorships"
                className={`${
                  pathname === "/sponsor/sponsorships" || pathname.startsWith("/sponsor/sponsorships/")
                    ? "bg-accent text-foreground border-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground border-transparent"
                } block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
                onClick={() => setIsMenuOpen(false)}
              >
                My Sponsorships
              </Link>
              <Link
                href="/cart"
                className={`${
                  pathname === "/cart"
                    ? "bg-accent text-foreground border-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground border-transparent"
                } block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
                onClick={() => setIsMenuOpen(false)}
              >
                Cart
              </Link>
            </>
          )}
          
          <Link
            href="/meetings"
            className={`${
              pathname === "/meetings"
                ? "bg-accent text-foreground border-primary"
                : "text-muted-foreground hover:bg-accent hover:text-foreground border-transparent"
            } block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
            onClick={() => setIsMenuOpen(false)}
          >
            Meetings
          </Link>
        </div>
        
        {isLoggedIn ? (
          <div className="pt-4 pb-3 border-t border-border">
            <div className="flex items-center px-4">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                  {user?.email?.charAt(0).toUpperCase() || '?'}
                </div>
              </div>
              <div className="ml-3">
                <div className="text-base font-medium text-foreground">
                  {user?.email || '用戶'}
                </div>
              </div>
            </div>
            <div className="mt-3 space-y-1">
              <Link
                href="/dashboard"
                className="block px-4 py-2 text-base font-medium text-muted-foreground hover:text-foreground hover:bg-accent"
                onClick={() => setIsMenuOpen(false)}
              >
                Dashboard
              </Link>
              <Link
                href="/profile"
                className="block px-4 py-2 text-base font-medium text-muted-foreground hover:text-foreground hover:bg-accent"
                onClick={() => setIsMenuOpen(false)}
              >
                Profile
              </Link>
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  handleLogout();
                }}
                className="block w-full text-left px-4 py-2 text-base font-medium text-muted-foreground hover:text-foreground hover:bg-accent"
              >
                Sign out
              </button>
            </div>
          </div>
        ) : (
          <div className="pt-4 pb-3 border-t border-border px-4 space-y-2">
            <Button
              onClick={() => {
                setIsMenuOpen(false);
                showLoginModal();
              }}
              variant="outline"
              className="w-full justify-center"
            >
              Sign in
            </Button>
            <Button
              onClick={() => {
                setIsMenuOpen(false);
                showLoginModal(() => router.push('/register'));
              }}
              className="w-full justify-center"
            >
              Sign up
            </Button>
          </div>
        )}
      </div>
    </header>
  );
} 
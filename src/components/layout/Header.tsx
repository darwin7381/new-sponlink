"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { getCurrentUser, logout } from '@/lib/services/authService';
import { User, USER_ROLES } from '@/lib/types/users';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import migrateLegacyAuth from '@/lib/utils/migrateLegacyAuth';

export default function Header() {
  const [user, setUser] = useState<User | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
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

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

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
              {user && user.role === USER_ROLES.ORGANIZER && (
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
                </>
              )}
              {user && user.role === USER_ROLES.SPONSOR && (
                <>
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
                </>
              )}
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
            </nav>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <ThemeToggle />
            {user ? (
              <div className="ml-3 relative z-50">
                <div>
                  <button
                    type="button"
                    className="bg-card rounded-full flex text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                    id="user-menu-button"
                    aria-expanded={isMenuOpen}
                    aria-haspopup="true"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                  >
                    <span className="sr-only">Open user menu</span>
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                      {user.email.charAt(0).toUpperCase()}
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
                      href={user.role === USER_ROLES.SPONSOR ? "/dashboard/sponsor" : "/dashboard/organizer"}
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
                <Link
                  href="/login"
                  className="text-muted-foreground hover:text-foreground px-3 py-2 rounded-md text-sm font-medium"
                >
                  Sign in
                </Link>
                <Link
                  href="/register"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
          <div className="-mr-2 flex items-center sm:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
              aria-controls="mobile-menu"
              aria-expanded={isMenuOpen}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              {!isMenuOpen ? (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              ) : (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="sm:hidden bg-background border-t border-border" id="mobile-menu">
          <div className="pt-2 pb-3 space-y-1">
            <Link
              href="/events"
              className={`${
                pathname === "/events" || pathname.startsWith("/events/")
                  ? "bg-primary/10 border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:bg-accent hover:border-gray-300 hover:text-foreground"
              } block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
              onClick={() => setIsMenuOpen(false)}
            >
              Events
            </Link>
            {user && user.role === USER_ROLES.ORGANIZER && (
              <>
                <Link
                  href="/organizer/events"
                  className={`${
                    pathname === "/organizer/events" || pathname.startsWith("/organizer/events/")
                      ? "bg-primary/10 border-primary text-foreground"
                      : "border-transparent text-muted-foreground hover:bg-accent hover:border-gray-300 hover:text-foreground"
                  } block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  My Events
                </Link>
                <Link
                  href="/organizer/events/create"
                  className={`${
                    pathname === "/organizer/events/create"
                      ? "bg-primary/10 border-primary text-foreground"
                      : "border-transparent text-muted-foreground hover:bg-accent hover:border-gray-300 hover:text-foreground"
                  } block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Create Event
                </Link>
              </>
            )}
            {user && user.role === USER_ROLES.SPONSOR && (
              <>
                <Link
                  href="/sponsor/sponsorships"
                  className={`${
                    pathname === "/sponsor/sponsorships" || pathname.startsWith("/sponsor/sponsorships/")
                      ? "bg-primary/10 border-primary text-foreground"
                      : "border-transparent text-muted-foreground hover:bg-accent hover:border-gray-300 hover:text-foreground"
                  } block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  My Sponsorships
                </Link>
                <Link
                  href="/cart"
                  className={`${
                    pathname === "/cart"
                      ? "bg-primary/10 border-primary text-foreground"
                      : "border-transparent text-muted-foreground hover:bg-accent hover:border-gray-300 hover:text-foreground"
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
                  ? "bg-primary/10 border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:bg-accent hover:border-gray-300 hover:text-foreground"
              } block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
              onClick={() => setIsMenuOpen(false)}
            >
              Meetings
            </Link>
          </div>
          <div className="pt-4 pb-3 border-t border-border">
            {user ? (
              <>
                <div className="flex items-center px-4">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                      {user.email.charAt(0).toUpperCase()}
                    </div>
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium text-foreground">{user.email}</div>
                    <div className="text-sm font-medium text-muted-foreground">
                      {user.role === USER_ROLES.SPONSOR ? 'Sponsor' : 'Organizer'}
                    </div>
                  </div>
                  <div className="ml-auto">
                    <ThemeToggle />
                  </div>
                </div>
                <div className="mt-3 space-y-1">
                  <Link
                    href={user.role === USER_ROLES.SPONSOR ? "/dashboard/sponsor" : "/dashboard/organizer"}
                    className="block px-4 py-2 text-base font-medium text-foreground hover:bg-accent"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/profile"
                    className="block px-4 py-2 text-base font-medium text-foreground hover:bg-accent"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      handleLogout();
                    }}
                    className="block w-full text-left px-4 py-2 text-base font-medium text-foreground hover:bg-accent"
                  >
                    Sign out
                  </button>
                </div>
              </>
            ) : (
              <div className="flex flex-col space-y-2 px-4">
                <Link
                  href="/login"
                  className="text-center block w-full py-2 text-sm font-medium text-muted-foreground bg-accent rounded-md hover:bg-accent/80"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign in
                </Link>
                <Link
                  href="/register"
                  className="text-center block w-full py-2 text-sm font-medium text-primary-foreground bg-primary rounded-md hover:bg-primary/90"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign up
                </Link>
                <div className="flex justify-center py-2">
                  <ThemeToggle />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
} 
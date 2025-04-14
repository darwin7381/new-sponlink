"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { User } from '@/lib/types/users';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { useAuth } from '@/components/auth/AuthProvider';
import { Button } from '@/components/ui/button';
import { getNotifications } from '@/services/userPreferenceService';
import { BellIcon, Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { Badge } from '@/components/ui/badge';
import { Logo } from '@/components/theme/Logo';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { isLoggedIn, user, showLoginModal, handleLogout } = useAuth();
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

  // 獲取用戶未讀通知數量 - 只在用戶登入時執行
  useEffect(() => {
    const fetchNotifications = async () => {
      if (isLoggedIn && user && user.id) {
        try {
          const notifications = await getNotifications(user.id, { unreadOnly: true });
          setUnreadCount(notifications.length);
        } catch (error) {
          console.error('Error fetching notifications:', error);
        }
      }
    };
    
    if (isLoggedIn) {
      fetchNotifications();
      
      // 監聽通知狀態變更的自定義事件
      const handleNotificationsUpdate = () => {
        fetchNotifications();
      };
      
      window.addEventListener('notificationsUpdate', handleNotificationsUpdate);
      
      return () => {
        window.removeEventListener('notificationsUpdate', handleNotificationsUpdate);
      };
    }
  }, [isLoggedIn, user]);

  return (
    <header className={`fixed top-0 left-0 right-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-background shadow-md' : 'bg-background/90'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="flex items-center">
                {/* 根据主题自动切换Logo - 浅色主题用white logo(黑字)，深色主题用dark logo(白字) */}
                <Logo variant="horizontal" width={160} height={40} />
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
              Design System
            </Link>
            <ThemeToggle />
            {isLoggedIn ? (
              <>
                {/* 通知圖標 */}
                <Link href="/notifications" className="relative px-2 py-1 mx-2">
                  <BellIcon className="h-5 w-5 text-muted-foreground hover:text-foreground" />
                  {unreadCount > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-1 -right-1 min-w-[1.1rem] h-[1.1rem] flex items-center justify-center text-[0.65rem] px-[0.15rem] rounded-full"
                    >
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </Badge>
                  )}
                </Link>
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
                      <Link
                        href="/notifications"
                        className="block px-4 py-2 text-sm text-foreground hover:bg-accent"
                        role="menuitem"
                        tabIndex={-1}
                        id="user-menu-item-2"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <span className="flex items-center justify-between w-full">
                          <span className="flex items-center">
                            <BellIcon className="h-4 w-4 mr-2" />
                            Notifications
                          </span>
                          {unreadCount > 0 && (
                            <Badge variant="destructive" className="ml-2">
                              {unreadCount}
                            </Badge>
                          )}
                        </span>
                      </Link>
                      <button
                        className="block w-full text-left px-4 py-2 text-sm text-foreground hover:bg-accent"
                        role="menuitem"
                        tabIndex={-1}
                        id="user-menu-item-3"
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
              </>
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
                  onClick={() => showLoginModal()}
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
              <Bars3Icon
                className={`${isMenuOpen ? 'hidden' : 'block'} h-6 w-6`}
                aria-hidden="true"
              />
              <XMarkIcon
                className={`${isMenuOpen ? 'block' : 'hidden'} h-6 w-6`}
                aria-hidden="true"
              />
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
                  {user?.email || 'User'}
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
              <Link
                href="/notifications"
                className="block px-4 py-2 text-base font-medium text-muted-foreground hover:text-foreground hover:bg-accent"
                onClick={() => setIsMenuOpen(false)}
              >
                <span className="flex items-center justify-between w-full">
                  <span className="flex items-center">
                    <BellIcon className="h-4 w-4 mr-2" />
                    Notifications
                  </span>
                  {unreadCount > 0 && (
                    <Badge variant="destructive" className="ml-2">
                      {unreadCount}
                    </Badge>
                  )}
                </span>
              </Link>
              <button
                className="block w-full text-left px-4 py-2 text-base font-medium text-muted-foreground hover:text-foreground hover:bg-accent"
                role="menuitem"
                tabIndex={-1}
                id="user-menu-item-3"
                onClick={() => {
                  setIsMenuOpen(false);
                  handleLogout();
                }}
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
                showLoginModal();
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
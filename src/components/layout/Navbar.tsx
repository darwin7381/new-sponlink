'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { USER_ROLES } from "@/lib/types/users";
import { 
  getCurrentUser, 
  logout, 
  isAuthenticated, 
  hasRole, 
  getActiveView,
  VIEW_TYPE
} from "@/lib/services/authService";
import { ViewSwitcher } from "@/components/view/ViewSwitcher";

interface User {
  id: string;
  email: string;
  role: string;
  preferred_language?: string;
}

export default function Navbar() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isUserAuthenticated, setIsUserAuthenticated] = useState(false);
  const [isSponsor, setIsSponsor] = useState(false);
  const [isOrganizer, setIsOrganizer] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeView, setActiveView] = useState<VIEW_TYPE | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  // Handle scroll behavior for navbar
  const [scrolled, setScrolled] = useState(false);
  
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

  // Check authentication status and load active view
  useEffect(() => {
    const checkAuth = async () => {
      if (isAuthenticated()) {
        try {
          const user = await getCurrentUser();
          if (user) {
            setCurrentUser(user);
            setIsUserAuthenticated(true);
            setIsSponsor(hasRole(USER_ROLES.SPONSOR));
            setIsOrganizer(hasRole(USER_ROLES.ORGANIZER));
            
            // 載入當前視角
            const view = getActiveView();
            setActiveView(view);
          }
        } catch (e) {
          console.error("Error getting user data:", e);
        }
      }
    };
    
    checkAuth();
    
    // 監聽視角變更事件
    const handleViewChange = () => {
      setActiveView(getActiveView());
    };
    
    window.addEventListener('viewChange', handleViewChange);
    
    return () => {
      window.removeEventListener('viewChange', handleViewChange);
    };
  }, []);

  const handleLogout = async () => {
    try {
      logout();
      
      // Reset state
      setCurrentUser(null);
      setIsUserAuthenticated(false);
      setIsSponsor(false);
      setIsOrganizer(false);
      setActiveView(null);
      
      // Redirect to login page
      router.push("/login");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  // 根據當前視角和所有權決定顯示的導航項
  const renderNavigationItems = () => {
    const commonItems = (
      <Link
        href="/events"
        className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
          pathname === "/events" ? "border-indigo-500 text-gray-900" : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
        }`}
      >
        Events
      </Link>
    );
    
    // 如果用戶未登入，只顯示公共項目
    if (!isUserAuthenticated) {
      return commonItems;
    }
    
    // 根據當前視角顯示相應導航項
    if (activeView === VIEW_TYPE.EVENT_ORGANIZER) {
      return (
        <>
          {commonItems}
          <Link
            href="/dashboard/events"
            className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
              pathname === "/dashboard/events" ? "border-indigo-500 text-gray-900" : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
            }`}
          >
            My Events
          </Link>
          <Link
            href="/events/create"
            className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
              pathname === "/events/create" ? "border-indigo-500 text-gray-900" : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
            }`}
          >
            Create Event
          </Link>
          <Link
            href="/meetings/organizer"
            className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
              pathname === "/meetings/organizer" ? "border-indigo-500 text-gray-900" : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
            }`}
          >
            Meetings
          </Link>
        </>
      );
    } else if (activeView === VIEW_TYPE.SPONSORSHIP_MANAGER) {
      return (
        <>
          {commonItems}
          <Link
            href="/dashboard/sponsorships"
            className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
              pathname === "/dashboard/sponsorships" ? "border-indigo-500 text-gray-900" : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
            }`}
          >
            My Sponsorships
          </Link>
          <Link
            href="/cart"
            className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
              pathname === "/cart" ? "border-indigo-500 text-gray-900" : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
            }`}
          >
            Cart
          </Link>
          <Link
            href="/meetings/sponsor"
            className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
              pathname === "/meetings/sponsor" ? "border-indigo-500 text-gray-900" : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
            }`}
          >
            Meetings
          </Link>
        </>
      );
    }
    
    // 如果用戶登入但沒有選擇視角，顯示兩種視角的簡化導航項
    return (
      <>
        {commonItems}
        {isOrganizer && (
          <Link
            href="/dashboard/events"
            className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
              pathname === "/dashboard/events" ? "border-indigo-500 text-gray-900" : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
            }`}
          >
            My Events
          </Link>
        )}
        {isSponsor && (
          <Link
            href="/dashboard/sponsorships"
            className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
              pathname === "/dashboard/sponsorships" ? "border-indigo-500 text-gray-900" : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
            }`}
          >
            My Sponsorships
          </Link>
        )}
      </>
    );
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white shadow-md' : 'bg-white bg-opacity-90'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold text-indigo-600">SponLink</span>
            </Link>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {renderNavigationItems()}
            </div>
          </div>
          
          <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-4">
            {isUserAuthenticated && <ViewSwitcher />}
            
            {isUserAuthenticated ? (
              <div className="ml-3 relative z-50">
                <div className="flex items-center">
                  <span className="mr-4 text-sm text-gray-700">
                    {currentUser?.email}
                  </span>
                  <Button
                    variant="outline"
                    onClick={handleLogout}
                  >
                    Logout
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex space-x-4">
                <Link href="/login">
                  <Button variant="outline">
                    Login
                  </Button>
                </Link>
                <Link href="/register">
                  <Button variant="default">
                    Register
                  </Button>
                </Link>
              </div>
            )}
          </div>
          
          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
              aria-expanded="false"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              {/* Icon when menu is closed */}
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
              {/* Icon when menu is open */}
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

      {/* Mobile menu, show/hide based on menu state */}
      <div className={`${isMenuOpen ? 'block' : 'hidden'} sm:hidden bg-white`}>
        <div className="pt-2 pb-3 space-y-1">
          <Link
            href="/events"
            className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
              pathname === "/events"
                ? "border-indigo-500 text-indigo-700 bg-indigo-50"
                : "border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700"
            }`}
          >
            Events
          </Link>
          
          {isUserAuthenticated && (
            <>
              {activeView === VIEW_TYPE.EVENT_ORGANIZER ? (
                <>
                  <Link
                    href="/dashboard/events"
                    className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                      pathname === "/dashboard/events"
                        ? "border-indigo-500 text-indigo-700 bg-indigo-50"
                        : "border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700"
                    }`}
                  >
                    My Events
                  </Link>
                  <Link
                    href="/events/create"
                    className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                      pathname === "/events/create"
                        ? "border-indigo-500 text-indigo-700 bg-indigo-50"
                        : "border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700"
                    }`}
                  >
                    Create Event
                  </Link>
                </>
              ) : activeView === VIEW_TYPE.SPONSORSHIP_MANAGER ? (
                <>
                  <Link
                    href="/dashboard/sponsorships"
                    className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                      pathname === "/dashboard/sponsorships"
                        ? "border-indigo-500 text-indigo-700 bg-indigo-50"
                        : "border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700"
                    }`}
                  >
                    My Sponsorships
                  </Link>
                  <Link
                    href="/cart"
                    className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                      pathname === "/cart"
                        ? "border-indigo-500 text-indigo-700 bg-indigo-50"
                        : "border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700"
                    }`}
                  >
                    Cart
                  </Link>
                </>
              ) : (
                <>
                  {isOrganizer && (
                    <Link
                      href="/dashboard/events"
                      className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                        pathname === "/dashboard/events"
                          ? "border-indigo-500 text-indigo-700 bg-indigo-50"
                          : "border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700"
                      }`}
                    >
                      My Events
                    </Link>
                  )}
                  {isSponsor && (
                    <Link
                      href="/dashboard/sponsorships"
                      className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                        pathname === "/dashboard/sponsorships"
                          ? "border-indigo-500 text-indigo-700 bg-indigo-50"
                          : "border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700"
                      }`}
                    >
                      My Sponsorships
                    </Link>
                  )}
                </>
              )}
              
              {/* 移動端的視角切換器 */}
              <div className="pl-3 pr-4 py-2 border-l-4 border-transparent">
                <ViewSwitcher />
              </div>
            </>
          )}
        </div>
        
        <div className="pt-4 pb-3 border-t border-gray-200">
          {isUserAuthenticated ? (
            <div className="flex items-center px-4">
              <div className="ml-3">
                <div className="text-base font-medium text-gray-800">{currentUser?.email}</div>
              </div>
              <Button
                variant="outline"
                className="ml-auto"
                onClick={handleLogout}
              >
                Logout
              </Button>
            </div>
          ) : (
            <div className="flex flex-col space-y-2 px-4">
              <Link href="/login">
                <Button variant="outline" className="w-full">Login</Button>
              </Link>
              <Link href="/register">
                <Button variant="default" className="w-full">Register</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
} 
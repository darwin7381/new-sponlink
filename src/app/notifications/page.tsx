'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
// 移除舊的身份驗證方法引用
// import { getCurrentUser, isAuthenticated } from '@/lib/services/authService';
import { 
  getNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead 
} from '@/services/userPreferenceService';
import { Notification } from '@/types/userPreferences';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Bell, 
  BellOff, 
  Check, 
  Trash2, 
  CheckCheck, 
  ExternalLink, 
  ChevronRight, 
  Calendar,
  LogIn
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { toast } from 'sonner';
import { useAuth } from "@/components/auth/AuthProvider";

export default function NotificationsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');
  const router = useRouter();
  // 使用useAuth替代手動檢查
  const { user, isLoggedIn, showLoginModal } = useAuth();

  // Load user data and notifications
  useEffect(() => {
    const loadUserData = async () => {
      try {
        setIsLoading(true);
        
        // Only load notifications if user is logged in
        if (isLoggedIn && user?.id) {
          loadNotifications(user.id);
        }
      } catch (error) {
        console.error('Authentication check error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, [isLoggedIn, user]);

  // Load notifications
  const loadNotifications = async (uid: string) => {
    try {
      const items = await getNotifications(uid);
      setNotifications(items);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Unable to load notifications');
    }
  };

  // Mark notification as read
  const handleMarkAsRead = async (notificationId: string) => {
    if (!isLoggedIn || !user?.id) {
      showLoginModal();
      return;
    }
    
    try {
      await markNotificationAsRead(notificationId);
      // Update local state
      setNotifications(prev => prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true } 
          : notification
      ));
      
      toast.success('Notification marked as read');
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error('Failed to mark notification as read');
    }
  };

  // Mark all notifications as read
  const handleMarkAllAsRead = async () => {
    if (!isLoggedIn || !user?.id) {
      showLoginModal();
      return;
    }

    try {
      await markAllNotificationsAsRead(user.id);
      // Update local state
      setNotifications(prev => prev.map(notification => ({ ...notification, read: true })));
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast.error('Failed to mark all notifications as read');
    }
  };

  // Get filtered notifications
  const getFilteredNotifications = () => {
    if (activeTab === 'unread') {
      return notifications.filter(notification => !notification.read);
    }
    return notifications;
  };

  // Get unread notification count
  const getUnreadCount = () => {
    return notifications.filter(notification => !notification.read).length;
  };

  // Format time display
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    
    try {
      // Show relative time (e.g., "3 hours ago")
      return formatDistanceToNow(date, { addSuffix: true, locale: enUS });
    } catch (e) {
      // If an error occurs, return standard date format
      return format(date, 'yyyy-MM-dd HH:mm');
    }
  };

  const filteredNotifications = getFilteredNotifications();
  const unreadCount = getUnreadCount();

  // Loading display
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Notification Center</h1>
        </div>
        <div className="h-64 w-full flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  // Show login status - changed to match logged-out state
  if (!isLoggedIn || !user?.id) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Notification Center</h1>
          <Button variant="outline" size="sm" onClick={() => router.push('/')}>
            Back to Home
          </Button>
        </div>
        
        {/* Show content identical to logged-out state */}
        <div className="text-center py-20 border rounded-lg border-dashed">
          <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">No Notifications</h3>
          <p className="text-muted-foreground mb-6">
            You currently have no notifications
          </p>
          <Button onClick={() => router.push('/')}>Back to Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      {/* Page title */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold">Notification Center</h1>
          {unreadCount > 0 && (
            <Badge variant="destructive" className="rounded-full px-2.5">
              {unreadCount}
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={handleMarkAllAsRead}>
              <CheckCheck className="h-4 w-4 mr-1" />
              Mark All as Read
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => router.push('/profile')}>
            Back to Profile
          </Button>
        </div>
      </div>

      {/* Category tabs */}
      <Tabs defaultValue="all" value={activeTab} onValueChange={(value) => setActiveTab(value as 'all' | 'unread')}>
        <TabsList className="mb-6 w-full grid grid-cols-2">
          <TabsTrigger value="all" className="flex-1">
            All Notifications
          </TabsTrigger>
          <TabsTrigger value="unread" className="flex-1">
            Unread <Badge variant="outline" className="ml-2">{unreadCount}</Badge>
          </TabsTrigger>
        </TabsList>

        {/* All notifications content */}
        <TabsContent value="all" className="mt-0">
          {renderNotificationsList(filteredNotifications)}
        </TabsContent>
        
        {/* Unread notifications content */}
        <TabsContent value="unread" className="mt-0">
          {renderNotificationsList(filteredNotifications)}
        </TabsContent>
      </Tabs>
    </div>
  );

  // Render notifications list
  function renderNotificationsList(items: Notification[]) {
    if (items.length === 0) {
      return (
        <div className="text-center py-20 border rounded-lg border-dashed">
          <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">No Notifications</h3>
          <p className="text-muted-foreground mb-6">
            {activeTab === 'all' 
              ? 'You currently have no notifications' 
              : 'You have no unread notifications'}
          </p>
          <Button onClick={() => router.push('/profile')}>Back to Profile</Button>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {items.map((notification) => (
          <Card 
            key={notification.id} 
            className={`overflow-hidden hover:shadow-sm transition-shadow ${!notification.read ? 'bg-primary/5 border-primary/20' : ''}`}
          >
            <div className="p-4 relative">
              <div className="flex items-start gap-4">
                {/* Notification icon */}
                <div className={`p-2 rounded-full ${!notification.read ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                  <Bell className="h-5 w-5" />
                </div>
                
                {/* Notification content */}
                <div className="flex-grow">
                  <h3 className="font-medium mb-1">{notification.title}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{notification.content}</p>
                  
                  <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {formatTime(notification.created_at)}
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mt-3">
                    {notification.link && (
                      <Link href={notification.link}>
                        <Button variant="outline" size="sm" className="flex items-center text-xs">
                          View Details
                          <ChevronRight className="h-3 w-3 ml-1" />
                        </Button>
                      </Link>
                    )}
                    
                    {!notification.read && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="flex items-center text-xs"
                        onClick={() => handleMarkAsRead(notification.id)}
                      >
                        <Check className="h-3 w-3 mr-1" />
                        Mark as Read
                      </Button>
                    )}
                  </div>
                </div>
                
                {/* Read indicator */}
                {notification.read && (
                  <div className="text-muted-foreground/50">
                    <Check className="h-4 w-4" />
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }
} 
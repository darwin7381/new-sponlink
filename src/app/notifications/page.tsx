'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser, isAuthenticated } from '@/lib/services/authService';
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
  Calendar 
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { zhTW } from 'date-fns/locale';
import { toast } from 'sonner';

export default function NotificationsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');
  const router = useRouter();

  // 加載用戶資料和通知
  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (!isAuthenticated()) {
          router.push('/login');
          return;
        }

        const user = await getCurrentUser();
        if (!user) {
          router.push('/login');
          return;
        }

        setUserId(user.id);
        loadNotifications(user.id);
      } catch (error) {
        console.error('認證檢查錯誤:', error);
        router.push('/login');
      }
    };

    checkAuth();
  }, [router]);

  // 加載通知
  const loadNotifications = async (uid: string) => {
    setIsLoading(true);
    try {
      const items = await getNotifications(uid);
      setNotifications(items);
    } catch (error) {
      console.error('獲取通知錯誤:', error);
      toast.error('無法載入通知');
    } finally {
      setIsLoading(false);
    }
  };

  // 標記通知為已讀
  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markNotificationAsRead(notificationId);
      // 更新本地狀態
      setNotifications(prev => prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true } 
          : notification
      ));
      
      toast.success('通知已標記為已讀');
    } catch (error) {
      console.error('標記通知為已讀錯誤:', error);
      toast.error('標記通知失敗');
    }
  };

  // 標記所有通知為已讀
  const handleMarkAllAsRead = async () => {
    if (!userId) return;

    try {
      await markAllNotificationsAsRead(userId);
      // 更新本地狀態
      setNotifications(prev => prev.map(notification => ({ ...notification, read: true })));
      toast.success('所有通知已標記為已讀');
    } catch (error) {
      console.error('標記所有通知為已讀錯誤:', error);
      toast.error('標記所有通知失敗');
    }
  };

  // 獲取過濾後的通知
  const getFilteredNotifications = () => {
    if (activeTab === 'unread') {
      return notifications.filter(notification => !notification.read);
    }
    return notifications;
  };

  // 獲取未讀通知數量
  const getUnreadCount = () => {
    return notifications.filter(notification => !notification.read).length;
  };

  // 格式化時間顯示
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    
    try {
      // 顯示相對時間（例如："3小時前"）
      return formatDistanceToNow(date, { addSuffix: true, locale: zhTW });
    } catch (e) {
      // 如果發生錯誤，則返回標準日期格式
      return format(date, 'yyyy-MM-dd HH:mm');
    }
  };

  const filteredNotifications = getFilteredNotifications();
  const unreadCount = getUnreadCount();

  // 載入中顯示
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">通知中心</h1>
        </div>
        <div className="h-64 w-full flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      {/* 頁面標題 */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold">通知中心</h1>
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
              全部標為已讀
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => router.push('/profile')}>
            返回個人資料
          </Button>
        </div>
      </div>

      {/* 分類標籤 */}
      <Tabs defaultValue="all" value={activeTab} onValueChange={(value) => setActiveTab(value as 'all' | 'unread')}>
        <TabsList className="mb-6 w-full grid grid-cols-2">
          <TabsTrigger value="all" className="flex-1">
            全部通知
          </TabsTrigger>
          <TabsTrigger value="unread" className="flex-1">
            未讀通知 <Badge variant="outline" className="ml-2">{unreadCount}</Badge>
          </TabsTrigger>
        </TabsList>

        {/* 所有通知內容 */}
        <TabsContent value="all" className="mt-0">
          {renderNotificationsList(filteredNotifications)}
        </TabsContent>
        
        {/* 未讀通知內容 */}
        <TabsContent value="unread" className="mt-0">
          {renderNotificationsList(filteredNotifications)}
        </TabsContent>
      </Tabs>
    </div>
  );

  // 渲染通知列表
  function renderNotificationsList(items: Notification[]) {
    if (items.length === 0) {
      return (
        <div className="text-center py-20 border rounded-lg border-dashed">
          <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">沒有通知</h3>
          <p className="text-muted-foreground mb-6">
            {activeTab === 'all' 
              ? '您目前沒有任何通知' 
              : '您沒有未讀通知'}
          </p>
          <Button onClick={() => router.push('/profile')}>返回個人資料</Button>
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
                {/* 通知圖標 */}
                <div className={`p-2 rounded-full ${!notification.read ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                  <Bell className="h-5 w-5" />
                </div>
                
                {/* 通知內容 */}
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
                          查看詳情
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
                        標記為已讀
                      </Button>
                    )}
                  </div>
                </div>
                
                {/* 已讀指示器 */}
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
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/components/auth/AuthProvider';
import { 
  getSubscriptions, 
  cancelSubscription, 
  updateSubscription 
} from '@/services/userPreferenceService';
import { 
  Subscription, 
  CollectionType, 
  NotificationFrequency,
  NotificationDetailLevel 
} from '@/types/userPreferences';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  Search, 
  BellOff, 
  Calendar, 
  MapPin, 
  Tags, 
  Building, 
  Bell, 
  AlertCircle,
  ChevronRight, 
  ChevronUp,
  ChevronDown,
  Settings,
  Mail,
  Smartphone,
  Clock
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function FollowsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSettings, setExpandedSettings] = useState<string | null>(null);
  const router = useRouter();
  const { isLoggedIn, user, showLoginModal } = useAuth();
  
  // Load user data and followed items
  useEffect(() => {
    const loadUserData = async () => {
      try {
        if (!isLoggedIn || !user) {
          showLoginModal();
          return;
        }

        loadSubscriptions(user.id);
      } catch (error) {
        console.error('Error loading data:', error);
        showLoginModal();
      }
    };

    loadUserData();
  }, [isLoggedIn, user, router, showLoginModal]);

  // 加載關注項目
  const loadSubscriptions = async (uid: string) => {
    setIsLoading(true);
    try {
      const items = await getSubscriptions(uid);
      setSubscriptions(items);
    } catch (error) {
      console.error('獲取關注項目錯誤:', error);
      toast.error('無法載入關注項目');
    } finally {
      setIsLoading(false);
    }
  };

  // 取消關注
  const handleUnfollow = async (subscriptionId: string) => {
    if (!user) return;

    try {
      await cancelSubscription(subscriptionId);
      toast.success('已取消關注');
      // 更新列表
      setSubscriptions(prev => prev.filter(sub => sub.id !== subscriptionId));
      // 收起設置面板
      setExpandedSettings(null);
    } catch (error) {
      console.error('取消關注錯誤:', error);
      toast.error('取消關注失敗');
    }
  };

  // 更新關注設置
  const handleUpdateSettings = async (subscription: Subscription, updates: Partial<{
    frequency: NotificationFrequency;
    content_level: NotificationDetailLevel;
    channels: Partial<{
      email: boolean;
      browser: boolean;
      in_app: boolean;
    }>;
  }>) => {
    try {
      await updateSubscription(subscription.id, {
        notification_settings: updates
      });
      toast.success('設置已更新');
      
      // 更新本地狀態
      setSubscriptions(prev => prev.map(sub => 
        sub.id === subscription.id ? {
          ...sub,
          notification_settings: {
            ...sub.notification_settings,
            ...updates,
            channels: {
              ...sub.notification_settings.channels,
              ...updates.channels
            }
          }
        } : sub
      ));
    } catch (error) {
      console.error('更新關注設置錯誤:', error);
      toast.error('更新設置失敗');
    }
  };

  // 篩選關注項目
  const getFilteredItems = () => {
    let filtered = subscriptions;

    // 依據標籤篩選
    if (activeTab !== 'all') {
      filtered = filtered.filter(item => item.collection_type === activeTab);
    }

    // 依據搜尋關鍵字篩選 (這裡僅作為示例，實際上需要更多元數據)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item => 
        item.collection_id.toLowerCase().includes(query) || 
        item.collection_type.toLowerCase().includes(query)
      );
    }

    return filtered;
  };

  // 獲取標籤計數
  const getTabCounts = () => {
    const counts = {
      all: subscriptions.length,
      organizer: 0,
      category: 0,
      location: 0,
      event_series: 0,
      custom_collection: 0,
      event: 0
    };

    subscriptions.forEach(item => {
      if (counts.hasOwnProperty(item.collection_type)) {
        counts[item.collection_type as keyof typeof counts]++;
      }
    });

    return counts;
  };

  const tabCounts = getTabCounts();
  const filteredItems = getFilteredItems();

  // 格式化日期顯示
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, 'yyyy-MM-dd');
    } catch (e) {
      return dateString;
    }
  };

  // 獲取關注類型圖標
  const getCollectionTypeIcon = (type: CollectionType) => {
    switch (type) {
      case CollectionType.ORGANIZER:
        return <Building className="h-4 w-4 mr-1" />;
      case CollectionType.CATEGORY:
        return <Tags className="h-4 w-4 mr-1" />;
      case CollectionType.LOCATION:
        return <MapPin className="h-4 w-4 mr-1" />;
      case CollectionType.EVENT_SERIES:
        return <Calendar className="h-4 w-4 mr-1" />;
      case CollectionType.EVENT:
        return <Calendar className="h-4 w-4 mr-1" />;
      default:
        return <Bell className="h-4 w-4 mr-1" />;
    }
  };

  // 獲取關注類型中文名稱
  const getCollectionTypeName = (type: CollectionType) => {
    switch (type) {
      case CollectionType.ORGANIZER:
        return '主辦方';
      case CollectionType.CATEGORY:
        return '活動類別';
      case CollectionType.LOCATION:
        return '地區';
      case CollectionType.EVENT_SERIES:
        return '活動系列';
      case CollectionType.CUSTOM_COLLECTION:
        return '自定義集合';
      case CollectionType.EVENT:
        return '單一活動';
      default:
        return '未知類型';
    }
  };

  // 獲取關注詳情頁面連結
  const getCollectionLink = (subscription: Subscription) => {
    switch (subscription.collection_type) {
      case CollectionType.ORGANIZER:
        return `/organizer/${subscription.collection_id}`;
      case CollectionType.CATEGORY:
        return `/events?category=${subscription.collection_id}`;
      case CollectionType.LOCATION:
        return `/events?location=${subscription.collection_id}`;
      case CollectionType.EVENT_SERIES:
        return `/event-series/${subscription.collection_id}`;
      case CollectionType.EVENT:
        return `/events/${subscription.collection_id}`;
      default:
        return '#';
    }
  };

  // 獲取通知頻率名稱
  const getFrequencyName = (frequency: NotificationFrequency) => {
    switch (frequency) {
      case NotificationFrequency.IMMEDIATELY:
        return '即時通知';
      case NotificationFrequency.DAILY:
        return '每日摘要';
      case NotificationFrequency.WEEKLY:
        return '每週摘要';
      default:
        return '未知';
    }
  };

  // 獲取通知詳細程度名稱
  const getDetailLevelName = (level: NotificationDetailLevel) => {
    switch (level) {
      case NotificationDetailLevel.BRIEF:
        return '簡短提醒';
      case NotificationDetailLevel.DETAILED:
        return '詳細內容';
      case NotificationDetailLevel.CUSTOM:
        return '自定義';
      default:
        return '未知';
    }
  };

  // 載入中顯示
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">我的關注</h1>
        </div>
        <div className="h-64 w-full flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* 頁面標題 */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">我的關注</h1>
        <Button variant="outline" onClick={() => router.push('/profile')}>
          返回個人資料
        </Button>
      </div>

      {/* 搜索欄 */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜索關注項目..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* 分類標籤 */}
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6 w-full sm:w-auto grid grid-cols-3 sm:flex">
          <TabsTrigger value="all">
            全部 <Badge variant="outline" className="ml-2">{tabCounts.all}</Badge>
          </TabsTrigger>
          <TabsTrigger value={CollectionType.ORGANIZER}>
            主辦方 <Badge variant="outline" className="ml-2">{tabCounts.organizer}</Badge>
          </TabsTrigger>
          <TabsTrigger value={CollectionType.CATEGORY}>
            類別 <Badge variant="outline" className="ml-2">{tabCounts.category}</Badge>
          </TabsTrigger>
          <TabsTrigger value={CollectionType.LOCATION}>
            地區 <Badge variant="outline" className="ml-2">{tabCounts.location}</Badge>
          </TabsTrigger>
          <TabsTrigger value={CollectionType.EVENT}>
            活動 <Badge variant="outline" className="ml-2">{tabCounts.event}</Badge>
          </TabsTrigger>
        </TabsList>

        {/* 所有分類的內容 */}
        <TabsContent value="all" className="mt-0">
          {renderSubscriptionsList(filteredItems)}
        </TabsContent>
        
        {/* 主辦方分類 */}
        <TabsContent value={CollectionType.ORGANIZER} className="mt-0">
          {renderSubscriptionsList(filteredItems)}
        </TabsContent>
        
        {/* 類別分類 */}
        <TabsContent value={CollectionType.CATEGORY} className="mt-0">
          {renderSubscriptionsList(filteredItems)}
        </TabsContent>
        
        {/* 地區分類 */}
        <TabsContent value={CollectionType.LOCATION} className="mt-0">
          {renderSubscriptionsList(filteredItems)}
        </TabsContent>
        
        {/* 活動分類 */}
        <TabsContent value={CollectionType.EVENT} className="mt-0">
          {renderSubscriptionsList(filteredItems)}
        </TabsContent>
      </Tabs>
    </div>
  );

  // 渲染關注項目列表
  function renderSubscriptionsList(items: Subscription[]) {
    if (items.length === 0) {
      return (
        <div className="text-center py-20 border rounded-lg border-dashed">
          <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">沒有關注項目</h3>
          <p className="text-muted-foreground mb-6">您尚未關注任何{activeTab === 'all' ? '項目' : getCollectionTypeName(activeTab as CollectionType)}</p>
          <Button onClick={() => router.push('/events')}>瀏覽活動</Button>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {items.map((subscription) => (
          <Card key={subscription.id} className="overflow-hidden hover:shadow-md transition-shadow">
            <div className="flex flex-col">
              {/* 卡片主要內容 */}
              <div className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  {/* 左側內容：關注標的信息 */}
                  <div className="flex-grow">
                    <Badge variant="outline" className="mb-2 flex items-center w-fit">
                      {getCollectionTypeIcon(subscription.collection_type)}
                      {getCollectionTypeName(subscription.collection_type)}
                    </Badge>
                    
                    <h3 className="text-xl font-semibold mb-1">
                      {subscription.collection_id}
                    </h3>
                    
                    <div className="text-sm text-muted-foreground flex flex-wrap gap-3 mb-3">
                      <span className="flex items-center">
                        <Bell className="h-3.5 w-3.5 mr-1" />
                        關注於 {formatDate(subscription.created_at)}
                      </span>
                      <span className="flex items-center">
                        <Clock className="h-3.5 w-3.5 mr-1" />
                        {getFrequencyName(subscription.notification_settings.frequency)}
                      </span>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mt-3">
                      <Link href={getCollectionLink(subscription)}>
                        <Button variant="outline" size="sm" className="flex items-center">
                          查看詳情
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </Link>
                      
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="flex items-center"
                        onClick={() => setExpandedSettings(expandedSettings === subscription.id ? null : subscription.id)}
                      >
                        <Settings className="h-4 w-4 mr-1" />
                        設置
                        {expandedSettings === subscription.id ? 
                          <ChevronUp className="h-4 w-4 ml-1" /> : 
                          <ChevronDown className="h-4 w-4 ml-1" />
                        }
                      </Button>
                      
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-destructive hover:text-destructive flex items-center"
                        onClick={() => handleUnfollow(subscription.id)}
                      >
                        <BellOff className="h-4 w-4 mr-1" />
                        取消關注
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* 展開設置面板 */}
              {expandedSettings === subscription.id && (
                <div className="p-4 sm:p-6 bg-muted/10 border-t">
                  <h4 className="font-medium mb-4">通知設置</h4>
                  
                  <div className="grid gap-6 sm:grid-cols-2">
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <Label htmlFor={`frequency-${subscription.id}`}>通知頻率</Label>
                        <Select 
                          value={subscription.notification_settings.frequency} 
                          onValueChange={(value) => handleUpdateSettings(subscription, { frequency: value as NotificationFrequency })}
                        >
                          <SelectTrigger id={`frequency-${subscription.id}`} className="w-full">
                            <SelectValue placeholder="選擇通知頻率" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={NotificationFrequency.IMMEDIATELY}>即時通知</SelectItem>
                            <SelectItem value={NotificationFrequency.DAILY}>每日摘要</SelectItem>
                            <SelectItem value={NotificationFrequency.WEEKLY}>每週摘要</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-1">
                        <Label htmlFor={`content-level-${subscription.id}`}>詳細程度</Label>
                        <Select 
                          value={subscription.notification_settings.content_level} 
                          onValueChange={(value) => handleUpdateSettings(subscription, { content_level: value as NotificationDetailLevel })}
                        >
                          <SelectTrigger id={`content-level-${subscription.id}`} className="w-full">
                            <SelectValue placeholder="選擇詳細程度" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={NotificationDetailLevel.BRIEF}>簡短提醒</SelectItem>
                            <SelectItem value={NotificationDetailLevel.DETAILED}>詳細信息</SelectItem>
                            <SelectItem value={NotificationDetailLevel.CUSTOM}>自定義</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h5 className="text-sm font-medium">通知管道</h5>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <Label htmlFor={`email-${subscription.id}`}>電子郵件</Label>
                        </div>
                        <Switch 
                          id={`email-${subscription.id}`}
                          checked={subscription.notification_settings.channels.email}
                          onCheckedChange={(checked) => handleUpdateSettings(subscription, { 
                            channels: { email: checked } 
                          })}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Bell className="h-4 w-4 text-muted-foreground" />
                          <Label htmlFor={`browser-${subscription.id}`}>瀏覽器通知</Label>
                        </div>
                        <Switch 
                          id={`browser-${subscription.id}`}
                          checked={subscription.notification_settings.channels.browser}
                          onCheckedChange={(checked) => handleUpdateSettings(subscription, { 
                            channels: { browser: checked } 
                          })}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Smartphone className="h-4 w-4 text-muted-foreground" />
                          <Label htmlFor={`in-app-${subscription.id}`}>應用內通知</Label>
                        </div>
                        <Switch 
                          id={`in-app-${subscription.id}`}
                          checked={subscription.notification_settings.channels.in_app}
                          onCheckedChange={(checked) => handleUpdateSettings(subscription, { 
                            channels: { in_app: checked } 
                          })}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    );
  }
} 
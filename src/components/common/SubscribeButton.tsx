'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Bell, BellRing } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { 
  SubscriptionTargetType, 
  NotificationFrequency,
  NotificationDetailLevel
} from '@/types/userPreferences';
import { 
  createSubscription, 
  cancelSubscription, 
  isSubscribed, 
  getSubscriptions, 
  updateSubscription 
} from '@/services/userPreferenceService';
import { isAuthenticated, getCurrentUser } from '@/lib/services/authService';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface SubscribeButtonProps {
  targetId: string;
  targetType: SubscriptionTargetType;
  targetName: string; // 用於顯示在訂閱對話框中
  className?: string;
  iconOnly?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outline' | 'ghost';
}

/**
 * 訂閱按鈕組件
 * 用於在活動詳情頁、主辦方頁面等地方顯示訂閱按鈕
 */
export function SubscribeButton({ 
  targetId, 
  targetType, 
  targetName,
  className = '', 
  iconOnly = false, 
  size = 'md',
  variant = 'outline'
}: SubscribeButtonProps) {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [subscriptionId, setSubscriptionId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [frequency, setFrequency] = useState<NotificationFrequency>(NotificationFrequency.IMMEDIATELY);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [browserEnabled, setBrowserEnabled] = useState(true);
  const [inAppEnabled, setInAppEnabled] = useState(true);
  const [contentLevel, setContentLevel] = useState<NotificationDetailLevel>(NotificationDetailLevel.DETAILED);
  
  const router = useRouter();

  // 根據尺寸設置圖標大小
  const getIconSize = () => {
    switch(size) {
      case 'sm': return 16;
      case 'lg': return 24;
      default: return 20;
    }
  };

  // 檢查用戶身份和訂閱狀態
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // 檢查用戶是否已登入
        const authenticated = isAuthenticated();
        
        if (authenticated) {
          // 獲取用戶信息
          const userData = await getCurrentUser();
          if (userData) {
            setUserId(userData.id);
            
            // 檢查是否已訂閱
            const subscribed = await isSubscribed(userData.id, targetId, targetType);
            setIsSubscribed(subscribed);
            
            // 如果已訂閱，獲取訂閱詳情
            if (subscribed) {
              const subscriptions = await getSubscriptions(userData.id);
              const subscription = subscriptions.find(
                sub => sub.target_id === targetId && sub.target_type === targetType
              );
              
              if (subscription) {
                setSubscriptionId(subscription.id);
                setFrequency(subscription.notification_settings.frequency);
                setEmailEnabled(subscription.notification_settings.channels.email);
                setBrowserEnabled(subscription.notification_settings.channels.browser);
                setInAppEnabled(subscription.notification_settings.channels.in_app);
                setContentLevel(subscription.notification_settings.content_level);
              }
            }
          }
        }
      } catch (error) {
        console.error("身份檢查錯誤:", error);
      }
    };
    
    checkAuth();
    
    // 監聽訂閱更新事件
    const handleSubscriptionsUpdate = () => {
      checkAuth();
    };
    
    window.addEventListener('subscriptionsUpdate', handleSubscriptionsUpdate);
    window.addEventListener('authChange', handleSubscriptionsUpdate);
    
    return () => {
      window.removeEventListener('subscriptionsUpdate', handleSubscriptionsUpdate);
      window.removeEventListener('authChange', handleSubscriptionsUpdate);
    };
  }, [targetId, targetType]);

  // 處理點擊訂閱按鈕
  const handleSubscribeClick = () => {
    // 必須登入才能訂閱
    if (!isAuthenticated()) {
      toast.error('請先登入', {
        description: '您需要登入才能訂閱'
      });
      router.push('/login');
      return;
    }
    
    if (isSubscribed) {
      // 如果已訂閱，顯示取消訂閱的確認對話框或直接打開設置對話框
      setDialogOpen(true);
    } else {
      // 如果未訂閱，打開訂閱設置對話框
      setDialogOpen(true);
    }
  };

  // 處理訂閱/更新訂閱
  const handleSubscribe = async () => {
    if (!userId) {
      toast.error('無法獲取用戶信息', {
        description: '請重新登入後再試'
      });
      return;
    }
    
    try {
      setIsLoading(true);
      
      if (isSubscribed && subscriptionId) {
        // 更新訂閱設置
        await updateSubscription(subscriptionId, {
          notification_settings: {
            frequency,
            channels: {
              email: emailEnabled,
              browser: browserEnabled,
              in_app: inAppEnabled
            },
            content_level: contentLevel
          }
        });
        
        toast.success('訂閱設置已更新');
      } else {
        // 創建新訂閱
        await createSubscription(userId, targetId, targetType, {
          frequency,
          emailEnabled,
          browserEnabled,
          inAppEnabled,
          contentLevel
        });
        
        setIsSubscribed(true);
        toast.success('訂閱成功', {
          description: `您將接收關於${targetName}的更新`
        });
      }
      
      // 關閉對話框
      setDialogOpen(false);
    } catch (error) {
      console.error("訂閱操作錯誤:", error);
      toast.error('操作失敗', {
        description: error instanceof Error ? error.message : '發生未知錯誤'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 處理取消訂閱
  const handleUnsubscribe = async () => {
    if (!subscriptionId) {
      toast.error('未找到訂閱信息');
      return;
    }
    
    try {
      setIsLoading(true);
      
      // 取消訂閱
      await cancelSubscription(subscriptionId);
      
      setIsSubscribed(false);
      setSubscriptionId(null);
      
      toast.success('已取消訂閱');
      
      // 關閉對話框
      setDialogOpen(false);
    } catch (error) {
      console.error("取消訂閱錯誤:", error);
      toast.error('操作失敗', {
        description: error instanceof Error ? error.message : '發生未知錯誤'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 僅圖標模式的按鈕
  if (iconOnly) {
    return (
      <>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleSubscribeClick}
          disabled={isLoading}
          className={className}
          aria-label={isSubscribed ? "管理訂閱" : "訂閱更新"}
        >
          {isSubscribed ? (
            <BellRing size={getIconSize()} className="text-primary" />
          ) : (
            <Bell size={getIconSize()} />
          )}
        </Button>
        
        {/* 訂閱設置對話框 */}
        <SubscriptionDialog 
          isOpen={dialogOpen}
          onOpenChange={setDialogOpen}
          isSubscribed={isSubscribed}
          targetName={targetName}
          frequency={frequency}
          setFrequency={setFrequency}
          emailEnabled={emailEnabled}
          setEmailEnabled={setEmailEnabled}
          browserEnabled={browserEnabled}
          setBrowserEnabled={setBrowserEnabled}
          inAppEnabled={inAppEnabled}
          setInAppEnabled={setInAppEnabled}
          contentLevel={contentLevel}
          setContentLevel={setContentLevel}
          onSubscribe={handleSubscribe}
          onUnsubscribe={handleUnsubscribe}
          isLoading={isLoading}
        />
      </>
    );
  }

  // 文字+圖標按鈕
  return (
    <>
      <Button
        variant={isSubscribed ? "default" : variant}
        onClick={handleSubscribeClick}
        disabled={isLoading}
        className={className}
        size={size === 'lg' ? 'lg' : size === 'sm' ? 'sm' : 'default'}
      >
        {isSubscribed ? (
          <>
            <BellRing size={getIconSize()} className="mr-2" />
            已訂閱
          </>
        ) : (
          <>
            <Bell size={getIconSize()} className="mr-2" />
            訂閱更新
          </>
        )}
      </Button>
      
      {/* 訂閱設置對話框 */}
      <SubscriptionDialog 
        isOpen={dialogOpen}
        onOpenChange={setDialogOpen}
        isSubscribed={isSubscribed}
        targetName={targetName}
        frequency={frequency}
        setFrequency={setFrequency}
        emailEnabled={emailEnabled}
        setEmailEnabled={setEmailEnabled}
        browserEnabled={browserEnabled}
        setBrowserEnabled={setBrowserEnabled}
        inAppEnabled={inAppEnabled}
        setInAppEnabled={setInAppEnabled}
        contentLevel={contentLevel}
        setContentLevel={setContentLevel}
        onSubscribe={handleSubscribe}
        onUnsubscribe={handleUnsubscribe}
        isLoading={isLoading}
      />
    </>
  );
}

// 訂閱設置對話框組件
interface SubscriptionDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  isSubscribed: boolean;
  targetName: string;
  frequency: NotificationFrequency;
  setFrequency: (value: NotificationFrequency) => void;
  emailEnabled: boolean;
  setEmailEnabled: (value: boolean) => void;
  browserEnabled: boolean;
  setBrowserEnabled: (value: boolean) => void;
  inAppEnabled: boolean;
  setInAppEnabled: (value: boolean) => void;
  contentLevel: NotificationDetailLevel;
  setContentLevel: (value: NotificationDetailLevel) => void;
  onSubscribe: () => void;
  onUnsubscribe: () => void;
  isLoading: boolean;
}

function SubscriptionDialog({
  isOpen,
  onOpenChange,
  isSubscribed,
  targetName,
  frequency,
  setFrequency,
  emailEnabled,
  setEmailEnabled,
  browserEnabled,
  setBrowserEnabled,
  inAppEnabled,
  setInAppEnabled,
  contentLevel,
  setContentLevel,
  onSubscribe,
  onUnsubscribe,
  isLoading
}: SubscriptionDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isSubscribed ? "訂閱設置" : `訂閱 ${targetName}`}
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="frequency" className="text-right">
              通知頻率
            </Label>
            <Select 
              value={frequency} 
              onValueChange={(value) => setFrequency(value as NotificationFrequency)}
              disabled={isLoading}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="選擇通知頻率" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NotificationFrequency.IMMEDIATELY}>即時通知</SelectItem>
                <SelectItem value={NotificationFrequency.DAILY}>每日摘要</SelectItem>
                <SelectItem value={NotificationFrequency.WEEKLY}>每週摘要</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="detail-level" className="text-right">
              詳細程度
            </Label>
            <Select 
              value={contentLevel} 
              onValueChange={(value) => setContentLevel(value as NotificationDetailLevel)}
              disabled={isLoading}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="選擇詳細程度" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NotificationDetailLevel.BRIEF}>簡短提醒</SelectItem>
                <SelectItem value={NotificationDetailLevel.DETAILED}>詳細信息</SelectItem>
                <SelectItem value={NotificationDetailLevel.CUSTOM}>自定義</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">
              通知管道
            </Label>
            <div className="col-span-3 space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="email-notifications" className="cursor-pointer">
                  電子郵件
                </Label>
                <Switch 
                  id="email-notifications" 
                  checked={emailEnabled}
                  onCheckedChange={setEmailEnabled}
                  disabled={isLoading}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="browser-notifications" className="cursor-pointer">
                  瀏覽器通知
                </Label>
                <Switch 
                  id="browser-notifications" 
                  checked={browserEnabled}
                  onCheckedChange={setBrowserEnabled}
                  disabled={isLoading}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="app-notifications" className="cursor-pointer">
                  應用內通知
                </Label>
                <Switch 
                  id="app-notifications" 
                  checked={inAppEnabled}
                  onCheckedChange={setInAppEnabled}
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          {isSubscribed && (
            <Button 
              variant="destructive" 
              onClick={onUnsubscribe}
              disabled={isLoading}
            >
              取消訂閱
            </Button>
          )}
          
          <Button 
            type="submit" 
            onClick={onSubscribe}
            disabled={isLoading}
          >
            {isSubscribed ? "更新設置" : "訂閱"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 
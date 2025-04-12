'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Bell, BellRing } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { 
  CollectionType, 
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
import { useAuth } from '@/components/auth/AuthProvider';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
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

interface FollowButtonProps {
  collectionId: string;
  collectionType: CollectionType;
  collectionName: string; // 用於顯示在關注對話框中
  className?: string;
  iconOnly?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outline' | 'ghost';
  onFollowChange?: (isFollowed: boolean) => void;
}

/**
 * 關注按鈕組件
 * 用於在活動詳情頁、主辦方頁面等地方顯示關注按鈕
 */
export function FollowButton({ 
  collectionId, 
  collectionType, 
  collectionName,
  className = '', 
  iconOnly = false, 
  size = 'md',
  variant = 'outline',
  onFollowChange
}: FollowButtonProps) {
  const [isFollowed, setIsFollowed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [subscriptionId, setSubscriptionId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [frequency, setFrequency] = useState<NotificationFrequency>(NotificationFrequency.IMMEDIATELY);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [browserEnabled, setBrowserEnabled] = useState(true);
  const [inAppEnabled, setInAppEnabled] = useState(true);
  const [contentLevel, setContentLevel] = useState<NotificationDetailLevel>(NotificationDetailLevel.DETAILED);
  
  const router = useRouter();
  const { isLoggedIn, user, showLoginModal } = useAuth();

  // 根據尺寸設置圖標大小
  const getIconSize = () => {
    switch(size) {
      case 'sm': return 16;
      case 'lg': return 24;
      default: return 20;
    }
  };

  // 檢查用戶身份和關注狀態
  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (isLoggedIn && user) {
          // 檢查是否已關注
          const subscribed = await isSubscribed(user.id, collectionId, collectionType);
          setIsFollowed(subscribed);
          
          // 通知父組件狀態變化
          if (onFollowChange) {
            onFollowChange(subscribed);
          }
          
          // 如果已關注，獲取關注詳情
          if (subscribed) {
            const subscriptions = await getSubscriptions(user.id);
            const subscription = subscriptions.find(
              sub => sub.collection_id === collectionId && sub.collection_type === collectionType
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
      } catch (error) {
        console.error("身份檢查錯誤:", error);
      }
    };
    
    checkAuth();
    
    // 監聽關注更新事件
    const handleSubscriptionsUpdate = () => {
      checkAuth();
    };
    
    window.addEventListener('subscriptionsUpdate', handleSubscriptionsUpdate);
    window.addEventListener('authChange', handleSubscriptionsUpdate);
    
    return () => {
      window.removeEventListener('subscriptionsUpdate', handleSubscriptionsUpdate);
      window.removeEventListener('authChange', handleSubscriptionsUpdate);
    };
  }, [collectionId, collectionType, onFollowChange, isLoggedIn, user]);

  // 處理點擊關注按鈕
  const handleFollowClick = () => {
    // 必須登入才能關注
    if (!isLoggedIn) {
      toast.error('請先登入', {
        description: '您需要登入才能關注'
      });
      showLoginModal();
      return;
    }
    
    if (isFollowed) {
      // 如果已關注，顯示取消關注的確認對話框或直接打開設置對話框
      setDialogOpen(true);
    } else {
      // 如果未關注，打開關注設置對話框
      setDialogOpen(true);
    }
  };

  // 處理關注/更新關注
  const handleFollow = async () => {
    if (!isLoggedIn || !user) {
      toast.error('無法獲取用戶信息', {
        description: '請重新登入後再試'
      });
      showLoginModal();
      return;
    }
    
    try {
      setIsLoading(true);
      
      if (isFollowed && subscriptionId) {
        // 更新關注設置
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
        
        toast.success('關注設置已更新');
      } else {
        // 創建新關注
        await createSubscription(user.id, collectionId, collectionType, {
          frequency,
          emailEnabled,
          browserEnabled,
          inAppEnabled,
          contentLevel
        });
        
        setIsFollowed(true);
        
        // 通知父組件狀態變化
        if (onFollowChange) {
          onFollowChange(true);
        }
        
        toast.success('關注成功', {
          description: `您將接收關於${collectionName}的更新`
        });
      }
      
      // 關閉對話框
      setDialogOpen(false);
    } catch (error) {
      console.error("關注操作錯誤:", error);
      toast.error('操作失敗', {
        description: error instanceof Error ? error.message : '發生未知錯誤'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 處理取消關注
  const handleUnfollow = async () => {
    if (!subscriptionId) {
      toast.error('未找到關注信息');
      return;
    }
    
    try {
      setIsLoading(true);
      
      // 取消關注
      await cancelSubscription(subscriptionId);
      
      setIsFollowed(false);
      setSubscriptionId(null);
      
      // 通知父組件狀態變化
      if (onFollowChange) {
        onFollowChange(false);
      }
      
      toast.success('已取消關注');
      
      // 關閉對話框
      setDialogOpen(false);
    } catch (error) {
      console.error("取消關注錯誤:", error);
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
          onClick={handleFollowClick}
          disabled={isLoading}
          className={className}
          aria-label={isFollowed ? "管理關注" : "關注更新"}
        >
          {isFollowed ? (
            <BellRing size={getIconSize()} className="text-primary" />
          ) : (
            <Bell size={getIconSize()} />
          )}
        </Button>
        
        {/* 關注設置對話框 */}
        <FollowSettingsDialog 
          isOpen={dialogOpen}
          onOpenChange={setDialogOpen}
          isFollowed={isFollowed}
          targetName={collectionName}
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
          onFollow={handleFollow}
          onUnfollow={handleUnfollow}
          isLoading={isLoading}
        />
      </>
    );
  }

  // 文字+圖標按鈕
  return (
    <>
      <Button
        variant={isFollowed ? "default" : variant}
        onClick={handleFollowClick}
        disabled={isLoading}
        className={className}
        size={size === 'lg' ? 'lg' : size === 'sm' ? 'sm' : 'default'}
      >
        {isFollowed ? (
          <>
            <BellRing size={getIconSize()} className="mr-2" />
            已關注
          </>
        ) : (
          <>
            <Bell size={getIconSize()} className="mr-2" />
            關注更新
          </>
        )}
      </Button>
      
      {/* 關注設置對話框 */}
      <FollowSettingsDialog 
        isOpen={dialogOpen}
        onOpenChange={setDialogOpen}
        isFollowed={isFollowed}
        targetName={collectionName}
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
        onFollow={handleFollow}
        onUnfollow={handleUnfollow}
        isLoading={isLoading}
      />
    </>
  );
}

// 關注設置對話框組件
interface FollowSettingsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  isFollowed: boolean;
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
  onFollow: () => void;
  onUnfollow: () => void;
  isLoading: boolean;
}

function FollowSettingsDialog({
  isOpen,
  onOpenChange,
  isFollowed,
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
  onFollow,
  onUnfollow,
  isLoading
}: FollowSettingsDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isFollowed ? "關注設置" : `關注 ${targetName}`}
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
          {isFollowed && (
            <Button 
              variant="destructive" 
              onClick={onUnfollow}
              disabled={isLoading}
            >
              取消關注
            </Button>
          )}
          
          <Button 
            type="submit" 
            onClick={onFollow}
            disabled={isLoading}
          >
            {isFollowed ? "更新設置" : "關注"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 
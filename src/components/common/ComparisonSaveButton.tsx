'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Save, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ComparisonResult } from '@/types/userPreferences';
import { saveComparisonResult } from '@/services/userPreferenceService';
import { isAuthenticated, getCurrentUser } from '@/lib/services/authService';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ComparisonSaveButtonProps {
  comparisonItems: Array<{
    type: string;
    id: string;
    metadata: Record<string, unknown>;
  }>;
  comparisonCriteria: string[];
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outline' | 'ghost';
  onSaveComplete?: (result: ComparisonResult) => void;
}

/**
 * 比較結果保存按鈕組件
 * 用於在比較結果頁面保存比較結果
 */
export function ComparisonSaveButton({ 
  comparisonItems,
  comparisonCriteria,
  className = '',
  size = 'md',
  variant = 'outline',
  onSaveComplete
}: ComparisonSaveButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [comparisonName, setComparisonName] = useState('');
  const router = useRouter();

  // 根據尺寸設置圖標大小
  const getIconSize = () => {
    switch(size) {
      case 'sm': return 16;
      case 'lg': return 24;
      default: return 20;
    }
  };

  // 處理打開保存對話框
  const handleOpenSaveDialog = () => {
    // 必須登入才能保存比較結果
    if (!isAuthenticated()) {
      toast.error('請先登入', {
        description: '您需要登入才能保存比較結果'
      });
      router.push('/login');
      return;
    }
    
    // 打開對話框
    setDialogOpen(true);
    
    // 生成默認比較名稱
    const defaultName = `比較結果 (${new Date().toLocaleDateString('zh-TW')})`;
    setComparisonName(defaultName);
  };

  // 處理保存比較結果
  const handleSaveComparison = async () => {
    try {
      // 驗證表單
      if (!comparisonName.trim()) {
        toast.error('請輸入比較名稱');
        return;
      }
      
      setIsLoading(true);
      
      // 獲取用戶信息
      const userData = await getCurrentUser();
      if (!userData) {
        toast.error('無法獲取用戶信息', {
          description: '請重新登入後再試'
        });
        return;
      }
      
      // 準備保存的比較結果數據
      const comparisonData = {
        name: comparisonName,
        items: comparisonItems,
        comparison_criteria: comparisonCriteria
      };
      
      // 保存比較結果
      const result = await saveComparisonResult(userData.id, comparisonData);
      
      // 提示保存成功
      toast.success('比較結果已保存', {
        description: '您可以在「我的收藏」中查看'
      });
      
      // 關閉對話框
      setDialogOpen(false);
      
      // 回調
      if (onSaveComplete) {
        onSaveComplete(result);
      }
    } catch (error) {
      console.error('保存比較結果錯誤:', error);
      toast.error('保存失敗', {
        description: error instanceof Error ? error.message : '發生未知錯誤'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button
        variant={variant}
        onClick={handleOpenSaveDialog}
        className={className}
        size={size === 'lg' ? 'lg' : size === 'sm' ? 'sm' : 'default'}
      >
        <Save size={getIconSize()} className="mr-2" />
        保存比較結果
      </Button>
      
      {/* 保存對話框 */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>保存比較結果</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="comparison-name" className="text-right">
                比較名稱
              </Label>
              <Input
                id="comparison-name"
                value={comparisonName}
                onChange={(e) => setComparisonName(e.target.value)}
                className="col-span-3"
                autoFocus
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <div className="text-right text-sm text-muted-foreground">
                包含項目
              </div>
              <div className="col-span-3 text-sm">
                {comparisonItems.length} 個項目
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              type="submit"
              onClick={handleSaveComparison}
              disabled={isLoading}
            >
              {isLoading ? '保存中...' : '保存'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
} 
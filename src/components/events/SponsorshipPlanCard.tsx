'use client';

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { SponsorshipPlan as SPType } from "@/types/sponsorshipPlan";
import { SponsorshipPlan as EventSPType } from "@/types/event";
import { isAuthenticated } from "@/lib/services/authService";

interface SponsorshipPlanCardProps {
  plan: SPType | EventSPType;
  onAddToCart?: (planId: string) => void;
  isInCart?: boolean;
  isLoading?: boolean;
}

export function SponsorshipPlanCard({ 
  plan, 
  onAddToCart,
  isInCart = false,
  isLoading = false
}: SponsorshipPlanCardProps) {
  const [isUserAuthenticated, setIsUserAuthenticated] = React.useState(false);
  const [isButtonLoading, setIsButtonLoading] = React.useState(false);
  const [isInCompare, setIsInCompare] = React.useState(false);

  // Check user authentication
  React.useEffect(() => {
    const checkAuth = () => {
      const authenticated = isAuthenticated();
      setIsUserAuthenticated(authenticated);
    };
    
    // 檢查該計劃是否已在比較列表中
    const checkIfInCompare = () => {
      try {
        const storedPlans = localStorage.getItem('plansToCompare');
        if (storedPlans) {
          const plans = JSON.parse(storedPlans) as (SPType | EventSPType)[];
          setIsInCompare(plans.some(p => p.id === plan.id));
        }
      } catch (error) {
        console.error('無法檢查比較狀態:', error);
      }
    };
    
    checkAuth();
    checkIfInCompare();
    
    // 添加身份驗證變更事件的監聽器
    window.addEventListener('authChange', checkAuth);
    window.addEventListener('storage', checkIfInCompare);
    window.addEventListener('compareUpdate', checkIfInCompare);
    
    return () => {
      window.removeEventListener('authChange', checkAuth);
      window.removeEventListener('storage', checkIfInCompare);
      window.removeEventListener('compareUpdate', checkIfInCompare);
    };
  }, [plan.id]);

  const handleAddToCart = async () => {
    if (!onAddToCart) return;
    
    setIsButtonLoading(true);
    try {
      onAddToCart(plan.id);
    } finally {
      setTimeout(() => {
        setIsButtonLoading(false);
      }, 1000); // 給用戶視覺反饋
    }
  };

  // Handle different property names between the two types
  const getTitle = () => {
    if ('title' in plan) return plan.title;
    if ('name' in plan) return plan.name;
    return 'Sponsorship Plan';
  };

  // 添加到比較列表的處理方法
  const handleAddToCompare = () => {
    try {
      // 獲取現有的比較列表
      const storedPlans = localStorage.getItem('plansToCompare');
      let plans: (SPType | EventSPType)[] = [];
      
      if (storedPlans) {
        plans = JSON.parse(storedPlans);
      }
      
      // 檢查是否已在列表中
      if (!plans.some(p => p.id === plan.id)) {
        // 添加到列表
        plans.push(plan);
        localStorage.setItem('plansToCompare', JSON.stringify(plans));
        
        // 更新狀態
        setIsInCompare(true);
        
        // 觸發更新事件
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('compareUpdate'));
        }
        
        // 顯示成功信息
        alert('已添加到比較列表');
      } else {
        alert('此方案已在比較列表中');
      }
    } catch (error) {
      console.error('無法添加到比較列表:', error);
      alert('無法添加到比較列表');
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardContent className="p-6 flex-1">
        <h3 className="text-lg font-bold text-foreground">{getTitle()}</h3>
        <p className="mt-1 text-2xl font-extrabold text-primary">${plan.price}</p>
        
        <p className="mt-4 text-muted-foreground">{plan.description}</p>
        
        <div className="mt-6">
          <h4 className="text-sm font-semibold text-foreground">Benefits:</h4>
          <ul className="mt-2 space-y-2">
            {plan.benefits && plan.benefits.map((benefit, index) => (
              <li key={index} className="flex items-start">
                <svg className="h-5 w-5 text-primary mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-muted-foreground">{benefit}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
      
      <CardFooter className="p-6 pt-0 flex flex-col gap-2">
        {isUserAuthenticated ? (
          <Button
            variant={isInCart ? "outline" : "default"}
            className="w-full"
            onClick={handleAddToCart}
            disabled={isInCart || isLoading || isButtonLoading}
          >
            {isLoading || isButtonLoading ? (
              <div className="flex items-center justify-center">
                <div className="mr-2">處理中...</div>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              </div>
            ) : isInCart ? (
              <div className="flex items-center justify-center">
                <svg className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                已加入購物車
              </div>
            ) : (
              "添加到購物車"
            )}
          </Button>
        ) : (
          <Link href="/login" className="w-full">
            <Button
              variant="outline"
              className="w-full"
            >
              登入以贊助
            </Button>
          </Link>
        )}
        
        {/* 比較按鈕 */}
        <Button
          variant={isInCompare ? "outline" : "secondary"}
          className="w-full"
          onClick={handleAddToCompare}
          disabled={isInCompare}
        >
          {isInCompare ? (
            <div className="flex items-center justify-center">
              <svg className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              已添加到比較
            </div>
          ) : (
            "添加到比較"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
} 
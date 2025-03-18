'use client';

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { SponsorshipPlan } from "@/types/sponsorshipPlan";

interface SponsorshipPlanCardProps {
  plan: SponsorshipPlan;
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
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [isSponsor, setIsSponsor] = React.useState(false);

  // 檢查用戶身份
  React.useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      const userData = JSON.parse(user);
      setIsAuthenticated(true);
      setIsSponsor(userData.role === 'sponsor');
    }
  }, []);

  const handleAddToCart = () => {
    if (onAddToCart) {
      onAddToCart(plan.id);
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardContent className="p-6 flex-1">
        <h3 className="text-lg font-bold text-foreground">{plan.name}</h3>
        <p className="mt-1 text-2xl font-extrabold text-primary">${plan.price}</p>
        
        <p className="mt-4 text-muted-foreground">{plan.description}</p>
        
        <div className="mt-6">
          <h4 className="text-sm font-semibold text-foreground">優勢：</h4>
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
      
      <CardFooter className="p-6 pt-0">
        {isAuthenticated && isSponsor ? (
          <Button
            variant={isInCart ? "outline" : "default"}
            className="w-full"
            onClick={handleAddToCart}
            disabled={isInCart || isLoading}
          >
            {isLoading ? "處理中..." : isInCart ? "已加入購物車" : "加入購物車"}
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
      </CardFooter>
    </Card>
  );
} 
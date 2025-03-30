'use client';

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getCartItems, removeFromCart, checkout } from "@/services/sponsorService";
import { CartItem, CartItemStatus, CheckoutResult } from "@/types/sponsor";
import { SponsorshipPlan } from "@/types/sponsorshipPlan";
import { getEventById } from "@/services/eventService";
import { isAuthenticated, getCurrentUser } from "@/lib/services/authService";

export default function CartPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartDetails, setCartDetails] = useState<{
    plan: SponsorshipPlan;
    event: { id: string; title: string };
  }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [checkoutResult, setCheckoutResult] = useState<CheckoutResult | null>(null);

  // 檢查用戶身份
  useEffect(() => {
    const checkAuth = async () => {
      if (!isAuthenticated()) {
        router.push('/login');
        return;
      }
      
      try {
        const userData = await getCurrentUser();
        if (!userData) {
          router.push('/login');
          return;
        }
        
        setUserId(userData.id);
      } catch (e) {
        console.error("獲取用戶數據錯誤:", e);
        router.push('/login');
      }
    };
    
    checkAuth();
  }, [router]);

  // 獲取購物車項目
  useEffect(() => {
    async function fetchCartItems() {
      if (!userId) return;

      try {
        setIsLoading(true);
        console.log("正在獲取購物車項目，用戶ID:", userId);
        
        const items = await getCartItems(userId);
        console.log("購物車原始項目:", items);
        
        // 只顯示狀態為PENDING的項目
        const pendingItems = items.filter(item => item.status === CartItemStatus.PENDING);
        console.log("待處理的購物車項目:", pendingItems);
        
        setCartItems(pendingItems);
      } catch (error) {
        console.error("獲取購物車項目錯誤:", error);
        setError("無法加載購物車項目。請稍後再試。");
      } finally {
        setIsLoading(false);
      }
    }

    fetchCartItems();
    
    // 添加事件監聽器
    const handleCartUpdate = () => {
      fetchCartItems();
    };
    
    window.addEventListener('cartUpdate', handleCartUpdate);
    
    return () => {
      window.removeEventListener('cartUpdate', handleCartUpdate);
    };
  }, [userId]);

  // 獲取購物車項目的詳細信息
  useEffect(() => {
    async function fetchCartDetails() {
      if (cartItems.length === 0) return;

      try {
        console.log("正在獲取購物車詳情，項目數量:", cartItems.length);
        
        const details = await Promise.all(
          cartItems.map(async (item) => {
            try {
              console.log("正在獲取贊助計劃詳情，計劃ID:", item.sponsorship_plan_id);
              
              // 1. 直接從模擬數據中獲取贊助計劃詳情
              const response = await fetch(`/api/sponsorships/${item.sponsorship_plan_id}`);
              
              if (!response.ok) {
                throw new Error(`獲取贊助計劃詳情失敗: ${response.statusText}`);
              }
              
              const planData = await response.json();
              console.log("獲取到贊助計劃:", planData);
              
              // 2. 獲取事件詳情
              console.log("正在獲取事件詳情，事件ID:", planData.event_id);
              const eventData = await getEventById(planData.event_id);
              console.log("獲取到事件詳情:", eventData);

              return {
                plan: planData,
                event: {
                  id: eventData?.id || "unknown",
                  title: eventData?.title || "未知活動"
                }
              };
            } catch (error) {
              console.error(`處理購物車項目 ${item.id} 時出錯:`, error);
              
              // 返回一個默認項目，避免整個列表因為一個項目錯誤而失敗
              return {
                plan: {
                  id: item.sponsorship_plan_id,
                  name: "無法載入贊助計劃",
                  description: "無法獲取此贊助計劃的詳細信息",
                  price: 0,
                  event_id: "unknown"
                },
                event: {
                  id: "unknown",
                  title: "未知活動"
                }
              };
            }
          })
        );

        console.log("購物車詳情完成:", details);
        setCartDetails(details);
      } catch (error) {
        console.error("獲取購物車詳情錯誤:", error);
        setError("無法加載贊助方案詳情。請稍後再試。");
      }
    }

    fetchCartDetails();
  }, [cartItems]);

  const handleRemoveItem = async (itemId: string) => {
    try {
      await removeFromCart(itemId);
      setCartItems(cartItems.filter(item => item.id !== itemId));
    } catch (error) {
      console.error("移除購物車項目錯誤:", error);
      setError("無法移除項目。請稍後再試。");
    }
  };

  const handleCheckout = async () => {
    if (!userId || cartItems.length === 0) return;

    try {
      setIsProcessing(true);
      setError(null);

      // 計算總金額
      const totalAmount = cartDetails.reduce((sum, item) => sum + item.plan.price, 0);
      console.log("結帳總金額:", totalAmount);

      // 處理結帳
      console.log("開始結帳流程，用戶ID:", userId);
      const result = await checkout(userId, { amount: totalAmount });
      console.log("結帳成功，結果:", result);
      
      setCheckoutResult(result);

      // 清空購物車狀態
      setCartItems([]);
      setCartDetails([]);
      
      // 觸發購物車更新事件
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('cartUpdate'));
      }
    } catch (error) {
      console.error("結帳錯誤:", error);
      setError("結帳過程中發生錯誤。請稍後再試。");
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-foreground mb-8">購物車</h1>

        {error && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {checkoutResult ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-center text-green-600">結帳成功！</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <p className="text-foreground">您的訂單已確認。</p>
                <p className="text-foreground">訂單編號: <span className="font-medium">{checkoutResult.order_id}</span></p>
                <p className="text-foreground">總金額: <span className="font-medium">${checkoutResult.total_amount}</span></p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-center space-x-4">
              <Button variant="default" onClick={() => router.push('/events')}>
                繼續瀏覽活動
              </Button>
              <Button variant="outline" onClick={() => router.push('/dashboard/sponsor')}>
                前往儀表板
              </Button>
            </CardFooter>
          </Card>
        ) : cartItems.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <div className="mb-4">
                <svg className="mx-auto h-12 w-12 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-foreground">您的購物車是空的</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                看起來您還沒有添加任何贊助方案到購物車。
              </p>
              <div className="mt-6">
                <Link href="/events">
                  <Button variant="default">瀏覽活動</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>贊助方案 ({cartItems.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  {cartItems.map((item, index) => {
                    const detail = cartDetails[index];
                    if (!detail) return null;

                    return (
                      <div key={item.id} className="mb-6">
                        <div className="flex flex-col md:flex-row justify-between">
                          <div className="flex-1">
                            <h3 className="text-lg font-medium text-foreground">{detail.plan.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              活動: <Link href={`/events/${detail.event.id}`} className="text-primary hover:text-primary/80">
                                {detail.event.title}
                              </Link>
                            </p>
                            <p className="mt-1 text-sm text-muted-foreground">{detail.plan.description}</p>
                          </div>
                          <div className="mt-4 md:mt-0 text-right">
                            <p className="text-lg font-medium text-foreground">${detail.plan.price}</p>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive/80 mt-2"
                              onClick={() => handleRemoveItem(item.id)}
                              disabled={isProcessing}
                            >
                              移除
                            </Button>
                          </div>
                        </div>
                        {index < cartItems.length - 1 && <Separator className="my-4" />}
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </div>

            <div>
              <Card>
                <CardHeader>
                  <CardTitle>訂單摘要</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">小計</span>
                      <span className="font-medium">
                        ${cartDetails.reduce((sum, item) => sum + item.plan.price, 0)}
                      </span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-lg font-medium">
                      <span>總計</span>
                      <span>${cartDetails.reduce((sum, item) => sum + item.plan.price, 0)}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    variant="default"
                    className="w-full"
                    onClick={handleCheckout}
                    disabled={isProcessing || cartItems.length === 0}
                  >
                    {isProcessing ? (
                      <div className="flex items-center">
                        <div className="mr-2">處理中</div>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      </div>
                    ) : (
                      '結帳'
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 
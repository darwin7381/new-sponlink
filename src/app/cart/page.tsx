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

// 定義購物車項目詳情接口，允許部分缺失的屬性
interface CartDetail {
  plan: Partial<SponsorshipPlan> & {
    id: string;
    title?: string;
    name?: string;
    description?: string;
    price: number;
    event_id: string;
  };
  event: {
    id: string;
    title: string;
  };
  hasError?: boolean;
  errorMessage?: string;
}

export default function CartPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartDetails, setCartDetails] = useState<CartDetail[]>([]);
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

        // 如果购物车为空，检查localStorage
        if (pendingItems.length === 0) {
          console.log("检查本地存储中的购物车项目");
          // 这里不需要做额外的操作，但在控制台记录一下，方便调试
          try {
            if (typeof window !== 'undefined') {
              const storageData = localStorage.getItem('sponlink_cart_items');
              console.log("本地存储购物车原始数据:", storageData);
              if (storageData) {
                const parsedData = JSON.parse(storageData);
                console.log("本地存储购物车解析数据:", parsedData);
                
                // 查找当前用户的项目
                const userItems = parsedData.filter((item: CartItem) => 
                  item.sponsor_id === userId && item.status === CartItemStatus.PENDING
                );
                console.log("本地存储中当前用户的待处理项目:", userItems);
              }
            }
          } catch (e) {
            console.error("检查本地存储时出错:", e);
          }
        }
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
      console.log("触发购物车更新事件，重新获取购物车项目");
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
              
              // 1. 從API獲取贊助計劃詳情
              const response = await fetch(`/api/sponsorships/${item.sponsorship_plan_id}`);
              
              if (!response.ok) {
                console.error(`獲取贊助計劃 ${item.sponsorship_plan_id} 失敗: ${response.statusText}`);
                throw new Error(`獲取贊助計劃詳情失敗: ${response.statusText}`);
              }
              
              const planData = await response.json();
              console.log("獲取到贊助計劃:", planData);
              
              // 2. 獲取事件詳情
              let eventData;
              try {
                console.log("正在獲取事件詳情，事件ID:", planData.event_id);
                eventData = await getEventById(planData.event_id);
                console.log("獲取到事件詳情:", eventData);
              } catch (eventError) {
                console.error(`獲取事件詳情錯誤，事件ID: ${planData.event_id}:`, eventError);
                // 如果無法獲取事件，使用默認事件數據
                eventData = { id: planData.event_id || "unknown", title: "未知活動" };
              }

              return {
                plan: planData,
                event: {
                  id: eventData?.id || planData.event_id || "unknown",
                  title: eventData?.title || "未知活動"
                }
              };
            } catch (error) {
              console.error(`處理購物車項目 ${item.id} (計劃ID: ${item.sponsorship_plan_id}) 時出錯:`, error);
              
              // 返回一個帶有錯誤信息的默認項目
              return {
                plan: {
                  id: item.sponsorship_plan_id,
                  name: `無法載入計劃 (ID: ${item.sponsorship_plan_id})`,
                  description: error instanceof Error ? error.message : "無法獲取此贊助計劃的詳細信息",
                  price: 0,
                  event_id: "unknown"
                },
                event: {
                  id: "unknown",
                  title: "未知活動"
                },
                hasError: true,
                errorMessage: error instanceof Error ? error.message : "未知錯誤"
              };
            }
          })
        );

        console.log("購物車詳情完成:", details);
        setCartDetails(details);
        
        // 檢查是否有項目出錯
        const hasErrors = details.some(detail => detail.hasError);
        if (hasErrors) {
          setError("部分贊助方案詳情無法載入，請重試或聯繫客服。");
        } else {
          setError(null);
        }
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

      // 過濾掉有錯誤的購物車項目
      const validCartDetails = cartDetails.filter(detail => !detail.hasError);
      
      if (validCartDetails.length === 0) {
        setError("購物車中沒有有效的贊助方案，請重新添加或刷新頁面。");
        setIsProcessing(false);
        return;
      }

      // 計算有效項目的總金額
      const totalAmount = validCartDetails.reduce((sum, item) => sum + item.plan.price, 0);
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
              <p className="text-center">您的訂單已成功完成。</p>
              <div className="bg-secondary/30 p-4 rounded-lg">
                <div className="flex justify-between mb-2">
                  <span className="font-medium">訂單編號:</span>
                  <span>{checkoutResult.order_id}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="font-medium">總金額:</span>
                  <span>${checkoutResult.total_amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">贊助項目:</span>
                  <span>{checkoutResult.confirmed_items} 項</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-center">
              <Button asChild>
                <Link href="/dashboard/sponsor/sponsorships">查看我的贊助</Link>
              </Button>
            </CardFooter>
          </Card>
        ) : (
          <>
            {isLoading ? (
              <div className="flex justify-center items-center min-h-[300px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : cartItems.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <h2 className="text-xl font-semibold mb-4">您的購物車是空的</h2>
                  <p className="text-muted-foreground mb-6">添加贊助方案到購物車，開始您的贊助之旅。</p>
                  <Button asChild>
                    <Link href="/events">瀏覽活動</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>贊助方案</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {/* 購物車項目列表 */}
                      {cartDetails.length > 0 && (
                        <div className="space-y-4">
                          {cartDetails.map((detail, index) => (
                            <div 
                              key={index} 
                              className={`flex justify-between items-start border-b border-border pb-4 mb-4 ${detail.hasError ? 'bg-destructive/10 p-3 rounded' : ''}`}
                            >
                              <div className="flex-1">
                                <div className="mb-1">
                                  <h3 className="text-lg font-semibold">
                                    {detail.hasError ? (
                                      <span className="text-destructive">{detail.plan.name}</span>
                                    ) : (
                                      detail.plan.title || detail.plan.name
                                    )}
                                  </h3>
                                  <p className="text-sm text-muted-foreground">
                                    活動: {detail.hasError ? '未知活動' : (
                                      <Link href={`/events/${detail.event.id}`} className="text-primary hover:underline">
                                        {detail.event.title}
                                      </Link>
                                    )}
                                  </p>
                                </div>
                                <p className="text-sm">
                                  {detail.hasError ? (
                                    <span className="text-destructive">{detail.plan.description}</span>
                                  ) : (
                                    detail.plan.description
                                  )}
                                </p>
                                {detail.hasError && (
                                  <p className="text-xs text-destructive mt-1">
                                    錯誤: {detail.errorMessage} (計劃ID: {detail.plan.id})
                                  </p>
                                )}
                              </div>
                              
                              <div className="text-right flex flex-col items-end">
                                <span className={`text-lg font-semibold ${detail.hasError ? 'text-destructive' : ''}`}>
                                  ${detail.plan.price.toLocaleString()}
                                </span>
                                
                                <button
                                  onClick={() => {
                                    const itemId = cartItems[index]?.id;
                                    if (itemId) handleRemoveItem(itemId);
                                  }}
                                  className="text-destructive text-sm hover:underline mt-2"
                                >
                                  移除
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* 訂單摘要 */}
                <div className="lg:col-span-1">
                  <Card className="sticky top-4">
                    <CardHeader>
                      <CardTitle>訂單摘要</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {(() => {
                        const validItems = cartDetails.filter(item => !item.hasError);
                        const errorItems = cartDetails.filter(item => item.hasError);
                        const subtotal = validItems.reduce((sum, item) => sum + item.plan.price, 0);
                        
                        return (
                          <>
                            <div className="flex justify-between">
                              <span>小計</span>
                              <span>${subtotal.toLocaleString()}</span>
                            </div>
                            
                            {errorItems.length > 0 && (
                              <div className="text-destructive text-sm py-2 px-2 bg-destructive/10 rounded">
                                注意: {errorItems.length} 個項目無法載入，未計入總額
                              </div>
                            )}
                            
                            <Separator />
                            
                            <div className="flex justify-between font-bold">
                              <span>總計</span>
                              <span>${subtotal.toLocaleString()}</span>
                            </div>
                            
                            <Button
                              className="w-full"
                              onClick={handleCheckout}
                              disabled={isProcessing || validItems.length === 0}
                            >
                              {isProcessing ? "處理中..." : "結帳"}
                            </Button>
                          </>
                        );
                      })()}
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
} 
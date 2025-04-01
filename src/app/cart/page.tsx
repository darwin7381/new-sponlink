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

// Define cart item detail interface, allowing partial missing properties
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

  // Check user identity
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
        console.error("Error getting user data:", e);
        router.push('/login');
      }
    };
    
    checkAuth();
  }, [router]);

  // Get cart items
  useEffect(() => {
    async function fetchCartItems() {
      if (!userId) return;

      try {
        setIsLoading(true);
        console.log("Getting cart items, user ID:", userId);
        
        const items = await getCartItems(userId);
        console.log("Original cart items:", items);
        
        // Only show items with PENDING status
        const pendingItems = items.filter(item => item.status === CartItemStatus.PENDING);
        console.log("Pending cart items:", pendingItems);
        
        setCartItems(pendingItems);

        // If cart is empty, check localStorage
        if (pendingItems.length === 0) {
          console.log("Checking cart items in local storage");
          // No extra operations needed here, just logging for debugging
          try {
            if (typeof window !== 'undefined') {
              const storageData = localStorage.getItem('sponlink_cart_items');
              console.log("Raw cart data in local storage:", storageData);
              if (storageData) {
                const parsedData = JSON.parse(storageData);
                console.log("Parsed cart data from local storage:", parsedData);
                
                // Find items for current user
                const userItems = parsedData.filter((item: CartItem) => 
                  item.sponsor_id === userId && item.status === CartItemStatus.PENDING
                );
                console.log("Current user's pending items in local storage:", userItems);
              }
            }
          } catch (e) {
            console.error("Error checking local storage:", e);
          }
        }
      } catch (error) {
        console.error("Error fetching cart items:", error);
        setError("Unable to load cart items. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchCartItems();
    
    // Add event listener
    const handleCartUpdate = () => {
      console.log("Cart update event triggered, fetching cart items again");
      fetchCartItems();
    };
    
    window.addEventListener('cartUpdate', handleCartUpdate);
    
    return () => {
      window.removeEventListener('cartUpdate', handleCartUpdate);
    };
  }, [userId]);

  // Get detailed information for cart items
  useEffect(() => {
    async function fetchCartDetails() {
      if (cartItems.length === 0) return;

      try {
        console.log("Getting cart details, number of items:", cartItems.length);
        
        const details = await Promise.all(
          cartItems.map(async (item) => {
            try {
              console.log("Getting sponsorship plan details, plan ID:", item.sponsorship_plan_id);
              
              // 1. Get sponsorship plan details from API
              const response = await fetch(`/api/sponsorships/${item.sponsorship_plan_id}`);
              
              if (!response.ok) {
                console.error(`Failed to get sponsorship plan ${item.sponsorship_plan_id}: ${response.statusText}`);
                throw new Error(`Failed to get sponsorship plan details: ${response.statusText}`);
              }
              
              const planData = await response.json();
              console.log("Retrieved sponsorship plan:", planData);
              
              // 2. Get event details
              let eventData;
              try {
                console.log("Getting event details, event ID:", planData.event_id);
                eventData = await getEventById(planData.event_id);
                console.log("Retrieved event details:", eventData);
              } catch (eventError) {
                console.error(`Error getting event details, event ID: ${planData.event_id}:`, eventError);
                // If event cannot be retrieved, use default event data
                eventData = { id: planData.event_id || "unknown", title: "Unknown Event" };
              }

              return {
                plan: planData,
                event: {
                  id: eventData?.id || planData.event_id || "unknown",
                  title: eventData?.title || "Unknown Event"
                }
              };
            } catch (error) {
              console.error(`Error processing cart item ${item.id} (plan ID: ${item.sponsorship_plan_id}):`, error);
              
              // Return a default item with error information
              return {
                plan: {
                  id: item.sponsorship_plan_id,
                  name: `Unable to load plan (ID: ${item.sponsorship_plan_id})`,
                  description: error instanceof Error ? error.message : "Unable to get details for this sponsorship plan",
                  price: 0,
                  event_id: "unknown"
                },
                event: {
                  id: "unknown",
                  title: "Unknown Event"
                },
                hasError: true,
                errorMessage: error instanceof Error ? error.message : "Unknown error"
              };
            }
          })
        );

        console.log("Cart details completed:", details);
        setCartDetails(details);
        
        // Check if any items have errors
        const hasErrors = details.some(detail => detail.hasError);
        if (hasErrors) {
          setError("Some sponsorship plan details could not be loaded. Please try again or contact customer service.");
        } else {
          setError(null);
        }
      } catch (error) {
        console.error("Error fetching cart details:", error);
        setError("Unable to load sponsorship plan details. Please try again later.");
      }
    }

    fetchCartDetails();
  }, [cartItems]);

  const handleRemoveItem = async (itemId: string) => {
    try {
      await removeFromCart(itemId);
      setCartItems(cartItems.filter(item => item.id !== itemId));
    } catch (error) {
      console.error("Error removing cart item:", error);
      setError("Unable to remove item. Please try again later.");
    }
  };

  const handleCheckout = async () => {
    if (!userId || cartItems.length === 0) return;

    try {
      setIsProcessing(true);
      setError(null);

      // Filter out cart items with errors
      const validCartDetails = cartDetails.filter(detail => !detail.hasError);
      
      if (validCartDetails.length === 0) {
        setError("There are no valid sponsorship plans in your cart. Please add new ones or refresh the page.");
        setIsProcessing(false);
        return;
      }

      // Calculate total amount for valid items
      const totalAmount = validCartDetails.reduce((sum, item) => sum + item.plan.price, 0);
      console.log("Checkout total amount:", totalAmount);

      // Process checkout
      console.log("Starting checkout process, user ID:", userId);
      const result = await checkout(userId, { amount: totalAmount });
      console.log("Checkout successful, result:", result);
      
      setCheckoutResult(result);

      // Clear cart state
      setCartItems([]);
      setCartDetails([]);
      
      // Trigger cart update event
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('cartUpdate'));
      }
    } catch (error) {
      console.error("Checkout error:", error);
      setError("An error occurred during checkout. Please try again later.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-background min-h-screen pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-foreground mb-8">Cart</h1>

        {error && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {checkoutResult ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-center text-green-600">Checkout Successful!</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-center">Your order has been completed successfully.</p>
              <div className="bg-secondary/30 p-4 rounded-lg">
                <div className="flex justify-between mb-2">
                  <span className="font-medium">Order ID:</span>
                  <span>{checkoutResult.order_id}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="font-medium">Total Amount:</span>
                  <span>${checkoutResult.total_amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Sponsored Items:</span>
                  <span>{checkoutResult.confirmed_items} items</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-center">
              <Button asChild>
                <Link href="/dashboard/sponsor/sponsorships">View My Sponsorships</Link>
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
                  <h2 className="text-xl font-semibold mb-4">Your cart is empty</h2>
                  <p className="text-muted-foreground mb-6">Add sponsorship plans to your cart to begin your sponsorship journey.</p>
                  <Button asChild>
                    <Link href="/events">Browse Events</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Sponsorship Plans</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {/* Cart items list */}
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
                                    Event: {detail.hasError ? 'Unknown Event' : (
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
                                    Error: {detail.errorMessage} (Plan ID: {detail.plan.id})
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
                                  Remove
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Order summary */}
                <div className="lg:col-span-1">
                  <Card className="sticky top-4">
                    <CardHeader>
                      <CardTitle>Order Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {(() => {
                        const validItems = cartDetails.filter(item => !item.hasError);
                        const errorItems = cartDetails.filter(item => item.hasError);
                        const subtotal = validItems.reduce((sum, item) => sum + item.plan.price, 0);
                        
                        return (
                          <>
                            <div className="flex justify-between">
                              <span>Subtotal</span>
                              <span>${subtotal.toLocaleString()}</span>
                            </div>
                            
                            {errorItems.length > 0 && (
                              <div className="text-destructive text-sm py-2 px-2 bg-destructive/10 rounded">
                                Note: {errorItems.length} item(s) could not be loaded and are not included in the total
                              </div>
                            )}
                            
                            <Separator />
                            
                            <div className="flex justify-between font-bold">
                              <span>Total</span>
                              <span>${subtotal.toLocaleString()}</span>
                            </div>
                            
                            <Button
                              className="w-full"
                              onClick={handleCheckout}
                              disabled={isProcessing || validItems.length === 0}
                            >
                              {isProcessing ? "Processing..." : "Checkout"}
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
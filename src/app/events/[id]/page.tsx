'use client';

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { SponsorshipPlanCard } from "@/components/events/SponsorshipPlanCard";
import { getEventById } from "@/services/eventService";
import { addToCart, getCartItems } from "@/services/sponsorService";
import { Event, SponsorshipPlan } from "@/types/event";
import { CartItem } from "@/types/sponsor";
import { isAuthenticated, hasRole, getCurrentUser } from "@/lib/services/authService";
import { USER_ROLES } from "@/lib/types/users";
import { formatLocation, formatAddress } from "@/utils/languageUtils";

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;
  
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [addingToCart, setAddingToCart] = useState(false);
  const [isUserAuthenticated, setIsUserAuthenticated] = useState(false);
  const [isSponsor, setIsSponsor] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  
  // Check user identity
  useEffect(() => {
    const checkAuth = async () => {
      const authenticated = isAuthenticated();
      setIsUserAuthenticated(authenticated);
      
      if (authenticated) {
        const sponsor = hasRole(USER_ROLES.SPONSOR);
        setIsSponsor(sponsor);
        
        if (sponsor) {
          try {
            const userData = await getCurrentUser();
            if (userData) {
              setUserId(userData.id);
            }
          } catch (error) {
            console.error("Error getting user data:", error);
          }
        }
      }
    };
    
    checkAuth();
  }, []);
  
  // Get event data
  useEffect(() => {
    async function fetchEvent() {
      try {
        setIsLoading(true);
        const eventData = await getEventById(eventId);
        
        if (!eventData) {
          setError("Event not found");
          return;
        }
        
        setEvent(eventData);
      } catch (error) {
        console.error("Error fetching event:", error);
        setError("Failed to load event data");
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchEvent();
  }, [eventId]);
  
  // Get cart items for sponsor
  useEffect(() => {
    if (isSponsor && userId) {
      async function fetchCartItems() {
        try {
          if (!userId) return;
          
          const items = await getCartItems(userId);
          setCartItems(items);
        } catch (error) {
          console.error("Error fetching cart items:", error);
        }
      }
      
      fetchCartItems();
    }
  }, [isSponsor, userId]);
  
  // Handle add to cart
  const handleAddToCart = async (plan: SponsorshipPlan) => {
    if (!isUserAuthenticated) {
      router.push('/login');
      return;
    }
    
    if (!isSponsor) {
      alert("Only sponsors can add sponsorship plans to cart");
      return;
    }
    
    if (!userId) return;
    
    try {
      setAddingToCart(true);
      
      // Check if plan is already in cart
      const alreadyInCart = cartItems.some(item => item.sponsorship_plan_id === plan.id);
      
      if (alreadyInCart) {
        alert("This sponsorship plan is already in your cart");
        return;
      }
      
      await addToCart(userId, plan.id);
      
      // Update cart items
      const updatedItems = await getCartItems(userId);
      setCartItems(updatedItems);
      alert("Sponsorship plan added to cart successfully");
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert("Failed to add sponsorship plan to cart");
    } finally {
      setAddingToCart(false);
    }
  };
  
  // Check if plan is in cart
  const isPlanInCart = (planId: string) => {
    return cartItems.some(item => item.sponsorship_plan_id === planId);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (error || !event) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive">Error</h1>
          <p className="mt-2">{error || "Event not found"}</p>
          <Button variant="default" className="mt-4" asChild>
            <Link href="/events">Back to Events</Link>
          </Button>
        </div>
      </div>
    );
  }
  
  // 格式化日期以供顯示
  const startDate = event.start_time ? new Date(event.start_time) : null;
  const endDate = event.end_time ? new Date(event.end_time) : null;
  
  const formattedDate = startDate && endDate 
    ? startDate.toDateString() === endDate.toDateString()
      ? `${format(startDate, "MMMM d, yyyy")} • ${format(startDate, "h:mm a")} - ${format(endDate, "h:mm a")}`
      : `${format(startDate, "MMMM d, yyyy")} - ${format(endDate, "MMMM d, yyyy")}`
    : "日期待定";

  // 格式化地點顯示
  const formattedLocation = event.location ? 
    formatLocation(event.location.city, event.location.country) : 
    "地點待定";
    
  // 格式化完整地址
  const addressDisplay = event.location ? formatAddress(event.location) : "地點待定";

  return (
    <div className="bg-background min-h-screen pt-16 pb-12">
      {/* 活動頭部與封面圖片 */}
      <div className="relative">
        <div className="w-full h-64 md:h-80 lg:h-96 relative">
          <Image
            fill
            className="object-cover"
            src={event.cover_image || "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1600&q=80"}
            alt={event.title}
          />
        </div>
      </div>
      
      {/* 活動內容 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 lg:gap-12">
          {/* 活動詳情 */}
          <div className="lg:col-span-2">
            <nav className="flex mb-4" aria-label="Breadcrumb">
              <ol className="flex items-center space-x-2">
                <li>
                  <Link href="/events" className="text-muted-foreground hover:text-foreground">
                    Events
                  </Link>
                </li>
                <li className="flex items-center">
                  <svg className="h-5 w-5 text-muted-foreground" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="ml-2 text-foreground font-medium truncate">{event.title}</span>
                </li>
              </ol>
            </nav>
            
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">{event.title}</h1>
            
            <div className="mt-4 flex flex-wrap items-center text-muted-foreground gap-4">
              <div className="flex items-center">
                <svg className="h-5 w-5 text-muted-foreground mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>{formattedDate}</span>
              </div>
              
              <div className="flex items-center">
                <svg className="h-5 w-5 text-muted-foreground mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>
                  {event.location?.name 
                    ? (event.location.city || event.location.country
                        ? `${event.location.name}, ${formattedLocation}` 
                        : event.location.name)
                    : "地點待定"}
                </span>
              </div>
            </div>
            
            <div className="mt-8">
              <h2 className="text-xl font-bold text-foreground mb-4">關於此活動</h2>
              <div className="prose max-w-none text-muted-foreground">
                <p className="whitespace-pre-line">{event.description}</p>
              </div>
            </div>
            
            {event.location?.address && (
              <div className="mt-8">
                <h2 className="text-xl font-bold text-foreground mb-4">地點</h2>
                <div className="bg-secondary p-4 rounded-lg">
                  <p className="text-secondary-foreground whitespace-pre-line">{addressDisplay}</p>
                </div>
              </div>
            )}
            
            {/* 如果有活動資料，顯示下載按鈕 */}
            {event.deck_url && (
              <div className="mt-8">
                <h2 className="text-xl font-bold text-foreground mb-4">活動資料</h2>
                <a 
                  href={event.deck_url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  <svg className="-ml-1 mr-2 h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  下載活動資料
                </a>
              </div>
            )}
            
            <div className="mt-10">
              <Button
                variant="default"
                onClick={() => router.push(`/meetings?eventId=${eventId}`)}
                className="w-full sm:w-auto"
              >
                Schedule Meeting with Organizer
              </Button>
            </div>
          </div>
          
          {/* Sponsorship Plans */}
          <div className="mt-8 lg:mt-0">
            <div className="bg-secondary p-6 rounded-lg">
              <h2 className="text-xl font-bold text-foreground mb-6">Sponsorship Plans</h2>
              
              {event.sponsorship_plans && event.sponsorship_plans.length > 0 ? (
                <div className="space-y-6">
                  {event.sponsorship_plans.map(plan => (
                    <SponsorshipPlanCard
                      key={plan.id}
                      plan={plan}
                      onAddToCart={() => {
                        if (userId) {
                          handleAddToCart(plan);
                        }
                      }}
                      isInCart={isPlanInCart(plan.id)}
                      isLoading={addingToCart}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No sponsorship plans available at this time.</p>
              )}
              
              {isUserAuthenticated && isSponsor && cartItems.length > 0 && (
                <div className="mt-8 text-center">
                  <Link href="/cart">
                    <Button variant="outline">
                      View Cart ({cartItems.length})
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
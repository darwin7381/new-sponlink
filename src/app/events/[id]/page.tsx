'use client';

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SponsorshipPlanCard } from "@/components/events/SponsorshipPlanCard";
import { getEventById } from "@/services/eventService";
import { getEventSeriesById } from "@/services/eventSeriesService";
import { addToCart, getCartItems } from "@/services/sponsorService";
import type { Event, SponsorshipPlan, EventSeries } from "@/types/event";
import { CartItem, CartItemStatus } from "@/types/sponsor";
import { formatLocation } from "@/utils/languageUtils";
import { Clock, Calendar, MapPin, Link as LinkIcon } from "lucide-react";
import { getBrowserTimezone, getTimezoneDisplay } from "@/utils/dateUtils";
import LocationDisplay from "@/components/maps/LocationDisplay";
import { SaveButton } from "@/components/common/SaveButton";
import { FollowButton } from "@/components/common/FollowButton";
import { SavedItemType, CollectionType } from "@/types/userPreferences";
import { useAuth } from "@/components/auth/AuthProvider";
import { toast } from "sonner";

/**
 * Convert time from source timezone to target timezone
 * @param isoString ISO string of time
 * @param sourceTimezone Source timezone
 * @param targetTimezone Target timezone
 * @returns Converted time ISO string
 */
const formatToLocalTime = (
  isoString: string | undefined,
  sourceTimezone: string | undefined,
  targetTimezone: string
): string => {
  if (!isoString || !sourceTimezone) return '';
  
  try {
    // 1. Parse ISO string to UTC date
    const date = new Date(isoString);
    
    // 2. Map source timezone time to UTC time
    const originalTimezoneFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: sourceTimezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
    
    const sourceTimeParts = originalTimezoneFormatter.formatToParts(date);
    const sourceTimeMap: Record<string, string> = {};
    sourceTimeParts.forEach(part => {
      sourceTimeMap[part.type] = part.value;
    });
    
    // 3. Rebuild date object
    const sourceYear = parseInt(sourceTimeMap.year);
    const sourceMonth = parseInt(sourceTimeMap.month) - 1; // months are 0-11
    const sourceDay = parseInt(sourceTimeMap.day);
    const sourceHour = parseInt(sourceTimeMap.hour);
    const sourceMinute = parseInt(sourceTimeMap.minute);
    const sourceSecond = parseInt(sourceTimeMap.second);
    
    // 4. Create UTC date representing source timezone time
    const sourceUTCDate = new Date(Date.UTC(
      sourceYear, 
      sourceMonth, 
      sourceDay, 
      sourceHour, 
      sourceMinute, 
      sourceSecond
    ));
    
    // 5. Convert that UTC date to target timezone representation
    const targetTimezoneFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: targetTimezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
    
    const targetTimeParts = targetTimezoneFormatter.formatToParts(sourceUTCDate);
    const targetTimeMap: Record<string, string> = {};
    targetTimeParts.forEach(part => {
      targetTimeMap[part.type] = part.value;
    });
    
    // 6. Rebuild date from formatted parts
    const targetYear = parseInt(targetTimeMap.year);
    const targetMonth = parseInt(targetTimeMap.month) - 1; // months are 0-11
    const targetDay = parseInt(targetTimeMap.day);
    const targetHour = parseInt(targetTimeMap.hour);
    const targetMinute = parseInt(targetTimeMap.minute);
    const targetSecond = parseInt(targetTimeMap.second);
    
    // 7. Create date object representing target timezone time
    const targetDate = new Date(
      targetYear,
      targetMonth,
      targetDay,
      targetHour,
      targetMinute,
      targetSecond
    );
    
    // 8. Return the converted ISO string
    return targetDate.toISOString();
  } catch (error) {
    console.error('Timezone conversion error:', error);
    return isoString; // Return original string on error
  }
};

export default function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [eventId, setEventId] = useState<string>("");
  
  const [event, setEvent] = useState<Event | null>(null);
  const [eventSeries, setEventSeries] = useState<EventSeries | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [addingToCart, setAddingToCart] = useState(false);
  
  // Using unified auth hooks instead of separate states
  const { isLoggedIn, user, showLoginModal } = useAuth();
  
  // Handle parameters
  useEffect(() => {
    const resolveParams = async () => {
      try {
        // In Next.js 15, we need to await params resolution
        const resolvedParams = await params;
        const id = resolvedParams.id;
        setEventId(id);
      } catch (error) {
        console.error("Error resolving params:", error);
        setError("Invalid event ID");
      }
    };
    
    resolveParams();
  }, [params]);
  
  // Get event data
  useEffect(() => {
    async function fetchEvent() {
      if (!eventId) return; // Wait for eventId to be set
      
      try {
        setIsLoading(true);
        const eventData = await getEventById(eventId);
        
        if (!eventData) {
          setError("Event not found");
          return;
        }
        
        setEvent(eventData);
        
        // If the event belongs to a series, get series information
        if (eventData.series_id) {
          try {
            const seriesData = await getEventSeriesById(eventData.series_id);
            if (seriesData) {
              setEventSeries(seriesData);
            }
          } catch (seriesError) {
            console.error("Error fetching event series:", seriesError);
          }
        }
      } catch (error) {
        console.error("Error fetching event:", error);
        setError("Failed to load event data");
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchEvent();
  }, [eventId]);
  
  // Get cart items
  useEffect(() => {
    const fetchCartItems = async () => {
      if (!isLoggedIn || !user?.id) return;
      
      try {
        const items = await getCartItems(user.id);
        const pendingItems = items.filter(item => item.status === CartItemStatus.PENDING);
        setCartItems(pendingItems);
      } catch (error) {
        console.error("Error getting cart:", error);
      }
    };
    
    fetchCartItems();
    
    const handleCartUpdate = () => {
      fetchCartItems();
    };
    
    window.addEventListener('cartUpdate', handleCartUpdate);
    
    return () => {
      window.removeEventListener('cartUpdate', handleCartUpdate);
    };
  }, [isLoggedIn, user]);
  
  // Handle adding to cart
  const handleAddToCart = async (plan: SponsorshipPlan) => {
    // Ensure event is not null before proceeding
    if (!event) {
      console.error("Cannot add to cart: Event is null");
      toast.error("Error adding to cart: Event data not loaded");
      return;
    }

    try {
      setAddingToCart(true);
      
      // Check if already in cart
      if (isPlanInCart(plan.id)) {
        toast.error("This sponsorship plan is already in your cart");
        setAddingToCart(false);
        return;
      }
      
      // For authenticated users, add to remote cart
      if (isLoggedIn && user?.id) {
        await addToCart(user.id, plan.id);
        
        // Trigger cart update
        window.dispatchEvent(new Event('cartUpdate'));
        
        // Update cart display
        const items = await getCartItems(user.id);
        const pendingItems = items.filter(item => item.status === CartItemStatus.PENDING);
        setCartItems(pendingItems);
      } else {
        // For unauthenticated users, add to local storage cart
        const localCart = localStorage.getItem('localCart') ? 
          JSON.parse(localStorage.getItem('localCart') || '[]') : [];
        
        // Define a more specific type for cart items
        interface LocalCartItem {
          plan_id: string;
          event_id: string;
          added_at: string;
          event_title: string;
          plan_title: string;
          plan_price: number;
        }
        
        // Add new item if not already in cart
        if (!localCart.some((item: LocalCartItem) => item.plan_id === plan.id)) {
          localCart.push({
            plan_id: plan.id,
            event_id: event.id,
            added_at: new Date().toISOString(),
            event_title: event.title,
            plan_title: plan.title,
            plan_price: plan.price
          });
          localStorage.setItem('localCart', JSON.stringify(localCart));
          
          // Optional: Trigger an event for components that need to update
          window.dispatchEvent(new CustomEvent('localCartUpdate'));
        }
      }
      
      toast.success("Successfully added to cart!");
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("Error adding to cart, please try again later");
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
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-96 bg-gray-200 dark:bg-gray-800 rounded-lg mb-8"></div>
          <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-1/2 mb-4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-full mb-2"></div>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold text-red-500 mb-4">Error</h1>
        <p className="mb-8">{error || "Failed to load event"}</p>
        <Link href="/events">
          <Button>Return to Events</Button>
        </Link>
      </div>
    );
  }

  // Format event date and time
  const formatEventDate = (isoString: string) => {
    try {
      return format(new Date(isoString), "MMMM d, yyyy");
    } catch (e) {
      console.error("Date formatting error:", e);
      return "Invalid date";
    }
  };

  const formatEventTime = (isoString: string) => {
    try {
      return format(new Date(isoString), "h:mm a");
    } catch (e) {
      console.error("Time formatting error:", e);
      return "Invalid time";
    }
  };

  // Display date and time
  const startDate = formatEventDate(event.start_time);
  const endDate = formatEventDate(event.end_time);
  const startTime = formatEventTime(event.start_time);
  const endTime = formatEventTime(event.end_time);
  
  // Check if event spans multiple days
  const isMultiDayEvent = startDate !== endDate;
  
  // Generate different display text based on whether event spans multiple days
  const dateTimeDisplay = isMultiDayEvent 
    ? `${startDate} ${startTime} - ${endDate} ${endTime}` 
    : `${startDate}, ${startTime} - ${endTime}`;
  
  const timezoneText = event.timezone ? getTimezoneDisplay(event.timezone) : '';

  return (
    <div className="bg-background">
      {/* Top banner */}
      <div className="relative w-full h-[400px]">
        <Image
          src={event.cover_image || "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1600&q=80"}
          alt={event.title}
          className="object-cover"
          fill
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-black/70 flex items-end">
          <div className="container mx-auto px-4 pb-12">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{event.title}</h1>
                <div className="flex flex-wrap gap-4 text-white">
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2" />
                    <span>{dateTimeDisplay}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 mr-2" />
                    <span>{timezoneText}</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 mr-2" />
                    <span>
                      {event.location.location_type === 'virtual' 
                        ? 'Virtual Event' 
                        : formatLocation(event.location.city, event.location.country)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <SaveButton 
                  itemId={event.id}
                  itemType={SavedItemType.EVENT}
                  metadata={{
                    title: event.title,
                    thumbnail: event.cover_image,
                    date: event.start_time
                  }}
                  variant="outline"
                />
                <FollowButton 
                  collectionId={event.id}
                  collectionType={CollectionType.EVENT}
                  collectionName={event.title}
                  variant="outline"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left content */}
          <div className="lg:col-span-2">
            {/* Event series info */}
            {eventSeries && (
              <div className="mb-8 p-6 bg-secondary/30 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold">Event Series</h3>
                  <Link 
                    href={`/event-series/${eventSeries.id}`}
                    className="text-primary hover:underline flex items-center"
                  >
                    <span>View Series</span>
                    <LinkIcon className="ml-1 h-4 w-4" />
                  </Link>
                </div>
                
                <div className="flex items-center">
                  <div className="h-16 w-16 relative mr-4 flex-shrink-0 bg-gray-200 rounded-md overflow-hidden">
                    <Image 
                      src={eventSeries.cover_image || "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1600&q=80"} 
                      alt={eventSeries.title}
                      className="rounded-md object-cover"
                      fill
                    />
                  </div>
                  <div>
                    <h4 className="font-medium">{eventSeries.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{eventSeries.event_ids.length} events • {eventSeries.locations.join(', ')}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">
                        {eventSeries.series_type.replace('_', ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                      </Badge>
                      {event.is_main_event && (
                        <Badge variant="secondary" className="text-xs">Main Event</Badge>
                      )}
                      {event.event_type && (
                        <Badge variant="secondary" className="text-xs">{event.event_type}</Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Event description */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">About the Event</h2>
              <p className="whitespace-pre-line text-muted-foreground">{event.description}</p>
            </div>

            {/* Location map */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Event Location</h2>
              {event.location.location_type === 'virtual' ? (
                <div className="p-4 bg-secondary/30 rounded-lg">
                  <div className="flex items-center mb-2">
                    <Clock className="mr-2 h-5 w-5" />
                    <h3 className="font-semibold">Virtual Event</h3>
                  </div>
                  <p className="text-muted-foreground">
                    This event will take place online. You will receive a participation link after registration.
                  </p>
                </div>
              ) : (
                <LocationDisplay location={event.location} />
              )}
            </div>

            {/* Event materials */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Event Materials</h2>
              <div className="flex flex-wrap gap-4">
                <Button 
                  variant="default" 
                  className="flex items-center gap-2"
                  onClick={() => {
                    // Handle downloading event materials
                    const eventDeckUrl = event.materials?.deck_url || "https://example.com/event-deck.pdf";
                    window.open(eventDeckUrl, '_blank');
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                  </svg>
                  Download Event Deck
                </Button>
                
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2"
                  onClick={() => {
                    // Navigate to meeting booking page
                    if (event.organizer_id) {
                      router.push(`/meetings?organizer=${event.organizer_id}&eventId=${event.id}&title=${encodeURIComponent(`Meeting about: ${event.title}`)}`);
                    } else {
                      toast.error("Could not find event organizer information, please try again later");
                    }
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                  </svg>
                  Schedule a Meeting with Organizer
                </Button>
              </div>
            </div>
          </div>

          {/* Right sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-4">
              <div className="bg-secondary/30 rounded-lg p-6 mb-6">
                <h2 className="text-xl font-bold mb-4">Event Details</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold">Date & Time</h3>
                    <p className="text-muted-foreground">{dateTimeDisplay}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold">Location</h3>
                    <p className="text-muted-foreground">
                      {event.location.location_type === 'virtual' ? (
                        'Virtual Event'
                      ) : (
                        event.location.name + ', ' + formatLocation(event.location.city, event.location.country)
                      )}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold">Category</h3>
                    <p className="text-muted-foreground">{event.category}</p>
                  </div>
                  {event.tags && event.tags.length > 0 && (
                    <div>
                      <h3 className="font-semibold">Tags</h3>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {event.tags.map((tag) => (
                          <Badge key={tag} variant="outline">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Sponsorship plans section */}
              <div className="bg-secondary/30 rounded-lg p-6">
                <h2 className="text-xl font-bold mb-4">Sponsorship Plans</h2>
                {event.sponsorship_plans && event.sponsorship_plans.length > 0 ? (
                  <div className="space-y-4">
                    {event.sponsorship_plans.map((plan) => (
                      <SponsorshipPlanCard
                        key={plan.id}
                        plan={plan}
                        isInCart={isPlanInCart(plan.id)}
                        isLoading={addingToCart}
                        onAddToCart={() => handleAddToCart(plan)}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No sponsorship plans available</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
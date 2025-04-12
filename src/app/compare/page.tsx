'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { SponsorshipPlan } from '@/types/event';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { addToCart } from '@/services/sponsorService';
import { useAuth } from '@/components/auth/AuthProvider';
import { getEventById } from '@/services/eventService';
import { ComparisonSaveButton } from '@/components/common/ComparisonSaveButton';
import { toast } from 'sonner';

export default function ComparePage() {
  const [plansToCompare, setPlansToCompare] = useState<SponsorshipPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [eventNames, setEventNames] = useState<Record<string, string>>({});
  const { isLoggedIn, user, showLoginModal } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    // Load plans from localStorage
    const loadPlans = () => {
      try {
        const storedPlans = localStorage.getItem('plansToCompare');
        if (storedPlans) {
          const parsedPlans = JSON.parse(storedPlans) as SponsorshipPlan[];
          setPlansToCompare(parsedPlans);
          
          // Get all event names
          const fetchEventNames = async () => {
            const names: Record<string, string> = {};
            
            for (const plan of parsedPlans) {
              if (!names[plan.event_id]) {
                try {
                  const event = await getEventById(plan.event_id);
                  if (event) {
                    names[plan.event_id] = event.title;
                  }
                } catch (error) {
                  console.error(`Unable to get details for event ${plan.event_id}`, error);
                  names[plan.event_id] = 'Unknown Event';
                }
              }
            }
            
            setEventNames(names);
          };
          
          fetchEventNames();
        }
      } catch (error) {
        console.error('Unable to load comparison plans:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadPlans();
    
    // Listen for plan updates
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'plansToCompare') {
        loadPlans();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);
  
  // Add to cart functionality
  const handleAddToCart = async (plan: SponsorshipPlan) => {
    try {
      // Check if event name is available
      const eventName = eventNames[plan.event_id] || 'Unknown Event';
      
      // For authenticated users
      if (isLoggedIn && user?.id) {
        await addToCart(user.id, plan.id);
        toast.success('Successfully added to cart');
      } else {
        // For unauthenticated users, use local storage
        // Define a type for local cart items
        interface LocalCartItem {
          plan_id: string;
          event_id: string;
          added_at: string;
          event_title: string;
          plan_title: string;
          plan_price: number;
        }
        
        // Get existing cart or create new one
        const localCart: LocalCartItem[] = localStorage.getItem('localCart') ? 
          JSON.parse(localStorage.getItem('localCart') || '[]') : [];
        
        // Add new item if not already in cart
        if (!localCart.some(item => item.plan_id === plan.id)) {
          localCart.push({
            plan_id: plan.id,
            event_id: plan.event_id,
            added_at: new Date().toISOString(),
            event_title: eventName,
            plan_title: plan.title,
            plan_price: plan.price
          });
          localStorage.setItem('localCart', JSON.stringify(localCart));
          
          // Optional: Trigger an event for other components to update
          window.dispatchEvent(new CustomEvent('localCartUpdate'));
        } else {
          toast.error("This sponsorship plan is already in your cart");
          return;
        }
        
        toast.success('Successfully added to cart');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Unable to add to cart, please try again later');
    }
  };
  
  // Remove comparison item
  const handleRemove = (planId: string) => {
    const updatedPlans = plansToCompare.filter(p => p.id !== planId);
    setPlansToCompare(updatedPlans);
    localStorage.setItem('plansToCompare', JSON.stringify(updatedPlans));
  };
  
  // Clear all comparison items
  const handleClearAll = () => {
    setPlansToCompare([]);
    localStorage.removeItem('plansToCompare');
  };
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Sponsorship Plan Comparison</h1>
        <div className="flex gap-3">
          {plansToCompare.length > 0 && (
            <>
              <ComparisonSaveButton 
                comparisonItems={plansToCompare.map(plan => ({
                  type: 'sponsorship_plan',
                  id: plan.id,
                  metadata: {
                    title: plan.title,
                    price: plan.price,
                    event_id: plan.event_id,
                    event_name: eventNames[plan.event_id] || 'Unknown Event'
                  }
                }))}
                comparisonCriteria={['price', 'benefits', 'max_sponsors']}
              />
              <Button variant="outline" onClick={handleClearAll}>Clear Comparison</Button>
            </>
          )}
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center min-h-[200px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : plansToCompare.length === 0 ? (
        <Card>
          <CardContent className="pt-6 px-6 text-center">
            <div className="mb-4">
              <svg className="mx-auto h-12 w-12 text-muted-foreground" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-foreground">No plans added for comparison</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Browse events and add sponsorship plans to your comparison list
            </p>
            <div className="mt-6">
              <Link href="/events">
                <Button variant="default">Browse Events</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-muted">
                <th className="p-3 border">Comparison Item</th>
                {plansToCompare.map(plan => (
                  <th key={plan.id} className="p-3 border">
                    <div className="flex flex-col items-center">
                      <span className="font-medium">{plan.title}</span>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleRemove(plan.id)}
                        className="mt-2"
                      >
                        Remove
                      </Button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="p-3 border font-medium">Event Name</td>
                {plansToCompare.map(plan => (
                  <td key={plan.id} className="p-3 border text-center">
                    <Link href={`/events/${plan.event_id}`} className="text-primary hover:underline">
                      {eventNames[plan.event_id] || 'Loading...'}
                    </Link>
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-3 border font-medium">Plan Price</td>
                {plansToCompare.map(plan => (
                  <td key={plan.id} className="p-3 border text-center">
                    ${plan.price.toLocaleString()}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-3 border font-medium">Description</td>
                {plansToCompare.map(plan => (
                  <td key={plan.id} className="p-3 border">
                    {plan.description}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-3 border font-medium">Benefits</td>
                {plansToCompare.map(plan => (
                  <td key={plan.id} className="p-3 border">
                    <ul className="list-disc pl-5">
                      {plan.benefits.map((benefit, index) => (
                        <li key={index} className="mb-1">{benefit}</li>
                      ))}
                    </ul>
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-3 border font-medium">Available Slots</td>
                {plansToCompare.map(plan => (
                  <td key={plan.id} className="p-3 border text-center">
                    {plan.max_sponsors && plan.current_sponsors !== undefined ? 
                      `${plan.max_sponsors - plan.current_sponsors}/${plan.max_sponsors}` : 
                      'Unlimited'}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-3 border font-medium">Actions</td>
                {plansToCompare.map(plan => (
                  <td key={plan.id} className="p-3 border text-center">
                    <Button 
                      onClick={() => handleAddToCart(plan)}
                      className="w-full"
                    >
                      Add to Cart
                    </Button>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
} 
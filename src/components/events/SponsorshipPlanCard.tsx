'use client';

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { SponsorshipPlan as SPType } from "@/types/sponsorshipPlan";
import { SponsorshipPlan as EventSPType } from "@/types/event";
import { isAuthenticated, hasRole } from "@/lib/services/authService";
import { USER_ROLES } from "@/lib/types/users";

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
  const [isSponsor, setIsSponsor] = React.useState(false);

  // Check user identity
  React.useEffect(() => {
    const checkAuth = () => {
      const authenticated = isAuthenticated();
      setIsUserAuthenticated(authenticated);
      setIsSponsor(authenticated && hasRole(USER_ROLES.SPONSOR));
    };
    
    checkAuth();
  }, []);

  const handleAddToCart = () => {
    if (onAddToCart) {
      onAddToCart(plan.id);
    }
  };

  // Handle different property names between the two types
  const getTitle = () => {
    if ('title' in plan) return plan.title;
    if ('name' in plan) return plan.name;
    return 'Sponsorship Plan';
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
      
      <CardFooter className="p-6 pt-0">
        {isUserAuthenticated && isSponsor ? (
          <Button
            variant={isInCart ? "outline" : "default"}
            className="w-full"
            onClick={handleAddToCart}
            disabled={isInCart || isLoading}
          >
            {isLoading ? "Processing..." : isInCart ? "Added to Cart" : "Add to Cart"}
          </Button>
        ) : (
          <Link href="/login" className="w-full">
            <Button
              variant="outline"
              className="w-full"
            >
              Login to Sponsor
            </Button>
          </Link>
        )}
      </CardFooter>
    </Card>
  );
} 
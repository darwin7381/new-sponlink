"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getSponsorships } from '@/lib/services/sponsorService';
import { CartItem, CART_ITEM_STATUS } from '@/lib/types/users';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/components/auth/AuthProvider';

export default function SponsorshipsPage() {
  const [sponsorships, setSponsorships] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  // Using useAuth hook for all authentication needs
  const { isLoggedIn, user, showLoginModal } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 只有在用戶已登入的情況下獲取數據
        if (isLoggedIn && user) {
          const sponsorshipsData = await getSponsorships(user.id);
          setSponsorships(sponsorshipsData);
        } else {
          // 未登入用戶，設置空數據
          setSponsorships([]);
        }
      } catch (error) {
        console.error('Error fetching sponsorships:', error);
        setError('Unable to load sponsorship data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isLoggedIn, user]);

  // Page content component
  const SponsorshipsContent = () => {
    if (loading) {
      return (
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <p className="text-lg">Loading...</p>
          </div>
        </div>
      );
    }
  
    if (error) {
      return (
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-red-600 mb-2">Error Occurred</h2>
              <p>{error}</p>
              <Button 
                onClick={() => window.location.reload()} 
                className="mt-4"
              >
                Retry
              </Button>
            </div>
          </div>
        </div>
      );
    }
  
    return (
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">My Sponsorships</h1>
          <Link href="/sponsor">
            <Button variant="outline" className="flex items-center gap-2">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-5 w-5 mr-1" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="2" 
                  d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                />
              </svg>
              Back to Sponsor Center
            </Button>
          </Link>
        </div>
        
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="all">All</TabsTrigger>
          </TabsList>
          
          <TabsContent value="active">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sponsorships.filter(s => s.status === CART_ITEM_STATUS.CONFIRMED).map(sponsorship => (
                <SponsorshipCard key={sponsorship.id} sponsorship={sponsorship} />
              ))}
              {(sponsorships.filter(s => s.status === CART_ITEM_STATUS.CONFIRMED).length === 0) && (
                <div className="col-span-full text-center py-12">
                  <p className="text-muted-foreground">
                    No active sponsorships currently
                  </p>
                  <div className="mt-6">
                    <div className="flex justify-center gap-4">
                      <Link href="/events">
                        <Button>Browse Events</Button>
                      </Link>
                      <Link href="/sponsor">
                        <Button variant="outline">Sponsor Center</Button>
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="completed">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sponsorships.filter(s => s.status === CART_ITEM_STATUS.CONFIRMED).map(sponsorship => (
                <SponsorshipCard key={sponsorship.id} sponsorship={sponsorship} />
              ))}
              {(sponsorships.filter(s => s.status === CART_ITEM_STATUS.CONFIRMED).length === 0) && (
                <div className="col-span-full text-center py-12">
                  <p className="text-muted-foreground">
                    No completed sponsorships currently
                  </p>
                  <div className="mt-6">
                    <div className="flex justify-center gap-4">
                      <Link href="/events">
                        <Button>Browse Events</Button>
                      </Link>
                      <Link href="/sponsor">
                        <Button variant="outline">Sponsor Center</Button>
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="all">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sponsorships.map(sponsorship => (
                <SponsorshipCard key={sponsorship.id} sponsorship={sponsorship} />
              ))}
              {(sponsorships.length === 0) && (
                <div className="col-span-full text-center py-12">
                  <p className="text-muted-foreground">
                    No sponsorship records currently
                  </p>
                  <div className="mt-6">
                    <div className="flex justify-center gap-4">
                      <Link href="/events">
                        <Button>Browse Events</Button>
                      </Link>
                      <Link href="/sponsor">
                        <Button variant="outline">Sponsor Center</Button>
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    );
  };

  // Wrap page with ProtectedRouteWrapper
  return (
    <SponsorshipsContent />
  );
}

interface SponsorshipCardProps {
  sponsorship: CartItem;
}

function SponsorshipCard({ sponsorship }: SponsorshipCardProps) {
  const { isLoggedIn, showLoginModal } = useAuth();
  
  const handleViewDetails = (e: React.MouseEvent) => {
    if (!isLoggedIn) {
      e.preventDefault();
      showLoginModal();
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Sponsorship Plan #{sponsorship.id.slice(-4)}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-2">
          <span className="font-semibold">Status:</span> 
          {sponsorship.status === CART_ITEM_STATUS.CONFIRMED ? 'Active' : 
           sponsorship.status === CART_ITEM_STATUS.CANCELLED ? 'Cancelled' : 'Pending'}
        </p>
        <p className="mb-2">
          <span className="font-semibold">Created Date:</span> 
          {new Date(sponsorship.created_at).toLocaleDateString('en-US')}
        </p>
        <div className="mt-4">
          <Link href={`/sponsor/sponsorships/${sponsorship.sponsorship_plan_id}`} onClick={handleViewDetails}>
            <Button variant="outline" className="w-full">
              View Details
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
} 
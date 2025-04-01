"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  getCurrentUser, 
  isAuthenticated, 
  getActiveView, 
  setActiveView, 
  VIEW_TYPE 
} from '@/lib/services/authService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ViewSwitcher } from '@/components/view/ViewSwitcher';
import { BarChart3Icon, CalendarIcon, Users2Icon, WalletIcon } from 'lucide-react';

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [activeView, setActiveViewState] = useState<VIEW_TYPE | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if logged in
        if (!isAuthenticated()) {
          router.push('/login');
          return;
        }
        
        // Get user data
        const currentUser = await getCurrentUser();
        if (!currentUser) {
          router.push('/login');
          return;
        }
        
        // Check current view
        let view = getActiveView();
        
        // If no active view, set a default one
        if (!view) {
          // Determine default view based on user data
          // This is a simulated implementation, real system might base on user behavior or data
          view = VIEW_TYPE.EVENT_ORGANIZER; 
          setActiveView(view);
        }
        
        setActiveViewState(view);
        setIsLoading(false);
      } catch (error) {
        console.error('Error checking authentication:', error);
        router.push('/login');
      }
    };

    checkAuth();
    
    // Listen for view changes
    const handleViewChange = () => {
      setActiveViewState(getActiveView());
    };
    
    window.addEventListener('viewChange', handleViewChange);
    
    return () => {
      window.removeEventListener('viewChange', handleViewChange);
    };
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Render content based on current view
  const renderDashboardContent = () => {
    if (activeView === VIEW_TYPE.EVENT_ORGANIZER) {
      return (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Events</CardTitle>
                <CalendarIcon className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
                <p className="text-xs text-muted-foreground">Number of created events</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Upcoming Meetings</CardTitle>
                <CalendarIcon className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">4</div>
                <p className="text-xs text-muted-foreground">Meetings in the next seven days</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Sponsorships</CardTitle>
                <WalletIcon className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$24,300</div>
                <p className="text-xs text-muted-foreground">Total sponsorship amount for all events</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Sponsors Count</CardTitle>
                <Users2Icon className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">18</div>
                <p className="text-xs text-muted-foreground">Number of participating sponsors</p>
              </CardContent>
            </Card>
          </div>
          
          <Tabs defaultValue="events" className="space-y-4">
            <TabsList>
              <TabsTrigger value="events">My Events</TabsTrigger>
              <TabsTrigger value="meetings">My Meetings</TabsTrigger>
            </TabsList>
            
            <TabsContent value="events" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Events List</CardTitle>
                  <CardDescription>Manage all your created events</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-6">
                    <p className="text-muted-foreground mb-4">Your created events will be displayed here</p>
                    <Button onClick={() => router.push('/events/create')}>
                      Create New Event
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="meetings" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Meetings List</CardTitle>
                  <CardDescription>Manage your meetings with sponsors</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-6">
                    <p className="text-muted-foreground">You don&apos;t have any scheduled meetings</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      );
    } else if (activeView === VIEW_TYPE.SPONSORSHIP_MANAGER) {
      return (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Sponsorships</CardTitle>
                <BarChart3Icon className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">7</div>
                <p className="text-xs text-muted-foreground">Number of sponsored events</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
                <WalletIcon className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$12,500</div>
                <p className="text-xs text-muted-foreground">Total invested amount</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Upcoming Meetings</CardTitle>
                <CalendarIcon className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3</div>
                <p className="text-xs text-muted-foreground">Confirmed meetings</p>
              </CardContent>
            </Card>
          </div>
          
          <Tabs defaultValue="sponsorships" className="space-y-4">
            <TabsList>
              <TabsTrigger value="sponsorships">My Sponsorships</TabsTrigger>
              <TabsTrigger value="meetings">My Meetings</TabsTrigger>
            </TabsList>
            
            <TabsContent value="sponsorships" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Sponsorship List</CardTitle>
                  <CardDescription>All confirmed sponsorships</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-6">
                    <p className="text-muted-foreground mb-4">Your sponsorship records will be displayed here</p>
                    <Button onClick={() => router.push('/events')}>
                      Browse Events
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="meetings" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Meetings List</CardTitle>
                  <CardDescription>All scheduled meetings</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-6">
                    <p className="text-muted-foreground">You don&apos;t have any scheduled meetings</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      );
    }
    
    // Show selector when no view is selected
    return (
      <div className="min-h-[calc(100vh-150px)] flex flex-col justify-center items-center">
        <h1 className="text-2xl font-bold mb-6">Choose Your View</h1>
        <p className="text-muted-foreground mb-8 text-center max-w-md">
          Please select the view you want to use to customize your experience. You can switch views at any time.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
          <Card className="cursor-pointer hover:border-primary transition-colors" 
                onClick={() => setActiveView(VIEW_TYPE.EVENT_ORGANIZER)}>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CalendarIcon className="mr-2 h-5 w-5" />
                Event Organizer
              </CardTitle>
              <CardDescription>Manage your events and sponsor relationships</CardDescription>
            </CardHeader>
            <CardContent>
              <p>This view allows you to create and manage events, set up sponsorship plans, and meet with sponsors.</p>
            </CardContent>
          </Card>
          
          <Card className="cursor-pointer hover:border-primary transition-colors"
                onClick={() => setActiveView(VIEW_TYPE.SPONSORSHIP_MANAGER)}>
            <CardHeader>
              <CardTitle className="flex items-center">
                <WalletIcon className="mr-2 h-5 w-5" />
                Sponsorship Manager
              </CardTitle>
              <CardDescription>Manage your sponsorship investments and meetings</CardDescription>
            </CardHeader>
            <CardContent>
              <p>This view allows you to browse events, purchase sponsorship plans, and schedule meetings with event organizers.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 mt-16">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <ViewSwitcher />
      </div>
      
      {renderDashboardContent()}
    </div>
  );
} 
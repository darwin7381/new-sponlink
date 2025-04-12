"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3Icon, CalendarIcon, Users2Icon, WalletIcon } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';

function Dashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { isLoggedIn, loading: authLoading } = useAuth();

  useEffect(() => {
    // 只在認證狀態確定後繼續
    if (!authLoading) {
      setIsLoading(false);
    }
  }, [authLoading]);

  if (isLoading || authLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // 如果用戶未登入，顯示登入提示
  if (!isLoggedIn) {
    return (
      <div className="min-h-[calc(100vh-150px)] flex flex-col justify-center items-center">
        <h1 className="text-2xl font-bold mb-6">Welcome to Your Dashboard</h1>
        <p className="text-muted-foreground mb-8 text-center max-w-md">
          Sign in to view your personalized dashboard with events, sponsorships, and meetings.
        </p>
        <div className="flex gap-4">
          <Link href="/login?redirect=/dashboard">
            <Button>Sign In</Button>
          </Link>
          <Link href="/register">
            <Button variant="outline">Register</Button>
          </Link>
        </div>
      </div>
    );
  }

  // 儀表板內容
  return (
    <div className="container mx-auto px-4 py-8 mt-16">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
      </div>
      
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
            <TabsTrigger value="sponsorships">My Sponsorships</TabsTrigger>
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
                  <Button onClick={() => router.push('/organizer/events/create')}>
                    Create New Event
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
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
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Dashboard />
  );
} 
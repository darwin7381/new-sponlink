"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/services/authService';
import { User } from '@/lib/types/users';
import { Button } from '@/components/ui/button';

export default function OrganizerPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  
  useEffect(() => {
    const checkUser = async () => {
      try {
        setIsLoading(true);
        const currentUser = await getCurrentUser();
        
        if (!currentUser) {
          router.push('/login');
          return;
        }
        
        setUser(currentUser);
      } catch (error) {
        console.error('Error checking user:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkUser();
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <h1 className="text-2xl font-semibold mb-4">Loading...</h1>
          <p className="text-muted-foreground">Please wait while we check your account information.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen">
      {/* Top navigation bar - using green background to match screenshot */}
      <div className="bg-[#4c9f70] text-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between py-4 px-4">
            <div className="flex items-center space-x-8">
              <h1 className="text-xl font-bold">Organizer Center</h1>
              <nav className="hidden md:flex space-x-4">
                <Link href="/organizer" className="py-1 px-2 border-b-2 border-white">My Events</Link>
                <Link href="/organizer/create" className="py-1 px-2 border-b-2 border-transparent hover:border-white/60">Create Event</Link>
                <Link href="/organizer/applications" className="py-1 px-2 border-b-2 border-transparent hover:border-white/60">Sponsor Applications</Link>
              </nav>
            </div>
            <div className="flex items-center">
              <Link 
                href="/sponsor"
                className="flex items-center text-white hover:text-white/90 transition-colors px-4 py-2"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-5 w-5 mr-2" 
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
                Switch to Sponsor
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Left sidebar */}
          <div className="w-full md:w-1/4 space-y-6">
            <div className="bg-card rounded-lg shadow-sm p-6 border border-border">
              <h2 className="text-lg font-semibold mb-4">Quick Navigation</h2>
              <nav className="space-y-2">
                <Link href="/organizer/events" className="block p-2 text-sm hover:bg-accent rounded">
                  My Events
                </Link>
                <Link href="/organizer/events/create" className="block p-2 text-sm hover:bg-accent rounded">
                  Create Event
                </Link>
                <Link href="/meetings" className="block p-2 text-sm hover:bg-accent rounded">
                  Meeting Schedule
                </Link>
              </nav>
            </div>
            
            <div className="bg-card rounded-lg shadow-sm p-6 border border-border">
              <h2 className="text-lg font-semibold mb-4">Organizer Stats</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Created Events</p>
                  <p className="text-xl font-semibold">0</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Active Events</p>
                  <p className="text-xl font-semibold">0</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Completed Events</p>
                  <p className="text-xl font-semibold">0</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Main content area */}
          <div className="w-full md:w-3/4 space-y-6">
            <div className="bg-card rounded-lg shadow-sm p-6 border border-border">
              <h2 className="text-lg font-semibold mb-4">Recommended Event Templates</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-border rounded-lg p-4 hover:bg-accent/10 cursor-pointer">
                  <h3 className="font-medium">Online Webinar</h3>
                  <p className="text-sm text-muted-foreground mt-2">Virtual event template suitable for remote participants</p>
                </div>
                <div className="border border-border rounded-lg p-4 hover:bg-accent/10 cursor-pointer">
                  <h3 className="font-medium">Offline Conference</h3>
                  <p className="text-sm text-muted-foreground mt-2">Face-to-face event template for physical venues</p>
                </div>
                <div className="border border-border rounded-lg p-4 hover:bg-accent/10 cursor-pointer">
                  <h3 className="font-medium">Hybrid Event</h3>
                  <p className="text-sm text-muted-foreground mt-2">Event template combining online and offline components</p>
                </div>
                <div className="border border-border rounded-lg p-4 hover:bg-accent/10 cursor-pointer">
                  <h3 className="font-medium">Blockchain Summit</h3>
                  <p className="text-sm text-muted-foreground mt-2">Event template designed for the blockchain industry</p>
                </div>
              </div>
            </div>
            
            <div className="bg-card rounded-lg shadow-sm p-6 border border-border">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">My Events</h2>
                <Link href="/organizer/events">
                  <Button variant="outline" size="sm">View All</Button>
                </Link>
              </div>
              
              <div className="text-center py-12">
                <svg 
                  className="mx-auto h-12 w-12 text-muted-foreground/60" 
                  xmlns="http://www.w3.org/2000/svg" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={1.5} 
                    d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v12a2 2 0 01-2 2z" 
                  />
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={1.5} 
                    d="M16 2v4M8 2v4M3 10h18" 
                  />
                </svg>
                <h3 className="mt-4 text-lg font-medium">No Events Yet</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Create your first event now and begin your journey as an organizer!
                </p>
                <div className="mt-6">
                  <Link href="/organizer/events/create">
                    <Button>Create Event</Button>
                  </Link>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-card rounded-lg shadow-sm p-6 border border-border">
                <h2 className="text-lg font-semibold mb-4">Sponsor Guide</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Learn how to attract more sponsors to support your events and increase their value.
                </p>
                <Button variant="outline" size="sm">View Guide</Button>
              </div>
              
              <div className="bg-card rounded-lg shadow-sm p-6 border border-border">
                <h2 className="text-lg font-semibold mb-4">Event Promotion Tips</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Explore effective strategies to promote your events and increase visibility and engagement.
                </p>
                <Button variant="outline" size="sm">View Tips</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
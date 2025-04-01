"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/services/authService';
import { USER_ROLES, User } from '@/lib/types/users';
import { Button } from '@/components/ui/button';
import SwitchRoleToggle from '@/components/layout/SwitchRoleToggle';
import { mockEvents } from '@/mocks/eventData';
import { Event, EventStatus } from '@/types/event';

export default function SponsorPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'sponsors' | 'meetings' | 'collection'>('meetings');
  const [events, setEvents] = useState<Event[]>([]);
  
  useEffect(() => {
    // Get mock event data - without filtering to ensure data display
    // Directly use mockEvents data without status and sponsorship plans filtering
    setEvents(mockEvents);
  }, []);
  
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

  // Render events list based on screen size
  const renderEventsList = () => {
    // Ensure there is event data
    if (!events || events.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-lg font-medium">No events available</p>
          <p className="text-muted-foreground mt-2">Please check back later</p>
        </div>
      );
    }
    
    // Split events into two groups, first group with max 3 events, second group with remaining
    const firstGroup = events.slice(0, 3);
    const secondGroup = events.slice(3, 6);
    
    return (
      <>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {firstGroup.map(event => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
        
        {secondGroup.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {secondGroup.map(event => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </>
    );
  };
  
  // Event card component
  const EventCard = ({ event }: { event: Event }) => {
    return (
      <div className="border border-border rounded-lg overflow-hidden bg-card shadow-sm">
        <div className="p-6">
          <h3 className="text-xl font-bold">{event.title}</h3>
          <p className="text-muted-foreground mt-1">
            {event.start_time ? new Date(event.start_time).toLocaleDateString() : ''} - 
            {event.end_time ? new Date(event.end_time).toLocaleDateString() : ''}
          </p>
          <p className="text-muted-foreground">
            {event.location?.city || ''}{event.location?.city ? ', ' : ''}
            {event.location?.country || ''}
          </p>
          
          <div className="flex flex-wrap gap-2 mt-4">
            {event.tags?.slice(0, 4).map((tag, index) => (
              <span key={index} className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">{tag}</span>
            ))}
          </div>
          
          <div className="mt-6">
            <Link href={`/sponsor/event/${event.id}`}>
              <Button className="w-full">View Sponsorship Plans</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-background min-h-screen">
      {/* Top navigation bar - using blue background to match screenshot */}
      <div className="bg-[#6966db] text-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between py-4 px-4">
            <div className="flex items-center space-x-8">
              <h1 className="text-xl font-bold">Sponsor Center</h1>
              <div className="flex space-x-8">
                <button 
                  onClick={() => setActiveTab('meetings')} 
                  className={`text-white hover:text-white/90 py-1 border-b-2 ${activeTab === 'meetings' ? 'border-white' : 'border-transparent'}`}
                >
                  Events List
                </button>
                <button 
                  onClick={() => setActiveTab('collection')} 
                  className={`text-white hover:text-white/90 py-1 border-b-2 ${activeTab === 'collection' ? 'border-white' : 'border-transparent'}`}
                >
                  My Collections
                </button>
                <button 
                  onClick={() => setActiveTab('sponsors')} 
                  className={`text-white hover:text-white/90 py-1 border-b-2 ${activeTab === 'sponsors' ? 'border-white' : 'border-transparent'}`}
                >
                  My Sponsorships
                </button>
              </div>
            </div>
            <div className="flex items-center">
              <Link 
                href="/organizer"
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
                Switch to Organizer
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {activeTab === 'meetings' ? (
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-6">Filter Events</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="w-full">
                <p className="mb-2 font-medium">Time</p>
                <select className="w-full p-2 border border-border rounded" aria-label="Select time range">
                  <option>All Time</option>
                  <option>Next Week</option>
                  <option>Next Month</option>
                  <option>Next 3 Months</option>
                </select>
              </div>
              
              <div className="w-full">
                <p className="mb-2 font-medium">Region</p>
                <select className="w-full p-2 border border-border rounded" aria-label="Select region">
                  <option>All Regions</option>
                  <option>Asia</option>
                  <option>Europe</option>
                  <option>North America</option>
                  <option>South America</option>
                </select>
              </div>
              
              <div className="w-full">
                <p className="mb-2 font-medium">Category</p>
                <select className="w-full p-2 border border-border rounded" aria-label="Select category">
                  <option>All Categories</option>
                  <option>DeFi</option>
                  <option>NFT</option>
                  <option>Web3 Social</option>
                  <option>Layer2</option>
                  <option>Infrastructure</option>
                  <option>Security</option>
                </select>
              </div>
              
              <div className="w-full">
                <p className="mb-2 font-medium">Event Type</p>
                <select className="w-full p-2 border border-border rounded" aria-label="Select event type">
                  <option>All Types</option>
                  <option>Online</option>
                  <option>Offline</option>
                  <option>Hybrid</option>
                </select>
              </div>
            </div>
          </div>
          
          {renderEventsList()}
        </div>
      ) : activeTab === 'sponsors' ? (
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Left sidebar */}
            <div className="w-full md:w-1/4 space-y-6">
              <div className="bg-card rounded-lg shadow-sm p-6 border border-border">
                <h2 className="text-lg font-semibold mb-4">Quick Navigation</h2>
                <nav className="space-y-2">
                  <Link href="/sponsor/sponsorships" className="block p-2 text-sm hover:bg-accent rounded">
                    My Sponsorships
                  </Link>
                  <Link href="/events" className="block p-2 text-sm hover:bg-accent rounded">
                    Browse Events
                  </Link>
                  <Link href="/meetings" className="block p-2 text-sm hover:bg-accent rounded">
                    Meeting Schedule
                  </Link>
                </nav>
              </div>
              
              <div className="bg-card rounded-lg shadow-sm p-6 border border-border">
                <h2 className="text-lg font-semibold mb-4">Sponsorship Stats</h2>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Sponsored Events</p>
                    <p className="text-xl font-semibold">0</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Active Sponsorships</p>
                    <p className="text-xl font-semibold">0</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Sponsorship Amount</p>
                    <p className="text-xl font-semibold">$0</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Main content area */}
            <div className="w-full md:w-3/4 space-y-6">
              <div className="bg-card rounded-lg shadow-sm p-6 border border-border">
                <h2 className="text-lg font-semibold mb-4">Recommended Sponsorship Opportunities</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {events.slice(0, 2).map((event, index) => (
                    <div key={index} className="border border-border rounded-lg p-4 hover:bg-accent/10 transition-colors">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">{event.title}</h3>
                        <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
                          {index === 0 ? 'Recommended' : 'Popular'}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">
                        {event.start_time ? new Date(event.start_time).toLocaleDateString() : ''} - 
                        {event.end_time ? new Date(event.end_time).toLocaleDateString() : ''} · 
                        {event.location?.city || ''}{event.location?.city ? ', ' : ''}
                        {event.location?.country || ''}
                      </p>
                      <div className="flex justify-between items-center mt-4">
                        <span className="text-sm font-medium">
                          {event.sponsorship_plans && event.sponsorship_plans.length > 0 
                            ? `$${event.sponsorship_plans.reduce((min, plan) => 
                                Math.min(min, plan.price), Infinity).toLocaleString()} starting` 
                            : 'Price TBD'}
                        </span>
                        <Link href={`/sponsor/event/${event.id}`}>
                          <Button variant="outline" size="sm">View Details</Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-4 text-right">
                  <Link href="/events">
                    <Button variant="ghost" size="sm">
                      View More Events
                      <svg 
                        className="ml-1 h-4 w-4" 
                        xmlns="http://www.w3.org/2000/svg" 
                        viewBox="0 0 20 20" 
                        fill="currentColor"
                      >
                        <path 
                          fillRule="evenodd" 
                          d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" 
                          clipRule="evenodd" 
                        />
                      </svg>
                    </Button>
                  </Link>
                </div>
              </div>
              
              <div className="bg-card rounded-lg shadow-sm p-6 border border-border">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">My Sponsorships</h2>
                  <Link href="/sponsor/sponsorships">
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
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                    />
                  </svg>
                  <h3 className="mt-4 text-lg font-medium">No Sponsorships Yet</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Start sponsoring events to enhance your brand visibility!
                  </p>
                  <div className="mt-6">
                    <Link href="/events">
                      <Button>Browse Events</Button>
                    </Link>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-card rounded-lg shadow-sm p-6 border border-border">
                  <h2 className="text-lg font-semibold mb-4">Sponsorship ROI Analysis</h2>
                  <p className="text-sm text-muted-foreground mb-4">
                    Understand how sponsorships impact your brand exposure and business growth.
                  </p>
                  <Button variant="outline" size="sm">View Analysis</Button>
                </div>
                
                <div className="bg-card rounded-lg shadow-sm p-6 border border-border">
                  <h2 className="text-lg font-semibold mb-4">Sponsorship Strategy Guide</h2>
                  <p className="text-sm text-muted-foreground mb-4">
                    Explore how to create effective sponsorship strategies and maximize ROI.
                  </p>
                  <Button variant="outline" size="sm">View Guide</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // My Collections page
        <div className="max-w-7xl mx-auto px-6 py-8">
          <h2 className="text-2xl font-bold mb-6">My Collections</h2>
          
          <div className="text-center py-12 bg-card rounded-lg border border-border">
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
                d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" 
              />
            </svg>
            <h3 className="mt-4 text-lg font-medium">No Collections Yet</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Save events you&apos;re interested in for easy reference later
            </p>
            <div className="mt-6">
              <Link href="/events">
                <Button>Browse Events</Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 
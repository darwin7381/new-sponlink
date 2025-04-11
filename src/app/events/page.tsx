'use client';

import React, { useState, useEffect, Suspense } from "react";
import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getAllEvents } from "@/services/eventService";
import { Event, EventStatus } from "@/types/event";
import { SearchInput } from "@/components/ui/search-input";

// Dynamic import of EventList component
const EventList = dynamic(() => import('@/components/events/EventList'), {
  loading: () => (
    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
      {[...Array(6)].map((_, index) => (
        <div key={index} className="space-y-3">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
          <div className="flex justify-between pt-2">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-24" />
          </div>
        </div>
      ))}
    </div>
  ),
  ssr: true,
});

export default function EventsPage() {
  const searchParams = useSearchParams();
  const initialSearchTerm = searchParams.get('search') || '';
  
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  
  // Fetch event data
  useEffect(() => {
    async function fetchEvents() {
      try {
        setIsLoading(true);
        
        // 从会话中获取当前用户ID
        let userId = undefined;
        try {
          const user = await import('@/lib/services/authService').then(m => m.getCurrentUser());
          userId = user?.id;
        } catch (error) {
          console.error("Error getting current user:", error);
        }
        
        // 使用用户ID调用getAllEvents
        const eventsData = await getAllEvents({ status: EventStatus.PUBLISHED }, userId);
        setEvents(eventsData);
        setFilteredEvents(eventsData);
      } catch (error) {
        console.error("Error fetching events:", error);
        setError("Unable to load events. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchEvents();
  }, []);
  
  // Apply search from URL parameter on page load
  useEffect(() => {
    setSearchTerm(initialSearchTerm);
  }, [initialSearchTerm]);
  
  // Filter events when search term changes
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredEvents(events);
      return;
    }
    
    const filtered = events.filter(event => 
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (event.location?.name && event.location.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (event.location?.city && event.location.city.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    
    setFilteredEvents(filtered);
  }, [searchTerm, events]);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // useEffect will handle the actual filtering
  };

  return (
    <div className="bg-background min-h-screen pt-16 pb-12">
      {/* Hero section with search */}
      <div className="bg-primary py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl font-extrabold text-primary-foreground sm:text-4xl">
              Explore Events
            </h1>
            <p className="mt-3 max-w-2xl mx-auto text-xl text-primary-foreground/80 sm:mt-4">
              Find sponsorship opportunities that align with your brand and goals
            </p>
            
            <div className="mt-6 max-w-xl mx-auto">
              <SearchInput
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onSearch={(value) => setSearchTerm(value)}
                placeholder="Search events by title, description, or location"
                containerClassName="shadow-lg rounded-md overflow-hidden"
                className="h-12 backdrop-blur-sm bg-white/20 border-white/30 text-white placeholder:text-white/70 rounded-r-none"
                buttonClassName="h-12 bg-white/30 hover:bg-white/40 text-white border-white/30 rounded-l-none min-w-[100px]"
                iconClassName="bg-white/40 rounded-full p-1"
                searchButtonText="Search"
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Events list section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {error ? (
          <div className="text-center py-12">
            <p className="text-destructive text-lg">{error}</p>
            <Button 
              variant="default"
              className="mt-4"
              onClick={() => window.location.reload()}
            >
              Retry
            </Button>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-foreground">
                {searchTerm ? `Search Results (${filteredEvents.length})` : `All Events (${filteredEvents.length})`}
              </h2>
              
              {searchTerm && (
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchTerm("");
                    setFilteredEvents(events);
                  }}
                  className="flex items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 6L6 18"></path>
                    <path d="M6 6l12 12"></path>
                  </svg>
                  Clear Search
                </Button>
              )}
            </div>
            
            <Suspense fallback={
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, index) => (
                  <div key={index} className="space-y-3">
                    <Skeleton className="h-48 w-full" />
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                    <div className="flex justify-between pt-2">
                      <Skeleton className="h-8 w-24" />
                      <Skeleton className="h-8 w-24" />
                    </div>
                  </div>
                ))}
              </div>
            }>
              <EventList events={filteredEvents} isLoading={isLoading} />
            </Suspense>
          </>
        )}
      </div>
    </div>
  );
} 
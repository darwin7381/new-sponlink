'use client';

import React, { useState, useEffect, Suspense } from "react";
import dynamic from 'next/dynamic';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getAllEvents } from "@/services/eventService";
import { Event, EventStatus } from "@/types/event";

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
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  
  // Fetch event data
  useEffect(() => {
    async function fetchEvents() {
      try {
        setIsLoading(true);
        const eventsData = await getAllEvents({ status: EventStatus.PUBLISHED });
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
            
            <form className="mt-6 max-w-xl mx-auto" onSubmit={handleSearch}>
              <div className="flex rounded-md shadow-sm">
                <Input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search events by title, description, or location"
                  className="rounded-l-md rounded-r-none"
                />
                <Button
                  type="submit"
                  variant="secondary"
                  className="rounded-l-none"
                >
                  Search
                </Button>
              </div>
            </form>
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
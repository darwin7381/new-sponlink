'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getOrganizerEvents } from "@/services/eventService";
import { Event, EventStatus } from "@/types/event";
import { getCurrentUser, VIEW_TYPE } from "@/lib/services/authService";
import ProtectedRouteWrapper from "@/components/auth/ProtectedRouteWrapper";

export default function ManageEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Get event data
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        // Get current user
        const user = await getCurrentUser();
        if (!user) {
          return;
        }
          
        // Get event data
        try {
          const eventsData = await getOrganizerEvents(user.id);
          setEvents(eventsData);
        } catch (error) {
          console.error("Error fetching events:", error);
          setError("Unable to load your events. Please try again later.");
        }
      } catch (error) {
        console.error("Error fetching user:", error);
        setError("Error occurred while retrieving user data");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchEvents();
  }, []);

  // Get event status badge
  const getStatusBadge = (status: EventStatus) => {
    switch (status) {
      case EventStatus.DRAFT:
        return <Badge className="bg-yellow-600/20 text-yellow-600 dark:bg-yellow-300/20 dark:text-yellow-300 border-yellow-600/30 dark:border-yellow-300/30">Draft</Badge>;
      case EventStatus.PUBLISHED:
        return <Badge className="bg-emerald-600/20 text-emerald-600 dark:bg-emerald-300/20 dark:text-emerald-300 border-emerald-600/30 dark:border-emerald-300/30">Published</Badge>;
      case EventStatus.CANCELLED:
        return <Badge className="bg-red-600/20 text-red-600 dark:bg-red-300/20 dark:text-red-300 border-red-600/30 dark:border-red-300/30">Cancelled</Badge>;
      case EventStatus.COMPLETED:
        return <Badge className="bg-blue-600/20 text-blue-600 dark:bg-blue-300/20 dark:text-blue-300 border-blue-600/30 dark:border-blue-300/30">Completed</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  // Filter events by status
  const draftEvents = events.filter(event => event.status === EventStatus.DRAFT);
  const publishedEvents = events.filter(event => event.status === EventStatus.PUBLISHED);
  const completedEvents = events.filter(event => 
    event.status === EventStatus.COMPLETED || event.status === EventStatus.CANCELLED
  );

  // Page content component
  const EventsPageContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center min-h-screen bg-background">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
            <h2 className="text-2xl font-semibold mb-2 text-foreground">Loading...</h2>
            <p className="text-muted-foreground">Retrieving your event data</p>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-background min-h-screen pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-foreground">Manage Events</h1>
            <Link href="/organizer/events/create">
              <Button variant="default">
                Create New Event
              </Button>
            </Link>
          </div>

          {error ? (
            <Card className="border-red-300 dark:border-red-800">
              <CardContent className="p-6">
                <p className="text-red-600 dark:text-red-400">{error}</p>
              </CardContent>
            </Card>
          ) : events.length === 0 ? (
            <Card className="border border-border">
              <CardContent className="p-8 text-center">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <h2 className="text-xl font-medium text-foreground">You haven&apos;t created any events yet</h2>
                <p className="mt-2 text-muted-foreground">
                  Click the &quot;Create New Event&quot; button above to create your first event.
                </p>
                <Link href="/organizer/events/create" className="mt-6 inline-block">
                  <Button>Start Creating Event</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="mb-6 bg-card border border-border rounded-lg p-1">
                <TabsTrigger value="all" className="rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">All Events ({events.length})</TabsTrigger>
                <TabsTrigger value="draft" className="rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Drafts ({draftEvents.length})</TabsTrigger>
                <TabsTrigger value="published" className="rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Published ({publishedEvents.length})</TabsTrigger>
                <TabsTrigger value="completed" className="rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Completed ({completedEvents.length})</TabsTrigger>
              </TabsList>
              
              <TabsContent value="all">
                <EventList events={events} getStatusBadge={getStatusBadge} />
              </TabsContent>
              
              <TabsContent value="draft">
                <EventList events={draftEvents} getStatusBadge={getStatusBadge} />
              </TabsContent>
              
              <TabsContent value="published">
                <EventList events={publishedEvents} getStatusBadge={getStatusBadge} />
              </TabsContent>
              
              <TabsContent value="completed">
                <EventList events={completedEvents} getStatusBadge={getStatusBadge} />
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>
    );
  };

  // Wrap page with ProtectedRouteWrapper
  return (
    <ProtectedRouteWrapper requiredView={VIEW_TYPE.EVENT_ORGANIZER}>
      <EventsPageContent />
    </ProtectedRouteWrapper>
  );
}

// Event list component
function EventList({ 
  events, 
  getStatusBadge 
}: { 
  events: Event[], 
  getStatusBadge: (status: EventStatus) => React.ReactNode 
}) {
  return (
    <div className="space-y-6">
      {events.map(event => (
        <Card key={event.id} className="overflow-hidden border border-border hover:border-primary/30 transition-all duration-300">
          <CardContent className="p-0">
            <div className="flex flex-col md:flex-row">
              <div className="md:w-1/4 h-48 md:h-auto relative">
                <img
                  src={event.cover_image}
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 right-3">
                  {getStatusBadge(event.status)}
                </div>
              </div>
              <div className="p-6 md:w-3/4">
                <div>
                  <h3 className="text-xl font-semibold text-foreground">{event.title}</h3>
                  <div className="flex items-center mt-2 mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-muted-foreground mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-sm text-muted-foreground">
                      {new Date(event.start_time).toLocaleDateString()} - {new Date(event.end_time).toLocaleDateString()}
                    </p>
                  </div>
                  <p className="text-muted-foreground line-clamp-2">{event.description}</p>
                </div>
                
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="inline-flex items-center text-sm text-muted-foreground">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    {event.sponsorship_plans.length} sponsorship plans
                  </span>
                  {event.location && (
                    <span className="inline-flex items-center text-sm text-muted-foreground">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {event.location.city ? `${event.location.name}, ${event.location.city}` : event.location.name}
                    </span>
                  )}
                </div>
                
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link href={`/organizer/events/${event.id}`}>
                    <Button variant="outline" size="sm" className="group">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 group-hover:text-primary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      View Details
                    </Button>
                  </Link>
                  <Link href={`/organizer/events/${event.id}/edit`}>
                    <Button variant="outline" size="sm" className="group">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 group-hover:text-primary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit Event
                    </Button>
                  </Link>
                  <Link href={`/organizer/events/${event.id}/plans`}>
                    <Button variant="outline" size="sm" className="group">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 group-hover:text-primary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      Manage Sponsorship Plans
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
} 
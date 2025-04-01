'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getEventById, publishEvent } from "@/services/eventService";
import { Event, EventStatus } from "@/types/event";

export default function EventDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isPublishing, setIsPublishing] = useState(false);
  const [eventId, setEventId] = useState<string>("");
  const [currentUser, setCurrentUser] = useState<{ id: string; role: string } | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isOrganizer, setIsOrganizer] = useState(false);

  // Check user identity
  useEffect(() => {
    const userJson = localStorage.getItem('user');
    if (userJson) {
      try {
        const user = JSON.parse(userJson);
        setCurrentUser(user);
        setIsAuthenticated(true);
        setIsOrganizer(user.role === 'organizer');
      } catch (e) {
        console.error("Error parsing user data:", e);
      }
    }
  }, []);

  // Redirect if not logged in or not an organizer
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router, isLoading]);

  // Get event details
  useEffect(() => {
    async function fetchEventDetails() {
      setIsLoading(true);
      setError("");
      
      try {
        // In Next.js 15, we need to await for params resolution
        const resolvedParams = await params;
        const id = resolvedParams.id;
        setEventId(id); // Save ID for later use
        
        const eventData = await getEventById(id);
        if (!eventData) {
          setError("Event not found");
          return;
        }
        
        // Check if current user is the event organizer
        if (currentUser && eventData.organizer_id !== currentUser.id) {
          setError("You don&apos;t have permission to view this event");
          router.push("/organizer/events");
          return;
        }
        
        setEvent(eventData);
      } catch (error) {
        console.error("Error fetching event details:", error);
        setError("Unable to load event details. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    }

    if (currentUser && isOrganizer) {
      fetchEventDetails();
    }
  }, [params, currentUser, isOrganizer, router]);

  // Publish event
  const handlePublishEvent = async () => {
    if (!event) return;
    
    try {
      setIsPublishing(true);
      const updatedEvent = await publishEvent(eventId);
      
      if (updatedEvent) {
        setEvent(updatedEvent);
      }
    } catch (error) {
      console.error("Error publishing event:", error);
      setError("Error publishing event. Please try again later.");
    } finally {
      setIsPublishing(false);
    }
  };

  // Get event status badge
  const getStatusBadge = (status: EventStatus) => {
    switch (status) {
      case EventStatus.DRAFT:
        return <Badge variant="outline" className="bg-gray-100 text-gray-800">Draft</Badge>;
      case EventStatus.PUBLISHED:
        return <Badge variant="outline" className="bg-green-100 text-green-800">Published</Badge>;
      case EventStatus.CANCELLED:
        return <Badge variant="outline" className="bg-red-100 text-red-800">Cancelled</Badge>;
      case EventStatus.COMPLETED:
        return <Badge variant="outline" className="bg-blue-100 text-blue-800">Completed</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-700"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-50 min-h-screen pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <p className="text-red-600">{error}</p>
          </div>
          <Button variant="outline" onClick={() => router.push("/organizer/events")}>
            Back to Events List
          </Button>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="bg-gray-50 min-h-screen pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <CardContent className="p-6 text-center">
              <h2 className="text-lg font-medium text-gray-900">Event Not Found</h2>
              <p className="mt-2 text-gray-500">
                This event may have been deleted or you don't have permission to view it.
              </p>
              <Button variant="outline" className="mt-4" onClick={() => router.push("/organizer/events")}>
                Back to Events List
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => router.push("/organizer/events")}>
              Back
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">{event.title}</h1>
            {getStatusBadge(event.status)}
          </div>
          <div className="flex gap-3">
            <Link href={`/organizer/events/${event.id}/edit`}>
              <Button variant="outline">Edit Event</Button>
            </Link>
            {event.status === EventStatus.DRAFT && (
              <Button 
                variant="default" 
                onClick={handlePublishEvent}
                disabled={isPublishing}
              >
                {isPublishing ? "Publishing..." : "Publish Event"}
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Event Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-video w-full mb-6 overflow-hidden rounded-lg">
                  <img 
                    src={event.cover_image} 
                    alt={event.title} 
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Description</h3>
                    <p className="mt-2 text-gray-600">{event.description}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Time</h3>
                    <div className="mt-2 text-gray-600">
                      <p>Start Time: {new Date(event.start_time).toLocaleString()}</p>
                      <p>End Time: {new Date(event.end_time).toLocaleString()}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Location</h3>
                    <div className="mt-2 text-gray-600">
                      <p>{event.location.name}, {event.location.city}</p>
                      <p>{event.location.address}</p>
                      <p>{event.location.country} {event.location.postal_code}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Categories & Tags</h3>
                    <div className="mt-2">
                      <Badge variant="secondary" className="mr-2">{event.category}</Badge>
                      {event.tags.map(tag => (
                        <Badge key={tag} variant="outline" className="mr-2">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Sponsorship Plans</CardTitle>
              </CardHeader>
              <CardContent>
                {event.sponsorship_plans.length === 0 ? (
                  <p className="text-gray-500">No sponsorship plans set up yet</p>
                ) : (
                  <div className="space-y-4">
                    {event.sponsorship_plans.map(plan => (
                      <div key={plan.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <h3 className="font-medium text-gray-900">{plan.title}</h3>
                          <span className="text-lg font-semibold">${plan.price.toLocaleString()}</span>
                        </div>
                        <p className="mt-1 text-sm text-gray-600">{plan.description}</p>
                        <div className="mt-3">
                          <h4 className="text-sm font-medium text-gray-700">Benefits:</h4>
                          <ul className="mt-1 text-sm text-gray-600 list-disc list-inside">
                            {plan.benefits.map((benefit, index) => (
                              <li key={index}>{benefit}</li>
                            ))}
                          </ul>
                        </div>
                        {(plan.max_sponsors !== undefined && plan.current_sponsors !== undefined) && (
                          <div className="mt-3 text-sm text-gray-600">
                            Sponsors: {plan.current_sponsors} / {plan.max_sponsors}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="mt-6">
                  <Link href={`/organizer/events/${event.id}/plans`}>
                    <Button variant="outline" className="w-full">
                      Manage Sponsorship Plans
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
            
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Event Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <span className="text-sm text-gray-500">Created</span>
                    <p>{new Date(event.created_at).toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Last Updated</span>
                    <p>{new Date(event.updated_at).toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Current Status</span>
                    <div className="mt-1">{getStatusBadge(event.status)}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 
'use client';

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { isAuthenticated, getCurrentUser, hasRole } from "@/lib/services/authService";
import { USER_ROLES } from "@/lib/types/users";
import { getSponsorMeetings, getOrganizerMeetings, scheduleMeeting } from "@/lib/services/sponsorService";
import { getEvents, getEventById } from "@/services/eventService";
import { format } from "date-fns";
import { useSearchParams } from "next/navigation";
import { Meeting, MEETING_STATUS } from "@/lib/types/users";
import { Event } from "@/types/event";
import { toast } from "sonner";
import Link from "next/link";

const MeetingsPage = () => {
  const searchParams = useSearchParams();
  const eventIdFromUrl = searchParams.get('eventId');
  
  // State for login modal
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [isSponsor, setIsSponsor] = useState(false);
  const [isOrganizer, setIsOrganizer] = useState(false);
  
  // Form states
  const [selectedEvent, setSelectedEvent] = useState<string>("");
  const [meetingTitle, setMeetingTitle] = useState("");
  const [meetingDescription, setMeetingDescription] = useState("");
  const [proposedDates, setProposedDates] = useState<{date: string, time: string}[]>([
    {date: "03/21/2025", time: "10:00 AM"},
    {date: "03/22/2025", time: "02:00 PM"}
  ]);
  
  // Available events
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);
  
  // User meetings
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [isLoadingMeetings, setIsLoadingMeetings] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentEvent, setCurrentEvent] = useState<Event | null>(null);
  
  // Check if user is logged in
  useEffect(() => {
    const checkAuth = async () => {
      const authenticated = isAuthenticated();
      setIsLoggedIn(authenticated);
      
      if (authenticated) {
        const sponsor = hasRole(USER_ROLES.SPONSOR);
        const organizer = hasRole(USER_ROLES.ORGANIZER);
        setIsSponsor(sponsor);
        setIsOrganizer(organizer);
        
        try {
          const userData = await getCurrentUser();
          if (userData) {
            setUserId(userData.id);
          }
        } catch (error) {
          console.error("Error getting user data:", error);
        }
      }
    };
    
    checkAuth();
  }, []);
  
  // Load events
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setIsLoadingEvents(true);
        const result = await getEvents();
        setEvents(result.events);
        
        // If eventId is provided in URL, select that event
        if (eventIdFromUrl) {
          setSelectedEvent(eventIdFromUrl);
          
          // Get details of the selected event
          try {
            const eventDetails = await getEventById(eventIdFromUrl);
            if (eventDetails) {
              setCurrentEvent(eventDetails);
              // Pre-fill meeting title based on event
              setMeetingTitle(`${eventDetails.title} - Sponsorship Discussion`);
            }
          } catch (err) {
            console.error("Error fetching event details:", err);
          }
        }
      } catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setIsLoadingEvents(false);
      }
    };
    
    fetchEvents();
  }, [eventIdFromUrl]);
  
  // Load user meetings if logged in
  useEffect(() => {
    if (isLoggedIn && userId) {
      const fetchMeetings = async () => {
        try {
          setIsLoadingMeetings(true);
          let userMeetings: Meeting[] = [];
          
          if (isSponsor) {
            userMeetings = await getSponsorMeetings(userId);
          } else if (isOrganizer) {
            userMeetings = await getOrganizerMeetings(userId);
          }
          
          setMeetings(userMeetings);
        } catch (error) {
          console.error("Error fetching meetings:", error);
        } finally {
          setIsLoadingMeetings(false);
        }
      };
      
      fetchMeetings();
    } else {
      setIsLoadingMeetings(false);
    }
  }, [isLoggedIn, isSponsor, isOrganizer, userId]);
  
  // Handle event change
  const handleEventChange = async (eventId: string) => {
    setSelectedEvent(eventId);
    
    if (eventId) {
      try {
        const eventDetails = await getEventById(eventId);
        if (eventDetails) {
          setCurrentEvent(eventDetails);
          // Pre-fill meeting title based on event
          setMeetingTitle(`${eventDetails.title} - Sponsorship Discussion`);
        }
      } catch (err) {
        console.error("Error fetching event details:", err);
      }
    } else {
      setCurrentEvent(null);
      setMeetingTitle("");
    }
  };
  
  // Add time slot
  const addTimeSlot = () => {
    setProposedDates([...proposedDates, {date: "", time: ""}]);
  };
  
  // Remove time slot
  const removeTimeSlot = (index: number) => {
    if (proposedDates.length <= 1) return;
    const newDates = [...proposedDates];
    newDates.splice(index, 1);
    setProposedDates(newDates);
  };
  
  // Update time slot
  const updateTimeSlot = (index: number, field: 'date' | 'time', value: string) => {
    const newDates = [...proposedDates];
    newDates[index][field] = value;
    setProposedDates(newDates);
  };
  
  // Convert date and time to ISO string
  const formatDateTime = (date: string, time: string): string => {
    try {
      // Parse date and time
      const [month, day, year] = date.split('/');
      const dateStr = `${year}-${month}-${day}`;
      
      // Convert 12-hour format to 24-hour format
      const [hours, minutesWithPeriod] = time.split(':');
      const [minutesStr, period] = minutesWithPeriod.split(' ');
      let hour24 = parseInt(hours);
      
      if (period?.toUpperCase() === 'PM' && hour24 < 12) {
        hour24 += 12;
      } else if (period?.toUpperCase() === 'AM' && hour24 === 12) {
        hour24 = 0;
      }
      
      // Create ISO string
      const datetime = new Date(`${dateStr}T${hour24.toString().padStart(2, '0')}:${minutesStr}`);
      return datetime.toISOString();
    } catch (error) {
      console.error("Error formatting date time:", error);
      return '';
    }
  };
  
  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isLoggedIn || !isSponsor) {
      setShowLoginModal(true);
      return;
    }
    
    if (!selectedEvent || !userId || !currentEvent?.organizer_id) {
      toast.error("Please select an event");
      return;
    }
    
    if (!meetingTitle.trim()) {
      toast.error("Please enter a meeting title");
      return;
    }
    
    if (proposedDates.some(d => !d.date || !d.time)) {
      toast.error("Please fill in all date and time fields");
      return;
    }
    
    // Format proposed dates to ISO strings
    const formattedDates = proposedDates
      .map(slot => formatDateTime(slot.date, slot.time))
      .filter(date => date !== ''); // Remove invalid dates
    
    if (formattedDates.length === 0) {
      toast.error("Please provide valid date and time formats (MM/DD/YYYY and HH:MM AM/PM)");
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const meetingData = {
        title: meetingTitle,
        description: meetingDescription,
        proposed_times: formattedDates
      };
      
      // Schedule meeting
      await scheduleMeeting(
        userId, 
        currentEvent.organizer_id, 
        selectedEvent, 
        meetingData
      );
      
      // Update meetings list
      const updatedMeetings = await getSponsorMeetings(userId);
      setMeetings(updatedMeetings);
      
      // Reset form
      setMeetingTitle(`${currentEvent.title} - Sponsorship Discussion`);
      setMeetingDescription("");
      setProposedDates([
        {date: "", time: ""},
        {date: "", time: ""}
      ]);
      
      toast.success("Meeting request submitted successfully");
    } catch (error) {
      console.error("Error scheduling meeting:", error);
      toast.error("Failed to schedule meeting. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 bg-background">
      <h1 className="text-3xl font-bold mb-8 mt-8 text-foreground">Meeting Schedule</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left side - Schedule meeting form */}
        <div className="lg:col-span-2 bg-card p-8 rounded-lg shadow-sm border">
          <h2 className="text-xl font-semibold mb-6 text-foreground">Schedule a New Meeting</h2>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2 text-foreground">Select Event</label>
              <select 
                className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:border-primary bg-background text-foreground"
                value={selectedEvent}
                onChange={(e) => handleEventChange(e.target.value)}
                disabled={isLoadingEvents}
              >
                <option value="">-- Select an event --</option>
                {events.map(event => (
                  <option key={event.id} value={event.id}>
                    {event.title}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2 text-foreground">Meeting Title <span className="text-red-500">*</span></label>
              <Input 
                type="text" 
                placeholder="e.g., Sponsorship Discussion"
                value={meetingTitle}
                onChange={(e) => setMeetingTitle(e.target.value)}
                required
                className="w-full border-gray-300"
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2 text-foreground">Meeting Description</label>
              <Textarea 
                placeholder="Describe what you'd like to discuss in this meeting"
                value={meetingDescription}
                onChange={(e) => setMeetingDescription(e.target.value)}
                className="w-full min-h-[100px]"
              />
            </div>
            
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-foreground">Proposed Times</label>
              </div>
              <p className="text-sm text-muted-foreground mb-4">Suggest multiple times that work for you. The organizer will select one.</p>
              
              {proposedDates.map((slot, index) => (
                <div key={index} className="flex items-center mb-3">
                  <Input
                    value={slot.date}
                    onChange={(e) => updateTimeSlot(index, 'date', e.target.value)}
                    placeholder="MM/DD/YYYY"
                    className="mr-2 border-gray-300"
                  />
                  <Input
                    value={slot.time}
                    onChange={(e) => updateTimeSlot(index, 'time', e.target.value)}
                    placeholder="HH:MM AM/PM"
                    className="border-gray-300"
                  />
                  <button 
                    type="button"
                    onClick={() => removeTimeSlot(index)}
                    className="ml-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600"
                    aria-label="Remove time slot"
                    disabled={proposedDates.length <= 1}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>
              ))}
              
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={addTimeSlot}
                className="mt-2 text-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                Add Another Time
              </Button>
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-md"
              disabled={isSubmitting || !isSponsor}
            >
              {isSubmitting ? "Submitting..." : "Request Meeting"}
            </Button>
          </form>
        </div>
        
        {/* Right side - Meeting list */}
        <div className="bg-card p-8 rounded-lg shadow-sm border">
          <h2 className="text-xl font-semibold mb-6 text-foreground">Your Meetings</h2>
          
          {isLoadingMeetings ? (
            <div className="text-center py-10">
              <div className="animate-spin h-8 w-8 border-t-2 border-primary rounded-full mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Loading your meetings...</p>
            </div>
          ) : !isLoggedIn ? (
            <div className="text-center py-10">
              <p className="text-muted-foreground mb-6">No meetings scheduled yet.</p>
              
              <div className="mb-4">
                <Button asChild variant="outline" className="w-full border-input">
                  <Link href="/events">Browse Events</Link>
                </Button>
              </div>
            </div>
          ) : meetings.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-muted-foreground mb-6">No meetings scheduled yet.</p>
              
              <div className="mb-4">
                <Button asChild variant="outline" className="w-full border-input">
                  <Link href="/events">Browse Events</Link>
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {meetings.map(meeting => {
                // Find the associated event
                const eventForMeeting = events.find(e => e.id === meeting.event_id);
                return (
                  <div key={meeting.id} className="border rounded p-4">
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium">{meeting.title}</h3>
                      <span className={`text-xs px-2 py-1 rounded whitespace-nowrap ${
                        meeting.status === MEETING_STATUS.REQUESTED 
                          ? "bg-yellow-100 text-yellow-800" 
                          : meeting.status === MEETING_STATUS.CONFIRMED 
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}>
                        {meeting.status}
                      </span>
                    </div>
                    
                    {eventForMeeting && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {eventForMeeting.title}
                      </p>
                    )}
                    
                    {meeting.description && (
                      <p className="text-sm mt-2 line-clamp-2">{meeting.description}</p>
                    )}
                    
                    <div className="mt-3">
                      <p className="text-xs text-muted-foreground">
                        Requested on {format(new Date(meeting.created_at), "MMM d, yyyy")}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      
      {/* Login modal */}
      <Dialog open={showLoginModal} onOpenChange={setShowLoginModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Login Required</DialogTitle>
            <DialogDescription>
              You need to be logged in to request a meeting.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <p className="text-sm text-gray-500">
              Please log in to your account to continue with your meeting request.
              All your information will be saved.
            </p>
          </div>
          <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
            <Button variant="outline" onClick={() => setShowLoginModal(false)}>
              Cancel
            </Button>
            <Button asChild>
              <Link href="/login">Login Now</Link>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MeetingsPage; 
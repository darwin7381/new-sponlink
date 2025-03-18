'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";

const MeetingsPage = () => {
  // State for login modal
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  // Form states
  const [selectedEvent, setSelectedEvent] = useState<string>("");
  const [meetingTitle, setMeetingTitle] = useState("");
  const [meetingDescription, setMeetingDescription] = useState("");
  const [proposedDates, setProposedDates] = useState<{date: string, time: string}[]>([
    {date: "03/21/2025", time: "10:00 AM"},
    {date: "03/22/2025", time: "02:00 PM"}
  ]);
  
  // Check if user is logged in
  useEffect(() => {
    // Mock authentication check
    const user = localStorage.getItem('user');
    setIsLoggedIn(!!user);
  }, []);
  
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
  
  // Submit form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isLoggedIn) {
      setShowLoginModal(true);
      return;
    }
    
    console.log({
      event: selectedEvent,
      title: meetingTitle,
      description: meetingDescription,
      proposedDates
    });
    // Would send to API in a real implementation
  };

  return (
    <div className="max-w-7xl mx-auto px-4">
      <h1 className="text-3xl font-bold mb-8 mt-8">Meeting Schedule</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left side - Schedule meeting form */}
        <div className="lg:col-span-2 bg-white p-8 rounded-lg shadow-sm border">
          <h2 className="text-xl font-semibold mb-6">Schedule a New Meeting</h2>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Select Event</label>
              <select 
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-primary"
                value={selectedEvent}
                onChange={(e) => setSelectedEvent(e.target.value)}
              >
                <option value="">-- Select an event --</option>
                <option value="event1">Tech Conference 2023</option>
                <option value="event2">Marketing Summit</option>
                <option value="event3">Startup Meetup</option>
              </select>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Meeting Title <span className="text-red-500">*</span></label>
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
              <label className="block text-sm font-medium mb-2">Meeting Description</label>
              <Textarea 
                placeholder="Describe what you'd like to discuss in this meeting"
                value={meetingDescription}
                onChange={(e) => setMeetingDescription(e.target.value)}
                className="w-full min-h-[100px]"
              />
            </div>
            
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium">Proposed Times</label>
              </div>
              <p className="text-sm text-gray-500 mb-4">Suggest multiple times that work for you. The organizer will select one.</p>
              
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
            >
              Request Meeting
            </Button>
          </form>
        </div>
        
        {/* Right side - Meeting list */}
        <div className="bg-white p-8 rounded-lg shadow-sm border">
          <h2 className="text-xl font-semibold mb-6">Your Meetings</h2>
          
          <div className="text-center py-10">
            <p className="text-gray-500 mb-6">No meetings scheduled yet.</p>
            
            <div className="mb-4">
              <Button asChild variant="outline" className="w-full border-gray-300">
                <Link href="/events">Browse Events</Link>
              </Button>
            </div>
          </div>
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
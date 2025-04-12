'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { PlusCircle, Calendar } from 'lucide-react';
import { Event } from '@/types/event';
import { getOrganizerEvents } from '@/services/eventService';
import { addEventToSeries } from '@/services/eventSeriesService';
import { useAuth } from '@/components/auth/AuthProvider';
import { format } from 'date-fns';

interface SubmitEventDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  seriesId: string;
}

const SubmitEventDialog: React.FC<SubmitEventDialogProps> = ({
  isOpen,
  onOpenChange,
  seriesId
}) => {
  const router = useRouter();
  const { isLoggedIn, user, showLoginModal } = useAuth();
  const [organizerEvents, setOrganizerEvents] = useState<Event[]>([]);
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Fetch user's events
  useEffect(() => {
    const fetchOrganizerEvents = async () => {
      if (!isOpen) return;
      
      try {
        setIsLoading(true);
        setErrorMessage('');
        
        if (!isLoggedIn || !user) {
          setErrorMessage('You need to be logged in to submit events');
          setIsLoading(false);
          return;
        }
        
        // Get user's organized events
        const events = await getOrganizerEvents(user.id);
        // Filter out events already in the series
        setOrganizerEvents(events.filter(event => event.event_series_id !== seriesId));
      } catch (error) {
        console.error('Error fetching organizer events:', error);
        setErrorMessage('Failed to load events');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchOrganizerEvents();
  }, [isOpen, seriesId, isLoggedIn, user]);

  // Handle checkbox changes
  const handleCheckboxChange = (eventId: string) => {
    setSelectedEvents(prev => {
      if (prev.includes(eventId)) {
        return prev.filter(id => id !== eventId);
      } else {
        return [...prev, eventId];
      }
    });
  };

  // Handle event submission
  const handleSubmitEvents = async () => {
    if (selectedEvents.length === 0) {
      setErrorMessage('Please select at least one event');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setErrorMessage('');
      
      // Add selected events to the series
      for (const eventId of selectedEvents) {
        await addEventToSeries(seriesId, eventId);
      }
      
      // Refresh page to show updates
      router.refresh();
      onOpenChange(false);
    } catch (error) {
      console.error('Error submitting events to series:', error);
      setErrorMessage('Failed to submit events');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Navigate to create event page
  const handleCreateEvent = () => {
    router.push(`/organizer/events/create?seriesId=${seriesId}`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Submit Event to Series</DialogTitle>
          <DialogDescription>
            Select events to add to this series or create a new event
          </DialogDescription>
        </DialogHeader>
        
        {errorMessage && (
          <div className="text-red-500 text-sm bg-red-50 p-2 rounded-md">
            {errorMessage}
          </div>
        )}
        
        <div className="py-4 max-h-[400px] overflow-y-auto">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-2 border-t-primary rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-muted-foreground">Loading events...</p>
            </div>
          ) : organizerEvents.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground mb-4">You don't have any events to submit</p>
              <Button onClick={handleCreateEvent} variant="outline">
                <PlusCircle className="w-4 h-4 mr-2" />
                Create New Event
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {organizerEvents.map(event => (
                <div key={event.id} className="flex items-start space-x-3 p-3 rounded-md border border-muted hover:bg-muted/20">
                  <Checkbox
                    id={`event-${event.id}`}
                    checked={selectedEvents.includes(event.id)}
                    onCheckedChange={() => handleCheckboxChange(event.id)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <Label
                      htmlFor={`event-${event.id}`}
                      className="font-medium cursor-pointer"
                    >
                      {event.title}
                    </Label>
                    <div className="text-sm text-muted-foreground mt-1">
                      {event.start_time && (
                        <span className="block">
                          {format(new Date(event.start_time), 'MMM d, yyyy HH:mm')}
                        </span>
                      )}
                      {event.location?.name && (
                        <span className="block mt-1">{event.location.name}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              <div className="pt-4 border-t">
                <Button onClick={handleCreateEvent} variant="outline" className="w-full">
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Create New Event
                </Button>
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          {organizerEvents.length > 0 && (
            <Button
              onClick={handleSubmitEvents}
              disabled={selectedEvents.length === 0 || isSubmitting}
              className="relative"
            >
              {isSubmitting ? (
                <>
                  <span className="opacity-0">Submit Selected</span>
                  <span className="absolute inset-0 flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </span>
                </>
              ) : `Submit Selected (${selectedEvents.length})`}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SubmitEventDialog; 
import { Event, EVENT_STATUS } from '../types/events';
import { MOCK_EVENTS } from '../mocks/events';

// Helper function to simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Get all events (with optional filters)
export const getAllEvents = async (filters: {
  title?: string;
  status?: EVENT_STATUS;
  organizerId?: string;
} = {}): Promise<Event[]> => {
  try {
    // Simulate API call
    await delay(500);
    
    let filteredEvents = [...MOCK_EVENTS];
    
    // Apply filters
    if (filters.title) {
      filteredEvents = filteredEvents.filter(event => 
        event.title.toLowerCase().includes(filters.title!.toLowerCase())
      );
    }
    
    if (filters.status) {
      filteredEvents = filteredEvents.filter(event => 
        event.status === filters.status
      );
    }
    
    if (filters.organizerId) {
      filteredEvents = filteredEvents.filter(event => 
        event.organizer_id === filters.organizerId
      );
    }
    
    return filteredEvents;
  } catch (error) {
    console.error("Error getting events:", error);
    throw error;
  }
};

// Get event by ID
export const getEventById = async (eventId: string): Promise<Event> => {
  try {
    // Simulate API call
    await delay(300);
    
    const event = MOCK_EVENTS.find(e => e.id === eventId);
    
    if (!event) {
      throw new Error("Event not found");
    }
    
    return event;
  } catch (error) {
    console.error(`Error getting event with ID ${eventId}:`, error);
    throw error;
  }
};

// Create new event
export const createEvent = async (eventData: Partial<Event>): Promise<Event> => {
  try {
    // Simulate API call
    await delay(800);
    
    // Generate new ID
    const newId = String(parseInt(MOCK_EVENTS[MOCK_EVENTS.length - 1].id) + 1);
    
    // Create new event object
    const newEvent: Event = {
      id: newId,
      title: eventData.title || '',
      description: eventData.description || '',
      start_time: eventData.start_time || new Date().toISOString(),
      end_time: eventData.end_time || new Date().toISOString(),
      location: eventData.location || {
        name: '',
        address: '',
        latitude: 0,
        longitude: 0
      },
      organizer_id: eventData.organizer_id || '',
      sponsor_ids: [],
      status: EVENT_STATUS.DRAFT,
      cover_image: eventData.cover_image || '',
      deck_url: eventData.deck_url || '',
      sponsorship_plans: []
    };
    
    // Add to mock data
    MOCK_EVENTS.push(newEvent);
    
    return newEvent;
  } catch (error) {
    console.error("Error creating event:", error);
    throw error;
  }
};

// Update event
export const updateEvent = async (eventId: string, eventData: Partial<Event>): Promise<Event> => {
  try {
    // Simulate API call
    await delay(600);
    
    // Find event index
    const eventIndex = MOCK_EVENTS.findIndex(e => e.id === eventId);
    
    if (eventIndex === -1) {
      throw new Error("Event not found");
    }
    
    // Update event
    const updatedEvent = {
      ...MOCK_EVENTS[eventIndex],
      ...eventData
    };
    
    // Replace in mock data
    MOCK_EVENTS[eventIndex] = updatedEvent;
    
    return updatedEvent;
  } catch (error) {
    console.error(`Error updating event with ID ${eventId}:`, error);
    throw error;
  }
};

// Delete event
export const deleteEvent = async (eventId: string): Promise<boolean> => {
  try {
    // Simulate API call
    await delay(500);
    
    // Find event index
    const eventIndex = MOCK_EVENTS.findIndex(e => e.id === eventId);
    
    if (eventIndex === -1) {
      throw new Error("Event not found");
    }
    
    // Remove from mock data
    MOCK_EVENTS.splice(eventIndex, 1);
    
    return true;
  } catch (error) {
    console.error(`Error deleting event with ID ${eventId}:`, error);
    throw error;
  }
}; 
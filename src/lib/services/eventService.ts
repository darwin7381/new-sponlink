import { Event, EventStatus } from '../../types/event';
import { mockEvents } from '../../mocks/eventData';

// Helper function to simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Get all events (with optional filters)
export const getAllEvents = async (filters: {
  title?: string;
  status?: EventStatus;
  organizerId?: string;
} = {}): Promise<Event[]> => {
  try {
    // Simulate API call
    await delay(500);
    
    let filteredEvents = [...mockEvents];
    
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
    
    // 已經是統一格式，不需要轉換
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
    
    const event = mockEvents.find(e => e.id === eventId);
    
    if (!event) {
      throw new Error("Event not found");
    }
    
    // 已經是統一格式，不需要轉換
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
    const newId = String(parseInt(mockEvents[mockEvents.length - 1].id) + 1);
    
    // Create new event object
    const newEvent: Event = {
      id: newId,
      title: eventData.title || '',
      description: eventData.description || '',
      start_time: eventData.start_time || new Date().toISOString(),
      end_time: eventData.end_time || new Date().toISOString(),
      location: eventData.location || {
        id: '',
        name: '',
        address: '',
        city: '',
        country: '',
        postal_code: '',
        latitude: 0,
        longitude: 0
      },
      organizer_id: eventData.organizer_id || '',
      sponsor_ids: [],
      status: EventStatus.DRAFT,
      cover_image: eventData.cover_image || '',
      deck_url: eventData.deck_url || '',
      category: eventData.category || '',
      tags: eventData.tags || [],
      sponsorship_plans: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // Add to mock data
    mockEvents.push(newEvent);
    
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
    const eventIndex = mockEvents.findIndex(e => e.id === eventId);
    
    if (eventIndex === -1) {
      throw new Error("Event not found");
    }
    
    // Update event
    const updatedEvent = {
      ...mockEvents[eventIndex],
      ...eventData,
      updated_at: new Date().toISOString()
    };
    
    // Replace in mock data
    mockEvents[eventIndex] = updatedEvent;
    
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
    const eventIndex = mockEvents.findIndex(e => e.id === eventId);
    
    if (eventIndex === -1) {
      throw new Error("Event not found");
    }
    
    // Remove from mock data
    mockEvents.splice(eventIndex, 1);
    
    return true;
  } catch (error) {
    console.error(`Error deleting event with ID ${eventId}:`, error);
    throw error;
  }
}; 
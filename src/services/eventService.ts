import { EventStatus, Event, SponsorshipPlan, OWNER_TYPE } from '@/types/event';
import { mockEvents } from '@/mocks/eventData';

// Helper function to simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Get all events (with optional filters)
 */
export const getAllEvents = async (filters?: {
  category?: string;
  status?: EventStatus;
  search?: string;
}): Promise<Event[]> => {
  await delay(500);
  
  let filteredEvents = [...mockEvents];
  
  if (filters) {
    if (filters.category) {
      filteredEvents = filteredEvents.filter(event => 
        event.category === filters.category
      );
    }
    
    if (filters.status) {
      filteredEvents = filteredEvents.filter(event => 
        event.status === filters.status
      );
    }
    
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filteredEvents = filteredEvents.filter(event => 
        event.title.toLowerCase().includes(searchLower) || 
        event.description.toLowerCase().includes(searchLower) ||
        event.tags?.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }
  }
  
  return filteredEvents;
};

/**
 * Get event by ID
 */
export const getEventById = async (id: string): Promise<Event | null> => {
  try {
    await delay(500);
    const event = mockEvents.find(event => event.id === id);
    return event || null;
  } catch (error) {
    console.error(`Error getting event with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Create a new event
 */
export const createEvent = async (eventData: Partial<Event>): Promise<Event> => {
  try {
    // Simulate API call
    await delay(800);
    
    // Generate new ID
    const newId = String(parseInt(mockEvents[mockEvents.length - 1].id) + 1);
    
    // Create new event object with the current timestamp
    const now = new Date().toISOString();
    
    const newEvent: Event = {
      id: newId,
      title: eventData.title || '',
      description: eventData.description || '',
      start_time: eventData.start_time || now,
      end_time: eventData.end_time || now,
      location: eventData.location || {
        id: '',
        name: '',
        address: '',
        city: '',
        country: '',
        postal_code: '',
      },
      organizer_id: eventData.organizer_id || '',
      ownerId: eventData.ownerId || '',
      ownerType: eventData.ownerType || OWNER_TYPE.USER,
      sponsor_ids: [],
      status: eventData.status || EventStatus.DRAFT,
      cover_image: eventData.cover_image || '',
      deck_url: eventData.deck_url || '',
      category: eventData.category || '',
      tags: eventData.tags || [],
      sponsorship_plans: [],
      created_at: now,
      updated_at: now,
      event_series_id: eventData.event_series_id
    };
    
    // Add to mock data
    mockEvents.push(newEvent);
    
    return newEvent;
  } catch (error) {
    console.error("Error creating event:", error);
    throw error;
  }
};

/**
 * Update event
 */
export const updateEvent = async (id: string, eventData: Partial<Event>): Promise<Event | null> => {
  await delay(500);
  
  const eventIndex = mockEvents.findIndex(event => event.id === id);
  if (eventIndex === -1) return null;
  
  // 在實際應用中，這裡會更新數據庫中的活動
  const updatedEvent = {
    ...mockEvents[eventIndex],
    ...eventData,
    updated_at: new Date().toISOString()
  };
  
  mockEvents[eventIndex] = updatedEvent;
  
  return updatedEvent;
};

/**
 * Delete event
 */
export const deleteEvent = async (id: string): Promise<boolean> => {
  await delay(500);
  
  const eventIndex = mockEvents.findIndex(event => event.id === id);
  if (eventIndex === -1) return false;
  
  // 在實際應用中，這裡會從數據庫中刪除活動
  mockEvents.splice(eventIndex, 1);
  
  return true;
};

/**
 * Get sponsorship plans for an event
 */
export const getSponsorshipPlans = async (eventId: string): Promise<SponsorshipPlan[]> => {
  await delay(500);
  
  const event = mockEvents.find(event => event.id === eventId);
  if (!event || !event.sponsorship_plans) return [];
  
  return event.sponsorship_plans;
};

/**
 * Create sponsorship plan
 */
export const createSponsorshipPlan = async (
  eventId: string, 
  planData: Omit<SponsorshipPlan, 'id' | 'event_id' | 'created_at' | 'updated_at' | 'ownerId' | 'ownerType'>
): Promise<SponsorshipPlan | null> => {
  await delay(500);
  
  const event = mockEvents.find(event => event.id === eventId);
  if (!event) return null;
  
  const newPlan: SponsorshipPlan = {
    ...planData,
    id: `sp${Date.now()}`,
    event_id: eventId,
    ownerId: event.ownerId,
    ownerType: event.ownerType,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  // 在實際應用中，這裡會將新方案添加到數據庫
  if (!event.sponsorship_plans) event.sponsorship_plans = [];
  event.sponsorship_plans.push(newPlan);
  
  return newPlan;
};

/**
 * Update sponsorship plan
 */
export const updateSponsorshipPlan = async (
  eventId: string,
  planId: string,
  planData: Partial<Omit<SponsorshipPlan, 'id' | 'event_id' | 'created_at' | 'updated_at' | 'ownerId' | 'ownerType'>>
): Promise<SponsorshipPlan | null> => {
  await delay(500);
  
  const event = mockEvents.find(event => event.id === eventId);
  if (!event || !event.sponsorship_plans) return null;
  
  const planIndex = event.sponsorship_plans.findIndex(plan => plan.id === planId);
  if (planIndex === -1) return null;
  
  // 更新方案
  const updatedPlan: SponsorshipPlan = {
    ...event.sponsorship_plans[planIndex],
    ...planData,
    // 確保這些字段不會被修改
    id: planId,
    event_id: eventId,
    ownerId: event.sponsorship_plans[planIndex].ownerId,
    ownerType: event.sponsorship_plans[planIndex].ownerType,
    updated_at: new Date().toISOString()
  };
  
  event.sponsorship_plans[planIndex] = updatedPlan;
  
  return updatedPlan;
};

/**
 * Delete sponsorship plan
 */
export const deleteSponsorshipPlan = async (
  eventId: string,
  planId: string
): Promise<boolean> => {
  await delay(500);
  
  const event = mockEvents.find(event => event.id === eventId);
  if (!event || !event.sponsorship_plans) return false;
  
  const planIndex = event.sponsorship_plans.findIndex(plan => plan.id === planId);
  if (planIndex === -1) return false;
  
  // 刪除方案
  event.sponsorship_plans.splice(planIndex, 1);
  
  return true;
};

/**
 * Get organizer events
 */
export const getOrganizerEvents = async (organizerId: string, status?: EventStatus): Promise<Event[]> => {
  await delay(500);
  let events = mockEvents.filter(event => event.organizer_id === organizerId);
  
  if (status !== undefined) {
    events = events.filter(event => event.status === status);
  }
  
  return events;
};

/**
 * Publish event
 */
export const publishEvent = async (id: string): Promise<Event | null> => {
  await delay(500);
  
  const event = mockEvents.find(event => event.id === id);
  if (!event) return null;
  
  if (event.status === EventStatus.PUBLISHED) {
    return event;
  }
  
  const updatedEvent = {
    ...event,
    status: EventStatus.PUBLISHED,
    updated_at: new Date().toISOString()
  };
  
  // 在實際應用中，這裡會更新數據庫中的活動
  const eventIndex = mockEvents.findIndex(e => e.id === id);
  mockEvents[eventIndex] = updatedEvent;
  
  return updatedEvent;
};

// 獲取事件列表
export const getEvents = async (
  options: {
    category?: string;
    keyword?: string;
    status?: EventStatus;
    page?: number;
    limit?: number;
  } = {}
): Promise<{
  events: Event[];
  total: number;
  page: number;
  totalPages: number;
}> => {
  try {
    await delay(500);
    
    let filteredEvents = [...mockEvents];
    
    // 應用過濾
    if (options.category) {
      filteredEvents = filteredEvents.filter(
        event => event.category.toLowerCase() === options.category!.toLowerCase()
      );
    }
    
    if (options.keyword) {
      const keyword = options.keyword.toLowerCase();
      filteredEvents = filteredEvents.filter(
        event =>
          event.title.toLowerCase().includes(keyword) ||
          event.description.toLowerCase().includes(keyword) ||
          event.tags.some(tag => tag.toLowerCase().includes(keyword))
      );
    }
    
    if (options.status) {
      filteredEvents = filteredEvents.filter(event => event.status === options.status);
    }
    
    // 分頁
    const page = options.page || 1;
    const limit = options.limit || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    
    const paginatedEvents = filteredEvents.slice(startIndex, endIndex);
    
    return {
      events: paginatedEvents,
      total: filteredEvents.length,
      page,
      totalPages: Math.ceil(filteredEvents.length / limit)
    };
  } catch (error) {
    console.error("Error getting events:", error);
    throw error;
  }
}; 
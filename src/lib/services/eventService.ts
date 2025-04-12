'use client';

import { Event, EventStatus } from '@/types/event';
import { PERMISSION, RESOURCE_TYPE } from '@/lib/types/users';
import { hasResourcePermission, setResourceOwnership } from './resourcePermissionService';
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

// Export event service functions
export const getEvents = async (): Promise<Event[]> => {
  // 模擬API調用
  await delay(500);
  return mockEvents;
};

export const getEvent = async (id: string): Promise<Event | null> => {
  try {
    // 模擬API調用
    await delay(300);
    const event = mockEvents.find(e => e.id === id);
    return event || null;
  } catch (error) {
    console.error('Error fetching event:', error);
    return null;
  }
};

export const createEvent = async (eventData: Partial<Event>): Promise<Event | null> => {
  try {
    // 使用傳入的用戶ID而不是從 localStorage 獲取
    if (!eventData.ownerId) throw new Error('User ID required');
    
    // 設置資源所有權
    const eventWithOwnership = setResourceOwnership({
      ...eventData,
      resourceType: RESOURCE_TYPE.EVENT,
      status: EventStatus.DRAFT,
      organizer_id: eventData.ownerId // 保留舊字段以兼容
    }, eventData.ownerId);
    
    // 模擬API調用
    await delay(800);
    
    // 創建新事件
    const newId = String(parseInt(mockEvents[mockEvents.length - 1].id) + 1);
    const newEvent = {
      ...eventWithOwnership,
      id: newId,
      sponsorship_plans: []
    } as Event;
    
    // 添加到模擬數據
    mockEvents.push(newEvent);
    
    return newEvent;
  } catch (error) {
    console.error('Error creating event:', error);
    return null;
  }
};

export const updateEvent = async (
  id: string, 
  eventData: Partial<Event>,
  userId?: string
): Promise<Event | null> => {
  try {
    // 獲取當前事件以檢查權限
    const currentEvent = await getEvent(id);
    if (!currentEvent) throw new Error('Event not found');
    
    // 手動添加資源類型以進行權限檢查
    const eventWithType = {
      ...currentEvent,
      resourceType: RESOURCE_TYPE.EVENT
    };
    
    // 權限檢查
    if (userId && !hasResourcePermission(eventWithType, PERMISSION.EDIT, userId)) {
      throw new Error('Permission denied: Cannot edit this event');
    }
    
    // 保留原始所有權信息
    const updatedEvent = {
      ...currentEvent,
      ...eventData,
      id,
      updated_at: new Date().toISOString()
    };
    
    // 模擬API調用
    await delay(600);
    
    // 查找並更新模擬數據
    const eventIndex = mockEvents.findIndex(e => e.id === id);
    if (eventIndex !== -1) {
      mockEvents[eventIndex] = updatedEvent;
    }
    
    return updatedEvent;
  } catch (error) {
    console.error('Error updating event:', error);
    return null;
  }
};

export const deleteEvent = async (id: string, userId?: string): Promise<boolean> => {
  try {
    // 獲取當前事件以檢查權限
    const currentEvent = await getEvent(id);
    if (!currentEvent) throw new Error('Event not found');
    
    // 手動添加資源類型以進行權限檢查
    const eventWithType = {
      ...currentEvent,
      resourceType: RESOURCE_TYPE.EVENT
    };
    
    // 權限檢查
    if (userId && !hasResourcePermission(eventWithType, PERMISSION.DELETE, userId)) {
      throw new Error('Permission denied: Cannot delete this event');
    }
    
    // 模擬API調用
    await delay(500);
    
    // 查找並刪除模擬數據
    const eventIndex = mockEvents.findIndex(e => e.id === id);
    if (eventIndex !== -1) {
      mockEvents.splice(eventIndex, 1);
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting event:', error);
    return false;
  }
};

export const getUserEvents = async (userId: string): Promise<Event[]> => {
  try {
    // 必須提供用戶ID
    if (!userId) throw new Error('No user specified');
    
    // 模擬API調用
    await delay(400);
    
    // 過濾用戶的活動
    return mockEvents.filter(event => event.organizer_id === userId);
  } catch (error) {
    console.error('Error fetching user events:', error);
    return [];
  }
};

// 新增：獲取組織的活動
export const getOrganizationEvents = async (organizationId: string): Promise<Event[]> => {
  try {
    // 模擬API調用
    await delay(400);
    
    // 過濾組織的活動
    return mockEvents.filter(event => 
      event.ownerType === 'organization' && event.ownerId === organizationId
    );
  } catch (error) {
    console.error('Error fetching organization events:', error);
    return [];
  }
}; 
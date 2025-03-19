import { Event as NewEvent, EventStatus } from '../types/event';
import { Event as OldEvent, EVENT_STATUS } from './types/events';
import { mockEvents } from '../mocks/eventData';

// 將舊版Event轉換為新版Event
export function adaptOldEventToNew(oldEvent: OldEvent): NewEvent {
  // 從mockEvents中查找對應的事件
  const mockEvent = mockEvents.find(event => event.id === oldEvent.id);
  
  return {
    ...oldEvent,
    category: '',
    tags: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    status: oldEvent.status === EVENT_STATUS.PUBLISHED ? EventStatus.PUBLISHED : 
            oldEvent.status === EVENT_STATUS.DRAFT ? EventStatus.DRAFT : 
            oldEvent.status === EVENT_STATUS.CANCELLED ? EventStatus.CANCELLED : 
            EventStatus.DRAFT,
    location: {
      id: oldEvent.location?.name || '',
      name: oldEvent.location?.name || '',
      address: oldEvent.location?.address || '',
      city: mockEvent?.location?.city || '', // 使用mockEvent的city屬性
      country: mockEvent?.location?.country || '', // 使用mockEvent的country屬性
      postal_code: mockEvent?.location?.postal_code || '',
      latitude: oldEvent.location?.latitude,
      longitude: oldEvent.location?.longitude
    },
    sponsorship_plans: oldEvent.sponsorship_plans.map(plan => ({
      ...plan,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }))
  };
}

// 將新版Event轉換為舊版Event
export function adaptNewEventToOld(newEvent: NewEvent): OldEvent {
  return {
    id: newEvent.id,
    title: newEvent.title,
    description: newEvent.description,
    start_time: newEvent.start_time,
    end_time: newEvent.end_time,
    location: {
      name: newEvent.location.name,
      address: newEvent.location.address,
      latitude: newEvent.location.latitude || 0,
      longitude: newEvent.location.longitude || 0
    },
    organizer_id: newEvent.organizer_id,
    sponsor_ids: newEvent.sponsor_ids || [],
    status: newEvent.status === EventStatus.PUBLISHED ? EVENT_STATUS.PUBLISHED :
            newEvent.status === EventStatus.DRAFT ? EVENT_STATUS.DRAFT :
            newEvent.status === EventStatus.CANCELLED ? EVENT_STATUS.CANCELLED :
            EVENT_STATUS.DRAFT,
    cover_image: newEvent.cover_image,
    deck_url: newEvent.deck_url || '',
    sponsorship_plans: newEvent.sponsorship_plans.map(plan => ({
      id: plan.id,
      event_id: plan.event_id,
      title: plan.title,
      price: plan.price,
      description: plan.description,
      benefits: plan.benefits
    }))
  };
}

// 批量轉換舊版Event數組為新版Event數組
export function adaptOldEventsToNew(oldEvents: OldEvent[]): NewEvent[] {
  return oldEvents.map(adaptOldEventToNew);
}

// 批量轉換新版Event數組為舊版Event數組
export function adaptNewEventsToOld(newEvents: NewEvent[]): OldEvent[] {
  return newEvents.map(adaptNewEventToOld);
}

// 輔助函數：從地址中解析城市
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function extractCityFromAddress(_address: string): string {
  // 嘗試直接使用城市名稱，而不是從地址解析
  // 這裡我們返回空字符串，讓MOCK_EVENTS中的city和country直接使用
  return '';
}

// 輔助函數：從地址中解析國家
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function extractCountryFromAddress(_address: string): string {
  // 嘗試直接使用國家名稱，而不是從地址解析
  // 這裡我們返回空字符串，讓MOCK_EVENTS中的city和country直接使用
  return '';
} 
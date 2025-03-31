import { EventSeries, EventStatus } from '@/types/event';
import { mockEventSeries } from '@/mocks/eventSeriesData';
import { getEventById } from './eventService';

// Helper function to simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * 获取所有活动系列
 */
export const getAllEventSeries = async (filters?: {
  category?: string;
  status?: EventStatus;
  search?: string;
}): Promise<EventSeries[]> => {
  await delay(500);
  
  let filteredSeries = [...mockEventSeries];
  
  if (filters) {
    if (filters.category) {
      filteredSeries = filteredSeries.filter(series => 
        series.category === filters.category
      );
    }
    
    if (filters.status) {
      filteredSeries = filteredSeries.filter(series => 
        series.status === filters.status
      );
    }
    
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filteredSeries = filteredSeries.filter(series => 
        series.title.toLowerCase().includes(searchLower) || 
        series.description.toLowerCase().includes(searchLower) ||
        series.tags?.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }
  }
  
  return filteredSeries;
};

/**
 * 根据ID获取活动系列
 */
export const getEventSeriesById = async (id: string): Promise<EventSeries | null> => {
  try {
    await delay(500);
    const series = mockEventSeries.find(series => series.id === id);
    return series || null;
  } catch (error) {
    console.error(`Error getting event series with ID ${id}:`, error);
    throw error;
  }
};

/**
 * 获取活动系列中的所有活动
 */
export const getEventsInSeries = async (seriesId: string) => {
  try {
    await delay(500);
    const series = await getEventSeriesById(seriesId);
    if (!series) return [];
    
    const events = await Promise.all(
      series.event_ids.map(async (eventId) => {
        const event = await getEventById(eventId);
        return event;
      })
    );
    
    // 过滤掉null值
    return events.filter(event => event !== null);
  } catch (error) {
    console.error(`Error getting events in series ${seriesId}:`, error);
    throw error;
  }
};

/**
 * 获取活动系列的主要活动
 */
export const getMainEventInSeries = async (seriesId: string) => {
  try {
    await delay(500);
    const series = await getEventSeriesById(seriesId);
    if (!series || !series.main_event_id) return null;
    
    return await getEventById(series.main_event_id);
  } catch (error) {
    console.error(`Error getting main event in series ${seriesId}:`, error);
    throw error;
  }
};

/**
 * 获取推荐的活动系列
 */
export const getFeaturedEventSeries = async (limit: number = 3): Promise<EventSeries[]> => {
  try {
    await delay(500);
    // 在实际应用中，这里可以根据不同的标准来获取推荐的活动系列
    // 例如：最近创建的、最受欢迎的、即将开始的等
    const series = mockEventSeries.filter(series => series.status === EventStatus.PUBLISHED);
    return series.slice(0, limit);
  } catch (error) {
    console.error('Error getting featured event series:', error);
    throw error;
  }
}; 
/**
 * Luma Event Scraper Service
 * Used to extract data from Luma event pages and convert it to the application's event format
 */

import { Event, EventStatus, Location, LocationType, OWNER_TYPE } from '@/types/event';
import { v4 as uuidv4 } from 'uuid';
import { convertToDatetimeLocalFormat, getBrowserTimezone } from '@/utils/dateUtils';

/**
 * Scraped Luma Event data structure (extracted from scraped content)
 */
interface ScrapedLumaEvent {
  title: string;
  description: string;
  coverImage: string;
  startAt: string; // ISO timestamp
  endAt: string;   // ISO timestamp
  timezone?: string;
  location: {
    place_id?: string; 
    name?: string;
    address?: string;
    full_address?: string;
    city?: string;
    country?: string;
    description?: string;
    latitude?: number;
    longitude?: number;
    raw_geo_data?: Record<string, unknown>;
    location_type?: LocationType;
    postal_code?: string;
  };
  category: string;
  tags: string[];
}

/**
 * Create location object
 * Directly use raw Google Places data
 */
const createLocation = (locationData: ScrapedLumaEvent['location']): Location => {
  try {
    // Determine location type - prioritize location_type returned by API, otherwise auto-detect
    let locationType;
    
    if (locationData.location_type !== undefined) {
      // Prioritize location_type value returned by API
      locationType = locationData.location_type;
      console.log('Using location_type returned by API:', locationType);
    } else {
      // Auto-detect location type - if Google Place ID exists, use Google type
      locationType = locationData.place_id 
        ? LocationType.GOOGLE 
        : (!locationData.full_address && !locationData.address 
          ? LocationType.VIRTUAL 
          : LocationType.CUSTOM);
      console.log('Auto-detected location_type:', locationType);
    }
    
    // Basic location object
    const location: Location = {
      id: uuidv4(),
      name: locationData.name || '',
      address: locationData.full_address || locationData.address || '',
      city: locationData.city || '',
      country: locationData.country || '',
      postal_code: locationData.postal_code || '',
      location_type: locationType,
    };
    
    // Google Places specific properties
    if (locationData.place_id) {
      location.place_id = locationData.place_id;
    }
    
    // Add latitude and longitude
    if (typeof locationData.latitude === 'number' && typeof locationData.longitude === 'number') {
      location.latitude = locationData.latitude;
      location.longitude = locationData.longitude;
    }
    
    console.log('Final location object created:', location);
    
    return location;
  } catch (error) {
    console.error('Error creating location object:', error);
    // Return default location
    return {
      id: uuidv4(),
      name: 'Unknown Location',
      address: '',
      city: '',
      country: '',
      postal_code: '',
      location_type: LocationType.CUSTOM
    };
  }
};

/**
 * Parse Luma event data from HTML content
 */
export const parseLumaHTML = (html: string): ScrapedLumaEvent | null => {
  try {
    // This is just a simple example, actual implementation may require more complex parsing
    
    // Extract title
    const titleMatch = html.match(/<title>(.*?)<\/title>/);
    const title = titleMatch ? titleMatch[1].replace(' | Luma', '') : 'Unnamed Event';
    
    // Extract description (simplified example)
    const descriptionMatch = html.match(/<meta\s+name="description"\s+content="([^"]+)"/i);
    const description = descriptionMatch ? descriptionMatch[1] : '';
    
    // Extract image (simplified example)
    const imageMatch = html.match(/("https:\/\/images\.lumacdn\.com[^"]+?")/);
    const coverImage = imageMatch ? imageMatch[1].replace(/"/g, '') : '';
    
    // Assume some default values
    return {
      title,
      description,
      coverImage,
      startAt: '',
      endAt: '',
      location: {
        name: '',
        address: '',
        city: '',
        country: ''
      },
      category: 'Technology',
      tags: ['Conference', 'Tech']
    };
  } catch (error) {
    console.error('Error parsing Luma HTML:', error);
    return null;
  }
};

/**
 * Format scraped Luma data to Event object
 * Added timezone handling
 */
export const formatLumaEvent = (
  scrapedData: ScrapedLumaEvent,
  organizerId: string
): Omit<Event, 'id' | 'created_at' | 'updated_at'> => {
  // Create location object
  const location = createLocation(scrapedData.location);
  
  // Handle timezone - preserve original format (EDT, GMT+8 etc.)
  // If Luma doesn't provide a timezone, use browser's timezone as fallback
  let timezone = getBrowserTimezone();
  
  if (scrapedData.timezone) {
    timezone = scrapedData.timezone;
    console.log('Original timezone provided by Luma:', timezone);
  }
  // Note: Cannot access HTML content here, as formatLumaEvent function cannot access htmlContent
  // Timezone extraction should already be done in scrapeLumaEventFromHTML function
  
  console.log('Final timezone used:', timezone);
  
  // Convert time to format displayable in the form
  const startTimeLocal = convertToDatetimeLocalFormat(scrapedData.startAt, timezone);
  const endTimeLocal = convertToDatetimeLocalFormat(scrapedData.endAt, timezone);
  
  console.log('Luma original start time:', scrapedData.startAt);
  console.log('Converted start time:', startTimeLocal);
  console.log('Luma original end time:', scrapedData.endAt);
  console.log('Converted end time:', endTimeLocal);
  
  // Format to application's event format
  return {
    organizer_id: organizerId,
    title: scrapedData.title,
    description: scrapedData.description,
    cover_image: scrapedData.coverImage,
    start_time: scrapedData.startAt,  // Keep original ISO timestamp
    end_time: scrapedData.endAt,      // Keep original ISO timestamp
    location,
    status: EventStatus.DRAFT,
    category: scrapedData.category,
    tags: scrapedData.tags,
    sponsorship_plans: [],
    timezone: timezone,  // Save original timezone information
    // Add required properties to fix type error
    ownerId: organizerId,
    ownerType: OWNER_TYPE.USER
  };
};

/**
 * Scrape event data from Luma URL
 */
export const scrapeLumaEvent = async (lumaUrl: string, organizerId: string): Promise<Omit<Event, 'id' | 'created_at' | 'updated_at'> | null> => {
  try {
    // Use our API endpoint to scrape Luma website data
    const response = await fetch(`/api/scrape-luma?url=${encodeURIComponent(lumaUrl)}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Scraping failed: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Check if API returned data is valid
    if (!data || !data.title) {
      throw new Error('Invalid Luma event data scraped');
    }
    
    console.log('API returned data:', JSON.stringify(data).substring(0, 500) + '...');
    console.log('Location data:', data.location);
    
    // Convert to ScrapedLumaEvent format
    const scrapedData: ScrapedLumaEvent = {
      title: data.title,
      description: data.description,
      coverImage: data.coverImage,
      startAt: data.startAt,
      endAt: data.endAt,
      timezone: data.timezone,
      location: {
        name: data.location.name,
        full_address: data.location.full_address,
        address: data.location.address,
        city: data.location.city,
        country: data.location.country,
        place_id: data.location.place_id,
        description: data.location.description,
        postal_code: data.location.postal_code,
        location_type: data.location.location_type, // Keep location_type returned by API
        latitude: data.location.latitude,
        longitude: data.location.longitude
      },
      category: data.category,
      tags: data.tags || []
    };
    
    // Directly use API returned data as ScrapedLumaEvent
    return formatLumaEvent(scrapedData, organizerId);
  } catch (error) {
    console.error('Error scraping Luma event:', error);
    throw error; // Throw error up for caller to handle
  }
}; 
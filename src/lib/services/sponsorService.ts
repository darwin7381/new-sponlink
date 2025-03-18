import { CartItem, CART_ITEM_STATUS, Meeting, MEETING_STATUS } from '../types/users';
import { MOCK_CART_ITEMS, MOCK_MEETINGS } from '../mocks/sponsors';

// Helper function to simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Get cart items for the current sponsor
export const getCartItems = async (sponsorId: string): Promise<CartItem[]> => {
  try {
    // Simulate API call
    await delay(400);
    
    // Filter cart items for the current sponsor
    const items = MOCK_CART_ITEMS.filter(item => item.sponsor_id === sponsorId);
    
    return items;
  } catch (error) {
    console.error(`Error getting cart items for sponsor ID ${sponsorId}:`, error);
    throw error;
  }
};

// Add item to cart
export const addToCart = async (sponsorId: string, sponsorshipPlanId: string): Promise<CartItem> => {
  try {
    // Simulate API call
    await delay(500);
    
    // Generate a new cart item ID
    const newItemId = `cart-${Date.now()}`;
    
    // Create new cart item
    const newCartItem: CartItem = {
      id: newItemId,
      sponsor_id: sponsorId,
      sponsorship_plan_id: sponsorshipPlanId,
      status: CART_ITEM_STATUS.PENDING,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // Add to mock data
    MOCK_CART_ITEMS.push(newCartItem);
    
    return newCartItem;
  } catch (error) {
    console.error("Error adding item to cart:", error);
    throw error;
  }
};

// Remove item from cart
export const removeFromCart = async (itemId: string): Promise<boolean> => {
  try {
    // Simulate API call
    await delay(300);
    
    // Find item index
    const itemIndex = MOCK_CART_ITEMS.findIndex(item => item.id === itemId);
    
    if (itemIndex === -1) {
      throw new Error("Cart item not found");
    }
    
    // Remove from mock data
    MOCK_CART_ITEMS.splice(itemIndex, 1);
    
    return true;
  } catch (error) {
    console.error(`Error removing item ${itemId} from cart:`, error);
    throw error;
  }
};

// Checkout (confirm all items in cart)
export const checkout = async (sponsorId: string, paymentDetails: { amount: number }): Promise<{
  success: boolean;
  confirmed_items: number;
  order_id: string;
  total_amount: number;
}> => {
  try {
    // Simulate API call with longer delay to mimic payment processing
    await delay(1500);
    
    // Find all pending cart items for the sponsor
    const sponsorItems = MOCK_CART_ITEMS.filter(
      item => item.sponsor_id === sponsorId && item.status === CART_ITEM_STATUS.PENDING
    );
    
    if (sponsorItems.length === 0) {
      throw new Error("No items in cart");
    }
    
    // Update all items to confirmed
    sponsorItems.forEach(item => {
      const itemIndex = MOCK_CART_ITEMS.findIndex(i => i.id === item.id);
      if (itemIndex !== -1) {
        MOCK_CART_ITEMS[itemIndex].status = CART_ITEM_STATUS.CONFIRMED;
        MOCK_CART_ITEMS[itemIndex].updated_at = new Date().toISOString();
      }
    });
    
    // In a real app, this would create an order or transaction record
    
    return {
      success: true,
      confirmed_items: sponsorItems.length,
      order_id: `order-${Date.now()}`,
      total_amount: paymentDetails.amount
    };
  } catch (error) {
    console.error(`Error during checkout for sponsor ID ${sponsorId}:`, error);
    throw error;
  }
};

// Get sponsorships (confirmed cart items)
export const getSponsorships = async (sponsorId: string): Promise<CartItem[]> => {
  try {
    // Simulate API call
    await delay(400);
    
    // Filter cart items that are confirmed
    const sponsorships = MOCK_CART_ITEMS.filter(
      item => item.sponsor_id === sponsorId && item.status === CART_ITEM_STATUS.CONFIRMED
    );
    
    return sponsorships;
  } catch (error) {
    console.error(`Error getting sponsorships for sponsor ID ${sponsorId}:`, error);
    throw error;
  }
};

// Schedule a meeting
export const scheduleMeeting = async (
  sponsorId: string, 
  organizerId: string, 
  eventId: string, 
  meetingData: {
    title?: string;
    description?: string;
    proposed_times: string[];
  }
): Promise<Meeting> => {
  try {
    // Simulate API call
    await delay(600);
    
    // Generate a new meeting ID
    const newMeetingId = `meeting-${Date.now()}`;
    
    // Create new meeting
    const newMeeting: Meeting = {
      id: newMeetingId,
      sponsor_id: sponsorId,
      organizer_id: organizerId,
      event_id: eventId,
      title: meetingData.title || "Sponsorship Discussion",
      description: meetingData.description || "",
      proposed_times: meetingData.proposed_times,
      confirmed_time: null,
      status: MEETING_STATUS.REQUESTED,
      meeting_link: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // Add to mock data
    MOCK_MEETINGS.push(newMeeting);
    
    return newMeeting;
  } catch (error) {
    console.error("Error scheduling meeting:", error);
    throw error;
  }
};

// Get meetings for sponsor
export const getSponsorMeetings = async (sponsorId: string): Promise<Meeting[]> => {
  try {
    // Simulate API call
    await delay(500);
    
    // Filter meetings for the sponsor
    const meetings = MOCK_MEETINGS.filter(meeting => meeting.sponsor_id === sponsorId);
    
    return meetings;
  } catch (error) {
    console.error(`Error getting meetings for sponsor ID ${sponsorId}:`, error);
    throw error;
  }
};

// Get meetings for organizer
export const getOrganizerMeetings = async (organizerId: string): Promise<Meeting[]> => {
  try {
    // Simulate API call
    await delay(500);
    
    // Filter meetings for the organizer
    const meetings = MOCK_MEETINGS.filter(meeting => meeting.organizer_id === organizerId);
    
    return meetings;
  } catch (error) {
    console.error(`Error getting meetings for organizer ID ${organizerId}:`, error);
    throw error;
  }
};

// Confirm meeting (organizer accepts a proposed time)
export const confirmMeeting = async (
  meetingId: string, 
  confirmedTime: string, 
  meetingLink: string
): Promise<Meeting> => {
  try {
    // Simulate API call
    await delay(400);
    
    // Find meeting index
    const meetingIndex = MOCK_MEETINGS.findIndex(m => m.id === meetingId);
    
    if (meetingIndex === -1) {
      throw new Error("Meeting not found");
    }
    
    // Update meeting
    MOCK_MEETINGS[meetingIndex].status = MEETING_STATUS.CONFIRMED;
    MOCK_MEETINGS[meetingIndex].confirmed_time = confirmedTime;
    MOCK_MEETINGS[meetingIndex].meeting_link = meetingLink;
    MOCK_MEETINGS[meetingIndex].updated_at = new Date().toISOString();
    
    return MOCK_MEETINGS[meetingIndex];
  } catch (error) {
    console.error(`Error confirming meeting with ID ${meetingId}:`, error);
    throw error;
  }
};

// Cancel meeting
export const cancelMeeting = async (meetingId: string): Promise<Meeting> => {
  try {
    // Simulate API call
    await delay(400);
    
    // Find meeting index
    const meetingIndex = MOCK_MEETINGS.findIndex(m => m.id === meetingId);
    
    if (meetingIndex === -1) {
      throw new Error("Meeting not found");
    }
    
    // Update meeting
    MOCK_MEETINGS[meetingIndex].status = MEETING_STATUS.CANCELLED;
    MOCK_MEETINGS[meetingIndex].updated_at = new Date().toISOString();
    
    return MOCK_MEETINGS[meetingIndex];
  } catch (error) {
    console.error(`Error cancelling meeting with ID ${meetingId}:`, error);
    throw error;
  }
}; 
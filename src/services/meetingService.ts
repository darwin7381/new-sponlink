import { Meeting, MeetingStatus, CartItem, CartItemStatus } from '@/types/meeting';
import { mockMeetings, mockCartItems } from '@/mocks/meetingData';

// Helper function to simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Get cart items for the current sponsor
export const getCartItems = async (sponsorId: string): Promise<CartItem[]> => {
  try {
    await delay(400);
    
    const items = mockCartItems.filter(item => item.sponsor_id === sponsorId);
    
    return items;
  } catch (error) {
    console.error(`Error getting cart items for sponsor ID ${sponsorId}:`, error);
    throw error;
  }
};

// Add item to cart
export const addToCart = async (sponsorId: string, sponsorshipPlanId: string): Promise<CartItem> => {
  try {
    await delay(500);
    
    const newItemId = `cart-${Date.now()}`;
    
    const newCartItem: CartItem = {
      id: newItemId,
      sponsor_id: sponsorId,
      sponsorship_plan_id: sponsorshipPlanId,
      status: CartItemStatus.PENDING,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    mockCartItems.push(newCartItem);
    
    return newCartItem;
  } catch (error) {
    console.error("Error adding item to cart:", error);
    throw error;
  }
};

// Remove item from cart
export const removeFromCart = async (itemId: string): Promise<boolean> => {
  try {
    await delay(300);
    
    const itemIndex = mockCartItems.findIndex(item => item.id === itemId);
    
    if (itemIndex === -1) {
      throw new Error("Cart item not found");
    }
    
    mockCartItems.splice(itemIndex, 1);
    
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
    await delay(1500);
    
    const sponsorItems = mockCartItems.filter(
      item => item.sponsor_id === sponsorId && item.status === CartItemStatus.PENDING
    );
    
    if (sponsorItems.length === 0) {
      throw new Error("No items in cart");
    }
    
    sponsorItems.forEach(item => {
      const itemIndex = mockCartItems.findIndex(i => i.id === item.id);
      if (itemIndex !== -1) {
        mockCartItems[itemIndex].status = CartItemStatus.CONFIRMED;
        mockCartItems[itemIndex].updated_at = new Date().toISOString();
      }
    });
    
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
    await delay(400);
    
    const sponsorships = mockCartItems.filter(
      item => item.sponsor_id === sponsorId && item.status === CartItemStatus.CONFIRMED
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
    await delay(600);
    
    const newMeetingId = `meeting-${Date.now()}`;
    
    const newMeeting: Meeting = {
      id: newMeetingId,
      sponsor_id: sponsorId,
      organizer_id: organizerId,
      event_id: eventId,
      title: meetingData.title || "Sponsorship Discussion",
      description: meetingData.description || "",
      proposed_times: meetingData.proposed_times,
      confirmed_time: null,
      status: MeetingStatus.REQUESTED,
      meeting_link: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    mockMeetings.push(newMeeting);
    
    return newMeeting;
  } catch (error) {
    console.error("Error scheduling meeting:", error);
    throw error;
  }
};

// Get meetings for sponsor
export const getSponsorMeetings = async (sponsorId: string): Promise<Meeting[]> => {
  try {
    await delay(500);
    
    const meetings = mockMeetings.filter(meeting => meeting.sponsor_id === sponsorId);
    
    return meetings;
  } catch (error) {
    console.error(`Error getting meetings for sponsor ID ${sponsorId}:`, error);
    throw error;
  }
};

// Get meetings for organizer
export const getOrganizerMeetings = async (organizerId: string): Promise<Meeting[]> => {
  try {
    await delay(500);
    
    const meetings = mockMeetings.filter(meeting => meeting.organizer_id === organizerId);
    
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
    await delay(400);
    
    const meetingIndex = mockMeetings.findIndex(m => m.id === meetingId);
    
    if (meetingIndex === -1) {
      throw new Error("Meeting not found");
    }
    
    mockMeetings[meetingIndex].status = MeetingStatus.CONFIRMED;
    mockMeetings[meetingIndex].confirmed_time = confirmedTime;
    mockMeetings[meetingIndex].meeting_link = meetingLink;
    mockMeetings[meetingIndex].updated_at = new Date().toISOString();
    
    return mockMeetings[meetingIndex];
  } catch (error) {
    console.error(`Error confirming meeting with ID ${meetingId}:`, error);
    throw error;
  }
};

// Cancel meeting
export const cancelMeeting = async (meetingId: string): Promise<Meeting> => {
  try {
    await delay(400);
    
    const meetingIndex = mockMeetings.findIndex(m => m.id === meetingId);
    
    if (meetingIndex === -1) {
      throw new Error("Meeting not found");
    }
    
    mockMeetings[meetingIndex].status = MeetingStatus.CANCELLED;
    mockMeetings[meetingIndex].updated_at = new Date().toISOString();
    
    return mockMeetings[meetingIndex];
  } catch (error) {
    console.error(`Error cancelling meeting with ID ${meetingId}:`, error);
    throw error;
  }
}; 
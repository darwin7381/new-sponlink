import { CartItem, CartItemStatus, Meeting, MeetingStatus, CheckoutResult, MeetingData } from '@/types/sponsor';
import { mockCartItems, mockMeetings, generateId, getCurrentISOString } from '@/mocks/sponsorData';

// Helper function to simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// 持久化本地存儲函數
const saveToLocalStorage = (key: string, data: unknown) => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error(`保存到本地存儲錯誤 (${key}):`, error);
    }
  }
};

// 從本地存儲中獲取數據
const getFromLocalStorage = <T>(key: string, defaultValue: T): T => {
  if (typeof window !== 'undefined') {
    try {
      const storedData = localStorage.getItem(key);
      return storedData ? JSON.parse(storedData) as T : defaultValue;
    } catch (error) {
      console.error(`從本地存儲獲取數據錯誤 (${key}):`, error);
      return defaultValue;
    }
  }
  return defaultValue;
};

// 購物車本地存儲鍵
const CART_STORAGE_KEY = 'sponlink_cart_items';

// Get cart items for the current sponsor
export const getCartItems = async (sponsorId: string): Promise<CartItem[]> => {
  try {
    await delay(400);
    
    // 從本地存儲中獲取購物車數據
    const storedItems = getFromLocalStorage<CartItem[]>(CART_STORAGE_KEY, []);
    
    // 獲取指定贊助商的項目
    const items = storedItems.filter((item) => item.sponsor_id === sponsorId);
    console.log(`獲取到 ${items.length} 個購物車項目，用戶ID: ${sponsorId}`);
    
    // 合併模擬數據和本地數據
    const combinedItems = [...mockCartItems, ...items].filter(
      (item, index, self) => 
        // 去除重複項目（基於ID）
        index === self.findIndex(i => i.id === item.id)
    );
    
    // 更新本地存儲
    saveToLocalStorage(CART_STORAGE_KEY, combinedItems);
    
    // 返回指定贊助商的項目
    return combinedItems.filter(item => item.sponsor_id === sponsorId);
  } catch (error) {
    console.error(`獲取購物車項目錯誤，贊助商ID ${sponsorId}:`, error);
    throw error;
  }
};

// Add item to cart
export const addToCart = async (sponsorId: string, sponsorshipPlanId: string): Promise<CartItem> => {
  try {
    await delay(500);
    
    // 從本地存儲獲取當前購物車
    const currentCart = getFromLocalStorage<CartItem[]>(CART_STORAGE_KEY, []);
    
    // 檢查項目是否已在購物車中
    const existingItem = currentCart.find(
      (item) => 
        item.sponsor_id === sponsorId && 
        item.sponsorship_plan_id === sponsorshipPlanId &&
        item.status === CartItemStatus.PENDING
    );
    
    if (existingItem) {
      console.log("項目已存在於購物車:", existingItem);
      return existingItem;
    }
    
    // 生成新項目
    const newItemId = `cart-${Date.now()}`;
    const newCartItem: CartItem = {
      id: newItemId,
      sponsor_id: sponsorId,
      sponsorship_plan_id: sponsorshipPlanId,
      status: CartItemStatus.PENDING,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // 添加到購物車
    const updatedCart = [...currentCart, newCartItem];
    
    // 保存到本地存儲
    saveToLocalStorage(CART_STORAGE_KEY, updatedCart);
    
    // 觸發購物車更新事件
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('cartUpdate'));
    }
    
    console.log("購物車項目添加成功:", newCartItem);
    
    return newCartItem;
  } catch (error) {
    console.error("添加到購物車錯誤:", error);
    throw error;
  }
};

// Remove item from cart
export const removeFromCart = async (itemId: string): Promise<boolean> => {
  try {
    await delay(300);
    
    // 從本地存儲獲取當前購物車
    const currentCart = getFromLocalStorage<CartItem[]>(CART_STORAGE_KEY, []);
    
    // 查找項目索引
    const itemIndex = currentCart.findIndex((item) => item.id === itemId);
    
    if (itemIndex === -1) {
      throw new Error("未找到購物車項目");
    }
    
    // 從購物車中移除
    const updatedCart = [...currentCart];
    updatedCart.splice(itemIndex, 1);
    
    // 保存到本地存儲
    saveToLocalStorage(CART_STORAGE_KEY, updatedCart);
    
    // 觸發購物車更新事件
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('cartUpdate'));
    }
    
    console.log("購物車項目移除成功:", itemId);
    
    return true;
  } catch (error) {
    console.error(`移除購物車項目 ${itemId} 錯誤:`, error);
    throw error;
  }
};

// Checkout (confirm all items in cart)
export const checkout = async (sponsorId: string, paymentDetails: { amount: number }): Promise<CheckoutResult> => {
  try {
    await delay(1500);
    
    // 從本地存儲獲取當前購物車
    const currentCart = getFromLocalStorage<CartItem[]>(CART_STORAGE_KEY, []);
    
    // 獲取待確認的購物車項目
    const sponsorItems = currentCart.filter(
      (item) => item.sponsor_id === sponsorId && item.status === CartItemStatus.PENDING
    );
    
    console.log(`準備結帳，用戶ID: ${sponsorId}，待確認項目數量: ${sponsorItems.length}`);
    
    if (sponsorItems.length === 0) {
      throw new Error("購物車中沒有項目");
    }
    
    // 更新項目狀態為已確認
    const updatedCart = currentCart.map((item) => {
      if (item.sponsor_id === sponsorId && item.status === CartItemStatus.PENDING) {
        return {
          ...item,
          status: CartItemStatus.CONFIRMED,
          updated_at: new Date().toISOString()
        };
      }
      return item;
    });
    
    // 保存到本地存儲
    saveToLocalStorage(CART_STORAGE_KEY, updatedCart);
    
    // 創建結帳結果
    const result: CheckoutResult = {
      success: true,
      confirmed_items: sponsorItems.length,
      order_id: `order-${Date.now()}`,
      total_amount: paymentDetails.amount
    };
    
    console.log("結帳完成，結果:", result);
    
    // 觸發購物車更新事件
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('cartUpdate'));
    }
    
    return result;
  } catch (error) {
    console.error(`結帳錯誤，用戶ID ${sponsorId}:`, error);
    throw error;
  }
};

// Get sponsorships (confirmed cart items)
export const getSponsorships = async (sponsorId: string): Promise<CartItem[]> => {
  try {
    await delay(400);
    
    // 從本地存儲獲取當前購物車
    const currentCart = getFromLocalStorage<CartItem[]>(CART_STORAGE_KEY, []);
    
    // 合併模擬數據和本地數據
    const combinedItems = [...mockCartItems, ...currentCart].filter(
      (item, index, self) => 
        // 去除重複項目（基於ID）
        index === self.findIndex(i => i.id === item.id)
    );
    
    // 篩選出已確認的贊助項目
    const sponsorships = combinedItems.filter(
      item => item.sponsor_id === sponsorId && item.status === CartItemStatus.CONFIRMED
    );
    
    return sponsorships;
  } catch (error) {
    console.error(`獲取已確認贊助項目錯誤，贊助商ID ${sponsorId}:`, error);
    throw error;
  }
};

// Schedule a meeting
export const scheduleMeeting = async (
  sponsorId: string,
  organizerId: string,
  eventId: string,
  meetingData: MeetingData
): Promise<Meeting> => {
  try {
    await delay(600);
    
    const newMeeting: Meeting = {
      id: generateId('meeting'),
      sponsor_id: sponsorId,
      organizer_id: organizerId,
      event_id: eventId,
      title: meetingData.title || "Sponsorship Discussion",
      description: meetingData.description || "",
      proposed_times: meetingData.proposed_times,
      confirmed_time: null,
      status: MeetingStatus.REQUESTED,
      meeting_link: null,
      created_at: getCurrentISOString(),
      updated_at: getCurrentISOString()
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
    return mockMeetings.filter(meeting => meeting.sponsor_id === sponsorId);
  } catch (error) {
    console.error(`Error getting meetings for sponsor ID ${sponsorId}:`, error);
    throw error;
  }
};

// Get meetings for organizer
export const getOrganizerMeetings = async (organizerId: string): Promise<Meeting[]> => {
  try {
    await delay(500);
    return mockMeetings.filter(meeting => meeting.organizer_id === organizerId);
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
    
    mockMeetings[meetingIndex] = {
      ...mockMeetings[meetingIndex],
      status: MeetingStatus.CONFIRMED,
      confirmed_time: confirmedTime,
      meeting_link: meetingLink,
      updated_at: getCurrentISOString()
    };
    
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
    
    mockMeetings[meetingIndex] = {
      ...mockMeetings[meetingIndex],
      status: MeetingStatus.CANCELLED,
      updated_at: getCurrentISOString()
    };
    
    return mockMeetings[meetingIndex];
  } catch (error) {
    console.error(`Error cancelling meeting with ID ${meetingId}:`, error);
    throw error;
  }
};
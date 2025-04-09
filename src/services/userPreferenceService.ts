import { 
  SavedItem, 
  SavedItemType, 
  Subscription, 
  CollectionType, 
  NotificationFrequency,
  NotificationDetailLevel,
  Notification,
  ComparisonResult,
  CustomCollection
} from '@/types/userPreferences';

// 模擬的延遲函數，用於模擬API調用
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// 本地存儲鍵
const SAVED_ITEMS_KEY = 'sponlink_saved_items';
const SUBSCRIPTIONS_KEY = 'sponlink_subscriptions';
const NOTIFICATIONS_KEY = 'sponlink_notifications';
const COMPARISON_RESULTS_KEY = 'sponlink_comparison_results';
const CUSTOM_COLLECTIONS_KEY = 'sponlink_custom_collections';

// 從本地存儲獲取數據的工具函數
const getFromLocalStorage = <T>(key: string, defaultValue: T): T => {
  if (typeof window === 'undefined') return defaultValue;
  
  try {
    const storedValue = localStorage.getItem(key);
    if (storedValue === null) return defaultValue;
    return JSON.parse(storedValue) as T;
  } catch (error) {
    console.error(`Error retrieving ${key} from localStorage:`, error);
    return defaultValue;
  }
};

// 保存數據到本地存儲的工具函數
const saveToLocalStorage = <T>(key: string, value: T): void => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error);
  }
};

// 模擬數據
const mockSavedItems: SavedItem[] = [];
const mockSubscriptions: Subscription[] = [];
const mockNotifications: Notification[] = [];
const mockComparisonResults: ComparisonResult[] = [];
const mockCustomCollections: CustomCollection[] = [];

/**
 * 獲取用戶已收藏的項目
 * @param userId 用戶ID
 * @param itemType 可選的項目類型過濾器
 * @returns 收藏項目列表
 */
export const getSavedItems = async (
  userId: string, 
  itemType?: SavedItemType
): Promise<SavedItem[]> => {
  try {
    await delay(400); // 模擬網絡延遲
    
    // 從本地存儲獲取數據
    const storedItems = getFromLocalStorage<SavedItem[]>(SAVED_ITEMS_KEY, []);
    
    // 合併模擬數據和存儲數據，並移除重複項
    const allItems = [...mockSavedItems, ...storedItems].filter(
      (item, index, self) => index === self.findIndex(i => i.id === item.id)
    );
    
    // 過濾屬於指定用戶的項目
    let userItems = allItems.filter(item => item.user_id === userId);
    
    // 如果指定了類型，進一步過濾
    if (itemType) {
      userItems = userItems.filter(item => item.item_type === itemType);
    }
    
    return userItems;
  } catch (error) {
    console.error('獲取收藏項目錯誤:', error);
    throw error;
  }
};

/**
 * 保存項目到收藏夾
 * @param userId 用戶ID
 * @param itemId 項目ID
 * @param itemType 項目類型
 * @param metadata 項目元數據
 * @returns 新創建的收藏項目
 */
export const saveItem = async (
  userId: string, 
  itemId: string, 
  itemType: SavedItemType,
  metadata: {
    title: string;
    thumbnail?: string;
    date?: string;
  }
): Promise<SavedItem> => {
  try {
    await delay(500); // 模擬網絡延遲
    
    // 從本地存儲獲取現有項目
    const existingItems = getFromLocalStorage<SavedItem[]>(SAVED_ITEMS_KEY, []);
    
    // 檢查是否已經保存了該項目
    const isAlreadySaved = existingItems.some(
      item => item.user_id === userId && 
              item.item_id === itemId && 
              item.item_type === itemType
    );
    
    if (isAlreadySaved) {
      throw new Error('此項目已收藏');
    }
    
    // 創建新的收藏項目
    const newSavedItem: SavedItem = {
      id: `saved-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      user_id: userId,
      item_id: itemId,
      item_type: itemType,
      metadata,
      saved_at: new Date().toISOString()
    };
    
    // 更新本地存儲
    const updatedItems = [...existingItems, newSavedItem];
    saveToLocalStorage(SAVED_ITEMS_KEY, updatedItems);
    
    // 觸發更新事件
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('savedItemsUpdate'));
    }
    
    return newSavedItem;
  } catch (error) {
    console.error('保存項目錯誤:', error);
    throw error;
  }
};

/**
 * 從收藏夾中移除項目
 * @param userId 用戶ID
 * @param itemId 項目ID
 * @param itemType 項目類型
 * @returns 操作是否成功
 */
export const removeSavedItem = async (
  userId: string, 
  itemId: string,
  itemType?: SavedItemType
): Promise<boolean> => {
  try {
    await delay(300); // 模擬網絡延遲
    
    // 從本地存儲獲取現有項目
    const existingItems = getFromLocalStorage<SavedItem[]>(SAVED_ITEMS_KEY, []);
    
    // 過濾需要移除的項目
    let updatedItems;
    if (itemType) {
      // 如果指定了類型，則只移除對應類型的項目
      updatedItems = existingItems.filter(
        item => !(item.user_id === userId && 
                  item.item_id === itemId && 
                  item.item_type === itemType)
      );
    } else {
      // 如果沒有指定類型，則移除所有匹配的項目ID
      updatedItems = existingItems.filter(
        item => !(item.user_id === userId && item.item_id === itemId)
      );
    }
    
    // 檢查是否移除了任何項目
    if (existingItems.length === updatedItems.length) {
      return false; // 沒有移除任何項目
    }
    
    // 更新本地存儲
    saveToLocalStorage(SAVED_ITEMS_KEY, updatedItems);
    
    // 觸發更新事件
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('savedItemsUpdate'));
    }
    
    return true;
  } catch (error) {
    console.error('移除收藏項目錯誤:', error);
    throw error;
  }
};

/**
 * 檢查項目是否已被收藏
 * @param userId 用戶ID
 * @param itemId 項目ID
 * @param itemType 項目類型
 * @returns 是否已被收藏
 */
export const isItemSaved = async (
  userId: string, 
  itemId: string, 
  itemType: SavedItemType
): Promise<boolean> => {
  try {
    // 獲取用戶已收藏的項目
    const savedItems = await getSavedItems(userId);
    
    // 檢查是否已收藏
    return savedItems.some(
      item => item.item_id === itemId && item.item_type === itemType
    );
  } catch (error) {
    console.error('檢查項目收藏狀態錯誤:', error);
    return false;
  }
};

/**
 * 保存比較結果
 * @param userId 用戶ID 
 * @param result 比較結果對象
 * @returns 保存的比較結果
 */
export const saveComparisonResult = async (
  userId: string,
  result: Omit<ComparisonResult, 'id' | 'created_at' | 'updated_at'>
): Promise<ComparisonResult> => {
  try {
    await delay(500); // 模擬網絡延遲
    
    // 獲取現有比較結果
    const existingResults = getFromLocalStorage<ComparisonResult[]>(COMPARISON_RESULTS_KEY, []);
    
    // 創建新比較結果
    const now = new Date().toISOString();
    const newResult: ComparisonResult = {
      id: `comparison-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...result,
      created_at: now,
      updated_at: now
    };
    
    // 更新存儲
    const updatedResults = [...existingResults, newResult];
    saveToLocalStorage(COMPARISON_RESULTS_KEY, updatedResults);
    
    // 同時保存到用戶的收藏
    await saveItem(
      userId,
      newResult.id,
      SavedItemType.COMPARISON_RESULT,
      {
        title: newResult.name,
        date: now
      }
    );
    
    return newResult;
  } catch (error) {
    console.error('保存比較結果錯誤:', error);
    throw error;
  }
};

/**
 * 獲取比較結果
 * @param resultId 比較結果ID
 * @returns 比較結果對象
 */
export const getComparisonResult = async (resultId: string): Promise<ComparisonResult | null> => {
  try {
    await delay(300); // 模擬網絡延遲
    
    // 獲取比較結果
    const results = getFromLocalStorage<ComparisonResult[]>(COMPARISON_RESULTS_KEY, []);
    const result = results.find(r => r.id === resultId);
    
    return result || null;
  } catch (error) {
    console.error('獲取比較結果錯誤:', error);
    return null;
  }
};

/**
 * 創建自定義集合
 * @param userId 用戶ID
 * @param name 集合名稱
 * @param description 集合描述
 * @param items 初始項目
 * @returns 創建的集合
 */
export const createCustomCollection = async (
  userId: string,
  name: string,
  description?: string,
  items: Array<{ type: SavedItemType, id: string }> = []
): Promise<CustomCollection> => {
  try {
    await delay(500); // 模擬網絡延遲
    
    // 獲取現有集合
    const existingCollections = getFromLocalStorage<CustomCollection[]>(CUSTOM_COLLECTIONS_KEY, []);
    
    // 檢查名稱重複
    const nameExists = existingCollections.some(
      c => c.name === name && userId === userId
    );
    
    if (nameExists) {
      throw new Error('此集合名稱已存在');
    }
    
    // 創建新集合
    const now = new Date().toISOString();
    const newCollection: CustomCollection = {
      id: `collection-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      description,
      items,
      created_at: now,
      updated_at: now
    };
    
    // 更新存儲
    const updatedCollections = [...existingCollections, newCollection];
    saveToLocalStorage(CUSTOM_COLLECTIONS_KEY, updatedCollections);
    
    // 同時保存到用戶的收藏
    await saveItem(
      userId,
      newCollection.id,
      SavedItemType.COLLECTION,
      {
        title: newCollection.name,
        date: now
      }
    );
    
    return newCollection;
  } catch (error) {
    console.error('創建自定義集合錯誤:', error);
    throw error;
  }
};

/**
 * 獲取用戶的自定義集合
 * @param userId 用戶ID
 * @returns 集合列表
 */
export const getUserCollections = async (userId: string): Promise<CustomCollection[]> => {
  try {
    await delay(300); // 模擬網絡延遲
    
    // 獲取所有集合
    const collections = getFromLocalStorage<CustomCollection[]>(CUSTOM_COLLECTIONS_KEY, []);
    
    // 從用戶收藏項目中過濾出集合類型
    const savedCollections = await getSavedItems(userId, SavedItemType.COLLECTION);
    const collectionIds = savedCollections.map(item => item.item_id);
    
    // 過濾出用戶的集合
    return collections.filter(collection => collectionIds.includes(collection.id));
  } catch (error) {
    console.error('獲取用戶集合錯誤:', error);
    return [];
  }
};

/**
 * 添加項目到集合
 * @param collectionId 集合ID
 * @param itemType 項目類型
 * @param itemId 項目ID
 * @returns 更新後的集合
 */
export const addItemToCollection = async (
  collectionId: string,
  itemType: SavedItemType,
  itemId: string
): Promise<CustomCollection> => {
  try {
    await delay(300); // 模擬網絡延遲
    
    // 獲取集合
    const collections = getFromLocalStorage<CustomCollection[]>(CUSTOM_COLLECTIONS_KEY, []);
    const collectionIndex = collections.findIndex(c => c.id === collectionId);
    
    if (collectionIndex === -1) {
      throw new Error('找不到指定集合');
    }
    
    // 創建集合副本
    const collection = { ...collections[collectionIndex] };
    
    // 檢查項目是否已存在
    const itemExists = collection.items.some(
      item => item.id === itemId && item.type === itemType
    );
    
    if (itemExists) {
      throw new Error('項目已存在於此集合');
    }
    
    // 添加項目
    collection.items.push({ type: itemType, id: itemId });
    collection.updated_at = new Date().toISOString();
    
    // 更新存儲
    const updatedCollections = [...collections];
    updatedCollections[collectionIndex] = collection;
    saveToLocalStorage(CUSTOM_COLLECTIONS_KEY, updatedCollections);
    
    return collection;
  } catch (error) {
    console.error('添加項目到集合錯誤:', error);
    throw error;
  }
};

/**
 * 從集合中移除項目
 * @param collectionId 集合ID
 * @param itemType 項目類型
 * @param itemId 項目ID
 * @returns 操作是否成功
 */
export const removeItemFromCollection = async (
  collectionId: string,
  itemType: SavedItemType,
  itemId: string
): Promise<boolean> => {
  try {
    await delay(300); // 模擬網絡延遲
    
    // 獲取集合
    const collections = getFromLocalStorage<CustomCollection[]>(CUSTOM_COLLECTIONS_KEY, []);
    const collectionIndex = collections.findIndex(c => c.id === collectionId);
    
    if (collectionIndex === -1) {
      return false;
    }
    
    // 創建集合副本
    const collection = { ...collections[collectionIndex] };
    
    // 過濾項目
    const originalItemCount = collection.items.length;
    collection.items = collection.items.filter(
      item => !(item.id === itemId && item.type === itemType)
    );
    
    // 檢查是否移除了任何項目
    if (collection.items.length === originalItemCount) {
      return false;
    }
    
    // 更新時間戳
    collection.updated_at = new Date().toISOString();
    
    // 更新存儲
    const updatedCollections = [...collections];
    updatedCollections[collectionIndex] = collection;
    saveToLocalStorage(CUSTOM_COLLECTIONS_KEY, updatedCollections);
    
    return true;
  } catch (error) {
    console.error('從集合移除項目錯誤:', error);
    return false;
  }
};

/**
 * 獲取用戶關注（原訂閱）
 * @param userId 用戶ID
 * @param collectionType 可選的集合類型過濾器
 * @returns 關注列表
 */
export const getSubscriptions = async (
  userId: string, 
  collectionType?: CollectionType
): Promise<Subscription[]> => {
  try {
    await delay(400); // 模擬網絡延遲
    
    // 從本地存儲獲取數據
    const storedSubscriptions = getFromLocalStorage<Subscription[]>(SUBSCRIPTIONS_KEY, []);
    
    // 合併模擬數據和存儲數據，並移除重複項
    const allSubscriptions = [...mockSubscriptions, ...storedSubscriptions].filter(
      (sub, index, self) => index === self.findIndex(s => s.id === sub.id)
    );
    
    // 過濾屬於指定用戶的訂閱
    let userSubscriptions = allSubscriptions.filter(sub => sub.user_id === userId);
    
    // 如果指定了目標類型，進一步過濾
    if (collectionType) {
      userSubscriptions = userSubscriptions.filter(sub => sub.collection_type === collectionType);
    }
    
    return userSubscriptions;
  } catch (error) {
    console.error('獲取關注錯誤:', error);
    throw error;
  }
};

/**
 * 創建新關注
 * @param userId 用戶ID
 * @param collectionId 集合ID
 * @param collectionType 集合類型
 * @param options 關注選項
 * @returns 新創建的關注
 */
export const createSubscription = async (
  userId: string, 
  collectionId: string, 
  collectionType: CollectionType,
  options: {
    frequency?: NotificationFrequency;
    emailEnabled?: boolean;
    browserEnabled?: boolean;
    inAppEnabled?: boolean;
    contentLevel?: NotificationDetailLevel;
  } = {}
): Promise<Subscription> => {
  try {
    await delay(500); // 模擬網絡延遲
    
    // 從本地存儲獲取現有訂閱
    const existingSubscriptions = getFromLocalStorage<Subscription[]>(SUBSCRIPTIONS_KEY, []);
    
    // 檢查是否已經訂閱了該目標
    const isAlreadySubscribed = existingSubscriptions.some(
      sub => sub.user_id === userId && 
             sub.collection_id === collectionId && 
             sub.collection_type === collectionType
    );
    
    if (isAlreadySubscribed) {
      throw new Error('已關注此項目');
    }
    
    // 解析選項，使用默認值
    const {
      frequency = NotificationFrequency.IMMEDIATELY,
      emailEnabled = true,
      browserEnabled = true,
      inAppEnabled = true,
      contentLevel = NotificationDetailLevel.DETAILED
    } = options;
    
    // 創建新訂閱
    const now = new Date().toISOString();
    const newSubscription: Subscription = {
      id: `subscription-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      user_id: userId,
      collection_id: collectionId,
      collection_type: collectionType,
      notification_settings: {
        frequency,
        channels: {
          email: emailEnabled,
          browser: browserEnabled,
          in_app: inAppEnabled
        },
        content_level: contentLevel
      },
      created_at: now,
      updated_at: now
    };
    
    // 更新本地存儲
    const updatedSubscriptions = [...existingSubscriptions, newSubscription];
    saveToLocalStorage(SUBSCRIPTIONS_KEY, updatedSubscriptions);
    
    // 觸發更新事件
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('subscriptionsUpdate'));
    }
    
    return newSubscription;
  } catch (error) {
    console.error('創建關注錯誤:', error);
    throw error;
  }
};

/**
 * 更新現有關注
 * @param subscriptionId 關注ID
 * @param updates 要更新的數據
 * @returns 更新後的關注
 */
export const updateSubscription = async (
  subscriptionId: string,
  updates: Partial<{
    notification_settings: Partial<{
      frequency: NotificationFrequency;
      channels: Partial<{
        email: boolean;
        browser: boolean;
        in_app: boolean;
      }>;
      content_level: NotificationDetailLevel;
    }>;
  }>
): Promise<Subscription> => {
  try {
    await delay(400); // 模擬網絡延遲
    
    // 從本地存儲獲取現有訂閱
    const existingSubscriptions = getFromLocalStorage<Subscription[]>(SUBSCRIPTIONS_KEY, []);
    
    // 查找要更新的訂閱的索引
    const subscriptionIndex = existingSubscriptions.findIndex(sub => sub.id === subscriptionId);
    
    if (subscriptionIndex === -1) {
      throw new Error('未找到要更新的關注');
    }
    
    // 獲取現有訂閱
    const existingSubscription = existingSubscriptions[subscriptionIndex];
    
    // 創建更新後的訂閱
    const updatedSubscription: Subscription = {
      ...existingSubscription,
      notification_settings: {
        ...existingSubscription.notification_settings,
        ...updates.notification_settings,
        channels: {
          ...existingSubscription.notification_settings.channels,
          ...updates.notification_settings?.channels
        }
      },
      updated_at: new Date().toISOString()
    };
    
    // 更新本地存儲
    const updatedSubscriptions = [...existingSubscriptions];
    updatedSubscriptions[subscriptionIndex] = updatedSubscription;
    saveToLocalStorage(SUBSCRIPTIONS_KEY, updatedSubscriptions);
    
    // 觸發更新事件
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('subscriptionsUpdate'));
    }
    
    return updatedSubscription;
  } catch (error) {
    console.error('更新關注錯誤:', error);
    throw error;
  }
};

/**
 * 取消關注
 * @param subscriptionId 關注ID
 * @returns 操作是否成功
 */
export const cancelSubscription = async (subscriptionId: string): Promise<boolean> => {
  try {
    await delay(300); // 模擬網絡延遲
    
    // 從本地存儲獲取現有訂閱
    const existingSubscriptions = getFromLocalStorage<Subscription[]>(SUBSCRIPTIONS_KEY, []);
    
    // 過濾要取消的訂閱
    const updatedSubscriptions = existingSubscriptions.filter(sub => sub.id !== subscriptionId);
    
    // 檢查是否移除了任何訂閱
    if (existingSubscriptions.length === updatedSubscriptions.length) {
      return false; // 沒有移除任何訂閱
    }
    
    // 更新本地存儲
    saveToLocalStorage(SUBSCRIPTIONS_KEY, updatedSubscriptions);
    
    // 觸發更新事件
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('subscriptionsUpdate'));
    }
    
    return true;
  } catch (error) {
    console.error('取消關注錯誤:', error);
    throw error;
  }
};

/**
 * 檢查用戶是否已關注項目
 * @param userId 用戶ID
 * @param collectionId 集合ID
 * @param collectionType 集合類型
 * @returns 是否已關注
 */
export const isSubscribed = async (
  userId: string, 
  collectionId: string, 
  collectionType: CollectionType
): Promise<boolean> => {
  try {
    // 獲取用戶訂閱
    const subscriptions = await getSubscriptions(userId);
    
    // 檢查是否已訂閱
    return subscriptions.some(
      sub => sub.collection_id === collectionId && sub.collection_type === collectionType
    );
  } catch (error) {
    console.error('檢查關注狀態錯誤:', error);
    return false;
  }
};

/**
 * 獲取用戶通知
 * @param userId 用戶ID
 * @param options 可選的過濾和分頁選項
 * @returns 通知列表
 */
export const getNotifications = async (
  userId: string,
  options: {
    unreadOnly?: boolean;
    limit?: number;
    offset?: number;
  } = {}
): Promise<Notification[]> => {
  try {
    await delay(300); // 模擬網絡延遲
    
    // 從本地存儲獲取通知
    const notifications = getFromLocalStorage<Notification[]>(NOTIFICATIONS_KEY, []);
    
    // 過濾屬於指定用戶的通知
    let userNotifications = notifications.filter(notification => notification.user_id === userId);
    
    // 如果只需未讀通知
    if (options.unreadOnly) {
      userNotifications = userNotifications.filter(notification => !notification.read);
    }
    
    // 排序：最新的在前面
    userNotifications.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    
    // 應用分頁
    if (options.limit !== undefined) {
      const offset = options.offset || 0;
      userNotifications = userNotifications.slice(offset, offset + options.limit);
    }
    
    return userNotifications;
  } catch (error) {
    console.error('獲取通知錯誤:', error);
    throw error;
  }
};

/**
 * 將通知標記為已讀
 * @param notificationId 通知ID
 * @returns 操作是否成功
 */
export const markNotificationAsRead = async (notificationId: string): Promise<boolean> => {
  try {
    await delay(200); // 模擬網絡延遲
    
    // 從本地存儲獲取通知
    const notifications = getFromLocalStorage<Notification[]>(NOTIFICATIONS_KEY, []);
    
    // 查找要更新的通知
    const notificationIndex = notifications.findIndex(n => n.id === notificationId);
    
    if (notificationIndex === -1) {
      return false; // 通知不存在
    }
    
    // 更新通知
    notifications[notificationIndex] = {
      ...notifications[notificationIndex],
      read: true
    };
    
    // 保存回本地存儲
    saveToLocalStorage(NOTIFICATIONS_KEY, notifications);
    
    // 觸發更新事件
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('notificationsUpdate'));
    }
    
    return true;
  } catch (error) {
    console.error('將通知標記為已讀錯誤:', error);
    return false;
  }
};

/**
 * 將所有通知標記為已讀
 * @param userId 用戶ID
 * @returns 操作是否成功
 */
export const markAllNotificationsAsRead = async (userId: string): Promise<boolean> => {
  try {
    await delay(300); // 模擬網絡延遲
    
    // 從本地存儲獲取通知
    const notifications = getFromLocalStorage<Notification[]>(NOTIFICATIONS_KEY, []);
    
    // 更新通知
    const updatedNotifications = notifications.map(notification => {
      if (notification.user_id === userId && !notification.read) {
        return { ...notification, read: true };
      }
      return notification;
    });
    
    // 保存回本地存儲
    saveToLocalStorage(NOTIFICATIONS_KEY, updatedNotifications);
    
    // 觸發更新事件
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('notificationsUpdate'));
    }
    
    return true;
  } catch (error) {
    console.error('將所有通知標記為已讀錯誤:', error);
    return false;
  }
}; 
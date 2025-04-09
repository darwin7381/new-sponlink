/**
 * 用戶偏好相關類型定義
 * 包括收藏（Save）和關注（Follow，原訂閱）功能的相關類型
 */

/**
 * 收藏項目類型枚舉
 */
export enum SavedItemType {
  EVENT = 'event',                        // 活動
  SPONSORSHIP_PLAN = 'sponsorship_plan',  // 贊助方案
  ORGANIZER = 'organizer',                // 主辦方
  COMPARISON_RESULT = 'comparison_result', // 比較結果
  COLLECTION = 'collection',              // 自定義集合
  SEARCH_QUERY = 'search_query'           // 保存的搜索條件
}

/**
 * 集合類型枚舉（原訂閱目標類型）
 */
export enum CollectionType {
  ORGANIZER = 'organizer',                // 主辦方
  CATEGORY = 'category',                  // 活動類別
  LOCATION = 'location',                  // 地區
  EVENT_SERIES = 'event_series',          // 活動系列
  CUSTOM_COLLECTION = 'custom_collection', // 自定義集合
  EVENT = 'event'                         // 單一活動更新
}

/**
 * 通知頻率枚舉
 */
export enum NotificationFrequency {
  IMMEDIATELY = 'immediately',            // 即時通知
  DAILY = 'daily',                        // 每日摘要
  WEEKLY = 'weekly'                       // 每週摘要
}

/**
 * 通知詳細程度枚舉
 */
export enum NotificationDetailLevel {
  BRIEF = 'brief',                        // 簡短提醒
  DETAILED = 'detailed',                  // 詳細信息
  CUSTOM = 'custom'                       // 自定義
}

/**
 * 收藏項目接口
 */
export interface SavedItem {
  id: string;                             // 唯一標識符
  user_id: string;                        // 用戶ID
  item_id: string;                        // 收藏項目ID
  item_type: SavedItemType;               // 收藏項目類型
  metadata: {                             // 元數據（便於顯示）
    title: string;
    thumbnail?: string;
    date?: string;
  };
  saved_at: string;                       // 收藏時間 (ISO格式)
}

/**
 * 比較結果接口
 */
export interface ComparisonResult {
  id: string;                             // 唯一標識符
  name: string;                           // 比較名稱
  items: Array<{                          // 比較項目
    type: string;                         // 項目類型
    id: string;                           // 項目ID
    metadata: Record<string, unknown>;        // 項目快照數據
  }>;
  comparison_criteria: string[];          // 比較標準
  created_at: string;                     // 創建時間
  updated_at: string;                     // 更新時間
}

/**
 * 自定義集合接口
 */
export interface CustomCollection {
  id: string;                             // 唯一標識符
  name: string;                           // 集合名稱
  description?: string;                   // 集合描述
  items: Array<{                          // 集合項目
    type: SavedItemType;                  // 項目類型
    id: string;                           // 項目ID
  }>;
  created_at: string;                     // 創建時間
  updated_at: string;                     // 更新時間
}

/**
 * 關注（原訂閱）接口
 */
export interface Subscription {
  id: string;                             // 唯一標識符
  user_id: string;                        // 用戶ID
  collection_type: CollectionType;        // 集合類型
  collection_id: string;                  // 集合ID
  notification_settings: {
    frequency: NotificationFrequency;     // 通知頻率
    channels: {                           // 通知管道
      email: boolean;
      browser: boolean;
      in_app: boolean;
    };
    content_level: NotificationDetailLevel; // 通知詳細程度
  };
  created_at: string;                     // 訂閱創建時間 (ISO格式)
  updated_at: string;                     // 訂閱更新時間 (ISO格式)
  last_notification_at?: string;          // 上次通知時間 (ISO格式)
}

/**
 * 通知接口
 */
export interface Notification {
  id: string;                             // 唯一標識符
  user_id: string;                        // 目標用戶ID
  subscription_id?: string;               // 相關訂閱ID（如果適用）
  title: string;                          // 通知標題
  content: string;                        // 通知內容
  link?: string;                          // 相關連結
  read: boolean;                          // 是否已讀
  created_at: string;                     // 創建時間 (ISO格式)
}

/**
 * 用戶偏好設置接口
 */
export interface UserPreferences {
  user_id: string;                        // 用戶ID
  notification_preferences: {
    email_notifications: boolean;         // 是否啟用郵件通知
    browser_notifications: boolean;       // 是否啟用瀏覽器通知
    in_app_notifications: boolean;        // 是否啟用應用內通知
    default_frequency: NotificationFrequency; // 默認通知頻率
  };
  created_at: string;                     // 創建時間 (ISO格式)
  updated_at: string;                     // 更新時間 (ISO格式)
} 
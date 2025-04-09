import { pgTable, text, varchar, timestamp, boolean } from 'drizzle-orm/pg-core';
import { USER_ROLES } from '@/lib/types/users';

/**
 * 用戶表：核心用戶資訊
 */
export const users = pgTable('users', {
  // 基本資訊
  id: varchar('id', { length: 255 }).primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: text('name'),
  image: text('image'),
  
  // 認證資訊
  emailVerified: timestamp('email_verified', { mode: 'date' }),
  password: text('password_hash'),
  
  // 用戶設置
  role: varchar('role', { length: 50 }).$type<USER_ROLES>(),
  preferred_language: varchar('preferred_language', { length: 10 }).default('en'),
  
  // 多租戶支持
  activity_id: varchar('activity_id', { length: 255 }),
  
  // 時間戳
  created_at: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  updated_at: timestamp('updated_at', { mode: 'date' }).defaultNow().notNull(),
});

/**
 * 用戶個人資料表：擴展用戶信息
 */
export const userProfiles = pgTable('user_profiles', {
  // 關聯
  user_id: varchar('user_id', { length: 255 })
    .primaryKey()
    .references(() => users.id, { onDelete: 'cascade' }),
  
  // 基本資料
  bio: text('bio'),
  contact_info: text('contact_info'),
  
  // 特定角色資料 (JSON 格式以支持靈活擴展)
  profile_data: text('profile_data'), // JSON 存储
  
  // 多租戶支持
  activity_id: varchar('activity_id', { length: 255 }),
  
  // 時間戳
  updated_at: timestamp('updated_at', { mode: 'date' }).defaultNow().notNull(),
});

/**
 * 用戶設置表
 */
export const userSettings = pgTable('user_settings', {
  // 關聯
  user_id: varchar('user_id', { length: 255 })
    .primaryKey()
    .references(() => users.id, { onDelete: 'cascade' }),
  
  // 通知設置
  email_notifications: boolean('email_notifications').default(true),
  browser_notifications: boolean('browser_notifications').default(true),
  in_app_notifications: boolean('in_app_notifications').default(true),
  notification_frequency: varchar('notification_frequency', { length: 20 }).default('immediately'),
  
  // 主題設置
  theme: varchar('theme', { length: 20 }).default('system'),
  
  // 多租戶支持
  activity_id: varchar('activity_id', { length: 255 }),
  
  // 時間戳
  updated_at: timestamp('updated_at', { mode: 'date' }).defaultNow().notNull(),
}); 
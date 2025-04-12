import { pgTable, text, varchar, timestamp, boolean, integer, json, foreignKey } from 'drizzle-orm/pg-core';
import { SystemRole } from '@/lib/types/users';

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
  systemRole: varchar('system_role', { length: 20 }).$type<SystemRole>().default(SystemRole.USER),
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
  avatar_url: text('avatar_url'),
  
  // 多租戶支持
  activity_id: varchar('activity_id', { length: 255 }),
  
  // 時間戳
  updated_at: timestamp('updated_at', { mode: 'date' }).defaultNow().notNull(),
});

/**
 * 用戶統計數據表：替代原先JSON中的statistics
 */
export const userStatistics = pgTable('user_statistics', {
  // 關聯
  user_id: varchar('user_id', { length: 255 })
    .primaryKey()
    .references(() => users.id, { onDelete: 'cascade' }),
  
  // 活動統計
  total_events: integer('total_events').default(0),
  upcoming_events: integer('upcoming_events').default(0),
  average_attendees: integer('average_attendees').default(0),
  total_revenue: text('total_revenue').default('$0'),
  
  // 贊助統計
  total_sponsored: integer('total_sponsored').default(0),
  active_sponsorships: integer('active_sponsorships').default(0),
  total_investment: text('total_investment').default('$0'),
  average_roi: text('average_roi').default('0%'),
  
  // 多租戶支持
  activity_id: varchar('activity_id', { length: 255 }),
  
  // 時間戳
  updated_at: timestamp('updated_at', { mode: 'date' }).defaultNow().notNull(),
});

/**
 * 組織信息表：針對贊助商組織
 */
export const organizationProfiles = pgTable('organization_profiles', {
  // 關聯 - 組織所有者
  user_id: varchar('user_id', { length: 255 })
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  
  // 組織信息
  id: varchar('id', { length: 255 }).primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  logo_url: text('logo_url'),
  website: text('website'),
  
  // 多租戶支持
  activity_id: varchar('activity_id', { length: 255 }),
  
  // 時間戳
  created_at: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
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
import { pgTable, text, varchar, timestamp, boolean, jsonb } from 'drizzle-orm/pg-core';
import { users } from './users';

/**
 * 活動表
 */
export const events = pgTable('events', {
  // 基本資訊
  id: varchar('id', { length: 255 }).primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  image_url: text('image_url'),
  
  // 時間和地點
  start_date: timestamp('start_date', { mode: 'date' }).notNull(),
  end_date: timestamp('end_date', { mode: 'date' }).notNull(),
  location: text('location'),
  location_data: jsonb('location_data'), // 存儲詳細地理位置資訊
  
  // 狀態和可見性
  status: varchar('status', { length: 50 }).default('draft'),
  is_public: boolean('is_public').default(true),
  
  // 關聯
  organizer_id: varchar('organizer_id', { length: 255 })
    .references(() => users.id),
  
  // 多租戶支持
  activity_id: varchar('activity_id', { length: 255 }).notNull(),
  
  // 時間戳
  created_at: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  updated_at: timestamp('updated_at', { mode: 'date' }).defaultNow().notNull(),
}); 
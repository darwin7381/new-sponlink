import { pgTable, text, varchar, timestamp, integer, boolean, jsonb } from 'drizzle-orm/pg-core';
import { events } from './events';

/**
 * 贊助計劃表
 */
export const sponsorshipPlans = pgTable('sponsorship_plans', {
  // 基本資訊
  id: varchar('id', { length: 255 }).primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  price: integer('price').notNull(),
  
  // 贊助內容和優勢
  benefits: jsonb('benefits'), // 字符串數組格式的 JSON
  max_sponsors: integer('max_sponsors'),
  current_sponsors: integer('current_sponsors').default(0),
  
  // 關聯
  event_id: varchar('event_id', { length: 255 })
    .references(() => events.id, { onDelete: 'cascade' })
    .notNull(),
  
  // 多租戶支持
  activity_id: varchar('activity_id', { length: 255 }).notNull(),
  
  // 時間戳
  created_at: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  updated_at: timestamp('updated_at', { mode: 'date' }).defaultNow().notNull(),
}); 
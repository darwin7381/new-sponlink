import { pgTable, varchar, timestamp, primaryKey } from 'drizzle-orm/pg-core';
import { users } from './users';
import { events } from './events';

/**
 * 用戶收藏活動表
 */
export const savedEvents = pgTable('saved_events', {
  // 關聯
  user_id: varchar('user_id', { length: 255 })
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  event_id: varchar('event_id', { length: 255 })
    .notNull()
    .references(() => events.id, { onDelete: 'cascade' }),
  
  // 元數據 (用於列表顯示，無需另外查詢)
  metadata: varchar('metadata', { length: 2000 }),
  
  // 多租戶支持
  activity_id: varchar('activity_id', { length: 255 }),
  
  // 時間戳
  created_at: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
}, (table) => {
  return {
    // 複合主鍵
    pk: primaryKey({ columns: [table.user_id, table.event_id] }),
  };
}); 
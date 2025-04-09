/**
 * 與資料庫交互的用戶服務，可逐步替代模擬數據
 */
import { db } from '@/db';
import { users, userProfiles, userSettings } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { USER_ROLES } from '@/lib/types/users';

/**
 * 根據ID獲取用戶
 */
export async function getUserById(userId: string) {
  try {
    const result = await db.select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    
    return result[0] || null;
  } catch (error) {
    console.error('獲取用戶錯誤:', error);
    throw error;
  }
}

/**
 * 根據電子郵件獲取用戶
 */
export async function getUserByEmail(email: string) {
  try {
    const result = await db.select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    
    return result[0] || null;
  } catch (error) {
    console.error('獲取用戶錯誤:', error);
    throw error;
  }
}

/**
 * 創建新用戶
 */
export async function createUser(userData: {
  id: string;
  email: string;
  name?: string;
  role: USER_ROLES;
  preferred_language?: string;
  image?: string;
  activity_id?: string;
}) {
  try {
    const [user] = await db.insert(users)
      .values(userData)
      .returning();
    
    return user;
  } catch (error) {
    console.error('創建用戶錯誤:', error);
    throw error;
  }
}

/**
 * 更新用戶資料
 */
export async function updateUser(userId: string, userData: Partial<typeof users.$inferInsert>) {
  try {
    const [updatedUser] = await db.update(users)
      .set(userData)
      .where(eq(users.id, userId))
      .returning();
    
    return updatedUser;
  } catch (error) {
    console.error('更新用戶錯誤:', error);
    throw error;
  }
}

/**
 * 創建用戶設置
 */
export async function createUserSettings(userId: string, settingsData: Partial<typeof userSettings.$inferInsert> = {}) {
  try {
    const [settings] = await db.insert(userSettings)
      .values({
        user_id: userId,
        ...settingsData
      })
      .returning();
    
    return settings;
  } catch (error) {
    console.error('創建用戶設置錯誤:', error);
    throw error;
  }
}

/**
 * 獲取用戶設置
 */
export async function getUserSettings(userId: string) {
  try {
    const result = await db.select()
      .from(userSettings)
      .where(eq(userSettings.user_id, userId))
      .limit(1);
    
    return result[0] || null;
  } catch (error) {
    console.error('獲取用戶設置錯誤:', error);
    throw error;
  }
}

/**
 * 創建用戶個人資料
 */
export async function createUserProfile(userId: string, profileData: Partial<typeof userProfiles.$inferInsert> = {}) {
  try {
    const [profile] = await db.insert(userProfiles)
      .values({
        user_id: userId,
        ...profileData
      })
      .returning();
    
    return profile;
  } catch (error) {
    console.error('創建用戶個人資料錯誤:', error);
    throw error;
  }
}

/**
 * 獲取用戶個人資料
 */
export async function getUserProfile(userId: string) {
  try {
    const result = await db.select()
      .from(userProfiles)
      .where(eq(userProfiles.user_id, userId))
      .limit(1);
    
    return result[0] || null;
  } catch (error) {
    console.error('獲取用戶個人資料錯誤:', error);
    throw error;
  }
} 
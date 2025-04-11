/**
 * 與資料庫交互的用戶服務，可逐步替代模擬數據
 */
import { db } from '@/db';
import { users, userProfiles, userSettings } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { SystemRole } from '@/lib/types/users';

/**
 * 根據ID獲取用戶
 */
export async function getUserById(userId: string) {
  try {
    console.log(`[dbUserService] 嘗試查詢用戶，ID=${userId}，類型=${typeof userId}`);
    
    // 確保 ID 是字符串類型
    const idToUse = String(userId).trim();
    console.log(`[dbUserService] 格式化後的 ID=${idToUse}，長度=${idToUse.length}`);
    
    // 執行查詢
    const result = await db.select()
      .from(users)
      .where(eq(users.id, idToUse))
      .limit(1);
    
    console.log(`[dbUserService] 查詢結果: ${result.length ? '找到用戶' : '未找到用戶'}`);
    if (result.length) {
      console.log(`[dbUserService] 用戶ID=${result[0].id}, 郵箱=${result[0].email}`);
    } else {
      // 如果找不到用戶，嘗試輸出所有用戶的 ID 列表以進行調試
      const allUsers = await db.select({ id: users.id, email: users.email })
        .from(users)
        .limit(10);
      
      console.log(`[dbUserService] 系統中的用戶列表 (最多10個):`);
      allUsers.forEach(u => console.log(`- ID: ${u.id}, 郵箱: ${u.email}`));
    }
    
    return result[0] || null;
  } catch (error) {
    console.error('[dbUserService] 獲取用戶錯誤:', error);
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
  systemRole?: SystemRole;
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
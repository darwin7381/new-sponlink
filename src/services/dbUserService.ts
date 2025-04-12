/**
 * 與資料庫交互的用戶服務，可逐步替代模擬數據
 */
import { db } from '@/db';
import { users, userProfiles, userSettings, userStatistics, organizationProfiles } from '@/db/schema';
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

/**
 * 更新用戶個人資料
 */
export async function updateUserProfile(userId: string, profileData: Partial<typeof userProfiles.$inferInsert>) {
  try {
    const [updatedProfile] = await db.update(userProfiles)
      .set(profileData)
      .where(eq(userProfiles.user_id, userId))
      .returning();
    
    return updatedProfile;
  } catch (error) {
    console.error('更新用戶個人資料錯誤:', error);
    throw error;
  }
}

/**
 * 獲取用戶統計數據
 */
export async function getUserStatistics(userId: string) {
  try {
    const result = await db.select()
      .from(userStatistics)
      .where(eq(userStatistics.user_id, userId))
      .limit(1);
    
    return result[0] || null;
  } catch (error) {
    console.error('獲取用戶統計數據錯誤:', error);
    throw error;
  }
}

/**
 * 創建或更新用戶統計數據
 */
export async function updateUserStatistics(userId: string, statsData: Partial<typeof userStatistics.$inferInsert>) {
  try {
    // 檢查是否存在
    const exists = await getUserStatistics(userId);
    
    if (exists) {
      // 更新現有記錄
      const [updated] = await db.update(userStatistics)
        .set(statsData)
        .where(eq(userStatistics.user_id, userId))
        .returning();
      
      return updated;
    } else {
      // 創建新記錄
      const [stats] = await db.insert(userStatistics)
        .values({
          user_id: userId,
          ...statsData
        })
        .returning();
      
      return stats;
    }
  } catch (error) {
    console.error('更新用戶統計數據錯誤:', error);
    throw error;
  }
}

/**
 * 根據用戶ID獲取組織資料
 */
export async function getOrganizationProfileByUserId(userId: string) {
  try {
    const result = await db.select()
      .from(organizationProfiles)
      .where(eq(organizationProfiles.user_id, userId))
      .limit(1);
    
    return result[0] || null;
  } catch (error) {
    console.error('獲取組織資料錯誤:', error);
    throw error;
  }
}

/**
 * 更新組織資料
 */
export async function updateOrganizationProfile(userId: string, orgData: Partial<Omit<typeof organizationProfiles.$inferInsert, 'id' | 'user_id'>>) {
  try {
    // 檢查是否存在
    const existing = await getOrganizationProfileByUserId(userId);
    
    if (existing) {
      // 更新現有記錄
      const [updated] = await db.update(organizationProfiles)
        .set(orgData)
        .where(eq(organizationProfiles.id, existing.id))
        .returning();
      
      return updated;
    } else {
      // 如果不存在，創建新記錄
      const { v4: uuidv4 } = await import('uuid');
      const [created] = await db.insert(organizationProfiles)
        .values({
          id: uuidv4(),
          user_id: userId,
          name: (orgData.name as string) || '未命名組織',
          description: orgData.description || null,
          logo_url: orgData.logo_url || null,
          website: orgData.website || null,
        })
        .returning();
      
      return created;
    }
  } catch (error) {
    console.error('更新組織資料錯誤:', error);
    throw error;
  }
}

/**
 * 獲取用戶的活動
 */
export async function getUserEvents(userId: string) {
  try {
    // 由於尚未實現實際的活動關係表，暫時返回空數組
    // 實際實現應該從 events 表中查詢屬於該用戶的活動
    return [];
  } catch (error) {
    console.error('獲取用戶活動錯誤:', error);
    return [];
  }
}

/**
 * 獲取用戶的贊助
 */
export async function getUserSponsorships(userId: string) {
  try {
    // 由於尚未實現實際的贊助關係表，暫時返回空數組
    // 實際實現應該從 sponsorships 表中查詢屬於該用戶的贊助
    return [];
  } catch (error) {
    console.error('獲取用戶贊助錯誤:', error);
    return [];
  }
} 
/**
 * 認證服務
 * 提供用戶認證相關功能
 */

import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { USER_ROLES } from '@/lib/types/users';
import { createPasswordHash, verifyPassword } from './passwordUtils';
import { v4 as uuidv4 } from 'uuid';
import { SystemRole } from '@/lib/types/users';

/**
 * 使用電子郵件查詢用戶
 * @param email 用戶電子郵件
 * @returns 用戶對象或null
 */
export async function findUserByEmail(email: string) {
  try {
    console.log(`[authService] 開始查詢用戶，郵箱: ${email}`);
    
    const result = await db.select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    
    console.log(`[authService] 查詢結果: ${result.length ? '找到用戶' : '未找到用戶'}`);
    
    if (result.length > 0) {
      const user = result[0];
      console.log(`[authService] 用戶詳情: ID=${user.id}, 郵箱=${user.email}`);
      
      // 不再需要測試帳號特殊處理，所有ID均為UUID格式
    }
    
    return result[0] || null;
  } catch (error) {
    console.error('[authService] 查詢用戶失敗:', error);
    return null;
  }
}

/**
 * 使用ID查詢用戶
 * @param userId 用戶ID
 * @returns 用戶對象或null
 */
export async function findUserById(userId: string) {
  try {
    const result = await db.select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    
    return result[0] || null;
  } catch (error) {
    console.error('查詢用戶失敗:', error);
    return null;
  }
}

/**
 * 驗證用戶憑證
 * @param email 電子郵件
 * @param password 密碼
 * @returns 驗證成功的用戶或null
 */
export async function verifyCredentials(email: string, password: string) {
  try {
    console.log(`[authService] 開始驗證用戶憑證: ${email}`);
    
    // 查找用戶
    const user = await findUserByEmail(email);
    
    // 用戶不存在或未設置密碼
    if (!user) {
      console.log(`[authService] 用戶不存在: ${email}`);
      return null;
    }
    
    if (!user.password) {
      console.log(`[authService] 用戶未設置密碼: ${email}`);
      return null;
    }
    
    console.log(`[authService] 找到用戶: ID=${user.id}, 郵箱=${user.email}`);
    
    // 驗證密碼
    const isPasswordValid = verifyPassword(password, user.password);
    console.log(`[authService] 密碼驗證結果: ${isPasswordValid ? '成功' : '失敗'}`);
    
    // 直接返回用戶對象，不做ID轉換
    return isPasswordValid ? user : null;
  } catch (error) {
    console.error('[authService] 憑證驗證失敗:', error);
    return null;
  }
}

/**
 * 創建新用戶
 * @param userData 用戶數據
 * @returns 創建的用戶
 */
export async function createUser({
  email,
  password,
  name,
  preferred_language = 'en'
}: {
  email: string;
  password: string;
  name?: string;
  preferred_language?: string;
}) {
  try {
    // 檢查郵箱是否已存在
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      throw new Error('電子郵件已被使用');
    }
    
    // 哈希密碼
    const passwordHash = createPasswordHash(password);
    
    // 創建用戶 - 不再設置角色屬性，符合身份系統整合方案
    const [user] = await db.insert(users)
      .values({
        id: uuidv4(),
        email,
        name,
        password: passwordHash,
        // 不再設置角色屬性
        systemRole: SystemRole.USER, // 默認系統角色為普通用戶
        preferred_language,
        created_at: new Date(),
        updated_at: new Date()
      })
      .returning();
    
    // 返回用戶數據(不含密碼)
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  } catch (error) {
    console.error('創建用戶失敗:', error);
    throw error;
  }
} 
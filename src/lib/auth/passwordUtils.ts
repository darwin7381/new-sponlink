/**
 * 密碼處理工具
 * 提供密碼加密和驗證功能
 */

import crypto from 'crypto';

/**
 * 生成隨機鹽值
 * @returns 16字節的隨機鹽值(Base64格式)
 */
export function generateSalt(): string {
  return crypto.randomBytes(16).toString('base64');
}

/**
 * 使用PBKDF2算法哈希密碼
 * @param password 明文密碼
 * @param salt 鹽值(Base64格式)
 * @returns 哈希後的密碼(Base64格式)
 */
export function hashPassword(password: string, salt: string): string {
  const derivedKey = crypto.pbkdf2Sync(
    password,
    Buffer.from(salt, 'base64'),
    10000,  // 迭代次數
    64,     // 密鑰長度
    'sha512'
  );
  
  return derivedKey.toString('base64');
}

/**
 * 創建密碼哈希存儲格式: salt$hash
 * @param password 明文密碼
 * @returns 存儲格式的密碼哈希
 */
export function createPasswordHash(password: string): string {
  const salt = generateSalt();
  const hash = hashPassword(password, salt);
  return `${salt}$${hash}`;
}

/**
 * 驗證密碼
 * @param password 待驗證的明文密碼
 * @param storedHash 存儲的密碼哈希(格式: salt$hash)
 * @returns 密碼是否匹配
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  if (!storedHash || !storedHash.includes('$')) {
    return false;
  }
  
  const [salt, originalHash] = storedHash.split('$');
  const hash = hashPassword(password, salt);
  
  // 使用時間一致的比較方法，防止計時攻擊
  return crypto.timingSafeEqual(
    Buffer.from(hash),
    Buffer.from(originalHash)
  );
} 
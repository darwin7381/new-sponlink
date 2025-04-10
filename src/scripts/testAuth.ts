/**
 * 認證系統測試腳本
 * 用於測試用戶認證功能是否正常工作
 */

import { findUserByEmail, verifyCredentials, createUser } from '@/lib/auth/authService';
import { USER_ROLES } from '@/lib/types/users';
import { createPasswordHash, verifyPassword } from '@/lib/auth/passwordUtils';

/**
 * 測試密碼哈希和驗證功能
 */
async function testPasswordHashing() {
  console.log('\n==== 測試密碼加密和驗證 ====');
  
  const password = 'test_password_123';
  console.log(`原始密碼: ${password}`);
  
  // 創建密碼哈希
  const hashedPassword = createPasswordHash(password);
  console.log(`哈希後的密碼: ${hashedPassword}`);
  
  // 驗證密碼
  const isValid = verifyPassword(password, hashedPassword);
  console.log(`密碼驗證結果: ${isValid ? '成功' : '失敗'}`);
  
  // 驗證錯誤密碼
  const isInvalid = verifyPassword('wrong_password', hashedPassword);
  console.log(`錯誤密碼驗證結果: ${isInvalid ? '成功' : '失敗'}`);
}

/**
 * 測試用戶查詢
 */
async function testUserLookup() {
  console.log('\n==== 測試用戶查詢 ====');
  
  // 查詢已存在的用戶
  const existingUser = await findUserByEmail('sponsor@example.com');
  console.log(`測試用戶查詢:`, existingUser ? '找到用戶' : '未找到用戶');
  
  if (existingUser) {
    console.log(`用戶ID: ${existingUser.id}`);
    console.log(`用戶郵箱: ${existingUser.email}`);
    console.log(`用戶角色: ${existingUser.role}`);
  }
}

/**
 * 測試用戶認證
 */
async function testUserAuthentication() {
  console.log('\n==== 測試用戶認證 ====');
  
  // 使用正確憑據進行認證
  const validUser = await verifyCredentials('sponsor@example.com', 'sponsor123');
  console.log(`有效憑據認證:`, validUser ? '成功' : '失敗');
  
  // 使用錯誤密碼進行認證
  const invalidPass = await verifyCredentials('sponsor@example.com', 'wrong_password');
  console.log(`無效密碼認證:`, invalidPass ? '成功' : '失敗');
  
  // 使用不存在的郵箱進行認證
  const invalidEmail = await verifyCredentials('nonexistent@example.com', 'password');
  console.log(`無效郵箱認證:`, invalidEmail ? '成功' : '失敗');
}

/**
 * 測試用戶創建
 */
async function testUserCreation() {
  console.log('\n==== 測試用戶創建 ====');
  
  const testEmail = `test_${Date.now()}@example.com`;
  
  try {
    // 創建測試用戶
    const newUser = await createUser({
      email: testEmail,
      password: 'secure_password_123',
      name: '測試用戶',
      role: USER_ROLES.SPONSOR,
      preferred_language: 'zh'
    });
    
    console.log(`用戶創建成功:`);
    console.log(`- ID: ${newUser.id}`);
    console.log(`- 郵箱: ${newUser.email}`);
    console.log(`- 名稱: ${newUser.name}`);
    console.log(`- 角色: ${newUser.role}`);
    
    // 驗證創建的用戶
    const authResult = await verifyCredentials(testEmail, 'secure_password_123');
    console.log(`新用戶認證:`, authResult ? '成功' : '失敗');
  } catch (error) {
    console.error(`創建用戶失敗:`, error);
  }
}

/**
 * 運行所有測試
 */
async function runAllTests() {
  try {
    console.log('開始測試認證系統...\n');
    
    // 運行各個測試
    await testPasswordHashing();
    await testUserLookup();
    await testUserAuthentication();
    await testUserCreation();
    
    console.log('\n所有測試完成!');
  } catch (error) {
    console.error('\n測試過程中發生錯誤:', error);
  } finally {
    process.exit(0);
  }
}

// 如果直接運行此腳本，執行所有測試
if (require.main === module) {
  runAllTests();
}

export {
  testPasswordHashing,
  testUserLookup,
  testUserAuthentication,
  testUserCreation,
  runAllTests
}; 
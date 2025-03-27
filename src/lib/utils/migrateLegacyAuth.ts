/**
 * 身份驗證數據遷移工具
 * 用於將舊版localStorage鍵'currentUser'遷移到新版'user'
 */

const USER_STORAGE_KEY = 'user';
const LEGACY_USER_STORAGE_KEY = 'currentUser';

/**
 * 檢查並遷移舊版身份驗證數據
 * 該函數會檢查localStorage中是否存在舊版的'currentUser'數據，
 * 並將其遷移到新的'user'鍵中。
 */
export const migrateLegacyAuth = (): void => {
  if (typeof window === 'undefined') return;

  try {
    // 檢查是否已存在新格式的用戶數據
    const hasNewUserData = !!localStorage.getItem(USER_STORAGE_KEY);
    
    // 如果已有新格式數據，不需要遷移
    if (hasNewUserData) return;
    
    // 檢查是否有舊版數據
    const legacyUserJson = localStorage.getItem(LEGACY_USER_STORAGE_KEY);
    if (!legacyUserJson) return;
    
    // 將舊版數據遷移到新版
    localStorage.setItem(USER_STORAGE_KEY, legacyUserJson);
    
    // 通知遷移完成
    console.info('Successfully migrated authentication data from legacy format');
    
    // 可選：清除舊版數據
    // localStorage.removeItem(LEGACY_USER_STORAGE_KEY);
  } catch (error) {
    console.error('Error migrating authentication data:', error);
  }
};

export default migrateLegacyAuth; 
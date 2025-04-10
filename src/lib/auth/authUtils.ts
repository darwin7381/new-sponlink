/**
 * 認證系統工具函數
 * 提供認證相關的通用功能
 */

/**
 * 清除所有本地存儲的認證相關數據
 * 在登出或認證失敗時使用
 */
export const clearLocalAuth = (): void => {
  if (typeof window !== 'undefined') {
    try {
      // 清除傳統認證相關數據
      localStorage.removeItem('user');
      localStorage.removeItem('authToken');
      // 不要清除視角設置，避免導航項消失
      // localStorage.removeItem('activeView');
      
      // 不要清除 user_id_mapping，因為它在登入時會重新設置
      // 如果需要完全重置，則取消下面的注釋
      // localStorage.removeItem('user_id_mapping');
      
      // 清除會話存儲中的認證相關數據
      sessionStorage.removeItem('afterLoginCallback');
    } catch (e) {
      console.error('清除本地存儲時出錯:', e);
    }
  }
};

/**
 * 獲取登入後的重定向URL
 * 如果存在存儲的URL，則返回並清除它；否則返回默認URL
 * @param defaultUrl 默認重定向URL
 */
export const getRedirectUrl = (defaultUrl = '/dashboard'): string => {
  if (typeof window !== 'undefined') {
    try {
      const redirectUrl = sessionStorage.getItem('redirectUrl');
      if (redirectUrl) {
        // 獲取後清除，避免重複使用
        sessionStorage.removeItem('redirectUrl');
        return redirectUrl;
      }
    } catch (e) {
      console.error('獲取重定向URL時出錯:', e);
    }
  }
  return defaultUrl;
};

/**
 * 存儲當前URL作為登入後的重定向目標
 */
export const saveCurrentUrlForRedirect = (): void => {
  if (typeof window !== 'undefined') {
    try {
      sessionStorage.setItem('redirectUrl', window.location.pathname);
    } catch (e) {
      console.error('存儲重定向URL時出錯:', e);
    }
  }
}; 
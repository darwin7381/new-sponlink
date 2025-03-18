import { test, expect } from '@playwright/test';

test.describe('Authentication Tests', () => {
  test('should show validation errors on login form', async ({ page }) => {
    await page.goto('/login');
    
    // 點擊登錄按鈕而不填寫表單
    await page.click('button[type="submit"]');
    
    // 檢查是否顯示驗證錯誤
    const errorMessage = await page.textContent('.text-red-500');
    expect(errorMessage).toBeTruthy();
  });

  test('should show validation errors on register form', async ({ page }) => {
    await page.goto('/register');
    
    // 點擊註冊按鈕而不填寫表單
    await page.click('button[type="submit"]');
    
    // 檢查是否顯示驗證錯誤
    const errorMessage = await page.textContent('.text-red-500');
    expect(errorMessage).toBeTruthy();
  });

  test('should toggle password visibility on login form', async ({ page }) => {
    await page.goto('/login');
    
    // 輸入密碼
    await page.fill('input[type="password"]', 'testpassword');
    
    // 點擊顯示密碼按鈕
    await page.click('button[aria-label="Toggle password visibility"]');
    
    // 檢查密碼是否可見
    const passwordInput = await page.$('input[type="text"]');
    expect(passwordInput).toBeTruthy();
  });
}); 
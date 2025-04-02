import { test, expect } from '@playwright/test';

test('Submit Event button in Series page works correctly', async ({ page }) => {
  // 导航到系列页面
  await page.goto('http://localhost:3000/event-series/series1');
  
  // 等待页面加载
  await page.waitForSelector('button:has-text("Submit Event")');
  
  // 截图保存当前页面
  await page.screenshot({ path: 'series-page.png' });
  
  // 验证 Submit Event 按钮存在
  const submitButton = page.locator('button:has-text("Submit Event")');
  await expect(submitButton).toBeVisible();
  
  // 点击按钮
  await submitButton.click();
  
  // 验证跳转到了创建事件页面，并且URL包含seriesId参数
  await page.waitForURL('**/organizer/events/create?seriesId=series1');
  
  // 截图保存创建事件页面
  await page.screenshot({ path: 'create-event-page.png' });
  
  // 验证页面标题显示"Submit Event to Series"
  const pageTitle = page.locator('h1:has-text("Submit Event to Series")');
  await expect(pageTitle).toBeVisible();
}); 
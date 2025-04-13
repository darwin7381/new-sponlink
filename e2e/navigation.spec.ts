import { test, expect } from '@playwright/test';

test.describe('Navigation Tests', () => {
  test('should navigate to the home page', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/BlockMeet/);
  });

  test('should navigate to the events page', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Events');
    await expect(page).toHaveURL(/.*\/events/);
  });

  test('should navigate to the login page', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Sign in');
    await expect(page).toHaveURL(/.*\/login/);
  });

  test('should navigate to the register page', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Sign up');
    await expect(page).toHaveURL(/.*\/register/);
  });
}); 
import { test, expect } from '@playwright/test';

test('homepage loads and shows Truegrynd branding', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Truegrynd/i);
});

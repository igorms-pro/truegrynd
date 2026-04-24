import { test, expect } from '@playwright/test';

test('homepage loads and shows Truegrynd branding', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Truegrynd/i);
});

test('homepage has main heading and CTA', async ({ page }) => {
  await page.goto('/');
  // App now redirects root → locale auth entry.
  await expect(page).toHaveURL(/\/en\/auth$/);
  await expect(page.getByRole('heading', { name: /truegrynd/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /send magic link/i })).toBeVisible();
});

test('auth page loads', async ({ page }) => {
  await page.goto('/en/auth');
  await expect(page.getByRole('heading', { name: /truegrynd/i })).toBeVisible();
});

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

test('onboarding redirects to auth when logged out', async ({ page }) => {
  await page.goto('/en/onboarding');
  await expect(page).toHaveURL(/\/en\/auth$/);
  await expect(page.getByRole('heading', { name: /truegrynd/i })).toBeVisible();
});

test('arena redirects to auth when logged out', async ({ page }) => {
  await page.goto('/en/app/arena');
  await expect(page).toHaveURL(/\/en\/auth$/);
});

test('challenge detail redirects to auth when logged out', async ({ page }) => {
  await page.goto('/en/app/arena/some-id');
  await expect(page).toHaveURL(/\/en\/auth$/);
});

test('score submit redirects to auth when logged out', async ({ page }) => {
  await page.goto('/en/app/arena/some-id/submit');
  await expect(page).toHaveURL(/\/en\/auth$/);
});

test('finish redirects to auth when logged out', async ({ page }) => {
  await page.goto('/en/app/finish');
  await expect(page).toHaveURL(/\/en\/auth$/);
});

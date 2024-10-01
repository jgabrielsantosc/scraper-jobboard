import { test, expect } from '@playwright/test';

test('meu primeiro teste', async ({ page }) => {
  await page.goto('https://ambev.gupy.io/');
  await expect(page).toHaveTitle(/Ambev/);
});
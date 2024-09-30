import { test, expect } from '@playwright/test';

test('should extract job listings from Quickin', async ({ page }) => {
  await page.goto('https://jobs.quickin.io/koin/jobs');
  await page.waitForLoadState('networkidle');

  const jobCards = await page.$$('tr[data-v-4491386a]');
  const jobs = [];

  for (const jobCard of jobCards) {
    const title = await jobCard.$eval('a.text-dark', el => el.textContent?.trim());
    const link = await jobCard.$eval('a.text-dark', el => el.href);
    const location = await jobCard.$eval('td span[data-v-4491386a]', el => el.textContent?.trim());
    const workModel = await jobCard.$eval('td span.badge-secondary', el => el.textContent?.trim());

    jobs.push({ title, link, location, work_model: workModel });
  }

  console.log(jobs);
  expect(jobs.length).toBeGreaterThan(0);
});
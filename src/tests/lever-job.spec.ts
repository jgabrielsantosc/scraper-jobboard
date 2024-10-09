import { test, expect } from '@playwright/test';

test('deve listar vagas do Lever', async ({ page }) => {
  const url = 'https://jobs.lever.co/zippi';

  await page.goto(url);
  await page.waitForLoadState('networkidle');

  const jobListings = await page.evaluate(() => {
    const jobGroups = document.querySelectorAll('.postings-group');
    const jobs = [];

    jobGroups.forEach((group) => {
      const area = group.querySelector('.large-category-header')?.textContent?.trim() || '';
      const jobCards = group.querySelectorAll('.posting');

      jobCards.forEach((card) => {
        const title = card.querySelector('[data-qa="posting-name"]')?.textContent?.trim() || '';
        const url_job = card.querySelector('.posting-btn-submit')?.getAttribute('href') || '';
        const work_model = card.querySelector('.workplaceTypes')?.textContent?.trim().replace('—', '').trim() || '';
        const type_job = card.querySelector('.commitment')?.textContent?.trim() || '';
        const location = card.querySelector('.location')?.textContent?.trim() || '';

        jobs.push({
          area,
          title,
          url_job,
          work_model,
          type_job,
          location
        });
      });
    });

    return jobs;
  });

  expect(jobListings.length).toBeGreaterThan(0);
  
  jobListings.forEach((job) => {
    expect(job).toHaveProperty('area');
    expect(job).toHaveProperty('title');
    expect(job).toHaveProperty('url_job');
    expect(job).toHaveProperty('work_model');
    expect(job).toHaveProperty('type_job');
    expect(job).toHaveProperty('location');
  });

  console.log(JSON.stringify(jobListings, null, 2));
});
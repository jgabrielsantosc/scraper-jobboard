import { test, expect } from '@playwright/test';

test('listar vagas do Workable', async ({ page }) => {
  const url = 'https://apply.workable.com/nomadglobal/';
  await page.goto(url);
  await page.waitForLoadState('networkidle');

  const vagas = await page.$$eval('ul[data-ui="list"] li[data-ui="job"]', (elements) => {
    return elements.map((el) => {
      const titleElement = el.querySelector('h3[data-ui="job-title"] span');
      const pubDateElement = el.querySelector('small[data-ui="job-posted"]');
      const workModelElement = el.querySelector('span[data-ui="job-workplace"] strong');
      const locationElement = el.querySelector('div[data-ui="job-location-tooltip"] span');
      const typeJobElement = el.querySelector('span[data-ui="job-type"]');
      const urlJobElement = el.querySelector('a');

      return {
        title: titleElement?.textContent?.trim() ?? '',
        pub_date: pubDateElement?.textContent?.trim() ?? '',
        work_model: workModelElement?.textContent?.trim() ?? '',
        location: locationElement?.textContent?.trim() ?? '',
        type_job: typeJobElement?.textContent?.trim() ?? '',
        url_job: urlJobElement ? `https://apply.workable.com${urlJobElement.getAttribute('href')}` : '',
      };
    });
  });

  console.log(JSON.stringify(vagas, null, 2));
  expect(vagas.length).toBeGreaterThan(0);
});
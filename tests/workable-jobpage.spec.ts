import { test, expect } from '@playwright/test';
import { convert } from 'html-to-text';

test('buscar informações da vaga do Workable', async ({ page }) => {
  const url = 'https://apply.workable.com/nomadglobal/j/70CC69D082/';
  await page.goto(url);
  await page.waitForLoadState('networkidle');

  const title = await page.locator('h1[data-ui="job-title"]').textContent();
  const workModel = await page.locator('span[data-ui="job-workplace"] strong').textContent();
  const typeJob = await page.locator('span[data-ui="job-type"]').textContent();
  const locationElements = await page.locator('div[data-ui="job-location-tooltip"] span').allTextContents();
  const location = locationElements.join(' ').trim();
  const descriptionHtml = await page.locator('section[data-ui="job-description"]').innerHTML();
  const description = convert(descriptionHtml, {
    wordwrap: false,
    selectors: [
      { selector: 'a', options: { ignoreHref: true } },
      { selector: 'img', format: 'skip' }
    ]
  });

  console.log({
    title: title?.trim(),
    work_model: workModel?.trim(),
    type_job: typeJob?.trim(),
    location: location,
    description: description.trim(),
  });

  expect(title).not.toBeNull();
  expect(workModel).not.toBeNull();
  expect(typeJob).not.toBeNull();
  expect(location).not.toBeNull();
  expect(description).not.toBeNull();
});
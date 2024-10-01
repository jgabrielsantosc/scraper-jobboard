import { test, expect } from '@playwright/test';
import { chromium } from 'playwright';

test('deve coletar informações detalhadas de uma vaga no Greenhouse', async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto('https://job-boards.greenhouse.io/nubank/jobs/5541463');
  await page.waitForLoadState('domcontentloaded');

  const jobInfo = await page.evaluate(() => {
    const title = document.querySelector('h1.section-header.section-header--large.font-primary')?.textContent?.trim() || '';
    const location = document.querySelector('p.body.body--metadata')?.textContent?.trim() || '';
    const description = document.querySelector('div.job__description.body')?.textContent?.trim() || '';

    return { title, location, description };
  });

  console.log(JSON.stringify(jobInfo, null, 2));
  expect(jobInfo.title).toBe('Senior Analytics Engineer');
  expect(jobInfo.location).toBe('Brazil, Sao Paulo');
  expect(jobInfo.description).toContain('Sobre o Nubank');

  await browser.close();
});
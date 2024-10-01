import { test, expect } from '@playwright/test';
import { chromium } from 'playwright';

test('deve coletar vagas do Greenhouse', async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto('https://job-boards.greenhouse.io/nubank');
  await page.waitForLoadState('networkidle');

  const vagas = await page.evaluate(() => {
    const jobPosts = document.querySelectorAll('.job-posts');
    const resultado = [];

    jobPosts.forEach((jobPost) => {
      const area = jobPost.querySelector('.section-header')?.textContent?.trim() || '';
      const vagasArea = jobPost.querySelectorAll('.job-post');

      vagasArea.forEach((vaga) => {
        const title = vaga.querySelector('.body--medium')?.textContent?.trim() || '';
        const location = vaga.querySelector('.body--metadata')?.textContent?.trim() || '';
        const link = vaga.querySelector('a')?.getAttribute('href') || '';

        resultado.push({ area, title, location, link });
      });
    });

    return resultado;
  });

  console.log(JSON.stringify(vagas, null, 2));
  expect(vagas.length).toBeGreaterThan(0);

  await browser.close();
});
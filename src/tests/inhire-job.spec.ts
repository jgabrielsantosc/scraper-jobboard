import { test, expect } from '@playwright/test';

test('extrair vagas do jobboard da inhire', async ({ page }) => {
  const baseUrl = 'https://alice.inhire.app';
  await page.goto(`${baseUrl}/vagas/`);
  await page.waitForLoadState('networkidle');

  await page.waitForSelector('.css-jswd32.eicjt3c5');

  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(2000);

  const vagas = await page.$$eval('.css-jswd32.eicjt3c5 li', (elements, baseUrl) => {
    return elements.map((el) => {
      const titleElement = el.querySelector('[data-sentry-element="JobPositionName"]');
      const linkElement = el.querySelector('a[data-sentry-element="NavLink"]');
      
      return {
        title_job: titleElement ? titleElement.textContent : '',
        url_job: linkElement ? `${baseUrl}${linkElement.getAttribute('href')}` : '',
      };
    });
  }, baseUrl);

  console.log(JSON.stringify(vagas, null, 2));
  console.log(`Total de vagas encontradas: ${vagas.length}`);

  expect(vagas.length).toBeGreaterThan(0);
  for (const vaga of vagas) {
    expect(vaga.title_job).toBeTruthy();
    expect(vaga.url_job).toBeTruthy();
    expect(vaga.url_job).toContain(baseUrl);
  }

  const fs = require('fs');
  fs.writeFileSync('vagas_inhire.json', JSON.stringify({
    total_vagas: vagas.length,
    vagas: vagas
  }, null, 2));
});
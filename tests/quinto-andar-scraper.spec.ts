import { test, expect, chromium } from '@playwright/test';
import fs from 'fs/promises';

async function scrapeWorkableJobUrls(page, url) {
  await page.goto(url);

  // Seletor abrangente para todos os job boards
  const vagaSelector = '[data-ui="job"] a, [data-ui="job-opening"] a';

  // Aguardar o carregamento inicial das vagas
  await page.waitForSelector(vagaSelector, { state: 'attached' });

  // Define um tempo limite para carregar as vagas (usado apenas para job boards com rolagem infinita)
  const timeout = 30000;
  const startTime = Date.now();

  let lastCount = 0;

  // Lógica de rolagem e clique no "Mostrar mais", exceto para Pravaler
  const companyName = new URL(url).pathname.split('/')[1];
  if (companyName !== 'pravaler-1') {
    while (Date.now() - startTime < timeout) {
      const loadMoreButton = await page.locator('[data-ui="load-more-button"]');
      if (await loadMoreButton.isVisible() && !await loadMoreButton.isDisabled()) {
        await loadMoreButton.click();
        // Aguardar novas vagas
        try {
          await page.waitForSelector(vagaSelector, { state: 'attached' });
        } catch (error) {
          console.error('Erro ao aguardar o seletor:', error);
          break;
        }
      } else {
        break; 
      }

      // Role a página
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(2000);

      const currentCount = await page.locator(vagaSelector).count();
      if (currentCount === lastCount) {
        break; 
      }
      lastCount = currentCount;
    }
  }

  // Extrair URLs das vagas
  const vagaUrls = await page.$$eval(vagaSelector, (elements, url) => {
    return elements.map((el) => {
      const urlPath = el.getAttribute('href') || '';
      return urlPath ? `${new URL(url).origin}${urlPath}` : '';
    });
  }, url);

  // Remover URLs duplicadas
  const uniqueUrls = [...new Set(vagaUrls)];

  return uniqueUrls;
}

const jobBoards = [
  { name: 'quintoandar', url: 'https://apply.workable.com/quintoandar/' },
  { name: 'pravaler', url: 'https://apply.workable.com/pravaler-1/' },
  { name: 'nomadglobal', url: 'https://apply.workable.com/nomadglobal/' },
  { name: 'axur', url: 'https://apply.workable.com/axur/' },
  { name: 'loggi', url: 'https://apply.workable.com/loggi/' },
];

// Execute o teste para cada job board
jobBoards.forEach(({ name, url }) => {
  test(`scrape job URLs from ${name} Workable`, async ({ page }) => {
    const vagaUrls = await scrapeWorkableJobUrls(page, url);

    console.log(`URLs das vagas de ${name}:`, vagaUrls);

    await fs.writeFile(`vagas_urls_${name}.json`, JSON.stringify(vagaUrls, null, 2));

    expect(vagaUrls.length).toBeGreaterThan(0);
  });
});
import { chromium } from 'playwright';

interface WorkdayJob {
  title: string;
  url: string;
  location: string;
  time_type: string;
  date_posted: string;
  requisition_id: string;
}

export const scraperJobWorkday = async (url: string): Promise<string[]> => {
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();

    await page.goto(url);
    await page.waitForSelector('li.css-1q2dra3');

    const jobUrls: string[] = [];
    let hasNextPage = true;

    while (hasNextPage) {
      // Extrai URLs da página atual
      const pageUrls = await page.evaluate((baseUrl) => {
        const jobCards = document.querySelectorAll('li.css-1q2dra3');
        const urls: string[] = [];

        jobCards.forEach(card => {
          const link = card.querySelector('a.css-19uc56f');
          const href = link?.getAttribute('href');
          if (href) {
            // Constrói a URL completa
            const fullUrl = href.startsWith('http') ? href : `${baseUrl}${href}`;
            urls.push(fullUrl);
          }
        });

        return urls;
      }, url);

      jobUrls.push(...pageUrls);

      // Verifica se existe próxima página
      const nextButton = await page.$('button[aria-label^="page "]:not([aria-current="page"])');
      if (nextButton) {
        await nextButton.click();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000); // Aguarda carregamento do conteúdo
      } else {
        hasNextPage = false;
      }
    }

    return jobUrls;

  } catch (error) {
    console.error(`Erro ao buscar vagas do Workday:`, error);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}; 
import { chromium } from 'playwright';

interface RecrutJob {
  title: string;
  url: string;
  contract_type: string;
  work_model: string;
  address: string;
}

export const scraperJobRecrut = async (url: string): Promise<string[]> => {
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();

    await page.goto(url);
    await page.waitForSelector('div.col-md-12.col-sm-12.masonry-item');

    // Extrai todas as URLs das vagas
    const jobUrls = await page.evaluate((baseUrl) => {
      const jobRows = document.querySelectorAll('div.col-md-12.col-sm-12.masonry-item table tbody tr');
      const urls: string[] = [];

      jobRows.forEach(row => {
        const link = row.querySelector('td:first-child a');
        if (link) {
          const href = link.getAttribute('href');
          if (href) {
            // Constrói a URL completa
            const fullUrl = href.startsWith('http') ? href : `${baseUrl}${href}`;
            urls.push(fullUrl);
          }
        }
      });

      return urls;
    }, url);

    return jobUrls;

  } catch (error) {
    console.error(`Erro ao buscar vagas do Recrut.ai:`, error);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}; 
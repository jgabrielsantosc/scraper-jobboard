import { chromium } from 'playwright';

export const scraperJobPandape = async (url: string): Promise<string[]> => {
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();

    // Extrai o domínio base da URL
    const baseUrl = url.split('/Detail')[0];

    await page.goto(url);
    await page.waitForSelector('#VacancyList');

    // Extrai todas as URLs das vagas
    const jobUrls = await page.evaluate((baseUrl) => {
      const links = document.querySelectorAll('div#VacancyList a.card.card-vacancy');
      const urls: string[] = [];

      links.forEach(link => {
        const href = link.getAttribute('href');
        if (href) {
          // Constrói a URL completa
          const fullUrl = href.startsWith('http') ? href : `${baseUrl}${href}`;
          urls.push(fullUrl);
        }
      });

      return urls;
    }, baseUrl);

    return jobUrls;

  } catch (error) {
    console.error(`Erro ao buscar vagas do Pandapé:`, error);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}; 
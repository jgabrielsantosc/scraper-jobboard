import { chromium } from 'playwright';

export const scraperJobIcims = async (url: string): Promise<string[]> => {
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();

    await page.goto(url);
    // Aguarda carregamento inicial
    await page.waitForTimeout(5000);

    // Rola a página para carregar todo o conteúdo
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
    await page.waitForTimeout(2000);

    // Extrai todas as URLs das vagas
    const jobUrls = await page.evaluate((baseUrl) => {
      const links = document.querySelectorAll('a.iCIMS_Anchor');
      const urls: string[] = [];

      links.forEach(link => {
        const href = link.getAttribute('href');
        if (href && href.includes('/jobs/')) {
          // Constrói a URL completa
          const fullUrl = href.startsWith('http') ? href : `${baseUrl}${href}`;
          urls.push(fullUrl);
        }
      });

      return urls;
    }, url);

    return jobUrls;

  } catch (error) {
    console.error(`Erro ao buscar vagas do ICIMS:`, error);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}; 
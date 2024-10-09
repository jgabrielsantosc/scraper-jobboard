import { chromium } from 'playwright';

export async function scraperJobGreenhouse(url: string): Promise<string[]> {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });

    const links = await page.evaluate(() => {
      const jobLinks = document.querySelectorAll('a[href*="/jobs/"]');
      return Array.from(jobLinks).map(link => link.getAttribute('href')).filter(Boolean) as string[];
    });

    return links;
  } catch (error) {
    console.error('Erro ao coletar informações da vaga:', error);
    throw new Error('Erro ao coletar informações da vaga');
  } finally {
    await browser.close();
  }
}